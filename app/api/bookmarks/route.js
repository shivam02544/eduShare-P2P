import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

// GET /api/bookmarks — get all videos bookmarked by current user
export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const videos = await Video.find({ bookmarks: auth.mongoUser._id })
    .sort({ createdAt: -1 })
    .populate("uploader", "name image firebaseUid");

  return NextResponse.json(videos);
}
