"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Users, TrendingUp, Search, User, Target, Zap } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

// Simple in-memory client cache
const memCache = {};
function getMemCache(key) { const e = memCache[key]; return e && e.exp > Date.now() ? e.data : null; }
function setMemCache(key, data, ttlMs = 60_000) { memCache[key] = { data, exp: Date.now() + ttlMs }; }

const medals = [<Medal className="w-8 h-8 text-amber-400" />, <Medal className="w-8 h-8 text-slate-400" />, <Medal className="w-8 h-8 text-amber-700" />];

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const cached = getMemCache("leaderboard");
    if (cached) { setUsers(cached); setLoading(false); return; }

    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { 
        const list = Array.isArray(d) ? d : []; 
        setMemCache("leaderboard", list, 60_000); 
        setUsers(list); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [user]);

  const myRank = users.findIndex((u) => u.firebaseUid === user?.uid) + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-32 px-4 md:px-6 lg:px-0">
      
      {/* ── Page Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="relative overflow-hidden rounded-[32px] md:rounded-[48px] p-6 md:p-10 lg:p-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px] -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Global Leaderboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-text-1 tracking-tighter leading-tight">
              Top <span className="text-amber-500">Contributors</span>
            </h1>
            <p className="text-base font-medium text-text-3 max-w-sm">
              Recognizing the top contributors in the EduShare community.
            </p>
          </div>

          {/* User Rank Overview */}
          {myRank > 0 && (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="px-6 md:px-8 py-5 md:py-6 rounded-[28px] md:rounded-[40px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl space-y-3 md:space-y-4 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg border border-white/20">
                   <Target className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">My Rank</p>
                   <p className="text-2xl font-black tracking-tighter">Position #{myRank}</p>
                </div>
              </div>
              <div className="h-px bg-white/10 dark:bg-indigo-500/10" />
              <div className="flex items-center justify-between gap-8">
                 <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Total Credits</p>
                    <p className="text-lg font-black tracking-tighter">{users[myRank - 1]?.credits}</p>
                 </div>
                 <Link href={`/profile/${user?.uid}`} className="px-4 py-2 rounded-xl bg-white/10 dark:bg-indigo-500/10 text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">
                   View Profile
                 </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Rankings List ── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-text-3" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Rankings</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-text-3">
                <Users className="w-3.5 h-3.5" />
                {users.length} Active Members
             </div>
          </div>
        </div>

        {loading ? <LeaderboardSkeleton /> : (
          <div className="space-y-4">
            <AnimatePresence>
              {users.map((u, i) => {
                const isMe = u.firebaseUid === user?.uid;
                const isTop3 = i < 3;
                
                return (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springConfig, delay: i * 0.05 }}
                  >
                    <Link href={`/profile/${u.firebaseUid}`}
                      className={`group relative flex items-center gap-3 md:gap-6 p-4 md:p-5 rounded-[24px] md:rounded-[32px] backdrop-blur-md border transition-all duration-300 ${
                        isMe ? "bg-indigo-500/10 border-indigo-500/30 shadow-xl" : "bg-white/70 dark:bg-slate-900/70 border-border hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {/* Rank Indicator */}
                      <div className="w-10 flex flex-col items-center justify-center">
                        {isTop3 ? medals[i] : (
                          <span className="text-sm font-black text-text-3 opacity-40">#{i + 1}</span>
                        )}
                      </div>

                      {/* User Avatar */}
                      <div className="relative">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-10 h-10 md:w-14 md:h-14 rounded-[14px] md:rounded-[20px] object-cover ring-2 ring-border shadow-lg group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-10 h-10 md:w-14 md:h-14 rounded-[14px] md:rounded-[20px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-2 text-base md:text-xl font-black border border-border group-hover:bg-indigo-500 transition-all">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        {isMe && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900" />}
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="text-sm md:text-lg font-black text-text-1 tracking-tight group-hover:text-amber-500 transition-colors truncate">{u.name}</p>
                          {isMe && <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-500 text-white px-2 py-0.5 rounded-md">Top Member</span>}
                        </div>
                        {u.skills?.length > 0 && (
                          <div className="hidden sm:flex gap-2 mt-1.5 opacity-60">
                            {u.skills.slice(0, 3).map((s) => (
                              <span key={s} className="text-[9px] font-black uppercase tracking-tighter bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-lg border border-border">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Credit Score */}
                      <div className="flex items-center gap-2 md:gap-4 bg-slate-900 dark:bg-white px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-xl shadow-slate-900/20 group-hover:scale-105 transition-transform duration-500 shrink-0">
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/50 dark:text-slate-400 mb-0.5">Credits</p>
                          <div className="flex items-center gap-2">
                             <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                             <p className="text-base font-black text-white dark:text-slate-950 tracking-tighter">{u.credits}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

