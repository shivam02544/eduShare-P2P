import Report from "@/models/Report";

const AUTO_FLAG_THRESHOLD = 3;
const MAX_REPORTS_PER_DAY = 10;

export class ReportError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createReport(reporterId, data) {
  const { contentType, contentId, reason, description } = data;

  const dayAgo = new Date(Date.now() - 86_400_000);
  const todayCount = await Report.countDocuments({
    reporter: reporterId,
    createdAt: { $gte: dayAgo },
  });
  
  if (todayCount >= MAX_REPORTS_PER_DAY) {
    throw new ReportError("Report limit reached for today", 429);
  }

  // Create report (unique index prevents duplicate)
  try {
    await Report.create({
      reporter: reporterId,
      contentType,
      contentId,
      reason,
      description: description?.trim().slice(0, 500) || "",
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ReportError("You already reported this content", 409);
    }
    throw err;
  }

  // Auto-flag content if threshold reached
  const reportCount = await Report.countDocuments({ contentType, contentId, status: "pending" });
  if (reportCount >= AUTO_FLAG_THRESHOLD) {
    const Model = contentType === "video"
      ? (await import("@/models/Video")).default
      : contentType === "note"
      ? (await import("@/models/Note")).default
      : null;
    if (Model) await Model.findByIdAndUpdate(contentId, { flagged: true });
  }

  return { message: "Report submitted. Thank you for keeping EduShare safe." };
}
