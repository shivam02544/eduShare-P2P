import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import Note from "@/models/Note";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/search?q=query
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2)
    return NextResponse.json({ videos: [], notes: [], users: [] });

  await connectDB();
  const regex = new RegExp(q, "i");

  const [videos, notes, users] = await Promise.all([
    Video.find({ $or: [{ title: regex }, { subject: regex }, { description: regex }] })
      .limit(6).populate("uploader", "name image"),
    Note.find({ $or: [{ title: regex }, { subject: regex }] })
      .limit(6).populate("uploader", "name image"),
    User.find({ $or: [{ name: regex }, { skills: regex }] })
      .limit(4).select("name image firebaseUid skills credits"),
  ]);

  return NextResponse.json({ videos, notes, users });
}
