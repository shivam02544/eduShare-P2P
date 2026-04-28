import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getBookmarks } from "@/services/bookmark.service";

export const dynamic = "force-dynamic";

// GET /api/bookmarks — get all videos bookmarked by current user
export const GET = apiHandler(async (ctx) => {
  const result = await getBookmarks(ctx.user._id);
  return NextResponse.json(result);
}, { isProtected: true });
