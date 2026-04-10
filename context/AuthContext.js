"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase user object
  const [profile, setProfile] = useState(null); // MongoDB profile object
  const [token, setToken] = useState(null);     // ID token for API calls
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser) => {
    try {
      const idToken = await getIdToken(firebaseUser, true);
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("[AuthContext] Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser);
        setUser(firebaseUser);
        setToken(idToken);
        await fetchProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Helper: manually refresh the MongoDB profile (e.g. after credit updates)
   */
  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchProfile(auth.currentUser);
    }
  };

  /**
   * Helper: make authenticated fetch to our API routes.
   * Always forces a fresh token (forceRefresh=true) to avoid 401s.
   */
  const authFetch = async (url, options = {}) => {
    let idToken = null;

    if (auth.currentUser) {
      idToken = await getIdToken(auth.currentUser, true);
    }

    if (!idToken) {
      console.warn("[authFetch] No authenticated user, sending request without token");
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
    <AuthContext.Provider value={{ user, profile, token, loading, authFetch, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
