import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "like"), limit: 60, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const note = await Note.findById(params.id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = auth.mongoUser._id.toString();
  const liked = note.likes.map(String).includes(userId);

  if (liked) note.likes = note.likes.filter((l) => l.toString() !== userId);
  else note.likes.push(auth.mongoUser._id);

  await note.save();
  return NextResponse.json({ likes: note.likes.length, liked: !liked });
}
