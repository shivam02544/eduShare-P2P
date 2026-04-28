import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { toggleVideoBookmark, VideoError } from "@/services/video.service";

export const dynamic = "force-dynamic";

// POST /api/videos/[id]/bookmark — toggle bookmark
export const POST = apiHandler(async (ctx) => {
  try {
    const result = await toggleVideoBookmark(ctx.params.id, ctx.user._id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof VideoError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
