import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// GET /api/notifications
export async function GET(req) {
  // 60 polls per hour per IP — polled every 30s = 120/hr max, we allow 60 (generous)
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "notifications"), limit: 60, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const notifications = await Notification.find({ recipient: auth.mongoUser._id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("sender", "name image firebaseUid")
    .populate("video", "title")
    .populate("note", "title");

  const unreadCount = await Notification.countDocuments({
    recipient: auth.mongoUser._id,
    read: false,
  });

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark all as read
export async function PATCH(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Notification.updateMany(
    { recipient: auth.mongoUser._id, read: false },
    { $set: { read: true } }
  );

  return NextResponse.json({ message: "All marked as read" });
}
