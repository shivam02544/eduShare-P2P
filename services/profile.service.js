import User from "@/models/User";
import Video from "@/models/Video";
import Note from "@/models/Note";
import LiveSession from "@/models/LiveSession";
import { createNotification } from "@/lib/notify";
import { transferCredits } from "@/lib/credits";

export class ProfileError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getProfile(userId) {
  const user = await User.findById(userId).select("-__v");
  return user;
}

export async function updateProfile(userId, data) {
  const { name, bio, skills } = data;

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(skills && { skills }),
    },
    { new: true }
  ).select("-__v");

  return updated;
}

export async function getPublicProfile(uid, requesterId) {
  const user = await User.findOne({ firebaseUid: uid })
    .select("-__v")
    .lean();
  
  if (!user) {
    throw new ProfileError("User not found", 404);
  }

  const [videos, notes, sessions] = await Promise.all([
    Video.find({ uploader: user._id }).sort({ createdAt: -1 }).limit(6),
    Note.find({ uploader: user._id }).sort({ createdAt: -1 }).limit(6),
    LiveSession.find({ teacher: user._id }).sort({ date: -1 }).limit(3),
  ]);

  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const totalDownloads = notes.reduce((s, n) => s + n.downloads, 0);

  let isFollowing = false;
  if (requesterId) {
    const requester = await User.findById(requesterId).select("following");
    isFollowing = requester?.following.map(String).includes(user._id.toString());
  }

  return {
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
  };
}

export async function followUser(uid, currentUser) {
  const target = await User.findOne({ firebaseUid: uid });
  if (!target) {
    throw new ProfileError("User not found", 404);
  }

  if (target._id.toString() === currentUser._id.toString()) {
    throw new ProfileError("Cannot follow yourself", 400);
  }

  const isFollowing = currentUser.following.map(String).includes(target._id.toString());

  if (isFollowing) {
    await Promise.all([
      User.findByIdAndUpdate(currentUser._id, { $pull: { following: target._id } }),
      User.findByIdAndUpdate(target._id, { $pull: { followers: currentUser._id } }),
    ]);
  } else {
    await Promise.all([
      User.findByIdAndUpdate(currentUser._id, { $addToSet: { following: target._id } }),
      User.findByIdAndUpdate(target._id, { $addToSet: { followers: currentUser._id } }),
    ]);
    // Notify target
    await createNotification({
      recipient: target._id,
      sender: currentUser._id,
      type: "follow",
      message: `${currentUser.name} started following you`,
    });
  }

  // Re-fetch updated target to get accurate follower count from DB
  const updated = await User.findById(target._id).select("followers").lean();
  const followersCount = updated?.followers?.length ?? 0;

  return {
    following: !isFollowing,
    followersCount,
  };
}

export async function tipUser(uid, currentUser, amount) {
  const target = await User.findOne({ firebaseUid: uid }).select("_id name");
  if (!target) {
    throw new ProfileError("User not found", 404);
  }

  const result = await transferCredits({
    fromUserId: currentUser._id,
    toUserId: target._id,
    amount,
    fromReason: "tip_sent",
    toReason: "tip_received",
    fromDescription: `You tipped ${target.name} ${amount} credits`,
    toDescription: `${currentUser.name} tipped you ${amount} credits`,
  });

  if (!result.success) {
    throw new ProfileError(result.error, 400);
  }

  // Notify recipient
  await createNotification({
    recipient: target._id,
    sender: currentUser._id,
    type: "credit",
    message: `${currentUser.name} tipped you ${amount} credits 🎁`,
  });

  return { message: `Sent ${amount} credits to ${target.name}` };
}
