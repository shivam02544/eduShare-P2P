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

// Upcoming sessions — queried with date >= now on every list call
LiveSessionSchema.index({ date: 1 });
// Fast lookup by teacher
LiveSessionSchema.index({ teacher: 1, date: 1 });

export default mongoose.models.LiveSession ||
  mongoose.model("LiveSession", LiveSessionSchema);
