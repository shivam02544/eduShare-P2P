import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getNotifications, markNotificationsAsRead } from "@/services/notification.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// GET /api/notifications
export const GET = apiHandler(async (ctx) => {
  const { req, user: me } = ctx;

  // 60 polls per hour per IP — polled every 30s = 120/hr max, we allow 60 (generous)
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "notifications"), limit: 60, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const result = await getNotifications(me._id);
  return NextResponse.json(result);
}, { isProtected: true });

// PATCH /api/notifications — mark all as read
export const PATCH = apiHandler(async (ctx) => {
  const { user: me } = ctx;
  const result = await markNotificationsAsRead(me._id);
  return NextResponse.json(result);
}, { isProtected: true });
