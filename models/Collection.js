import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, default: "", maxlength: 500 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videos: [
      {
        video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
        position: { type: Number, required: true }, // for ordering
        addedAt: { type: Date, default: Date.now },
      },
    ],
    isPublic: { type: Boolean, default: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subject: { type: String, default: "" }, // optional category tag
  },
  { timestamps: true }
);

// Prevent duplicate videos in same collection
CollectionSchema.index({ "videos.video": 1, _id: 1 });
// Fast lookup by creator
CollectionSchema.index({ creator: 1, createdAt: -1 });

export default mongoose.models.Collection ||
  mongoose.model("Collection", CollectionSchema);
