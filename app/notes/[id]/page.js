"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LikeBookmarkBar from "@/components/LikeBookmarkBar";
import { useLoading } from "@/context/LoadingContext";
import ReportButton from "@/components/ReportButton";
import { 
  FileText, 
  Download, 
  Lock, 
  User, 
  ArrowLeft,
  Calendar,
  Activity,
  Layers,
  ShieldCheck,
  Eye,
  ExternalLink,
  ChevronRight,
  Database,
  Monitor,
  Target,
  Zap,
  Cpu,
  RefreshCw
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function NoteSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-40 px-8 animate-pulse">
      <div className="h-40 rounded-[48px] bg-slate-200 dark:bg-white/5 border border-border/50" />
      <div className="h-[70vh] rounded-[64px] bg-slate-200 dark:bg-white/5 border border-border/50" />
    </div>
  );
}

export default function NoteDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [previewMode, setPreviewMode] = useState("embed"); // "embed" | "iframe"

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  // SEO: Update page title
  useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} — Note Details`;
    }
    return () => { document.title = "EduShare – Peer Knowledge Exchange"; };
  }, [note]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((d) => { setNote(d); setLoading(false); });
  }, [id, user]);

  const isOwnNote = note?.uploader?.firebaseUid === user?.uid;
  const isPremium = note?.isPremium && !isOwnNote;

  const handleDownload = async () => {
    setDownloading(true);
    const res = await authFetch(`/api/notes/${id}/download`, { method: "POST" });
    const data = await res.json();
    setDownloading(false);
    if (data.message) toast.success(data.message);
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    const res = await authFetch(`/api/notes/${id}/unlock`, { method: "POST" });
    const data = await res.json();
    setUnlocking(false);
    if (data.error) { 
      toast.error(`Error: ${data.error}`); 
      return; 
    }
    toast.success(data.message);
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
    fetch(`/api/notes/${id}`).then(r => r.json()).then(setNote);
  };

  if (authLoading || loading) return <NoteSkeleton />;
  if (!note || note.error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center space-y-10">
      <div className="relative">
         <div className="w-40 h-40 rounded-[48px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner">
           <FileText className="w-20 h-20" />
         </div>
         <motion.div 
           animate={{ rotate: -360 }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute -inset-4 border border-indigo-500/10 rounded-full border-dashed"
         />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-text-1 tracking-tighter">Note Not Found</h2>
        <p className="text-text-3 font-black uppercase tracking-[0.3em] text-[10px]">This note could not be retrieved.</p>
      </div>
      <Link href="/explore" className="group flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all">
        Back to Explore
      </Link>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-16 pb-40 px-8">

      {/* ── Asset Command Bar: Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-12 md:p-16 rounded-[64px] shadow-3xl overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-8 flex-1">
             <div className="flex flex-wrap items-center gap-4">
                <div className="px-5 py-2 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-500/20">
                   {note.subject || "General Note"}
                </div>
                {note.isPremium && (
                  <div className="px-5 py-2 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 shadow-xl shadow-amber-500/20">
                     <Lock className="w-3.5 h-3.5" />
                     Premium Content
                  </div>
                )}
                <div className="px-5 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border text-[10px] font-black uppercase tracking-[0.3em] text-text-3">
                   ID: {id.slice(0, 8)}
                </div>
             </div>

             <div className="space-y-2">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] opacity-50">Educational Document</p>
                <h1 className="text-4xl md:text-6xl font-black text-text-1 tracking-tighter leading-tight">
                  {note.title}
                </h1>
             </div>

             <div className="flex flex-wrap items-center gap-10 pt-4">
                <Link href={`/profile/${note.uploader?.firebaseUid}`} className="group/u flex items-center gap-4">
                   <div className="relative">
                      {note.uploader?.image ? (
                        <img src={note.uploader.image} alt="" className="w-14 h-14 rounded-2xl object-cover border border-border group-hover/u:rotate-6 transition-transform" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-xl font-black">
                           {note.uploader?.name?.[0]}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] opacity-50">Instructor</span>
                      <span className="text-lg font-black text-text-1 group-hover/u:text-indigo-500 transition-colors uppercase tracking-tight">{note.uploader?.name}</span>
                   </div>
                </Link>

                <div className="w-px h-10 bg-border/50 hidden md:block" />

                <div className="flex items-center gap-10">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] opacity-50">Downloads</span>
                      <div className="flex items-center gap-2">
                         <Activity className="w-4 h-4 text-indigo-500" />
                         <span className="text-xl font-black text-text-1 uppercase tracking-tight">{note.downloads}</span>
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] opacity-50">Released</span>
                      <div className="flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-indigo-500" />
                         <span className="text-xl font-black text-text-1 uppercase tracking-tight">
                            {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Action Section */}
          <div className="flex flex-col gap-6 shrink-0 lg:w-80">
             <div className="p-4 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-border space-y-4">
                <div className="flex items-center justify-between px-4">
                   <LikeBookmarkBar item={note} type="note" />
                   <ReportButton contentType="note" contentId={id} compact />
                </div>
                
                {note.isPremium && !isOwnNote ? (
                  <button onClick={handleUnlock} disabled={unlocking}
                    className="w-full group/btn relative flex items-center justify-center gap-3 py-5 rounded-[32px] bg-amber-500 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-amber-500/20 disabled:opacity-50"
                  >
                    {unlocking ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 fill-current" />
                    )}
                    {unlocking ? "Processing..." : `Unlock Note: ${note.premiumCost} CR`}
                  </button>
                ) : (
                  <button onClick={handleDownload} disabled={downloading}
                    className="w-full group/btn relative flex items-center justify-center gap-3 py-5 rounded-[32px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-3xl disabled:opacity-50"
                  >
                    {downloading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {downloading ? "Downloading..." : "Download Note"}
                  </button>
                )}
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── Note Preview ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springConfig, delay: 0.2 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500">
                 <Monitor className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.4em] opacity-50">Preview Layer</span>
                 <h2 className="text-2xl font-black text-text-1 uppercase tracking-tight">Note Preview.</h2>
              </div>
           </div>
           
           <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-2 rounded-[32px] border border-border">
              <button 
                onClick={() => setPreviewMode(previewMode === "embed" ? "iframe" : "embed")}
                className="px-6 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 transition-all"
              >
                 Switch Renderer
              </button>
              <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-6 py-3 rounded-[24px] bg-white dark:bg-slate-900 border border-border text-[10px] font-black uppercase tracking-widest text-text-1 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-xl"
              >
                External Link
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
           </div>
        </div>

        <div className="relative group rounded-[64px] border border-border bg-slate-100 dark:bg-white/5 overflow-hidden shadow-3xl">
          {/* Dynamic Background Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
             <div className="grid grid-cols-12 h-full gap-4 p-8">
                {Array(48).fill(0).map((_, i) => (
                   <div key={i} className="h-full border-r border-slate-900 dark:border-white" />
                ))}
             </div>
          </div>

          <div className="relative z-10 w-full" style={{ height: "80vh" }}>
            {previewMode === "embed" ? (
              <embed
                src={`${note.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-full"
              />
            ) : (
              <iframe
                src={`${note.fileUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title={note.title}
              />
            )}

            {/* Premium Fallback State */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 -z-10 space-y-8">
               <div className="relative">
                  <div className="w-32 h-32 rounded-[48px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner">
                    <Database className="w-16 h-16" />
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-6 border border-indigo-500/10 rounded-full border-dashed"
                  />
               </div>
               <div className="text-center space-y-2">
                 <p className="text-2xl font-black text-text-1">Preview Offline</p>
                 <p className="text-[10px] font-black text-text-3 uppercase tracking-widest opacity-50">This file cannot be previewed in your browser.</p>
               </div>
               <button onClick={handleDownload} className="group flex items-center gap-4 px-10 py-5 bg-indigo-500 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-indigo-500/20">
                 Download Manually
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Control Navigation ── */}
      <div className="flex items-center justify-between pt-12 border-t border-border/50">
        <button onClick={() => router.back()}
          className="group flex items-center gap-3 px-8 py-4 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-border text-[11px] font-black uppercase tracking-[0.3em] text-text-3 hover:text-text-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>
        
        <div className="flex items-center gap-8 opacity-30">
           <div className="flex items-center gap-3 text-[10px] font-black text-text-3 uppercase tracking-[0.4em] leading-none">
              <Cpu className="w-4 h-4" />
              Safe Delivery Active
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-border" />
           <div className="flex items-center gap-3 text-[10px] font-black text-text-3 uppercase tracking-[0.4em] leading-none">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Content
           </div>
        </div>
      </div>
    </div>
  );
}
