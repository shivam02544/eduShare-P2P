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
        title="Saved Archives"
        description="Access your collection of bookmarked modules."
        badge="BOOKMARKS"
        action={
          <div className="flex items-center gap-8 px-8 py-4 rounded-3xl bg-surface-1 dark:bg-surface-2 border border-border shadow-inner">
             <div className="text-center">
               <p className="text-2xl font-black text-text-1 leading-none mb-1">{videos.length}</p>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">Saved Nodes</p>
             </div>
             <div className="w-px h-10 bg-border" />
             <div className="text-center flex flex-col items-center">
               <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-1 border border-accent/20">
                 <Sparkles className="w-4 h-4 fill-current" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Active Sync</p>
             </div>
          </div>
        }
      />

      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <h2 className="text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">Personal Repository</h2>
        </div>

        {fetchError ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 space-y-8 text-center bg-rose-500/5 rounded-[40px] border border-dashed border-rose-500/20"
          >
            <div className="w-20 h-20 rounded-3xl bg-surface-1 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl">
              <AlertCircle className="w-10 h-10" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <p className="text-xl font-black text-text-1 tracking-tight">Access Protocol Failure</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">{fetchError}</p>
            </div>
            <button
              onClick={() => { setFetchError(null); setLoading(true); }}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-500/20"
            >
              Retry Connection
            </button>
          </motion.div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : videos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 space-y-10 bg-surface-1 dark:bg-surface-2 rounded-[40px] border border-dashed border-border group"
          >
            <div className="w-24 h-24 rounded-[32px] bg-surface-2 dark:bg-surface-3 flex items-center justify-center mx-auto text-text-4 border border-border shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
               <Bookmark className="w-10 h-10 opacity-20" />
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-black text-text-1 tracking-tight">Archives Empty</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4 max-w-xs mx-auto leading-relaxed">Initiate discovery protocol to populate your knowledge collection.</p>
            </div>
            <button 
              onClick={() => router.push('/explore')}
              className="px-10 py-5 rounded-2xl bg-accent text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all border border-accent/20"
            >
              Explore Network
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            <AnimatePresence mode="popLayout">
              {videos.map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
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

