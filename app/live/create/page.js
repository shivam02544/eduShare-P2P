"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";

const SUBJECTS = ["Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology", "Other"];

export default function CreateSessionPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "Math", date: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    await withLoading(async () => {
      const res = await authFetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else router.push("/live");
    }, "Scheduling session...");
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Schedule Live Session</h1>
        <p className="text-zinc-400 text-sm mt-1">Earn 10 credits for every student who joins</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Session Title</label>
          <input type="text" placeholder="e.g. Advanced Algebra Problem Solving" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Subject</label>
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input">
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Date & Time</label>
          <input type="datetime-local" required
            value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input" />
        </div>

        {/* Credit info */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <p className="text-xs text-amber-700">
            You'll earn <strong>10 credits</strong> for every student who joins this session.
          </p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Scheduling...
            </span>
          ) : "Schedule Session"}
        </button>
      </form>
    </div>
  );
}
