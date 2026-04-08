import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import User from "@/models/User";
import Video from "@/models/Video";
import Note from "@/models/Note";
import LiveSession from "@/models/LiveSession";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
});

// GET /api/profile/[uid] — public profile by firebaseUid
export const GET = apiHandler(async (ctx) => {
  // Validate URL parameter
  const { uid } = paramsSchema.parse(ctx.params);

  // apiHandler already injects ctx.user if valid token provided, but GET is public.
  // It handles checking the token if isProtected: false and still providing ctx.user if valid!
  let requesterId = null;
  if (ctx.user) {
    const requester = await User.findById(ctx.user._id).select("following");
    requesterId = requester;
  }

  const user = await User.findOne({ firebaseUid: uid })
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
}, { isProtected: false });
