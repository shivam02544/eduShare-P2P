import mongoose from "mongoose";

// type: "follow" | "like" | "comment" | "credit"
const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["follow", "like_video", "like_note", "comment", "credit", "quiz_pass"], required: true },
    read: { type: Boolean, default: false },
    // Optional references
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
    message: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for fast unread count queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
