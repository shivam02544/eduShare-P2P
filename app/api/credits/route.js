import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

// GET /api/credits — paginated transaction history
export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  await connectDB();

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: auth.mongoUser._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("video", "title")
      .populate("note", "title")
      .populate("session", "title"),
    Transaction.countDocuments({ user: auth.mongoUser._id }),
  ]);

  // Running balance summary
  const earned = await Transaction.aggregate([
    { $match: { user: auth.mongoUser._id, amount: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return NextResponse.json({
    transactions,
    total,
    pages: Math.ceil(total / limit),
    page,
    totalEarned: earned[0]?.total || 0,
  });
}
