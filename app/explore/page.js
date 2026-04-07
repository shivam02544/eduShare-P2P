"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard } from "@/components/Skeleton";
import { getCache, setCache } from "@/lib/cache";

const SUBJECTS = ["All", "Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology"];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
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
  // Track loading per tab independently
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const fetchVideos = useCallback(async (force = false) => {
    const key = `videos:${subject}:${sort}`;
    if (!force) {
      const cached = getCache(key);
      if (cached) { setVideos(cached); setLoadingVideos(false); return; }
    }
    setLoadingVideos(true);
    const subjectParam = subject !== "All" ? `&subject=${subject}` : "";
    const res = await fetch(`/api/videos?sort=${sort}${subjectParam}`);
    const data = await res.json();
    // Boosted content floats to top
    const sorted = [...data].sort((a, b) => {
      const aBoosted = a.boostedUntil && new Date(a.boostedUntil) > new Date();
      const bBoosted = b.boostedUntil && new Date(b.boostedUntil) > new Date();
      if (aBoosted && !bBoosted) return -1;
      if (!aBoosted && bBoosted) return 1;
      return 0;
    });
    setCache(key, sorted);
    setVideos(sorted);
    setLoadingVideos(false);
  }, [subject, sort]);

  const fetchNotes = useCallback(async (force = false) => {
    const key = `notes:${subject}`;
    if (!force) {
      const cached = getCache(key);
      if (cached) { setNotes(cached); setLoadingNotes(false); return; }
    }
    setLoadingNotes(true);
    const subjectParam = subject !== "All" ? `&subject=${subject}` : "";
    const res = await fetch(`/api/notes?${subjectParam}`);
    const data = await res.json();
    setCache(key, data);
    setNotes(data);
    setLoadingNotes(false);
  }, [subject]);

  // Fetch both on filter change
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
  const items = tab === "videos" ? videos : notes;

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Explore</h1>
        <p className="text-zinc-400 text-sm mt-1">Discover videos and notes shared by your peers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {SUBJECTS.map((s) => (
            <button key={s} onClick={() => setSubject(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                subject === s
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400"
              }`}>
              {s}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="input w-auto text-xs py-1.5 px-3 flex-shrink-0">
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Tabs — switching is instant, no re-fetch */}
      <div className="flex gap-0 border-b border-zinc-200">
        {[
          { key: "videos", label: "Videos", count: videos.length, loading: loadingVideos },
          { key: "notes", label: "Notes", count: notes.length, loading: loadingNotes },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}>
            {t.label}
            {!t.loading && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content — each tab has its own loading state */}
      {isLoading ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <div className="text-5xl mb-3">{tab === "videos" ? "🎥" : "📄"}</div>
          <p className="font-medium text-zinc-600">No {tab} found</p>
          <p className="text-sm mt-1">Try a different subject or be the first to upload</p>
        </div>
      ) : tab === "videos" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
        </div>
      )}
    </div>
  );
}
