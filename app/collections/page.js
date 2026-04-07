"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SkeletonCard } from "@/components/Skeleton";

function CollectionCard({ collection }) {
  return (
    <Link href={`/collections/${collection._id}`}
      className="card overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200 animate-fade-in">
      {/* Cover */}
      <div className="h-36 bg-stone-100 overflow-hidden flex items-center justify-center relative">
        {collection.coverImage ? (
          <img src={collection.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-5xl">📚</div>
        )}
        {/* Video count overlay */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          {collection.videoCount} videos
        </div>
        {!collection.isPublic && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            🔒 Private
          </div>
        )}
      </div>

      <div className="p-4">
        {collection.subject && (
          <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[11px] mb-2">
            {collection.subject}
          </span>
        )}
        <h3 className="font-semibold text-zinc-900 text-sm line-clamp-1">{collection.title}</h3>
        {collection.description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{collection.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
          {collection.creator?.image ? (
            <img src={collection.creator.image} alt="" className="w-4 h-4 rounded-full object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-[9px] font-bold">
              {collection.creator?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span>{collection.creator?.name}</span>
          <span className="ml-auto">{collection.followerCount} followers</span>
        </div>
      </div>
    </Link>
  );
}

export default function CollectionsPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", isPublic: true });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/collections")
      .then((r) => r.json())
      .then((d) => { setCollections(d); setLoading(false); });
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    const res = await authFetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) return setError(data.error);
    router.push(`/collections/${data._id}`);
  };

  const SUBJECTS = ["Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology", "Other"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Collections</h1>
          <p className="text-zinc-400 text-sm mt-1">Curated video playlists from the community</p>
        </div>
        {user && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
            {showCreate ? "Cancel" : "+ New Collection"}
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card p-6 animate-scale-in">
          <h2 className="font-semibold text-zinc-900 mb-4">Create Collection</h2>
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <input type="text" placeholder="Collection title *" required maxLength={100}
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input" />
            <textarea placeholder="Description (optional)" rows={2} maxLength={500}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none" />
            <div className="flex gap-3">
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input flex-1">
                <option value="">No subject tag</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <input type="checkbox" checked={form.isPublic}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                  className="w-4 h-4 rounded" />
                <span className="text-sm text-zinc-600">Public</span>
              </label>
            </div>
            <button type="submit" disabled={creating} className="btn-primary w-full py-2.5">
              {creating ? "Creating..." : "Create Collection"}
            </button>
          </form>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-5xl mb-3">📚</p>
          <p className="font-medium text-zinc-600">No collections yet</p>
          <p className="text-sm mt-1">Be the first to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {collections.map((c) => <CollectionCard key={c._id} collection={c} />)}
        </div>
      )}
    </div>
  );
}
