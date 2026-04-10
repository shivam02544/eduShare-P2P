"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Award, 
  FileText, 
  ChevronRight, 
  Zap, 
  Loader2, 
  Sparkles, 
  Trophy,
  Target,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Lock,
  AlertTriangle
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function QuizTaker({ quiz, videoId, onComplete }) {
  const { authFetch } = useAuth();
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [violations, setViolations] = useState(0);
  const [securityStatus, setSecurityStatus] = useState("verified"); // verified, warning, locked
  const violationLimit = 3;

  const allAnswered = answers.every((a) => a !== null);
  const progressPercent = (answers.filter((a) => a !== null).length / quiz.questions.length) * 100;

  useEffect(() => {
    if (result) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const next = prev + 1;
          if (next >= violationLimit) {
            setSecurityStatus("locked");
            setError("Quiz Locked: Tab switching detected.");
          } else {
            setSecurityStatus("warning");
          }
          return next;
        });
      }
    };

    const handleBlur = () => {
      setSecurityStatus("warning");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [result]);

  const handleSubmit = async () => {
    if (securityStatus === "locked") return setError("Locked: Quiz security compromised.");
    if (!allAnswered) return setError("Please answer all questions.");
    setError("");
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/videos/${videoId}/quiz/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, violations }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      onComplete?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Result Matrix ──
  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-2xl mx-auto"
      >
        {/* Score HUD */}
        <div className={`relative overflow-hidden rounded-[48px] p-10 text-center border shadow-3xl ${
          result.passed
            ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/10"
            : "bg-rose-500/5 border-rose-500/20 shadow-rose-500/10"
        }`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-7xl font-black mb-4 italic tracking-tighter ${result.passed ? "text-emerald-500" : "text-rose-500"}`}
          >
            {result.score}<span className="text-3xl font-black opacity-40">%</span>
          </motion.div>
          
          <div className="flex flex-col items-center gap-2">
            <h2 className={`text-xl font-black uppercase tracking-[0.2em] ${result.passed ? "text-emerald-500" : "text-rose-500"}`}>
              {result.passed ? "Success" : "Failed"}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-3">
              {result.correctCount} / {result.totalQuestions} Correct · Required: {result.passingScore}%
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {result.creditsAwarded > 0 && (
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-3 bg-slate-900 dark:bg-white px-6 py-3 rounded-2xl shadow-xl"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-slate-900">+{result.creditsAwarded} Credits Earned</span>
              </motion.div>
            )}
            
            {result.passed && result.certificate && (
              <a 
                href={`/certificates/${result.certificate.certId}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-indigo-500/20 italic"
              >
                <Award className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                View Certificate
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            )}
          </div>
        </div>

        {/* Answer Breakdown Matrix */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
             <Activity className="w-4 h-4 text-text-3" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Quiz Results</p>
          </div>
          {result.results.map((r, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border p-6 rounded-[32px] shadow-sm relative overflow-hidden ${
                r.correct ? "border-emerald-500/30" : "border-rose-500/30"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black italic border ${
                   r.correct ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                 }`}>
                   {i + 1}
                 </div>
                 <p className="text-sm font-black text-text-1 tracking-tight italic">
                   {r.question}
                 </p>
                 <div className="ml-auto">
                    {r.correct ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <ShieldAlert className="w-5 h-5 text-rose-500" />}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {r.options.map((opt, oi) => {
                  const isSelected = r.selectedIndex === oi;
                  const isCorrect = r.correctIndex === oi;
                  return (
                    <div key={oi} className={`text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-2xl border flex items-center gap-3 italic transition-all ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                        : isSelected && !isCorrect
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        : "bg-slate-50 dark:bg-white/5 border-border text-text-3 opacity-50"
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
                      {opt}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ── Protocol Interface ──
  return (
    <div className="space-y-12 pb-20">
      
      {/* Integrity HUD & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`col-span-1 md:col-span-2 bg-slate-50 dark:bg-white/5 border p-6 rounded-[32px] flex items-center justify-between gap-6 transition-all duration-500 ${
          integrityStatus === "breached" ? "border-rose-500 bg-rose-500/10" : 
          integrityStatus === "warning" ? "border-amber-500 bg-amber-500/10" : "border-border"
        }`}>
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
              integrityStatus === "breached" ? "bg-rose-500 text-white scale-110" : 
              integrityStatus === "warning" ? "bg-amber-500 text-white animate-pulse" : "bg-indigo-500 text-white"
            }`}>
               {integrityStatus === "breached" ? <Lock className="w-6 h-6" /> : 
                integrityStatus === "warning" ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em]">Quiz Security Status</p>
              <p className={`text-sm font-bold tracking-tight ${
                securityStatus === "locked" ? "text-rose-500" : 
                securityStatus === "warning" ? "text-amber-500" : "text-emerald-500"
              }`}>
                {securityStatus === "locked" ? "LOCKED" : 
                 securityStatus === "warning" ? "WARNING" : "Verified"}
              </p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-50">Violations</p>
             <p className="text-sm font-bold text-text-1">{violations} / {violationLimit}</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 border border-border p-6 rounded-[32px] flex flex-col justify-center gap-1">
           <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-50">Passing Score</p>
           <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-text-1 italic">{quiz.passingScore}%</span>
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500" style={{ width: `${quiz.passingScore}%` }} />
              </div>
           </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-500/5 border border-rose-500/20 px-6 py-4 rounded-[28px] flex items-center gap-4 text-rose-500 italic shadow-inner"
        >
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
        </motion.div>
      )}

          {/* Question Matrix Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {quiz.questions.map((q, qi) => (
          <motion.div 
            key={q._id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: qi * 0.05 }}
            className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border p-8 rounded-[48px] shadow-sm hover:shadow-2xl transition-all ${
              answers[qi] !== null ? "border-indigo-500/20" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-8">
               <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                 <Target className="w-3.5 h-3.5" />
                 Question {qi + 1}
               </span>
               <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-30 italic">Question ID: {q._id.slice(-6)}</div>
            </div>
            
            <p className="text-xl font-bold text-text-1 tracking-tight mb-10 leading-relaxed min-h-[4rem]">
              {q.question}
            </p>

            <div className="space-y-3">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  disabled={securityStatus === "locked"}
                  onClick={() => {
                    const updated = [...answers];
                    updated[qi] = oi;
                    setAnswers(updated);
                  }}
                  className={`group w-full flex items-center gap-5 px-6 py-4 rounded-[28px] border transition-all duration-300 disabled:opacity-20 ${
                    answers[qi] === oi
                      ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-950 shadow-xl"
                      : "bg-white dark:bg-white/5 border-border hover:border-indigo-500/40 text-text-1"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${
                    answers[qi] === oi
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-slate-50 dark:bg-white/5 border-border text-text-3 group-hover:bg-indigo-500 group-hover:text-white"
                  }`}>
                    {["A","B","C","D"][oi]}
                  </div>
                  <span className="text-[14px] font-bold italic text-left flex-1">{opt}</span>
                  {answers[qi] === oi && (
                    <motion.div layoutId={`check-${qi}`} className="mr-2">
                       <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="space-y-6 pt-10">
        {/* Progress Vector */}
        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting || integrityStatus === "breached"}
          className="group relative w-full overflow-hidden rounded-[32px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-6 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-3xl disabled:opacity-50"
        >
          <div className="flex items-center gap-4">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            <span className="text-[11px] font-bold uppercase tracking-widest">
              {securityStatus === "locked" ? "QUIZ LOCKED" : 
               submitting ? "Submitting..." : 
               allAnswered ? "Submit Quiz" : `Answer all questions (${answers.filter(a => a !== null).length} / ${quiz.questions.length})`}
            </span>
          </div>
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[40px]" />
        </button>
      </div>

    </div>
  );
}

