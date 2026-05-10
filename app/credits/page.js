"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layouts/PageContainer";
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
  Unlock,
  Wallet,
  Activity,
  ArrowRight
} from "lucide-react";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const reasonMeta = {
  video_view:            { icon: Video,        label: "SESSION VIEW",        color: "text-blue-500 bg-blue-500/10" },
  note_download:         { icon: FileText,     label: "ARTIFACT RETRIEVAL",  color: "text-rose-500 bg-rose-500/10" },
  live_join:             { icon: PlayCircle,   label: "REALTIME UPLINK",     color: "text-emerald-500 bg-emerald-500/10" },
  gift:                  { icon: Gift,         label: "NETWORK BONUS",       color: "text-violet-500 bg-violet-500/10" },
  quiz_pass:             { icon: CheckCircle2, label: "COGNITIVE PASS",      color: "text-green-500 bg-green-500/10" },
  quiz_completion:       { icon: FileText,     label: "VALIDATION COMPLETE", color: "text-teal-500 bg-teal-500/10" },
  tip_sent:              { icon: ArrowUpRight, label: "PEER TRANSFER",       color: "text-red-500 bg-red-500/10" },
  tip_received:          { icon: Gem,          label: "PEER RECEIPT",        color: "text-amber-500 bg-amber-500/10" },
  boost_video:           { icon: Zap,          label: "NODE AMPLIFICATION",  color: "text-indigo-500 bg-indigo-500/10" },
  boost_note:            { icon: Zap,          label: "ARTIFACT BOOST",      color: "text-indigo-500 bg-indigo-500/10" },
  premium_note_unlock:   { icon: Unlock,       label: "ENCRYPTED ACCESS",    color: "text-orange-500 bg-orange-500/10" },
  premium_note_earned:   { icon: Gem,          label: "ASSET ROYALTIES",     color: "text-amber-500 bg-amber-500/10" },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}M AGO`;
  if (s < 86400) return `${Math.floor(s / 3600)}H AGO`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function SkeletonRows() {
  return (
    <div className="space-y-4">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-24 bg-surface-2 dark:bg-surface-3 rounded-[32px] animate-pulse border border-border/50" />
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
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    authFetch(`/api/credits?page=${page}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load credits (${r.status})`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="max-w-4xl mx-auto space-y-16 pb-32"
      >
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                 <Trophy className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Resource Ledger</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-text-1 tracking-tight leading-[0.9]">
              Credit<br />Terminal
            </h1>
            <p className="text-text-4 text-xl font-medium max-w-md">Real-time audit of your platform contributions and engagement rewards.</p>
          </div>
          
          <div className="hidden md:flex w-24 h-24 rounded-[32px] bg-surface-1 dark:bg-surface-2 border border-border items-center justify-center text-text-4 shadow-inner relative group">
             <History className="w-10 h-10 opacity-20 group-hover:rotate-180 transition-transform duration-1000" />
             <div className="absolute inset-0 border border-accent/20 rounded-[32px] border-dashed animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* High-Contrast Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="relative bg-text-1 text-bg p-10 rounded-[40px] shadow-2xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-4">Cumulative Revenue</p>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black tracking-tight">{data?.totalEarned || 0}</span>
                <span className="text-xs font-black opacity-40 uppercase tracking-[0.4em]">NET CREDITS</span>
              </div>
              <div className="mt-12 flex items-center gap-3 text-[10px] font-black text-accent uppercase tracking-[0.3em]">
                 <div className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center shadow-lg">
                   <ArrowUpRight className="w-4 h-4" />
                 </div>
                 <span>Total Network Earnings</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-surface-1 dark:bg-surface-2 border border-border p-10 rounded-[40px] shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-4 mb-4">System Operations</p>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black tracking-tight text-text-1">{data?.total || 0}</span>
                <span className="text-xs font-black text-text-4 uppercase tracking-[0.4em]">ENTRIES</span>
              </div>
              <div className="mt-12 flex items-center gap-3 text-[10px] font-black text-text-2 uppercase tracking-[0.3em]">
                 <div className="w-8 h-8 rounded-lg bg-surface-2 dark:bg-surface-3 border border-border flex items-center justify-center shadow-sm">
                   <Activity className="w-4 h-4" />
                 </div>
                 <span>Engagement Volatility</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transaction Feed */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-text-4 uppercase tracking-[0.4em]">Temporal Logs</h3>
            <div className="h-px flex-1 mx-8 bg-border/50 hidden md:block" />
            <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-[0.2em]">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              LIVE DATASTREAM
            </div>
          </div>
          
          {loading ? <SkeletonRows /> : data?.transactions.length === 0 ? (
            <div className="text-center py-40 rounded-[48px] border border-dashed border-border bg-surface-1 dark:bg-surface-2 group">
              <div className="relative w-32 h-32 mx-auto mb-10">
                <Gem className="w-full h-full text-text-4 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-surface-2 dark:bg-surface-3 rounded-2xl border border-border rotate-45" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-text-1 tracking-tight">Ledger Empty</h2>
              <p className="text-text-4 mt-3 font-black uppercase tracking-[0.2em] text-[10px]">Initialize network activity to populate entries.</p>
              <Link href="/upload-video" className="group mt-12 inline-flex items-center gap-4 bg-text-1 text-bg px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                START CONTRIBUTING
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="space-y-4"
            >
              {data.transactions.map((t) => {
                const meta = reasonMeta[t.reason] || { icon: Zap, label: t.reason, color: "text-text-2 bg-surface-2" };
                const Icon = meta.icon;
                return (
                  <motion.div 
                    key={t._id}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileHover={{ x: 10 }}
                    className="bg-surface-1 dark:bg-surface-2 border border-border p-8 rounded-[32px] flex items-center gap-8 transition-all group hover:border-accent/30 hover:shadow-2xl hover:shadow-black/5"
                  >
                    {/* Category Visual */}
                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 transition-all group-hover:rotate-6 group-hover:scale-110 duration-500 shadow-inner border border-current/10 ${meta.color}`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Core Intel */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-current/20 ${meta.color}`}>
                          {meta.label}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">{timeAgo(t.createdAt)}</span>
                      </div>
                      <p className="text-xl font-black text-text-1 truncate tracking-tight uppercase group-hover:text-accent transition-colors">
                        {t.description || meta.label}
                      </p>
                    </div>

                    {/* Quantitative Metric */}
                    <div className={`text-3xl font-black tracking-tight shrink-0 flex items-center gap-2 ${t.amount > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      <span className="text-xs font-black uppercase opacity-40">{t.amount > 0 ? "INBOUND" : "OUTBOUND"}</span>
                      {t.amount > 0 ? "+" : ""}{t.amount}
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] ml-2">CRED</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* High-End Pagination */}
          {data?.pages > 1 && (
            <div className="flex items-center justify-between pt-12 px-8">
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-surface-1 dark:bg-surface-2 border border-border text-[10px] font-black text-text-2 uppercase tracking-[0.3em] disabled:opacity-20 hover:bg-text-1 hover:text-bg transition-all shadow-xl"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                PREVIOUS
              </button>
              <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.4em]">SESSION {page} OF {data.pages}</span>
              <button 
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))} 
                disabled={page === data.pages}
                className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-surface-1 dark:bg-surface-2 border border-border text-[10px] font-black text-text-2 uppercase tracking-[0.3em] disabled:opacity-20 hover:bg-text-1 hover:text-bg transition-all shadow-xl"
              >
                NEXT
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </PageContainer>
  );
}

