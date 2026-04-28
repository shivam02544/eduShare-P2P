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
    avatarColor: "bg-indigo-500",
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
    subjectColor: "text-indigo-500",
    subjectBg: "bg-indigo-500/10",
    accentLine: "from-indigo-500/20 to-transparent",
  },
];

export default function TrendingSection() {
  return (
    <section className="max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-px bg-indigo-500/20" />
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">
              Trending
            </p>
            <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter">
            What's Hot Right Now
          </h2>
          <p className="text-sm text-text-2 font-medium max-w-md leading-relaxed">
            The most-viewed lessons and notes this week, hand-picked from your community.
          </p>
        </div>

        <Link
          href="/explore"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-[11px] font-black uppercase tracking-widest text-text-2 hover:text-indigo-500 hover:border-indigo-500/30 transition-all shrink-0"
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          See All Trending
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Cards Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {TRENDING.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={springConfig}
              className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-shadow"
            >
              {/* Accent gradient bar at top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accentLine}`} />

              {/* Thumbnail placeholder */}
              <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${item.subjectBg} ${item.subjectColor} border border-border shadow-inner`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                </div>

                {/* Type + Subject badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest border border-white/10">
                    {item.subject}
                  </div>
                  {item.type === "video" && (
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-500/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-indigo-400/30">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      Video
                    </div>
                  )}
                </div>

                {/* Views overlay */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md text-white text-[9px] font-black tracking-widest border border-white/10">
                  <Eye className="w-3 h-3 opacity-60" />
                  {item.views} views
                </div>

                {/* Hover play overlay */}
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xl border border-white/20 scale-90 group-hover:scale-100 transition-transform duration-500">
                    <ArrowRight className="w-5 h-5 text-slate-900 dark:text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-7 space-y-5">
                <h3 className="text-lg font-black text-text-1 tracking-tight leading-snug line-clamp-2 group-hover:text-indigo-500 transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black text-white ${item.avatarColor}`}
                    >
                      {item.avatar}
                    </div>
                    <span className="text-[11px] font-black text-text-2 tracking-tight">
                      {item.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-rose-500">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Trending
                    </span>
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
