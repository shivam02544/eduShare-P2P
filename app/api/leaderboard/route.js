import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/leaderboard — top 20 users by credits
export async function GET() {
  await connectDB();
  const users = await User.find({})
    .sort({ credits: -1 })
    .limit(20)
    .select("name image firebaseUid credits skills");
  return NextResponse.json(users);
}
