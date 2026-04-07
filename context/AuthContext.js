"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase user object
  const [token, setToken] = useState(null);     // ID token for API calls
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser);
        setUser(firebaseUser);
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ user, token, loading, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
