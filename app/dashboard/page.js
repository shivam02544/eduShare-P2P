"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SkeletonStatCard, SkeletonRow, SkeletonAvatar } from "@/components/Skeleton";
import { getCache, setCache } from "@/lib/cache";

const statCards = [
  { key: "totalVideos",    label: "Videos",     icon: "🎥", bg: "#fef3c7", border: "#fde68a" },
  { key: "totalNotes",     label: "Notes",      icon: "📄", bg: "#fff1f2", border: "#fecdd3" },
  { key: "totalSessions",  label: "Sessions",   icon: "📡", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "totalViews",     label: "Views",      icon: "👁", bg: "#ede9fe", border: "#ddd6fe" },
  { key: "totalDownloads", label: "Downloads",  icon: "⬇️", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "totalAttendees", label: "Attendees",  icon: "👥", bg: "#fff7ed", border: "#fed7aa" },
];

function StatCard({ label, value, icon, bg, border }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4 border animate-fade-in"
      style={{ background: bg, borderColor: border }}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-zinc-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2"><div className="skeleton h-5 w-40" /><div className="skeleton h-3 w-28" /></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array(6).fill(0).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    const cached = getCache("dashboard");
    if (cached) { setData(cached); setLoading(false);
      authFetch("/api/dashboard").then(r => r.json()).then(d => { if (!d.error) { setData(d); setCache("dashboard", d); } });
    } else {
      authFetch("/api/dashboard").then(r => r.json()).then(d => {
        if (!d.error) { setData(d); setCache("dashboard", d, 30_000); }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
    // Fetch continue watching separately
    authFetch("/api/watch-history?type=continue")
      .then(r => r.json())
      .then(d => setContinueWatching(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, [user, authLoading]);

  if (authLoading || loading || !user) return <DashboardSkeleton />;
  if (!data?.stats) return <div className="text-center py-20 text-zinc-400">Could not load dashboard</div>;

  const { stats = {}, recentVideos = [], recentNotes = [] } = data;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-stone-200 shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-amber-800 text-xl font-black shadow-sm"
              style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
              {(user.displayName || user.email)?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Hey, {user.displayName?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Credits */}
        <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border"
          style={{ background: "#fef3c7", borderColor: "#fde68a" }}>
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Credits</p>
            <p className="text-2xl font-black text-amber-900">{stats.credits ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <StatCard key={s.key} label={s.label} value={stats[s.key] ?? 0} icon={s.icon} bg={s.bg} border={s.border} />
        ))}
      </div>

      {/* Continue watching */}
      {continueWatching.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Continue Watching</p>
            <Link href="/history" className="text-xs text-zinc-400 hover:text-zinc-600">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {continueWatching.map((h) => {
              const pct = h.durationSeconds > 0
                ? Math.min(100, Math.round((h.progressSeconds / h.durationSeconds) * 100))
                : 0;
              return (
                <Link key={h._id} href={`/videos/${h.video._id}`}
                  className="flex gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors group">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    {h.video.thumbnailUrl ? (
                      <img src={h.video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-lg">🎥</div>}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                      <div className="h-full bg-red-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors">
                      {h.video.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">{pct}% watched</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card p-5">
        <p className="section-label mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/upload-video" className="btn-primary flex items-center gap-2 text-sm">🎥 Upload Video</Link>
          <Link href="/upload-notes" className="btn-secondary flex items-center gap-2 text-sm">📄 Upload Notes</Link>
          <Link href="/live/create" className="btn-secondary flex items-center gap-2 text-sm">📡 Schedule Session</Link>
          <Link href="/explore" className="btn-ghost flex items-center gap-2 text-sm">🔍 Explore</Link>
        </div>
      </div>

      {/* Recent */}
      <div className="grid md:grid-cols-2 gap-5">
        {[
          { title: "Recent Videos", items: recentVideos, emptyMsg: "No videos yet", link: "/upload-video", meta: (v) => `${v.views} views` },
          { title: "Recent Notes", items: recentNotes, emptyMsg: "No notes yet", link: "/upload-notes", meta: (n) => `${n.downloads} downloads` },
        ].map((section) => (
          <div key={section.title} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-zinc-900">{section.title}</h2>
              <Link href="/explore" className="text-xs text-zinc-400 hover:text-zinc-600">View all →</Link>
            </div>
            {section.items.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p className="text-sm">{section.emptyMsg}</p>
                <Link href={section.link} className="text-xs text-zinc-600 hover:underline mt-1 block font-medium">Upload now</Link>
              </div>
            ) : (
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item._id} className="flex justify-between items-center py-2.5 border-b border-stone-100 last:border-0">
                    <span className="text-sm text-zinc-700 truncate font-medium">{item.title}</span>
                    <span className="text-xs text-zinc-400 ml-2 flex-shrink-0">{section.meta(item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
