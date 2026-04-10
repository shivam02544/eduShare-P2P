"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  FolderPlus, 
  CheckCircle2, 
  Loader2, 
  List, 
  ChevronRight, 
  Settings, 
  Sparkles,
  Layers,
  Archive,
  ArrowUpRight,
  Database
} from "lucide-react";
import Link from "next/link";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function AddToCollection({ videoId }) {
  const { user, authFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);
  const [feedback, setFeedback] = useState({});
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchMyCollections = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authFetch(`/api/collections?creatorUid=${user.uid}`);
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Collection registry retrieval failure.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) fetchMyCollections();
  };

  const handleAdd = async (collectionId) => {
    setAdding(collectionId);
    try {
      const res = await authFetch(`/api/collections/${collectionId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      setFeedback((prev) => ({
        ...prev,
        [collectionId]: data.error ? `Error` : "Added",
      }));
    } catch (err) {
      setFeedback((prev) => ({ ...prev, [collectionId]: "Error" }));
    } finally {
      setAdding(null);
    }
  };

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      
      {/* ── Trigger Button ── */}
      <button 
        onClick={handleToggle}
        className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${
          open 
            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xl" 
            : "bg-white/50 dark:bg-white/5 border-border hover:border-indigo-500/40 text-text-1 backdrop-blur-md"
        }`}
      >
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
          open ? "bg-white/10 dark:bg-slate-950/10 text-white dark:text-slate-950" : "bg-slate-100 dark:bg-white/10 text-text-3 group-hover:bg-indigo-500 group-hover:text-white"
        }`}>
          <Plus className={`w-4 h-4 transition-transform duration-500 ${open ? "rotate-45" : ""}`} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Archive to Matrix</span>
      </button>

      {/* ── Dropdown Registry ── */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(10px)" }}
            transition={springConfig}
            className="absolute left-0 mt-4 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-border rounded-[32px] shadow-3xl z-[100] overflow-hidden p-2 ring-1 ring-border/50"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Database className="w-3.5 h-3.5 text-text-3" />
                 <p className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] italic">Collection Nodes</p>
              </div>
              <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {loading ? (
                <div className="p-10 flex flex-col items-center justify-center gap-3 opacity-30 italic">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Scanning Registry...</span>
                </div>
              ) : collections.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <p className="text-[10px] font-black text-text-3 italic">No active collection nodes detected.</p>
                  <Link 
                    href="/collections" 
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors italic"
                  >
                    <FolderPlus className="w-3 h-3" />
                    Initialize Protocol
                  </Link>
                </div>
              ) : (
                collections.map((c) => {
                  const isAdded = feedback[c._id] === "Added";
                  const isError = feedback[c._id] === "Error";
                  return (
                    <button 
                      key={c._id} 
                      onClick={() => handleAdd(c._id)}
                      disabled={!!adding || isAdded}
                      className={`w-full group/item flex items-center justify-between p-4 rounded-2xl transition-all ${
                        isAdded 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "hover:bg-slate-50 dark:hover:bg-white/5 text-text-1"
                      }`}
                    >
                      <div className="text-left min-w-0">
                        <p className="text-xs font-black italic truncate">{c.title}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-text-3 opacity-50 italic">
                          {c.videoCount} Assets Synchronized
                        </p>
                      </div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                        isAdded 
                          ? "bg-emerald-500 text-white border-emerald-500" 
                          : isError 
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-slate-50 dark:bg-white/5 border-border text-text-3 group-hover/item:border-indigo-500/30 group-hover/item:text-indigo-500"
                      }`}>
                        {adding === c._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isAdded ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isError ? (
                          <span className="text-[8px] font-black">!</span>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-slate-50/50 dark:bg-white/2 border-t border-border/50">
              <Link 
                href="/collections" 
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-all group/manage"
              >
                <div className="flex items-center gap-2">
                   <Settings className="w-3.5 h-3.5 text-text-3 group-hover/manage:rotate-90 transition-transform" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-text-2 italic">Architecture Oversight</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-3 opacity-0 group-hover/manage:opacity-100 transition-all" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

