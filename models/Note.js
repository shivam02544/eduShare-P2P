import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    fileUrl: { type: String, required: true }, // S3 URL
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    downloads: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    boostedUntil: { type: Date, default: null },
    isPremium: { type: Boolean, default: false },
    premiumCost: { type: Number, default: 0, min: 0, max: 100 },
    flagged: { type: Boolean, default: false }, // credits to unlock
    // Track who downloaded to prevent duplicate credits
    downloadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
