"use client";
import Link from "next/link";

export default function VideoCard({ video }) {
  return (
    <div className="card overflow-hidden group animate-fade-in">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-stone-100">
        {video.thumbnailUrl ? (
          <>
            <img src={video.thumbnailUrl} alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                <svg className="w-5 h-5 text-zinc-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f5f3ef 0%, #e8e4dc 100%)" }}>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-200">
              <svg className="w-5 h-5 text-zinc-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Subject badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          <span className="badge bg-white/90 text-zinc-700 shadow-sm border border-white/50 backdrop-blur-sm text-[11px]">
            {video.subject}
          </span>
          {video.boostedUntil && new Date(video.boostedUntil) > new Date() && (
            <span className="badge bg-amber-400/90 text-amber-900 text-[11px] backdrop-blur-sm">
              ⚡
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {video.likes?.length > 0 && (
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full">
              ♥ {video.likes.length}
            </span>
          )}
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full">
            ◉ {video.views}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 mb-2">
          {video.title}
        </h3>

        {/* Uploader */}
        <Link href={`/profile/${video.uploader?.firebaseUid}`} onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 mb-3 group/author">
          {video.uploader?.image ? (
            <img src={video.uploader.image} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-[10px] font-bold">
              {video.uploader?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-xs text-zinc-400 group-hover/author:text-zinc-700 transition-colors">
            {video.uploader?.name}
          </span>
        </Link>

        <Link href={`/videos/${video._id}`}
          className="block w-full text-center bg-zinc-900 text-white text-xs font-medium py-2 rounded-lg
                     hover:bg-zinc-700 transition-colors duration-150">
          Watch
        </Link>
      </div>
    </div>
  );
}
