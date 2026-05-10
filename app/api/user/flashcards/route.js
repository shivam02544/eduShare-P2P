import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { 
  getUserFlashcards, 
  generateFlashcardsFromQuiz, 
  updateFlashcardProgress 
} from "@/services/flashcard.service";
import { z } from "zod";

export const GET = apiHandler(async (ctx) => {
  const { user, searchParams } = ctx;
  const topic = searchParams.get("topic");
  const cards = await getUserFlashcards(user._id, topic);
  return NextResponse.json(cards);
}, { isProtected: true });

export const POST = apiHandler(async (ctx) => {
  const { user, body } = ctx;
  const { quizId } = z.object({ quizId: z.string() }).parse(body);
  
  const cards = await generateFlashcardsFromQuiz(user._id, quizId);
  return NextResponse.json({ 
    message: "Flashcards generated successfully", 
    count: cards.length,
    cards 
  });
}, { isProtected: true });

export const PATCH = apiHandler(async (ctx) => {
  const { body } = ctx;
  const { cardId, wasCorrect } = z.object({ 
    cardId: z.string(), 
    wasCorrect: z.boolean() 
  }).parse(body);

  const updatedCard = await updateFlashcardProgress(cardId, wasCorrect);
  return NextResponse.json(updatedCard);
}, { isProtected: true });
