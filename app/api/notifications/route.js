import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export const dynamic = "force-dynamic";

// GET /api/notifications — get latest 30 notifications
export async function GET(req) {
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
