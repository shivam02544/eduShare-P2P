import Video from "@/models/Video";

export class VideoError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getVideos(subject, sort, userId) {
  const query = subject ? { subject, flagged: { $ne: true } } : { flagged: { $ne: true } };
  const sortOption = sort === "popular" ? { views: -1 } : { createdAt: -1 };

  const videos = await Video.find(query)
    .sort(sortOption)
    .populate("uploader", "name image firebaseUid");

  const mongoUserId = userId ? userId.toString() : null;

  return videos.map((v) => {
    const obj = v.toObject();
    obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
    obj.isBookmarked = mongoUserId ? obj.bookmarks?.map(String).includes(mongoUserId) : false;
    return obj;
  });
}

export async function createVideo(data, uploaderId) {
  const { title, description, subject, videoUrl, thumbnailUrl } = data;

  const video = await Video.create({
    title,
    description: description || "",
    subject,
    videoUrl,
    thumbnailUrl: thumbnailUrl || "",
    uploader: uploaderId,
  });

  return video;
}

export async function getVideoById(videoId, userId) {
  const video = await Video.findById(videoId)
    .populate("uploader", "name image firebaseUid");
    
  if (!video) {
    throw new VideoError("Not found", 404);
  }

  const obj = video.toObject();
  const mongoUserId = userId ? userId.toString() : null;
  
  obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
  obj.isBookmarked = mongoUserId ? obj.bookmarks?.map(String).includes(mongoUserId) : false;

  return obj;
}

export async function toggleVideoBookmark(videoId, userId) {
  const video = await Video.findById(videoId);
  if (!video) {
    throw new VideoError("Not found", 404);
  }

  const bookmarked = video.bookmarks.map(String).includes(userId.toString());

  if (bookmarked) {
    video.bookmarks = video.bookmarks.filter((b) => b.toString() !== userId.toString());
  } else {
    video.bookmarks.push(userId);
  }

  await video.save();
  return { bookmarked: !bookmarked };
}

export async function toggleLikeVideo(videoId, user) {
  const video = await Video.findById(videoId);
  if (!video) {
    throw new VideoError("Not found", 404);
  }

  const liked = video.likes.map(String).includes(user._id.toString());

  if (liked) {
    video.likes = video.likes.filter((l) => l.toString() !== user._id.toString());
  } else {
    video.likes.push(user._id);
    const { createNotification } = await import("@/lib/notify");
    await createNotification({
      recipient: video.uploader,
      sender: user._id,
      type: "like_video",
      video: video._id,
      message: `${user.name} liked your video "${video.title}"`,
    });
  }

  await video.save();
  return { likes: video.likes.length, liked: !liked };
}

export async function updateVideoChapters(videoId, uploaderId, chapters) {
  const video = await Video.findById(videoId).select("uploader chapters");
  if (!video) {
    throw new VideoError("Not found", 404);
  }
  if (video.uploader.toString() !== uploaderId.toString()) {
    throw new VideoError("Forbidden", 403);
  }

  if (!Array.isArray(chapters)) {
    throw new VideoError("chapters must be an array", 400);
  }
  if (chapters.length > 20) {
    throw new VideoError("Maximum 20 chapters allowed", 400);
  }

  // Validate each chapter
  for (let i = 0; i < chapters.length; i++) {
    const c = chapters[i];
    if (!c.title?.trim()) {
      throw new VideoError(`Chapter ${i + 1} needs a title`, 400);
    }
    if (typeof c.timestamp !== "number" || c.timestamp < 0) {
      throw new VideoError(`Chapter ${i + 1} has invalid timestamp`, 400);
    }
  }

  // Sort by timestamp before saving
  const sorted = [...chapters]
    .map((c) => ({ title: c.title.trim(), timestamp: Math.floor(c.timestamp) }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // First chapter must start at 0:00
  if (sorted.length > 0 && sorted[0].timestamp !== 0) {
    sorted.unshift({ title: "Introduction", timestamp: 0 });
  }

  video.chapters = sorted;
  await video.save();

  return { chapters: video.chapters };
}

export async function recordVideoView(videoId, user) {
  const video = await Video.findById(videoId);
  if (!video) {
    throw new VideoError("Video not found", 404);
  }

  const viewerId = user._id.toString();

  if (video.uploader.toString() === viewerId) {
    return { message: "Self-view, no credits" };
  }

  if (video.viewedBy.map(String).includes(viewerId)) {
    return { message: "Already viewed" };
  }

  video.views += 1;
  video.viewedBy.push(user._id);
  await video.save();

  const { awardCredits } = await import("@/lib/credits");
  await awardCredits({
    userId: video.uploader,
    amount: 5,
    reason: "video_view",
    video: video._id,
    description: `Someone watched "${video.title}"`,
  });

  return { message: "View recorded, +5 credits awarded" };
}

