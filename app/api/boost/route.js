import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { applyBoost, BoostError } from "@/services/boost.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const boostSchema = z.object({
  type: z.enum(["video", "note"], { required_error: "Type must be video or note" }),
  id: z.string().min(1, "ID is required"),
});

/**
 * POST /api/boost
 * Spend 20 credits to boost a video or note to top of Explore for 24h.
 */
export const POST = apiHandler(async (ctx) => {
  const { req, user: me, body } = ctx;
  const { type, id } = body; // Already validated by Zod

  // 5 boosts per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "boost"), limit: 5, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await applyBoost(me._id, type, id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BoostError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: boostSchema });
