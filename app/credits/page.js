"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const reasonMeta = {
  video_view:            { icon: "🎥", label: "Video viewed",         color: "text-blue-600 bg-blue-50" },
  note_download:         { icon: "📄", label: "Note downloaded",       color: "text-rose-600 bg-rose-50" },
  live_join:             { icon: "📡", label: "Session joined",        color: "text-emerald-600 bg-emerald-50" },
  gift:                  { icon: "🎁", label: "Gift",                  color: "text-violet-600 bg-violet-50" },
  quiz_pass:             { icon: "✅", label: "Quiz passed",           color: "text-emerald-600 bg-emerald-50" },
  quiz_completion:       { icon: "📝", label: "Quiz completed",        color: "text-teal-600 bg-teal-50" },
  tip_sent:              { icon: "🎁", label: "Tip sent",              color: "text-red-600 bg-red-50" },
  tip_received:          { icon: "🎁", label: "Tip received",          color: "text-amber-600 bg-amber-50" },
  boost_video:           { icon: "⚡", label: "Video boosted",         color: "text-violet-600 bg-violet-50" },
  boost_note:            { icon: "⚡", label: "Note boosted",          color: "text-violet-600 bg-violet-50" },
  premium_note_unlock:   { icon: "🔓", label: "Premium note unlocked", color: "text-amber-600 bg-amber-50" },
  premium_note_earned:   { icon: "💎", label: "Premium note earned",   color: "text-amber-600 bg-amber-50" },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="card px-5 py-4 flex items-center gap-4">
          <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-3 w-28" />
          </div>
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function CreditsPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    authFetch(`/api/credits?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [user, page]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Credit History</h1>
        <p className="text-zinc-400 text-sm mt-1">Every credit you've earned, logged</p>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-amber-600">{data.totalEarned}</p>
            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide font-medium">Total Earned</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-zinc-900">{data.total}</p>
            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide font-medium">Transactions</p>
          </div>
        </div>
      )}

      {/* Breakdown by reason */}
      {data && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Earning Sources</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(reasonMeta).slice(0, 3).map(([key, meta]) => {
              const count = data.transactions.filter((t) => t.reason === key).length;
              return (
                <div key={key} className={`rounded-xl px-3 py-2.5 text-center ${meta.color}`}>
                  <p className="text-xl">{meta.icon}</p>
                  <p className="text-xs font-medium mt-1">{meta.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction list */}
      {loading ? <SkeletonRows /> : data?.transactions.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium text-zinc-600">No transactions yet</p>
          <p className="text-sm mt-1">Upload videos or notes to start earning</p>
          <Link href="/upload-video" className="btn-primary mt-4 inline-block">Upload Video</Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.transactions.map((t) => {
              const meta = reasonMeta[t.reason] || { icon: "💰", label: t.reason, color: "text-zinc-600 bg-zinc-50" };
              const ref = t.video?.title || t.note?.title || t.session?.title;
              return (
                <div key={t._id} className="card px-5 py-4 flex items-center gap-4 animate-fade-in">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${meta.color}`}>
                    {meta.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {t.description || meta.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-zinc-400">{timeAgo(t.createdAt)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={`text-sm font-bold flex-shrink-0 ${t.amount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {t.amount > 0 ? "+" : ""}{t.amount} cr
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                ← Prev
              </button>
              <span className="text-sm text-zinc-500">Page {page} of {data.pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
