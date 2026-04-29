"use client";
import { createContext, useContext, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = useCallback(async (fn) => {
    setIsLoading(true);
    try {
      return await fn();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ withLoading, isLoading, setIsLoading }}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/20 dark:bg-slate-900/40 backdrop-blur-md pointer-events-auto"
          >
            {/* Spinning Loader */}
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-16 h-16 rounded-full border-4 border-rose-500/20 border-b-rose-500 scale-75"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
