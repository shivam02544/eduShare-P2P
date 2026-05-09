"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, Trash2, Play, CheckCircle2, Clock, Calendar } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";

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
      className="group flex flex-col md:flex-row gap-6 p-4 bg-white dark:bg-slate-900 border border-border rounded-2xl hover:shadow-md transition-shadow"
    >
      {/* Video Thumbnail */}
      <div className="relative w-full md:w-48 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-border">
        {item.video.thumbnailUrl ? (
          <img src={item.video.thumbnailUrl} alt={item.video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-3">
            <Play className="w-8 h-8 opacity-50" />
          </div>
        )}
        
        {/* Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
          <div 
            className="h-full bg-indigo-500" 
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
           <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {item.completed && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-text-1 text-base md:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 md:line-clamp-2">
              {item.video.title}
            </h3>
            <p className="text-sm font-semibold text-text-3">
              {item.video.uploader?.name}
            </p>
          </div>
          <span className="text-xs font-semibold text-text-3 whitespace-nowrap bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-border">
            {timeAgo(item.lastWatchedAt)}
          </span>
        </div>

        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-text-2 uppercase tracking-wide">
            <span className={item.completed ? "text-emerald-600 dark:text-emerald-400" : ""}>
              {pct}% Watched
            </span>
            <span className="text-text-3">
              {item.completed ? "Completed" : `${formatTime(item.progressSeconds)} / ${formatTime(item.durationSeconds)}`}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
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
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  const fetchHistory = () => {
    authFetch("/api/watch-history")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load history (${r.status})`);
        return r.json();
      })
      .then((d) => { setHistory(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
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
    <PageContainer>
      <SectionHeader 
        icon={History}
        title="Watch History"
        description={`Total of ${history.length} videos recorded in your watch history.`}
        action={
          history.length > 0 ? (
            <button 
              onClick={handleClear} 
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-sm font-bold transition-colors disabled:opacity-50 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              {clearing ? "Clearing..." : "Clear History"}
            </button>
          ) : null
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 h-32 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-border/50 bg-slate-50 dark:bg-slate-800/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center justify-center text-text-3 shadow-sm">
             <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-text-1">No History Yet</p>
            <p className="text-xs text-text-3">Start watching lessons to build your history.</p>
          </div>
          <Link href="/explore" className="mt-4 flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
            Explore Lessons
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {inProgress.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Clock className="w-5 h-5 text-indigo-500" />
                <h2 className="text-sm font-bold text-text-1 uppercase tracking-wider">Continue Watching</h2>
              </div>
              <div className="space-y-3">
                {inProgress.map((h) => <HistoryItem key={h._id} item={h} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-bold text-text-1 uppercase tracking-wider">Recently Completed</h2>
              </div>
              <div className="space-y-3">
                {completed.map((h) => <HistoryItem key={h._id} item={h} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}

