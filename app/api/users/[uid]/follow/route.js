import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import User from "@/models/User";
import { createNotification } from "@/lib/notify";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
});

export const POST = apiHandler(async (ctx) => {
  const { req, user: me, params } = ctx;
  const { uid } = paramsSchema.parse(params);

  // 30 follow/unfollow per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "follow"), limit: 30, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const target = await User.findOne({ firebaseUid: uid });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (target._id.toString() === me._id.toString())
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const isFollowing = me.following.map(String).includes(target._id.toString());

  if (isFollowing) {
    await Promise.all([
      User.findByIdAndUpdate(me._id, { $pull: { following: target._id } }),
      User.findByIdAndUpdate(target._id, { $pull: { followers: me._id } }),
    ]);
  } else {
    await Promise.all([
      User.findByIdAndUpdate(me._id, { $addToSet: { following: target._id } }),
      User.findByIdAndUpdate(target._id, { $addToSet: { followers: me._id } }),
    ]);
    // Notify target
    await createNotification({
      recipient: target._id,
      sender: me._id,
      type: "follow",
      message: `${me.name} started following you`,
    });
  }

  // Re-fetch updated target to get accurate follower count from DB
  const updated = await User.findById(target._id).select("followers").lean();
  const followersCount = updated?.followers?.length ?? 0;

  return NextResponse.json({
    following: !isFollowing,
    followersCount,
  });
}, { isProtected: true });
