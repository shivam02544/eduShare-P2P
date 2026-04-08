import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import User from "@/models/User";
import { transferCredits } from "@/lib/credits";
import { createNotification } from "@/lib/notify";
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

  const target = await User.findOne({ firebaseUid: uid }).select("_id name");
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const result = await transferCredits({
    fromUserId: me._id,
    toUserId: target._id,
    amount,
    fromReason: "tip_sent",
    toReason: "tip_received",
    fromDescription: `You tipped ${target.name} ${amount} credits`,
    toDescription: `${me.name} tipped you ${amount} credits`,
  });

  if (!result.success)
    return NextResponse.json({ error: result.error }, { status: 400 });

  // Notify recipient
  await createNotification({
    recipient: target._id,
    sender: me._id,
    type: "credit",
    message: `${me.name} tipped you ${amount} credits 🎁`,
  });

  return NextResponse.json({ message: `Sent ${amount} credits to ${target.name}` });
}, { isProtected: true, schema: tipSchema });
