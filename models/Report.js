import mongoose from "mongoose";

const REASONS = [
  "spam",
  "inappropriate",
  "copyright",
  "misinformation",
  "harassment",
  "other",
];

const ReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentType: { type: String, enum: ["video", "note", "comment"], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, enum: REASONS, required: true },
    description: { type: String, maxlength: 500, default: "" },
    status: { type: String, enum: ["pending", "reviewed", "dismissed", "actioned"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// One report per user per content item
ReportSchema.index({ reporter: 1, contentType: 1, contentId: 1 }, { unique: true });
// Admin queue — pending reports sorted by date
ReportSchema.index({ status: 1, createdAt: -1 });

export const REPORT_REASONS = REASONS;
export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
