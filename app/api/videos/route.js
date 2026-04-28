import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getVideos, createVideo } from "@/services/video.service";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { req, user } = ctx;
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const sort = searchParams.get("sort");

  const result = await getVideos(subject, sort, user?._id);
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
  const { user: me, body } = ctx;

  const video = await createVideo(body, me._id);

  logger.info({ videoId: video._id, title: video.title }, "Video created and immediately available for playback");

  // Invalidate dashboard cache so new upload appears immediately
  await invalidateCache(`dashboard:${me._id}`);

  return NextResponse.json(video, { status: 201 });
}, { isProtected: true, schema: videoPostSchema });
