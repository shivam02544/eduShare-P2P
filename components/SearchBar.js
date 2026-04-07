"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (q) => {
    clearTimeout(timer.current);
    if (!q || q.length < 2) { setResults(null); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 300);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const hasResults = results && (results.videos?.length || results.notes?.length || results.users?.length);

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results && setOpen(true)}
          placeholder="Search videos, notes..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all"
        />
        {loading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50 animate-slide-down">
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-zinc-400">No results for "{query}"</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.videos?.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Videos</p>
                  {results.videos.map((v) => (
                    <Link key={v._id} href={`/videos/${v._id}`} onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{v.title}</p>
                        <p className="text-xs text-zinc-400">{v.subject} · {v.uploader?.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {results.notes?.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Notes</p>
                  {results.notes.map((n) => (
                    <div key={n._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{n.title}</p>
                        <p className="text-xs text-zinc-400">{n.subject} · {n.uploader?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {results.users?.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-wide">People</p>
                  {results.users.map((u) => (
                    <Link key={u._id} href={`/profile/${u.firebaseUid}`} onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors">
                      {u.image ? (
                        <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-sm font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{u.name}</p>
                        <p className="text-xs text-zinc-400">🏆 {u.credits} credits</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="border-t border-zinc-50 px-4 py-2.5">
                <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={() => { setOpen(false); }}
                  className="text-xs text-violet-600 hover:underline">
                  See all results for "{query}" →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
