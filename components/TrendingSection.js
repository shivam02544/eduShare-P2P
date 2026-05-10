"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Play, FileText, Eye, TrendingUp, ArrowRight, Flame } from "lucide-react";
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

export default function TrendingSection() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending");
        if (res.ok) {
          const data = await res.json();
          setTrending(data);
        }
      } catch (error) {
        console.error("Failed to fetch trending content", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <SectionHeader 
            title="What's Hot Right Now"
            description="The most-viewed lessons and notes this week, hand-picked from your community."
            badge="Trending"
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

  if (trending.length === 0) {
    return null;
  }

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
          {trending.map((item, i) => {
            const isVideo = item.type === "video";
            const Icon = isVideo ? Play : FileText;
            const views = isVideo ? item.views : item.downloads;
            const author = item.uploader?.name || "Anonymous";
            const avatar = author.charAt(0).toUpperCase();
            
            const subjectColor = isVideo ? "text-cyan-500" : "text-accent";
            const subjectBg = isVideo ? "bg-cyan-500/10" : "bg-accent/10";
            const accentLine = isVideo ? "from-cyan-500/20 to-transparent" : "from-accent/20 to-transparent";

            return (
              <motion.div
                key={item._id || i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={springConfig}
                className="group relative bg-bg dark:bg-surface-2 border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-accent/5 transition-all"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentLine}`} />

                <Link href={isVideo ? `/videos/${item._id}` : `/notes/${item._id}`}>
                  <div className="relative h-44 bg-surface-2 dark:bg-surface-3 overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center ${subjectBg} ${subjectColor} border border-border`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-bg/90 dark:bg-surface-2/90 backdrop-blur-sm text-text-1 text-xs font-semibold shadow-sm border border-border">
                        {item.subject}
                      </div>
                      {isVideo && (
                        <div className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-semibold flex items-center gap-1 border border-accent/20">
                          <Play className="w-3 h-3 fill-current" />
                          Video
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg/90 dark:bg-surface-2/90 backdrop-blur-sm text-text-2 text-xs font-medium shadow-sm border border-border">
                      <Eye className="w-3.5 h-3.5" />
                      {views >= 1000 ? `${(views/1000).toFixed(1)}k` : views} {isVideo ? "views" : "downloads"}
                    </div>

                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-bg dark:bg-surface-2 flex items-center justify-center shadow-lg border border-border scale-90 group-hover:scale-100 transition-transform duration-300">
                        <ArrowRight className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="p-5 space-y-4">
                  <Link href={isVideo ? `/videos/${item._id}` : `/notes/${item._id}`}>
                    <h3 className="text-base font-bold text-text-1 leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <Link href={`/profile/${item.uploader?.firebaseUid || item.uploader?._id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-accent`}
                      >
                        {item.uploader?.image ? (
                          <img src={item.uploader.image} alt={author} className="w-full h-full rounded-lg object-cover" />
                        ) : avatar}
                      </div>
                      <span className="text-xs font-semibold text-text-2">
                        {author}
                      </span>
                    </Link>

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
