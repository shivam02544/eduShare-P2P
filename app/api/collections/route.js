import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Collection from "@/models/Collection";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  creatorUid: z.string().optional(),
});

// GET /api/collections?creatorUid=xxx — list public collections (optionally by creator)
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  const { searchParams } = new URL(req.url);
  
  // Safe type ingestion
  const { creatorUid } = querySchema.parse(Object.fromEntries(searchParams));

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
}, { isProtected: false });

const collectionPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long").trim(),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  subject: z.string().optional(),
});

// POST /api/collections — create a new collection
export const POST = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;
  const { title, description, isPublic, subject } = body;

  // Limit: max 50 collections per user
  const count = await Collection.countDocuments({ creator: me._id });
  if (count >= 50)
    return NextResponse.json({ error: "Maximum 50 collections allowed" }, { status: 400 });

  const collection = await Collection.create({
    title,
    description: description?.trim() || "",
    creator: me._id,
    isPublic,
    subject: subject?.trim() || "",
  });

  return NextResponse.json(collection, { status: 201 });
}, { isProtected: true, schema: collectionPostSchema });
