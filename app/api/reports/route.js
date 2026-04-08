import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Report from "@/models/Report";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AUTO_FLAG_THRESHOLD = 3;
const MAX_REPORTS_PER_DAY = 10;

const reportSchema = z.object({
  contentType: z.enum(["video", "note", "comment"]),
  contentId: z.string().min(1, "contentId required"),
  reason: z.enum(["spam", "inappropriate", "copyright", "misinformation", "harassment", "other"]),
  description: z.string().optional(),
});

/**
 * POST /api/reports — submit a content report
 */
export const POST = apiHandler(async (ctx) => {
  const { req, user: me, body } = ctx;
  const { contentType, contentId, reason, description } = body;

  // 5 reports per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "reports"), limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  // Rate limit: max 10 reports per day
  const dayAgo = new Date(Date.now() - 86_400_000);
  const todayCount = await Report.countDocuments({
    reporter: me._id,
    createdAt: { $gte: dayAgo },
  });
  
  if (todayCount >= MAX_REPORTS_PER_DAY)
    return NextResponse.json({ error: "Report limit reached for today" }, { status: 429 });

  // Create report (unique index prevents duplicate)
  try {
    await Report.create({
      reporter: me._id,
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
}, { isProtected: true, schema: reportSchema });
