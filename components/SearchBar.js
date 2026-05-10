"use client";
import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Activity,
  Video,
  FileText,
  Users,
  ArrowRight,
  SearchCode,
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

/** Flatten results into an array for arrow-key navigation */
function flattenResults(results) {
  if (!results) return [];
  const items = [];
  (results.videos || []).forEach((v) => items.push({ type: "video", data: v, href: `/videos/${v._id}` }));
  (results.notes || []).forEach((n) => items.push({ type: "note", data: n, href: `/notes/${n._id}` }));
  (results.users || []).forEach((u) => items.push({ type: "user", data: u, href: `/profile/${u.firebaseUid}` }));
  return items;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useRef(null);
  const router = useRouter();

  const listboxId = useId();
  const inputId = useId();

  // Flattened option list for keyboard nav
  const flatItems = flattenResults(results);
  const activeDescendantId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  // ── Close on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Debounced search ───────────────────────────────────────────────
  const search = useCallback((q) => {
    clearTimeout(timer.current);
    if (!q || q.length < 2) {
      setResults(null);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  // ── WAI-ARIA Combobox keyboard handler ─────────────────────────────
  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" && results) {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => {
          const next = i + 1;
          return next < flatItems.length ? next : i;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => {
          if (i <= 0) {
            // At first option — move focus back to input
            setActiveIndex(-1);
            inputRef.current?.focus();
            return -1;
          }
          return i - 1;
        });
        break;

      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;

      case "End":
        e.preventDefault();
        setActiveIndex(flatItems.length - 1);
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && flatItems[activeIndex]) {
          navigateTo(flatItems[activeIndex].href);
        } else if (query.trim()) {
          navigateTo(`/search?q=${encodeURIComponent(query.trim())}`);
        }
        break;

      case "Escape":
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
        break;

      case "Tab":
        setOpen(false);
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  };

  const navigateTo = (href) => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
    router.push(href);
  };

  const handleResultClick = (href) => {
    navigateTo(href);
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex < 0) return;
    const el = document.getElementById(`${listboxId}-option-${activeIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId]);

  const hasResults = results && (results.videos?.length || results.notes?.length || results.users?.length);
  let globalOptionIndex = 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md group">
      <div className="relative">
        {/* Search icon / spinner */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" aria-hidden="true">
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Activity className="w-4 h-4 text-accent" />
            </motion.div>
          ) : (
            <Search className="w-4 h-4 text-text-3 group-hover:text-accent transition-colors" />
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          autoComplete="off"
          spellCheck="false"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          aria-label="Search videos, notes, and users"
          aria-busy={loading}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results) setOpen(true); }}
          placeholder="Search videos, notes, users…"
          className="w-full pl-11 pr-12 py-2 text-sm font-medium bg-bg dark:bg-surface-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-text-1 placeholder:text-text-3"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex pointer-events-none" aria-hidden="true">
          <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-slate-800 border border-border rounded">⌘K</kbd>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label={`Search results for ${query}`}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={springConfig}
            className="absolute top-full mt-2 left-0 right-0 md:min-w-[400px] bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-border overflow-hidden z-50 p-2"
          >
            {!hasResults ? (
              /* No results state */
              <div
                role="option"
                aria-selected="false"
                id={`${listboxId}-option-0`}
                className="px-6 py-8 text-center space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto border border-border" aria-hidden="true">
                  <SearchCode className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">No results found</p>
                  <p className="text-xs text-gray-500">No matches for &ldquo;{query}&rdquo;</p>
                </div>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>

                {/* Videos */}
                {results.videos?.length > 0 && (() => {
                  const groupStart = globalOptionIndex;
                  return (
                    <div className="mb-4">
                      <div className="px-3 py-2" role="presentation">
                        <span
                          className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                          id={`${listboxId}-group-videos`}
                        >
                          Videos
                        </span>
                      </div>
                      <div role="group" aria-labelledby={`${listboxId}-group-videos`}>
                        {results.videos.map((v) => {
                          const idx = globalOptionIndex++;
                          const isActive = activeIndex === idx;
                          return (
                            <div
                              key={v._id}
                              id={`${listboxId}-option-${idx}`}
                              role="option"
                              aria-selected={isActive}
                              onClick={() => handleResultClick(`/videos/${v._id}`)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              tabIndex={-1}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isActive ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-md flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                                <Video className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{v.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{v.subject}</span>
                                  <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">•</span>
                                  <span className="text-xs text-gray-500 truncate">{v.uploader?.name}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Notes */}
                {results.notes?.length > 0 && (() => {
                  return (
                    <div className="mb-4">
                      <div className="px-3 py-2" role="presentation">
                        <span
                          className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                          id={`${listboxId}-group-notes`}
                        >
                          Notes
                        </span>
                      </div>
                      <div role="group" aria-labelledby={`${listboxId}-group-notes`}>
                        {results.notes.map((n) => {
                          const idx = globalOptionIndex++;
                          const isActive = activeIndex === idx;
                          return (
                            <div
                              key={n._id}
                              id={`${listboxId}-option-${idx}`}
                              role="option"
                              aria-selected={isActive}
                              onClick={() => handleResultClick(`/notes/${n._id}`)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              tabIndex={-1}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isActive ? "bg-emerald-50 dark:bg-emerald-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-md flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{n.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{n.subject}</span>
                                  <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">•</span>
                                  <span className="text-xs text-gray-500 truncate">{n.uploader?.name}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Users */}
                {results.users?.length > 0 && (() => {
                  return (
                    <div className="mb-2">
                      <div className="px-3 py-2" role="presentation">
                        <span
                          className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                          id={`${listboxId}-group-users`}
                        >
                          Users
                        </span>
                      </div>
                      <div role="group" aria-labelledby={`${listboxId}-group-users`}>
                        {results.users.map((u) => {
                          const idx = globalOptionIndex++;
                          const isActive = activeIndex === idx;
                          return (
                            <div
                              key={u._id}
                              id={`${listboxId}-option-${idx}`}
                              role="option"
                              aria-selected={isActive}
                              onClick={() => handleResultClick(`/profile/${u.firebaseUid}`)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              tabIndex={-1}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isActive ? "bg-slate-100 dark:bg-slate-700" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              {u.image ? (
                                <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover border border-border" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-indigo-800" aria-hidden="true">
                                  {u.name?.[0]}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</p>
                                <span className="text-xs text-gray-500">{u.credits} credits</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* View all */}
                <div className="p-2 mt-2 border-t border-border">
                  {(() => {
                    const idx = globalOptionIndex++;
                    const isActive = activeIndex === idx;
                    return (
                      <div
                        id={`${listboxId}-option-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        tabIndex={-1}
                        className={`flex items-center justify-center gap-2 py-2 w-full rounded-md text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer transition-colors ${
                          isActive ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        }`}
                      >
                        View All Results for &ldquo;{query}&rdquo;
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
