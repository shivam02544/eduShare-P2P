"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function QuizTaker({ quiz, videoId, onComplete }) {
  const { authFetch } = useAuth();
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const allAnswered = answers.every((a) => a !== null);

  const handleSubmit = async () => {
    if (!allAnswered) return setError("Please answer all questions before submitting.");
    setError("");
    setSubmitting(true);

    const res = await authFetch(`/api/videos/${videoId}/quiz/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) return setError(data.error);
    setResult(data);
    onComplete?.(data);
  };

  // ── Result screen ──
  if (result) {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Score card */}
        <div className={`rounded-2xl p-6 text-center border ${
          result.passed
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="text-5xl font-black mb-2" style={{ color: result.passed ? "#059669" : "#dc2626" }}>
            {result.score}%
          </div>
          <p className={`text-lg font-bold ${result.passed ? "text-emerald-700" : "text-red-700"}`}>
            {result.passed ? "🎉 Passed!" : "😔 Not quite"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {result.correctCount}/{result.totalQuestions} correct · Passing: {result.passingScore}%
          </p>
          {result.creditsAwarded > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold">
              🏆 +{result.creditsAwarded} credits earned
            </div>
          )}
          {result.certificate && (
            <div className="mt-3">
              <a href={`/certificates/${result.certificate.certId}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
                🏅 View Your Certificate
              </a>
            </div>
          )}
        </div>

        {/* Answer breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Answer Breakdown</p>
          {result.results.map((r, i) => (
            <div key={i} className={`card p-4 border-l-4 ${r.correct ? "border-l-emerald-400" : "border-l-red-400"}`}>
              <p className="text-sm font-medium text-zinc-800 mb-2">
                <span className="text-zinc-400 mr-2">Q{i + 1}.</span>{r.question}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {r.options.map((opt, oi) => {
                  const isSelected = r.selectedIndex === oi;
                  const isCorrect = r.correctIndex === oi;
                  return (
                    <div key={oi} className={`text-xs px-3 py-2 rounded-lg border ${
                      isCorrect
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                        : isSelected && !isCorrect
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-stone-50 border-stone-200 text-zinc-500"
                    }`}>
                      {isCorrect && "✓ "}{isSelected && !isCorrect && "✗ "}{opt}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Quiz form ──
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            {quiz.questions.length} questions · Pass at {quiz.passingScore}%
          </p>
        </div>
        <div className="text-xs text-zinc-400">
          {answers.filter((a) => a !== null).length}/{quiz.questions.length} answered
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {quiz.questions.map((q, qi) => (
        <div key={q._id} className="card p-5 space-y-3">
          <p className="text-sm font-semibold text-zinc-800">
            <span className="text-zinc-400 mr-2">{qi + 1}.</span>{q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                onClick={() => {
                  const updated = [...answers];
                  updated[qi] = oi;
                  setAnswers(updated);
                }}
                className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all duration-150 ${
                  answers[qi] === oi
                    ? "border-violet-400 bg-violet-50 text-violet-800 font-medium"
                    : "border-stone-200 bg-white hover:border-stone-300 text-zinc-700"
                }`}>
                <span className="inline-flex w-6 h-6 rounded-full border mr-3 items-center justify-center text-xs flex-shrink-0
                                 align-middle font-bold"
                  style={{
                    borderColor: answers[qi] === oi ? "#7c6af7" : "#d4d0ca",
                    background: answers[qi] === oi ? "#7c6af7" : "transparent",
                    color: answers[qi] === oi ? "white" : "#a1a1aa",
                  }}>
                  {["A","B","C","D"][oi]}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Progress bar */}
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${(answers.filter((a) => a !== null).length / quiz.questions.length) * 100}%` }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="btn-primary w-full py-3 disabled:opacity-50">
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Submitting...
          </span>
        ) : allAnswered ? "Submit Quiz" : `Answer all ${quiz.questions.length} questions to submit`}
      </button>
    </div>
  );
}
