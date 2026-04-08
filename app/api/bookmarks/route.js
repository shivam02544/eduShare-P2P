import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

// GET /api/bookmarks — get all videos bookmarked by current user
export const GET = apiHandler(async (ctx) => {
  const videos = await Video.find({ bookmarks: ctx.user._id })
    .sort({ createdAt: -1 })
    .populate("uploader", "name image firebaseUid");

  return NextResponse.json(videos);
}, { isProtected: true });
