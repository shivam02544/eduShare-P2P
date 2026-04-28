import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    subject: { type: String, required: true },
    videoUrl: { type: String, required: true }, // S3 URL
    thumbnailUrl: { type: String, default: "" }, // S3 URL
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    boostedUntil: { type: Date, default: null }, // null = not boosted
    flagged: { type: Boolean, default: false },   // auto-flagged at 3+ reports
    chapters: [
      {
        title: { type: String, required: true, maxlength: 100 },
        timestamp: { type: Number, required: true, min: 0 }, // seconds
      },
    ],
    // Track who viewed to prevent duplicate credits
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Explore page — filter by subject, exclude flagged, sort by date or views
VideoSchema.index({ subject: 1, flagged: 1, createdAt: -1 });
// Dashboard / profile — all videos by a specific uploader
VideoSchema.index({ uploader: 1, createdAt: -1 });
// Boosted content sorting
VideoSchema.index({ boostedUntil: 1 });

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);
