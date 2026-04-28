import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import Certificate from "@/models/Certificate";
import Video from "@/models/Video";
import User from "@/models/User";
import { awardCredits } from "@/lib/credits";
import { createNotification } from "@/lib/notify";

export class QuizError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getQuiz(videoId, mongoUserId) {
  const quiz = await Quiz.findOne({ video: videoId, isPublished: true }).lean();
  if (!quiz) return { exists: false };

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

  return {
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
  };
}

export async function saveQuiz(videoId, uploaderId, questions, passingScore = 70, isPublished = false) {
  // Verify ownership
  const video = await Video.findById(videoId).select("uploader");
  if (!video) throw new QuizError("Video not found", 404);
  if (video.uploader.toString() !== uploaderId.toString()) {
    throw new QuizError("Forbidden", 403);
  }

  // Validate
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 10)
    throw new QuizError("Quiz must have 1–10 questions", 400);

  for (const q of questions) {
    if (!q.question?.trim())
      throw new QuizError("Each question must have text", 400);
    if (!Array.isArray(q.options) || q.options.length !== 4)
      throw new QuizError("Each question needs exactly 4 options", 400);
    if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3)
      throw new QuizError("correctIndex must be 0–3", 400);
    if (q.options.some((o) => !o?.trim()))
      throw new QuizError("All options must be non-empty", 400);
  }

  const quiz = await Quiz.findOneAndUpdate(
    { video: videoId },
    { video: videoId, uploader: uploaderId, questions, passingScore, isPublished },
    { upsert: true, new: true, runValidators: true }
  );

  return { message: "Quiz saved", quizId: quiz._id, isPublished };
}

export async function deleteQuiz(videoId, uploaderId) {
  const quiz = await Quiz.findOne({ video: videoId });
  if (!quiz) throw new QuizError("No quiz found", 404);
  if (quiz.uploader.toString() !== uploaderId.toString()) {
    throw new QuizError("Forbidden", 403);
  }

  await quiz.deleteOne();
  return { message: "Quiz deleted" };
}

export async function attemptQuiz(userId, userName, videoId, answers) {
  const quiz = await Quiz.findOne({ video: videoId, isPublished: true });
  if (!quiz) {
    throw new QuizError("No quiz available", 404);
  }

  // Prevent uploader from taking their own quiz
  if (quiz.uploader.toString() === userId.toString()) {
    throw new QuizError("You cannot attempt your own quiz", 400);
  }

  // Idempotency — check existing attempt
  const existing = await QuizAttempt.findOne({
    quiz: quiz._id,
    user: userId,
  });
  
  if (existing) {
    throw new QuizError("Already attempted", 409);
  }

  // Validate answer array
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    throw new QuizError("Answer count mismatch", 400);
  }

  if (answers.some((a) => typeof a !== "number" || a < 0 || a > 3)) {
    throw new QuizError("Invalid answer values", 400);
  }

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
        userId: userId,
        amount: viewerCredits,
        reason: "quiz_pass",
        video: videoId,
        description: `Passed quiz with ${score}%`,
      }),
      awardCredits({
        userId: quiz.uploader,
        amount: uploaderCredits,
        reason: "quiz_completion",
        video: videoId,
        description: `Student passed your quiz`,
      }),
      createNotification({
        recipient: quiz.uploader,
        sender: userId,
        type: "quiz_pass",
        video: videoId,
        message: `${userName} passed your quiz with ${score}%`,
      }),
    ]);
  }

  // ── Record attempt (unique index prevents duplicates) ──
  try {
    await QuizAttempt.create({
      quiz: quiz._id,
      video: videoId,
      user: userId,
      answers,
      score,
      passed,
      creditsAwarded: viewerCredits,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new QuizError("Already attempted", 409);
    }
    throw err;
  }

  // ── Issue certificate if passed ──
  let certificate = null;
  if (passed) {
    try {
      const [video, uploader] = await Promise.all([
        Video.findById(videoId).select("title uploader"),
        User.findById(quiz.uploader).select("name"),
      ]);
      certificate = await Certificate.create({
        recipient: userId,
        recipientName: userName,
        video: videoId,
        videoTitle: video?.title || "Unknown",
        issuerName: uploader?.name || "EduShare",
        score,
      });
    } catch (err) {
      // Don't fail the attempt if certificate creation fails (e.g. duplicate)
      console.warn("[certificate] Could not issue:", err.message);
    }
  }

  return {
    score,
    passed,
    correctCount,
    totalQuestions: quiz.questions.length,
    passingScore: quiz.passingScore,
    creditsAwarded: viewerCredits,
    results,
    certificate: certificate ? { certId: certificate.certId, _id: certificate._id } : null,
  };
}

const SYSTEM_PROMPT = `
You are an expert educational AI. 
Your task is to generate a multiple-choice quiz based on the provided video's Title and Description.
You MUST output ONLY a pure JSON array containing up to 10 question objects.
Do NOT enclose the JSON in markdown formatting blocks or provide any extra text.

Data Structure for each object must be EXACLTY:
{
  "question": "The question text here",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "correctIndex": 0 // 0-based integer matching the correct option
}
`;

export async function generateAiQuiz(videoId, firebaseUid, source = "description", customNotes = "") {
  const video = await Video.findById(videoId).populate("uploader");
  if (!video) throw new QuizError("Video not found", 404);

  if (video.uploader?.firebaseUid !== firebaseUid) {
    throw new QuizError("Forbidden: Not the uploader", 403);
  }

  const host = process.env.DATABRICKS_HOST;
  const token = process.env.DATABRICKS_TOKEN;
  const endpoint = process.env.DATABRICKS_ENDPOINT || "databricks-meta-llama-3-70b-instruct";

  if (!host || !token) {
    throw new QuizError("AI Services temporarily unavailable: Configure Databricks Host and Token in environment variables.", 500);
  }

  let AI_Context = "";
  if (source === "notes" && customNotes.trim().length > 0) {
    AI_Context = `Source Material (Instructor Notes):\n${customNotes}`;
  } else {
    AI_Context = `Title: ${video.title}\nDescription: ${video.description}`;
  }

  const prompt = `Context:\n${AI_Context}\n\nPlease generate the JSON array of multiple choice questions based specifically on the context provided above. Only rely on general knowledge if the context is insufficient.`;

  try {
    const aiResponse = await fetch(`https://${host.replace("https://", "")}/api/2.0/serving-endpoints/${endpoint}/invocations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.2
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Databricks API Error:", errorText);
      throw new QuizError("Upstream AI execution failed.", 502);
    }

    const aiData = await aiResponse.json();
    let resultText = aiData.choices?.[0]?.message?.content || aiData.predictions?.[0]?.content || "";

    // Cleanup potential markdown blocks if the LLM leaked them
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();

    const questions = JSON.parse(resultText);

    if (!Array.isArray(questions)) {
      throw new Error("AI did not return a valid array");
    }

    return questions;
  } catch (err) {
    console.error("AI Quiz Generator Error:", err);
    if (err instanceof QuizError) throw err;
    throw new QuizError("Failed to parse AI output into strict Quiz schema.", 500);
  }
}
