"use client";
import { useEffect } from "react";
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
  ShieldCheck
} from "lucide-react";
import TrendingSection from "@/components/TrendingSection";
import ContributorsSection from "@/components/ContributorsSection";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const stats = [
  { value: "12K+", label: "Students",  icon: Users,    color: "text-indigo-500" },
  { value: "8K+",  label: "Videos",    icon: BookOpen, color: "text-emerald-500" },
  { value: "600+", label: "Classes",   icon: Play,     color: "text-rose-500" },
  { value: "80K+", label: "Credits",   icon: Zap,      color: "text-amber-500" },
];

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
    transition: { type: "spring", ...springConfig }
  }
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="space-y-32 pb-32">
      
      {/* ── World-Class Hero ── */}
      <section className="relative pt-20 lg:pt-32 pb-10 text-center max-w-5xl mx-auto px-6 overflow-hidden">
        {/* Anti-Gravity Floating Blobs */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10" 
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -z-10" 
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 space-y-8"
        >
          {/* Elite Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-border bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xl shadow-slate-900/5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-2">Peer-to-Peer Learning Community</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black text-text-1 tracking-tighter leading-[0.9]">
            Learn from peers,<br />
            <span className="text-text-3">Teach the </span>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">World.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-text-2 font-medium max-w-2xl mx-auto leading-relaxed">
            A simple platform for sharing knowledge. Connect with peers, share videos and notes, and earn <span className="text-text-1 font-bold">Credits</span> through contribution.
          </motion.p>

          {/* Action Hub */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="group relative bg-text-1 text-bg px-10 py-5 rounded-[24px] font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20">
              <span className="relative z-10 flex items-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px]" />
            </Link>
            
            <Link href="/explore" className="group px-10 py-5 rounded-[24px] border border-border bg-white/50 dark:bg-white/5 backdrop-blur-md font-black text-sm text-text-1 transition-all hover:bg-white dark:hover:bg-white/10">
              Explore Content Library
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-8 flex items-center justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-1">
                <ShieldCheck className="w-4 h-4" />
                Verified Infrastructure
             </div>
             <div className="w-1 h-1 rounded-full bg-border" />
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-1">
                <Trophy className="w-4 h-4" />
                Merit-Based Economy
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Platform Stats ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-12 h-px bg-indigo-500/20" />
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Platform</p>
            <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter">By the Numbers</h2>
          <p className="text-sm text-text-2 font-medium max-w-md mx-auto leading-relaxed">
            A growing community of students and educators sharing knowledge every day.
          </p>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((s, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="relative group bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-border p-8 rounded-[40px] text-center transition-all hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-surface-2 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
              <div className="relative z-10 space-y-2">
                <div className={`w-12 h-12 rounded-2xl bg-surface mx-auto flex items-center justify-center ${s.color} border border-border`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-black text-text-1 tracking-tighter">{s.value}</div>
                <div className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Trending Content ── */}
      <TrendingSection />

      {/* ── Top Contributors ── */}
      <ContributorsSection />

      {/* ── Pro-Grade CTA ── */}
      <section className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={springConfig}
          className="relative bg-slate-900 rounded-[64px] p-12 md:p-24 text-center overflow-hidden border border-white/10"
        >
          {/* Animated Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" 
          />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
               Join Our Community
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              Ready to grow your <br />
              <span className="text-indigo-400">knowledge?</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Join 10,000+ students already learning and growing together on the EduShare platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="group flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl">
                Get Started Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/explore" className="px-10 py-5 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm font-black text-sm text-white hover:bg-white/10 transition-all">
                Explore Content
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

