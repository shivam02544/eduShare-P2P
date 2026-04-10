"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Target, Sparkles } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center space-y-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
        className="relative"
      >
         <div className="w-48 h-48 rounded-[64px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner">
           <Target className="w-24 h-24" />
         </div>
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
           className="absolute -inset-6 border border-indigo-500/10 rounded-full border-dashed"
         />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="text-8xl font-black text-indigo-500/10">404</span>
         </div>
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter">Page Not Found</h1>
        <p className="text-text-3 font-black uppercase tracking-[0.3em] text-[10px] max-w-sm mx-auto opacity-60">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
        <Link href="/" className="group flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-3xl">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go Home
        </Link>
        <Link href="/explore" className="group flex items-center gap-4 px-10 py-5 bg-white/50 dark:bg-white/5 border border-border backdrop-blur-md text-text-1 rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-white dark:hover:bg-white/10 transition-all">
          Explore Content
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </Link>
      </div>
    </div>
  );
}
