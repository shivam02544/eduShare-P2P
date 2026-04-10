"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard } from "@/components/Skeleton";
import { Activity, Users, Zap, Clock, Compass, Sparkles, User } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function FeedPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [feed, setFeed] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/feed")
      .then((r) => r.json())
      .then((d) => {
        setFeed(d.items || []);
        setEmpty(d.empty);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-32 px-6 md:px-0">
      
      {/* ── Activity Header ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
        className="relative overflow-hidden rounded-[40px] p-8 md:p-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border shadow-2xl text-center"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="mx-auto w-16 h-16 rounded-[24px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 mb-6">
          <Activity className="w-8 h-8" />
        </div>

        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Peer Network</span>
          <h1 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter leading-tight">
            Activity Stream
          </h1>
          <p className="text-sm font-medium text-text-3 max-w-sm mx-auto">
            Real-time updates and shared educational resources from your network of educators.
          </p>
        </div>
      </motion.div>

      {/* ── Feed Content ── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-text-3" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Network Updates</h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
            <Zap className="w-3 h-3" />
            Live Updates
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
             {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : empty ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 space-y-8"
          >
            <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-text-3 opacity-30 shadow-inner">
               <Users className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-black text-text-1 tracking-tighter">No Activity Yet</p>
              <p className="text-sm text-text-3 font-medium max-w-xs mx-auto">Your feed is empty. Follow other users to see their activity here.</p>
            </div>
            <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-transform hover:scale-105">
              Find People
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-12">
            <AnimatePresence>
              {feed.map((item, i) => (
                <motion.div 
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: i * 0.1 }}
                  className="space-y-4"
                >
                  {/* Uploader HUD */}
                  <div className="flex items-center justify-between px-2">
                    <Link href={`/profile/${item.uploader?.firebaseUid}`} className="flex items-center gap-4 group">
                      <div className="relative">
                        {item.uploader?.image ? (
                          <img src={item.uploader.image} alt="" className="w-10 h-10 rounded-[14px] object-cover ring-2 ring-border shadow-lg transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-10 h-10 rounded-[14px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-md bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-text-1 group-hover:text-indigo-500 transition-colors">
                          {item.uploader?.name}
                        </p>
                        <p className="text-[10px] font-black text-text-3 uppercase tracking-tighter mt-0.5">
                          Shared a new {item.kind}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-3 uppercase tracking-tighter bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(item.createdAt)}
                    </div>
                  </div>

                  {/* Asset Card */}
                  <div className="pl-14">
                    {item.kind === "video" ? (
                      <VideoCard video={item} />
                    ) : (
                      <NoteCard note={item} onDownload={async (note) => {
                        const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
                        const data = await res.json();
                        if (data.fileUrl) window.open(data.fileUrl, "_blank");
                      }} />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

