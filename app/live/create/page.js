"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const SUBJECTS = ["Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology", "Other"];

export default function CreateSessionPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "Math",
    date: "",
    time: "",
    meetingLink: "",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.meetingLink) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: new Date(`${form.date}T${form.time}`).toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Session scheduled successfully!");
        router.push("/live");
      } else {
        toast.error(data.error || "Failed to schedule session");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Schedule Live Session</h1>
        <p className="text-zinc-400 text-sm mt-1">Earn 10 credits for every student who joins</p>
      </div>

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
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Description (What will you teach?)</label>
          <textarea placeholder="Brief summary of the session..." rows={3} maxLength={500}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Date</label>
            <input type="date" required
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Time</label>
            <input type="time" required
              value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="input" />
          </div>
        </div>

        <div>
           <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Meeting Link</label>
           <input type="url" placeholder="Zoom, Google Meet, or Jitsi link" required
             value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
             className="input" />
        </div>

        {/* Credit info */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.294 2.744.88 4.226a1 1 0 01-1.476 1.065L10 17.024l-3.991 2.026a1 1 0 01-1.476-1.065l.88-4.226-3.294-2.744a1 1 0 01-.285-1.05L3.57 7.509l-1.233-.616a1 1 0 01.894-1.79l1.599.8L8.954 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
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
