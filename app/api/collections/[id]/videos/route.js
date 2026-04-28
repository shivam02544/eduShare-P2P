import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { addVideoToCollection, removeVideoFromCollection, CollectionError } from "@/services/collection.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const videoSchema = z.object({
  videoId: z.string().min(1, "videoId required"),
});

// POST /api/collections/[id]/videos — add a video
export const POST = apiHandler(async (ctx) => {
  try {
    const { videoId } = ctx.body;
    const result = await addVideoToCollection(ctx.params.id, ctx.user._id, videoId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CollectionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: videoSchema });

// DELETE /api/collections/[id]/videos — remove a video
export const DELETE = apiHandler(async (ctx) => {
  try {
    const { videoId } = ctx.body;
    const result = await removeVideoFromCollection(ctx.params.id, ctx.user._id, videoId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CollectionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: videoSchema });
