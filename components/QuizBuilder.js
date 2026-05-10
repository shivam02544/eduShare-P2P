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
      explanation: q.explanation || "",
    })) || [EMPTY_QUESTION()]
  );
  
  const [title, setTitle] = useState(existingQuiz?.title || "");
  const [topic, setTopic] = useState(existingQuiz?.topic || "");
  const [difficulty, setDifficulty] = useState(existingQuiz?.difficulty || "medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [passingScore, setPassingScore] = useState(existingQuiz?.passingScore || 70);
  const [isPublished, setIsPublished] = useState(existingQuiz?.isPublished || false);
  const [isAiGenerated, setIsAiGenerated] = useState(existingQuiz?.generatedByAI || false);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSource, setAiSource] = useState("description");
  const [customContent, setCustomContent] = useState("");

  const generateWithAI = async () => {
    if (aiSource === "notes" && !customContent.trim()) {
      return setError("Please provide content to analyze.");
    }
    setGeneratingAI(true);
    setError(""); setSuccess("");
    try {
      const res = await authFetch(`/api/videos/${videoId}/ai-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          source: aiSource, 
          customContent,
          difficulty,
          questionCount,
          topic
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI Generation Failed");

      if (data && Array.isArray(data.questions)) {
        setTitle(data.title || title);
        setTopic(data.topic || topic);
        setQuestions(data.questions.map((q) => ({
          question: q.question || "",
          options: q.options || ["", "", "", ""],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
          explanation: q.explanation || "",
        })));
        setIsAiGenerated(true);
        setSuccess(`AI generated ${data.questions.length} questions. Please review before saving.`);
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
    if (questions.length >= 20) return;
    setQuestions([...questions, { ...EMPTY_QUESTION(), explanation: "" }]);
  };

  const removeQuestion = (i) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (qi, field, value) => {
    const updated = [...questions];
    updated[qi] = { ...updated[qi], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
  };

  const handleSave = async (publish = false) => {
    setError(""); setSuccess("");
    if (!title.trim()) return setError("Quiz title is required.");
    
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
        body: JSON.stringify({ 
          title, 
          topic, 
          difficulty, 
          questions, 
          passingScore, 
          isPublished: publish,
          generatedByAI: isAiGenerated
        }),
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
          {isAiGenerated && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/10 px-5 py-3 rounded-2xl w-fit"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">AI Assisted Design</span>
            </motion.div>
          )}
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

      {/* ── Main Quiz Info ── */}
      <section className="bg-white dark:bg-white/5 border border-border p-6 rounded-3xl space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor={`${formId}-title`} className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em] ml-1">
              Quiz Title
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              placeholder="e.g. Advanced Quantum Mechanics Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm font-semibold text-text-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`${formId}-topic`} className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em] ml-1">
              Topic / Category
            </label>
            <input
              id={`${formId}-topic`}
              type="text"
              placeholder="e.g. Physics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl px-5 py-3 text-sm font-semibold text-text-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <label htmlFor={`${formId}-passing-score`} className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em]">
              Passing Score
            </label>
            <div className="relative">
              <select
                id={`${formId}-passing-score`}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="bg-white dark:bg-slate-900 border border-border rounded-xl px-4 py-2 text-xs font-semibold text-text-1 outline-none cursor-pointer appearance-none pr-10 hover:border-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500"
              >
                {[50, 60, 70, 80, 90, 100].map((v) => (
                  <option key={v} value={v}>{v}% to Pass</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor={`${formId}-difficulty`} className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em]">
              Level
            </label>
            <div className="relative">
              <select
                id={`${formId}-difficulty`}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-border rounded-xl px-4 py-2 text-xs font-semibold text-text-1 outline-none cursor-pointer appearance-none pr-10 hover:border-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 bg-indigo-500/5 px-4 py-2 rounded-2xl border border-indigo-500/10">
            <Target className="w-4 h-4 text-indigo-500" />
            <div
              className="h-1.5 w-24 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={questions.length}
              aria-valuemin={1}
              aria-valuemax={20}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(questions.length / 20) * 100}%` }}
                className="h-full bg-indigo-500"
              />
            </div>
            <span className="text-xs font-bold text-indigo-500">{questions.length}/20</span>
          </div>
        </div>
      </section>

      {/* ── AI Power Section ── */}
      <section
        aria-labelledby={`${formId}-ai-heading`}
        className="bg-indigo-500/[0.03] dark:bg-indigo-500/[0.05] border-2 border-indigo-500/20 p-6 md:p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap className="w-24 h-24 text-indigo-500" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 id={`${formId}-ai-heading`} className="text-lg font-bold text-text-1 flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-xl text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              Groq AI Quiz Engine
            </h2>
            <p className="text-sm text-text-3 font-medium mt-1">Transform content into professional MCQs in seconds.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-text-3 uppercase tracking-widest ml-1">Questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="block w-full bg-white dark:bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Qs</option>)}
              </select>
            </div>
            <button
              onClick={generateWithAI}
              disabled={generatingAI}
              className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {generatingAI ? "Analyzing..." : "Generate Quiz"}
            </button>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-border rounded-2xl w-fit">
            {[
              { value: "description", label: "Video Data", icon: Send },
              { value: "notes", label: "Raw Content / Notes", icon: BookOpen },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAiSource(opt.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  aiSource === opt.value ? "bg-indigo-500 text-white shadow-md" : "text-text-3 hover:text-text-1"
                }`}
              >
                <opt.icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {aiSource === "notes" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Paste text, notes, PDF content or transcripts here..."
                  className="w-full h-40 bg-white dark:bg-slate-950 border border-border focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-3xl p-6 text-sm font-medium text-text-1 placeholder:opacity-40 resize-none transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Question Stack ── */}
      <section aria-label="Questions" className="space-y-8">
        <AnimatePresence mode="popLayout">
          {questions.map((q, qi) => {
            const qId = `${formId}-q${qi}`;
            return (
              <motion.article
                key={`question-${qi}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border p-6 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all relative"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/20">
                      {qi + 1}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-text-1 uppercase tracking-widest">Question {qi + 1}</h3>
                      <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em] mt-0.5">MCQ • 4 Options</p>
                    </div>
                  </div>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="p-3 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <textarea
                      placeholder="Enter question text here..."
                      value={q.question}
                      onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-5 text-base font-bold text-text-1 placeholder:opacity-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {q.options.map((opt, oi) => {
                      const isCorrect = q.correctIndex === oi;
                      return (
                        <div
                          key={oi}
                          className={`flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer ${
                            isCorrect 
                              ? "bg-emerald-500/5 border-emerald-500/40" 
                              : "bg-white dark:bg-white/5 border-border hover:border-indigo-500/30"
                          }`}
                          onClick={() => updateQuestion(qi, "correctIndex", oi)}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                            isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10 text-text-3"
                          }`}>
                            {OPTION_LABELS[oi]}
                          </div>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${OPTION_LABELS[oi]}`}
                            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-text-1 placeholder:opacity-20"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Educational Explanation
                    </label>
                    <textarea
                      placeholder="Explain why this answer is correct..."
                      value={q.explanation || ""}
                      onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
                      className="w-full bg-amber-500/[0.03] dark:bg-amber-500/[0.05] border border-amber-500/10 rounded-2xl px-5 py-4 text-xs font-medium text-text-2 placeholder:opacity-30 outline-none focus:border-amber-500/30 transition-all resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {questions.length < 20 && (
          <button
            onClick={addQuestion}
            className="w-full py-6 rounded-[2.5rem] border-2 border-dashed border-border text-text-3 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest"
          >
            <Plus className="w-5 h-5" /> Add Manual Question
          </button>
        )}
      </section>

      {/* ── Footer Actions ── */}
      <div className="flex flex-col md:flex-row items-center gap-4 pt-12 border-t border-border">
        {existingQuiz && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full md:w-auto px-8 py-4 text-rose-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500/10 rounded-2xl transition-all"
          >
            {deleting ? "Deleting..." : "Delete Quiz"}
          </button>
        )}
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:ml-auto md:w-auto">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 font-bold text-[10px] uppercase tracking-widest text-text-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center justify-center gap-3 px-12 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 dark:shadow-white/5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isPublished ? "Update & Publish" : "Publish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

