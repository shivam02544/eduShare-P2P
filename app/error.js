'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-8"
      >
        <AlertCircle className="w-10 h-10" />
      </motion.div>
      
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-bold text-text-1 tracking-tighter">Something Went Wrong</h1>
        <p className="text-text-2 text-sm leading-relaxed opacity-70">
          An unexpected error occurred. Our team has been notified and we are working to fix it.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
        <button
          onClick={() => reset()}
          className="group flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Try Again
        </button>
        
        <Link
          href="/"
          className="group flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-white/5 border border-border text-text-2 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-bold"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>

      <div className="mt-16 text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-30">
        Error Reference: {error.digest || 'ROOT_ERROR'}
      </div>
    </div>
  );
}
