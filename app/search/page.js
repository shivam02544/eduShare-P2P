"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard } from "@/components/Skeleton";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("videos");

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

  const total = (results?.videos?.length || 0) + (results?.notes?.length || 0) + (results?.users?.length || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          {q ? `Results for "${q}"` : "Search"}
        </h1>
        {results && !loading && (
          <p className="text-zinc-400 text-sm mt-1">{total} result{total !== 1 ? "s" : ""} found</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-zinc-200">
        {[
          { key: "videos", label: "Videos", count: results?.videos?.length ?? 0 },
          { key: "notes", label: "Notes", count: results?.notes?.length ?? 0 },
          { key: "people", label: "People", count: results?.users?.length ?? 0 },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}>
            {t.label}
            {!loading && results && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !results ? null : tab === "videos" ? (
        results.videos.length === 0 ? (
          <Empty label="videos" q={q} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.videos.map((v) => <VideoCard key={v._id} video={v} />)}
          </div>
        )
      ) : tab === "notes" ? (
        results.notes.length === 0 ? (
          <Empty label="notes" q={q} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
          </div>
        )
      ) : (
        results.users.length === 0 ? (
          <Empty label="people" q={q} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.users.map((u) => (
              <Link key={u._id} href={`/profile/${u.firebaseUid}`}
                className="card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                {u.image ? (
                  <img src={u.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg flex-shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 truncate">{u.name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">🏆 {u.credits} credits</p>
                  {u.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {u.skills.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function Empty({ label, q }) {
  return (
    <div className="text-center py-16 text-zinc-400">
      <p className="font-medium text-zinc-600">No {label} found for "{q}"</p>
      <p className="text-sm mt-1">Try different keywords</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
