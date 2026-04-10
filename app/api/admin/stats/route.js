import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import User from "@/models/User";
import Video from "@/models/Video";
import Note from "@/models/Note";
import Report from "@/models/Report";
import { connectDB } from "@/lib/mongodb";

export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth || (auth.mongoUser.role !== "admin" && auth.mongoUser.role !== "moderator")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectDB();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. High level counts
    const [userCount, videoCount, noteCount, pendingReports, totalCredits] = await Promise.all([
      User.countDocuments(),
      Video.countDocuments(),
      Note.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$credits" } } }]),
    ]);

    // 2. Growth metrics (Daily for last 7 days)
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

    // 3. Content distribution by subject
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

    return NextResponse.json({
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
    });
  } catch (err) {
    console.error("[AdminStatsAPI] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
