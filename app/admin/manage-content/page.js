"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Star, 
  ShieldCheck, 
  Film, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Calendar, 
  Target, 
  Sparkles, 
  Loader2,
  ExternalLink,
  Layers,
  Database
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

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
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchContent();
  }, [type, page]);

  const handleDelete = async (id, contentType) => {
    if (!confirm(`Are you sure you want to delete this ${contentType}? This action is irreversible.`)) return;
    
    setDeleting(id);
    const res = await authFetch(`/api/admin/content?id=${id}&type=${contentType}`, {
      method: "DELETE"
    });
    setDeleting(null);
    
    if (res.ok) fetchContent();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      
      {/* ── Header HUD ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Admin Dashboard</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Content Moderation</span>
          </div>
          <h1 className="text-3xl font-black text-text-1 tracking-tight">
            Content <span className="text-indigo-500">Management</span>
          </h1>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 border border-border px-4 py-2 rounded-2xl flex items-center gap-3">
           <Database className="w-4 h-4 text-text-3" />
           <p className="text-[10px] font-black uppercase tracking-widest text-text-2">
             System Content
           </p>
        </div>
      </motion.div>

      {/* ── Filter Matrix ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-4 rounded-[32px] shadow-sm flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative group">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search content by title..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchContent()}
            className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-14 pr-6 py-4 text-xs font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            value={type} 
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-1 outline-none cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-all appearance-none min-w-[160px]"
          >
            <option value="all" className="bg-slate-900">All Content</option>
            <option value="video" className="bg-slate-900">Videos</option>
            <option value="note" className="bg-slate-900">Notes</option>
          </select>
          
          <button 
            onClick={fetchContent}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            Search
          </button>
        </div>
      </motion.div>

      {/* ── Asset Matrix ── */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <motion.div 
                key={`skeleton-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-28 bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-border rounded-[32px] animate-pulse" 
              />
            ))
          ) : items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-dashed border-border rounded-[48px] flex flex-col items-center justify-center text-center gap-4"
            >
               <Target className="w-12 h-12 text-text-3 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">No content found matches your search.</p>
            </motion.div>
          ) : (
            items.map((item, i) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-4 pr-10 rounded-[40px] flex items-center gap-6 transition-all hover:scale-[1.01] hover:border-indigo-500/30 hover:shadow-2xl shadow-sm"
              >
                {/* Visual HUD */}
                <div className="w-40 h-24 rounded-[28px] overflow-hidden bg-slate-900 flex-shrink-0 relative shadow-lg">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pb-0" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      {item.contentType === 'video' ? <Film className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5 ${
                    item.contentType === 'video' ? 'bg-rose-500/40' : 'bg-indigo-500/40'
                  }`}>
                    {item.contentType === 'video' ? <Film className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
                    {item.contentType}
                  </div>
                  {item.boostedUntil && new Date(item.boostedUntil) > new Date() && (
                    <div className="absolute bottom-3 left-3 bg-amber-500 text-white p-1 rounded-lg">
                       <Sparkles className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Registry Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-black text-text-1 tracking-tight truncate group-hover:text-indigo-500 transition-colors">{item.title}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-[0.15em] text-text-3">
                    <div className="flex items-center gap-2">
                       <Target className="w-3 h-3 text-indigo-500" />
                       <span className="text-text-1">{item.subject}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-2">
                       <User className="w-3 h-3" />
                       <span className="text-text-2 group-hover:text-text-1 transition-colors">{item.uploader?.name || "Anonymous"}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3" />
                       <span>Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Protocol Actions */}
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                  <Link 
                    href={`/${item.contentType}s/${item._id}`} 
                    target="_blank" 
                    className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                    title="View Content"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                  
                  <button 
                    onClick={() => handleDelete(item._id, item.contentType)}
                    disabled={deleting === item._id}
                    className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-rose-500/20"
                    title="Delete Content"
                  >
                    {deleting === item._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Pagination HUD ── */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between pt-12"
        >
          <button 
            onClick={() => setPage(p => Math.max(1, p-1))} 
            disabled={page === 1}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 transition-all font-geist"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-border px-6 py-3 rounded-2xl">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-1">Page {page} <span className="text-text-3">/</span> {totalPages}</span>
          </div>

          <button 
            onClick={() => setPage(p => Math.min(totalPages, p+1))} 
            disabled={page === totalPages}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 transition-all font-geist"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

