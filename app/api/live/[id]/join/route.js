import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { joinLiveSession, LiveSessionError } from "@/services/live.service";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async (ctx) => {
  const { params, user } = ctx;
  try {
    const result = await joinLiveSession(params.id, user);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof LiveSessionError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
