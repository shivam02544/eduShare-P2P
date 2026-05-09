"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Zap, 
  Search,
  BookOpen,
  Activity,
  Target,
  Monitor,
  ShieldCheck,
  ChevronRight,
  Layers,
  Cpu,
  Radio
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function SessionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="rounded-3xl border border-border bg-slate-100 dark:bg-white/5 h-[400px] animate-pulse" />
      ))}
    </div>
  );
}

export default function LivePage() {
  const { user, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/live");
      const d = await res.json();
      const list = Array.isArray(d) ? d : [];
      setSessions(list);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleJoin = async (id) => {
    if (!user) {
      toast.error("Please sign in to join a live session.");
      router.replace("/login");
      return;
    }
    setJoining(id);
    await withLoading(async () => {
      const res = await authFetch(`/api/live/${id}/join`, { method: "POST" });
      const data = await res.json();
      if (data.message) toast.success(data.message);
      if (data.error)   toast.error(data.error);
      fetchSessions();
    }, "Joining session...");
    setJoining(null);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-16 pb-40 px-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="space-y-6"
        >
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                   <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Live Now</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-bold text-text-1 tracking-tight leading-none">
               Live <span className="text-text-3">Sessions</span>
             </h1>
          </div>
          <p className="text-text-2 text-lg font-medium max-w-xl leading-relaxed">
            Join live study sessions and learn from your peers in real-time.
          </p>
        </motion.div>

        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="shrink-0"
          >
            <Link href="/live/create" className="group relative flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-3xl font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-slate-900/10 dark:shadow-white/5">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Schedule Session
            </Link>
          </motion.div>
        )}
      </div>

      {/* ── Live Sessions Grid ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SessionSkeleton />
          </motion.div>
        ) : sessions.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 rounded-3xl border border-dashed border-border bg-slate-50/50 dark:bg-white/5 space-y-8"
          >
            <div className="relative">
               <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-inner border border-border text-text-3 opacity-20">
                 <Video className="w-14 h-14" />
               </div>
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute -inset-4 border border-indigo-500/10 rounded-full border-dashed"
               />
            </div>
            <div className="text-center space-y-2">
               <h2 className="text-2xl font-bold text-text-1">No Active Sessions</h2>
               <p className="text-xs font-bold uppercase tracking-wider text-text-3">Be the first to start a live session.</p>
            </div>
            {user && (
              <Link href="/live/create" className="group flex items-center gap-3 px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20">
                Start Session
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {sessions.map((s) => (
              <motion.div 
                key={s._id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: springConfig }
                }}
                whileHover={{ y: -12 }}
                className="group relative flex flex-col rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-10 transition-all hover:shadow-3xl hover:shadow-indigo-500/10 overflow-hidden"
              >
                {/* Visual Textures */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[60px] -z-10 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-8 right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                   <Layers className="w-32 h-32 rotate-12" />
                </div>

                <div className="relative space-y-8 h-full flex flex-col">
                  {/* Session Header */}
                  <div className="flex items-start justify-between">
                     <div className="px-5 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20">
                        {s.subject}
                     </div>
                     <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-text-3 font-bold text-xs uppercase tracking-wider mb-1">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-text-3 font-bold text-xs uppercase tracking-wider">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {new Date(s.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                     </div>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-4 flex-1">
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-50">Live Session</p>
                        <h3 className="text-2xl font-bold text-text-1 leading-tight truncate group-hover:text-indigo-500 transition-colors">
                          {s.title}
                        </h3>
                     </div>
                     <p className="text-text-3 text-sm leading-relaxed font-medium opacity-70 line-clamp-3">
                       {s.description || "Join this interactive session to discuss topics and learn together."}
                     </p>
                  </div>

                  {/* Host Information */}
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <Link href={`/profile/${s.teacher?.firebaseUid}`} className="relative group/u">
                      {s.teacher?.image ? (
                        <img src={s.teacher.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-border group-hover/u:rotate-6 transition-transform" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                          {s.teacher?.name?.[0]}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </Link>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest opacity-50">Host</span>
                      <Link href={`/profile/${s.teacher?.firebaseUid}`} className="text-sm font-bold text-text-1 hover:text-indigo-500 transition-colors uppercase tracking-tight">
                        {s.teacher?.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-text-3 font-bold uppercase tracking-wider">
                        <Users className="w-3 h-3 text-indigo-500" />
                        {s.attendees?.length || 0} Joined
                      </div>
                    </div>
                  </div>

                  {/* Session Actions */}
                  <div className="flex gap-4 pt-4">
                    {s.meetingLink ? (
                      <motion.a 
                        whileTap={{ scale: 0.95 }}
                        href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 bg-indigo-500 text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-wider shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Session
                      </motion.a>
                    ) : (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoin(s._id)} 
                        disabled={joining === s._id}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl py-4 text-xs font-bold uppercase tracking-wider hover:scale-105 disabled:opacity-50 transition-all shadow-xl"
                      >
                        {joining === s._id ? (
                           <Activity className="w-4 h-4 animate-spin" />
                        ) : (
                           <Zap className="w-4 h-4 fill-current" />
                        )}
                        {joining === s._id ? "JOINING..." : "JOIN SESSION (+10 CR)"}
                      </motion.button>
                    )}

                    {user && s.teacher?.firebaseUid === user.uid && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={async () => {
                          if (confirmDelete !== s._id) {
                            setConfirmDelete(s._id);
                            toast("Tap again to confirm ending this session.", { icon: "⚠️", duration: 3000 });
                            setTimeout(() => setConfirmDelete(null), 3500);
                            return;
                          }
                          setConfirmDelete(null);
                          await authFetch(`/api/live/${s._id}`, { method: "DELETE" });
                          toast.success("Session ended.");
                          fetchSessions();
                        }}
                        aria-label={confirmDelete === s._id ? "Confirm: end this session" : "End session"}
                        className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                          confirmDelete === s._id
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "bg-slate-50 dark:bg-white/5 border-border text-text-3 hover:bg-rose-500 hover:text-white hover:border-rose-500"
                        }`}
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


