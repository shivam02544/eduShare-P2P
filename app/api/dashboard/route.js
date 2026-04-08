import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Video from "@/models/Video";
import Note from "@/models/Note";
import LiveSession from "@/models/LiveSession";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { user: me } = ctx;
  const userId = me._id.toString();

  const CACHE_KEY = `dashboard:${userId}`;
  const cachedData = await getCache(CACHE_KEY);
  
  if (cachedData) {
    // Inject the real-time user object (for current credits) into the cached heavy computational layout
    return NextResponse.json({ ...cachedData, user: me, stats: { ...cachedData.stats, credits: me.credits } });
  }

  const [videos, notes, sessions] = await Promise.all([
    Video.find({ uploader: userId }),
    Note.find({ uploader: userId }),
    LiveSession.find({ teacher: userId }),
  ]);

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalDownloads = notes.reduce((sum, n) => sum + n.downloads, 0);
  const totalAttendees = sessions.reduce((sum, s) => sum + s.attendees.length, 0);

  const payload = {
    stats: {
      totalVideos: videos.length,
      totalNotes: notes.length,
      totalSessions: sessions.length,
      totalViews,
      totalDownloads,
      totalAttendees,
    },
    recentVideos: videos.slice(-3).reverse(),
    recentNotes: notes.slice(-3).reverse(),
  };

  // Cache computational stats and slices for 5 minutes
  await setCache(CACHE_KEY, payload, 300);

  // Return exactly identical block format with live user credit state
  return NextResponse.json({
    user: me,
    stats: { ...payload.stats, credits: me.credits },
    recentVideos: payload.recentVideos,
    recentNotes: payload.recentNotes,
  });
}, { isProtected: true });
