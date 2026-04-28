import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { generateAiQuiz, QuizError } from "@/services/quiz.service";

export const dynamic = "force-dynamic";

export const POST = apiHandler(async (ctx) => {
  const { user, params, firebaseUser, body } = ctx;
  const source = body?.source || "description";
  const customNotes = body?.customNotes || "";

  try {
    const questions = await generateAiQuiz(params.id, firebaseUser.uid, source, customNotes);
    return NextResponse.json(questions);
  } catch (err) {
    if (err instanceof QuizError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
