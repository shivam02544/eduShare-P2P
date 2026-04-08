import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmailVerification from "@/models/EmailVerification";
import User from "@/models/User";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/verify-email?token=xxx
 * Validates the token, marks user as verified in MongoDB.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  await connectDB();

  console.log("[verify-email] Looking for token:", token.substring(0, 16) + "...");
  const record = await EmailVerification.findOne({ token });
  console.log("[verify-email] Record found:", !!record);

  if (!record) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  if (record.expiresAt < new Date()) return NextResponse.json({ error: "Link expired" }, { status: 400 });

  // If already used, just return success (idempotent)
  if (!record.used) {
    record.used = true;
    await record.save();

    // Mark user as verified — upsert so it works even if user doc doesn't exist yet
    await User.findOneAndUpdate(
      { email: record.email },
      { $set: { isVerified: true } },
      { upsert: true, new: true }
    );
  }

  return NextResponse.json({ verified: true, email: record.email });
}
