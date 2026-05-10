"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import {
  Filter,
  Video,
  FileText,
  ChevronDown,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
import ResponsiveGrid from "@/components/layouts/ResponsiveGrid";

// ── Skeleton: matches real VideoCard dimensions ────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-xl bg-surface-2 dark:bg-surface-3 animate-pulse border border-border/50 overflow-hidden"
      aria-hidden="true"
    >
      <div className="aspect-video bg-surface-3 dark:bg-surface-4" />
      <div className="p-5 space-y-3">
        <div className="h-4 rounded bg-surface-3 dark:bg-surface-4 w-4/5" />
        <div className="h-3 rounded bg-surface-3 dark:bg-surface-4 w-3/5" />
        <div className="h-3 rounded bg-surface-3 dark:bg-surface-4 w-2/5" />
        <div className="pt-3 border-t border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-3 dark:bg-surface-4" />
          <div className="h-3 rounded bg-surface-3 dark:bg-surface-4 flex-1" />
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <ResponsiveGrid columns={4}>
      {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </ResponsiveGrid>
  );
}

  function EmptyState({ tab, onRetry }) {
  const isVideo = tab === "videos";
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-border/50 bg-surface-1 dark:bg-surface-2 text-center space-y-6"
    >
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-surface-2 dark:bg-surface-3 border border-border shadow-inner transition-transform hover:scale-110 duration-500 ${isVideo ? "text-accent" : "text-emerald-500"}`}>
        {isVideo ? <Video className="w-8 h-8" aria-hidden="true" /> : <FileText className="w-8 h-8" aria-hidden="true" />}
      </div>
      <div className="space-y-2 px-6">
        <h3 className="text-xl font-bold text-text-1 tracking-tight">No Results Found</h3>
        <p className="text-[11px] font-semibold text-text-4 uppercase tracking-wider max-w-xs mx-auto">No {tab} matching your parameters.</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-accent hover:bg-accent hover:text-white transition-all bg-accent/10 px-6 py-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border border-accent/20 active:scale-95 shadow-lg shadow-accent/5"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Synchronize Data
      </button>
    </motion.div>
  );
}

 function ErrorState({ message, onRetry }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-rose-500/20 bg-rose-500/5 text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-surface-1 border border-rose-500/20 text-rose-500 shadow-lg shadow-rose-500/5">
        <AlertCircle className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-text-1 tracking-tight">Protocol Failure</h3>
        <p className="text-[11px] font-semibold text-text-4 uppercase tracking-wider">{message || "Something went wrong."}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500 hover:text-white transition-all bg-rose-500/10 px-6 py-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 border border-rose-500/20 active:scale-95 shadow-lg"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Retry Connection
      </button>
    </motion.div>
  );
}

export default function ExplorePage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("videos");
  const [subject, setSubject] = useState("All");
  const [subjects, setSubjects] = useState(["All"]);
  const [sort, setSort] = useState("recent");
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false); // only load on demand
  const [errorVideos, setErrorVideos] = useState(null);
  const [errorNotes, setErrorNotes] = useState(null);
  // Track which tabs have been fetched to avoid redundant fetches
  const fetchedNotes = useRef(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("/api/subjects");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    setErrorVideos(null);
    try {
      const subjectParam = subject !== "All" ? `&subject=${encodeURIComponent(subject)}` : "";
      const res = await fetch(`/api/videos?sort=${sort}${subjectParam}`);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorVideos(err.message);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }, [subject, sort]);

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    setErrorNotes(null);
    try {
      const subjectParam = subject !== "All" ? `&subject=${encodeURIComponent(subject)}` : "";
      const res = await fetch(`/api/notes?sort=${sort}${subjectParam}`);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorNotes(err.message);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  }, [subject, sort]);

  // Initial load: only fetch active tab
  useEffect(() => {
    if (!user) return;
    fetchedNotes.current = false;
    fetchVideos();
  }, [fetchVideos, user]);

  // Fetch notes on-demand the first time the user switches to notes tab
  useEffect(() => {
    if (!user) return;
    if (tab === "notes" && !fetchedNotes.current) {
      fetchedNotes.current = true;
      fetchNotes();
    }
  }, [tab, user, fetchNotes]);

  // Re-fetch both when filters change
  useEffect(() => {
    if (!user) return;
    fetchVideos();
    if (fetchedNotes.current) fetchNotes();
  }, [subject, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = useCallback(async (note) => {
    if (!user) return;
    try {
      const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
      const data = await res.json();
      if (data.fileUrl) window.open(data.fileUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Silently fail — toast handled by caller if needed
    }
  }, [user, authFetch]);

  const isLoading = tab === "videos" ? loadingVideos : loadingNotes;
  const error = tab === "videos" ? errorVideos : errorNotes;
  const retry = tab === "videos" ? fetchVideos : fetchNotes;

  return (
    <PageContainer>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-12">
        <SectionHeader
          title="Find Lessons"
          description="Access high-quality peer-reviewed knowledge modules."
          badge="KNOWLEDGE HUB"
        />

         <div className="flex items-center gap-6 shrink-0">
          <div className="relative flex items-center gap-3 bg-surface-1 dark:bg-surface-2 border border-border pl-4 pr-3 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all group">
            <Filter className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <div className="w-px h-5 bg-border" aria-hidden="true" />
            <label htmlFor="explore-sort" className="sr-only">Sort order</label>
            <select
              id="explore-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-text-1 uppercase tracking-wider appearance-none outline-none cursor-pointer pr-8 focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              <option value="recent">Newest nodes</option>
              <option value="popular">Most popular</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-4 pointer-events-none group-hover:text-accent transition-colors" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* ── Category Selection ── */}
      <div className="relative py-4 -mx-4 px-4 md:mx-0 md:px-0 mb-12" role="group" aria-label="Filter by subject">
        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-3 md:gap-4 min-w-max pb-2">
            {subjects.map((s) => {
              const isActive = subject === s;
              return (
                 <button
                  key={s}
                  onClick={() => setSubject(s)}
                  aria-pressed={isActive}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 ${
                    isActive
                      ? "bg-accent text-white shadow-xl shadow-accent/20 border border-accent/20"
                      : "bg-surface-1 dark:bg-surface-2 border border-border text-text-3 hover:border-accent/50 hover:text-text-1 shadow-sm"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content Type Tabs ── */}
      <div className="flex justify-center mb-16">
        <div className="inline-flex p-2 rounded-[24px] bg-surface-2 dark:bg-surface-3 border border-border shadow-inner" role="tablist">
          {[
            { key: "videos", label: "Video Modules", icon: Video, count: videos.length },
            { key: "notes", label: "Knowledge Base", icon: FileText, count: notes.length },
          ].map((t) => {
            const isActive = tab === t.key;
            return (
             <button
                key={t.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 ${
                  isActive ? "bg-surface-1 dark:bg-surface-2 shadow-lg ring-1 ring-border text-text-1" : "text-text-4 hover:text-text-2"
                }`}
              >
                <t.icon className={`w-4 h-4 ${isActive ? "text-accent" : ""}`} aria-hidden="true" />
                <span className={`hidden sm:block text-[11px] font-bold uppercase tracking-wider`}>{t.label}</span>
                {isActive && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-accent text-white text-[11px] font-bold shadow-md shadow-accent/20">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div role="tabpanel" aria-live="polite" className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + subject + sort + isLoading}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <SkeletonGrid />
            ) : error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : tab === "videos" ? (
              videos.length === 0
                ? <EmptyState tab="videos" onRetry={fetchVideos} />
                : <ResponsiveGrid columns={4}>{videos.map((v) => <VideoCard key={v._id} video={v} />)}</ResponsiveGrid>
            ) : (
              notes.length === 0
                ? <EmptyState tab="notes" onRetry={fetchNotes} />
                : <ResponsiveGrid columns={4}>{notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}</ResponsiveGrid>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </PageContainer>
  );
}
