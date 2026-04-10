"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Play, CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

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

function HistoryItem({ item, index }) {
  const pct = item.durationSeconds > 0
    ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...springConfig, delay: index * 0.05 }}
    >
      <Link href={`/videos/${item.video._id}`}
        className="group relative flex gap-6 p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-border rounded-[32px] hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 shadow-sm hover:shadow-2xl"
      >
        {/* Thumbnail Stage */}
        <div className="relative w-40 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 flex-shrink-0 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
          {item.video.thumbnailUrl ? (
            <img src={item.video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-500/10 text-indigo-500">
              <Play className="w-8 h-8 opacity-20" />
            </div>
          )}
          
          {/* Progress Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
            />
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
             <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
          </div>

          {item.completed && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Info Board */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-black text-text-1 text-base tracking-tight leading-snug group-hover:text-indigo-500 transition-colors line-clamp-1">
                {item.video.title}
              </h3>
              <p className="text-[10px] font-black text-text-3 uppercase tracking-widest">
                {item.video.uploader?.name}
              </p>
            </div>
            <span className="text-[10px] font-black text-text-3 uppercase tracking-tighter bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
              {timeAgo(item.lastWatchedAt)}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black text-text-2 uppercase tracking-tight">
              <span>{pct}% Watched</span>
              <span className="text-text-3">
                {item.completed ? "Completed" : `${formatTime(item.progressSeconds)} / ${formatTime(item.durationSeconds)}`}
              </span>
            </div>
            <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
               <div className="h-full bg-text-1 opacity-20" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
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
    <div className="max-w-3xl mx-auto space-y-12 pb-32 px-6 md:px-0">
      
      {/* ── Chronology Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
              <History className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Activity Log</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter leading-tight">
            Watch History
          </h1>
          <p className="text-sm font-medium text-text-3 max-w-sm">
            Total of {history.length} videos recorded in your watch history.
          </p>
        </div>

        {history.length > 0 && (
          <button 
            onClick={handleClear} 
            disabled={clearing}
            className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            {clearing ? "Clearing..." : "Clear History"}
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-50 dark:bg-white/5 h-32 rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 space-y-8"
        >
          <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-text-3 opacity-30 shadow-inner">
             <Calendar className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-black text-text-1 tracking-tighter">No History Yet</p>
            <p className="text-sm text-text-3 font-medium max-w-xs mx-auto">No watch records found. Start watching lessons to build your history.</p>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
            Explore Lessons
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {inProgress.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-text-3" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Continue Watching</h2>
              </div>
              <div className="space-y-4">
                {inProgress.map((h, i) => <HistoryItem key={h._id} item={h} index={i} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pt-6 border-t border-border/30">
                <CheckCircle2 className="w-4 h-4 text-text-3" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Recently Completed</h2>
              </div>
              <div className="space-y-4">
                {completed.map((h, i) => <HistoryItem key={h._id} item={h} index={i + inProgress.length} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

