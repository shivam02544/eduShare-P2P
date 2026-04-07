"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatTime(seconds) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function HistoryItem({ item }) {
  const pct = item.durationSeconds > 0
    ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
    : 0;

  return (
    <Link href={`/videos/${item.video._id}`}
      className="card overflow-hidden flex gap-4 p-4 hover:-translate-y-0.5 transition-transform duration-200 animate-fade-in">
      {/* Thumbnail */}
      <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
        {item.video.thumbnailUrl ? (
          <img src={item.video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🎥</div>
        )}
        {/* Progress bar on thumbnail */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div className="h-full bg-red-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        {item.completed && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 text-sm line-clamp-2 leading-snug">
          {item.video.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1">{item.video.uploader?.name}</p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-700 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-zinc-400 flex-shrink-0">
            {item.completed ? "Completed" : `${formatTime(item.progressSeconds)} / ${formatTime(item.durationSeconds)}`}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mt-1">{timeAgo(item.lastWatchedAt)}</p>
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const fetchHistory = () => {
    authFetch("/api/watch-history")
      .then((r) => r.json())
      .then((d) => { setHistory(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { if (user) fetchHistory(); }, [user]);

  const handleClear = async () => {
    if (!confirm("Clear all watch history?")) return;
    setClearing(true);
    await authFetch("/api/watch-history", { method: "DELETE" });
    setHistory([]);
    setClearing(false);
  };

  const inProgress = history.filter((h) => !h.completed);
  const completed = history.filter((h) => h.completed);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Watch History</h1>
          <p className="text-zinc-400 text-sm mt-1">{history.length} videos watched</p>
        </div>
        {history.length > 0 && (
          <button onClick={handleClear} disabled={clearing}
            className="text-sm text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50">
            {clearing ? "Clearing..." : "Clear all"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="card p-4 flex gap-4">
              <div className="skeleton w-32 h-20 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-5xl mb-3">📺</p>
          <p className="font-medium text-zinc-600">No watch history yet</p>
          <p className="text-sm mt-1 mb-4">Videos you watch will appear here</p>
          <Link href="/explore" className="btn-primary">Browse Videos</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {inProgress.length > 0 && (
            <div>
              <p className="section-label mb-3">Continue Watching</p>
              <div className="space-y-3">
                {inProgress.map((h) => <HistoryItem key={h._id} item={h} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="section-label mb-3">Completed</p>
              <div className="space-y-3">
                {completed.map((h) => <HistoryItem key={h._id} item={h} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
