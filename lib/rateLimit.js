/**
 * In-memory sliding window rate limiter.
 *
 * Why in-memory instead of Redis?
 * - No extra infrastructure needed for a single EC2 instance
 * - Fast (no network hop)
 * - Sufficient for a single-server deployment
 *
 * Trade-off: resets on server restart, doesn't share state across
 * multiple instances. For multi-instance deployments, swap the
 * `store` Map for a Redis client.
 *
 * Algorithm: Sliding window counter
 * - Each key maps to an array of timestamps
 * - On each request, prune timestamps older than `windowMs`
 * - If remaining count > 0, allow. Otherwise, block.
 */

// Map<key, timestamp[]>
const store = new Map();

// Cleanup stale keys every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of store.entries()) {
    // Remove keys with no recent activity (older than 1 hour)
    if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > 3_600_000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check and consume a rate limit token.
 *
 * @param {object} options
 * @param {string} options.key       - Unique identifier (e.g. IP, userId, "ip:endpoint")
 * @param {number} options.limit     - Max requests allowed in the window
 * @param {number} options.windowMs  - Window size in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function rateLimit({ key, limit, windowMs }) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create timestamps array for this key
  let timestamps = store.get(key) || [];

  // Prune timestamps outside the current window (sliding window)
  timestamps = timestamps.filter((t) => t > windowStart);

  const remaining = limit - timestamps.length;

  if (remaining <= 0) {
    // Calculate when the oldest request will expire
    const resetIn = timestamps[0] ? timestamps[0] + windowMs - now : windowMs;
    store.set(key, timestamps);
    return { allowed: false, remaining: 0, resetIn };
  }

  // Consume one token
  timestamps.push(now);
  store.set(key, timestamps);

  return { allowed: true, remaining: remaining - 1, resetIn: 0 };
}

/**
 * Extract the real client IP from Next.js request headers.
 * Handles proxies (Nginx, Cloudflare, etc.)
 */
export function getClientIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Build a rate limit key combining IP + optional user ID.
 * Using both prevents IP spoofing AND account sharing abuse.
 */
export function buildKey(ip, suffix) {
  return `${ip}:${suffix}`;
}

/**
 * Standard rate limit response.
 */
export function rateLimitResponse(resetIn) {
  const seconds = Math.ceil(resetIn / 1000);
  return new Response(
    JSON.stringify({ error: `Too many requests. Try again in ${seconds}s.` }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(seconds),
        "X-RateLimit-Limit": "0",
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
