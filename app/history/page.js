"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Play, CheckCircle2, Clock, Calendar, AlertCircle, Sparkles } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

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
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link href={`/videos/${item.video._id}`}
        className="group flex flex-col md:flex-row gap-8 p-6 bg-surface-1 dark:bg-surface-2 border border-border rounded-[32px] hover:shadow-2xl hover:shadow-black/5 transition-all duration-300"
      >
        {/* Video Thumbnail */}
        <div className="relative w-full md:w-56 h-32 rounded-[24px] overflow-hidden bg-surface-2 dark:bg-surface-3 shrink-0 border border-border">
          {item.video.thumbnailUrl ? (
            <img src={item.video.thumbnailUrl} alt={item.video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-4">
              <Play className="w-10 h-10 opacity-20" />
            </div>
          )}
          
          {/* Progress Bar Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
            <div 
              className="h-full bg-accent" 
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300">
               <Play className="w-6 h-6 text-white fill-current" />
             </div>
          </div>

          {item.completed && (
            <div className="absolute top-3 right-3 w-8 h-8 bg-accent rounded-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{item.video.category || "MODULE"}</p>
                 <div className="w-1 h-1 rounded-full bg-border" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">{timeAgo(item.lastWatchedAt)}</p>
              </div>
              <h3 className="font-black text-text-1 text-lg md:text-xl group-hover:text-accent transition-colors line-clamp-1 md:line-clamp-2 leading-tight">
                {item.video.title}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">
                BY {item.video.uploader?.name}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black text-text-2 uppercase tracking-[0.2em]">
              <span className={item.completed ? "text-accent" : "text-text-4"}>
                {pct}% ARCHIVED
              </span>
              <span className="text-text-4">
                {item.completed ? "SYNCHRONIZED" : `${formatTime(item.progressSeconds)} / ${formatTime(item.durationSeconds)}`}
              </span>
            </div>
            <div className="h-2 bg-surface-2 dark:bg-surface-3 rounded-full overflow-hidden border border-border">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${pct}%` }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="h-full bg-accent" 
               />
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
    if (!confirm("Delete all watch history artifacts?")) return;
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
        title="Playback Logs"
        description="Monitor your session history and archive progress."
        badge="ACTIVITY"
        action={
          history.length > 0 && (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 px-6 py-3 rounded-3xl bg-surface-1 border border-border shadow-inner">
                <div className="text-center">
                  <p className="text-xl font-black text-text-1 leading-none mb-1">{history.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">Sessions</p>
                </div>
              </div>
              <button 
                onClick={handleClear} 
                disabled={clearing}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {clearing ? "PURGING..." : "CLEAR LOGS"}
              </button>
            </div>
          )
        }
      />

      {loading ? (
        <div className="space-y-6">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-surface-2 dark:bg-surface-3 h-40 rounded-[32px] animate-pulse border border-border" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 space-y-10 bg-surface-1 dark:bg-surface-2 rounded-[40px] border border-dashed border-border group"
        >
          <div className="w-24 h-24 rounded-[32px] bg-surface-2 dark:bg-surface-3 flex items-center justify-center mx-auto text-text-4 border border-border shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
             <Clock className="w-10 h-10 opacity-20" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-black text-text-1 tracking-tight">Logs Empty</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4 max-w-xs mx-auto leading-relaxed">No playback artifacts detected. Initiate a module session to record activity.</p>
          </div>
          <button 
            onClick={() => router.push('/explore')}
            className="px-10 py-5 rounded-2xl bg-accent text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all border border-accent/20"
          >
            DISCOVER MODULES
          </button>
        </motion.div>
      ) : (
        <div className="space-y-16">
          <AnimatePresence mode="popLayout">
            {inProgress.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-accent" />
                    <h2 className="text-[10px] font-black text-text-1 uppercase tracking-[0.3em]">Active Sessions</h2>
                  </div>
                </div>
                <div className="space-y-6">
                  {inProgress.map((h) => <HistoryItem key={h._id} item={h} />)}
                </div>
              </motion.div>
            )}
            
            {completed.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-[10px] font-black text-text-1 uppercase tracking-[0.3em]">Archived Modules</h2>
                  </div>
                </div>
                <div className="space-y-6">
                  {completed.map((h) => <HistoryItem key={h._id} item={h} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PageContainer>
  );
}

