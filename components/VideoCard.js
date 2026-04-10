"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Heart, Eye, Zap, User, ArrowUpRight, ShieldCheck, Activity } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function VideoCard({ video }) {
  const isBoosted = video.boostedUntil && new Date(video.boostedUntil) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={springConfig}
      whileHover={{ y: -8, scale: 1.01 }}
      className="group relative"
    >
      <Link href={`/videos/${video._id}`} className="block">
        <div className="relative overflow-hidden rounded-[48px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border shadow-sm transition-all hover:shadow-3xl hover:shadow-indigo-500/10">
          
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-white/5">
            {video.thumbnailUrl ? (
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:rotate-1" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                <Activity className="w-12 h-12 text-text-3 opacity-20 animate-pulse" />
              </div>
            )}

            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[4px] bg-slate-900/10">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-[24px] bg-white dark:bg-slate-900 flex items-center justify-center shadow-3xl border border-white/20 dark:border-slate-800"
              >
                <Play className="w-6 h-6 text-slate-900 dark:text-white fill-current ml-1" />
              </motion.div>
              <div className="absolute top-0 left-0 w-full h-px bg-white/30 -translate-y-full group-hover:animate-scan transition-transform" />
            </div>

            {/* Top Data Points: Badges */}
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <div className="px-4 py-2 rounded-2xl bg-slate-900/50 dark:bg-white/10 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.2em] border border-white/10">
                {video.subject || "General"}
              </div>
              {isBoosted && (
                <div className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-indigo-500/30 italic">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Priority
                </div>
              )}
            </div>

            {/* Bottom Metrics: Overlay */}
            <div className="absolute bottom-5 right-5 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/50 dark:bg-white/10 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-widest border border-white/10 italic">
                <Eye className="w-3.5 h-3.5 opacity-50" />
                {video.views}
              </div>
              {video.likes?.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-500/20 dark:bg-rose-500/10 backdrop-blur-xl text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20 italic">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  {video.likes.length}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.4em]">Video Lesson</span>
                 <div className="flex-1 h-px bg-border/50" />
              </div>
              <h3 className="text-xl font-black text-text-1 tracking-tight leading-snug line-clamp-2 h-14 group-hover:text-indigo-600 transition-colors italic">
                {video.title}
              </h3>
            </div>

            {/* Instructor */}
            <div className="pt-2">
              <Link 
                href={`/profile/${video.uploader?.firebaseUid}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between group/author"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-border bg-slate-100 dark:bg-white/5 transition-transform group-hover/author:scale-105">
                      {video.uploader?.image ? (
                        <img src={video.uploader.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-text-3">
                          {video.uploader?.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                       <ShieldCheck className="w-4 h-4 text-indigo-500 fill-white dark:fill-slate-950" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-1 tracking-tight group-hover/author:text-indigo-500 transition-colors italic">
                      {video.uploader?.name}
                    </span>
                    <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] italic opacity-50">Authorized Agent</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 border border-border flex items-center justify-center text-text-3 group-hover/author:bg-indigo-500 group-hover/author:text-white transition-all shadow-inner">
                   <ArrowUpRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


