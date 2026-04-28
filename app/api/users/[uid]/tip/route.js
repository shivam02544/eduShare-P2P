import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { tipUser, ProfileError } from "@/services/profile.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const VALID_AMOUNTS = [5, 10, 25, 50, 100];

const paramsSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
});

const tipSchema = z.object({
  amount: z.number()
    .refine((val) => VALID_AMOUNTS.includes(val), {
      message: `Amount must be one of: ${VALID_AMOUNTS.join(", ")}`,
    }),
});

/**
 * POST /api/users/[uid]/tip
 * Send credits to another user. Atomic transfer.
 */
export const POST = apiHandler(async (ctx) => {
  const { req, user: me, params, body } = ctx;
  const { uid } = paramsSchema.parse(params);
  const { amount } = body;

  // 10 tips per hour per IP — prevents credit drain attacks
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "tip"), limit: 10, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await tipUser(uid, me, amount);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ProfileError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: tipSchema });
