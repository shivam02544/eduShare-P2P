import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";

export const dynamic = "force-dynamic";

// GET /api/collections?creatorUid=xxx — list public collections (optionally by creator)
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const creatorUid = searchParams.get("creatorUid");

  let query = { isPublic: true };

  if (creatorUid) {
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ firebaseUid: creatorUid }).select("_id");
    if (!user) return NextResponse.json([]);
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

  return NextResponse.json(result);
}

// POST /api/collections — create a new collection
export async function POST(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, isPublic = true, subject } = await req.json();

  if (!title?.trim())
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  if (title.length > 100)
    return NextResponse.json({ error: "Title too long" }, { status: 400 });

  await connectDB();

  // Limit: max 50 collections per user
  const count = await Collection.countDocuments({ creator: auth.mongoUser._id });
  if (count >= 50)
    return NextResponse.json({ error: "Maximum 50 collections allowed" }, { status: 400 });

  const collection = await Collection.create({
    title: title.trim(),
    description: description?.trim() || "",
    creator: auth.mongoUser._id,
    isPublic,
    subject: subject?.trim() || "",
  });

  return NextResponse.json(collection, { status: 201 });
}
