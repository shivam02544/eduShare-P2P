"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, FileText, Eye, TrendingUp, ArrowRight, Flame, BookOpen, Code } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", ...springConfig } },
};

const TRENDING = [
  {
    type: "video",
    icon: Play,
    subject: "Physics",
    title: "Quantum Mechanics for Beginners",
    author: "Arjun Mehta",
    avatar: "A",
    avatarColor: "bg-accent",
    views: "4.2k",
    subjectColor: "text-cyan-500",
    subjectBg: "bg-cyan-500/10",
    accentLine: "from-cyan-500/20 to-transparent",
  },
  {
    type: "video",
    icon: Code,
    subject: "Programming",
    title: "Data Structures & Algorithms Masterclass",
    author: "Sneha Kapoor",
    avatar: "S",
    avatarColor: "bg-emerald-500",
    views: "6.8k",
    subjectColor: "text-emerald-500",
    subjectBg: "bg-emerald-500/10",
    accentLine: "from-emerald-500/20 to-transparent",
  },
  {
    type: "note",
    icon: FileText,
    subject: "Mathematics",
    title: "Complete Calculus Notes — Integration & Differentiation",
    author: "Rahul Sharma",
    avatar: "R",
    avatarColor: "bg-rose-500",
    views: "3.1k",
    subjectColor: "text-accent",
    subjectBg: "bg-accent/10",
    accentLine: "from-accent/20 to-transparent",
  },
];

import SectionHeader from "./layouts/SectionHeader";
import ResponsiveGrid from "./layouts/ResponsiveGrid";

// ... [TRENDING constant remains same] ...

export default function TrendingSection() {
  return (
    <section className="max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <SectionHeader 
          title="What's Hot Right Now"
          description="The most-viewed lessons and notes this week, hand-picked from your community."
          badge="Trending"
        />

        <Link
          href="/explore"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-bg font-semibold text-text-2 hover:text-accent hover:border-accent/20 transition-colors shrink-0"
        >
          <Flame className="w-4 h-4 text-rose-500" />
          See All Trending
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Cards Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05, margin: "-10px" }}
        variants={containerVariants}
      >
        <ResponsiveGrid columns={3}>
          {TRENDING.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={springConfig}
                className="group relative bg-bg dark:bg-surface-2 border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-accent/5 transition-all"
              >
                {/* Accent gradient bar at top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accentLine}`} />

                {/* Thumbnail placeholder */}
                <div className="relative h-44 bg-surface-2 dark:bg-surface-3 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.subjectBg} ${item.subjectColor} border border-border`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Type + Subject badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-bg/90 dark:bg-surface-2/90 backdrop-blur-sm text-text-1 text-xs font-semibold shadow-sm border border-border">
                      {item.subject}
                    </div>
                    {item.type === "video" && (
                      <div className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-semibold flex items-center gap-1 border border-accent/20">
                        <Play className="w-3 h-3 fill-current" />
                        Video
                      </div>
                    )}
                  </div>

                  {/* Views overlay */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg/90 dark:bg-surface-2/90 backdrop-blur-sm text-text-2 text-xs font-medium shadow-sm border border-border">
                    <Eye className="w-3.5 h-3.5" />
                    {item.views} views
                  </div>

                  {/* Hover play overlay */}
                  <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-bg dark:bg-surface-2 flex items-center justify-center shadow-lg border border-border scale-90 group-hover:scale-100 transition-transform duration-300">
                      <ArrowRight className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <h3 className="text-base font-bold text-text-1 leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white ${item.avatarColor}`}
                      >
                        {item.avatar}
                      </div>
                      <span className="text-xs font-semibold text-text-2">
                        {item.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-rose-500">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        Trending
                      </span>
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
