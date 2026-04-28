"use client";
import React, { useState } from "react";
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

export default function QuizBuilder({ videoId, existingQuiz, onSaved }) {
  const { authFetch } = useAuth();
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
  const [aiSource, setAiSource] = useState("description"); // "description" | "notes"
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
        body: JSON.stringify({ source: aiSource, customNotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI Generation Failed");
      
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data.map(q => ({
          question: q.question || "",
          options: q.options || ["", "", "", ""],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
        })));
        setSuccess(`AI successfully generated ${data.length} questions! Please review them.`);
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
      if (!q.question.trim()) return setError(`Error: Question ${i + 1} text missing.`);
      if (q.options.some((o) => !o.trim())) return setError(`Error: Question ${i + 1} has empty options.`);
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
      setSuccess(publish ? "Quiz published successfully!" : "Draft saved.");
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;
    setDeleting(true);
    await authFetch(`/api/videos/${videoId}/quiz`, { method: "DELETE" });
    setDeleting(false);
    onSaved?.();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* ── Status Feedback ── */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-rose-500/5 border border-rose-500/20 px-6 py-4 rounded-[28px] flex items-center gap-4 text-rose-500 shadow-inner"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-[11px] font-black uppercase tracking-widest italic">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-500/5 border border-emerald-500/20 px-6 py-4 rounded-[28px] flex items-center gap-4 text-emerald-500 shadow-inner"
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <p className="text-[11px] font-black uppercase tracking-widest italic">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings HUD ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-50 dark:bg-white/5 border border-border p-5 md:p-6 rounded-[24px] md:rounded-[32px] flex flex-col md:flex-row items-baseline md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="space-y-1">
             <label className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Passing Score</label>
             <div className="relative group">
               <select 
                 value={passingScore} 
                 onChange={(e) => setPassingScore(Number(e.target.value))}
                 className="bg-white dark:bg-slate-900 border border-border rounded-xl px-4 py-2 text-xs font-black text-text-1 outline-none cursor-pointer appearance-none pr-10 hover:border-indigo-500 transition-colors"
               >
                 {[50, 60, 70, 80, 90, 100].map((v) => (
                   <option key={v} value={v}>{v}% Passing</option>
                 ))}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
             </div>
          </div>
          
          <div className="w-px h-10 bg-border hidden md:block" />
          
          <div className="space-y-1">
            <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Quiz Progress</span>
            <div className="flex items-center gap-3">
               <div className="h-2 w-32 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(questions.length / 10) * 100}%` }}
                    className="h-full bg-indigo-500" 
                  />
               </div>
               <span className="text-xs font-black text-text-1 italic">{questions.length}/10 Questions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Layers className="w-4 h-4 text-text-3" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-3">Editing Mode</span>
        </div>
      </motion.div>

      {/* ── AI Source Configuration ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-50 dark:bg-white/5 border border-border p-6 rounded-[24px] md:rounded-[32px] space-y-5 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-text-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500"/> AI Generation Context</h3>
            <p className="text-[10px] uppercase tracking-widest text-text-3 font-black mt-1">Select data source for auto-quiz</p>
          </div>
          <div className="flex p-1 bg-white dark:bg-slate-900 border border-border rounded-xl w-fit">
            <button
              onClick={() => setAiSource("description")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${aiSource === "description" ? "bg-indigo-500 text-white shadow-md" : "text-text-3 hover:text-text-1"}`}
            >
              Video Description
            </button>
            <button
              onClick={() => setAiSource("notes")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${aiSource === "notes" ? "bg-indigo-500 text-white shadow-md" : "text-text-3 hover:text-text-1"}`}
            >
              Custom Notes
            </button>
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
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Paste your specific lesson transcript, study guide, or key points here. The AI will strictly extract the quiz from this metadata..."
                  className="w-full h-32 bg-white dark:bg-slate-950 border border-border focus:border-indigo-500 outline-none rounded-[20px] p-5 text-sm font-medium text-text-1 placeholder:opacity-30 resize-none transition-colors shadow-inner italic"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Question Stack ── */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {questions.map((q, qi) => (
            <motion.div 
              key={`question-${qi}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: qi * 0.05 }}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-6 md:p-8 rounded-[32px] md:rounded-[48px] shadow-sm hover:shadow-2xl transition-all hover:scale-[1.01] relative"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 text-xs font-black">
                      {qi + 1}
                   </div>
                   <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Question Text</span>
                </div>
                {questions.length > 1 && (
                  <button 
                    onClick={() => removeQuestion(qi)}
                    className="p-3 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-inner opacity-0 group-hover:opacity-100"
                    title="Purge Node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-8">
                <div className="relative group">
                   <BookOpen className="absolute left-6 top-5 w-5 h-5 text-text-3 group-focus-within:text-indigo-500 transition-colors" />
                   <textarea
                     placeholder="Type your question here..."
                     value={q.question}
                     onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                     maxLength={500}
                     rows={2}
                     className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-[28px] pl-16 pr-8 py-5 text-sm font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none resize-none"
                   />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Answer Options</p>
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Select the correct answer</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, oi) => (
                      <motion.div 
                        key={`opt-${qi}-${oi}`}
                        className={`relative flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-[24px] md:rounded-[32px] border transition-all duration-300 ${
                          q.correctIndex === oi
                            ? "bg-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                            : "bg-white dark:bg-white/2[0.02] border-border hover:border-indigo-500/30"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuestion(qi, "correctIndex", oi)}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                            q.correctIndex === oi
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                              : "bg-slate-100 dark:bg-white/5 text-text-3 hover:scale-110 active:scale-95"
                          }`}
                        >
                          {q.correctIndex === oi ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-30" />}
                        </button>
                        <input
                          type="text"
                          placeholder={`Solution Node ${oi + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          maxLength={200}
                          className="flex-1 bg-transparent text-sm font-black text-text-1 placeholder:opacity-20 focus:outline-none italic"
                        />
                        {q.correctIndex === oi && (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute -top-3 -right-3"
                          >
                            <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">Correct Answer</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Actions Matrix ── */}
      <div className="flex flex-col xl:flex-row items-center gap-6 pt-10">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto overflow-hidden">
          {questions.length < 10 && (
            <button 
              onClick={addQuestion}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-4 md:py-5 rounded-[20px] md:rounded-[28px] border-2 border-dashed border-border text-[11px] font-black uppercase tracking-widest text-text-3 hover:border-indigo-500 hover:text-indigo-500 transition-all italic hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <Plus className="w-5 h-5" />
              Expand Matrix Node
            </button>
          )}

          <button
            onClick={generateWithAI}
            disabled={generatingAI}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-4 md:py-5 rounded-[20px] md:rounded-[28px] bg-indigo-500/10 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-inner disabled:opacity-50"
          >
            {generatingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 shrink-0" />}
            {generatingAI ? "AI Generating..." : "Generate via AI ✨"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto md:ml-auto">
          <button 
            onClick={() => handleSave(false)} 
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-10 py-4 md:py-5 rounded-[20px] md:rounded-[28px] bg-slate-100 dark:bg-white/5 border border-border text-[11px] font-black uppercase tracking-widest text-text-2 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] italic"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Encrypted Draft
          </button>
          
          <button 
            onClick={() => handleSave(true)} 
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-10 py-4 md:py-5 rounded-[20px] md:rounded-[28px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl italic"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {isPublished ? "Update Protocol" : "Authorize Synchronization"}
          </button>
        </div>
      </div>

      {existingQuiz && (
        <div className="pt-12 text-center">
           <button 
             onClick={handleDelete} 
             disabled={deleting}
             className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/50 hover:text-rose-500 transition-all italic"
           >
             {deleting ? "Purging Registry..." : "Immediate Matrix Purge"}
           </button>
        </div>
      )}
    </div>
  );
}

