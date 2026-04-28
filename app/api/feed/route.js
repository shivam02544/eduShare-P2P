import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getFeed } from "@/services/feed.service";

export const dynamic = "force-dynamic";

// GET /api/feed — activity from people you follow
export const GET = apiHandler(async (ctx) => {
  const { user } = ctx;
  const result = await getFeed(user._id);
  return NextResponse.json(result);
}, { isProtected: true });
