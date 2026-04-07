import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Snapshot of answers submitted [0-3 per question]
    answers: [{ type: Number, min: 0, max: 3 }],
    score: { type: Number, required: true },        // percentage 0-100
    passed: { type: Boolean, required: true },
    creditsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Enforce one attempt per user per quiz at DB level
QuizAttemptSchema.index({ quiz: 1, user: 1 }, { unique: true });

export default mongoose.models.QuizAttempt ||
  mongoose.model("QuizAttempt", QuizAttemptSchema);
