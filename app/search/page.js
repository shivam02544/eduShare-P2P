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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-indigo-600 dark:text-indigo-400">Search Results</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-text-3">Query: {q || "Global"}</span>
          </div>
          <h1 className="text-3xl font-bold text-text-1">
            Global Search Results
          </h1>
        </div>

        {results && !loading && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-border px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
             <Target className="w-4 h-4 text-indigo-500" />
             <p className="text-xs font-bold uppercase tracking-wider text-text-2">
               {totalResults} Results Found
             </p>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 pb-6 border-b border-border overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 whitespace-nowrap transition-colors ${
                isActive 
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" 
                  : "border-transparent text-text-3 hover:text-text-1"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-bold">{tab.label}</span>
              {results && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-text-2"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search Content ── */}
      <div className="pt-2">
        {loading ? (
          <ResponsiveGrid columns={3}>
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </ResponsiveGrid>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 text-rose-500">
              <AlertCircle className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-1">Search Failed</h3>
              <p className="text-sm text-text-3">{error}</p>
            </div>
            <button
              onClick={() => runSearch(q)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Retry Search
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
                  className="group bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-border">
                      {u.image ? (
                        <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-3 font-bold text-2xl">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                       <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    </div>
                  </div>
                  
                  <div className="text-center min-w-0 w-full space-y-1">
                    <p className="font-bold text-text-1 truncate">{u.name}</p>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-500">
                       <Zap className="w-3 h-3" />
                       {u.credits} Credits
                    </div>
                  </div>

                  {u.skills?.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                      {u.skills.slice(0, 2).map((s) => (
                        <span key={s} className="text-xs font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-border rounded-md text-text-2">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="w-full mt-2 py-2 rounded-xl border border-border flex items-center justify-center gap-2 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
                     <span className="text-xs font-bold text-text-2">View Profile</span>
                     <ChevronRight className="w-4 h-4 text-text-3" />
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
    <div className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-border/50 rounded-3xl py-20 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-border shadow-sm">
         <Search className="w-8 h-8 text-text-3" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-text-1">
          No {label} Found
          {q && <span className="text-indigo-600 dark:text-indigo-400"> for "{q}"</span>}
        </h3>
        <p className="text-sm font-semibold text-text-3">
          {sub || "Try adjusting your search terms."}
        </p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-40 gap-4">
         <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
         <p className="text-sm font-bold text-text-3">Searching...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

