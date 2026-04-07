import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import Note from "@/models/Note";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const BOOST_COST = 20;       // credits per boost
const BOOST_HOURS = 24;      // hours of boost

/**
 * POST /api/boost
 * Spend 20 credits to boost a video or note to top of Explore for 24h.
 * Body: { type: "video"|"note", id: string }
 */
export async function POST(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, id } = await req.json();
  if (!["video", "note"].includes(type))
    return NextResponse.json({ error: "type must be video or note" }, { status: 400 });

  await connectDB();

  const Model = type === "video" ? Video : Note;
  const content = await Model.findById(id).select("uploader title boostedUntil");
  if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });

  // Only owner can boost their own content
  if (content.uploader.toString() !== auth.mongoUser._id.toString())
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
    const user = await User.findById(auth.mongoUser._id).session(dbSession);
    if (user.credits < BOOST_COST) {
      await dbSession.abortTransaction();
      return NextResponse.json({ error: `Need ${BOOST_COST} credits to boost (you have ${user.credits})` }, { status: 400 });
    }

    const boostedUntil = new Date(Date.now() + BOOST_HOURS * 60 * 60 * 1000);

    await User.findByIdAndUpdate(
      auth.mongoUser._id,
      { $inc: { credits: -BOOST_COST } },
      { session: dbSession }
    );

    await Model.findByIdAndUpdate(id, { boostedUntil }, { session: dbSession });

    await Transaction.create([{
      user: auth.mongoUser._id,
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
    return NextResponse.json({ error: "Boost failed" }, { status: 500 });
  } finally {
    dbSession.endSession();
  }
}
