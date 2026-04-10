import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Video from "@/models/Video";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { req, user } = ctx;
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const sort = searchParams.get("sort");

  const query = subject ? { subject, flagged: { $ne: true } } : { flagged: { $ne: true } };
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

  const video = await Video.create({
    title,
    description: description || "",
    subject,
    videoUrl,
    thumbnailUrl: thumbnailUrl || "",
    uploader: ctx.user._id,
  });

  logger.info({ videoId: video._id, title }, "Video created and immediately available for playback");

  // Invalidate dashboard cache so new upload appears immediately
  await invalidateCache(`dashboard:${ctx.user._id}`);

  return NextResponse.json(video, { status: 201 });
}, { isProtected: true, schema: videoPostSchema });
