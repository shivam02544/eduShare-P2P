import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";

export const dynamic = "force-dynamic";

// POST /api/collections/[id]/follow — toggle follow
export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const collection = await Collection.findById(params.id);
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = auth.mongoUser._id.toString();
  const isFollowing = collection.followers.map(String).includes(userId);

  if (isFollowing) {
    collection.followers = collection.followers.filter((f) => f.toString() !== userId);
  } else {
    collection.followers.push(auth.mongoUser._id);
  }

  await collection.save();
  return NextResponse.json({
    following: !isFollowing,
    followerCount: collection.followers.length,
  });
}
