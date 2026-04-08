import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmailVerification from "@/models/EmailVerification";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/mailer";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/send-verification
 * Called right after Firebase creates the account.
 * Generates a secure token, stores it, sends branded email.
 * Body: { email, name }
 */
export async function POST(req) {
  // 5 emails per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "send-verification"), limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const { email, name } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  await connectDB();

  // Delete any existing unused tokens for this email
  await EmailVerification.deleteMany({ email, used: false });

  // Generate cryptographically secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await EmailVerification.create({ email, token, expiresAt });
  console.log("[send-verification] Token saved for:", email, "token prefix:", token.substring(0, 16));

  try {
    await sendVerificationEmail({ to: email, name, token });
  } catch (err) {
    console.error("[mailer] Failed to send:", err.message);
    return NextResponse.json({ error: "Failed to send email. Check your email config." }, { status: 500 });
  }

  return NextResponse.json({ message: "Verification email sent" });
}
