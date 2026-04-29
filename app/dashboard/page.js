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

function DashSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-pulse pb-24">
      <div className="h-64 rounded-[48px] bg-slate-200 dark:bg-white/5" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {Array(6).fill(0).map((_, i) => <div key={i} className="h-32 rounded-[32px] bg-slate-200 dark:bg-white/5" />)}
      </div>
    </div>
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
    if (!user) { router.push("/login"); return; }

    const cached = getMemCache("dashboard");
    if (cached) {
      setData(cached); setLoading(false);
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
  }, [user, authLoading]);

  if (authLoading || loading || !user) return <DashSkeleton />;

  const { stats = {}, recentVideos = [], recentNotes = [] } = data || {};
  const firstName = user.displayName?.split(" ")[0] || "there";

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-10 pb-32 px-4 md:px-6 lg:px-0">
      
      {/* ── Welcome Stage ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
        className="relative overflow-hidden rounded-[32px] md:rounded-[48px] p-6 md:p-10 lg:p-16 bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-3xl"
      >
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-24 h-24 rounded-[32px] object-cover ring-4 ring-white/20 dark:ring-indigo-500/10 shadow-2xl" />
              ) : (
                <div className="w-24 h-24 rounded-[32px] bg-white/10 dark:bg-indigo-500/10 flex items-center justify-center text-4xl font-black border border-white/20">
                  {firstName[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-xl border-4 border-slate-900 dark:border-white">
                 <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">My Dashboard</span>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                Welcome back, <span className="opacity-60">{firstName}</span>
              </h1>
              <p className="text-sm font-medium opacity-50 tracking-tight">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10 px-6 md:px-10 py-5 md:py-8 rounded-[28px] md:rounded-[40px] bg-white/5 dark:bg-slate-500/5 border border-white/10 dark:border-slate-900/5 backdrop-blur-md shadow-inner">
             <div className="text-center space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Credits</p>
               <div className="flex items-center justify-center gap-3">
                 <TrendingUp className="w-6 h-6 text-emerald-400" />
                 <p className="text-2xl md:text-4xl font-black tracking-tighter">{stats.credits ?? 0}</p>
               </div>
             </div>
             <div className="w-px h-12 bg-white/10" />
             <div className="text-center group cursor-help">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-2 transition-transform group-hover:rotate-12">
                 <Sparkles className="w-6 h-6" />
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Platform Level 4</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── Dashboard Statistics ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
        {STATS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: i * 0.05 }}
            className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-border p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2"
          >
            <div className={`w-12 h-12 rounded-[18px] ${s.bg} ${s.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-xl md:text-3xl font-black text-text-1 tracking-tighter leading-none mb-1">
              {stats[s.key] ?? 0}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 opacity-60">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* ── Content Stream (Left) ── */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Continue Learning Selection */}
          {continueWatching.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-text-1">Continue Learning</h2>
                </div>
                <Link href="/history" className="text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-indigo-500 transition-colors">
                  Watch History →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {continueWatching.map((h, i) => {
                  const pct = h.durationSeconds > 0 ? Math.min(100, Math.round((h.progressSeconds / h.durationSeconds) * 100)) : 0;
                  return (
                    <motion.div
                      key={h._id}
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border rounded-3xl"
                    >
                      <Link href={`/videos/${h.video._id}`}>
                        <div className="relative aspect-video bg-slate-100 dark:bg-white/5 overflow-hidden">
                          {h.video.thumbnailUrl ? (
                            <img src={h.video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : <div className="w-full h-full flex items-center justify-center text-2xl">🎥</div>}
                          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-500" />
                        </div>
                        <div className="p-4 space-y-3">
                          <p className="text-sm font-black text-text-1 leading-tight line-clamp-1">{h.video.title}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black text-text-3 uppercase">
                               <span>{pct}% Complete</span>
                               <span>{h.video.uploader?.name}</span>
                            </div>
                            <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner font-black">
                               <div className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${pct}%` }} />
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
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "My Videos", items: recentVideos, icon: Video, type: 'video', uploadHref: '/upload-video' },
              { title: "My Notes", items: recentNotes, icon: FileText, type: 'note', uploadHref: '/upload-notes' },
            ].map((s) => (
              <div key={s.title} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[28px] md:rounded-[40px] p-5 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex items-center gap-3">
                    <s.icon className="w-5 h-5 text-text-3" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-1">{s.title}</h3>
                  </div>
                  <Link href={`/profile/${user?.uid}`} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-indigo-500 transition-colors">
                    View All
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {s.items.length === 0 ? (
                  <div className="text-center py-10 space-y-5">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-text-3 opacity-30">
                      <s.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-text-1 tracking-tight">No {s.type === 'video' ? 'videos' : 'notes'} yet</p>
                      <p className="text-[10px] font-medium text-text-3 max-w-[200px] mx-auto">Share your first {s.type === 'video' ? 'video lesson' : 'study notes'} with the community</p>
                    </div>
                    <Link href={s.uploadHref} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
                      <Plus className="w-3.5 h-3.5" />
                      Upload {s.type === 'video' ? 'Video' : 'Notes'}
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {s.items.map((item) => (
                      <li key={item._id}>
                        <Link 
                          href={s.type === 'video' ? `/videos/${item._id}` : `/notes/${item._id}`}
                          className="group flex items-center justify-between p-3 md:p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-indigo-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                            {s.type === 'video' && item.thumbnailUrl ? (
                              <div className="w-12 h-9 md:w-14 md:h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 flex-shrink-0">
                                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                s.type === 'video' 
                                  ? 'bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white' 
                                  : 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                              }`}>
                                {s.type === 'video' ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-black text-text-1 truncate tracking-tight group-hover:text-indigo-500 transition-colors">{item.title}</p>
                              <p className="text-[10px] font-medium text-text-3 mt-0.5">
                                {item.subject && <span className="uppercase tracking-wider">{item.subject}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-3 shrink-0">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-text-3 uppercase tracking-tighter opacity-60">
                                {s.type === 'video' ? `${item.views || 0} views` : `${item.downloads || 0} dl`}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-text-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
        <div className="lg:col-span-4 space-y-10">
          
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[48px] p-10 shadow-sm space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-1 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.href} href={a.href}
                  className={`group relative flex items-center gap-6 p-6 rounded-[32px] overflow-hidden transition-all duration-300 border border-transparent hover:border-border hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-2xl`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${a.bg} ${a.color} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                    <a.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className={`text-[15px] font-black tracking-tight ${a.color}`}>{a.label}</p>
                    <p className="text-[11px] font-medium text-text-3 mt-0.5">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-text-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden bg-indigo-500 p-10 rounded-[48px] text-white shadow-2xl group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -z-0" />
             <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20">
                   <Users className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-black tracking-tighter leading-tight">Community Standings</h4>
                   <p className="text-xs font-medium opacity-70 leading-relaxed">
                     Check the global leaderboard to see how your learning progress compares with other educators.
                   </p>
                </div>
                <Link href="/leaderboard" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl transition-transform hover:scale-105">
                   View Leaderboard
                </Link>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

