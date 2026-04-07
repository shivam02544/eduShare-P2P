import Notification from "@/models/Notification";

/**
 * Create a notification. Silently fails — never block main action.
 * @param {object} opts
 */
export async function createNotification({ recipient, sender, type, video, note, message }) {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) return;
    await Notification.create({ recipient, sender, type, video, note, message });
  } catch (err) {
    console.error("[notify] Failed:", err.message);
  }
}
