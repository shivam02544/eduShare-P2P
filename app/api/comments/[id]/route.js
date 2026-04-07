import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";

export const dynamic = "force-dynamic";

// DELETE /api/comments/[id] — only author can delete
export async function DELETE(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const comment = await Comment.findById(params.id);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (comment.author.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await comment.deleteOne();
  return NextResponse.json({ message: "Deleted" });
}

// PATCH /api/comments/[id] — toggle like
export async function PATCH(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const comment = await Comment.findById(params.id);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = auth.mongoUser._id.toString();
  const liked = comment.likes.map(String).includes(userId);

  if (liked) {
    comment.likes = comment.likes.filter((l) => l.toString() !== userId);
  } else {
    comment.likes.push(auth.mongoUser._id);
  }

  await comment.save();
  return NextResponse.json({ likes: comment.likes.length, liked: !liked });
}
