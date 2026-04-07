import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import { awardCredits } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const note = await Note.findById(params.id);
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  const userId = auth.mongoUser._id.toString();

  if (note.uploader.toString() === userId)
    return NextResponse.json({ fileUrl: note.fileUrl, message: "Self-download, no credits" });

  if (note.downloadedBy.map(String).includes(userId))
    return NextResponse.json({ fileUrl: note.fileUrl, message: "Already downloaded" });

  note.downloads += 1;
  note.downloadedBy.push(auth.mongoUser._id);
  await note.save();

  await awardCredits({
    userId: note.uploader,
    amount: 3,
    reason: "note_download",
    note: note._id,
    description: `Someone downloaded "${note.title}"`,
  });

  return NextResponse.json({ fileUrl: note.fileUrl, message: "+3 credits awarded to uploader" });
}
