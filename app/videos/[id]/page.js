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

const springConfig = { mass: 1, tension: 120, friction: 20 };

function VideoSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-12 animate-pulse pb-32 px-8">
      <div className="aspect-video w-full rounded-3xl bg-slate-200 dark:bg-white/5 border border-border/50" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-16 w-3/4 bg-slate-200 dark:bg-white/5 rounded-3xl" />
          <div className="h-8 w-1/4 bg-slate-200 dark:bg-white/5 rounded-xl" />
        </div>
        <div className="h-96 bg-slate-200 dark:bg-white/5 rounded-2xl" />
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <AlertCircle className="w-10 h-10" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-1">Could Not Load Video</h2>
          <p className="text-sm text-text-3">{fetchError}</p>
        </div>
        <button
          onClick={() => { setLoading(true); setFetchError(null); }}
          className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Retry
        </button>
      </div>
    </PageContainer>
  );

  if (!video || video.error) return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3">
          <AlertCircle className="w-10 h-10" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-1">Video Not Found</h2>
          <p className="text-sm font-medium text-text-3">Access Denied or Video Offline</p>
        </div>
        <Link href="/explore" className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Browse Content
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
        className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-border"
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mt-8">
        <div className="xl:col-span-2 space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">
                    <Database className="w-4 h-4" />
                    {video.subject || "Lesson"}
                 </div>
                 {video.boostedUntil && new Date(video.boostedUntil) > new Date() && (
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-500/20">
                      <Zap className="w-4 h-4" />
                      Featured
                   </div>
                 )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-1 leading-tight">
                {video.title}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-y border-border py-6">
              <Link href={`/profile/${video.uploader?.firebaseUid}`} className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                    {video.uploader?.image ? (
                      <img src={video.uploader.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-2 font-bold text-lg">
                        {video.uploader?.name?.[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-1 group-hover:text-indigo-500 transition-colors">
                    {video.uploader?.name}
                  </p>
                  <p className="text-xs text-text-3 font-medium mt-0.5">Course Instructor</p>
                </div>
              </Link>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-text-1 font-bold text-lg">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    {video.views} 
                  </div>
                  <span className="text-xs font-medium text-text-3">Views</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-text-1 font-bold text-lg">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <span className="text-xs font-medium text-text-3">Posted On</span>
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
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center gap-4">
              <span className="text-xs font-bold text-text-2">Likes</span>
              <div className="w-px h-4 bg-border" />
              <LikeBookmarkBar item={video} type="video" />
            </div>
            
            <div className="px-2 py-1 rounded-xl bg-white dark:bg-slate-900 border border-border">
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    adminMode 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent" 
                      : "bg-white dark:bg-slate-900 border-border text-text-2 hover:bg-slate-50 dark:hover:bg-white/5"
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
              className="bg-white dark:bg-slate-900 border border-border p-6 md:p-8 rounded-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <Archive className="w-5 h-5" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-text-1">Description</h2>
                </div>
              </div>
              <p className="text-sm font-medium text-text-2 leading-relaxed whitespace-pre-line">{video.description}</p>
            </motion.div>
          )}

          {/* Video Sections: Chapters indices */}
          {video.chapters?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-border p-6 md:p-8 rounded-3xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-text-1 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-1">Video Chapters</h2>
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
                className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-1">Video Knowledge Quiz</h2>
                    <p className="text-sm font-medium text-text-3 mt-1">
                      {quiz?.exists 
                        ? (quiz.attempted ? "Review your performance" : "Test your knowledge & earn credits") 
                        : "No quiz available currently"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Link 
                    href={`/videos/${id}/quiz`} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    {quiz?.exists ? (quiz.attempted ? "View Results" : "Take the Quiz") : (video?.uploader?.firebaseUid === user?.uid ? "Create Quiz Module" : "View Quiz Portal")}
                    <ArrowRight className="w-4 h-4" />
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
            className="bg-white dark:bg-slate-900 border border-border p-6 md:p-8 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <span className="text-lg font-bold text-text-1">Comments</span>
               </div>
            </div>
            <Comments videoId={id} />
          </motion.div>
        </div>

        {/* Sidebar Space: Settings & Management */}
        <div className="space-y-8">
          
          {/* Chapter Manager (Admin Only) */}
          <AnimatePresence>
            {adminMode && video?.uploader?.firebaseUid === user?.uid && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 border border-indigo-500/30 p-6 rounded-3xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-1">Dashboard</h2>
                    <p className="text-xs font-medium text-text-3">
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
        </div>
      </div>
    </PageContainer>
  );
}
