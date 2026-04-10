"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard } from "@/components/Skeleton";

const SUBJECTS = ["All", "Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology"];

const memCache = {};
function getMemCache(key) { const e = memCache[key]; return e && e.exp > Date.now() ? e.data : null; }
function setMemCache(key, data, ttlMs = 60_000) { memCache[key] = { data, exp: Date.now() + ttlMs }; }

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

function EmptyState({ tab }) {
  const isVideo = tab === "videos";
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isVideo ? "bg-violet-50 text-violet-500" : "bg-rose-50 text-rose-500"}`}>
        {isVideo ? (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <div className="text-center">
        <p className="text-[17px] font-bold" style={{ color: "var(--text-1)" }}>
          No {tab} found
        </p>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-3)" }}>
          Try a different subject or be the first to upload
        </p>
      </div>
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
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const fetchVideos = useCallback(async (force = false) => {
    const key = `videos:${subject}:${sort}`;
    if (!force) {
      const cached = getMemCache(key);
      if (cached) { setVideos(cached); setLoadingVideos(false); return; }
    }
    setLoadingVideos(true);
    try {
      const subjectParam = subject !== "All" ? `&subject=${subject}` : "";
      const res = await fetch(`/api/videos?sort=${sort}${subjectParam}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => {
        const aBoosted = a.boostedUntil && new Date(a.boostedUntil) > new Date();
        const bBoosted = b.boostedUntil && new Date(b.boostedUntil) > new Date();
        if (aBoosted && !bBoosted) return -1;
        if (!aBoosted && bBoosted) return 1;
        return 0;
      });
      setMemCache(key, sorted);
      setVideos(sorted);
    } catch { setVideos([]); } finally { setLoadingVideos(false); }
  }, [subject, sort]);

  const fetchNotes = useCallback(async (force = false) => {
    const key = `notes:${subject}`;
    if (!force) {
      const cached = getMemCache(key);
      if (cached) { setNotes(cached); setLoadingNotes(false); return; }
    }
    setLoadingNotes(true);
    try {
      const subjectParam = subject !== "All" ? `&subject=${subject}` : "";
      const res = await fetch(`/api/notes?${subjectParam}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setMemCache(key, list);
      setNotes(list);
    } catch { setNotes([]); } finally { setLoadingNotes(false); }
  }, [subject]);

  useEffect(() => {
    fetchVideos();
    fetchNotes();
  }, [fetchVideos, fetchNotes]);

  const handleDownload = async (note) => {
    if (!user) return alert("Please login to download");
    const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
    const data = await res.json();
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
  };

  const isLoading = tab === "videos" ? loadingVideos : loadingNotes;

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Explore</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-3)" }}>
            Discover videos and notes shared by your peers
          </p>
        </div>

        {/* Sort selector */}
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="input w-auto text-[13px] py-2 px-3 flex-shrink-0 cursor-pointer"
          style={{ width: "auto" }}>
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* ── Subject Filter Pills ── */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {SUBJECTS.map((s) => (
            <button key={s} onClick={() => setSubject(s)}
              className={`tag-pill ${subject === s ? "active" : ""}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tab-bar">
        {[
          { key: "videos", label: "Videos", count: videos.length, loading: loadingVideos },
          { key: "notes",  label: "Notes",  count: notes.length,  loading: loadingNotes },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab-item ${tab === t.key ? "active" : ""}`}>
            {t.label}
            {!t.loading && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                tab === t.key
                  ? "bg-[var(--text-1)] text-[var(--bg)]"
                  : "bg-[var(--surface-2)] text-[var(--text-3)]"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <SkeletonGrid />
      ) : tab === "videos" ? (
        videos.length === 0 ? <EmptyState tab="videos" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-grid">
            {videos.map((v) => <VideoCard key={v._id} video={v} />)}
          </div>
        )
      ) : (
        notes.length === 0 ? <EmptyState tab="notes" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-grid">
            {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
          </div>
        )
      )}
    </div>
  );
}
