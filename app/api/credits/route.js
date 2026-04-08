import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Transaction from "@/models/Transaction";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
});

// GET /api/credits — paginated transaction history
export const GET = apiHandler(async (ctx) => {
  const { req, user: me } = ctx;
  const { searchParams } = new URL(req.url);
  const { page } = querySchema.parse(Object.fromEntries(searchParams));
  const limit = 20;

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: me._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("video", "title")
      .populate("note", "title")
      .populate("session", "title"),
    Transaction.countDocuments({ user: me._id }),
  ]);

  // Running balance summary
  const earned = await Transaction.aggregate([
    { $match: { user: me._id, amount: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return NextResponse.json({
    transactions,
    total,
    pages: Math.ceil(total / limit),
    page,
    totalEarned: earned[0]?.total || 0,
  });
}, { isProtected: true });
