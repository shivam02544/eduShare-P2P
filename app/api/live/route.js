import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import LiveSession from "@/models/LiveSession";
import { z } from "zod";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const sessions = await LiveSession.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .populate("teacher", "name image")
    .populate("attendees", "name image");
  return NextResponse.json(sessions);
}, { isProtected: false });

const liveSessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  subject: z.string().min(1, "Subject is required"),
  date: z.string().refine((val) => !isNaN(new Date(val).getTime()) && new Date(val) > new Date(), {
    message: "Session date must be in the future",
  }),
});

export const POST = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;
  const { title, subject, date } = body;

  const session = await LiveSession.create({
    title, 
    subject,
    date: new Date(date),
    teacher: me._id,
  });

  return NextResponse.json(session, { status: 201 });
}, { isProtected: true, schema: liveSessionSchema });
