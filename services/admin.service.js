import Report from "@/models/Report";
import { deleteFile, extractS3Key } from "@/lib/s3";
import { createNotification } from "@/lib/notify";

export class AdminError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getReports(status) {
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

  return enriched;
}

export async function updateReport(adminId, reportId, status, unflag) {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { status, reviewedBy: adminId, reviewedAt: new Date() },
    { new: true }
  );

  if (!report) {
    throw new AdminError("Not found", 404);
  }

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
      { status: "actioned", reviewedBy: adminId, reviewedAt: new Date() }
    );

    // Notify uploader
    if (uploaderId) {
      await createNotification({
        recipient: uploaderId,
        sender: adminId,
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

  return { message: status === "actioned" ? "Content deleted and uploader notified" : "Updated" };
}

export async function getContent(type, q, page, limit = 20) {
  const skip = (page - 1) * limit;
  const query = q ? { title: { $regex: q, $options: "i" } } : {};
  
  let items = [];
  let total = 0;

  const Video = (await import("@/models/Video")).default;
  const Note = (await import("@/models/Note")).default;

  if (type === "video" || type === "all") {
    const videos = await Video.find(query)
      .populate("uploader", "name email image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    items = [...items, ...videos.map(v => ({ ...v, contentType: "video" }))];
    total += await Video.countDocuments(query);
  }

  if (type === "note" || type === "all") {
    const notes = await Note.find(query)
      .populate("uploader", "name email image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    items = [...items, ...notes.map(n => ({ ...n, contentType: "note" }))];
    total += await Note.countDocuments(query);
  }

  if (type === "all") {
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    items = items.slice(0, limit);
  }

  return { items, total, pages: Math.ceil(total / limit) };
}

export async function deleteContent(id, type) {
  if (type === "video") {
    const Video = (await import("@/models/Video")).default;
    await Video.findByIdAndDelete(id);
  } else if (type === "note") {
    const Note = (await import("@/models/Note")).default;
    await Note.findByIdAndDelete(id);
  }
  return { success: true };
}

export async function getStats() {
  const User = (await import("@/models/User")).default;
  const Video = (await import("@/models/Video")).default;
  const Note = (await import("@/models/Note")).default;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [userCount, videoCount, noteCount, pendingReports, totalCredits] = await Promise.all([
    User.countDocuments(),
    Video.countDocuments(),
    Note.countDocuments(),
    Report.countDocuments({ status: "pending" }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$credits" } } }]),
  ]);

  const growthStats = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const subjectStats = await Video.aggregate([
    {
      $group: {
        _id: "$subject",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  return {
    counts: {
      users: userCount,
      videos: videoCount,
      notes: noteCount,
      reports: pendingReports,
      credits: totalCredits[0]?.total || 0,
    },
    growth: growthStats,
    distribution: subjectStats,
    timestamp: now.toISOString()
  };
}
