import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Video from "@/models/Video";
import { z } from "zod";
import { triggerHlsConversion } from "@/lib/mediaconvert";
import { logger } from "@/lib/logger";
import { invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { req, user } = ctx;
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const sort = searchParams.get("sort");

  const query = subject ? { subject } : {};
  const sortOption = sort === "popular" ? { views: -1 } : { createdAt: -1 };

  const videos = await Video.find(query)
    .sort(sortOption)
    .populate("uploader", "name image firebaseUid");

  const mongoUserId = user ? user._id.toString() : null;

  const result = videos.map((v) => {
    const obj = v.toObject();
    obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
    obj.isBookmarked = mongoUserId ? obj.bookmarks?.map(String).includes(mongoUserId) : false;
    return obj;
  });

  return NextResponse.json(result);
}, { isProtected: false });

const videoPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  videoUrl: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const POST = apiHandler(async (ctx) => {
  const { title, description, subject, videoUrl, thumbnailUrl } = ctx.body;

  // Create the video record — default status is "ready" (fallback MP4 is always available)
  const video = await Video.create({
    title,
    description: description || "",
    subject,
    videoUrl,
    thumbnailUrl: thumbnailUrl || "",
    uploader: ctx.user._id,
    status: "processing", // Optimistically set processing until MediaConvert finishes
  });

  logger.info({ videoId: video._id, title }, "Video record created, dispatching HLS transcoding job");

  // Fire-and-forget: trigger MediaConvert asynchronously — do NOT await in the request cycle
  triggerHlsConversion(videoUrl, video._id)
    .then(async (jobId) => {
      if (jobId) {
        await Video.findByIdAndUpdate(video._id, { mcJobId: jobId });
        logger.info({ videoId: video._id, jobId }, "MediaConvert job ID stored");
      } else {
        // No MediaConvert configured or failed to start — fall back to raw MP4 immediately
        await Video.findByIdAndUpdate(video._id, { status: "ready" });
        logger.warn({ videoId: video._id }, "MediaConvert unavailable — video marked ready with MP4 fallback");
      }
    })
    .catch(async (err) => {
      logger.error({ videoId: video._id, err: err.message }, "MediaConvert trigger failed — marking ready with MP4 fallback");
      await Video.findByIdAndUpdate(video._id, { status: "ready" });
    });

  // Invalidate dashboard cache so new upload appears immediately
  await invalidateCache(`dashboard:${ctx.user._id}`);

  return NextResponse.json(video, { status: 201 });
}, { isProtected: true, schema: videoPostSchema });
