"use client";
import { useState } from "react";
import Link from "next/link";
import { useLoading } from "@/context/LoadingContext";

const SUBJECT_COLORS = {
  Math:        { bg: "#eff6ff", color: "#3b82f6" },
  Science:     { bg: "#f0fdf4", color: "#16a34a" },
  History:     { bg: "#fef3c7", color: "#d97706" },
  Programming: { bg: "#f5f3ff", color: "#7c3aed" },
  English:     { bg: "#fdf2f8", color: "#db2777" },
  Physics:     { bg: "#ecfeff", color: "#0891b2" },
  Chemistry:   { bg: "#fff7ed", color: "#ea580c" },
  Biology:     { bg: "#f0fdf4", color: "#15803d" },
};

export default function NoteCard({ note, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const { withLoading } = useLoading();
  const subjectColor = SUBJECT_COLORS[note.subject] || { bg: "var(--surface-2)", color: "var(--text-2)" };

  const handleClick = async (e) => {
    e.preventDefault();
    setDownloading(true);
    await withLoading(() => onDownload(note));
    setDownloading(false);
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden animate-fade-up transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow)";
        e.currentTarget.style.borderColor = "var(--border-2)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}>

      {/* ── Top color strip by subject ── */}
      <div className="h-1 flex-shrink-0" style={{ background: subjectColor.color, opacity: 0.7 }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          {/* File icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: subjectColor.bg, border: `1px solid ${subjectColor.color}22` }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: subjectColor.color }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
          </div>
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {note.isPremium && (
              <span className="badge text-[11px]"
                style={{ background: "var(--amber-2)", color: "var(--amber)", border: "1px solid rgba(245,158,11,0.2)" }}>
                🔒 {note.premiumCost} cr
              </span>
            )}
            <span className="badge text-[11px]"
              style={{ background: subjectColor.bg, color: subjectColor.color, border: `1px solid ${subjectColor.color}30` }}>
              {note.subject}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1">
          <h3 className="text-[13.5px] font-semibold leading-snug line-clamp-2 mb-2"
            style={{ color: "var(--text-1)" }}>
            {note.title}
          </h3>

          {/* Author + stats */}
          <Link href={`/profile/${note.uploader?.firebaseUid}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 group">
            {note.uploader?.image ? (
              <img src={note.uploader.image} alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{ background: "var(--accent-2)", color: "var(--accent)" }}>
                {note.uploader?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-[12px] truncate transition-colors group-hover:text-[var(--text-1)]"
              style={{ color: "var(--text-3)" }}>
              {note.uploader?.name}
            </span>
            <span className="text-[11px] flex-shrink-0" style={{ color: "var(--text-3)" }}>
              · {note.downloads} downloads
            </span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link href={`/notes/${note._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150"
            style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--text-1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-2)"; }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Preview
          </Link>
          <button onClick={handleClick} disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 disabled:opacity-50"
            style={{ background: "var(--text-1)", color: "var(--bg)" }}>
            {downloading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
