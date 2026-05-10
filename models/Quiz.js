import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true, maxlength: 1000 },
  options: {
    type: [{ type: String, maxlength: 500 }],
    validate: [(arr) => arr.length === 4, "Exactly 4 options required"],
  },
  // Index of correct option (0-3) — NEVER exposed to client in GET
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, maxlength: 1000 },
}, { _id: true });

const QuizSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: false, // Optional if generating from text/notes directly
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    topic: { type: String, maxlength: 100 },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },
    questions: {
      type: [QuestionSchema],
      validate: [
        (arr) => arr.length >= 1 && arr.length <= 20, // Increased limit to 20
        "Quiz must have 1–20 questions",
      ],
    },
    passingScore: { type: Number, default: 70, min: 1, max: 100 }, // percentage
    isPublished: { type: Boolean, default: false },
    generatedByAI: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);

