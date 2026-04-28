import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { toggleFollowCollection, CollectionError } from "@/services/collection.service";

export const dynamic = "force-dynamic";

// POST /api/collections/[id]/follow — toggle follow
export const POST = apiHandler(async (ctx) => {
  try {
    const result = await toggleFollowCollection(ctx.params.id, ctx.user._id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CollectionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
