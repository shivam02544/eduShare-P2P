import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Video from "@/models/Video";
import QuizAttempt from "@/models/QuizAttempt";

export const dynamic = "force-dynamic";

/**
 * GET /api/videos/[id]/quiz
 * Public — returns quiz WITHOUT correctIndex (safe for client).
 * Also returns whether the current user has already attempted.
 */
export async function GET(req, { params }) {
  await connectDB();

  // Check auth (optional — quiz is viewable but attempt state needs auth)
  let mongoUserId = null;
  try {
    const auth = await verifyAuth(req);
    if (auth) mongoUserId = auth.mongoUser._id;
  } catch {}

  const quiz = await Quiz.findOne({ video: params.id, isPublished: true }).lean();
  if (!quiz) return NextResponse.json({ exists: false });

  // Strip correct answers before sending to client
  const safeQuestions = quiz.questions.map(({ _id, question, options }) => ({
    _id,
    question,
    options,
  }));

  // Check if user already attempted
  let attempted = false;
  let attempt = null;
  if (mongoUserId) {
    attempt = await QuizAttempt.findOne({ quiz: quiz._id, user: mongoUserId }).lean();
    attempted = !!attempt;
  }

  return NextResponse.json({
    exists: true,
    _id: quiz._id,
    passingScore: quiz.passingScore,
    questionCount: quiz.questions.length,
    questions: safeQuestions,
    attempted,
    attempt: attempted ? {
      score: attempt.score,
      passed: attempt.passed,
      creditsAwarded: attempt.creditsAwarded,
    } : null,
  });
}

/**
 * POST /api/videos/[id]/quiz
 * Create or replace quiz — uploader only.
 */
export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Verify ownership
  const video = await Video.findById(params.id).select("uploader");
  if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
  if (video.uploader.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { questions, passingScore = 70, isPublished = false } = await req.json();

  // Validate
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 10)
    return NextResponse.json({ error: "Quiz must have 1–10 questions" }, { status: 400 });

  for (const q of questions) {
    if (!q.question?.trim())
      return NextResponse.json({ error: "Each question must have text" }, { status: 400 });
    if (!Array.isArray(q.options) || q.options.length !== 4)
      return NextResponse.json({ error: "Each question needs exactly 4 options" }, { status: 400 });
    if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3)
      return NextResponse.json({ error: "correctIndex must be 0–3" }, { status: 400 });
    if (q.options.some((o) => !o?.trim()))
      return NextResponse.json({ error: "All options must be non-empty" }, { status: 400 });
  }

  const quiz = await Quiz.findOneAndUpdate(
    { video: params.id },
    { video: params.id, uploader: auth.mongoUser._id, questions, passingScore, isPublished },
    { upsert: true, new: true, runValidators: true }
  );

  return NextResponse.json({ message: "Quiz saved", quizId: quiz._id, isPublished });
}

/**
 * DELETE /api/videos/[id]/quiz
 * Delete quiz — uploader only.
 */
export async function DELETE(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const quiz = await Quiz.findOne({ video: params.id });
  if (!quiz) return NextResponse.json({ error: "No quiz found" }, { status: 404 });
  if (quiz.uploader.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await quiz.deleteOne();
  return NextResponse.json({ message: "Quiz deleted" });
}
