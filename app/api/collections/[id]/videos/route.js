import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";

export const dynamic = "force-dynamic";

// POST /api/collections/[id]/videos — add a video
export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const collection = await Collection.findById(params.id);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (collection.creator.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { videoId } = await req.json();
  if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

  // Prevent duplicates
  const exists = collection.videos.some((v) => v.video.toString() === videoId);
  if (exists) return NextResponse.json({ error: "Video already in collection" }, { status: 409 });

  // Max 100 videos per collection
  if (collection.videos.length >= 100)
    return NextResponse.json({ error: "Collection is full (max 100 videos)" }, { status: 400 });

  const maxPosition = collection.videos.reduce((max, v) => Math.max(max, v.position), -1);
  collection.videos.push({ video: videoId, position: maxPosition + 1 });
  await collection.save();

  return NextResponse.json({ message: "Added", videoCount: collection.videos.length });
}

// DELETE /api/collections/[id]/videos — remove a video
export async function DELETE(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const collection = await Collection.findById(params.id);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (collection.creator.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { videoId } = await req.json();
  collection.videos = collection.videos.filter((v) => v.video.toString() !== videoId);
  await collection.save();

  return NextResponse.json({ message: "Removed", videoCount: collection.videos.length });
}
