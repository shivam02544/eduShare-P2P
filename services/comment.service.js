import Comment from "@/models/Comment";
import Video from "@/models/Video";
import { createNotification } from "@/lib/notify";

export class CommentError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getComments(videoId) {
  const comments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 })
    .populate("author", "name image firebaseUid");
  return comments;
}

export async function createComment(videoId, user, text) {
  if (!text?.trim()) {
    throw new CommentError("Comment cannot be empty", 400);
  }
  if (text.length > 1000) {
    throw new CommentError("Too long", 400);
  }

  const comment = await Comment.create({
    video: videoId,
    author: user._id,
    text: text.trim(),
  });

  // Notify video uploader
  const video = await Video.findById(videoId).select("uploader title");
  if (video) {
    await createNotification({
      recipient: video.uploader,
      sender: user._id,
      type: "comment",
      video: video._id,
      message: `${user.name} commented on "${video.title}"`,
    });
  }

  const populated = await comment.populate("author", "name image firebaseUid");
  return populated;
}

export async function deleteComment(commentId, userId) {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new CommentError("Not found", 404);
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new CommentError("Forbidden", 403);
  }

  await comment.deleteOne();
  return { message: "Deleted" };
}

export async function toggleLikeComment(commentId, userId) {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new CommentError("Not found", 404);
  }

  const liked = comment.likes.map(String).includes(userId.toString());

  if (liked) {
    comment.likes = comment.likes.filter((l) => l.toString() !== userId.toString());
  } else {
    comment.likes.push(userId);
  }

  await comment.save();
  return { likes: comment.likes.length, liked: !liked };
}
