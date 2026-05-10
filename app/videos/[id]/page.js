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
import PageContainer from "@/components/layouts/PageContainer";
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

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

function VideoSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-16 animate-pulse pb-32 px-8">
      <div className="aspect-video w-full rounded-[40px] bg-surface-2 dark:bg-surface-3 border border-border/50" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="h-24 w-3/4 bg-surface-2 dark:bg-surface-3 rounded-[32px]" />
          <div className="h-12 w-1/4 bg-surface-2 dark:bg-surface-3 rounded-2xl" />
        </div>
        <div className="h-96 bg-surface-2 dark:bg-surface-3 rounded-[40px]" />
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
  const [fetchError, setFetchError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (video?.title) {
      document.title = `${video.title} — Video Lesson`;
    }
  }, [video]);

  useEffect(() => {
    if (!user) return;
    setFetchError(null);
    Promise.all([
      fetch(`/api/videos/${id}`).then((r) => r.json()),
      authFetch(`/api/videos/${id}/quiz`).then((r) => r.json()),
      authFetch(`/api/watch-history`).then((r) => r.json()),
    ])
      .then(([videoData, quizData, historyData]) => {
        const myProgress = Array.isArray(historyData)
          ? historyData.find((h) => h.video?._id === id || h.video === id)
          : null;
        setVideo({ ...videoData, watchProgress: myProgress });
        setQuiz(quizData);
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message || "Failed to load video");
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (fetchError) return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
        <div className="w-24 h-24 rounded-[32px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/5">
          <AlertCircle className="w-10 h-10" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-text-1 tracking-tight">Access Protocol Failure</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">{fetchError}</p>
        </div>
        <button
          onClick={() => { setLoading(true); setFetchError(null); }}
          className="px-10 py-5 rounded-2xl bg-surface-1 dark:bg-surface-2 border border-border text-text-1 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface-2 transition-all shadow-xl"
        >
          Retry Connection
        </button>
      </div>
    </PageContainer>
  );

  if (!video || video.error) return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12">
        <div className="relative group">
           <div className="w-48 h-48 rounded-[40px] bg-surface-1 dark:bg-surface-2 flex items-center justify-center text-text-4 border border-border shadow-inner group-hover:scale-105 transition-transform duration-700">
             <AlertCircle className="w-20 h-20 opacity-10" aria-hidden="true" />
           </div>
           <motion.div 
             animate={{ rotate: -360 }}
             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             className="absolute -inset-8 border border-accent/10 rounded-full border-dashed"
           />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-text-1 tracking-tight">Session Terminated</h2>
          <p className="text-text-4 font-black uppercase tracking-[0.3em] text-[10px]">The requested node is inaccessible or has been archived.</p>
        </div>
        <Link href="/explore" className="group flex items-center gap-4 px-12 py-6 bg-text-1 text-bg rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-500" aria-hidden="true" />
          BACK TO NETWORK
        </Link>
      </div>
    </PageContainer>
  );

  return (
    <PageContainer>
      {/* ── Video Player ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={springConfig}
        className="relative aspect-video w-full rounded-[40px] overflow-hidden bg-black border border-border shadow-2xl group"
      >
        <video
          ref={videoRef}
          src={getCdnUrl(video.videoUrl)}
          controls
          className="w-full h-full"
          preload="metadata"
          poster={getCdnUrl(video.thumbnailUrl || "")}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration);
            if (video?.watchProgress?.progressSeconds > 10) {
              e.target.currentTime = video.watchProgress.progressSeconds;
            }
          }}
        />
      </motion.div>

      {/* ── Lesson Content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 mt-16">
        <div className="xl:col-span-2 space-y-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                 <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-accent text-bg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 border border-accent/20">
                    <Database className="w-4 h-4 fill-current" />
                    {video.subject || "MODULE"}
                 </div>
                 {video.boostedUntil && new Date(video.boostedUntil) > new Date() && (
                   <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-500/20 shadow-sm shadow-amber-500/5">
                      <Zap className="w-4 h-4 fill-current" />
                      PRIORITY NODE
                   </div>
                 )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-text-1 leading-[0.95] tracking-tight">
                {video.title}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-12 border-y border-border/50 py-10">
              <Link href={`/profile/${video.uploader?.firebaseUid}`} className="flex items-center gap-6 group/u">
                <div className="relative">
                  <div className="w-16 h-16 rounded-[24px] overflow-hidden border border-border group-hover/u:rotate-6 transition-transform duration-500 shadow-xl">
                    {video.uploader?.image ? (
                      <img src={video.uploader.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-accent text-bg flex items-center justify-center font-black text-2xl border border-accent">
                        {video.uploader?.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-surface-1 shadow-lg" />
                </div>
                 <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Contributor</span>
                  <span className="text-xl font-black text-text-1 group-hover/u:text-accent transition-colors uppercase tracking-tight">
                    {video.uploader?.name}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-12">
                 <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Engagements</span>
                  <div className="flex items-center gap-3 text-2xl font-black text-text-1">
                    <Activity className="w-5 h-5 text-accent" />
                    {video.views} 
                  </div>
                </div>
                <div className="w-px h-12 bg-border/50" />
                 <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Timestamp</span>
                  <div className="flex items-center gap-3 text-2xl font-black text-text-1">
                    <Calendar className="w-5 h-5 text-accent" />
                    {new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Video Actions: Interaction HUD */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6 flex-wrap"
          >
             <div className="px-6 py-4 rounded-3xl bg-surface-1 dark:bg-surface-2 border border-border flex items-center gap-6 shadow-inner">
              <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Reaction Protocol</span>
              <div className="w-px h-6 bg-border" />
              <LikeBookmarkBar item={video} type="video" />
            </div>
            
            <div className="p-1 rounded-3xl bg-surface-1 dark:bg-surface-2 border border-border shadow-sm">
               <AddToCollection videoId={id} />
            </div>

            {video?.uploader?.firebaseUid === user?.uid && (
              <div className="flex items-center gap-4">
                <BoostButton
                  type="video"
                  id={id}
                  boostedUntil={video.boostedUntil}
                  onBoosted={(until) => setVideo((v) => ({ ...v, boostedUntil: until }))}
                />
                 <button 
                  onClick={() => setAdminMode(!adminMode)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    adminMode 
                      ? "bg-text-1 text-bg border-transparent shadow-2xl" 
                      : "bg-surface-1 dark:bg-surface-2 border-border text-text-2 hover:bg-surface-2 shadow-sm"
                  }`}
                >
                  {adminMode ? "CLOSE ARCHIVE" : "CONFIGURE NODE"}
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
              className="bg-surface-1 dark:bg-surface-2 border border-border p-10 md:p-16 rounded-[40px] shadow-sm group hover:shadow-2xl hover:shadow-black/5 transition-all duration-700"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-[20px] bg-accent/10 flex items-center justify-center text-accent shadow-inner border border-accent/20">
                   <Archive className="w-6 h-6 fill-current" />
                </div>
                <div>
                   <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Module Overview</h2>
                   <p className="text-2xl font-black text-text-1 tracking-tight">Artifact Metadata</p>
                </div>
              </div>
               <div className="relative">
                 <div className="absolute inset-0 bg-accent/5 rounded-3xl blur-3xl -z-10 group-hover:bg-accent/10 transition-colors" />
                 <p className="text-lg font-medium text-text-2 leading-relaxed whitespace-pre-line bg-surface-2 dark:bg-surface-3 p-10 rounded-[32px] border border-border shadow-inner">{video.description}</p>
               </div>
            </motion.div>
          )}

          {/* Video Sections: Chapters indices */}
          {video.chapters?.length > 0 && (
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-surface-1 dark:bg-surface-2 border border-border p-10 md:p-16 rounded-[40px] shadow-sm"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-[20px] bg-surface-2 dark:bg-surface-3 text-text-1 flex items-center justify-center border border-border shadow-inner">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-[10px] font-black text-text-4 uppercase tracking-[0.3em]">Temporal Navigation</h2>
                   <p className="text-2xl font-black text-text-1 tracking-tight">Session Indices</p>
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
                className="bg-accent/5 border border-accent/20 p-10 md:p-16 rounded-[48px] flex flex-col md:flex-row md:items-center justify-between gap-12 shadow-2xl shadow-accent/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -z-10 group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-[32px] bg-accent text-bg flex items-center justify-center shrink-0 shadow-2xl shadow-accent/30 border border-accent/20">
                    <Zap className="w-10 h-10 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-2">Cognitive Validation</h2>
                    <p className="text-3xl font-black text-text-1 tracking-tight leading-none mb-4">Module Examination</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">
                      {quiz?.exists 
                        ? (quiz.attempted ? "PERFORMANCE ARTIFACTS AVAILABLE" : "TEST COGNITION & SECURE CREDITS") 
                        : "PORTAL UNDER MAINTENANCE"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Link 
                    href={`/videos/${id}/quiz`} 
                    className="w-full md:w-auto flex items-center justify-center gap-4 px-12 py-6 bg-accent text-bg rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent/20 border border-accent/20"
                  >
                    {quiz?.exists ? (quiz.attempted ? "VIEW ARTIFACTS" : "INITIATE EXAM") : (video?.uploader?.firebaseUid === user?.uid ? "CONSTRUCT PORTAL" : "VIEW PORTAL")}
                    <ArrowRight className="w-5 h-5" />
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
            className="bg-surface-1 dark:bg-surface-2 border border-border p-10 md:p-16 rounded-[40px] shadow-sm"
          >
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-accent/5 text-accent flex items-center justify-center border border-accent/10 shadow-inner">
                     <Activity className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-[10px] font-black text-text-4 uppercase tracking-[0.3em]">Network Discourse</h2>
                     <p className="text-2xl font-black text-text-1 tracking-tight">Public Feedback</p>
                  </div>
               </div>
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
                className="bg-surface-1 dark:bg-surface-2 border border-accent/30 p-10 rounded-[40px] shadow-2xl shadow-accent/5"
              >
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-12 h-12 rounded-[20px] bg-accent text-bg flex items-center justify-center shadow-lg shadow-accent/20">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1">Command Center</h2>
                    <p className="text-xl font-black text-text-1 tracking-tight">Node Configuration</p>
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
        </div>
      </div>
    </PageContainer>
  );
}
