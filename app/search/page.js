"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard } from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Video, 
  FileText, 
  Users, 
  ChevronRight, 
  Zap, 
  Play, 
  BookOpen, 
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layer,
  Loader2
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab ] = useState("videos");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!q || !user) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => { setResults(d); setLoading(false); });
  }, [q, user]);

  const handleDownload = async (note) => {
    const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
    const data = await res.json();
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
  };

  const totalResults = (results?.videos?.length || 0) + (results?.notes?.length || 0) + (results?.users?.length || 0);

  const tabs = [
    { id: "videos", label: "Videos", icon: Video, count: results?.videos?.length ?? 0 },
    { id: "notes", label: "Notes", icon: FileText, count: results?.notes?.length ?? 0 },
    { id: "people", label: "Users", icon: Users, count: results?.users?.length ?? 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      
      {/* ── Header HUD ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Search Results</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Query: {q || "Global"}</span>
          </div>
          <h1 className="text-3xl font-black text-text-1 tracking-tight">
            Global <span className="text-indigo-500">Search</span> Results
          </h1>
        </div>

        {results && !loading && (
          <div className="bg-slate-50 dark:bg-white/5 border border-border px-4 py-2 rounded-2xl flex items-center gap-3">
             <Target className="w-4 h-4 text-indigo-500" />
             <p className="text-[10px] font-black uppercase tracking-widest text-text-2">
               {totalResults} Results Found
             </p>
          </div>
        )}
      </motion.div>

      {/* ── Tab HUD ── */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-2 rounded-[32px] shadow-sm flex flex-col md:flex-row gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl scale-[1.02]" 
                  : "text-text-3 hover:text-text-1 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-500" : ""}`} />
              {tab.label}
              {results && (
                <span className={`tabular-nums px-2 py-0.5 rounded-full text-[9px] ${
                  isActive ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-white/10"
                }`}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute inset-0 bg-indigo-500/10 rounded-2xl -z-10" 
                  transition={springConfig}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search Content ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loadingIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </motion.div>
        ) : !results ? (
           <EmptyState label="Search Pending" sub="Start a search to find educational content." />
        ) : activeTab === "videos" ? (
          <motion.div 
            key="videoGrid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {results.videos.length === 0 ? (
              <div className="col-span-full"><EmptyState label="Videos" q={q} /></div>
            ) : (
              results.videos.map((v, i) => (
                <motion.div key={v._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}>
                  <VideoCard video={v} />
                </motion.div>
              ))
            )}
          </motion.div>
        ) : activeTab === "notes" ? (
          <motion.div 
            key="noteGrid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {results.notes.length === 0 ? (
              <div className="col-span-full"><EmptyState label="Notes" q={q} /></div>
            ) : (
              results.notes.map((n, i) => (
                <motion.div key={n._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}>
                  <NoteCard note={n} onDownload={handleDownload} />
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="peopleGrid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {results.users.length === 0 ? (
              <div className="col-span-full"><EmptyState label="Users" q={q} /></div>
            ) : (
              results.users.map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}>
                  <Link 
                    href={`/profile/${u.firebaseUid}`}
                    className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-6 rounded-[32px] flex flex-col items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-500/30"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-slate-100 dark:bg-white/5 border border-border shadow-lg">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-3 font-black text-2xl">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-2xl border border-white/10">
                         <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    
                    <div className="text-center min-w-0 w-full space-y-1">
                      <p className="font-black text-text-1 tracking-tight truncate px-2">{u.name}</p>
                      <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">
                         <Zap className="w-3 h-3" />
                         {u.credits} Credits
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                      {u.skills?.slice(0, 2).map((s) => (
                        <span key={s} className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-text-3">
                          {s}
                        </span>
                      ))}
                    </div>
                    
                    <div className="w-full h-10 rounded-2xl border border-border flex items-center justify-center gap-2 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-950 transition-colors mt-2">
                       <span className="text-[9px] font-black uppercase tracking-widest">View Profile</span>
                       <ChevronRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ label, q, sub }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-dashed border-border rounded-[48px] py-32 flex flex-col items-center justify-center text-center gap-6"
    >
      <div className="w-20 h-20 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-border shadow-inner">
         <Search className="w-8 h-8 text-text-3 opacity-20" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-black text-text-1 tracking-tight capitalize">
          No {label} Found
          {q && <span className="text-indigo-500"> for "{q}"</span>}
        </h3>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">
          {sub || "Try adjusting your search terms."}
        </p>
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-40 gap-4">
         <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Searching...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

