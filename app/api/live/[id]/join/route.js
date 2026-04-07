import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession";
import { awardCredits } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const session = await LiveSession.findById(params.id);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const userId = auth.mongoUser._id.toString();

  if (session.teacher.toString() === userId)
    return NextResponse.json({ message: "You are the teacher" });

  if (session.attendees.map(String).includes(userId))
    return NextResponse.json({ message: "Already joined" });

  session.attendees.push(auth.mongoUser._id);
  await session.save();

  await awardCredits({
    userId: session.teacher,
    amount: 10,
    reason: "live_join",
    session: session._id,
    description: `${auth.mongoUser.name} joined your session "${session.title}"`,
  });

  return NextResponse.json({ message: "Joined session, +10 credits to teacher" });
}
