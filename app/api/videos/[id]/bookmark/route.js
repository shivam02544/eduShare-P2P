import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

// POST /api/videos/[id]/bookmark — toggle bookmark
export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const video = await Video.findById(params.id);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = auth.mongoUser._id.toString();
  const bookmarked = video.bookmarks.map(String).includes(userId);

  if (bookmarked) video.bookmarks = video.bookmarks.filter((b) => b.toString() !== userId);
  else video.bookmarks.push(auth.mongoUser._id);

  await video.save();
  return NextResponse.json({ bookmarked: !bookmarked });
}
