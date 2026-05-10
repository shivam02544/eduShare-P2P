import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { generateAiQuiz, QuizError } from "@/services/quiz.service";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async (ctx) => {
  const { user, params, firebaseUser, body } = ctx;
  const { 
    source = "description", 
    customContent = "", 
    difficulty = "medium", 
    questionCount = 5,
    topic = "" 
  } = body;

  try {
    const quiz = await generateAiQuiz({
      videoId: params.id,
      firebaseUid: firebaseUser.uid,
      source,
      customContent: customContent || body.customNotes, // Backward compatibility
      difficulty,
      questionCount,
      topic
    });
    return NextResponse.json(quiz);
  } catch (err) {
    if (err instanceof QuizError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });

