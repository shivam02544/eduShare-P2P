"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Zap, ArrowRight, ShieldCheck, Star } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", ...springConfig } },
};

const RANK_STYLES = [
  {
    label: "#1",
    ringColor: "ring-amber-400/40",
    badgeBg: "bg-amber-400",
    badgeText: "text-amber-900",
    glow: "shadow-amber-500/10",
  },
  {
    label: "#2",
    ringColor: "ring-slate-400/40",
    badgeBg: "bg-slate-400",
    badgeText: "text-slate-900",
    glow: "shadow-slate-500/10",
  },
  {
    label: "#3",
    ringColor: "ring-amber-700/40",
    badgeBg: "bg-amber-700",
    badgeText: "text-amber-100",
    glow: "shadow-amber-700/10",
  },
];

const CONTRIBUTORS = [
  {
    name: "Priya Sharma",
    role: "Engineering Student",
    avatar: "P",
    avatarBg: "bg-indigo-500",
    credits: 3840,
    uploads: 42,
    subjects: ["Physics", "Math"],
    quote: "Sharing is the fastest way to master what you know.",
  },
  {
    name: "Rahul Mehta",
    role: "Computer Science",
    avatar: "R",
    avatarBg: "bg-emerald-500",
    credits: 3210,
    uploads: 37,
    subjects: ["Programming", "Algorithms"],
    quote: "Every upload earns me credits and reinforces my own learning.",
  },
  {
    name: "Aisha Khan",
    role: "Pre-Med Student",
    avatar: "A",
    avatarBg: "bg-rose-500",
    credits: 2990,
    uploads: 31,
    subjects: ["Biology", "Chemistry"],
    quote: "EduShare made studying collaborative and rewarding.",
  },
];

export default function ContributorsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-px bg-amber-500/30" />
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">
              Community
            </p>
            <div className="w-12 h-px bg-amber-500/30" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter">
            Top Contributors
          </h2>
          <p className="text-sm text-text-2 font-medium max-w-md leading-relaxed">
            Meet the students powering the EduShare community — earning credits by sharing knowledge.
          </p>
        </div>

        <Link
          href="/leaderboard"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all shrink-0"
        >
          <Trophy className="w-3.5 h-3.5" />
          Full Leaderboard
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Contributor Cards */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {CONTRIBUTORS.map((c, i) => {
          const rank = RANK_STYLES[i];
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={springConfig}
              className={`group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border rounded-[40px] p-8 shadow-sm hover:shadow-2xl ${rank.glow} transition-all overflow-hidden`}
            >
              {/* Background texture */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-surface-2 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

              {/* Rank badge */}
              <div className="relative z-10 space-y-7">
                <div className="flex items-start justify-between">
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-[20px] flex items-center justify-center text-xl font-black text-white shadow-xl ring-4 ${rank.ringColor} ${c.avatarBg} transition-transform group-hover:scale-110 duration-500`}
                    >
                      {c.avatar}
                    </div>
                    {/* Online dot */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                      <ShieldCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* Rank pill */}
                  <div
                    className={`px-3 py-1.5 rounded-2xl text-[11px] font-black tracking-wider shadow-lg ${rank.badgeBg} ${rank.badgeText}`}
                  >
                    {rank.label}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <p className="text-lg font-black text-text-1 tracking-tight group-hover:text-indigo-500 transition-colors">
                    {c.name}
                  </p>
                  <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] opacity-70">
                    {c.role}
                  </p>
                </div>

                {/* Quote */}
                <p className="text-sm font-semibold text-text-2 leading-relaxed italic opacity-80 line-clamp-2">
                  "{c.quote}"
                </p>

                {/* Subjects */}
                <div className="flex flex-wrap gap-2">
                  {c.subjects.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-border text-[9px] font-black uppercase tracking-widest text-text-3"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between pt-5 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-lg font-black text-text-1 tracking-tighter">
                      {c.credits.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">
                      Credits
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-text-1 tracking-tighter">{c.uploads}</p>
                    <p className="text-[9px] font-black text-text-3 uppercase tracking-widest">
                      Uploads
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
