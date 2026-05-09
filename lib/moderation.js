/**
 * Lightweight content moderation utility.
 * 
 * Filters prohibited words and blocks obvious spam patterns.
 * In a larger production app, this would be replaced by an external API (e.g. Perspective API).
 */

const BANNED_WORDS = [
  'spam', 'scam', 'porn', 'offensive-word-1', 'offensive-word-2' // Placeholder words
];

/**
 * Check if text contains prohibited content.
 * @param {string} text 
 * @returns {boolean} - true if clean, false if flagged
 */
export function isContentSafe(text) {
  if (!text) return true;
  
  const lowerText = text.toLowerCase();
  
  // 1. Check for banned words
  for (const word of BANNED_WORDS) {
    if (lowerText.includes(word)) {
      return false;
    }
  }

  // 2. Check for obvious URL spam (allow legitimate links if needed, but block multiple)
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 2) return false;

  return true;
}

/**
 * Sanitize text by replacing bad words with asterisks (Optional)
 */
export function sanitizeText(text) {
  if (!text) return text;
  let sanitized = text;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word, 'gi');
    sanitized = sanitized.replace(regex, '***');
  }
  return sanitized;
}
