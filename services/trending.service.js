import Video from "@/models/Video";
import Note from "@/models/Note";
import { getCache, setCache } from "@/lib/cache";

export async function getTrendingContent() {
  const CACHE_KEY = "global:trending";
  
  const cachedTrending = await getCache(CACHE_KEY);
  if (cachedTrending) {
    return cachedTrending;
  }

  // Aggregate trending videos and notes
  // Trending score: views + (likes.length * 5)
  // We'll also prioritize boosted content
  
  const [trendingVideos, trendingNotes] = await Promise.all([
    Video.find({ flagged: false })
      .populate("uploader", "name image")
      .lean(),
    Note.find({ flagged: false })
      .populate("uploader", "name image")
      .lean()
  ]);

  const scoredVideos = trendingVideos.map(v => ({
    ...v,
    type: "video",
    score: (v.views || 0) + (v.likes?.length || 0) * 5 + (v.boostedUntil && new Date(v.boostedUntil) > new Date() ? 1000 : 0)
  }));

  const scoredNotes = trendingNotes.map(n => ({
    ...n,
    type: "note",
    score: (n.downloads || 0) + (n.likes?.length || 0) * 5 + (n.boostedUntil && new Date(n.boostedUntil) > new Date() ? 1000 : 0)
  }));

  const allTrending = [...scoredVideos, ...scoredNotes]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Cache for 15 minutes
  await setCache(CACHE_KEY, allTrending, 900);

  return allTrending;
}
