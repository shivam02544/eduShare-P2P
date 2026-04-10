import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";

export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // verifyAuth already returns the mongoUser with dynamic role elevation applied.
  return NextResponse.json(auth.mongoUser);
}
