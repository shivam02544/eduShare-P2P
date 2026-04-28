import LiveSession from "@/models/LiveSession";

export class LiveSessionError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getLiveSessions(userId) {
  const now = new Date();
  const sessions = await LiveSession.find({ date: { $gte: now } })
    .sort({ date: 1 })
    .populate("teacher", "name image firebaseUid")
    .lean();

  const mongoUserId = userId ? userId.toString() : null;

  return sessions.map((s) => ({
    ...s,
    isTeacher: mongoUserId ? s.teacher._id.toString() === mongoUserId : false,
    hasJoined: mongoUserId ? s.attendees.map(String).includes(mongoUserId) : false,
    attendeeCount: s.attendees.length,
  }));
}

export async function createLiveSession(teacherId, data) {
  const { title, subject, description, meetingLink, date } = data;

  const session = await LiveSession.create({
    teacher: teacherId,
    title,
    subject,
    description: description || "",
    meetingLink,
    date: new Date(date),
  });

  return session;
}

export async function deleteLiveSession(sessionId, user) {
  const session = await LiveSession.findById(sessionId);

  if (!session) {
    throw new LiveSessionError("Session not found", 404);
  }

  // Only the teacher can delete
  if (session.teacher.toString() !== user._id.toString()) {
    throw new LiveSessionError("Unauthorized", 403);
  }

  await LiveSession.findByIdAndDelete(sessionId);

  return { message: "Session deleted successfully" };
}

export async function joinLiveSession(sessionId, user) {
  const session = await LiveSession.findById(sessionId);
  if (!session) {
    throw new LiveSessionError("Session not found", 404);
  }

  const userId = user._id.toString();

  if (session.teacher.toString() === userId) {
    return { message: "You are the teacher" };
  }

  if (session.attendees.map(String).includes(userId)) {
    return { message: "Already joined" };
  }

  session.attendees.push(user._id);
  await session.save();

  const { awardCredits } = await import("@/lib/credits");
  await awardCredits({
    userId: session.teacher,
    amount: 10,
    reason: "live_join",
    session: session._id,
    description: `${user.name} joined your session "${session.title}"`,
  });

  return { message: "Joined session, +10 credits to teacher" };
}
