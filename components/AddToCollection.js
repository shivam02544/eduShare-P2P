"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AddToCollection({ videoId }) {
  const { user, authFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);
  const [feedback, setFeedback] = useState({});
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchMyCollections = async () => {
    if (!user) return;
    setLoading(true);
    const res = await authFetch(`/api/collections?creatorUid=${user.uid}`);
    const data = await res.json();
    setCollections(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchMyCollections();
  };

  const handleAdd = async (collectionId) => {
    setAdding(collectionId);
    const res = await authFetch(`/api/collections/${collectionId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    const data = await res.json();
    setAdding(null);
    setFeedback((prev) => ({
      ...prev,
      [collectionId]: data.error ? `Error: ${data.error}` : "Added ✓",
    }));
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                   bg-stone-100 text-zinc-600 border border-stone-200 hover:bg-stone-200 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4v16m8-8H4"/>
        </svg>
        Save to Collection
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-stone-200 py-1.5 z-50 animate-slide-down overflow-hidden"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
                   boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <p className="px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-stone-100">
            Your Collections
          </p>

          {loading ? (
            <div className="px-4 py-4 text-sm text-zinc-400 text-center">Loading...</div>
          ) : collections.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-zinc-400">No collections yet</p>
              <a href="/collections" className="text-xs text-violet-600 hover:underline mt-1 block">
                Create one →
              </a>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              {collections.map((c) => (
                <button key={c._id} onClick={() => handleAdd(c._id)}
                  disabled={!!adding || feedback[c._id] === "Added ✓"}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50
                             transition-colors text-left disabled:opacity-60">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{c.title}</p>
                    <p className="text-xs text-zinc-400">{c.videoCount} videos</p>
                  </div>
                  <span className={`text-xs ml-2 flex-shrink-0 ${
                    feedback[c._id] === "Added ✓" ? "text-emerald-600 font-medium" : "text-zinc-400"
                  }`}>
                    {adding === c._id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : feedback[c._id] || "+"}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-stone-100 px-4 py-2">
            <a href="/collections" className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors">
              Manage collections →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
