import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { downloadNote, NoteError } from "@/services/note.service";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async (ctx) => {
  const { params, user } = ctx;

  try {
    const result = await downloadNote(params.id, user);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NoteError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
