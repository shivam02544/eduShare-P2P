"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useLoading } from "@/context/LoadingContext";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Eye, 
  Lock, 
  ArrowRight,
  User,
  MoreVertical,
  BookOpen,
  Target,
  Cpu,
  Activity,
  Zap,
  Layers,
  ShieldCheck
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const SUBJECT_THEMES = {
  Math:        { line: "bg-indigo-500",    icon: "text-indigo-500",    surface: "bg-indigo-50/50 dark:bg-indigo-500/10", glow: "shadow-indigo-500/10" },
  Science:     { line: "bg-emerald-500", icon: "text-emerald-500", surface: "bg-emerald-50/50 dark:bg-emerald-500/10", glow: "shadow-emerald-500/10" },
  History:     { line: "bg-amber-500",   icon: "text-amber-500",   surface: "bg-amber-50/50 dark:bg-amber-500/10", glow: "shadow-amber-500/10" },
  Programming: { line: "bg-slate-900",   icon: "text-slate-900 dark:text-white",   surface: "bg-slate-100 dark:bg-white/10", glow: "shadow-slate-500/10" },
  English:     { line: "bg-rose-500",    icon: "text-rose-500",    surface: "bg-rose-50/50 dark:bg-rose-500/10", glow: "shadow-rose-500/10" },
  Physics:     { line: "bg-cyan-500",    icon: "text-cyan-500",    surface: "bg-cyan-50/50 dark:bg-cyan-500/10", glow: "shadow-cyan-500/10" },
  Chemistry:   { line: "bg-orange-500",  icon: "text-orange-500",  surface: "bg-orange-50/50 dark:bg-orange-500/10", glow: "shadow-orange-500/10" },
  Biology:     { line: "bg-green-600",   icon: "text-green-600",   surface: "bg-green-50/50 dark:bg-green-600/10", glow: "shadow-green-500/10" },
};

export default function NoteCard({ note, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const { withLoading } = useLoading();
  const theme = SUBJECT_THEMES[note.subject] || { line: "bg-slate-500", icon: "text-slate-500", surface: "bg-slate-50/50 dark:bg-slate-500/10", glow: "shadow-slate-500/10" };

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    await withLoading(() => onDownload(note), "Synchronizing asset manifest...");
    setDownloading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={springConfig}
      whileHover={{ y: -10 }}
      className={`group relative flex flex-col rounded-[48px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-8 md:p-10 transition-all hover:shadow-3xl ${theme.glow} overflow-hidden`}
    >
      {/* Dynamic Scanning Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute -inset-[100%] bg-gradient-to-b from-transparent via-white/5 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 group-hover:translate-y-full transition-all duration-[1.5s] ease-in-out`} />
      </div>

      {/* Surface Texture */}
      <div className={`absolute -top-20 -right-20 w-48 h-48 ${theme.line} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-3xl transition-opacity duration-700`} />
      <div className="absolute bottom-4 right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
         <Layers className="w-32 h-32 rotate-12" />
      </div>
      
      {/* Content Architecture */}
      <div className="relative z-10 flex flex-col h-full gap-8">
        
        {/* Header Identity */}
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-border shadow-inner transition-transform group-hover:scale-110 duration-500 ${theme.surface} ${theme.icon}`}>
            <FileText className="w-7 h-7" />
          </div>
          
          <div className="flex flex-col items-end gap-3 text-right">
            <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-border italic shadow-sm ${theme.surface} ${theme.icon}`}>
              {note.subject || "General"}
            </div>
            {note.isPremium && (
              <div className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl italic">
                <Lock className="w-3 h-3" />
                {note.premiumCost} CR
              </div>
            )}
          </div>
        </div>

        {/* Title Manifest */}
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
             <p className="text-[9px] font-black text-text-3 uppercase tracking-[0.4em] italic opacity-50">Academic Sheet V1</p>
             <h3 className="text-2xl font-black text-text-1 tracking-tighter leading-tight line-clamp-2 h-16 group-hover:text-indigo-500 transition-colors italic">
               {note.title}
             </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link 
              href={`/profile/${note.uploader?.firebaseUid}`}
              onClick={(e) => e.stopPropagation()}
              className="group/author flex items-center gap-2.5 bg-slate-50 dark:bg-white/5 pl-1.5 pr-4 py-1.5 rounded-2xl border border-border hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95"
            >
              {note.uploader?.image ? (
                <img src={note.uploader.image} alt="" className="w-7 h-7 rounded-xl object-cover border border-border" />
              ) : (
                <div className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black italic">
                  {note.uploader?.name?.[0]}
                </div>
              )}
              <div className="flex flex-col text-left">
                 <span className="text-[8px] font-black text-text-3 uppercase tracking-widest leading-none">Curator</span>
                 <span className="text-[11px] font-black text-text-1 tracking-tight truncate max-w-[100px] italic">
                   {note.uploader?.name}
                 </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-2 bg-indigo-500/5 px-3 py-1.5 rounded-xl border border-indigo-500/10">
               <Activity className="w-3.5 h-3.5 text-indigo-500" />
               <span className="text-[10px] font-black text-text-1 uppercase italic tracking-tighter">
                 {note.downloads || 0} Syncs
               </span>
            </div>
          </div>
        </div>

        {/* Action Protocol */}
        <div className="flex gap-4 pt-4 border-t border-border/50">
          <Link href={`/notes/${note._id}`}
            className="flex-1 group/btn relative flex items-center justify-center gap-3 py-4 rounded-[24px] bg-slate-50 dark:bg-white/5 text-text-1 border border-border text-[11px] font-black uppercase tracking-widest italic hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all overflow-hidden"
          >
            <Eye className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            Analysis
          </Link>
          
          <button 
            onClick={handleDownload} 
            disabled={downloading}
            className="flex-1 group/sync relative flex items-center justify-center gap-3 py-4 rounded-[24px] bg-indigo-500 text-white border border-indigo-400/20 text-[11px] font-black uppercase tracking-widest italic hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 overflow-hidden"
          >
            {downloading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 group-hover/sync:translate-y-0.5 transition-transform" />
                Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

