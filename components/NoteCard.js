"use client";
import { useState } from "react";
import Link from "next/link";
import { useLoading } from "@/context/LoadingContext";

export default function NoteCard({ note, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const { withLoading } = useLoading();

  const handleClick = async (e) => {
    e.preventDefault();
    setDownloading(true);
    await withLoading(() => onDownload(note));
    setDownloading(false);
  };

  return (
    <div className="card p-4 flex flex-col gap-3 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-2)" }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          {note.isPremium && (
            <span className="badge text-[11px]"
              style={{ background: "rgba(245,158,11,0.1)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)" }}>
              🔒 {note.premiumCost}cr
            </span>
          )}
          <span className="badge text-[11px]"
            style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
            {note.subject}
          </span>
        </div>
      </div>

      {/* Title + uploader */}
      <div className="flex-1">
        <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 mb-1.5"
          style={{ color: "var(--text-1)" }}>
          {note.title}
        </h3>
        <Link href={`/profile/${note.uploader?.firebaseUid}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5">
          {note.uploader?.image ? (
            <img src={note.uploader.image} alt="" className="w-4 h-4 rounded-full object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "var(--accent-2)", color: "var(--accent)" }}>
              {note.uploader?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
            {note.uploader?.name} · {note.downloads} downloads
          </span>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link href={`/notes/${note._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors duration-150"
          style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "var(--text-1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-2)"; }}>
          Preview
        </Link>
        <button onClick={handleClick} disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-150"
          style={{ background: "var(--text-1)", color: "var(--bg)" }}>
          {downloading ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          ) : "Download"}
        </button>
      </div>
    </div>
  );
}
