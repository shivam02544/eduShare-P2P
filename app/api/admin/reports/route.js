import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
}

// GET /api/admin/reports — list pending reports
export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth || !isAdmin(auth.email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";

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
}

// PATCH /api/admin/reports — update report status
export async function PATCH(req) {
  const auth = await verifyAuth(req);
  if (!auth || !isAdmin(auth.email))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { reportId, status, unflag } = await req.json();
  if (!["reviewed", "dismissed", "actioned"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  await connectDB();
  const report = await Report.findByIdAndUpdate(
    reportId,
    { status, reviewedBy: auth.mongoUser._id, reviewedAt: new Date() },
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
}
