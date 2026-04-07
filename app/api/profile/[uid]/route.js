import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import Note from "@/models/Note";
import LiveSession from "@/models/LiveSession";

export const dynamic = "force-dynamic";

// GET /api/profile/[uid] — public profile by firebaseUid
export async function GET(req, { params }) {
  await connectDB();

  // Check if requester is logged in (to show follow state)
  let requesterId = null;
  try {
    const { getAdminApp } = await import("@/lib/firebaseAdmin");
    const { getAuth } = await import("firebase-admin/auth");
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const app = getAdminApp();
      const decoded = await getAuth(app).verifyIdToken(token);
      const requester = await User.findOne({ firebaseUid: decoded.uid }).select("_id following");
      requesterId = requester;
    }
  } catch { /* public request, no auth */ }

  const user = await User.findOne({ firebaseUid: params.uid })
    .select("-__v")
    .lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [videos, notes, sessions] = await Promise.all([
    Video.find({ uploader: user._id }).sort({ createdAt: -1 }).limit(6),
    Note.find({ uploader: user._id }).sort({ createdAt: -1 }).limit(6),
    LiveSession.find({ teacher: user._id }).sort({ date: -1 }).limit(3),
  ]);

  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const totalDownloads = notes.reduce((s, n) => s + n.downloads, 0);

  const isFollowing = requesterId
    ? requesterId.following.map(String).includes(user._id.toString())
    : false;

  return NextResponse.json({
    user: {
      ...user,
      followersCount: user.followers?.length ?? 0,
      followingCount: user.following?.length ?? 0,
    },
    isFollowing,
    stats: { totalViews, totalDownloads, totalVideos: videos.length, totalNotes: notes.length },
    videos,
    notes,
    sessions,
  });
}
