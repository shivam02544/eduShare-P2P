"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import Link from "next/link";
import { SkeletonCard } from "@/components/Skeleton";
import { getCache, setCache } from "@/lib/cache";

function SessionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex justify-between">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-4 w-24" />
          </div>
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function LivePage() {
  const { user, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [toast, setToast] = useState("");

  const fetchSessions = (force = false) => {
    const cached = getCache("live-sessions");
    if (!force && cached) { setSessions(cached); setLoading(false); return; }
    fetch("/api/live")
      .then((r) => r.json())
      .then((d) => { setCache("live-sessions", d, 30_000); setSessions(d); setLoading(false); });
  };

  useEffect(() => { fetchSessions(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleJoin = async (id) => {
    if (!user) return alert("Please login to join");
    setJoining(id);
    await withLoading(async () => {
      const res = await authFetch(`/api/live/${id}/join`, { method: "POST" });
      const data = await res.json();
      showToast(data.message);
      fetchSessions(true);
    }, "Joining session...");
    setJoining(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Live Sessions</h1>
          <p className="text-zinc-400 text-sm mt-1">Join upcoming sessions and support teachers</p>
        </div>
        {user && (
          <Link href="/live/create" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Schedule
          </Link>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in z-50">
          {toast}
        </div>
      )}

      {loading ? <SessionSkeleton /> : sessions.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <div className="text-5xl mb-3">📡</div>
          <p className="font-medium text-zinc-600">No upcoming sessions</p>
          {user && (
            <Link href="/live/create" className="text-sm text-violet-600 hover:underline mt-2 block">
              Be the first to schedule one
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((s) => (
            <div key={s._id} className="card p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {s.subject}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" · "}
                  {new Date(s.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <h3 className="font-semibold text-zinc-900 leading-snug">{s.title}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {s.teacher?.image ? (
                  <img src={s.teacher.image} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs">
                    {s.teacher?.name?.[0]}
                  </div>
                )}
                <span>{s.teacher?.name}</span>
                <span className="ml-auto">{s.attendees?.length || 0} joined</span>
              </div>
              <button onClick={() => handleJoin(s._id)} disabled={joining === s._id}
                className="w-full btn-primary py-2 justify-center disabled:opacity-60">
                {joining === s._id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Joining...
                  </span>
                ) : "Join Session"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
