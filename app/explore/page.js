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

const SUBJECTS = ["All", "Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology"];

import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
import ResponsiveGrid from "@/components/layouts/ResponsiveGrid";

// ── Skeleton: matches real VideoCard dimensions ────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse border border-border/50 overflow-hidden"
      aria-hidden="true"
    >
      <div className="aspect-video bg-slate-300 dark:bg-white/10" />
      <div className="p-5 space-y-3">
        <div className="h-4 rounded bg-slate-300 dark:bg-white/10 w-4/5" />
        <div className="h-3 rounded bg-slate-300 dark:bg-white/10 w-3/5" />
        <div className="h-3 rounded bg-slate-300 dark:bg-white/10 w-2/5" />
        <div className="pt-3 border-t border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-300 dark:bg-white/10" />
          <div className="h-3 rounded bg-slate-300 dark:bg-white/10 flex-1" />
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
    <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-border/50 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-6">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 border border-border shadow-sm ${isVideo ? "text-indigo-500" : "text-emerald-500"}`}>
        {isVideo ? <Video className="w-9 h-9" aria-hidden="true" /> : <FileText className="w-9 h-9" aria-hidden="true" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-text-1">No Results Found</h3>
        <p className="text-text-3 text-sm">No {tab} found in this category.</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Try Again
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 text-rose-500">
        <AlertCircle className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-text-1">Failed to Load</h3>
        <p className="text-sm text-text-3">{message || "Something went wrong. Please try again."}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Retry
      </button>
    </div>
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
  const [loadingNotes, setLoadingNotes] = useState(false); // only load on demand
  const [errorVideos, setErrorVideos] = useState(null);
  const [errorNotes, setErrorNotes] = useState(null);
  // Track which tabs have been fetched to avoid redundant fetches
  const fetchedNotes = useRef(false);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12">
        <SectionHeader
          title="Find Lessons."
          description="High-quality lessons and notes shared by your peers."
          badge="Community Hub"
        />

        <div className="flex items-center gap-6 shrink-0">
          <div className="relative flex items-center gap-3 bg-white dark:bg-slate-900 border border-border pl-4 pr-3 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <Filter className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
            <div className="w-px h-5 bg-border" aria-hidden="true" />
            <label htmlFor="explore-sort" className="sr-only">Sort order</label>
            <select
              id="explore-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-bold text-text-1 uppercase tracking-wider appearance-none outline-none cursor-pointer pr-8 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <option value="recent">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none group-hover:text-indigo-500 transition-colors" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* ── Category Selection ── */}
      <div className="relative py-2 -mx-4 px-4 md:mx-0 md:px-0" role="group" aria-label="Filter by subject">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none md:hidden" aria-hidden="true" />
        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex gap-2 md:gap-3 min-w-max pb-2">
            {SUBJECTS.map((s) => {
              const isActive = subject === s;
              return (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  aria-pressed={isActive}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                      : "bg-white dark:bg-slate-900 border border-border text-text-3 hover:border-indigo-500/30 hover:text-text-1 shadow-sm"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none md:hidden" aria-hidden="true" />
      </div>

      {/* ── Content Type Tabs ── */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border shadow-inner" role="tablist">
          {[
            { key: "videos", label: "Videos", icon: Video, count: videos.length },
            { key: "notes", label: "Study Notes", icon: FileText, count: notes.length },
          ].map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 md:gap-3 px-6 py-3 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive ? "bg-white dark:bg-slate-900 shadow-sm ring-1 ring-border text-text-1" : "text-text-3 hover:text-text-1"
                }`}
              >
                <t.icon className={`w-4 h-4 ${isActive ? "text-indigo-500" : ""}`} aria-hidden="true" />
                <span className={`hidden sm:block text-xs font-bold uppercase tracking-wider`}>{t.label}</span>
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
      <div role="tabpanel" aria-live="polite">
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
      </div>

    </PageContainer>
  );
}
