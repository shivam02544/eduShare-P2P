import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import LiveSession from "@/models/LiveSession";
import { z } from "zod";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { user } = ctx;
  const sessions = await LiveSession.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .populate("teacher", "name image firebaseUid")
    .populate("attendees", "name image firebaseUid");

  const myId = user?._id?.toString();

  const result = sessions.map((s) => {
    const obj = s.toObject();
    const isTeacher = myId && s.teacher?._id?.toString() === myId;
    const isAttendee = myId && s.attendees?.some(a => a._id?.toString() === myId);

    // Secure the link
    if (!isTeacher && !isAttendee) {
      delete obj.meetingLink;
    }

    return obj;
  });

  return NextResponse.json(result);
}, { isProtected: false });

const liveSessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().max(500, "Description too long").optional(),
  meetingLink: z.string().url("Must be a valid URL (e.g., https://zoom.us/...)"),
  date: z.string().refine((val) => {
    const sessionDate = new Date(val);
    const now = new Date();
    // Allow a 5-minute buffer to account for clock skew and form submission time
    return !isNaN(sessionDate.getTime()) && sessionDate > new Date(now.getTime() - 5 * 60 * 1000);
  }, {
    message: "Session date must be in the future (or starting very soon)",
  }),
});

export const POST = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;
  const { title, subject, date, meetingLink, description } = body;

  const session = await LiveSession.create({
    title,
    subject,
    description: description || "",
    date: new Date(date),
    teacher: me._id,
    meetingLink,
  });

  return NextResponse.json(session, { status: 201 });
}, { isProtected: true, schema: liveSessionSchema });
