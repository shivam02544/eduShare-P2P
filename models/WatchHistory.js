import mongoose from "mongoose";

const WatchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    progressSeconds: { type: Number, default: 0, min: 0 },
    durationSeconds: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false }, // watched 90%+
    completedAt: { type: Date, default: null },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// One record per user per video — upsert on every save
WatchHistorySchema.index({ user: 1, video: 1 }, { unique: true });
// Fast "continue watching" query
WatchHistorySchema.index({ user: 1, lastWatchedAt: -1 });

export default mongoose.models.WatchHistory ||
  mongoose.model("WatchHistory", WatchHistorySchema);
