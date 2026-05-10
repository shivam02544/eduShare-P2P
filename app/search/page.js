"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard } from "@/components/Skeleton";
import {
  Search,
  Video,
  FileText,
  Users,
  ChevronRight,
  Zap,
  Target,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import ResponsiveGrid from "@/components/layouts/ResponsiveGrid";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  const runSearch = async (query) => {
    if (!query || !user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const d = await res.json();
      setResults(d);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(q);
  }, [q, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = async (note) => {
    try {
      const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
      const data = await res.json();
      if (data.fileUrl) window.open(data.fileUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Silent — toast can be added here if needed
    }
  };

  const totalResults = (results?.videos?.length || 0) + (results?.notes?.length || 0) + (results?.users?.length || 0);

  const tabs = [
    { id: "videos", label: "Videos", icon: Video, count: results?.videos?.length ?? 0 },
    { id: "notes", label: "Notes", icon: FileText, count: results?.notes?.length ?? 0 },
    { id: "people", label: "Users", icon: Users, count: results?.users?.length ?? 0 },
  ];

  return (
    <PageContainer>
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-border">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-accent rounded-full" />
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              <span>Search Protocol</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-text-4">Query: {q || "Global"}</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-1 tracking-tight">
            Network Results
          </h1>
        </div>

        {results && !loading && (
          <div className="bg-surface-1 border border-border px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl shadow-accent/5">
             <Target className="w-5 h-5 text-accent" />
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-1">
               {totalResults} Nodes Detected
             </p>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-4 pb-8 mt-8 overflow-x-auto no-scrollbar border-b border-border/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap transition-all border ${
                isActive 
                  ? "bg-accent text-bg border-accent shadow-xl shadow-accent/20 scale-105" 
                  : "bg-surface-1 text-text-4 border-border hover:bg-surface-2 hover:text-text-1"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-bg' : 'text-accent'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              {results && (
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-surface-2 text-text-2"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search Content ── */}
      <div className="pt-12">
        {loading ? (
          <ResponsiveGrid columns={3}>
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </ResponsiveGrid>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-[32px] border-2 border-dashed border-rose-500/20 bg-rose-500/5 text-center space-y-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-surface-1 border border-rose-500/20 text-rose-500 shadow-xl">
              <AlertCircle className="w-10 h-10" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-text-1 tracking-tight">Search Failed</h3>
              <p className="text-[10px] font-bold text-text-4 uppercase tracking-widest">{error}</p>
            </div>
            <button
              onClick={() => runSearch(q)}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-bg bg-rose-500 hover:bg-rose-600 transition-all px-8 py-4 rounded-2xl shadow-xl shadow-rose-500/20 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Retry Protocol
            </button>
          </div>
        ) : activeTab === "videos" ? (
          results.videos.length === 0 ? (
            <div className="col-span-full"><EmptyState label="Videos" q={q} /></div>
          ) : (
            <ResponsiveGrid columns={3}>
              {results.videos.map((v) => <VideoCard key={v._id} video={v} />)}
            </ResponsiveGrid>
          )
        ) : activeTab === "notes" ? (
          results.notes.length === 0 ? (
            <div className="col-span-full"><EmptyState label="Notes" q={q} /></div>
          ) : (
            <ResponsiveGrid columns={3}>
              {results.notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
            </ResponsiveGrid>
          )
        ) : (
          results.users.length === 0 ? (
            <div className="col-span-full"><EmptyState label="Users" q={q} /></div>
          ) : (
            <ResponsiveGrid columns={4}>
              {results.users.map((u) => (
                <Link 
                  key={u._id}
                  href={`/profile/${u.firebaseUid}`}
                  className="group bg-surface-1 border border-border p-8 rounded-[32px] flex flex-col items-center gap-6 transition-all hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-1"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-surface-2 border border-border shadow-inner">
                      {u.image ? (
                        <img src={u.image} alt={u.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-3 font-bold text-3xl">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-surface-1 flex items-center justify-center border-4 border-surface-1 shadow-xl">
                       <ShieldCheck className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  
                  <div className="text-center min-w-0 w-full space-y-2">
                    <p className="text-lg font-bold text-text-1 truncate group-hover:text-accent transition-colors">{u.name}</p>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent">
                       <Zap className="w-3.5 h-3.5 fill-accent" />
                       {u.credits} Protocol Credits
                    </div>
                  </div>

                  {u.skills?.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {u.skills.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-surface-2 border border-border rounded-xl text-text-4">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="w-full mt-4 py-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-center gap-3 group-hover:bg-accent group-hover:text-bg group-hover:border-accent transition-all shadow-sm">
                     <span className="text-[10px] font-bold uppercase tracking-widest">Connect Node</span>
                     <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </ResponsiveGrid>
          )
        )}
      </div>
    </PageContainer>
  );
}

function EmptyState({ label, q, sub }) {
  return (
    <div className="bg-surface-1 border-2 border-dashed border-border/50 rounded-[40px] py-32 flex flex-col items-center justify-center text-center gap-8 shadow-inner">
      <div className="w-20 h-20 rounded-[32px] bg-surface-2 border border-border shadow-2xl flex items-center justify-center text-accent/30">
         <Search className="w-10 h-10" />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-text-1 tracking-tight">
          No {label} Detected
          {q && <span className="text-accent"> for "{q}"</span>}
        </h3>
        <p className="text-[10px] font-bold text-text-4 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
          {sub || "The requested query returned zero matching nodes in the network."}
        </p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-40 gap-6">
         <div className="p-4 rounded-[32px] bg-surface-1 border border-border shadow-2xl">
           <Loader2 className="w-10 h-10 animate-spin text-accent" />
         </div>
         <p className="text-[10px] font-bold text-text-4 uppercase tracking-[0.3em]">Synchronizing Network Data...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

