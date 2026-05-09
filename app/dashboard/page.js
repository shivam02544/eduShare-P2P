"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  FileText, 
  Play, 
  Eye, 
  Download, 
  Users, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  Sparkles, 
  Plus, 
  Compass, 
  UserCircle,
  TrendingUp,
  Flame,
  LayoutDashboard
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const memCache = {};
function getMemCache(key) { const e = memCache[key]; return e && e.exp > Date.now() ? e.data : null; }
function setMemCache(key, data, ttlMs = 60_000) { memCache[key] = { data, exp: Date.now() + ttlMs }; }

const STATS = [
  { key: "totalVideos", label: "Videos", icon: Video, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { key: "totalNotes", label: "Notes", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "totalSessions", label: "Sessions", icon: Play, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "totalViews", label: "Views", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "totalDownloads", label: "Downloads", icon: Download, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "totalAttendees", label: "Attendees", icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
];

const QUICK_ACTIONS = [
  { href: "/upload-video", icon: Video, label: "Upload Video", desc: "Share a video", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { href: "/upload-notes", icon: FileText, label: "Share Notes", desc: "Upload notes", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { href: "/live/create", icon: Flame, label: "Host Live", desc: "Start a live session", color: "text-rose-500", bg: "bg-rose-500/10" },
  { href: "/explore", icon: Compass, label: "Explore", desc: "Browse resources", color: "text-amber-500", bg: "bg-amber-500/10" },
];

import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
import ResponsiveGrid from "@/components/layouts/ResponsiveGrid";

function DashSkeleton() {
  return (
    <PageContainer aria-label="Loading dashboard" aria-busy="true">
      {/* Welcome banner skeleton — matches real h ~240px */}
      <div className="h-[200px] md:h-[220px] rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />

      {/* Stats grid skeleton — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 animate-pulse">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-200 dark:bg-white/5 p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-300 dark:bg-white/10" />
            <div className="h-6 w-16 rounded bg-slate-300 dark:bg-white/10" />
            <div className="h-3 w-12 rounded bg-slate-300 dark:bg-white/10" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-white/5" />
        ))}
      </div>

      {/* Content rows skeleton */}
      <div className="grid md:grid-cols-2 gap-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-6 w-40 rounded bg-slate-200 dark:bg-white/5" />
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-white/5" />)}
        </div>
        <div className="space-y-3">
          <div className="h-6 w-40 rounded bg-slate-200 dark:bg-white/5" />
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-white/5" />)}
        </div>
      </div>
    </PageContainer>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({ stats: {}, recentVideos: [], recentNotes: [] });
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }

    const cached = getMemCache("dashboard");
    if (cached) {
      setData(cached);
      setLoading(false);
      // Background revalidation
      authFetch("/api/dashboard").then(r => r.json()).then(d => {
        if (d && !d.error) { setData(d); setMemCache("dashboard", d, 30_000); }
      }).catch(() => {});
    } else {
      authFetch("/api/dashboard").then(r => r.json()).then(d => {
        if (d && !d.error) { setData(d); setMemCache("dashboard", d, 30_000); }
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    authFetch("/api/watch-history?type=continue")
      .then(r => r.json())
      .then(d => setContinueWatching(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  // authFetch is stable (defined outside render), safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  if (authLoading || loading || !user) return <DashSkeleton />;

  const { stats = {}, recentVideos = [], recentNotes = [] } = data || {};
  const firstName = user.displayName?.split(" ")[0] || "there";

  return (
    <PageContainer>
      
      {/* ── Welcome Stage ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
        className="relative overflow-hidden rounded-2xl p-6 md:p-10 lg:p-16 bg-slate-900 dark:bg-slate-800 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-24 h-24 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-bold border border-white/20">
                  {firstName[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md border-2 border-slate-900">
                 <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-300">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">My Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Welcome back, <span className="opacity-80">{firstName}</span>
              </h1>
              <p className="text-sm font-medium opacity-70">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-inner">
             <div className="text-center space-y-1">
               <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Credits</p>
               <div className="flex items-center justify-center gap-2">
                 <TrendingUp className="w-5 h-5 text-emerald-400" />
                 <p className="text-2xl md:text-3xl font-bold tracking-tight">{stats.credits ?? 0}</p>
               </div>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="text-center group cursor-help">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mx-auto mb-1 transition-transform group-hover:scale-110">
                 <Sparkles className="w-5 h-5" />
               </div>
               <p className="text-xs font-bold uppercase tracking-wider opacity-70">Level 4</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── Dashboard Statistics ── */}
      <ResponsiveGrid columns={6}>
        {STATS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: i * 0.05 }}
            className="group bg-white dark:bg-slate-900 border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-text-1 tracking-tight leading-none mb-1">
              {stats[s.key] ?? 0}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-3">
              {s.label}
            </p>
          </motion.div>
        ))}
      </ResponsiveGrid>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* ── Content Stream (Left) ── */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Continue Learning Selection */}
          {continueWatching.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <SectionHeader title="Continue Learning" className="!space-y-1" />
                <Link href="/history" className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">
                  Watch History &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {continueWatching.map((h, i) => {
                  const pct = h.durationSeconds > 0 ? Math.min(100, Math.round((h.progressSeconds / h.durationSeconds) * 100)) : 0;
                  return (
                    <motion.div
                      key={h._id}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-white dark:bg-slate-900 border border-border rounded-2xl overflow-hidden shadow-sm"
                    >
                      <Link href={`/videos/${h.video._id}`}>
                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          {h.video.thumbnailUrl ? (
                            <img src={h.video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : <div className="w-full h-full flex items-center justify-center text-xl text-slate-400"><Video className="w-8 h-8" /></div>}
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />
                        </div>
                        <div className="p-4 space-y-2">
                          <p className="text-sm font-bold text-text-1 leading-tight line-clamp-1">{h.video.title}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-text-3">
                               <span>{pct}%</span>
                               <span>{h.video.uploader?.name}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Activity Overviews — My Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "My Videos", items: recentVideos, icon: Video, type: 'video', uploadHref: '/upload-video' },
              { title: "My Notes", items: recentNotes, icon: FileText, type: 'note', uploadHref: '/upload-notes' },
            ].map((s) => (
              <div key={s.title} className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-text-1">
                    <s.icon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">{s.title}</h3>
                  </div>
                  <Link href={`/profile/${user?.uid}`} className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors flex items-center gap-1">
                    View All
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {s.items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                      <s.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-text-1 tracking-tight">No {s.type === 'video' ? 'videos' : 'notes'} yet</p>
                      <p className="text-xs font-medium text-text-3 max-w-[200px] mx-auto">Share your first {s.type === 'video' ? 'video lesson' : 'study notes'} with the community</p>
                    </div>
                    <Link href={s.uploadHref} className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-lg bg-indigo-500 text-white text-xs font-bold shadow-md hover:bg-indigo-600 transition-colors">
                      <Plus className="w-4 h-4" />
                      Upload {s.type === 'video' ? 'Video' : 'Notes'}
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2 flex-1">
                    {s.items.map((item) => (
                      <li key={item._id}>
                        <Link 
                          href={s.type === 'video' ? `/videos/${item._id}` : `/notes/${item._id}`}
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {s.type === 'video' && item.thumbnailUrl ? (
                              <div className="w-12 h-8 rounded shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                s.type === 'video' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                              }`}>
                                {s.type === 'video' ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-text-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</p>
                              {item.subject && (
                                <p className="text-xs text-text-3 mt-0.5">{item.subject}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-xs font-medium text-text-3">
                              {s.type === 'video' ? `${item.views || 0} views` : `${item.downloads || 0} dl`}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-text-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions (Right) ── */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-1 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.href} href={a.href}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg ${a.bg} ${a.color} flex items-center justify-center shrink-0`}>
                    <a.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{a.label}</p>
                    <p className="text-xs text-text-3">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-text-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600 dark:bg-indigo-500 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                   <Users className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-xl font-bold tracking-tight mb-1">Community Standings</h4>
                   <p className="text-sm text-indigo-100 leading-relaxed">
                     Check the global leaderboard to see how your learning progress compares with other educators.
                   </p>
                </div>
                <Link href="/leaderboard" className="inline-block mt-2 px-5 py-2.5 rounded-lg bg-white text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors">
                   View Leaderboard
                </Link>
             </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}

