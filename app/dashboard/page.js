"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCache, setCache } from "@/lib/cache";

const STATS = [
  { key: "totalVideos",    label: "Videos",     icon: "🎥" },
  { key: "totalNotes",     label: "Notes",      icon: "📄" },
  { key: "totalSessions",  label: "Sessions",   icon: "📡" },
  { key: "totalViews",     label: "Views",      icon: "👁" },
  { key: "totalDownloads", label: "Downloads",  icon: "⬇" },
  { key: "totalAttendees", label: "Attendees",  icon: "👥" },
];

function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

function DashSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
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

    // Redirect unverified email/password users
    if (user.providerData?.[0]?.providerId === "password" && !user.emailVerified) {
      router.push("/verify-email");
      return;
    }

    const cached = getCache("dashboard");
    if (cached) {
      setData(cached); setLoading(false);
      authFetch("/api/dashboard").then(r => r.json()).then(d => { if (!d.error) { setData(d); setCache("dashboard", d); } });
    } else {
      authFetch("/api/dashboard").then(r => r.json()).then(d => {
        if (!d.error) { setData(d); setCache("dashboard", d, 30_000); }
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    authFetch("/api/watch-history?type=continue")
      .then(r => r.json())
      .then(d => setContinueWatching(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, [user, authLoading]);

  if (authLoading || loading || !user) return <DashSkeleton />;
  if (!data?.stats) return <div className="text-center py-20 text-sm" style={{ color: "var(--text-3)" }}>Could not load dashboard</div>;

  const { stats = {}, recentVideos = [], recentNotes = [] } = data;

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-11 h-11 rounded-xl object-cover" style={{ border: "1px solid var(--border)" }} />
          ) : (
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold"
              style={{ background: "var(--accent-2)", color: "var(--accent)", border: "1px solid var(--border)" }}>
              {(user.displayName || user.email)?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--text-1)" }}>
              Hey, {user.displayName?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{user.email}</p>
          </div>
        </div>

        {/* Credits */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <span>🏆</span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Credits</p>
            <p className="text-xl font-black tracking-tight stat-number" style={{ color: "var(--text-1)" }}>{stats.credits ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 stagger-grid">
        {STATS.map((s) => (
          <div key={s.key} className="card p-4 text-center">
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="text-xl font-black tracking-tight stat-number" style={{ color: "var(--text-1)" }}>
              {stats[s.key] ?? 0}
            </p>
            <p className="text-[11px] mt-0.5 uppercase tracking-widest" style={{ color: "var(--text-3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Continue watching */}
      {continueWatching.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Continue Watching</p>
            <Link href="/history" className="text-[12px]" style={{ color: "var(--text-3)" }}>View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {continueWatching.map((h) => {
              const pct = h.durationSeconds > 0 ? Math.min(100, Math.round((h.progressSeconds / h.durationSeconds) * 100)) : 0;
              return (
                <Link key={h._id} href={`/videos/${h.video._id}`}
                  className="group rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div className="relative" style={{ aspectRatio: "16/9", background: "var(--surface-2)" }}>
                    {h.video.thumbnailUrl ? (
                      <img src={h.video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-lg">🎥</div>}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--border)" }}>
                      <div className="h-full" style={{ width: `${pct}%`, background: "#ef4444" }} />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-medium line-clamp-1" style={{ color: "var(--text-1)" }}>{h.video.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>{pct}%</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="card p-4">
        <p className="section-label mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/upload-video" className="btn-primary text-[13px]">🎥 Upload Video</Link>
          <Link href="/upload-notes" className="btn-secondary text-[13px]">📄 Upload Notes</Link>
          <Link href="/live/create" className="btn-secondary text-[13px]">📡 Schedule Session</Link>
          <Link href="/explore" className="btn-ghost text-[13px]">🔍 Explore</Link>
        </div>
      </div>

      {/* Recent */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Recent Videos", items: recentVideos, link: "/upload-video", empty: "No videos yet", meta: (v) => `${v.views} views` },
          { title: "Recent Notes",  items: recentNotes,  link: "/upload-notes", empty: "No notes yet",  meta: (n) => `${n.downloads} downloads` },
        ].map((s) => (
          <div key={s.title} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{s.title}</p>
              <Link href="/explore" className="text-[12px]" style={{ color: "var(--text-3)" }}>View all →</Link>
            </div>
            {s.items.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>{s.empty}</p>
                <Link href={s.link} className="text-[12px] mt-1 block" style={{ color: "var(--accent)" }}>Upload now</Link>
              </div>
            ) : (
              <ul className="space-y-0.5">
                {s.items.map((item) => (
                  <li key={item._id} className="flex justify-between items-center py-2 border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}>
                    <span className="text-[13px] truncate font-medium" style={{ color: "var(--text-1)" }}>{item.title}</span>
                    <span className="text-[12px] ml-2 flex-shrink-0" style={{ color: "var(--text-3)" }}>{s.meta(item)}</span>
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
