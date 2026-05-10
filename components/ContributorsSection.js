"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Zap, ArrowRight, ShieldCheck, Star } from "lucide-react";
import SectionHeader from "./layouts/SectionHeader";
import ResponsiveGrid from "./layouts/ResponsiveGrid";
import { Skeleton } from "./Skeleton";

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

export default function ContributorsSection() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setContributors(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch top contributors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContributors();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <SectionHeader 
            title="Top Contributors"
            description="Meet the students powering the EduShare community — earning credits by sharing knowledge."
            badge="Community"
          />
        </div>
        <ResponsiveGrid columns={3}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-surface-1 dark:bg-surface-2 rounded-xl animate-pulse border border-border" />
          ))}
        </ResponsiveGrid>
      </section>
    );
  }

  if (contributors.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6">
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

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05, margin: "-10px" }}
        variants={containerVariants}
      >
        <ResponsiveGrid columns={3}>
          {contributors.map((c, i) => {
            const rank = RANK_STYLES[i] || RANK_STYLES[2];
            const avatar = c.name?.charAt(0).toUpperCase() || "?";
            return (
              <motion.div
                key={c._id || i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={springConfig}
                className={`group relative bg-bg dark:bg-surface-2 border border-border rounded-xl p-6 shadow-sm hover:shadow-lg ${rank.glow} transition-all overflow-hidden`}
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-surface-2 dark:bg-surface-3 rounded-full opacity-50 transition-opacity" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <Link href={`/profile/${c.firebaseUid || c._id}`} className="relative group/avatar">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-md ring-2 ${rank.ringColor} bg-accent transition-transform group-hover/avatar:scale-105 duration-300`}
                      >
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-full h-full rounded-xl object-cover" />
                        ) : avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-bg flex items-center justify-center">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    </Link>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${rank.badgeBg} ${rank.badgeText}`}
                    >
                      {rank.label}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link href={`/profile/${c.firebaseUid || c._id}`}>
                      <p className="text-base font-bold text-text-1 group-hover:text-accent transition-colors">
                        {c.name}
                      </p>
                    </Link>
                    <p className="text-xs font-semibold text-text-3">
                      {c.skills?.slice(0, 2).join(" • ") || "EduShare Member"}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-text-2 leading-relaxed opacity-80 line-clamp-2">
                    "{c.bio || "Sharing knowledge is the best way to grow together."}"
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {c.skills?.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg bg-surface-2 dark:bg-surface-3 border border-border text-xs font-semibold text-text-3"
                      >
                        {s}
                      </span>
                    )) || (
                      <span className="px-2.5 py-1 rounded-lg bg-surface-2 dark:bg-surface-3 border border-border text-xs font-semibold text-text-3">
                        General
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-base font-bold text-text-1">
                        {c.credits?.toLocaleString() || 0}
                      </span>
                      <span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">
                        Credits
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Star className="w-4 h-4 text-indigo-500" />
                      <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">
                        Ranked Member
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
