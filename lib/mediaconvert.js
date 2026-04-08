import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";
import { logger } from "@/lib/logger";

// Assume an environment variable for the MediaConvert specialized endpoint
// format: https://xyz.mediaconvert.region.amazonaws.com
const endpoint = process.env.AWS_MEDIACONVERT_ENDPOINT;
const role = process.env.AWS_MEDIACONVERT_ROLE_ARN; 

// We'll leverage the standard AWS configuration auto-loaded from our .env.local
const client = (endpoint && role) ? new MediaConvertClient({ region: process.env.AWS_REGION || "ap-south-1", endpoint }) : null;

export async function triggerHlsConversion(s3VideoUrl, videoId) {
  if (!client) {
    logger.warn("AWS MediaConvert variables missing. Skipping HLS transcoding fallback.");
    return null;
  }

  // Parse S3 URL into Bucket and Key
  // e.g. https://my-bucket.s3.ap-south-1.amazonaws.com/uploads/123.mp4
  let bucket, key;
  try {
    const url = new URL(s3VideoUrl);
    bucket = url.hostname.split(".")[0];
    key = url.pathname.substring(1); // remove leading slash
  } catch (err) {
    logger.error({ s3VideoUrl }, "Failed to parse S3 URL for MediaConvert");
    return null;
  }

  const s3Input = `s3://${bucket}/${key}`;
  const s3Output = `s3://${bucket}/hls/${videoId}/`;

  // Cost-efficient dev constraints: Limit output to 720p, constraint bitrate.
  const command = new CreateJobCommand({
    Role: role,
    // Provide an identifying JSON element so the webhook knows exactly which DB record to update
    UserMetadata: {
      videoId: videoId.toString(),
    },
    Settings: {
      TimecodeConfig: { Source: "ZEROBASED" },
      OutputGroups: [
        {
          Name: "Apple HLS",
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              SegmentLength: 4,
              Destination: s3Output,
              MinSegmentLength: 0,
            },
          },
          Outputs: [
            {
              // 720p HLS constraint limit ensuring Cost-Efficiency during dev operations
              VideoDescription: {
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    MaxBitrate: 2000000,
                    RateControlMode: "QVBR",
                    SceneChangeDetect: "TRANSITION_DETECTION",
                  },
                },
                Width: 1280,
                Height: 720,
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: { Bitrate: 96000, CodingMode: "CODING_MODE_2_0", SampleRate: 48000 },
                  },
                },
              ],
              ContainerSettings: { Container: "M3U8" },
              NameModifier: "_720p",
            },
          ],
        },
      ],
      Inputs: [
        {
          AudioSelectors: { "Audio Selector 1": { DefaultSelection: "DEFAULT" } },
          VideoSelector: {},
          TimecodeSource: "ZEROBASED",
          FileInput: s3Input,
        },
      ],
    },
  });

  try {
    const data = await client.send(command);
    logger.info({ jobId: data.Job.Id, videoId }, "Successfully dispatched automated AWS MediaConvert Job");
    return data.Job.Id;
  } catch (error) {
    logger.error({ error: error.message, videoId }, "Failed to spawn AWS MediaConvert Job");
    return null;
  }
}
