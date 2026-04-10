"use client";
import React, { useState, useRef, useEffect } from "react";
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
  Database,
  ShieldCheck,
  Zap,
  Target,
  Layers,
  SearchCode,
  ChevronRight
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const router = useRouter();

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
    <div ref={ref} className="relative w-full max-w-[320px] group">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          {loading ? (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
             >
                <Activity className="w-4 h-4 text-indigo-500" />
             </motion.div>
          ) : (
             <Search className="w-4 h-4 text-text-3 group-hover:text-indigo-500 transition-colors" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results && setOpen(true)}
          placeholder="Explore..."
          className="w-full pl-12 pr-10 py-3.5 text-[11px] font-bold uppercase tracking-widest italic bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[24px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-xl shadow-slate-900/5 placeholder:text-text-3/50"
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-text-3 uppercase tracking-widest italic opacity-30 pointer-events-none hidden xl:block">
           CMD+K
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={springConfig}
            className="absolute top-full mt-4 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[32px] shadow-3xl border border-border overflow-hidden z-50 p-2"
          >
            {!hasResults ? (
              <div className="px-6 py-10 text-center space-y-3">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto border border-border">
                    <SearchCode className="w-6 h-6 text-text-3 opacity-30" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-1 uppercase tracking-widest">No results found</p>
                    <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-50">No matches for "{query}"</p>
                 </div>
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto no-scrollbar py-2">
                {results.videos?.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <div className="px-5 py-2 flex items-center gap-2">
                       <Video className="w-3.5 h-3.5 text-indigo-500" />
                       <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest italic">Media Nodes</span>
                    </div>
                    {results.videos.map((v) => (
                      <Link key={v._id} href={`/videos/${v._id}`} onClick={() => { setOpen(false); setQuery(""); }}
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                        <div className="w-10 h-10 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold text-text-1 truncate italic tracking-tight">{v.title}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-indigo-500 uppercase italic opacity-70">{v.subject}</span>
                             <div className="w-1 h-1 rounded-full bg-border" />
                             <span className="text-[9px] font-bold text-text-3 uppercase italic opacity-50">{v.uploader?.name}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-3 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                )}

                {results.notes?.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <div className="px-5 py-2 flex items-center gap-2">
                       <FileText className="w-3.5 h-3.5 text-emerald-500" />
                       <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest italic">Asset Manifests</span>
                    </div>
                    {results.notes.map((n) => (
                      <Link key={n._id} href={`/notes/${n._id}`} onClick={() => { setOpen(false); setQuery(""); }}
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item">
                        <div className="w-10 h-10 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all">
                          <Database className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold text-text-1 truncate italic tracking-tight">{n.title}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-emerald-500 uppercase italic opacity-70">{n.subject}</span>
                             <div className="w-1 h-1 rounded-full bg-border" />
                             <span className="text-[9px] font-bold text-text-3 uppercase italic opacity-50">{n.uploader?.name}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-3 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                )}

                {results.users?.length > 0 && (
                  <div className="space-y-1 mb-2">
                    <div className="px-5 py-2 flex items-center gap-2">
                       <Users className="w-3.5 h-3.5 text-rose-500" />
                       <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest italic">Agent Registry</span>
                    </div>
                    {results.users.map((u) => (
                      <Link key={u._id} href={`/profile/${u.firebaseUid}`} onClick={() => { setOpen(false); setQuery(""); }}
                        className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/person">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-10 h-10 rounded-[14px] object-cover border border-border group-hover/person:scale-110 transition-transform" />
                        ) : (
                          <div className="w-10 h-10 rounded-[14px] bg-indigo-500 text-white flex items-center justify-center text-[12px] font-bold italic border border-white/10">
                            {u.name?.[0]}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold text-text-1 truncate italic tracking-tight">{u.name}</p>
                          <div className="flex items-center gap-2">
                             <Zap className="w-3 h-3 text-amber-500 fill-current" />
                             <span className="text-[9px] font-bold text-text-3 uppercase italic opacity-50">{u.credits} CREDITS</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-3 opacity-0 group-hover/person:opacity-100 group-hover/person:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                )}

                <div className="px-4 py-4 mt-2 border-t border-border/50">
                  <Link href={`/search?q=${encodeURIComponent(query)}`} onClick={() => { setOpen(false); }}
                    className="group flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
                    View All Results
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

