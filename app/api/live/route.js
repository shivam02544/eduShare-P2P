import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getLiveSessions, createLiveSession } from "@/services/live.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { user } = ctx;
  const result = await getLiveSessions(user?._id);
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
  const session = await createLiveSession(me._id, body);
  return NextResponse.json(session, { status: 201 });
}, { isProtected: true, schema: liveSessionSchema });
