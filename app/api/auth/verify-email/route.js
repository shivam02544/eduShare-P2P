import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import EmailVerification from "@/models/EmailVerification";
import User from "@/models/User";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifyQuerySchema = z.object({
  token: z.string().min(1, "Token required"),
});

/**
 * GET /api/auth/verify-email?token=xxx
 * Validates the token, marks user as verified in MongoDB.
 */
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  const { searchParams } = new URL(req.url);
  const { token } = verifyQuerySchema.parse(Object.fromEntries(searchParams));

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
}, { isProtected: false });
