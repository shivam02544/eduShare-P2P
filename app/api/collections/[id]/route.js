import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getCollection, updateCollection, deleteCollection, CollectionError } from "@/services/collection.service";

export const dynamic = "force-dynamic";

// GET /api/collections/[id] — full collection with populated videos
export const GET = apiHandler(async (ctx) => {
  const { user, params } = ctx;
  const mongoUserId = user?._id?.toString() || null;

  try {
    const result = await getCollection(params.id, mongoUserId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CollectionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: false });

// PATCH /api/collections/[id] — update title/description/visibility
export const PATCH = apiHandler(async (ctx) => {
  const { user, params, body } = ctx;

  try {
    const result = await updateCollection(params.id, user._id, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CollectionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });

// DELETE /api/collections/[id]
export const DELETE = apiHandler(async (ctx) => {
  const { user, params } = ctx;

  try {
    const result = await deleteCollection(params.id, user._id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CollectionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
