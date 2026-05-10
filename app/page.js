"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  Zap, 
  Trophy, 
  ArrowRight,
  Sparkles,
  Play,
  FileText,
  ShieldCheck,
  Activity,
  Globe,
  Lock
} from "lucide-react";
import TrendingSection from "@/components/TrendingSection";
import ContributorsSection from "@/components/ContributorsSection";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25 }
  }
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    totalQuizzes: 0,
    totalCredits: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setPlatformStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch platform stats", error);
      }
    };
    fetchStats();
  }, []);

  const statsList = [
    { value: platformStats.totalUsers.toLocaleString(), label: "STUDENTS",  icon: Users,    color: "text-accent" },
    { value: platformStats.totalResources.toLocaleString(), label: "RESOURCES",  icon: BookOpen, color: "text-emerald-500" },
    { value: platformStats.totalQuizzes.toLocaleString(), label: "QUIZZES",   icon: Play,     color: "text-rose-500" },
    { value: platformStats.totalCredits.toLocaleString(), label: "CREDITS",   icon: Zap,      color: "text-amber-500" },
  ];

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="space-y-48 pb-48 overflow-x-hidden">
      
      {/* ── World-Class Hero ── */}
      <section className="relative pt-24 lg:pt-32 text-center max-w-6xl mx-auto px-6">
        {/* Background Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-[1200px] aspect-square bg-accent/5 rounded-full blur-[160px] pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 space-y-12"
        >
          {/* Elite Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-surface-2 dark:bg-surface-3 border border-border text-[10px] font-black uppercase tracking-[0.3em] text-accent shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peer-to-Peer Signal Node Active</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl lg:text-8xl font-black text-text-1 tracking-tighter leading-[0.95]">
            LEARN FROM PEERS,<br />
            <span className="text-text-4">TEACH THE </span>
            <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-[12px]">WORLD.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p variants={itemVariants} className="text-xl text-text-2 font-medium max-w-2xl mx-auto leading-relaxed opacity-80">
            The premium network for architectural knowledge exchange. Connect with peers, share high-fidelity resources, and earn recognition through contribution.
          </motion.p>

          {/* Action Hub */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/register" className="group relative overflow-hidden bg-text-1 text-bg px-12 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-2xl">
              <span className="relative z-10 flex items-center gap-3">
                Initialize Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent/20 rounded-full blur-[30px]" />
            </Link>
            
            <Link href="/explore" className="flex items-center justify-center px-12 py-5 rounded-[24px] border border-border bg-surface-1 dark:bg-surface-2 text-[11px] font-black uppercase tracking-[0.3em] text-text-1 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all hover:border-accent/40 shadow-xl">
              Explore Library
            </Link>
          </motion.div>

          {/* Verification Nodes */}
          <motion.div variants={itemVariants} className="pt-12 flex flex-wrap items-center justify-center gap-10 text-text-4">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Validated Infrastructure</span>
             </div>
             <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-border" />
             <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Merit-Based Tokenomics</span>
             </div>
             <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-border" />
             <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Decentralized Learning</span>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Platform Stats ── */}
      <section className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-20 space-y-4">
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.5em]">Network Metrics</p>
          <h2 className="text-4xl md:text-5xl font-black text-text-1 tracking-tight uppercase">By the <span className="text-text-4">Numbers</span></h2>
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {statsList.map((s, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-surface-1 dark:bg-surface-2 border border-border p-10 rounded-[40px] text-center transition-all hover:shadow-2xl hover:border-accent/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-accent/10 transition-colors" />
              <div className="relative z-10 space-y-6">
                <div className={`w-16 h-16 rounded-[24px] bg-surface-2 dark:bg-surface-3 mx-auto flex items-center justify-center ${s.color} border border-border shadow-inner group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-black text-text-1 tracking-tighter">{s.value}</div>
                  <div className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">{s.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Trending Content ── */}
      <div className="max-w-7xl mx-auto">
        <TrendingSection />
      </div>

      {/* ── Top Contributors ── */}
      <div className="max-w-7xl mx-auto">
        <ContributorsSection />
      </div>

      {/* ── Pro-Grade CTA ── */}
      <section className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={springConfig}
          className="relative bg-text-1 rounded-[48px] p-12 md:p-24 text-center overflow-hidden border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-1/2 -left-1/4 w-[80%] h-full bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-1/2 -right-1/4 w-[60%] h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
               <Activity className="w-3.5 h-3.5" />
               Join the Core Cluster
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-bg tracking-tighter leading-[0.9] uppercase">
              READY TO SCALE YOUR <br />
              <span className="text-accent">INTELLIGENCE?</span>
            </h2>
            <p className="text-bg/60 text-lg leading-relaxed font-medium max-w-xl mx-auto">
              Join {platformStats.totalUsers.toLocaleString()} active students already synchronizing knowledge on the EduShare network.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link href="/register" className="group flex items-center gap-3 bg-accent text-bg px-12 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl">
                Initialize Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/explore" className="px-12 py-5 rounded-[24px] border border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-bg hover:bg-white/10 transition-all">
                Sync Content Library
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer Metadata ── */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">System Operational // v2.0.4-LATEST</span>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 text-text-4">
            <Lock className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Encrypted Storage</span>
          </div>
          <div className="flex items-center gap-3 text-text-4">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">High Bandwidth</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
