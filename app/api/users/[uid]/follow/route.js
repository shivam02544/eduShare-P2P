import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { createNotification } from "@/lib/notify";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  // 30 follow/unfollow per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "follow"), limit: 30, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const target = await User.findOne({ firebaseUid: params.uid });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const me = auth.mongoUser;
  if (target._id.toString() === me._id.toString())
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const isFollowing = me.following.map(String).includes(target._id.toString());

  if (isFollowing) {
    await User.findByIdAndUpdate(me._id, { $pull: { following: target._id } });
    await User.findByIdAndUpdate(target._id, { $pull: { followers: me._id } });
  } else {
    await User.findByIdAndUpdate(me._id, { $addToSet: { following: target._id } });
    await User.findByIdAndUpdate(target._id, { $addToSet: { followers: me._id } });
    // Notify target
    await createNotification({
      recipient: target._id,
      sender: me._id,
      type: "follow",
      message: `${me.name} started following you`,
    });
  }

  return NextResponse.json({
    following: !isFollowing,
    followersCount: target.followers.length + (isFollowing ? -1 : 1),
  });
}
