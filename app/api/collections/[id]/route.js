import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";

export const dynamic = "force-dynamic";

// GET /api/collections/[id] — full collection with populated videos
export async function GET(req, { params }) {
  await connectDB();

  let mongoUserId = null;
  try {
    const auth = await verifyAuth(req);
    if (auth) mongoUserId = auth.mongoUser._id.toString();
  } catch {}

  const collection = await Collection.findById(params.id)
    .populate("creator", "name image firebaseUid")
    .lean();

  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Private collections only visible to creator
  if (!collection.isPublic && collection.creator._id.toString() !== mongoUserId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  return NextResponse.json({
    ...collection,
    videos: orderedVideos,
    videoCount: orderedVideos.length,
    followerCount: collection.followers.length,
    isFollowing,
    isCreator,
  });
}

// PATCH /api/collections/[id] — update title/description/visibility
export async function PATCH(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const collection = await Collection.findById(params.id);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (collection.creator.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, isPublic, subject } = await req.json();

  if (title !== undefined) collection.title = title.trim();
  if (description !== undefined) collection.description = description.trim();
  if (isPublic !== undefined) collection.isPublic = isPublic;
  if (subject !== undefined) collection.subject = subject.trim();

  await collection.save();
  return NextResponse.json(collection);
}

// DELETE /api/collections/[id]
export async function DELETE(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const collection = await Collection.findById(params.id);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (collection.creator.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await collection.deleteOne();
  return NextResponse.json({ message: "Deleted" });
}
