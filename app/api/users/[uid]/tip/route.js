import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { transferCredits } from "@/lib/credits";
import { createNotification } from "@/lib/notify";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const VALID_AMOUNTS = [5, 10, 25, 50, 100];

/**
 * POST /api/users/[uid]/tip
 * Send credits to another user. Atomic transfer.
 */
export async function POST(req, { params }) {
  // 10 tips per hour per IP — prevents credit drain attacks
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "tip"), limit: 10, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json();

  if (!VALID_AMOUNTS.includes(amount))
    return NextResponse.json({ error: `Amount must be one of: ${VALID_AMOUNTS.join(", ")}` }, { status: 400 });

  await connectDB();

  const target = await User.findOne({ firebaseUid: params.uid }).select("_id name");
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const result = await transferCredits({
    fromUserId: auth.mongoUser._id,
    toUserId: target._id,
    amount,
    fromReason: "tip_sent",
    toReason: "tip_received",
    fromDescription: `You tipped ${target.name} ${amount} credits`,
    toDescription: `${auth.mongoUser.name} tipped you ${amount} credits`,
  });

  if (!result.success)
    return NextResponse.json({ error: result.error }, { status: 400 });

  // Notify recipient
  await createNotification({
    recipient: target._id,
    sender: auth.mongoUser._id,
    type: "credit",
    message: `${auth.mongoUser.name} tipped you ${amount} credits 🎁`,
  });

  return NextResponse.json({ message: `Sent ${amount} credits to ${target.name}` });
}
