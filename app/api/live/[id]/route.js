import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import LiveSession from "@/models/LiveSession";

export const dynamic = "force-dynamic";

// DELETE /api/live/[id]
export const DELETE = apiHandler(async (ctx) => {
  const { params, user } = ctx;
  const session = await LiveSession.findById(params.id);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Only the teacher can delete
  if (session.teacher.toString() !== user._id.toString()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await LiveSession.findByIdAndDelete(params.id);

  return NextResponse.json({ message: "Session deleted successfully" });
}, { isProtected: true });
