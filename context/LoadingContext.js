"use client";
import { createContext, useContext, useCallback } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  // withLoading now just runs the fn — no overlay, no blur
  const withLoading = useCallback(async (fn) => {
    return await fn();
  }, []);

  return (
    <LoadingContext.Provider value={{ withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
