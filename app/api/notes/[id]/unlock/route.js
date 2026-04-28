import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { unlockPremiumNote, NoteError } from "@/services/note.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * POST /api/notes/[id]/unlock
 * Spend credits to unlock a premium note.
 * Returns the fileUrl on success.
 */
export const POST = apiHandler(async (ctx) => {
  const { req, params, user } = ctx;

  // 20 unlocks per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "note-unlock"), limit: 20, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await unlockPremiumNote(params.id, user);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NoteError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
