import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    front: { type: String, required: true },
    back: { type: String, required: true },
    topic: { type: String, required: true, index: true },
    sourceType: { 
      type: String, 
      enum: ["quiz", "note", "video", "explanation"], 
      default: "explanation" 
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    difficulty: { 
      type: Number, 
      default: 0.3 // 0 (easy) to 1 (hard)
    },
    nextReview: { type: Date, default: Date.now },
    masteryLevel: { type: Number, default: 0 }, // progress in SRS
  },
  { timestamps: true }
);

export default mongoose.models.Flashcard || mongoose.model("Flashcard", FlashcardSchema);
