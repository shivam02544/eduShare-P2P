import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();

  let mongoUserId = null;
  try {
    const { verifyAuth } = await import("@/lib/verifyAuth");
    const auth = await verifyAuth(req);
    if (auth) mongoUserId = auth.mongoUser._id.toString();
  } catch {}

  const video = await Video.findById(params.id)
    .populate("uploader", "name image firebaseUid");
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const obj = video.toObject();
  obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
  obj.isBookmarked = mongoUserId ? obj.bookmarks?.map(String).includes(mongoUserId) : false;

  return NextResponse.json(obj);
}
