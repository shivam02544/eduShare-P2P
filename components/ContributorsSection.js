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
    avatarBg: "bg-accent",
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

import SectionHeader from "./layouts/SectionHeader";
import ResponsiveGrid from "./layouts/ResponsiveGrid";

// ... [RANK_STYLES and CONTRIBUTORS constants remain] ...

export default function ContributorsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <SectionHeader 
          title="Top Contributors"
          description="Meet the students powering the EduShare community — earning credits by sharing knowledge."
          badge="Community"
        />

        <Link
          href="/leaderboard"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors shrink-0"
        >
          <Trophy className="w-4 h-4" />
          Full Leaderboard
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Contributor Cards */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05, margin: "-10px" }}
        variants={containerVariants}
      >
        <ResponsiveGrid columns={3}>
          {CONTRIBUTORS.map((c, i) => {
            const rank = RANK_STYLES[i];
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={springConfig}
                className={`group relative bg-bg dark:bg-surface-2 border border-border rounded-xl p-6 shadow-sm hover:shadow-lg ${rank.glow} transition-all overflow-hidden`}
              >
                {/* Background texture */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-surface-2 dark:bg-surface-3 rounded-full opacity-50 transition-opacity" />

                {/* Rank badge */}
                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md ring-2 ${rank.ringColor} ${c.avatarBg} transition-transform group-hover:scale-105 duration-300`}
                      >
                        {c.avatar}
                      </div>
                      {/* Online dot */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-bg flex items-center justify-center">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>

                    {/* Rank pill */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${rank.badgeBg} ${rank.badgeText}`}
                    >
                      {rank.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <p className="text-base font-bold text-text-1 group-hover:text-accent transition-colors">
                      {c.name}
                    </p>
                    <p className="text-xs font-semibold text-text-3">
                      {c.role}
                    </p>
                  </div>

                  {/* Quote */}
                  <p className="text-sm font-medium text-text-2 leading-relaxed opacity-80 line-clamp-2">
                    "{c.quote}"
                  </p>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2">
                    {c.subjects.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-surface-2 dark:bg-surface-3 border border-border text-xs font-semibold text-text-3"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between pt-5 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-base font-bold text-text-1">
                        {c.credits.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">
                        Credits
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="text-base font-bold text-text-1">{c.uploads}</p>
                      <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">
                        Uploads
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </ResponsiveGrid>
      </motion.div>
    </section>
  );
}
