"use client";
import { useState, useEffect } from "react";

function formatTime(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function ChapterList({ chapters, videoRef, videoDuration }) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Track current chapter as video plays
  useEffect(() => {
    const video = videoRef?.current;
    if (!video || !chapters?.length) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      // Find which chapter we're in
      let active = 0;
      for (let i = 0; i < chapters.length; i++) {
        if (t >= chapters[i].timestamp) active = i;
      }
      setCurrentChapter(active);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [videoRef, chapters]);

  const seekTo = (timestamp) => {
    const video = videoRef?.current;
    if (!video) return;
    video.currentTime = timestamp;
    video.play().catch(() => {});
  };

  if (!chapters?.length) return null;

  const duration = videoDuration || chapters[chapters.length - 1]?.timestamp + 60 || 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 text-sm">Chapters</h3>
        <span className="text-xs text-zinc-400">{chapters.length} chapters</span>
      </div>

      {/* Progress bar with chapter markers */}
      <div className="relative h-1.5 bg-stone-200 rounded-full overflow-visible">
        {/* Playback progress */}
        <div
          className="absolute left-0 top-0 h-full bg-zinc-900 rounded-full transition-all duration-100"
          style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
        />
        {/* Chapter markers */}
        {chapters.map((c, i) => {
          if (i === 0) return null; // skip 0:00 marker
          const pct = Math.min(100, (c.timestamp / duration) * 100);
          return (
            <button
              key={i}
              onClick={() => seekTo(c.timestamp)}
              title={c.title}
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white
                         bg-zinc-400 hover:bg-violet-500 hover:scale-125 transition-all z-10"
              style={{ left: `calc(${pct}% - 5px)` }}
            />
          );
        })}
      </div>

      {/* Chapter list */}
      <div className="space-y-0.5 max-h-64 overflow-y-auto">
        {chapters.map((c, i) => {
          const isActive = i === currentChapter;
          const nextTimestamp = chapters[i + 1]?.timestamp ?? Infinity;
          const isPlaying = currentTime >= c.timestamp && currentTime < nextTimestamp;

          return (
            <button
              key={i}
              onClick={() => seekTo(c.timestamp)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-stone-100 text-zinc-700"
              }`}>
              {/* Play indicator */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-stone-200 text-zinc-500"
              }`}>
                {isPlaying ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>

              {/* Title */}
              <span className="flex-1 text-sm font-medium truncate">{c.title}</span>

              {/* Timestamp */}
              <span className={`text-xs font-mono flex-shrink-0 ${isActive ? "text-white/70" : "text-zinc-400"}`}>
                {formatTime(c.timestamp)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
