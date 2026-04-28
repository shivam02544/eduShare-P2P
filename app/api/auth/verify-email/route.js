import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { verifyEmailToken, AuthError } from "@/services/auth.service";
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

  try {
    const result = await verifyEmailToken(token);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: false });
