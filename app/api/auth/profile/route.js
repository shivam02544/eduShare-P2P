import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { user } = ctx;
  // apiHandler already returns the mongoUser with dynamic role elevation applied,
  // attached as `ctx.user`.
  return NextResponse.json(user);
}, { isProtected: true });
