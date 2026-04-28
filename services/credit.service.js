import Transaction from "@/models/Transaction";

export async function getCreditsHistory(userId, page) {
  const limit = 20;

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("video", "title")
      .populate("note", "title")
      .populate("session", "title"),
    Transaction.countDocuments({ user: userId }),
  ]);

  // Running balance summary
  const earned = await Transaction.aggregate([
    { $match: { user: userId, amount: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    transactions,
    total,
    pages: Math.ceil(total / limit),
    page,
    totalEarned: earned[0]?.total || 0,
  };
}
