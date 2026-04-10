import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Report from "@/models/Report";
import { z } from "zod";
import { deleteFile, extractS3Key } from "@/lib/s3";
import { createNotification } from "@/lib/notify";

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

  // Perform destructive action if status is "actioned"
  if (status === "actioned") {
    const { contentType, contentId } = report;
    let uploaderId = null;
    let contentTitle = "";

    if (contentType === "video") {
      const Video = (await import("@/models/Video")).default;
      const v = await Video.findById(contentId);
      if (v) {
        uploaderId = v.uploader;
        contentTitle = v.title;
        if (v.videoUrl) await deleteFile(extractS3Key(v.videoUrl));
        if (v.thumbnailUrl) await deleteFile(extractS3Key(v.thumbnailUrl));
        await Video.findByIdAndDelete(contentId);
      }
    } else if (contentType === "note") {
      const Note = (await import("@/models/Note")).default;
      const n = await Note.findById(contentId);
      if (n) {
        uploaderId = n.uploader;
        contentTitle = n.title;
        if (n.fileUrl) await deleteFile(extractS3Key(n.fileUrl));
        await Note.findByIdAndDelete(contentId);
      }
    } else if (contentType === "comment") {
      const Comment = (await import("@/models/Comment")).default;
      const c = await Comment.findById(contentId);
      if (c) {
        uploaderId = c.author;
        await Comment.findByIdAndDelete(contentId);
      }
    }

    // Mark all other pending reports for this content as actioned
    await Report.updateMany(
      { contentType, contentId, status: "pending" },
      { status: "actioned", reviewedBy: me._id, reviewedAt: new Date() }
    );

    // Notify uploader
    if (uploaderId) {
      await createNotification({
        recipient: uploaderId,
        sender: me._id,
        type: "system",
        message: `Your ${contentType} "${contentTitle || ""}" was removed for violating community guidelines.`,
      });
    }
  }

  // Optionally unflag the content (if not deleted)
  if (unflag && status !== "actioned") {
    const Model = report.contentType === "video"
      ? (await import("@/models/Video")).default
      : report.contentType === "note"
      ? (await import("@/models/Note")).default
      : null;
    if (Model) await Model.findByIdAndUpdate(report.contentId, { flagged: false });
  }

  return NextResponse.json({ message: status === "actioned" ? "Content deleted and uploader notified" : "Updated" });
}, { isProtected: true, allowedRoles: ["admin", "moderator"], schema: patchSchema });
