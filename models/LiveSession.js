import mongoose from "mongoose";

const LiveSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, default: "" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    meetingLink: { type: String, required: true }, // Zoom/Meet/etc.
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.LiveSession ||
  mongoose.model("LiveSession", LiveSessionSchema);
