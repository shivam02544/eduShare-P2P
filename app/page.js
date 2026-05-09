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
      <section className="relative pt-16 lg:pt-24 pb-10 text-center max-w-4xl mx-auto overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 space-y-8"
        >
          {/* Elite Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peer-to-Peer Learning Community</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-1 tracking-tight leading-[1.1]">
            Learn from peers,<br />
            <span className="text-text-3">Teach the </span>
            <span className="text-indigo-600 dark:text-indigo-400">World.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p variants={itemVariants} className="text-lg text-text-2 font-medium max-w-2xl mx-auto leading-relaxed">
            A simple platform for sharing knowledge. Connect with peers, share videos and notes, and earn Credits through contribution.
          </motion.p>

          {/* Action Hub */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="group flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md">
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="/explore" className="flex items-center justify-center px-8 py-3.5 rounded-xl border border-border bg-white dark:bg-slate-900 font-semibold text-text-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              Explore Content Library
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-8 flex items-center justify-center gap-6 text-text-3">
             <div className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Verified Infrastructure
             </div>
             <div className="w-1 h-1 rounded-full bg-border" />
             <div className="flex items-center gap-2 text-xs font-semibold">
                <Trophy className="w-4 h-4" />
                Merit-Based Economy
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Platform Stats ── */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14 space-y-4">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-12 h-px bg-indigo-500/20" />
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Platform</p>
            <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-1 tracking-tight">By the Numbers</h2>
          <p className="text-base text-text-2 font-medium max-w-md mx-auto leading-relaxed">
            A growing community of students and educators sharing knowledge every day.
          </p>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05, margin: "-10px" }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((s, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="relative group bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl text-center transition-all hover:shadow-lg hover:shadow-indigo-500/5 overflow-hidden"
            >
              <div className="relative z-10 space-y-3">
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 mx-auto flex items-center justify-center ${s.color} border border-border`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-text-1 tracking-tight">{s.value}</div>
                <div className="text-xs font-semibold text-text-3">{s.label}</div>
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
      <section className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={springConfig}
          className="relative bg-slate-900 rounded-3xl p-8 md:p-16 text-center overflow-hidden border border-white/10 shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-400">
               Join Our Community
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Ready to grow your <br />
              <span className="text-indigo-400">knowledge?</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Join 10,000+ students already learning and growing together on the EduShare platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/register" className="group flex items-center gap-2 bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-600 transition-colors shadow-lg">
                Get Started Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/explore" className="px-8 py-3.5 rounded-xl border border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10 transition-colors">
                Explore Content
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

