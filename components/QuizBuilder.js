"use client";
import React, { useState, useRef, useId } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Trash2,
  Plus,
  Save,
  Send,
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronDown,
  Circle,
  Check,
  Zap,
  Layers,
  Target
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const EMPTY_QUESTION = () => ({
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuizBuilder({ videoId, existingQuiz, onSaved }) {
  const { authFetch } = useAuth();
  const formId = useId();
  const statusId = useId();

  const [questions, setQuestions] = useState(
    existingQuiz?.questions?.map((q) => ({
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex ?? 0,
    })) || [EMPTY_QUESTION()]
  );
  const [passingScore, setPassingScore] = useState(existingQuiz?.passingScore || 70);
  const [isPublished, setIsPublished] = useState(existingQuiz?.isPublished || false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSource, setAiSource] = useState("description");
  const [customNotes, setCustomNotes] = useState("");

  const generateWithAI = async () => {
    if (aiSource === "notes" && !customNotes.trim()) {
      return setError("Please provide custom notes or select the video description source.");
    }
    setGeneratingAI(true);
    setError(""); setSuccess("");
    try {
      const res = await authFetch(`/api/videos/${videoId}/ai-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: aiSource, customNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI Generation Failed");

      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data.map((q) => ({
          question: q.question || "",
          options: q.options || ["", "", "", ""],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        })));
        setSuccess(`AI generated ${data.length} questions. Please review before saving.`);
      } else {
        throw new Error("AI returned invalid structure.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const addQuestion = () => {
    if (questions.length >= 10) return;
    setQuestions([...questions, EMPTY_QUESTION()]);
  };

  const removeQuestion = (i) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i, field, value) => {
    const updated = [...questions];
    updated[i] = { ...updated[i], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
  };

  const handleSave = async (publish = false) => {
    setError(""); setSuccess("");
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return setError(`Question ${i + 1} text is required.`);
      if (q.options.some((o) => !o.trim())) return setError(`Question ${i + 1} has empty answer options.`);
    }

    setSaving(true);
    try {
      const res = await authFetch(`/api/videos/${videoId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, passingScore, isPublished: publish }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsPublished(publish);
      setSuccess(publish ? "Quiz published successfully." : "Draft saved.");
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;
    setDeleting(true);
    await authFetch(`/api/videos/${videoId}/quiz`, { method: "DELETE" });
    setDeleting(false);
    onSaved?.();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" role="main" aria-label="Quiz Builder">

      {/* ── Status Messages ── */}
      <div aria-live="polite" aria-atomic="true" id={statusId}>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="alert"
              className="bg-rose-500/5 border border-rose-500/20 px-6 py-4 rounded-3xl flex items-center gap-4 text-rose-500"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="status"
              className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-4 rounded-3xl flex items-center gap-4 text-emerald-500"
            >
              <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Settings ── */}
      <fieldset className="bg-slate-50 dark:bg-white/5 border border-border p-5 md:p-6 rounded-3xl">
        <legend className="sr-only">Quiz Settings</legend>
        <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <label htmlFor={`${formId}-passing-score`} className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em]">
                Passing Score
              </label>
              <div className="relative">
                <select
                  id={`${formId}-passing-score`}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-border rounded-xl px-4 py-2 text-xs font-semibold text-text-1 outline-none cursor-pointer appearance-none pr-10 hover:border-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                >
                  {[50, 60, 70, 80, 90, 100].map((v) => (
                    <option key={v} value={v}>{v}% to Pass</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            <div className="w-px h-10 bg-border hidden md:block" aria-hidden="true" />

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em]" id={`${formId}-progress-label`}>
                Progress
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-32 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={questions.length}
                  aria-valuemin={1}
                  aria-valuemax={10}
                  aria-label={`${questions.length} of 10 questions added`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(questions.length / 10) * 100}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
                <span className="text-xs font-semibold text-text-1" aria-live="polite">{questions.length}/10</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2" aria-hidden="true">
            <Layers className="w-4 h-4 text-text-3" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-3">Editing</span>
          </div>
        </div>
      </fieldset>

      {/* ── AI Source ── */}
      <section
        aria-labelledby={`${formId}-ai-heading`}
        className="bg-slate-50 dark:bg-white/5 border border-border p-6 rounded-3xl space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id={`${formId}-ai-heading`} className="text-sm font-bold text-text-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" aria-hidden="true" /> AI Generation
            </h2>
            <p className="text-xs text-text-3 font-medium mt-1">Select the data source for AI quiz generation</p>
          </div>

          <div
            className="flex p-1 bg-white dark:bg-slate-900 border border-border rounded-xl w-fit"
            role="radiogroup"
            aria-label="AI source"
          >
            {[
              { value: "description", label: "Video Description" },
              { value: "notes", label: "Custom Notes" },
            ].map((opt) => (
              <label key={opt.value} className="cursor-pointer">
                <input
                  type="radio"
                  name={`${formId}-ai-source`}
                  value={opt.value}
                  checked={aiSource === opt.value}
                  onChange={() => setAiSource(opt.value)}
                  className="sr-only"
                />
                <span className={`block px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  aiSource === opt.value ? "bg-indigo-500 text-white shadow-md" : "text-text-3 hover:text-text-1"
                }`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {aiSource === "notes" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2">
                <label htmlFor={`${formId}-custom-notes`} className="sr-only">Custom notes for AI quiz generation</label>
                <textarea
                  id={`${formId}-custom-notes`}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Paste lesson transcript, study guide, or key points. The AI will generate questions based on this content."
                  className="w-full h-32 bg-white dark:bg-slate-950 border border-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-3xl p-5 text-sm font-medium text-text-1 placeholder:opacity-30 resize-none transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Question Stack ── */}
      <section aria-label="Questions">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {questions.map((q, qi) => {
              const qId = `${formId}-q${qi}`;
              return (
                <motion.article
                  key={`question-${qi}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: qi * 0.04 }}
                  aria-label={`Question ${qi + 1}`}
                  className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow relative"
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold"
                        aria-hidden="true"
                      >
                        {qi + 1}
                      </div>
                      <span className="text-xs font-semibold text-text-3 uppercase tracking-widest">
                        Question {qi + 1} of {questions.length}
                      </span>
                    </div>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qi)}
                        aria-label={`Remove question ${qi + 1}`}
                        className="p-2 rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* Question textarea */}
                    <div className="relative">
                      <label htmlFor={`${qId}-text`} className="sr-only">Question {qi + 1} text</label>
                      <BookOpen className="absolute left-5 top-5 w-5 h-5 text-text-3" aria-hidden="true" />
                      <textarea
                        id={`${qId}-text`}
                        placeholder={`Type question ${qi + 1} here…`}
                        value={q.question}
                        onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                        maxLength={500}
                        rows={2}
                        required
                        aria-required="true"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl pl-16 pr-6 py-5 text-sm font-semibold text-text-1 placeholder:opacity-30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                      />
                    </div>

                    {/* Answer options */}
                    <fieldset>
                      <legend className="text-xs font-semibold text-text-3 uppercase tracking-[0.2em] mb-4 px-1">
                        Answer options — select the correct one
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label={`Answer options for question ${qi + 1}`}>
                        {q.options.map((opt, oi) => {
                          const optId = `${qId}-opt${oi}`;
                          const isCorrect = q.correctIndex === oi;
                          return (
                            <div
                              key={optId}
                              className={`relative flex items-center gap-3 p-4 rounded-3xl border transition-all duration-300 ${
                                isCorrect
                                  ? "bg-emerald-500/5 border-emerald-500/40"
                                  : "bg-white dark:bg-white/[0.02] border-border hover:border-indigo-500/30"
                              }`}
                            >
                              {/* Radio-style correct answer selector */}
                              <div>
                                <input
                                  type="radio"
                                  id={`${optId}-radio`}
                                  name={`${qId}-correct`}
                                  value={oi}
                                  checked={isCorrect}
                                  onChange={() => updateQuestion(qi, "correctIndex", oi)}
                                  className="sr-only"
                                  aria-label={`Mark option ${OPTION_LABELS[oi]} as correct answer for question ${qi + 1}`}
                                />
                                <label
                                  htmlFor={`${optId}-radio`}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all focus-within:ring-2 focus-within:ring-indigo-500 ${
                                    isCorrect
                                      ? "bg-emerald-500 text-white shadow-lg"
                                      : "bg-slate-100 dark:bg-white/5 text-text-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                                  }`}
                                  aria-label={`Option ${OPTION_LABELS[oi]}${isCorrect ? " — currently selected as correct" : ""}`}
                                >
                                  {isCorrect
                                    ? <Check className="w-4 h-4" aria-hidden="true" />
                                    : <span className="text-xs font-bold" aria-hidden="true">{OPTION_LABELS[oi]}</span>
                                  }
                                </label>
                              </div>

                              <div className="flex-1 min-w-0">
                                <label htmlFor={`${optId}-input`} className="sr-only">
                                  Option {OPTION_LABELS[oi]} text for question {qi + 1}
                                </label>
                                <input
                                  id={`${optId}-input`}
                                  type="text"
                                  placeholder={`Option ${OPTION_LABELS[oi]}`}
                                  value={opt}
                                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                                  maxLength={200}
                                  required
                                  aria-required="true"
                                  className="w-full bg-transparent text-sm font-medium text-text-1 placeholder:opacity-30 focus:outline-none focus:underline"
                                />
                              </div>

                              {isCorrect && (
                                <motion.span
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="absolute -top-2.5 -right-2.5 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-lg"
                                  aria-hidden="true"
                                >
                                  Correct
                                </motion.span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </fieldset>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex flex-col xl:flex-row items-center gap-6 pt-8">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {questions.length < 10 && (
            <button
              onClick={addQuestion}
              aria-label="Add a new question"
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-3xl border-2 border-dashed border-border text-xs font-bold uppercase tracking-widest text-text-3 hover:border-indigo-500 hover:text-indigo-500 transition-all hover:bg-slate-50 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Add Question
            </button>
          )}

          <button
            onClick={generateWithAI}
            disabled={generatingAI}
            aria-disabled={generatingAI}
            aria-busy={generatingAI}
            aria-label={generatingAI ? "Generating quiz with AI, please wait" : "Generate quiz questions using AI"}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-3xl bg-indigo-500/10 text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {generatingAI
              ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              : <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
            }
            {generatingAI ? "Generating…" : "Generate with AI"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto md:ml-auto">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            aria-disabled={saving}
            aria-busy={saving}
            aria-label={saving ? "Saving draft…" : "Save as draft"}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-3xl bg-slate-100 dark:bg-white/5 border border-border text-xs font-bold uppercase tracking-widest text-text-2 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {saving
              ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              : <Save className="w-5 h-5" aria-hidden="true" />
            }
            Save Draft
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            aria-disabled={saving}
            aria-busy={saving}
            aria-label={saving ? "Publishing…" : isPublished ? "Update published quiz" : "Publish quiz"}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white focus-visible:ring-offset-2"
          >
            {saving
              ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              : <Zap className="w-5 h-5" aria-hidden="true" />
            }
            {isPublished ? "Update Quiz" : "Publish Quiz"}
          </button>
        </div>
      </div>

      {/* ── Delete ── */}
      {existingQuiz && (
        <div className="pt-10 text-center">
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-disabled={deleting}
            aria-busy={deleting}
            aria-label={deleting ? "Deleting quiz…" : "Delete this quiz permanently"}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400 hover:text-rose-500 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:underline"
          >
            {deleting ? "Deleting…" : "Delete Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}
