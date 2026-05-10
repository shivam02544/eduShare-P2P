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
  { key: "totalVideos", label: "Videos", icon: Video, color: "text-accent", bg: "bg-accent/10" },
  { key: "totalNotes", label: "Notes", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "totalSessions", label: "Sessions", icon: Play, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "totalViews", label: "Views", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "totalDownloads", label: "Downloads", icon: Download, color: "text-violet-500", bg: "bg-violet-500/10" },
  { key: "totalAttendees", label: "Attendees", icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
];

const QUICK_ACTIONS = [
  { href: "/upload-video", icon: Video, label: "Upload Video", desc: "Share a video", color: "text-accent", bg: "bg-accent/10" },
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
      <div className="h-[200px] rounded-3xl bg-surface-2 dark:bg-surface-3 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 animate-pulse">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl bg-surface-2 dark:bg-surface-3 p-6 space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-surface-3 dark:bg-surface-4" />
            <div className="h-6 w-16 rounded-lg bg-surface-3 dark:bg-surface-4" />
            <div className="h-2 w-12 rounded-full bg-surface-3 dark:bg-surface-4" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface-2 dark:bg-surface-3" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-40 rounded-xl bg-surface-2 dark:bg-surface-3" />
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-surface-2 dark:bg-surface-3" />)}
        </div>
        <div className="space-y-4">
          <div className="h-6 w-40 rounded-xl bg-surface-2 dark:bg-surface-3" />
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-surface-2 dark:bg-surface-3" />)}
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
  }, [user, authLoading, router]);

  if (authLoading || loading || !user) return <DashSkeleton />;

  const { stats = {}, recentVideos = [], recentNotes = [] } = data || {};
  const displayName = user.displayName || user.email?.split("@")[0] || "Operator";
  const firstName = displayName.split(" ")[0];

  return (
    <PageContainer>
       <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-surface-1 dark:bg-surface-2 text-text-1 shadow-lg border border-border group"
      >
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute -bottom-20 -left-20 w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
             <div className="relative shrink-0">
              {user.photoURL ? (
                <div className="p-1 rounded-3xl bg-gradient-to-br from-accent/40 to-transparent shadow-xl">
                  <img src={user.photoURL} alt="" className="w-28 h-28 rounded-2xl object-cover border-2 border-surface-1 dark:border-surface-2" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-accent/10 text-accent flex items-center justify-center text-4xl font-bold border border-accent/20 shadow-inner">
                  {firstName[0].toUpperCase()}
                </div>
              )}
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg border-2 border-surface-1 dark:border-surface-2"
              >
                 <Zap className="w-5 h-5 fill-current" />
              </motion.div>
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-accent/80">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Learning Hub</span>
              </div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-text-1">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-500">{firstName}</span>
              </h1>
              <p className="text-[11px] font-semibold text-text-3 uppercase tracking-widest bg-surface-2/50 dark:bg-surface-3/50 inline-block px-3 py-1 rounded-full border border-border/50">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-8 px-8 py-6 rounded-2xl bg-surface-2/50 dark:bg-surface-3/50 backdrop-blur-xl border border-border shadow-lg min-w-[300px]">
             <div className="text-center space-y-1 flex-1">
               <p className="text-[11px] font-bold uppercase tracking-wider text-text-4">Credits</p>
               <div className="flex items-center justify-center gap-2">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
                 <p className="text-3xl font-bold tracking-tight text-text-1">{stats.credits ?? 0}</p>
               </div>
             </div>
             <div className="w-px h-12 bg-border/50" />
             <div className="text-center group/lvl cursor-help flex-1">
               <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center mx-auto mb-2 transition-all group-hover/lvl:rotate-6 group-hover/lvl:scale-105 shadow-lg shadow-accent/20 border-2 border-white/20">
                 <Sparkles className="w-6 h-6" />
               </div>
               <p className="text-[11px] font-bold uppercase tracking-wider text-text-2">Lvl {Math.floor((stats.credits || 0) / 500) + 1}</p>
             </div>
          </div>
        </div>
      </motion.div>

      <ResponsiveGrid columns={6}>
        {STATS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: i * 0.05 + 0.2 }}
            className="group bg-surface-1 dark:bg-surface-2 border border-border p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
          >
            <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4 transition-all group-hover:scale-110 border border-current/10 shadow-inner`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-text-1 tracking-tight leading-none mb-1">
              {stats[s.key] ?? 0}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-4 group-hover:text-accent transition-colors">
              {s.label}
            </p>
          </motion.div>
        ))}
      </ResponsiveGrid>

      <div className="grid lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-8 space-y-12">
          
          {continueWatching.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-2">
                <SectionHeader 
                  title="Active Modules" 
                  description="Synchronized session history"
                  badge="CONTINUE"
                  className="!space-y-0" 
                />
                <Link href="/history" className="text-[11px] font-bold uppercase tracking-wider text-accent hover:text-accent-h transition-all flex items-center gap-2 bg-accent/5 px-5 py-2.5 rounded-xl border border-accent/10">
                  History <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {continueWatching.map((h, i) => {
                  const pct = h.durationSeconds > 0 ? Math.min(100, Math.round((h.progressSeconds / h.durationSeconds) * 100)) : 0;
                  return (
                    <motion.div
                      key={h._id}
                      whileHover={{ y: -4 }}
                      className="group bg-surface-1 dark:bg-surface-2 border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-2 border-b-accent/20"
                    >
                      <Link href={`/videos/${h.video._id}`}>
                         <div className="relative aspect-video bg-surface-2 overflow-hidden">
                          {h.video.thumbnailUrl ? (
                            <img src={h.video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                          ) : <div className="w-full h-full flex items-center justify-center text-xl text-text-3"><Video className="w-8 h-8 opacity-20" /></div>}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-white text-accent text-[11px] font-bold uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300 shadow-xl">
                            Resume Session
                          </div>
                        </div>
                        <div className="p-5 space-y-4">
                          <p className="text-sm font-bold text-text-1 leading-tight line-clamp-2 min-h-[40px] group-hover:text-accent transition-colors">{h.video.title}</p>
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-text-4 uppercase tracking-wider">
                               <span className="text-accent">{pct}% Done</span>
                               <span className="line-clamp-1 max-w-[100px] text-text-3">{h.video.uploader?.name}</span>
                            </div>
                             <div className="h-1.5 bg-surface-2 dark:bg-surface-3 rounded-full overflow-hidden border border-border/50">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${pct}%` }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className="h-full bg-accent rounded-full" 
                                />
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

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { title: "Video Matrix", items: recentVideos, icon: Video, type: 'video', uploadHref: '/upload-video', color: 'text-accent', bg: 'bg-accent/10' },
              { title: "Note Repository", items: recentNotes, icon: FileText, type: 'note', uploadHref: '/upload-notes', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map((s) => (
              <div key={s.title} className="bg-surface-1 dark:bg-surface-2 border border-border rounded-3xl p-8 shadow-sm flex flex-col hover:shadow-xl transition-all group/box">
                <div className="flex items-center justify-between mb-8 px-1">
                  <div className="flex items-center gap-4 text-text-1">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center border border-border shadow-inner group-hover/box:scale-110 transition-transform`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-2">{s.title}</h3>
                  </div>
                  <Link href={`/profile/${user?.uid}`} className="text-[11px] font-bold uppercase tracking-wider text-text-4 hover:text-accent transition-all flex items-center gap-2 group/link">
                    Inventory
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>

                {s.items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-6">
                    <div className="w-16 h-16 bg-surface-2 dark:bg-surface-3 rounded-2xl flex items-center justify-center text-text-4 border border-dashed border-border group-hover/box:rotate-6 transition-transform duration-500">
                      <s.icon className="w-8 h-8 opacity-20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-text-1 tracking-tight">System Empty</p>
                      <p className="text-[11px] font-semibold text-text-4 uppercase tracking-wider max-w-[200px] mx-auto leading-relaxed">Initiate your first deployment.</p>
                    </div>
                    <Link href={s.uploadHref} className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-accent text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
                      <Plus className="w-4 h-4" />
                      Deploy {s.type === 'video' ? 'Matrix' : 'Notes'}
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4 flex-1">
                    {s.items.map((item) => (
                      <li key={item._id}>
                         <Link 
                          href={s.type === 'video' ? `/videos/${item._id}` : `/notes/${item._id}`}
                          className="group flex items-center justify-between p-5 rounded-2xl bg-surface-2/30 dark:bg-surface-3/30 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all border border-transparent hover:border-border shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-5 flex-1 min-w-0">
                             {s.type === 'video' && item.thumbnailUrl ? (
                              <div className="w-16 h-10 rounded-xl shrink-0 overflow-hidden border border-border shadow-inner">
                                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                            ) : (
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
                                 s.type === 'video' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                               }`}>
                                {s.type === 'video' ? <Play className="w-5 h-5 fill-current" /> : <FileText className="w-5 h-5" />}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-text-1 truncate group-hover:text-accent transition-colors">{item.title}</p>
                              {item.subject && (
                                <p className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mt-1 opacity-60">{item.subject}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 ml-4">
                            <span className="text-[11px] font-bold text-text-4 uppercase tracking-wider bg-surface-1 dark:bg-surface-2 px-3 py-1.5 rounded-xl border border-border shadow-sm group-hover:text-text-1 group-hover:border-accent/30 transition-all">
                              {s.type === 'video' ? `${item.views || 0} v` : `${item.downloads || 0} d`}
                            </span>
                            <ArrowUpRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" />
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

        <div className="lg:col-span-4 space-y-10">
          
          <div className="bg-surface-1 dark:bg-surface-2 border border-border rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-1 mb-8 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                <Zap className="w-5 h-5 text-amber-500 fill-current" />
              </div>
              Command Palette
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {QUICK_ACTIONS.map((a) => (
                 <Link key={a.href} href={a.href}
                  className="group flex items-center gap-5 p-5 rounded-2xl bg-surface-2/40 dark:bg-surface-3/40 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all border border-transparent hover:border-border shadow-sm hover:shadow-xl"
                >
                  <div className={`w-14 h-14 rounded-2xl ${a.bg} ${a.color} flex items-center justify-center shrink-0 border border-current/10 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform`}>
                    <a.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-1 group-hover:text-accent transition-colors">{a.label}</p>
                    <p className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mt-1 opacity-60">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" />
                </Link>
              ))}
            </div>
          </div>

           <div className="bg-accent p-10 rounded-3xl text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-white/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-[30px]" />
             
             <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-xl group-hover:rotate-6 transition-transform duration-500">
                   <Users className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-bold tracking-tight leading-none">Global Ranks</h4>
                   <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider leading-relaxed">
                     Connect with world-class peers and lead the community.
                   </p>
                </div>
                <Link href="/leaderboard" className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-white text-accent text-[11px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl border-b-2 border-slate-200">
                   Enter Standings <ArrowUpRight className="w-4 h-4" />
                </Link>
             </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
