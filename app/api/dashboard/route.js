import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import Note from "@/models/Note";
import LiveSession from "@/models/LiveSession";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = auth.mongoUser._id;

  const [videos, notes, sessions] = await Promise.all([
    Video.find({ uploader: userId }),
    Note.find({ uploader: userId }),
    LiveSession.find({ teacher: userId }),
  ]);

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalDownloads = notes.reduce((sum, n) => sum + n.downloads, 0);
  const totalAttendees = sessions.reduce((sum, s) => sum + s.attendees.length, 0);

  return NextResponse.json({
    user: auth.mongoUser,
    stats: {
      credits: auth.mongoUser.credits,
      totalVideos: videos.length,
      totalNotes: notes.length,
      totalSessions: sessions.length,
      totalViews,
      totalDownloads,
      totalAttendees,
    },
    recentVideos: videos.slice(-3).reverse(),
    recentNotes: notes.slice(-3).reverse(),
  });
}
