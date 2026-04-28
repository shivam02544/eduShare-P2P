"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QuizTaker from "@/components/QuizTaker";
import QuizBuilder from "@/components/QuizBuilder";
import { 
  ChevronLeft, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  Target
} from "lucide-react";

export default function QuizPage() {
  const { id } = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [video, setVideo] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/videos/${id}`).then((r) => r.json()),
      authFetch(`/api/videos/${id}/quiz`).then((r) => r.json()),
    ]).then(([videoData, quizData]) => {
      setVideo(videoData);
      setQuiz(quizData);
      setLoading(false);
    });
  }, [id, user, authFetch]);

  if (authLoading || loading) return (
    <div className="max-w-[1440px] mx-auto space-y-12 animate-pulse pb-32 px-5 md:px-8 mt-10">
      <div className="h-12 w-1/3 bg-slate-200 dark:bg-white/5 rounded-3xl" />
      <div className="h-96 w-full bg-slate-200 dark:bg-white/5 rounded-[48px]" />
    </div>
  );

  if (!video || (!quiz?.exists && video?.uploader?.firebaseUid !== user?.uid)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center space-y-8">
        <AlertCircle className="w-20 h-20 text-text-3 opacity-20" />
        <h2 className="text-3xl font-bold text-text-1 tracking-tighter">No Quiz Available</h2>
        <Link href={`/videos/${id}`} className="flex items-center gap-4 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-bold uppercase hover:scale-105 transition-all text-sm">
          <ChevronLeft className="w-5 h-5" />
          Return to Video
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 pb-40 px-5 md:px-8 mt-6 md:mt-10">
      {/* ── Navigation Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link href={`/videos/${id}`} className="group flex items-center gap-3 text-text-2 hover:text-indigo-500 transition-colors w-fit">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:scale-105 transition-all">
             <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest italic">Back to Lesson</span>
        </Link>
        <div className="flex items-center gap-4">
           <div className="h-10 px-4 rounded-xl border border-border flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
             <Target className="w-4 h-4 text-indigo-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-text-2 truncate max-w-[150px] md:max-w-[300px]">
               {video.title}
             </span>
           </div>
        </div>
      </motion.div>

      {/* ── Main Quiz Container ── */}
      <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-6 md:p-14 rounded-[32px] md:rounded-[56px] shadow-2l relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -z-10 transition-transform duration-1000 group-hover:scale-150" />
            
            <div className="space-y-10 md:space-y-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-5 md:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-[24px] md:rounded-[28px] bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <Zap className="w-7 h-7 md:w-8 md:h-8 fill-current" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-1 tracking-tighter">Video Knowledge Quiz</h1>
                    <p className="text-[9px] md:text-[10px] font-bold text-text-3 uppercase tracking-widest mt-1 opacity-50">
                      {quiz?.exists ? (
                        quiz.attempted
                          ? `Attempted • Highest Score: ${quiz.attempt.score}%`
                          : `Quiz Pending • Take the test`
                      ) : "Quiz Creation Portal"}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  {quiz?.exists && quiz.attempted && (
                    <div className={`px-6 py-3 rounded-2xl border text-[10px] md:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 md:gap-3 ${
                      quiz.attempt.passed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    }`}>
                        {quiz.attempt.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {quiz.attempt.passed ? "Passed" : "Failed"}
                    </div>
                  )}

                  {video?.uploader?.firebaseUid === user?.uid && (
                    <button 
                      onClick={() => setAdminMode(!adminMode)}
                      className={`px-6 py-3 rounded-2xl border text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
                        adminMode 
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" 
                          : "bg-white dark:bg-white/5 border-border text-text-3 hover:text-indigo-500 hover:border-indigo-500/50"
                      }`}
                    >
                      {adminMode ? "Exit Edit Mode" : (quiz?.exists ? "Edit Quiz" : "Create Quiz")}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Student View (Take Test) ── */}
              {quiz?.exists && !adminMode && (
                <div className="pt-2">
                  <QuizTaker
                    quiz={quiz}
                    videoId={id}
                    onComplete={(result) => {
                      setQuiz((prev) => ({
                        ...prev,
                        attempted: true,
                        attempt: { score: result.score, passed: result.passed, creditsAwarded: result.creditsAwarded },
                      }));
                    }}
                  />
                </div>
              )}

              {/* ── Admin View (Create/Edit) ── */}
              <AnimatePresence>
                {adminMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`overflow-hidden ${quiz?.exists ? "pt-10 border-t border-border/50 md:mt-10" : ""}`}
                  >
                      <div className="flex items-center gap-3 mb-6 md:mb-8 text-text-3 opacity-60 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-border w-fit">
                        <Cpu className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Instructor Build Mode Active</span>
                      </div>
                      <QuizBuilder
                      videoId={id}
                      existingQuiz={quiz?.exists ? quiz : null}
                      onSaved={() => authFetch(`/api/videos/${id}/quiz`).then(r => r.json()).then(setQuiz)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
      </AnimatePresence>
    </div>
  );
}
