import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Video from "@/models/Video";
import { logger } from "@/lib/logger";
import { getCdnUrl } from "@/lib/cdn";

// AWS EventBridge sends POST with a JSON body describing the MediaConvert job outcome.
// Make this endpoint idempotent: if the video is already "ready", skip the update silently.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // EventBridge CloudWatch event wraps the detail in a "detail" key
  const detail = body?.detail || body;
  const status = detail?.status;
  const jobId = detail?.jobId;
  const videoId = detail?.userMetadata?.videoId;

  if (!videoId) {
    logger.warn({ body }, "MediaConvert webhook received without videoId in userMetadata");
    return NextResponse.json({ error: "Missing videoId in userMetadata" }, { status: 400 });
  }

  logger.info({ videoId, jobId, status }, "MediaConvert webhook received");

  await connectDB();

  // Idempotent guard: find the video and check current state before writing
  const video = await Video.findById(videoId).lean();
  if (!video) {
    logger.warn({ videoId }, "Webhook received for unknown video ID");
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // If already marked ready, this is a duplicate delivery — skip write, return 200 (idempotent)
  if (video.status === "ready" && video.hlsUrl) {
    logger.info({ videoId }, "Video already ready — skipping duplicate webhook write");
    return NextResponse.json({ ok: true, idempotent: true });
  }

  if (status === "COMPLETE") {
    // Build the HLS output URL from the output S3 key convention we defined in mediaconvert.js
    // s3://bucket/hls/{videoId}/{videoId}_720p.m3u8
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const rawHlsUrl = `https://${bucket}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/hls/${videoId}/${videoId}_720p.m3u8`;
    const hlsUrl = getCdnUrl(rawHlsUrl); // Route through CloudFront if configured

    await Video.findByIdAndUpdate(videoId, {
      status: "ready",
      hlsUrl,
    });

    logger.info({ videoId, hlsUrl }, "Video HLS processing complete — status set to ready");
    return NextResponse.json({ ok: true, hlsUrl });
  }

  if (status === "ERROR") {
    const errorMessage = detail?.errorMessage || "Unknown MediaConvert error";
    logger.error({ videoId, jobId, errorMessage }, "MediaConvert job failed");

    await Video.findByIdAndUpdate(videoId, {
      status: "failed",
    });

    return NextResponse.json({ ok: true, failed: true });
  }

  // Any other status (e.g. PROGRESSING) — log but don't update
  logger.info({ videoId, jobId, status }, "MediaConvert intermediate status — no DB update");
  return NextResponse.json({ ok: true, ignored: true });
}
