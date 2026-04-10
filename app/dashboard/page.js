"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const memCache = {};
function getMemCache(key) { const e = memCache[key]; return e && e.exp > Date.now() ? e.data : null; }
function setMemCache(key, data, ttlMs = 60_000) { memCache[key] = { data, exp: Date.now() + ttlMs }; }

const STATS = [
  { 
    key: "totalVideos",    
    label: "Videos",     
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    color: "#6366f1", 
    bg: "#eef2ff" 
  },
  { 
    key: "totalNotes",     
    label: "Notes",      
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    color: "#10b981", 
    bg: "#ecfdf5" 
  },
  { 
    key: "totalSessions",  
    label: "Sessions",   
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, 
    color: "#f59e0b", 
    bg: "#fffbeb" 
  },
  { 
    key: "totalViews",     
    label: "Views",      
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    color: "#3b82f6", 
    bg: "#eff6ff" 
  },
  { 
    key: "totalDownloads", 
    label: "Downloads",  
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    color: "#8b5cf6", 
    bg: "#f5f3ff" 
  },
  { 
    key: "totalAttendees", 
    label: "Attendees",  
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    color: "#ec4899", 
    bg: "#fdf2f8" 
  },
];

const QUICK_ACTIONS = [
  { 
    href: "/upload-video", 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, 
    label: "Upload Video",     
    desc: "Share a lesson", 
    color: "#6366f1", 
    bg: "#eef2ff" 
  },
  { 
    href: "/upload-notes", 
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, 
    label: "Upload Notes",     
    desc: "Share study material", 
    color: "#10b981", 
    bg: "#ecfdf5" 
  },
  { 
    href: "/live/create",  
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, 
    label: "Go Live",          
    desc: "Start a session", 
    color: "#f59e0b", 
    bg: "#fffbeb" 
  },
  { 
    href: "/explore",      
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, 
    label: "Explore",          
    desc: "Browse content", 
    color: "#3b82f6", 
    bg: "#eff6ff" 
  },
];

function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

function DashSkeleton() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome skeleton */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-60" />
          </div>
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
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

    if (user.providerData?.[0]?.providerId === "password" && !user.emailVerified) {
      router.push("/verify-email");
      return;
    }

    const cached = getMemCache("dashboard");
    if (cached) {
      setData(cached); setLoading(false);
      authFetch("/api/dashboard").then(r => r.json()).then(d => { if (!d.error) { setData(d); setMemCache("dashboard", d, 30_000); } });
    } else {
      authFetch("/api/dashboard").then(r => r.json()).then(d => {
        if (!d.error) { setData(d); setMemCache("dashboard", d, 30_000); }
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    authFetch("/api/watch-history?type=continue")
      .then(r => r.json())
      .then(d => setContinueWatching(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, [user, authLoading]);

  if (authLoading || loading || !user) return <DashSkeleton />;
  if (!data?.stats) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-[15px] font-medium" style={{ color: "var(--text-2)" }}>Could not load dashboard</p>
      <button onClick={() => window.location.reload()} className="btn-secondary text-[13px]">Try again</button>
    </div>
  );

  const { stats = {}, recentVideos = [], recentNotes = [] } = data;
  const firstName = user.displayName?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, var(--accent) 0%, #8b5cf6 60%, #a855f7 100%)" }}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                style={{ border: "2px solid rgba(255,255,255,0.3)" }} />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "2px solid rgba(255,255,255,0.25)" }}>
                {firstName[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                Welcome back
              </p>
              <h1 className="text-[22px] sm:text-[26px] font-black text-white leading-tight">
                Hey, {firstName}
              </h1>
              <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{user.email}</p>
            </div>
          </div>

          {/* Credits badge */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.294 2.744.88 4.226a1 1 0 01-1.476 1.065L10 17.024l-3.991 2.026a1 1 0 01-1.476-1.065l.88-4.226-3.294-2.744a1 1 0 01-.285-1.05L3.57 7.509l-1.233-.616a1 1 0 01.894-1.79l1.599.8L8.954 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Credits</p>
              <p className="text-[26px] font-black text-white leading-none stat-number">{stats.credits ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 stagger-grid">
        {STATS.map((s) => (
          <div key={s.key} className="rounded-2xl p-4 text-center transition-all duration-200 cursor-default"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[17px] mx-auto mb-2"
              style={{ background: s.bg }}>
              {s.icon}
            </div>
            <p className="text-[22px] font-black stat-number leading-none" style={{ color: "var(--text-1)" }}>
              {stats[s.key] ?? 0}
            </p>
            <p className="text-[10px] mt-1 font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Continue Watching ── */}
      {continueWatching.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-accent">
                <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>Continue Watching</p>
            </div>
            <Link href="/history" className="text-[12px] font-medium transition-colors"
              style={{ color: "var(--accent)" }}>View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {continueWatching.map((h) => {
              const pct = h.durationSeconds > 0 ? Math.min(100, Math.round((h.progressSeconds / h.durationSeconds) * 100)) : 0;
              return (
                <Link key={h._id} href={`/videos/${h.video._id}`}
                  className="group rounded-xl overflow-hidden transition-all duration-200"
                  style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div className="relative" style={{ aspectRatio: "16/9", background: "var(--surface-3)" }}>
                    {h.video.thumbnailUrl ? (
                      <img src={h.video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : <div className="w-full h-full flex items-center justify-center text-lg">🎥</div>}
                    {/* Progress */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <div className="h-full" style={{ width: `${pct}%`, background: "#ef4444" }} />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-semibold line-clamp-1" style={{ color: "var(--text-1)" }}>{h.video.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>{pct}% watched</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="card p-5">
        <p className="text-[13px] font-bold mb-4" style={{ color: "var(--text-1)" }}>Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-200 group"
              style={{ background: a.bg, border: `1px solid ${a.color}20` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="text-[12px] font-bold" style={{ color: a.color }}>{a.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Content ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { 
            title: "Recent Videos", 
            items: recentVideos, 
            link: "/upload-video", 
            empty: "No videos yet", 
            emptyIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, 
            meta: (v) => `${v.views} views` 
          },
          { 
            title: "Recent Notes",  
            items: recentNotes,  
            link: "/upload-notes", 
            empty: "No notes yet",  
            emptyIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, 
            meta: (n) => `${n.downloads} downloads` 
          },
        ].map((s) => (
          <div key={s.title} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-bold" style={{ color: "var(--text-1)" }}>{s.title}</p>
              <Link href="/explore" className="text-[12px] font-medium" style={{ color: "var(--accent)" }}>View all →</Link>
            </div>
            {s.items.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-icon bg-zinc-50 text-zinc-300 w-12 h-12 flex items-center justify-center rounded-full mb-3">{s.emptyIcon}</div>
                <p className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>{s.empty}</p>
                <Link href={s.link} className="btn-accent text-[12px] px-4 py-2 mt-2">Upload now</Link>
              </div>
            ) : (
              <ul className="space-y-0">
                {s.items.map((item, i) => (
                  <li key={item._id}
                    className="flex justify-between items-center py-3 transition-colors duration-100 rounded-xl px-2 -mx-2"
                    style={{ borderBottom: i < s.items.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <span className="text-[13px] truncate font-medium" style={{ color: "var(--text-1)" }}>{item.title}</span>
                    <span className="text-[12px] ml-3 flex-shrink-0 font-medium" style={{ color: "var(--text-3)" }}>{s.meta(item)}</span>
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
