import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { attemptQuiz, QuizError } from "@/services/quiz.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const quizAttemptSchema = z.object({
  answers: z.array(z.number().min(0).max(3))
});

/**
 * POST /api/videos/[id]/quiz/attempt
 * Submit quiz answers. Server grades, awards credits, records attempt.
 */
export const POST = apiHandler(async (ctx) => {
  const { req, user, body, params } = ctx;
  const ip = getClientIp(req);
  
  const rl = rateLimit({ key: buildKey(ip, "quiz-attempt"), limit: 10, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await attemptQuiz(user._id, user.name, params.id, body.answers);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof QuizError) {
      if (err.statusCode === 409) {
        // Find existing attempt details to return
        const existing = await import("@/models/QuizAttempt").then(m => m.default).findOne({
          user: user._id,
          video: params.id // Using video ID here as quiz ID isn't directly available without querying Quiz again, but video + user is unique enough if we have one quiz per video
        });
        
        if (existing) {
          return NextResponse.json({
            error: err.message,
            score: existing.score,
            passed: existing.passed,
            creditsAwarded: existing.creditsAwarded,
          }, { status: err.statusCode });
        }
      }
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: quizAttemptSchema });
