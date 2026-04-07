import User from "@/models/User";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

/**
 * Award credits to a user and log the transaction.
 */
export async function awardCredits({ userId, amount, reason, video, note, session, description }) {
  try {
    await User.findByIdAndUpdate(userId, { $inc: { credits: amount } });
    await Transaction.create({ user: userId, amount, reason, video, note, session, description });
  } catch (err) {
    console.error("[credits] Failed to award:", err.message);
  }
}

/**
 * Atomically transfer credits from one user to another.
 * Uses a MongoDB session to ensure both operations succeed or both fail.
 * @returns {{ success: boolean, error?: string }}
 */
export async function transferCredits({
  fromUserId,
  toUserId,
  amount,
  fromReason,
  toReason,
  video,
  note,
  fromDescription,
  toDescription,
}) {
  if (amount <= 0) return { success: false, error: "Amount must be positive" };
  if (fromUserId.toString() === toUserId.toString())
    return { success: false, error: "Cannot transfer to yourself" };

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    // Check balance inside transaction
    const sender = await User.findById(fromUserId).session(dbSession);
    if (!sender || sender.credits < amount) {
      await dbSession.abortTransaction();
      return { success: false, error: "Insufficient credits" };
    }

    // Deduct from sender
    await User.findByIdAndUpdate(
      fromUserId,
      { $inc: { credits: -amount } },
      { session: dbSession }
    );

    // Add to receiver
    await User.findByIdAndUpdate(
      toUserId,
      { $inc: { credits: amount } },
      { session: dbSession }
    );

    // Log both sides
    await Transaction.create(
      [
        { user: fromUserId, amount: -amount, reason: fromReason, video, note, description: fromDescription },
        { user: toUserId, amount, reason: toReason, video, note, description: toDescription },
      ],
      { session: dbSession }
    );

    await dbSession.commitTransaction();
    return { success: true };
  } catch (err) {
    await dbSession.abortTransaction();
    console.error("[credits] Transfer failed:", err.message);
    return { success: false, error: "Transfer failed" };
  } finally {
    dbSession.endSession();
  }
}
