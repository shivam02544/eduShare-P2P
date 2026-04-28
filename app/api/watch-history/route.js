import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { getWatchHistory, saveWatchHistory, clearWatchHistory } from "@/services/watch-history.service";
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

  const history = await getWatchHistory(me._id, type);

  return NextResponse.json(history);
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

  const result = await saveWatchHistory(me._id, videoId, progressSeconds, durationSeconds);

  return NextResponse.json(result);
}, { isProtected: true, schema: watchHistorySchema });

// DELETE /api/watch-history — clear all history
export const DELETE = apiHandler(async (ctx) => {
  const result = await clearWatchHistory(ctx.user._id);
  return NextResponse.json(result);
}, { isProtected: true });
