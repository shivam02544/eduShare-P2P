"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { 
  Search, 
  Filter, 
  Video, 
  FileText, 
  Sparkles, 
  ChevronDown,
  LayoutGrid,
  Zap,
  BookOpen,
  Database,
  Activity,
  Monitor,
  Target,
  Layers,
  Terminal,
  Cpu,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers3,
  SearchCode
} from "lucide-react";

const SUBJECTS = ["All", "Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology"];
const springConfig = { mass: 1, tension: 120, friction: 20 };

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-[420px] rounded-[48px] bg-slate-200 dark:bg-white/5 animate-pulse border border-border/50" />
      ))}
    </div>
  );
}

function EmptyState({ tab }) {
  const isVideo = tab === "videos";
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-40 rounded-[64px] border-2 border-dashed border-border/50 bg-slate-50/30 dark:bg-white/[0.02] text-center space-y-8 group"
    >
      <div className="relative">
         <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center shadow-3xl bg-white dark:bg-slate-900 border border-border group-hover:scale-110 transition-transform duration-500 ${isVideo ? "text-indigo-500" : "text-emerald-500"}`}>
           {isVideo ? <Video className="w-12 h-12" /> : <FileText className="w-12 h-12" />}
         </div>
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="absolute -inset-4 border border-indigo-500/10 rounded-full border-dashed"
         />
      </div>
      <div className="space-y-3">
        <h3 className="text-3xl font-black text-text-1 tracking-tighter">No Results Found</h3>
        <p className="text-text-3 font-black uppercase tracking-[0.3em] text-[10px]">No {tab} found in this category.</p>
      </div>
      <button onClick={() => window.location.reload()} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors">
         <Activity className="w-4 h-4" />
         Refresh Page
      </button>
    </motion.div>
  );
}

export default function ExplorePage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("videos");
  const [subject, setSubject] = useState("All");
  const [sort, setSort] = useState("recent");
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const subjectParam = subject !== "All" ? `&subject=${subject}` : "";
      const res = await fetch(`/api/videos?sort=${sort}${subjectParam}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setVideos(list);
    } catch { setVideos([]); } finally { setLoadingVideos(false); }
  }, [subject, sort]);

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const subjectParam = subject !== "All" ? `&subject=${subject}` : "";
      const res = await fetch(`/api/notes?${subjectParam}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setNotes(list);
    } catch { setNotes([]); } finally { setLoadingNotes(false); }
  }, [subject]);

  useEffect(() => {
    fetchVideos();
    fetchNotes();
  }, [fetchVideos, fetchNotes]);

  const handleDownload = async (note) => {
    if (!user) return;
    const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
    const data = await res.json();
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
  };

  const isLoading = tab === "videos" ? loadingVideos : loadingNotes;

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 md:space-y-16 pb-32 md:pb-40 px-4 md:px-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20">
                <Target className="w-5 h-5" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Explore</span>
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-text-3 opacity-50">Community Hub</span>
             </div>
          </div>
          <div className="space-y-4">
             <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-text-1 tracking-tighter leading-tight">
               Find Lessons.
             </h1>
             <p className="text-text-2 text-base md:text-xl font-medium max-w-2xl opacity-80 leading-relaxed">
               Find high-quality lessons and notes shared by your peers on the platform.
             </p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="relative group">
             <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all rounded-full" />
             <div className="relative flex items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border pl-6 pr-4 py-4 rounded-[28px] shadow-2xl overflow-hidden group">
                <Filter className="w-5 h-5 text-indigo-500" />
                <div className="w-px h-6 bg-border/50" />
                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-[11px] font-black text-text-1 uppercase tracking-widest appearance-none outline-none cursor-pointer pr-10"
                >
                  <option value="recent">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none group-hover:text-indigo-500 transition-colors" />
             </div>
          </div>
        </div>
      </div>

      {/* ── Category Selection ── */}
      <div className="relative py-2">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg via-bg/80 to-transparent z-10 pointer-events-none" />
        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-3 md:gap-4 min-w-max px-4 md:px-24">
            {SUBJECTS.map((s) => {
              const isActive = subject === s;
              return (
                <button 
                  key={s} 
                  onClick={() => setSubject(s)}
                  className={`group relative px-5 md:px-10 py-3 md:py-5 rounded-[20px] md:rounded-[28px] transition-all duration-500 ${
                    isActive 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-3xl scale-105" 
                      : "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-border text-text-3 hover:border-indigo-500/30 hover:text-text-1"
                  }`}
                >
                  <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em]">
                    {s}
                  </span>
                  {isActive && (
                     <motion.div 
                       layoutId="subjectGlow"
                       className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"
                     />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg via-bg/80 to-transparent z-10 pointer-events-none" />
      </div>

      {/* ── Content Type Selection ── */}
      <div className="flex justify-center">
        <div className="inline-flex p-2 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-border shadow-inner backdrop-blur-md">
          {[
            { key: "videos", label: "Videos", icon: Video, count: videos.length },
            { key: "notes",  label: "Study Notes", icon: FileText, count: notes.length },
          ].map((t) => {
            const isActive = tab === t.key;
            return (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 md:gap-4 px-5 md:px-10 py-3 md:py-5 rounded-[24px] md:rounded-[32px] transition-all group ${
                  isActive ? "bg-white dark:bg-slate-900 shadow-3xl ring-1 ring-border" : "text-text-3 hover:text-text-1 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <t.icon className={`w-5 h-5 ${isActive ? "text-indigo-500" : "group-hover:scale-110 transition-transform"}`} />
                <span className={`hidden sm:block text-[11px] font-black uppercase tracking-widest ${isActive ? "text-text-1" : ""}`}>{t.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="tabCountExplore"
                    className="px-2.5 py-1 rounded-xl bg-indigo-500 text-white text-[9px] font-black shadow-lg shadow-indigo-500/20"
                  >
                    {t.count}
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Grid ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SkeletonGrid />
          </motion.div>
        ) : tab === "videos" ? (
          videos.length === 0 ? <EmptyState tab="videos" /> : (
            <motion.div 
              key="video-grid"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-10"
            >
              {videos.map((v) => <VideoCard key={v._id} video={v} />)}
            </motion.div>
          )
        ) : (
          notes.length === 0 ? <EmptyState tab="notes" /> : (
            <motion.div 
              key="note-grid"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-10"
            >
              {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
            </motion.div>
          )
        )}
      </AnimatePresence>
      
      {/* ── Page Footer Info ── */}
      <div className="flex items-center justify-center gap-8 pt-12 opacity-30 group-hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-3 text-[10px] font-black text-text-3 uppercase tracking-[0.4em]">
            <Monitor className="w-4 h-4" />
            Discovery Hub
         </div>
         <div className="w-1.5 h-1.5 rounded-full bg-border" />
         <div className="flex items-center gap-3 text-[10px] font-black text-text-3 uppercase tracking-[0.4em]">
            <Cpu className="w-4 h-4" />
            System Updated
         </div>
      </div>
    </div>
  );
}


