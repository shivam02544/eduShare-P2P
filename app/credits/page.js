"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Trophy, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft,
  Gem,
  Gift,
  PlayCircle,
  FileText,
  Video,
  CheckCircle2,
  Unlock
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const reasonMeta = {
  video_view:            { icon: Video,        label: "Videos Watched",        color: "text-blue-500 bg-blue-50/50 dark:bg-blue-500/10" },
  note_download:         { icon: FileText,     label: "Notes Downloaded",      color: "text-rose-500 bg-rose-50/50 dark:bg-rose-500/10" },
  live_join:             { icon: PlayCircle,   label: "Live Session Joined",   color: "text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10" },
  gift:                  { icon: Gift,         label: "Community Bonus",        color: "text-violet-500 bg-violet-50/50 dark:bg-violet-500/10" },
  quiz_pass:             { icon: CheckCircle2, label: "Quiz Passed",           color: "text-green-500 bg-green-50/50 dark:bg-green-500/10" },
  quiz_completion:       { icon: FileText,     label: "Quiz Completed",        color: "text-teal-500 bg-teal-50/50 dark:bg-teal-500/10" },
  tip_sent:              { icon: ArrowUpRight, label: "Tips Sent",             color: "text-red-500 bg-red-50/50 dark:bg-red-500/10" },
  tip_received:          { icon: Gem,          label: "Tips Received",         color: "text-amber-500 bg-amber-50/50 dark:bg-amber-500/10" },
  boost_video:           { icon: Zap,          label: "Video Boosted",         color: "text-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" },
  boost_note:            { icon: Zap,          label: "Note Boosted",          color: "text-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" },
  premium_note_unlock:   { icon: Unlock,       label: "Premium Note Unlocked",  color: "text-orange-500 bg-orange-50/50 dark:bg-orange-500/10" },
  premium_note_earned:   { icon: Gem,          label: "Royalties Earned",       color: "text-amber-500 bg-amber-50/50 dark:bg-amber-500/10" },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-20 bg-surface-2 rounded-2xl animate-pulse border border-border" />
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
      className="max-w-3xl mx-auto space-y-10 pb-20"
    >
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <Trophy className="w-4 h-4 text-amber-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Account History</span>
          </div>
          <h1 className="text-4xl font-black text-text-1 tracking-tighter sm:text-5xl">Credit History</h1>
          <p className="text-text-2 text-lg font-medium">A record of your earnings and spending.</p>
        </div>
        
        <div className="w-16 h-16 rounded-[24px] bg-slate-100 dark:bg-white/5 border border-border flex items-center justify-center text-text-1">
           <History className="w-8 h-8 opacity-20" />
        </div>
      </div>

      {/* High-Contrast Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative bg-text-1 text-bg p-8 rounded-[40px] shadow-2xl overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-12 translate-x-12" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Total Credits Earned</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter">{data?.totalEarned || 0}</span>
            <span className="text-sm font-bold opacity-60 uppercase tracking-widest text-indigo-400">Credits</span>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-indigo-400">
             <ArrowUpRight className="w-4 h-4" />
             <span>Overall Earnings</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-border p-8 rounded-[40px] shadow-lg shadow-slate-900/5 group"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3 mb-2">Total Transactions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter text-text-1">{data?.total || 0}</span>
            <span className="text-sm font-bold text-text-3 uppercase tracking-widest">Transactions</span>
          </div>
          <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-text-2">
             <CreditCard className="w-4 h-4" />
             <span>Total Activity</span>
          </div>
        </motion.div>
      </div>

      {/* Transaction Feed */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-text-1 uppercase tracking-[0.2em] ml-2">Recent Transactions</h3>
        
        {loading ? <SkeletonRows /> : data?.transactions.length === 0 ? (
          <div className="text-center py-32 rounded-[48px] border border-dashed border-border bg-slate-50/50 dark:bg-white/5">
            <Gem className="w-16 h-16 text-text-3 mx-auto mb-6 opacity-20" />
            <h2 className="text-xl font-bold text-text-1">No Transactions Yet</h2>
            <p className="text-text-3 mt-2 font-medium">Start learning and sharing to earn your first credits.</p>
            <Link href="/upload-video" className="bg-text-1 text-bg px-8 py-3 rounded-2xl text-[13px] font-bold mt-8 inline-block shadow-lg">Start Now</Link>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="space-y-3"
          >
            {data.transactions.map((t) => {
              const meta = reasonMeta[t.reason] || { icon: Zap, label: t.reason, color: "text-text-2 bg-slate-100" };
              const Icon = meta.icon;
              return (
                <motion.div 
                  key={t._id}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ x: 5, backgroundColor: "var(--surface-2)" }}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-border px-6 py-5 rounded-[28px] flex items-center gap-5 transition-all group"
                >
                  {/* Category Visual */}
                  <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${meta.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Core Intel */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-1 truncate tracking-tight uppercase">
                      {t.description || meta.label}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-3">
                        {meta.label}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-text-3">{timeAgo(t.createdAt)}</span>
                    </div>
                  </div>

                  {/* Quantitative Metric */}
                  <div className={`text-lg font-black tracking-tighter shrink-0 ${t.amount > 0 ? "text-emerald-500" : "text-red-500"}`}>
                    <span className="text-xs uppercase mr-0.5 tracking-tighter">{t.amount > 0 ? "+" : ""}</span>
                    {t.amount}
                    <span className="text-[10px] ml-1 opacity-60 tracking-wider">CR</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* High-End Pagination */}
        {data?.pages > 1 && (
          <div className="flex items-center justify-between pt-6 px-4">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface border border-border text-[13px] font-black text-text-2 disabled:opacity-30 hover:bg-surface-2 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-[11px] font-black text-text-3 uppercase tracking-[0.2em]">Page {page} / {data.pages}</span>
            <button 
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))} 
              disabled={page === data.pages}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface border border-border text-[13px] font-black text-text-2 disabled:opacity-30 hover:bg-surface-2 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

