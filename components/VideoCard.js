"use client";
import React, { memo } from "react";
import Link from "next/link";
import { Play, Heart, Eye, Zap, ShieldCheck, Video } from "lucide-react";

// ── VideoCard ──────────────────────────────────────────────────────────────────
// Refactored for EduShare high-fidelity design standards.
// Uses rounded-[32px] for primary containers and rounded-[24px] for inner elements.
const VideoCard = memo(function VideoCard({ video }) {
  const isBoosted = video.boostedUntil && new Date(video.boostedUntil) > new Date();

  return (
    <div className="group relative h-full transition-all duration-500 hover:-translate-y-2 will-change-transform">
      <Link
        href={`/videos/${video._id}`}
        className="flex flex-col h-full bg-surface-1 border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-surface-2 dark:bg-surface-3 overflow-hidden border-b border-border">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-4" aria-hidden="true">
              <Video className="w-12 h-12" />
            </div>
          )}

          {/* Play overlay */}
          <div
            className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]"
            aria-hidden="true"
          >
            <div className="w-14 h-14 rounded-xl bg-bg/90 dark:bg-surface-1/90 backdrop-blur-xl flex items-center justify-center text-accent shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
              <Play className="w-5 h-5 fill-current ml-1" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-bg/80 dark:bg-surface-1/80 backdrop-blur-md text-text-1 text-[10px] font-bold uppercase tracking-wider border border-border shadow-md">
              {video.subject || "General"}
            </span>
            {isBoosted && (
              <span className="px-2.5 py-1 rounded-lg bg-accent text-bg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-accent/20">
                <Zap className="w-3 h-3 fill-current" aria-hidden="true" />
                Priority
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col flex-1 bg-gradient-to-b from-transparent to-surface-2/30">
          <div className="flex-1 space-y-4">
            <h3 className="font-bold text-text-1 text-base leading-tight line-clamp-2 group-hover:text-accent transition-colors duration-300">
              {video.title}
            </h3>

            <div className="flex items-center gap-4 text-[10px] font-bold text-text-3 uppercase tracking-wider">
              <div className="flex items-center gap-1.5 group/stat">
                <Eye className="w-3.5 h-3.5 text-accent transition-transform group-hover/stat:scale-110" aria-hidden="true" />
                <span>{video.views || 0}</span>
              </div>
              {video.likes?.length > 0 && (
                <div className="flex items-center gap-1.5 group/stat">
                  <Heart className="w-3.5 h-3.5 text-rose-500 transition-transform group-hover/stat:scale-110" aria-hidden="true" />
                  <span>{video.likes.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructor */}
          <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-2 dark:bg-surface-3 border border-border shrink-0 shadow-inner">
                {video.uploader?.image ? (
                  <img
                    src={video.uploader.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent bg-accent/5" aria-hidden="true">
                    {video.uploader?.name?.[0]}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-text-1 truncate tracking-tight">{video.uploader?.name}</span>
                <span className="text-[10px] font-bold text-text-4 uppercase tracking-wider">Instructor</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
               <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

export default VideoCard;

