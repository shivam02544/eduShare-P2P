"use client";
import React, { memo } from "react";
import Link from "next/link";
import { Play, Heart, Eye, Zap, ShieldCheck, Video } from "lucide-react";

// ── VideoCard ──────────────────────────────────────────────────────────────────
// Removed whileInView (fires IntersectionObserver on every card in a 50-card grid).
// CSS hover transitions replace framer-motion whileHover for better performance.
// Images are lazy-loaded with decoding=async to avoid blocking the main thread.
const VideoCard = memo(function VideoCard({ video }) {
  const isBoosted = video.boostedUntil && new Date(video.boostedUntil) > new Date();

  return (
    <div className="group relative h-full transition-transform duration-200 hover:-translate-y-1 will-change-transform">
      <Link
        href={`/videos/${video._id}`}
        className="flex flex-col h-full bg-white dark:bg-slate-900 border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-border">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400" aria-hidden="true">
              <Video className="w-12 h-12" />
            </div>
          )}

          {/* Play overlay */}
          <div
            className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="w-12 h-12 rounded-xl bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-900 dark:text-white shadow-sm scale-90 group-hover:scale-100 transition-transform duration-200">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/60 backdrop-blur-sm text-white text-xs font-semibold border border-white/10">
              {video.subject || "General"}
            </span>
            {isBoosted && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                Priority
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-text-1 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {video.title}
            </h3>

            <div className="flex items-center gap-4 text-xs font-medium text-text-3">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" aria-hidden="true" />
                <span>{video.views || 0}</span>
              </div>
              {video.likes?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" aria-hidden="true" />
                  <span>{video.likes.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructor */}
          <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border shrink-0">
                {video.uploader?.image ? (
                  <img
                    src={video.uploader.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-3" aria-hidden="true">
                    {video.uploader?.name?.[0]}
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-text-1 truncate">{video.uploader?.name}</span>
                <span className="text-xs text-text-3">Instructor</span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </Link>
    </div>
  );
});

export default VideoCard;
