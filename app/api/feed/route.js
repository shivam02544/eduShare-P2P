import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import Note from "@/models/Note";

export const dynamic = "force-dynamic";

// GET /api/feed — activity from people you follow
export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const me = await User.findById(auth.mongoUser._id).select("following");
  const followingIds = me.following;

  if (followingIds.length === 0)
    return NextResponse.json({ items: [], empty: true });

  const [videos, notes] = await Promise.all([
    Video.find({ uploader: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("uploader", "name image firebaseUid"),
    Note.find({ uploader: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("uploader", "name image firebaseUid"),
  ]);

  // Merge and sort by date
  const items = [
    ...videos.map((v) => ({ ...v.toObject(), kind: "video" })),
    ...notes.map((n) => ({ ...n.toObject(), kind: "note" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 30);

  return NextResponse.json({ items, empty: false });
}
