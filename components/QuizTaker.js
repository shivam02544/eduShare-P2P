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
  const [securityStatus, setSecurityStatus] = useState("verified");
  const violationLimit = 3;
  const quizId = React.useId();
  const statusRegionId = React.useId();

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

  // ── Results Summary ──
  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-2xl mx-auto"
      >
        {/* Score Summary */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 md:p-10 text-center border ${
            result.passed
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-rose-500/5 border-rose-500/20"
          }`}
          role="region"
          aria-label="Quiz result"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" aria-hidden="true" />

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-6xl md:text-7xl font-bold mb-4 tracking-tighter ${result.passed ? "text-emerald-500" : "text-rose-500"}`}
            aria-hidden="true"
          >
            {result.score}<span className="text-2xl md:text-3xl font-bold opacity-40">%</span>
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <h2 className={`text-xl font-bold uppercase tracking-widest ${result.passed ? "text-emerald-500" : "text-rose-500"}`}>
              {result.passed ? "Quiz Passed" : "Quiz Failed"} — {result.score}%
            </h2>
            <p className="text-xs font-semibold text-text-3">
              {result.correctCount} of {result.totalQuestions} correct · Passing score: {result.passingScore}%
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-white dark:text-slate-900">+{result.creditsAwarded} Credits Earned</span>
              </motion.div>
            )}
            
            {result.passed && result.certificate && (
              <a 
                href={`/certificates/${result.certificate.certId}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-indigo-500/20 italic"
              >
                <Award className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                View Certificate
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            )}
          </div>
        </div>

        {/* Results Analysis */}
        <section aria-label="Detailed results" className="space-y-4">
          <h3 className="text-sm font-bold text-text-1 flex items-center gap-2 px-2">
            <Activity className="w-4 h-4 text-text-3" aria-hidden="true" />
            Question Results
          </h3>
          {result.results.map((r, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border p-5 md:p-6 rounded-3xl shadow-sm relative overflow-hidden ${
                r.correct ? "border-emerald-500/30" : "border-rose-500/30"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold italic border ${
                   r.correct ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                 }`}>
                   {i + 1}
                 </div>
                 <p className="text-sm font-bold text-text-1 tracking-tight italic">
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
                    <div key={oi} className={`text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-2xl border flex items-center gap-3 italic transition-all ${
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
        </section>
      </motion.div>
    );
  }

  // ── Quiz Interface ──
  return (
    <div className="space-y-12 pb-20">
      
      {/* Security Status */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Quiz security: ${securityStatus === "locked" ? "locked due to tab switching" : securityStatus === "warning" ? "warning — stay on this page" : "verified"}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`col-span-1 md:col-span-2 bg-slate-50 dark:bg-white/5 border p-5 md:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 transition-all duration-500 ${
          securityStatus === "locked" ? "border-rose-500 bg-rose-500/10" :
          securityStatus === "warning" ? "border-amber-500 bg-amber-500/10" : "border-border"
        }`}>
          <div className="flex items-center gap-5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                securityStatus === "locked" ? "bg-rose-500 text-white" :
                securityStatus === "warning" ? "bg-amber-500 text-white" : "bg-indigo-500 text-white"
              }`}
              aria-hidden="true"
            >
              {securityStatus === "locked" ? <Lock className="w-6 h-6" /> :
               securityStatus === "warning" ? <AlertTriangle className="w-6 h-6" /> :
               <ShieldCheck className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-3">Security Status</p>
              <p className={`text-sm font-bold ${
                securityStatus === "locked" ? "text-rose-500" :
                securityStatus === "warning" ? "text-amber-500" : "text-emerald-500"
              }`}>
                {securityStatus === "locked" ? "Locked" :
                 securityStatus === "warning" ? "Warning" : "Verified"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-text-3">Tab violations</p>
            <p className="text-sm font-bold text-text-1" aria-label={`${violations} of ${violationLimit} violations`}>{violations} / {violationLimit}</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 border border-border p-5 md:p-6 rounded-3xl flex flex-col justify-center gap-1">
           <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest opacity-50">Passing Score</p>
           <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-text-1 italic">{quiz.passingScore}%</span>
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500" style={{ width: `${quiz.passingScore}%` }} />
              </div>
           </div>
        </div>
        </div>
      </div>

      {/* Error rendered near submit button below */}

      {/* Question List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8" role="list" aria-label="Quiz questions">
        {quiz.questions.map((q, qi) => (
          <motion.article
            key={q._id}
            role="listitem"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: qi * 0.04 }}
            aria-label={`Question ${qi + 1}${answers[qi] !== null ? " — answered" : " — unanswered"}`}
            className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border p-6 md:p-8 rounded-3xl shadow-sm transition-shadow ${
              answers[qi] !== null ? "border-indigo-500/20" : "border-border"
            }`}
          >
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" aria-hidden="true" />
              Question {qi + 1} of {quiz.questions.length}
            </p>

            <p
              id={`${quizId}-q${qi}-text`}
              className="text-lg md:text-xl font-bold text-text-1 tracking-tight mb-6 leading-relaxed"
            >
              {q.question}
            </p>

            <div
              role="radiogroup"
              aria-labelledby={`${quizId}-q${qi}-text`}
              aria-required="true"
              className="space-y-3"
            >
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const optLabel = ["A", "B", "C", "D"][oi];
                return (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Option ${optLabel}: ${opt}`}
                    disabled={securityStatus === "locked"}
                    aria-disabled={securityStatus === "locked"}
                    onClick={() => {
                      const updated = [...answers];
                      updated[qi] = oi;
                      setAnswers(updated);
                    }}
                    onKeyDown={(e) => {
                      // Support arrow keys within radiogroup
                      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                        e.preventDefault();
                        const next = (oi + 1) % q.options.length;
                        const updated = [...answers];
                        updated[qi] = next;
                        setAnswers(updated);
                      }
                      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        const prev = (oi - 1 + q.options.length) % q.options.length;
                        const updated = [...answers];
                        updated[qi] = prev;
                        setAnswers(updated);
                      }
                    }}
                    tabIndex={isSelected || answers[qi] === null ? 0 : -1}
                    className={`group w-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 px-5 md:px-6 py-4 rounded-2xl border transition-all duration-300 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-950 shadow-xl"
                        : "bg-white dark:bg-white/5 border-border hover:border-indigo-500/40 text-text-1"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors flex-shrink-0 ${
                        isSelected
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-slate-50 dark:bg-white/5 border-border text-text-3"
                      }`}
                      aria-hidden="true"
                    >
                      {optLabel}
                    </div>
                    <span className="text-sm font-medium text-left flex-1">{opt}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.article>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="space-y-6 pt-10">
        {/* Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={answers.filter(a => a !== null).length}
          aria-valuemin={0}
          aria-valuemax={quiz.questions.length}
          aria-label={`${answers.filter(a => a !== null).length} of ${quiz.questions.length} questions answered`}
          className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-indigo-500"
          />
        </div>

        {error && (
          <div role="alert" className="bg-rose-500/5 border border-rose-500/20 px-6 py-4 rounded-2xl flex items-center gap-3 text-rose-500">
            <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting || securityStatus === "locked"}
          aria-disabled={!allAnswered || submitting || securityStatus === "locked"}
          aria-busy={submitting}
          aria-label={
            securityStatus === "locked" ? "Quiz is locked due to tab switching" :
            submitting ? "Submitting quiz, please wait" :
            allAnswered ? "Submit quiz" :
            `${quiz.questions.length - answers.filter(a => a !== null).length} questions remaining`
          }
          className="group relative w-full overflow-hidden rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-5 md:p-6 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-4">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <ShieldCheck className="w-5 h-5" aria-hidden="true" />}
            <span className="text-xs font-bold uppercase tracking-widest">
              {securityStatus === "locked" ? "Quiz Locked" :
               submitting ? "Submitting…" :
               allAnswered ? "Submit Quiz" :
               `${answers.filter(a => a !== null).length} / ${quiz.questions.length} answered`}
            </span>
          </div>
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[40px]" aria-hidden="true" />
        </button>
      </div>

    </div>
  );
}

