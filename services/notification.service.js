import Notification from "@/models/Notification";

export async function getNotifications(userId) {
  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("sender", "name image firebaseUid")
    .populate("video", "title")
    .populate("note", "title");

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    read: false,
  });

  return { notifications, unreadCount };
}

export async function markNotificationsAsRead(userId) {
  await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );

  return { message: "All marked as read" };
}
