import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Standardized Groq Chat Completion wrapper
 * @param {Object} options - Chat options
 * @param {string} options.system - System prompt
 * @param {string} options.prompt - User prompt
 * @param {string} [options.model] - Model to use
 * @param {number} [options.temperature] - Sampling temperature
 * @param {number} [options.max_tokens] - Max tokens to generate
 * @param {boolean} [options.json] - Whether to expect JSON response
 * @returns {Promise<string|Object>} - AI response
 */
export async function generateCompletion({
  system,
  prompt,
  model = "llama-3.3-70b-versatile",
  temperature = 0.2,
  max_tokens = 2048,
  json = false,
}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      model,
      temperature,
      max_tokens,
      response_format: json ? { type: "json_object" } : undefined,
    });

    const content = response.choices[0]?.message?.content;

    if (json) {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse JSON response from Groq:", content);
        throw new Error("Invalid JSON response from AI.");
      }
    }

    return content;
  } catch (error) {
    console.error("Groq API Error:", error);
    if (error.status === 429) {
      throw new Error("AI rate limit exceeded. Please try again in a moment.");
    }
    throw new Error(error.message || "Failed to generate AI response.");
  }
}
