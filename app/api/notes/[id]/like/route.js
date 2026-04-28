import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { toggleLikeNote, NoteError } from "@/services/note.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async (ctx) => {
  const { req, params, user } = ctx;

  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "like"), limit: 60, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await toggleLikeNote(params.id, user);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NoteError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
