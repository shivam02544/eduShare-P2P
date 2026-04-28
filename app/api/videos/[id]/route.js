import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getVideoById, VideoError } from "@/services/video.service";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { user, params } = ctx;

  try {
    const result = await getVideoById(params.id, user?._id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof VideoError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: false });
