import EmailVerification from "@/models/EmailVerification";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/mailer";
import crypto from "crypto";

export class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createVerificationToken(email, name) {
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
    throw new AuthError("Failed to send email. Check your email config.", 500);
  }

  return { message: "Verification email sent" };
}

export async function verifyEmailToken(token) {
  console.log("[verify-email] Looking for token:", token.substring(0, 16) + "...");
  const record = await EmailVerification.findOne({ token });
  console.log("[verify-email] Record found:", !!record);

  if (!record) {
    throw new AuthError("Invalid or expired link", 400);
  }
  
  if (record.expiresAt < new Date()) {
    throw new AuthError("Link expired", 400);
  }

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

  return { verified: true, email: record.email };
}
