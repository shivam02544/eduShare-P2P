"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { useLoading } from "@/context/LoadingContext";
import { FileText, Download, Eye, Lock, Activity, ShieldCheck } from "lucide-react";

// ── NoteCard ───────────────────────────────────────────────────────────────────
// Refactored for EduShare high-fidelity design standards.
// Uses rounded-[32px] for primary containers and rounded-[24px] for inner elements.
const NoteCard = memo(function NoteCard({ note, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const { withLoading } = useLoading();

  const handleDownload = async (e) => {
    e.preventDefault();
    if (downloading) return; // prevent double-click
    setDownloading(true);
    try {
      await withLoading(() => onDownload(note), "Downloading note...");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="group relative h-full flex flex-col bg-surface-1 border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 hover:-translate-y-2 will-change-transform">
      <div className="p-6 flex flex-col flex-1 bg-gradient-to-b from-transparent to-surface-2/30">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div
            className="w-12 h-12 rounded-xl bg-surface-2 dark:bg-surface-3 flex items-center justify-center text-text-3 group-hover:bg-accent/10 group-hover:text-accent transition-all duration-500 shadow-inner group-hover:scale-110"
            aria-hidden="true"
          >
            <FileText className="w-6 h-6" />
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-bg/80 dark:bg-surface-2/80 backdrop-blur-md text-text-1 border border-border shadow-sm">
              {note.subject || "General"}
            </span>
            {note.isPremium && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-bg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
                <Lock className="w-3 h-3 fill-current" aria-hidden="true" />
                {note.premiumCost} CR
              </span>
            )}
          </div>
        </div>

        {/* Title & Meta */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-bold text-text-1 tracking-tight line-clamp-2 group-hover:text-accent transition-colors duration-300 leading-tight">
            {note.title}
          </h3>

          <div className="flex items-center gap-4 text-[10px] font-bold text-text-3 uppercase tracking-wider">
            <div className="flex items-center gap-1.5 group/stat">
              <Activity className="w-3.5 h-3.5 text-emerald-500 transition-transform group-hover/stat:scale-110" aria-hidden="true" />
              <span>{note.downloads || 0} Downloads</span>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-2 dark:bg-surface-3 border border-border shrink-0 shadow-inner">
              {note.uploader?.image ? (
                <img
                  src={note.uploader.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent bg-accent/5" aria-hidden="true">
                  {note.uploader?.name?.[0]}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-text-1 truncate tracking-tight">{note.uploader?.name}</span>
              <span className="text-[10px] font-bold text-text-4 uppercase tracking-wider">Uploader</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
             <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 border-t border-border/50 bg-surface-2/50 dark:bg-surface-3/30 backdrop-blur-md">
        <Link
          href={`/notes/${note._id}`}
          className="flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold uppercase tracking-wider text-text-2 hover:bg-surface-3 dark:hover:bg-surface-2 hover:text-accent transition-all duration-300 border-r border-border/50 focus-visible:outline-none"
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
          View
        </Link>

        <button
          onClick={handleDownload}
          disabled={downloading}
          aria-disabled={downloading}
          aria-busy={downloading}
          aria-label={downloading ? "Downloading…" : "Download note"}
          className="flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold uppercase tracking-wider text-text-2 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-300 disabled:opacity-50 focus-visible:outline-none"
        >
          {downloading ? (
            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Download className="w-4 h-4" aria-hidden="true" />
              Download
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default NoteCard;

