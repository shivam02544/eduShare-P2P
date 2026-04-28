import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { recordVideoView, VideoError } from "@/services/video.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async (ctx) => {
  const { req, params, user } = ctx;

  // 30 video views per hour per IP — prevents bot inflation
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "video-view"), limit: 30, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await recordVideoView(params.id, user);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof VideoError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
