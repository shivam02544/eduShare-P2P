import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import Certificate from "@/models/Certificate";
import Video from "@/models/Video";
import User from "@/models/User";
import { awardCredits } from "@/lib/credits";
import { createNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * POST /api/videos/[id]/quiz/attempt
 * Submit quiz answers. Server grades, awards credits, records attempt.
 *
 * Body: { answers: [0, 2, 1, 3, ...] }  — one index per question
 */
export async function POST(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const quiz = await Quiz.findOne({ video: params.id, isPublished: true });
  if (!quiz) return NextResponse.json({ error: "No quiz available" }, { status: 404 });

  // Prevent uploader from taking their own quiz
  if (quiz.uploader.toString() === auth.mongoUser._id.toString())
    return NextResponse.json({ error: "You cannot attempt your own quiz" }, { status: 400 });

  // Idempotency — check existing attempt
  const existing = await QuizAttempt.findOne({
    quiz: quiz._id,
    user: auth.mongoUser._id,
  });
  if (existing) {
    return NextResponse.json({
      error: "Already attempted",
      score: existing.score,
      passed: existing.passed,
      creditsAwarded: existing.creditsAwarded,
    }, { status: 409 });
  }

  const { answers } = await req.json();

  // Validate answer array
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length)
    return NextResponse.json({ error: "Answer count mismatch" }, { status: 400 });

  if (answers.some((a) => typeof a !== "number" || a < 0 || a > 3))
    return NextResponse.json({ error: "Invalid answer values" }, { status: 400 });

  // ── Server-side grading ──
  const results = quiz.questions.map((q, i) => ({
    questionId: q._id,
    question: q.question,
    options: q.options,
    selectedIndex: answers[i],
    correctIndex: q.correctIndex,
    correct: answers[i] === q.correctIndex,
  }));

  const correctCount = results.filter((r) => r.correct).length;
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  // ── Credit awards ──
  let viewerCredits = 0;
  let uploaderCredits = 0;

  if (passed) {
    viewerCredits = 10;
    uploaderCredits = 5;

    await Promise.all([
      awardCredits({
        userId: auth.mongoUser._id,
        amount: viewerCredits,
        reason: "quiz_pass",
        video: params.id,
        description: `Passed quiz with ${score}%`,
      }),
      awardCredits({
        userId: quiz.uploader,
        amount: uploaderCredits,
        reason: "quiz_completion",
        video: params.id,
        description: `Student passed your quiz`,
      }),
      createNotification({
        recipient: quiz.uploader,
        sender: auth.mongoUser._id,
        type: "quiz_pass",
        video: params.id,
        message: `${auth.mongoUser.name} passed your quiz with ${score}%`,
      }),
    ]);
  }

  // ── Record attempt (unique index prevents duplicates) ──
  await QuizAttempt.create({
    quiz: quiz._id,
    video: params.id,
    user: auth.mongoUser._id,
    answers,
    score,
    passed,
    creditsAwarded: viewerCredits,
  });

  // ── Issue certificate if passed ──
  let certificate = null;
  if (passed) {
    try {
      const [video, uploader] = await Promise.all([
        Video.findById(params.id).select("title uploader"),
        User.findById(quiz.uploader).select("name"),
      ]);
      certificate = await Certificate.create({
        recipient: auth.mongoUser._id,
        recipientName: auth.mongoUser.name,
        video: params.id,
        videoTitle: video?.title || "Unknown",
        issuerName: uploader?.name || "EduShare",
        score,
      });
    } catch (err) {
      // Don't fail the attempt if certificate creation fails (e.g. duplicate)
      console.warn("[certificate] Could not issue:", err.message);
    }
  }

  return NextResponse.json({
    score,
    passed,
    correctCount,
    totalQuestions: quiz.questions.length,
    passingScore: quiz.passingScore,
    creditsAwarded: viewerCredits,
    results,
    certificate: certificate ? { certId: certificate.certId, _id: certificate._id } : null,
  });
}
