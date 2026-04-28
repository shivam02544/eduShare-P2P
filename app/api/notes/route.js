import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getNotes, createNote } from "@/services/note.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { req, user } = ctx;
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");

  const result = await getNotes(subject, user?._id);
  return NextResponse.json(result);
}, { isProtected: false });

const notePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  subject: z.string().min(1, "Subject is required"),
  fileUrl: z.string().url("Must be a valid URL"),
  isPremium: z.boolean().default(false),
  premiumCost: z.number().min(0).max(100).default(0),
});

export const POST = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;

  const note = await createNote(body, me._id);
  return NextResponse.json(note, { status: 201 });
}, { isProtected: true, schema: notePostSchema });
