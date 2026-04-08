import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Video from "@/models/Video";
import Note from "@/models/Note";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BOOST_COST = 20;
const BOOST_HOURS = 24;

const boostSchema = z.object({
  type: z.enum(["video", "note"], { required_error: "Type must be video or note" }),
  id: z.string().min(1, "ID is required"),
});

/**
 * POST /api/boost
 * Spend 20 credits to boost a video or note to top of Explore for 24h.
 */
export const POST = apiHandler(async (ctx) => {
  const { req, user: me, body } = ctx;
  const { type, id } = body; // Already validated by Zod

  // 5 boosts per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "boost"), limit: 5, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const Model = type === "video" ? Video : Note;
  const content = await Model.findById(id).select("uploader title boostedUntil");
  if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });

  // Only owner can boost their own content
  if (content.uploader.toString() !== me._id.toString())
    return NextResponse.json({ error: "You can only boost your own content" }, { status: 403 });

  // Check if already boosted
  if (content.boostedUntil && content.boostedUntil > new Date())
    return NextResponse.json({
      error: `Already boosted until ${content.boostedUntil.toLocaleTimeString()}`,
    }, { status: 409 });

  // Atomic: deduct credits + set boost
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const dbUser = await User.findById(me._id).session(dbSession);
    if (dbUser.credits < BOOST_COST) {
      await dbSession.abortTransaction();
      return NextResponse.json({ error: `Need ${BOOST_COST} credits to boost (you have ${dbUser.credits})` }, { status: 400 });
    }

    const boostedUntil = new Date(Date.now() + BOOST_HOURS * 60 * 60 * 1000);

    await User.findByIdAndUpdate(
      me._id,
      { $inc: { credits: -BOOST_COST } },
      { session: dbSession }
    );

    await Model.findByIdAndUpdate(id, { boostedUntil }, { session: dbSession });

    await Transaction.create([{
      user: me._id,
      amount: -BOOST_COST,
      reason: type === "video" ? "boost_video" : "boost_note",
      [type]: id,
      description: `Boosted "${content.title}" for 24h`,
    }], { session: dbSession });

    await dbSession.commitTransaction();
    return NextResponse.json({
      message: `Boosted for 24 hours! (-${BOOST_COST} credits)`,
      boostedUntil,
    });
  } catch (err) {
    await dbSession.abortTransaction();
    throw err; // Passed to global apiHandler error handler!
  } finally {
    dbSession.endSession();
  }
}, { isProtected: true, schema: boostSchema });
