import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { createVerificationToken, AuthError } from "@/services/auth.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verificationSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().optional(),
});

/**
 * POST /api/auth/send-verification
 * Called right after Firebase creates the account.
 * Generates a secure token, stores it, sends branded email.
 */
export const POST = apiHandler(async (ctx) => {
  const { req, body } = ctx;
  const { email, name } = body;

  // 5 emails per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "send-verification"), limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await createVerificationToken(email, name);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: false, schema: verificationSchema });
