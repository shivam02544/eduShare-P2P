import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";

export const dynamic = "force-dynamic";

const AUTO_FLAG_THRESHOLD = 3;
const MAX_REPORTS_PER_DAY = 10;

/**
 * POST /api/reports — submit a content report
 */
export async function POST(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentType, contentId, reason, description } = await req.json();

  if (!["video", "note", "comment"].includes(contentType))
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  if (!contentId)
    return NextResponse.json({ error: "contentId required" }, { status: 400 });
  if (!["spam", "inappropriate", "copyright", "misinformation", "harassment", "other"].includes(reason))
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });

  await connectDB();

  // Rate limit: max 10 reports per day
  const dayAgo = new Date(Date.now() - 86_400_000);
  const todayCount = await Report.countDocuments({
    reporter: auth.mongoUser._id,
    createdAt: { $gte: dayAgo },
  });
  if (todayCount >= MAX_REPORTS_PER_DAY)
    return NextResponse.json({ error: "Report limit reached for today" }, { status: 429 });

  // Create report (unique index prevents duplicate)
  try {
    await Report.create({
      reporter: auth.mongoUser._id,
      contentType,
      contentId,
      reason,
      description: description?.trim().slice(0, 500) || "",
    });
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ error: "You already reported this content" }, { status: 409 });
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

  return NextResponse.json({ message: "Report submitted. Thank you for keeping EduShare safe." });
}
