import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { deleteLiveSession, LiveSessionError } from "@/services/live.service";

export const dynamic = "force-dynamic";

// DELETE /api/live/[id]
export const DELETE = apiHandler(async (ctx) => {
  const { params, user } = ctx;
  try {
    const result = await deleteLiveSession(params.id, user);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof LiveSessionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
