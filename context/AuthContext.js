"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const AuthContext = createContext(null);

// ── Token cache ────────────────────────────────────────────────────────────────
// Firebase `getIdToken(forceRefresh=true)` is ~400ms. Caching for 50s means
// concurrent API calls within a page share one token fetch instead of N.
const TOKEN_CACHE_TTL = 50_000; // 50 seconds (tokens expire at 60s)
let _cachedToken = null;
let _tokenExpiry = 0;
let _tokenPromise = null; // Deduplicate concurrent refresh calls

async function getValidToken(firebaseUser) {
  if (!firebaseUser) return null;

  const now = Date.now();

  // Return cached token if still valid
  if (_cachedToken && now < _tokenExpiry) return _cachedToken;

  // Deduplicate: if a refresh is already in-flight, await it
  if (_tokenPromise) return _tokenPromise;

  _tokenPromise = getIdToken(firebaseUser, true)
    .then((token) => {
      _cachedToken = token;
      _tokenExpiry = Date.now() + TOKEN_CACHE_TTL;
      _tokenPromise = null;
      return token;
    })
    .catch((err) => {
      _tokenPromise = null;
      throw err;
    });

  return _tokenPromise;
}

function clearTokenCache() {
  _cachedToken = null;
  _tokenExpiry = 0;
  _tokenPromise = null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser) => {
    try {
      const idToken = await getValidToken(firebaseUser);
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      // Non-fatal: profile fetch failure shouldn't block auth
      if (process.env.NODE_ENV === "development") {
        console.warn("[AuthContext] Profile fetch failed:", err.message);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Pre-warm token cache on auth state change
        try { await getValidToken(firebaseUser); } catch {}
        setUser(firebaseUser);
        await fetchProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
        clearTokenCache();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Manually refresh the MongoDB profile (e.g. after credit/skill updates).
   */
  const refreshProfile = async () => {
    if (auth.currentUser) await fetchProfile(auth.currentUser);
  };

  /**
   * Authenticated fetch — uses cached token, avoids per-call Firebase round-trips.
   * Falls back gracefully if user is not authenticated.
   */
  const authFetch = async (url, options = {}) => {
    let idToken = null;

    if (auth.currentUser) {
      try {
        idToken = await getValidToken(auth.currentUser);
      } catch {
        // Token refresh failed — attempt without auth; API will 401
      }
    }

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, authFetch, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
