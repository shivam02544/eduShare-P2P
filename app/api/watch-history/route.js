import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import WatchHistory from "@/models/WatchHistory";
import Video from "@/models/Video";
import User from "@/models/User";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  type: z.string().optional(), // "continue" | "all"
});

// GET /api/watch-history
export const GET = apiHandler(async (ctx) => {
  const { req, user: me } = ctx;

  // 60 reads per minute per IP — dashboard + history page
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "watch-history-get"), limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const { searchParams } = new URL(req.url);
  const { type } = querySchema.parse(Object.fromEntries(searchParams));

  const query = { user: me._id };
  if (type === "continue") query.completed = false;

  const history = await WatchHistory.find(query)
    .sort({ lastWatchedAt: -1 })
    .limit(type === "continue" ? 10 : 50)
    .populate({
      path: "video",
      select: "title thumbnailUrl subject uploader views",
      populate: { path: "uploader", select: "name" },
    });

  // Filter out deleted videos
  return NextResponse.json(history.filter((h) => h.video));
}, { isProtected: true });

const watchHistorySchema = z.object({
  videoId: z.string().min(1, "videoId is required"),
  progressSeconds: z.number().min(0),
  durationSeconds: z.number().min(0).optional(),
});

// POST /api/watch-history — save progress
export const POST = apiHandler(async (ctx) => {
  const { req, user: me, body } = ctx;
  const { videoId, progressSeconds, durationSeconds } = body;

  // 120 saves per hour per IP — fires every 10s while watching, so 120/hr = 2 videos watched continuously
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "watch-history-post"), limit: 120, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const progress = Math.floor(progressSeconds);
  const duration = Math.floor(durationSeconds || 0);
  const completed = duration > 0 && progress / duration >= 0.9;

  await WatchHistory.findOneAndUpdate(
    { user: me._id, video: videoId },
    {
      progressSeconds: progress,
      durationSeconds: duration,
      completed,
      lastWatchedAt: new Date(),
      ...(completed ? { completedAt: new Date() } : {}),
    },
    { upsert: true }
  );

  return NextResponse.json({ saved: true });
}, { isProtected: true, schema: watchHistorySchema });

// DELETE /api/watch-history — clear all history
export const DELETE = apiHandler(async (ctx) => {
  await WatchHistory.deleteMany({ user: ctx.user._id });
  return NextResponse.json({ message: "History cleared" });
}, { isProtected: true });
