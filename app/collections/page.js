"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Library, 
  Users, 
  Video, 
  Lock, 
  Globe, 
  Plus, 
  ChevronRight, 
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  MoreVertical,
  Layers,
  ShieldCheck,
  Target,
  Database,
  Cpu,
  Zap,
  Radio,
  Activity
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function CollectionCard({ collection, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: index * 0.1 }}
      whileHover={{ y: -12 }}
    >
      <Link href={`/collections/${collection._id}`} className="group relative block rounded-[56px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-border p-8 transition-all hover:shadow-3xl hover:shadow-indigo-500/10 overflow-hidden">
        {/* Collection Cover */}
        <div className="relative h-56 rounded-[40px] overflow-hidden bg-slate-100 dark:bg-white/5 mb-8 border border-border/50 shadow-inner">
          {collection.coverImage ? (
            <img 
              src={collection.coverImage} 
              alt={collection.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
              <Layers className="w-16 h-16 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform duration-700" />
            </div>
          )}
          
          {/* Metadata Overlays */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
            {!collection.isPublic ? (
              <div className="px-4 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl text-white text-[9px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Private
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xl text-slate-900 text-[9px] font-bold uppercase tracking-widest border border-black/5 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                Public
              </div>
            )}
          </div>
          
          <div className="absolute bottom-6 right-6 px-4 py-2 rounded-2xl bg-indigo-500/90 backdrop-blur-xl text-white text-[9px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2 shadow-2xl">
            <Video className="w-3.5 h-3.5" />
            {collection.videoCount} Videos
          </div>
        </div>

        {/* Collection Information */}
        <div className="px-2 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              {collection.subject && (
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                     {collection.subject}
                   </span>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-border flex items-center justify-center text-text-3 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                 <ChevronRight className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-text-1 tracking-tighter leading-tight line-clamp-1 group-hover:text-indigo-500 transition-colors">
              {collection.title}
            </h3>
            <p className="text-text-3 text-[13px] font-bold line-clamp-2 leading-relaxed opacity-70">
              {collection.description || "A curated list of educational videos and notes."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                {collection.creator?.image ? (
                  <img src={collection.creator.image} alt="" className="w-9 h-9 rounded-xl object-cover border border-border" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-[11px] font-bold shadow-inner">
                    {collection.creator?.name?.[0]}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-lg bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] font-bold text-text-3 uppercase tracking-widest opacity-50">Created By</span>
                 <span className="text-[11px] font-bold text-text-1 uppercase tracking-tight">
                   {collection.creator?.name}
                 </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-3 uppercase tracking-widest opacity-60">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              {collection.followerCount} Followers
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
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
    <div className="max-w-[1440px] mx-auto space-y-16 pb-40 px-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
               <Library className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">My Library</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-text-1 tracking-tighter leading-none"
          >
            My <span className="text-text-3">Collections.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-text-2 text-lg font-medium max-w-xl leading-relaxed"
          >
            Manage and explore educational collections structured for efficient learning.
          </motion.p>
        </div>

        {user && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(!showCreate)} 
            className={`group flex items-center gap-4 px-10 py-5 rounded-[32px] font-bold text-[12px] uppercase tracking-widest transition-all shadow-3xl ${
              showCreate 
                ? "bg-slate-50 dark:bg-white/5 text-text-1 border border-border" 
                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-indigo-500/10"
            }`}
          >
            {showCreate ? "Cancel" : (
              <>
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Create Collection
              </>
            )}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={springConfig}
            className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-border p-12 lg:p-20 rounded-[64px] shadow-4xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
            
            <div className="max-w-3xl mx-auto space-y-12 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30">
                  <Library className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-bold text-text-1 tracking-tighter">Create New Collection</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-3 opacity-50">Enter collection details</p>
                </div>
              </div>

              {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest px-6 py-4 rounded-2xl">{error}</div>}
              
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 md:col-span-2">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-3 ml-4">Title</label>
                      <input 
                        type="text" placeholder="Enter title..." 
                        required maxLength={100}
                        value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900/50 border border-border p-6 rounded-[32px] text-[16px] font-bold text-text-1 focus:border-indigo-500 transition-all outline-none placeholder:opacity-30" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-3 ml-4">Description</label>
                      <textarea 
                        placeholder="Describe your collection..." 
                        rows={4} maxLength={500}
                        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900/50 border border-border p-6 rounded-[32px] text-[14px] font-bold text-text-2 focus:border-indigo-500 transition-all outline-none resize-none placeholder:opacity-30" 
                      />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-text-3 ml-4">Category</label>
                   <select 
                     value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                     className="w-full bg-white dark:bg-slate-900/50 border border-border px-8 py-6 rounded-[32px] text-[13px] font-bold text-text-1 appearance-none outline-none focus:border-indigo-500 transition-all"
                   >
                     <option value="">General</option>
                     {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                   </select>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-8 px-6">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${form.isPublic ? "bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-border group-hover:border-indigo-500"}`}>
                      {form.isPublic && <ShieldCheck className="w-5 h-5 text-white" />}
                    </div>
                    <input 
                      type="checkbox" checked={form.isPublic}
                      onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                      className="hidden" 
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-[12px] font-bold text-text-1 uppercase tracking-tight">Public Visibility</span>
                      <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-50">Make this collection public</span>
                    </div>
                  </label>
                </div>

                <div className="md:col-span-2 pt-8">
                  <button type="submit" disabled={creating} className="w-full flex items-center justify-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[32px] font-bold text-[12px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl">
                    {creating ? (
                      <Plus className="w-6 h-6 animate-pulse" />
                    ) : (
                      <>
                        Create Collection
                        <Zap className="w-5 h-5 fill-current" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collections Grid ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div key="skeleton" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[450px] rounded-[56px] bg-slate-100 dark:bg-white/5 animate-pulse border border-border" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 rounded-[64px] border border-dashed border-border bg-slate-50/50 dark:bg-white/5 space-y-8"
          >
            <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[48px] flex items-center justify-center mx-auto shadow-inner border border-border">
              <Layers className="w-12 h-12 text-text-3 opacity-20" />
            </div>
            <div className="text-center space-y-2">
               <h2 className="text-2xl font-bold text-text-1">No Collections Found</h2>
               <p className="text-[10px] font-bold uppercase tracking-widest text-text-3">Create your first collection to start organizing your content.</p>
            </div>
            {user && (
              <button 
                onClick={() => setShowCreate(true)}
                className="group flex items-center gap-3 px-10 py-5 bg-indigo-500 text-white rounded-[32px] font-bold text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
              >
                Create Collection
                <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12"
          >
            {collections.map((c, idx) => <CollectionCard key={c._id} collection={c} index={idx} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

