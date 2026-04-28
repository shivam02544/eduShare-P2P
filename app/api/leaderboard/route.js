import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getLeaderboard } from "@/services/leaderboard.service";

export const dynamic = "force-dynamic";

// GET /api/leaderboard — top 20 users by credits
export const GET = apiHandler(async () => {
  const result = await getLeaderboard();
  return NextResponse.json(result);
}, { isProtected: false });
