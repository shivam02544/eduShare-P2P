import mongoose from "mongoose";

// type: "earned" | "spent"
// reason: "video_view" | "note_download" | "live_join" | "gift"
const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true }, // positive = earned, negative = spent
    reason: {
      type: String,
      enum: [
        "video_view", "note_download", "live_join", "gift",
        "quiz_pass", "quiz_completion",
        "tip_sent", "tip_received",
        "boost_video", "boost_note",
        "premium_note_unlock", "premium_note_earned",
      ],
      required: true,
    },
    // Optional context refs
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "LiveSession" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
