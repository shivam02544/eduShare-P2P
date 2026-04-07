import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import WatchHistory from "@/models/WatchHistory";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// GET /api/watch-history
export async function GET(req) {
  // 60 reads per minute per IP — dashboard + history page
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "watch-history-get"), limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "continue" | "all"

  await connectDB();

  const query = { user: auth.mongoUser._id };
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
}

// POST /api/watch-history — save progress
export async function POST(req) {
  // 120 saves per hour per IP — fires every 10s while watching, so 120/hr = 2 videos watched continuously
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "watch-history-post"), limit: 120, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId, progressSeconds, durationSeconds } = await req.json();

  if (!videoId || typeof progressSeconds !== "number")
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const progress = Math.max(0, Math.floor(progressSeconds));
  const duration = Math.max(0, Math.floor(durationSeconds || 0));
  const completed = duration > 0 && progress / duration >= 0.9;

  await connectDB();

  await WatchHistory.findOneAndUpdate(
    { user: auth.mongoUser._id, video: videoId },
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
}

// DELETE /api/watch-history — clear all history
export async function DELETE(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await WatchHistory.deleteMany({ user: auth.mongoUser._id });
  return NextResponse.json({ message: "History cleared" });
}
