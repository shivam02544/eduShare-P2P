import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { deleteComment, toggleLikeComment, CommentError } from "@/services/comment.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().min(1, "Comment ID is required"),
});

// DELETE /api/comments/[id] — only author can delete
export const DELETE = apiHandler(async (ctx) => {
  const { id } = paramsSchema.parse(ctx.params);

  try {
    const result = await deleteComment(id, ctx.user._id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CommentError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });

// PATCH /api/comments/[id] — toggle like
export const PATCH = apiHandler(async (ctx) => {
  const { id } = paramsSchema.parse(ctx.params);

  try {
    const result = await toggleLikeComment(id, ctx.user._id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CommentError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
