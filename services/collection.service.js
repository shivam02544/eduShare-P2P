import Collection from "@/models/Collection";

export class CollectionError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getAllCollections(creatorUid) {
  let query = { isPublic: true };

  if (creatorUid) {
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ firebaseUid: creatorUid }).select("_id");
    if (!user) return [];
    query = { creator: user._id }; // include private for own profile view
  }

  const collections = await Collection.find(query)
    .sort({ createdAt: -1 })
    .populate("creator", "name image firebaseUid")
    .select("-videos.addedAt") // trim payload
    .lean();

  // Attach video count and thumbnail from first video
  const Video = (await import("@/models/Video")).default;
  const result = await Promise.all(
    collections.map(async (c) => {
      const videoIds = c.videos.map((v) => v.video);
      const firstVideo = videoIds.length
        ? await Video.findById(videoIds[0]).select("thumbnailUrl title").lean()
        : null;
      return {
        ...c,
        videoCount: videoIds.length,
        followerCount: c.followers?.length ?? 0,
        coverImage: firstVideo?.thumbnailUrl || null,
      };
    })
  );

  return result;
}

export async function createCollection(creatorId, data) {
  const { title, description, isPublic, subject } = data;

  // Limit: max 50 collections per user
  const count = await Collection.countDocuments({ creator: creatorId });
  if (count >= 50) {
    throw new CollectionError("Maximum 50 collections allowed", 400);
  }

  const collection = await Collection.create({
    title,
    description: description?.trim() || "",
    creator: creatorId,
    isPublic,
    subject: subject?.trim() || "",
  });

  return collection;
}

export async function getCollection(collectionId, mongoUserId) {
  const collection = await Collection.findById(collectionId)
    .populate("creator", "name image firebaseUid")
    .lean();

  if (!collection) {
    throw new CollectionError("Not found", 404);
  }

  // Private collections only visible to creator
  if (!collection.isPublic && collection.creator._id.toString() !== mongoUserId) {
    throw new CollectionError("Forbidden", 403);
  }

  // Populate videos in order
  const Video = (await import("@/models/Video")).default;
  const sortedVideoRefs = [...collection.videos].sort((a, b) => a.position - b.position);
  const videoIds = sortedVideoRefs.map((v) => v.video);

  const videos = await Video.find({ _id: { $in: videoIds } })
    .populate("uploader", "name image firebaseUid")
    .lean();

  // Preserve order
  const videoMap = Object.fromEntries(videos.map((v) => [v._id.toString(), v]));
  const orderedVideos = videoIds.map((id) => videoMap[id.toString()]).filter(Boolean);

  const isFollowing = mongoUserId
    ? collection.followers.map(String).includes(mongoUserId)
    : false;

  const isCreator = mongoUserId === collection.creator._id.toString();

  return {
    ...collection,
    videos: orderedVideos,
    videoCount: orderedVideos.length,
    followerCount: collection.followers.length,
    isFollowing,
    isCreator,
  };
}

export async function updateCollection(collectionId, uploaderId, updates) {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new CollectionError("Not found", 404);
  }
  if (collection.creator.toString() !== uploaderId.toString()) {
    throw new CollectionError("Forbidden", 403);
  }

  const { title, description, isPublic, subject } = updates;

  if (title !== undefined) collection.title = title.trim();
  if (description !== undefined) collection.description = description.trim();
  if (isPublic !== undefined) collection.isPublic = isPublic;
  if (subject !== undefined) collection.subject = subject.trim();

  await collection.save();
  return collection;
}

export async function deleteCollection(collectionId, uploaderId) {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new CollectionError("Not found", 404);
  }
  if (collection.creator.toString() !== uploaderId.toString()) {
    throw new CollectionError("Forbidden", 403);
  }

  await collection.deleteOne();
  return { message: "Deleted" };
}

export async function toggleFollowCollection(collectionId, userId) {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new CollectionError("Not found", 404);
  }

  const isFollowing = collection.followers.map(String).includes(userId.toString());

  if (isFollowing) {
    collection.followers = collection.followers.filter((f) => f.toString() !== userId.toString());
  } else {
    collection.followers.push(userId);
  }

  await collection.save();
  return {
    following: !isFollowing,
    followerCount: collection.followers.length,
  };
}

export async function addVideoToCollection(collectionId, creatorId, videoId) {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new CollectionError("Not found", 404);
  }
  if (collection.creator.toString() !== creatorId.toString()) {
    throw new CollectionError("Forbidden", 403);
  }

  // Prevent duplicates
  const exists = collection.videos.some((v) => v.video.toString() === videoId.toString());
  if (exists) {
    throw new CollectionError("Video already in collection", 409);
  }

  // Max 100 videos per collection
  if (collection.videos.length >= 100) {
    throw new CollectionError("Collection is full (max 100 videos)", 400);
  }

  const maxPosition = collection.videos.reduce((max, v) => Math.max(max, v.position), -1);
  collection.videos.push({ video: videoId, position: maxPosition + 1 });
  await collection.save();

  return { message: "Added", videoCount: collection.videos.length };
}

export async function removeVideoFromCollection(collectionId, creatorId, videoId) {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new CollectionError("Not found", 404);
  }
  if (collection.creator.toString() !== creatorId.toString()) {
    throw new CollectionError("Forbidden", 403);
  }

  collection.videos = collection.videos.filter((v) => v.video.toString() !== videoId.toString());
  await collection.save();

  return { message: "Removed", videoCount: collection.videos.length };
}
