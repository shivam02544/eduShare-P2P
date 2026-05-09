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

import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
import ResponsiveGrid from "@/components/layouts/ResponsiveGrid";

function SkeletonGrid() {
  return (
    <ResponsiveGrid columns={4}>
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-[420px] rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse border border-border/50" />
      ))}
    </ResponsiveGrid>
  );
}

function EmptyState({ tab }) {
  const isVideo = tab === "videos";
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 md:py-32 rounded-3xl border-2 border-dashed border-border/50 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-6"
    >
      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 border border-border shadow-sm ${isVideo ? "text-indigo-500" : "text-emerald-500"}`}>
        {isVideo ? <Video className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl md:text-3xl font-bold text-text-1">No Results Found</h3>
        <p className="text-text-3 font-semibold uppercase tracking-wider text-xs">No {tab} found in this category.</p>
      </div>
      <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg">
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
    <PageContainer>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12">
        <SectionHeader 
          title="Find Lessons."
          description="Find high-quality lessons and notes shared by your peers on the platform."
          badge="Community Hub"
        />

        <div className="flex items-center gap-6 shrink-0">
          <div className="relative flex items-center gap-3 bg-white dark:bg-slate-900 border border-border pl-4 pr-3 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <Filter className="w-4 h-4 text-indigo-500" />
            <div className="w-px h-5 bg-border" />
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-bold text-text-1 uppercase tracking-wider appearance-none outline-none cursor-pointer pr-8"
            >
              <option value="recent">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none group-hover:text-indigo-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* ── Category Selection ── */}
      <div className="relative py-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none md:hidden" />
        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-2 md:gap-3 min-w-max pb-2">
            {SUBJECTS.map((s) => {
              const isActive = subject === s;
              return (
                <button 
                  key={s} 
                  onClick={() => setSubject(s)}
                  className={`group relative px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                      : "bg-white dark:bg-slate-900 border border-border text-text-3 hover:border-indigo-500/30 hover:text-text-1 shadow-sm"
                  }`}
                >
                  <span className="relative z-10 text-xs font-bold uppercase tracking-wider">
                    {s}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none md:hidden" />
      </div>

      {/* ── Content Type Selection ── */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border shadow-inner">
          {[
            { key: "videos", label: "Videos", icon: Video, count: videos.length },
            { key: "notes",  label: "Study Notes", icon: FileText, count: notes.length },
          ].map((t) => {
            const isActive = tab === t.key;
            return (
              <button 
                key={t.key} 
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 md:gap-3 px-6 py-3 rounded-xl transition-all group ${
                  isActive ? "bg-white dark:bg-slate-900 shadow-sm ring-1 ring-border" : "text-text-3 hover:text-text-1"
                }`}
              >
                <t.icon className={`w-4 h-4 ${isActive ? "text-indigo-500" : ""}`} />
                <span className={`hidden sm:block text-xs font-bold uppercase tracking-wider ${isActive ? "text-text-1" : ""}`}>{t.label}</span>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {t.count}
                  </span>
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
            >
              <ResponsiveGrid columns={4}>
                {videos.map((v) => <VideoCard key={v._id} video={v} />)}
              </ResponsiveGrid>
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
            >
              <ResponsiveGrid columns={4}>
                {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
              </ResponsiveGrid>
            </motion.div>
          )
        )}
      </AnimatePresence>
      
    </PageContainer>
  );
}


