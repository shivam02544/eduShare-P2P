import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true, maxlength: 500 },
  options: {
    type: [{ type: String, maxlength: 200 }],
    validate: [(arr) => arr.length === 4, "Exactly 4 options required"],
  },
  // Index of correct option (0-3) — NEVER exposed to client in GET
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
}, { _id: true });

const QuizSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      unique: true, // one quiz per video
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      validate: [
        (arr) => arr.length >= 1 && arr.length <= 10,
        "Quiz must have 1–10 questions",
      ],
    },
    passingScore: { type: Number, default: 70, min: 1, max: 100 }, // percentage
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
