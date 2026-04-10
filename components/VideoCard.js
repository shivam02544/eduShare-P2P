"use client";
import Link from "next/link";

export default function VideoCard({ video }) {
  const isBoosted = video.boostedUntil && new Date(video.boostedUntil) > new Date();

  return (
    <Link href={`/videos/${video._id}`}
      className="block group rounded-2xl overflow-hidden transition-all duration-200 animate-fade-up"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow)";
        e.currentTarget.style.borderColor = "var(--border-2)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}>

      {/* ── Thumbnail ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", background: "var(--surface-2)" }}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 48 48" style={{ color: "var(--border-2)" }}>
              <rect x="3" y="8" width="42" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 16.5l14 7.5-14 7.5v-15z" fill="currentColor" opacity="0.4"/>
            </svg>
            <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>No thumbnail</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{ background: "rgba(0,0,0,0.28)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200"
            style={{ background: "rgba(255,255,255,0.95)" }}>
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#111" }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="badge text-[11px] font-medium"
            style={{ background: "rgba(0,0,0,0.58)", color: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {video.subject}
          </span>
          {isBoosted && (
            <span className="badge text-[11px]"
              style={{ background: "rgba(245,158,11,0.9)", color: "#fff", backdropFilter: "blur(6px)" }}>
              ⚡ Boosted
            </span>
          )}
        </div>

        {/* Bottom stats */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {video.likes?.length > 0 && (
            <span className="badge text-[11px]"
              style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)" }}>
              ♥ {video.likes.length}
            </span>
          )}
          <span className="badge text-[11px]"
            style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)" }}>
            {video.views} views
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4">
        <h3 className="text-[13.5px] font-semibold leading-snug line-clamp-2 mb-3"
          style={{ color: "var(--text-1)" }}>
          {video.title}
        </h3>

        {/* Author row */}
        <Link href={`/profile/${video.uploader?.firebaseUid}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 group/author">
          {video.uploader?.image ? (
            <img src={video.uploader.image} alt=""
              className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ background: "var(--accent-2)", color: "var(--accent)" }}>
              {video.uploader?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-[12px] font-medium truncate transition-colors duration-150 group-hover/author:text-[var(--text-1)]"
            style={{ color: "var(--text-3)" }}>
            {video.uploader?.name}
          </span>
        </Link>
      </div>
    </Link>
  );
}
