"use client";
import { useState } from "react";
import Link from "next/link";
import { useLoading } from "@/context/LoadingContext";

export default function NoteCard({ note, onDownload }) {
  const [downloading, setDownloading] = useState(false);
  const { withLoading } = useLoading();

  const handleClick = async () => {
    setDownloading(true);
    await withLoading(() => onDownload(note));
    setDownloading(false);
  };

  return (
    <div className="card p-4 flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #fff1f2, #ffe4e6)" }}>
          <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          {note.isPremium && (
            <span className="badge bg-amber-100 text-amber-800 border border-amber-200 text-[11px]">
              🔒 {note.premiumCost}cr
            </span>
          )}
          <span className="badge bg-rose-50 text-rose-600 border border-rose-100 text-[11px]">
            {note.subject}
          </span>
        </div>
      </div>

      {/* Title + uploader */}
      <div className="flex-1">
        <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2">{note.title}</h3>
        <Link href={`/profile/${note.uploader?.firebaseUid}`} onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 mt-1.5 group/author">
          {note.uploader?.image ? (
            <img src={note.uploader.image} alt="" className="w-4 h-4 rounded-full object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-[9px] font-bold">
              {note.uploader?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-xs text-zinc-400 group-hover/author:text-zinc-700 transition-colors">
            {note.uploader?.name}
          </span>
          <span className="text-[11px] text-zinc-300">· {note.downloads} downloads</span>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link href={`/notes/${note._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-stone-100 text-zinc-700 text-xs font-medium
                     py-2 rounded-lg hover:bg-stone-200 transition-colors border border-stone-200">
          Preview
        </Link>
        <button onClick={handleClick} disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 text-white text-xs font-medium
                     py-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-60">
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
