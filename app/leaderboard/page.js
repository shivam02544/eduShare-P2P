"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layouts/PageContainer";
import { Trophy, Medal, Users, TrendingUp, Search, User, Target, Zap, Award, Activity, Sparkles, ChevronRight } from "lucide-react";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

// Simple in-memory client cache
const memCache = {};
function getMemCache(key) { const e = memCache[key]; return e && e.exp > Date.now() ? e.data : null; }
function setMemCache(key, data, ttlMs = 60_000) { memCache[key] = { data, exp: Date.now() + ttlMs }; }

const medals = [
  <Medal key="gold" className="w-10 h-10 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />, 
  <Medal key="silver" className="w-10 h-10 text-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.5)]" />, 
  <Medal key="bronze" className="w-10 h-10 text-amber-700 drop-shadow-[0_0_15px_rgba(180,83,9,0.5)]" />
];

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-28 rounded-3xl bg-surface-2 dark:bg-surface-3 animate-pulse border border-border/50" />
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
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-20 pb-32">
        
        {/* ── Page Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="relative overflow-hidden rounded-3xl p-10 md:p-16 bg-surface-1 dark:bg-surface-2 text-text-1 shadow-xl border border-border group"
        >
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-accent/5 rounded-full blur-[140px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 relative z-10">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent text-bg flex items-center justify-center shadow-lg shadow-accent/20 border border-accent/20">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent">Hall of Fame</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-text-1 tracking-tight leading-none">
                Network<br /><span className="text-accent">Elite</span>
              </h1>
              <p className="text-lg font-medium text-text-4 max-w-md leading-relaxed">
                Celebrating the architects of collective intelligence and the champions of peer-to-peer exchange.
              </p>
            </div>

            {/* User Rank Overview */}
            {myRank > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springConfig, delay: 0.2 }}
                className="p-8 rounded-3xl bg-surface-2 dark:bg-surface-3 text-text-1 shadow-xl space-y-8 border border-border min-w-[320px] relative overflow-hidden group/rank"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/rank:opacity-10 transition-opacity">
                  <Sparkles className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-accent text-bg flex items-center justify-center shadow-xl shadow-accent/30 border-4 border-surface-1">
                     <Target className="w-8 h-8" />
                  </div>
                  <div>
                     <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-1">My Standing</p>
                     <p className="text-4xl font-bold tracking-tight">#{myRank}</p>
                  </div>
                </div>
                 <div className="h-px bg-border/50" />
                <div className="flex items-center justify-between gap-12">
                   <div className="flex flex-col">
                       <span className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-1">Asset Value</span>
                       <div className="flex items-center gap-3">
                         <Zap className="w-4 h-4 text-accent fill-accent" />
                         <span className="text-2xl font-bold tracking-tight text-text-1">{users[myRank - 1]?.credits}</span>
                       </div>
                    </div>
                    <Link href={`/profile/${user?.uid}`} className="px-6 py-3 rounded-xl bg-text-1 text-bg text-[11px] font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all">
                      View Identity
                    </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Rankings List ── */}
        <div className="space-y-12">
          <div className="flex items-center justify-between border-b border-border/50 pb-10 px-8">
            <div className="flex items-center gap-4 text-text-1">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Live Network Standing</h2>
            </div>
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2 text-[11px] font-bold text-text-4 uppercase tracking-wider">
                  <Users className="w-4 h-4 opacity-40" />
                  {users.length} Active Nodes
               </div>
            </div>
          </div>

          {loading ? <LeaderboardSkeleton /> : (
            <div className="space-y-6">
              <AnimatePresence>
                {users.map((u, i) => {
                  const isMe = u.firebaseUid === user?.uid;
                  const isTop3 = i < 3;
                  
                  return (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...springConfig, delay: i * 0.05 }}
                    >
                       <Link href={`/profile/${u.firebaseUid}`}
                        className={`group relative flex items-center gap-6 md:gap-10 p-8 rounded-3xl border transition-all duration-500 ${
                          isMe ? "bg-accent/5 border-accent shadow-xl shadow-accent/5 z-10" : "bg-surface-1 dark:bg-surface-2 border-border hover:bg-surface-2 hover:shadow-xl hover:-translate-y-1"
                        }`}
                      >
                        {/* Rank Indicator */}
                        <div className="w-16 flex flex-col items-center justify-center shrink-0">
                          {isTop3 ? medals[i] : (
                            <span className="text-3xl font-black text-text-4/20 italic tracking-tighter">#{i + 1}</span>
                          )}
                        </div>

                        {/* User Avatar */}
                        <div className="relative shrink-0">
                           {u.image ? (
                             <div className={`p-0.5 rounded-2xl transition-transform duration-500 group-hover:rotate-3 ${isTop3 ? 'bg-gradient-to-br from-accent to-accent/50 shadow-lg shadow-accent/10' : 'bg-border'}`}>
                               <img src={u.image} alt="" className="w-16 h-16 md:w-20 md:h-20 rounded-[14px] object-cover border-2 border-surface-1 shadow-inner" />
                             </div>
                          ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-surface-2 dark:bg-surface-3 flex items-center justify-center text-text-1 text-2xl font-bold border border-border group-hover:bg-accent group-hover:text-bg transition-all shadow-inner group-hover:rotate-3">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          {isMe && <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent border-4 border-surface-1 shadow-2xl z-10 animate-pulse" />}
                        </div>

                        {/* User Details */}
                         <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                             <p className="text-2xl md:text-3xl font-bold text-text-1 tracking-tight group-hover:text-accent transition-colors truncate uppercase">{u.name}</p>
                             {isMe && <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-bg px-3 py-1 rounded-full shadow-lg shadow-accent/10 border border-accent/20">Authorized Identity</span>}
                           </div>
                           {u.skills?.length > 0 && (
                              <div className="hidden sm:flex flex-wrap gap-2">
                               {u.skills.slice(0, 4).map((s) => (
                                 <span key={s} className="text-[10px] font-semibold uppercase tracking-wider bg-surface-2 dark:bg-surface-3 text-text-4 px-3 py-1.5 rounded-lg border border-border group-hover:border-accent/30 transition-all">
                                   {s}
                                 </span>
                               ))}
                             </div>
                           )}
                         </div>

                         {/* Credit Score */}
                        <div className="flex items-center gap-5 bg-surface-2 dark:bg-surface-3 px-8 py-5 rounded-2xl shadow-inner border border-border group-hover:border-accent/30 transition-all shrink-0">
                          <div className="text-right space-y-0.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-text-4 opacity-50">Equity</p>
                            <div className="flex items-center justify-end gap-2">
                               <Zap className="w-5 h-5 text-accent fill-accent" />
                               <p className="text-3xl font-bold text-text-1 tracking-tight">{u.credits}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-6 h-6 text-text-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
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
    </PageContainer>
  );
}

