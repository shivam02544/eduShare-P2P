import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getNoteById, NoteError } from "@/services/note.service";

export const dynamic = "force-dynamic";

// GET /api/notes/[id]
export const GET = apiHandler(async (ctx) => {
  const { params } = ctx;

  try {
    const note = await getNoteById(params.id);
    return NextResponse.json(note);
  } catch (err) {
    if (err instanceof NoteError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: false });
