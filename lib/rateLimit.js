import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

/**
 * Rate Limiting Module
 * 
 * Production mode: Uses @upstash/ratelimit and @upstash/redis for distributed 
 * sliding window rate limiting across multiple serverless/edge instances.
 * 
 * Development/Fallback mode: Uses an in-memory map. Suitable for single-instance
 * environments or local development.
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const disableRedis = process.env.DISABLE_REDIS_RATELIMIT === 'true';

let redis = null;

if (!disableRedis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    // Add a short timeout to prevent API hangs on network issues
    timeout: 1000, 
  });
}

// Cache for Upstash Ratelimit instances (keyed by limit + windowMs)
const upstashLimiters = new Map();

// In-memory fallback map: Map<key, timestamp[]>
const store = new Map();

// Cleanup stale keys every 5 minutes to prevent memory leak in fallback mode
if (!redis) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > 3_600_000) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check and consume a rate limit token.
 *
 * @param {object} options
 * @param {string} options.key       - Unique identifier (e.g. IP, userId, "ip:endpoint")
 * @param {number} options.limit     - Max requests allowed in the window
 * @param {number} options.windowMs  - Window size in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export async function rateLimit({ key, limit, windowMs }) {
  if (redis) {
    const cacheKey = `${limit}:${windowMs}`;
    let limiter = upstashLimiters.get(cacheKey);
    
    if (!limiter) {
      // windowMs is in ms, Upstash expects format like "10 s"
      const seconds = Math.max(1, Math.floor(windowMs / 1000));
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
        // Disable analytics in development to reduce background network noise
        analytics: !isDevelopment,
      });
      upstashLimiters.set(cacheKey, limiter);
    }

    try {
      const { success, pending, limit: _limit, remaining, reset } = await limiter.limit(key);
      return {
        allowed: success,
        remaining: remaining,
        resetIn: Math.max(0, reset - Date.now()),
      };
    } catch (error) {
      // Catch connection errors and log a short message instead of a full stack trace
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.message.includes('fetch failed')) {
        console.warn(`[RateLimit] Redis unreachable (${error.code || 'Timeout'}), using in-memory fallback.`);
      } else {
        console.error("[RateLimit] Unexpected Redis error:", error);
      }
      // Fail open if Redis is down
      return { allowed: true, remaining: 1, resetIn: 0 };
    }
  }

  // Fallback in-memory logic
  const now = Date.now();
  const windowStart = now - windowMs;

  let timestamps = store.get(key) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  const remaining = limit - timestamps.length;

  if (remaining <= 0) {
    const resetIn = timestamps[0] ? timestamps[0] + windowMs - now : windowMs;
    store.set(key, timestamps);
    return { allowed: false, remaining: 0, resetIn };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return { allowed: true, remaining: remaining - 1, resetIn: 0 };
}

/**
 * Extract the real client IP from Next.js request headers.
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
