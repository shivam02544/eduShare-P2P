import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Notification from "@/models/Notification";
import Video from "@/models/Video";
import Note from "@/models/Note";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// GET /api/notifications
export const GET = apiHandler(async (ctx) => {
  const { req, user: me } = ctx;

  // 60 polls per hour per IP — polled every 30s = 120/hr max, we allow 60 (generous)
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "notifications"), limit: 60, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const notifications = await Notification.find({ recipient: me._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("sender", "name image firebaseUid")
    .populate("video", "title")
    .populate("note", "title");

  const unreadCount = await Notification.countDocuments({
    recipient: me._id,
    read: false,
  });

  return NextResponse.json({ notifications, unreadCount });
}, { isProtected: true });

// PATCH /api/notifications — mark all as read
export const PATCH = apiHandler(async (ctx) => {
  const { user: me } = ctx;
  await Notification.updateMany(
    { recipient: me._id, read: false },
    { $set: { read: true } }
  );

  return NextResponse.json({ message: "All marked as read" });
}, { isProtected: true });
