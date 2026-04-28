import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { followUser, ProfileError } from "@/services/profile.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
});

export const POST = apiHandler(async (ctx) => {
  const { req, user: me, params } = ctx;
  const { uid } = paramsSchema.parse(params);

  // 30 follow/unfollow per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "follow"), limit: 30, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await followUser(uid, me);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ProfileError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
