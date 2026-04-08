import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const sessions = await LiveSession.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .populate("teacher", "name image")
    .populate("attendees", "name image");
  return NextResponse.json(sessions);
}

export async function POST(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, subject, date } = await req.json();
    if (!title || !subject || !date)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime()) || sessionDate <= new Date())
      return NextResponse.json({ error: "Session date must be in the future" }, { status: 400 });

    await connectDB();
    const session = await LiveSession.create({
      title, subject,
      date: new Date(date),
      teacher: auth.mongoUser._id,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
