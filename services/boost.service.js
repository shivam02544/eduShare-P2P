import Video from "@/models/Video";
import Note from "@/models/Note";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

const BOOST_COST = 20;
const BOOST_HOURS = 24;

export class BoostError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function applyBoost(userId, type, id) {
  const Model = type === "video" ? Video : Note;
  const content = await Model.findById(id).select("uploader title boostedUntil");
  if (!content) {
    throw new BoostError("Content not found", 404);
  }

  // Only owner can boost their own content
  if (content.uploader.toString() !== userId.toString()) {
    throw new BoostError("You can only boost your own content", 403);
  }

  // Check if already boosted
  if (content.boostedUntil && content.boostedUntil > new Date()) {
    throw new BoostError(`Already boosted until ${content.boostedUntil.toLocaleTimeString()}`, 409);
  }

  // Atomic: deduct credits + set boost
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const dbUser = await User.findById(userId).session(dbSession);
    if (dbUser.credits < BOOST_COST) {
      await dbSession.abortTransaction();
      throw new BoostError(`Need ${BOOST_COST} credits to boost (you have ${dbUser.credits})`, 400);
    }

    const boostedUntil = new Date(Date.now() + BOOST_HOURS * 60 * 60 * 1000);

    await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -BOOST_COST } },
      { session: dbSession }
    );

    await Model.findByIdAndUpdate(id, { boostedUntil }, { session: dbSession });

    await Transaction.create([{
      user: userId,
      amount: -BOOST_COST,
      reason: type === "video" ? "boost_video" : "boost_note",
      [type]: id,
      description: `Boosted "${content.title}" for 24h`,
    }], { session: dbSession });

    await dbSession.commitTransaction();
    return {
      message: `Boosted for 24 hours! (-${BOOST_COST} credits)`,
      boostedUntil,
    };
  } catch (err) {
    await dbSession.abortTransaction();
    throw err;
  } finally {
    dbSession.endSession();
  }
}
