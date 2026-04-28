import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getComments, createComment, CommentError } from "@/services/comment.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const result = await getComments(ctx.params.id);
  return NextResponse.json(result);
}, { isProtected: false });

export const POST = apiHandler(async (ctx) => {
  const { req, params, user, body } = ctx;

  // 20 comments per 10 minutes per IP — prevents comment spam
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "comment"), limit: 20, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await createComment(params.id, user, body.text);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof CommentError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
