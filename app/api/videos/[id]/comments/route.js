import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Video from "@/models/Video";
import { createNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();
  const comments = await Comment.find({ video: params.id })
    .sort({ createdAt: -1 })
    .populate("author", "name image firebaseUid");
  return NextResponse.json(comments);
}

export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  if (text.length > 1000) return NextResponse.json({ error: "Too long" }, { status: 400 });

  await connectDB();
  const comment = await Comment.create({
    video: params.id,
    author: auth.mongoUser._id,
    text: text.trim(),
  });

  // Notify video uploader
  const video = await Video.findById(params.id).select("uploader title");
  if (video) {
    await createNotification({
      recipient: video.uploader,
      sender: auth.mongoUser._id,
      type: "comment",
      video: video._id,
      message: `${auth.mongoUser.name} commented on "${video.title}"`,
    });
  }

  const populated = await comment.populate("author", "name image firebaseUid");
  return NextResponse.json(populated, { status: 201 });
}
