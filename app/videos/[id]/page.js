"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Comments from "@/components/Comments";
import LikeBookmarkBar from "@/components/LikeBookmarkBar";

import AddToCollection from "@/components/AddToCollection";
import BoostButton from "@/components/BoostButton";
import ChapterList from "@/components/ChapterList";
import ChapterEditor from "@/components/ChapterEditor";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import ReportButton from "@/components/ReportButton";
import { getCdnUrl } from "@/lib/cdn";
import { 
  Play, 
  User, 
  Calendar, 
  Eye, 
  Flag, 
  ChevronLeft, 
  Award, 
  BookOpen, 
  Zap, 
  Layout, 
  Clock,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Activity,
  Archive,
  Terminal,
  Cpu,
  Monitor,
  Target
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function VideoSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-12 animate-pulse pb-32 px-8">
      <div className="aspect-video w-full rounded-[64px] bg-slate-200 dark:bg-white/5 border border-border/50" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-16 w-3/4 bg-slate-200 dark:bg-white/5 rounded-3xl" />
          <div className="h-8 w-1/4 bg-slate-200 dark:bg-white/5 rounded-xl" />
        </div>
        <div className="h-96 bg-slate-200 dark:bg-white/5 rounded-[48px]" />
      </div>
    </div>
  );
}

export default function VideoPage() {
  const { id } = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const videoRef = useRef(null);
  const viewLogged = useRef(false);
  const [video, setVideo] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (video?.title) {
      document.title = `${video.title} — Video Lesson`;
    }
  }, [video]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/videos/${id}`).then((r) => r.json()),
      authFetch(`/api/videos/${id}/quiz`).then((r) => r.json()),
      authFetch(`/api/watch-history`).then((r) => r.json()),
    ]).then(([videoData, quizData, historyData]) => {
      const myProgress = Array.isArray(historyData)
        ? historyData.find((h) => h.video?._id === id || h.video === id)
        : null;
      setVideo({ ...videoData, watchProgress: myProgress });
      setQuiz(quizData);
      setLoading(false);
    });
  }, [id, user]);

  useWatchProgress({
    videoRef,
    videoId: id,
    authFetch,
    enabled: !!video && !!user,
  });

  useEffect(() => {
    if (video && user && !viewLogged.current) {
      viewLogged.current = true;
      authFetch(`/api/videos/${id}/view`, { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (d.message?.includes("credits")) {
             toast.success(d.message, {
               icon: <Zap className="w-5 h-5 text-amber-500" />,
               style: { borderRadius: '24px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }
             });
          }
        });
    }
  }, [video, user, id, authFetch]);

  if (authLoading || loading) return <VideoSkeleton />;
  if (!video || video.error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center space-y-10">
      <div className="relative">
         <div className="w-40 h-40 rounded-[48px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner">
           <AlertCircle className="w-20 h-20" />
         </div>
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute -inset-4 border border-indigo-500/20 rounded-full border-dashed"
         />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-text-1 tracking-tighter">Video Not Found</h2>
        <p className="text-text-3 font-bold uppercase tracking-widest text-[10px]">Access Denied or Video Offline</p>
      </div>
      <Link href="/explore" className="group flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] font-bold text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Go Back
      </Link>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-16 pb-40 px-8">

      {/* ── Video Player ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={springConfig}
        className="relative aspect-video w-full rounded-[64px] overflow-hidden bg-slate-950 shadow-3xl ring-1 ring-white/10"
      >
        <video
          ref={videoRef}
          src={getCdnUrl(video.videoUrl)}
          controls
          className="w-full h-full shadow-inner"
          preload="metadata"
          poster={getCdnUrl(video.thumbnailUrl || "")}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration);
            if (video?.watchProgress?.progressSeconds > 10) {
              e.target.currentTime = video.watchProgress.progressSeconds;
            }
          }}
        />
        <div className="absolute top-8 left-8 p-1.5 px-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest pointer-events-none">
           Video Player
        </div>
      </motion.div>

      {/* ── Lesson Content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        <div className="xl:col-span-2 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20">
                    <Database className="w-3.5 h-3.5" />
                    {video.subject || "Lesson"}
                 </div>
                 {video.boostedUntil && new Date(video.boostedUntil) > new Date() && (
                   <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/20 animate-pulse">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Featured
                   </div>
                 )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-text-1 tracking-tighter leading-tight">
                {video.title}
              </h1>
            </div>

            <div className="flex items-center gap-6 justify-between border-b border-border/50 pb-10 pt-4">
              <Link href={`/profile/${video.uploader?.firebaseUid}`} className="flex items-center gap-5 group">
                <div className="relative">
                  <div className="w-14 h-14 rounded-[28px] overflow-hidden border border-border shadow-2xl transition-transform group-hover:scale-105 active:scale-95">
                    {video.uploader?.image ? (
                      <img src={video.uploader.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 font-bold text-lg">
                        {video.uploader?.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                     <ShieldCheck className="w-5 h-5 text-indigo-500 fill-white dark:fill-slate-950" />
                  </div>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-text-1 group-hover:text-indigo-500 transition-colors tracking-tight">
                    {video.uploader?.name}
                  </p>
                  <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest mt-1 opacity-50">Course Instructor</p>
                </div>
              </Link>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-text-1 font-bold text-xl leading-none">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    {video.views} 
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-3 opacity-40">Views</span>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-text-1 font-bold text-xl leading-none">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-3 opacity-40">Posted On</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Video Actions: Interaction HUD */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <div className="p-2 px-6 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-border flex items-center gap-4 shadow-sm hover:border-indigo-500/30 transition-all group">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-3 group-hover:text-indigo-500 transition-colors">Likes</span>
              <div className="w-px h-6 bg-border/50" />
              <LikeBookmarkBar item={video} type="video" />
            </div>
            
            <div className="p-1 px-2 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-border shadow-sm hover:border-indigo-500/30 transition-all">
               <AddToCollection videoId={id} />
            </div>

            {video?.uploader?.firebaseUid === user?.uid && (
              <div className="flex items-center gap-2">
                <BoostButton
                  type="video"
                  id={id}
                  boostedUntil={video.boostedUntil}
                  onBoosted={(until) => setVideo((v) => ({ ...v, boostedUntil: until }))}
                />
                <button 
                  onClick={() => setAdminMode(!adminMode)}
                  className={`px-6 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    adminMode 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" 
                      : "bg-white dark:bg-white/5 border-border text-text-3 hover:text-indigo-500 hover:border-indigo-500/50"
                  }`}
                >
                  {adminMode ? "Close Settings" : "Edit Video"}
                </button>
              </div>
            )}
            
            <div className="ml-auto">
              <ReportButton contentType="video" contentId={id} compact />
            </div>
          </motion.div>

          {/* Description */}
          {video.description && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-10 rounded-[56px] shadow-2xl relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all">
                 <Terminal className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                   <Archive className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Information</span>
                   <span className="text-lg font-bold text-text-1">Description</span>
                </div>
              </div>
              <p className="text-[16px] font-medium text-text-2 leading-relaxed whitespace-pre-line opacity-90">{video.description}</p>
            </motion.div>
          )}

          {/* Video Sections: Chapters indices */}
          {video.chapters?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-10 rounded-[56px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px]" />
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-[28px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl">
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-1 tracking-tighter">Video Chapters</h2>
                  <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mt-1 opacity-50">Video Sections</p>
                </div>
              </div>
              <ChapterList
                chapters={video.chapters}
                videoRef={videoRef}
                videoDuration={duration}
              />
            </motion.div>
          )}
          
          {/* Quiz Gateway CTA */}
          <AnimatePresence>
            {(quiz?.exists || (video?.uploader?.firebaseUid === user?.uid)) && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-indigo-500/20 p-8 md:p-12 rounded-[40px] md:rounded-[56px] shadow-2l relative group overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -z-10 transition-transform duration-1000 group-hover:scale-150" />
                
                <div className="flex items-center gap-5 md:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-[24px] md:rounded-[28px] bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30 shrink-0">
                    <Zap className="w-7 h-7 md:w-8 md:h-8 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-text-1 tracking-tighter">Video Knowledge Quiz</h2>
                    <p className="text-[10px] md:text-[11px] font-bold text-text-3 uppercase tracking-widest mt-1 opacity-70">
                      {quiz?.exists 
                        ? (quiz.attempted ? "Review your performance" : "Test your knowledge & earn credits") 
                        : "No quiz available currently"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Link 
                    href={`/videos/${id}/quiz`} 
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] md:rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all group/btn"
                  >
                    {quiz?.exists ? (quiz.attempted ? "View Results" : "Take the Quiz") : (video?.uploader?.firebaseUid === user?.uid ? "Create Quiz Module" : "View Quiz Portal")}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Discussion: Comments Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-10 rounded-[64px] shadow-3xl"
          >
            <div className="flex items-center justify-between mb-10 px-4">
               <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <span className="text-xl font-bold text-text-1 tracking-tight">Comments</span>
               </div>
               <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-40">Real-time</span>
            </div>
            <Comments videoId={id} />
          </motion.div>
        </div>

        {/* Sidebar Space: Settings & Management */}
        <div className="space-y-12">
          

          {/* Chapter Manager (Admin Only) */}
          <AnimatePresence>
            {adminMode && video?.uploader?.firebaseUid === user?.uid && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-indigo-500/30 p-10 rounded-[56px] shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 rounded-[28px] bg-indigo-500 text-white flex items-center justify-center shadow-xl">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-1 tracking-tighter">Dashboard</h2>
                    <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest mt-1 opacity-50">
                      Manage Chapters
                    </p>
                  </div>
                </div>
                <ChapterEditor
                  videoId={id}
                  initialChapters={video.chapters || []}
                  onSaved={(chapters) => setVideo((v) => ({ ...v, chapters }))}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-5 px-10 py-5 rounded-[32px] bg-slate-50 dark:bg-white/5 text-text-2 border border-border text-[11px] font-bold uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all active:scale-95 shadow-xl"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
