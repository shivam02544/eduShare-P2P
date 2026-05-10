import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getQuiz, saveQuiz, deleteQuiz, QuizError } from "@/services/quiz.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * GET /api/videos/[id]/quiz
 * Public — returns quiz WITHOUT correctIndex (safe for client).
 * Also returns whether the current user has already attempted.
 */
export const GET = apiHandler(async (ctx) => {
  const { user, params } = ctx;
  const mongoUserId = user?._id || null;
  const result = await getQuiz(params.id, mongoUserId);
  return NextResponse.json(result);
}, { isProtected: false });

const postQuizSchema = z.object({
  title: z.string().min(1).max(200),
  topic: z.string().max(100).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  questions: z.array(z.any()),
  passingScore: z.number().optional().default(70),
  isPublished: z.boolean().optional().default(false),
});

/**
 * POST /api/videos/[id]/quiz
 * Create or replace quiz — uploader only.
 */
export const POST = apiHandler(async (ctx) => {
  const { user, params, body } = ctx;

  try {
    const result = await saveQuiz(params.id, user._id, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof QuizError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: postQuizSchema });


/**
 * DELETE /api/videos/[id]/quiz
 * Delete quiz — uploader only.
 */
export const DELETE = apiHandler(async (ctx) => {
  const { user, params } = ctx;

  try {
    const result = await deleteQuiz(params.id, user._id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof QuizError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true });
