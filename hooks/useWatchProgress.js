"use client";
import { useEffect, useRef } from "react";

const SAVE_INTERVAL_MS = 10_000; // save every 10 seconds
const MIN_PROGRESS_TO_SAVE = 5;  // don't save if watched less than 5 seconds

/**
 * Attaches to a video element and saves watch progress to the API.
 * Saves on: interval, pause, beforeunload.
 */
export function useWatchProgress({ videoRef, videoId, authFetch, enabled = true }) {
  const lastSavedRef = useRef(0);
  const intervalRef = useRef(null);

  const save = async (videoEl) => {
    if (!videoEl || !videoId || !authFetch) return;
    const progress = Math.floor(videoEl.currentTime);
    const duration = Math.floor(videoEl.duration || 0);

    // Don't spam saves for tiny progress
    if (progress < MIN_PROGRESS_TO_SAVE) return;
    if (Math.abs(progress - lastSavedRef.current) < 3) return; // no change

    lastSavedRef.current = progress;

    try {
      await authFetch("/api/watch-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, progressSeconds: progress, durationSeconds: duration }),
      });
    } catch {
      // Silent fail — don't interrupt viewing
    }
  };

  useEffect(() => {
    if (!enabled || !videoRef?.current || !videoId) return;

    const video = videoRef.current;

    // Save on pause
    const handlePause = () => save(video);

    // Save on ended
    const handleEnded = () => save(video);

    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    // Save on interval while playing
    intervalRef.current = setInterval(() => {
      if (!video.paused && !video.ended) save(video);
    }, SAVE_INTERVAL_MS);

    // Save on tab close / navigation
    const handleUnload = () => save(video);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      window.removeEventListener("beforeunload", handleUnload);
      clearInterval(intervalRef.current);
      // Final save on unmount
      save(video);
    };
  }, [videoRef, videoId, authFetch, enabled]);
}
