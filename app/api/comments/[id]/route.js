import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Comment from "@/models/Comment";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().min(1, "Comment ID is required"),
});

// DELETE /api/comments/[id] — only author can delete
export const DELETE = apiHandler(async (ctx) => {
  const { id } = paramsSchema.parse(ctx.params);

  const comment = await Comment.findById(id);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (comment.author.toString() !== ctx.user._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await comment.deleteOne();
  return NextResponse.json({ message: "Deleted" });
}, { isProtected: true });

// PATCH /api/comments/[id] — toggle like
export const PATCH = apiHandler(async (ctx) => {
  const { id } = paramsSchema.parse(ctx.params);

  const comment = await Comment.findById(id);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = ctx.user._id.toString();
  const liked = comment.likes.map(String).includes(userId);

  if (liked) {
    comment.likes = comment.likes.filter((l) => l.toString() !== userId);
  } else {
    comment.likes.push(ctx.user._id);
  }

  await comment.save();
  return NextResponse.json({ likes: comment.likes.length, liked: !liked });
}, { isProtected: true });
