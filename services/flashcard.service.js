import { generateCompletion } from "@/lib/ai/groq";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";

const FLASHCARD_PROMPT = `
You are an expert educational content creator. Your task is to generate concise, high-impact flashcards from the provided educational content.
Each flashcard should have:
1. "front": A clear question or term.
2. "back": A concise, accurate explanation or answer.

RULES:
- Focus on key concepts.
- Keep text brief for mobile readability.
- Avoid obvious or trivial facts.
- Output ONLY a JSON array of objects.
`;

/**
 * Generate flashcards from a quiz
 * @param {string} userId 
 * @param {string} quizId 
 */
export async function generateFlashcardsFromQuiz(userId, quizId) {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new Error("Quiz not found");

  // Use the explanations and questions to build context
  const context = quiz.questions.map(q => 
    `Q: ${q.question}\nA: ${q.options[q.correctIndex]}\nExplanation: ${q.explanation}`
  ).join("\n\n");

  const prompt = `Topic: ${quiz.topic}\n\nContent:\n${context}`;

  const cards = await generateCompletion({
    system: FLASHCARD_PROMPT,
    prompt: prompt,
    json: true,
    temperature: 0.3
  });

  if (!Array.isArray(cards)) throw new Error("AI failed to generate cards.");

  // Save to database
  const savedCards = await Flashcard.insertMany(cards.map(c => ({
    user: userId,
    front: c.front,
    back: c.back,
    topic: quiz.topic || "General",
    sourceType: "quiz",
    sourceId: quizId
  })));

  return savedCards;
}

/**
 * Get flashcards for study
 * @param {string} userId 
 * @param {string} topic 
 */
export async function getUserFlashcards(userId, topic = null) {
  const query = { user: userId };
  if (topic) query.topic = topic;

  return await Flashcard.find(query).sort({ nextReview: 1 }).lean();
}

/**
 * Update flashcard mastery (Simple Spaced Repetition)
 * @param {string} cardId 
 * @param {boolean} wasCorrect 
 */
export async function updateFlashcardProgress(cardId, wasCorrect) {
  const card = await Flashcard.findById(cardId);
  if (!card) return;

  if (wasCorrect) {
    card.masteryLevel += 1;
    // Push review date further (1 day, 3 days, 7 days, etc.)
    const intervals = [1, 3, 7, 14, 30];
    const days = intervals[Math.min(card.masteryLevel - 1, intervals.length - 1)];
    card.nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  } else {
    card.masteryLevel = Math.max(0, card.masteryLevel - 1);
    card.nextReview = new Date(); // Review again soon
  }

  await card.save();
  return card;
}
