"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/VideoCard";
import { SkeletonCard } from "@/components/Skeleton";
import { Bookmark, Compass, Sparkles, AlertCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function BookmarksPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/bookmarks")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load bookmarks (${r.status})`);
        return r.json();
      })
      .then((d) => { setVideos(Array.isArray(d) ? d : []); setLoading(false); })
      .catch((err) => { setFetchError(err.message); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <PageContainer>
      <SectionHeader 
        title="Bookmarked Lessons"
        badge="Saved Resources"
        action={
          <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-border">
             <div className="text-center">
               <p className="text-lg font-bold text-text-1 leading-none mb-1">{videos.length}</p>
               <p className="text-xs font-medium text-text-3">Saved Items</p>
             </div>
             <div className="w-px h-8 bg-border" />
             <div className="text-center flex flex-col items-center">
               <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-1">
                 <Sparkles className="w-3 h-3" />
               </div>
               <p className="text-[10px] font-bold uppercase tracking-wider text-text-3">Sync Active</p>
             </div>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h2 className="text-sm font-bold text-text-1">My Bookmarks</h2>
        </div>

        {fetchError ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-border">
            <AlertCircle className="w-10 h-10 text-rose-400" aria-hidden="true" />
            <p className="text-sm font-bold text-text-1">Could Not Load Bookmarks</p>
            <p className="text-xs text-text-3">{fetchError}</p>
            <button
              onClick={() => { setFetchError(null); setLoading(true); }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >Retry</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : videos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 space-y-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-border"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-white/5 flex items-center justify-center mx-auto text-text-3">
               <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-text-1">No Bookmarks Yet</p>
              <p className="text-sm text-text-3">Explore the platform to find and save educational resources.</p>
            </div>
            <button 
              onClick={() => router.push('/explore')}
              className="px-6 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
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
    </PageContainer>
  );
}

