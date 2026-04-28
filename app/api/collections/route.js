import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getAllCollections, createCollection, CollectionError } from "@/services/collection.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  creatorUid: z.string().optional(),
});

// GET /api/collections?creatorUid=xxx — list public collections (optionally by creator)
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  const { searchParams } = new URL(req.url);
  
  // Safe type ingestion
  const { creatorUid } = querySchema.parse(Object.fromEntries(searchParams));

  const result = await getAllCollections(creatorUid);
  return NextResponse.json(result);
}, { isProtected: false });

const collectionPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long").trim(),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  subject: z.string().optional(),
});

// POST /api/collections — create a new collection
export const POST = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;

  try {
    const collection = await createCollection(me._id, body);
    return NextResponse.json(collection, { status: 201 });
  } catch (err) {
    if (err instanceof CollectionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: collectionPostSchema });
