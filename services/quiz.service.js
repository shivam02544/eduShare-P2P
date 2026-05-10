import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import Certificate from "@/models/Certificate";
import Video from "@/models/Video";
import User from "@/models/User";
import { awardCredits } from "@/lib/credits";
import { createNotification } from "@/lib/notify";
import { generateCompletion } from "@/lib/ai/groq";

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
  const safeQuestions = quiz.questions.map(({ _id, question, options, explanation }) => ({
    _id,
    question,
    options,
    explanation, // We can send explanations if we want students to see them after the quiz
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
    title: quiz.title,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
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

export async function saveQuiz(videoId, uploaderId, { questions, title, topic, difficulty, passingScore = 70, isPublished = false, generatedByAI = false }) {
  // Verify ownership if videoId is provided
  if (videoId) {
    const video = await Video.findById(videoId).select("uploader");
    if (!video) throw new QuizError("Video not found", 404);
    if (video.uploader.toString() !== uploaderId.toString()) {
      throw new QuizError("Forbidden", 403);
    }
  }

  // Validate
  if (!title?.trim()) throw new QuizError("Quiz title is required", 400);
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 20)
    throw new QuizError("Quiz must have 1–20 questions", 400);

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

  const query = videoId ? { video: videoId } : { title, uploader: uploaderId };
  
  const quiz = await Quiz.findOneAndUpdate(
    query,
    { 
      video: videoId, 
      uploader: uploaderId, 
      title, 
      topic, 
      difficulty, 
      questions, 
      passingScore, 
      isPublished,
      generatedByAI
    },
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
    explanation: q.explanation,
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

  // ── Adaptive Learning Integration ──
  // We run this asynchronously to not block the response
  import("@/services/analytics.service").then(async (analytics) => {
    try {
      await Promise.all([
        analytics.updateTopicMastery(userId, quiz._id, results),
        analytics.updateLearningStreak(userId)
      ]);
    } catch (err) {
      console.warn("[adaptive-learning] Failed to update analytics:", err.message);
    }
  });

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
You are a senior educational AI specialized in creating high-quality, professional Multiple Choice Questions (MCQs).
Your task is to generate a quiz based on the provided context.

CRITICAL RULES:
1. Output ONLY a JSON object. No markdown, no conversational text.
2. The JSON must follow this exact structure:
{
  "title": "A concise, engaging title for the quiz",
  "topic": "The main subject area",
  "questions": [
    {
      "question": "Clear and pedagogical question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "A brief explanation of why this answer is correct and why others are wrong."
    }
  ]
}
3. Generate exactly the number of questions requested.
4. Ensure options are distinct and plausible (no obvious "joke" answers).
5. Difficulty should be balanced according to the requested level (easy, medium, hard).
6. Explanations should be educational and concise.
`;

/**
 * Generate a quiz using Groq AI
 * @param {Object} options - Generation options
 */
export async function generateAiQuiz({
  videoId,
  firebaseUid,
  source = "description",
  customContent = "",
  difficulty = "medium",
  questionCount = 5,
  topic = ""
}) {
  let uploaderMongoId;
  let videoContext = "";

  if (videoId) {
    const video = await Video.findById(videoId).populate("uploader");
    if (!video) throw new QuizError("Video not found", 404);
    if (video.uploader?.firebaseUid !== firebaseUid) {
      throw new QuizError("Forbidden: Not the uploader", 403);
    }
    uploaderMongoId = video.uploader._id;
    videoContext = `Video Title: ${video.title}\nVideo Description: ${video.description}\n`;
  }

  const userPrompt = `
Context Source: ${source}
Topic Preference: ${topic || "Determine from content"}
Difficulty Level: ${difficulty}
Number of Questions: ${questionCount}

Content to analyze:
${videoContext}
${customContent}

Please generate a high-quality MCQ quiz in JSON format as specified in the system prompt.
`;

  try {
    const quizData = await generateCompletion({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      json: true,
      temperature: 0.3
    });

    if (!quizData || !Array.isArray(quizData.questions)) {
      throw new Error("AI returned an invalid quiz structure.");
    }

    // Basic validation/sanitization of AI output
    const sanitizedQuestions = quizData.questions.slice(0, questionCount).map(q => ({
      question: q.question?.trim() || "Untitled Question",
      options: Array.isArray(q.options) && q.options.length === 4 
        ? q.options.map(o => o.trim()) 
        : ["A", "B", "C", "D"],
      correctIndex: typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex <= 3 
        ? q.correctIndex 
        : 0,
      explanation: q.explanation?.trim() || ""
    }));

    return {
      title: quizData.title?.trim() || "AI Generated Quiz",
      topic: quizData.topic?.trim() || topic || "General",
      difficulty,
      questions: sanitizedQuestions
    };
  } catch (err) {
    console.error("AI Quiz Generator Error:", err);
    throw new QuizError(err.message || "Failed to generate AI quiz.", 500);
  }
}

