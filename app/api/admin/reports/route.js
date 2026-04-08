import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Report from "@/models/Report";
import { z } from "zod";

export const dynamic = "force-dynamic";

const getQuerySchema = z.object({
  status: z.string().optional().default("pending"),
});

// GET /api/admin/reports — list pending reports
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;

  const { searchParams } = new URL(req.url);
  const { status } = getQuerySchema.parse(Object.fromEntries(searchParams));

  const reports = await Report.find({ status })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("reporter", "name email firebaseUid");

  // Attach content title for context
  const Video = (await import("@/models/Video")).default;
  const Note = (await import("@/models/Note")).default;

  const enriched = await Promise.all(
    reports.map(async (r) => {
      let contentTitle = null;
      try {
        if (r.contentType === "video") {
          const v = await Video.findById(r.contentId).select("title flagged");
          contentTitle = v?.title;
        } else if (r.contentType === "note") {
          const n = await Note.findById(r.contentId).select("title flagged");
          contentTitle = n?.title;
        }
      } catch {}
      return { ...r.toObject(), contentTitle };
    })
  );

  return NextResponse.json(enriched);
}, { isProtected: true, allowedRoles: ["admin", "moderator"] });

const patchSchema = z.object({
  reportId: z.string().min(1, "reportId required"),
  status: z.enum(["reviewed", "dismissed", "actioned"]),
  unflag: z.boolean().optional(),
});

// PATCH /api/admin/reports — update report status
export const PATCH = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;
  const { reportId, status, unflag } = body;

  const report = await Report.findByIdAndUpdate(
    reportId,
    { status, reviewedBy: me._id, reviewedAt: new Date() },
    { new: true }
  );

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Optionally unflag the content
  if (unflag) {
    const Model = report.contentType === "video"
      ? (await import("@/models/Video")).default
      : report.contentType === "note"
      ? (await import("@/models/Note")).default
      : null;
    if (Model) await Model.findByIdAndUpdate(report.contentId, { flagged: false });
  }

  return NextResponse.json({ message: "Updated" });
}, { isProtected: true, allowedRoles: ["admin", "moderator"], schema: patchSchema });
