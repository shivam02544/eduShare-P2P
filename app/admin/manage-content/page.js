"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ManageContentPage() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchContent = () => {
    setLoading(true);
    authFetch(`/api/admin/content?type=${type}&q=${q}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setTotalPages(data.pages || 1);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContent();
  }, [type, page]);

  const handleDelete = async (id, contentType) => {
    if (!confirm(`Are you sure you want to delete this ${contentType}? This cannot be undone.`)) return;
    
    setDeleting(id);
    const res = await authFetch(`/api/admin/content?id=${id}&type=${contentType}`, {
      method: "DELETE"
    });
    setDeleting(null);
    
    if (res.ok) {
      fetchContent();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Content Management</h1>
        <p className="text-zinc-500 mt-1 text-sm">Review, search, and manage all platform videos and notes.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex-1 relative">
          <input type="text" placeholder="Search content title..."
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchContent()}
            className="input pl-10 h-11" />
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input md:w-48 h-11 transition-all">
          <option value="all">All Content</option>
          <option value="video">Videos Only</option>
          <option value="note">Notes Only</option>
        </select>
        <button onClick={fetchContent} className="btn-primary h-11 px-8">Filter</button>
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-zinc-200">
            <p className="text-zinc-400 font-medium">No content found matching your criteria.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4 hover:border-zinc-300 transition-all group">
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                  </div>
                )}
                <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                  item.contentType === 'video' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {item.contentType}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-zinc-900 truncate">{item.title}</h3>
                  {item.boostedUntil && new Date(item.boostedUntil) > new Date() && (
                    <span className="badge bg-amber-50 text-amber-600 text-[8px] uppercase font-black tracking-tighter border-amber-100">Boosted</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                  <span className="font-bold uppercase text-zinc-300 tracking-widest">{item.subject}</span>
                  <span>•</span>
                  <span>{item.uploader?.name || "Unknown"}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/${item.contentType}s/${item._id}`} target="_blank" className="btn-secondary p-2.5 rounded-xl transition-all" title="View live">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </Link>
                <button onClick={() => handleDelete(item._id, item.contentType)}
                  disabled={deleting === item._id}
                  className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="Delete Content">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="btn-secondary px-6 py-2 text-xs font-bold disabled:opacity-40">Previous</button>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
            className="btn-secondary px-6 py-2 text-xs font-bold disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
