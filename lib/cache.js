import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only if env variables are present to avoid crashing local dev
export const redis = (redisUrl && redisToken) 
  ? new Redis({ url: redisUrl, token: redisToken }) 
  : null;

/**
 * Retrieves a parsed JSON object from the Upstash Edge Cache.
 */
export async function getCache(key) {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch (e) {
    return null;
  }
}

/**
 * Commits a JSON payload into the Edge Cache layer with automatic TTL decay.
 * Default ttlSeconds = 300 (5 minutes)
 */
export async function setCache(key, data, ttlSeconds = 300) {
  if (!redis) return null;
  try {
    return await redis.set(key, data, { ex: ttlSeconds });
  } catch (e) {
    return null;
  }
}

/**
 * Manually evict a key from the Edge Cache to enforce instant DB consistency.
 */
export async function invalidateCache(key) {
  if (!redis) return null;
  try {
    return await redis.del(key);
  } catch (e) {
    return null;
  }
}
