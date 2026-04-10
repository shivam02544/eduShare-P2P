"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/VideoCard";
import { SkeletonCard } from "@/components/Skeleton";
import { Bookmark, Compass, Sparkles, AlertCircle } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function BookmarksPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => { setVideos(d); setLoading(false); });
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-6 md:px-0">
      
      {/* ── Repository Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="relative overflow-hidden rounded-[40px] p-8 md:p-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <Bookmark className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Saved Resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter leading-tight">
              Bookmarked Lessons
            </h1>
            <p className="text-sm font-medium text-text-3 max-w-lg">
              A curated collection of your bookmarked lessons for quick reference and learning.
            </p>
          </div>

          <div className="flex items-center gap-6 px-8 py-6 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-border shadow-inner">
             <div className="text-center">
               <p className="text-[20px] font-black text-text-1 leading-none mb-1">{videos.length}</p>
               <p className="text-[9px] font-black uppercase tracking-widest text-text-3">Saved Items</p>
             </div>
             <div className="w-px h-8 bg-border" />
             <div className="text-center">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto mb-1">
                 <Sparkles className="w-4 h-4" />
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest text-text-3">Sync Active</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── Resource Matrix ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-4">
          <h2 className="text-sm font-black text-text-1 uppercase tracking-widest">My Bookmarks</h2>
          <div className="text-[10px] font-black text-text-3 uppercase">Priority Sort</div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : videos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 space-y-6 bg-white/50 dark:bg-slate-900/50 rounded-[48px] border border-dashed border-border"
          >
            <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-text-3 opacity-30 shadow-inner">
               <Compass className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black text-text-1 tracking-tight">No Bookmarks Yet</p>
              <p className="text-sm text-text-3 font-medium">Explore the platform to find and save educational resources.</p>
            </div>
            <button 
              onClick={() => router.push('/explore')}
              className="px-8 py-3 rounded-2xl bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
            >
              Explore Lessons
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {videos.map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: i * 0.05 }}
                >
                  <VideoCard video={v} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

