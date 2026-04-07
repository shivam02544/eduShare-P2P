import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import WatchHistory from "@/models/WatchHistory";

export const dynamic = "force-dynamic";

// GET /api/watch-history — get continue watching list (last 20, not completed)
export async function GET(req) {
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
