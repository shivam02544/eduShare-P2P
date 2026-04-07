"use client";
import Link from "next/link";

export default function VideoCard({ video }) {
  return (
    <Link href={`/videos/${video._id}`} className="card block group animate-fade-up overflow-hidden">
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", background: "var(--surface-2)" }}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-1)" }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.9)" }}>
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#111" }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="badge text-[11px] font-medium"
            style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}>
            {video.subject}
          </span>
          {video.boostedUntil && new Date(video.boostedUntil) > new Date() && (
            <span className="badge text-[11px]"
              style={{ background: "rgba(245,158,11,0.85)", color: "#fff", backdropFilter: "blur(4px)" }}>
              ⚡
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {video.likes?.length > 0 && (
            <span className="badge text-[11px]"
              style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}>
              ♥ {video.likes.length}
            </span>
          )}
          <span className="badge text-[11px]"
            style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}>
            {video.views} views
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 mb-2"
          style={{ color: "var(--text-1)" }}>
          {video.title}
        </h3>
        <Link href={`/profile/${video.uploader?.firebaseUid}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 group/author">
          {video.uploader?.image ? (
            <img src={video.uploader.image} alt="" className="w-4 h-4 rounded-full object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "var(--accent-2)", color: "var(--accent)" }}>
              {video.uploader?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-[12px] transition-colors duration-150"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-1)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}>
            {video.uploader?.name}
          </span>
        </Link>
      </div>
    </Link>
  );
}
