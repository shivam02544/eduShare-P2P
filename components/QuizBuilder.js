"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

    // Client-side validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return setError(`Question ${i + 1} is empty`);
      if (q.options.some((o) => !o.trim())) return setError(`Question ${i + 1} has empty options`);
    }

    setSaving(true);
    const res = await authFetch(`/api/videos/${videoId}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions, passingScore, isPublished: publish }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) return setError(data.error);
    setIsPublished(publish);
    setSuccess(publish ? "Quiz published! Students can now take it." : "Draft saved.");
    onSaved?.();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    setDeleting(true);
    await authFetch(`/api/videos/${videoId}/quiz`, { method: "DELETE" });
    setDeleting(false);
    onSaved?.();
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          {success}
        </div>
      )}

      {/* Settings row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Passing score</label>
          <select value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))}
            className="input w-auto text-sm py-1.5 px-3">
            {[50, 60, 70, 80, 90, 100].map((v) => (
              <option key={v} value={v}>{v}%</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-zinc-400">
          {questions.length}/10 questions
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, qi) => (
        <div key={qi} className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              Question {qi + 1}
            </span>
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(qi)}
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                Remove
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Enter your question..."
            value={q.question}
            onChange={(e) => updateQuestion(qi, "question", e.target.value)}
            maxLength={500}
            className="input"
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Options — click radio to mark correct</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                q.correctIndex === oi
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}>
                <button
                  type="button"
                  onClick={() => updateQuestion(qi, "correctIndex", oi)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    q.correctIndex === oi
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-stone-300 hover:border-emerald-400"
                  }`}>
                  {q.correctIndex === oi && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
                <input
                  type="text"
                  placeholder={`Option ${oi + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                  maxLength={200}
                  className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                />
                {q.correctIndex === oi && (
                  <span className="text-xs text-emerald-600 font-medium flex-shrink-0">Correct</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add question */}
      {questions.length < 10 && (
        <button onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-sm text-zinc-500
                     hover:border-zinc-400 hover:text-zinc-700 transition-colors">
          + Add Question
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => handleSave(false)} disabled={saving}
          className="btn-secondary flex items-center gap-2">
          {saving ? <Spinner /> : null}
          Save Draft
        </button>
        <button onClick={() => handleSave(true)} disabled={saving}
          className="btn-primary flex items-center gap-2">
          {saving ? <Spinner /> : null}
          {isPublished ? "Update & Publish" : "Publish Quiz"}
        </button>
        {existingQuiz && (
          <button onClick={handleDelete} disabled={deleting}
            className="ml-auto text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}
