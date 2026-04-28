import Video from "@/models/Video";

export async function getBookmarks(userId) {
  const videos = await Video.find({ bookmarks: userId })
    .sort({ createdAt: -1 })
    .populate("uploader", "name image firebaseUid");

  return videos;
}
