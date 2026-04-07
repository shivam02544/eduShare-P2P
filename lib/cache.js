/**
 * Simple in-memory cache for client-side data.
 * Prevents re-fetching when switching tabs/pages.
 * TTL default: 60 seconds.
 */
const store = new Map();

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key, data, ttlMs = 60_000) {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateCache(key) {
  store.delete(key);
}

export function invalidateAll() {
  store.clear();
}
