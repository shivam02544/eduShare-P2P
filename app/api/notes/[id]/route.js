import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";

export const dynamic = "force-dynamic";

// GET /api/notes/[id]
export async function GET(req, { params }) {
  await connectDB();
  const note = await Note.findById(params.id)
    .populate("uploader", "name image firebaseUid credits");
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}
