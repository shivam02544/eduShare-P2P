"use client";
import React, { memo, useState } from "react";
import Link from "next/link";
import { useLoading } from "@/context/LoadingContext";
import { FileText, Download, Eye, Lock, Activity, ShieldCheck } from "lucide-react";

// ── NoteCard ───────────────────────────────────────────────────────────────────
// Removed whileInView (costly IntersectionObserver per card).
// CSS hover transitions replace framer-motion for better scroll performance.
// Uploader avatar is lazy-loaded.
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
    <div className="group relative h-full flex flex-col bg-white dark:bg-slate-900 border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 will-change-transform">
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-3 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors"
            aria-hidden="true"
          >
            <FileText className="w-6 h-6" />
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-text-2">
              {note.subject || "General"}
            </span>
            {note.isPremium && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3 h-3" aria-hidden="true" />
                {note.premiumCost} CR
              </span>
            )}
          </div>
        </div>

        {/* Title & Meta */}
        <div className="flex-1 space-y-3">
          <h3 className="text-base font-bold text-text-1 tracking-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {note.title}
          </h3>

          <div className="flex items-center gap-3 text-xs font-medium text-text-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4" aria-hidden="true" />
              <span>{note.downloads || 0} Downloads</span>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border shrink-0">
              {note.uploader?.image ? (
                <img
                  src={note.uploader.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-3" aria-hidden="true">
                  {note.uploader?.name?.[0]}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-text-1 truncate">{note.uploader?.name}</span>
              <span className="text-xs text-text-3">Uploader</span>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 border-t border-border bg-slate-50 dark:bg-slate-800/50">
        <Link
          href={`/notes/${note._id}`}
          className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-text-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-r border-border focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800"
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
          className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-text-2 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800"
        >
          {downloading ? (
            <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" aria-hidden="true" />
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
