import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import { createNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const video = await Video.findById(params.id);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = auth.mongoUser._id.toString();
  const liked = video.likes.map(String).includes(userId);

  if (liked) {
    video.likes = video.likes.filter((l) => l.toString() !== userId);
  } else {
    video.likes.push(auth.mongoUser._id);
    await createNotification({
      recipient: video.uploader,
      sender: auth.mongoUser._id,
      type: "like_video",
      video: video._id,
      message: `${auth.mongoUser.name} liked your video "${video.title}"`,
    });
  }

  await video.save();
  return NextResponse.json({ likes: video.likes.length, liked: !liked });
}
