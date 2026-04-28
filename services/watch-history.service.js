import WatchHistory from "@/models/WatchHistory";

export async function getWatchHistory(userId, type) {
  const query = { user: userId };
  if (type === "continue") query.completed = false;

  const history = await WatchHistory.find(query)
    .sort({ lastWatchedAt: -1 })
    .limit(type === "continue" ? 10 : 50)
    .populate({
      path: "video",
      select: "title thumbnailUrl subject uploader views",
      populate: { path: "uploader", select: "name" },
    });

  // Filter out deleted videos
  return history.filter((h) => h.video);
}

export async function saveWatchHistory(userId, videoId, progressSeconds, durationSeconds) {
  const progress = Math.floor(progressSeconds);
  const duration = Math.floor(durationSeconds || 0);
  const completed = duration > 0 && progress / duration >= 0.9;

  await WatchHistory.findOneAndUpdate(
    { user: userId, video: videoId },
    {
      progressSeconds: progress,
      durationSeconds: duration,
      completed,
      lastWatchedAt: new Date(),
      ...(completed ? { completedAt: new Date() } : {}),
    },
    { upsert: true }
  );

  return { saved: true };
}

export async function clearWatchHistory(userId) {
  await WatchHistory.deleteMany({ user: userId });
  return { message: "History cleared" };
}
