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
import FilePreview from "@/components/FilePreview";
import { 
  FileText, 
  Download, 
  Lock, 
  ArrowLeft,
  ArrowRight,
  Calendar,
  Activity,
  ShieldCheck,
  Target,
  Zap,
  Cpu,
  RefreshCw,
  Play,
  Clock,
  Sparkles
} from "lucide-react";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

function NoteSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-16 pb-40 px-8 animate-pulse">
      <div className="h-64 rounded-[40px] bg-surface-2 dark:bg-surface-3 border border-border/50" />
      <div className="h-[60vh] rounded-[40px] bg-surface-2 dark:bg-surface-3 border border-border/50" />
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
  const [fetchError, setFetchError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  // SEO: Update page title
  useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} — Note Details`;
    }
    return () => { document.title = "EduShare – Peer Knowledge Exchange"; };
  }, [note]);

  useEffect(() => {
    if (!user) return;
    setFetchError(null);
    fetch(`/api/notes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load note (${r.status})`);
        return r.json();
      })
      .then((d) => { setNote(d); setLoading(false); })
      .catch((err) => { setFetchError(err.message); setLoading(false); });
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

  if (fetchError) return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] px-8 text-center space-y-8">
      <div className="w-24 h-24 rounded-[32px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/5">
        <RefreshCw className="w-10 h-10" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-black text-text-1 tracking-tight">Access Protocol Failure</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">{fetchError}</p>
      </div>
      <button
        onClick={() => { setLoading(true); setFetchError(null); }}
        className="px-10 py-5 rounded-2xl bg-surface-1 dark:bg-surface-2 border border-border text-text-1 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface-2 transition-all shadow-xl"
      >
        Retry Connection
      </button>
    </div>
  );

  if (!note || note.error) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center space-y-12">
      <div className="relative group">
         <div className="w-48 h-48 rounded-[40px] bg-surface-1 dark:bg-surface-2 flex items-center justify-center text-text-4 border border-border shadow-inner group-hover:scale-105 transition-transform duration-700">
           <FileText className="w-20 h-20 opacity-10" aria-hidden="true" />
         </div>
         <motion.div 
           animate={{ rotate: -360 }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute -inset-8 border border-accent/10 rounded-full border-dashed"
         />
      </div>
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-text-1 tracking-tight">Artifact Not Found</h2>
        <p className="text-text-4 font-black uppercase tracking-[0.3em] text-[10px]">The requested knowledge node is inaccessible.</p>
      </div>
      <Link href="/explore" className="group flex items-center gap-4 px-12 py-6 bg-text-1 text-bg rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl">
        Back to Network
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
        className="relative bg-surface-1 dark:bg-surface-2 border border-border p-12 md:p-16 rounded-[40px] shadow-2xl overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16">
          <div className="space-y-10 flex-1">
             <div className="flex flex-wrap items-center gap-4">
                <div className="px-6 py-2.5 rounded-2xl bg-accent text-bg text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 border border-accent/20">
                   {note.subject || "GENERAL"}
                </div>
                {note.isPremium && (
                  <div className="px-6 py-2.5 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-amber-500/20 border border-amber-400/20">
                     <Lock className="w-4 h-4 fill-current" />
                     Premium Node
                  </div>
                )}
                <div className="px-6 py-2.5 rounded-2xl bg-surface-2 dark:bg-surface-3 border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-4">
                   UID: {id.slice(0, 8)}
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <Sparkles className="w-4 h-4 text-accent" />
                   <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Knowledge Artifact</p>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-text-1 tracking-tight leading-[0.95]">
                  {note.title}
                </h1>
             </div>

             <div className="flex flex-wrap items-center gap-12 pt-6">
                <Link href={`/profile/${note.uploader?.firebaseUid}`} className="group/u flex items-center gap-5">
                   <div className="relative">
                      {note.uploader?.image ? (
                        <img src={note.uploader.image} alt="" className="w-16 h-16 rounded-[20px] object-cover border border-border group-hover/u:rotate-6 transition-transform duration-500 shadow-xl" />
                      ) : (
                        <div className="w-16 h-16 rounded-[20px] bg-accent text-bg flex items-center justify-center text-2xl font-black border border-accent shadow-xl">
                           {note.uploader?.name?.[0]}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-surface-1" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Contributor</span>
                      <span className="text-xl font-black text-text-1 group-hover/u:text-accent transition-colors uppercase tracking-tight">{note.uploader?.name}</span>
                   </div>
                </Link>

                <div className="w-px h-12 bg-border/50 hidden md:block" />

                 <div className="flex items-center gap-12">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Archived</span>
                      <div className="flex items-center gap-3">
                         <Activity className="w-4 h-4 text-accent" />
                         <span className="text-2xl font-black text-text-1 uppercase tracking-tight">{note.downloads}</span>
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Timestamp</span>
                      <div className="flex items-center gap-3">
                         <Calendar className="w-4 h-4 text-accent" />
                         <span className="text-2xl font-black text-text-1 uppercase tracking-tight">
                            {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Action Section */}
          <div className="flex flex-col gap-6 shrink-0 lg:w-96">
             <div className="p-8 rounded-[32px] bg-surface-2 dark:bg-surface-3 border border-border space-y-6 shadow-inner">
                <div className="flex items-center justify-between px-2">
                   <LikeBookmarkBar item={note} type="note" />
                   <ReportButton contentType="note" contentId={id} compact />
                </div>
                
                <div className="h-px bg-border/50" />

                {note.isPremium && !isOwnNote ? (
                  <button onClick={handleUnlock} disabled={unlocking}
                    className="w-full group/btn relative flex items-center justify-center gap-3 py-6 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-500/20 disabled:opacity-50 border border-amber-400/20"
                  >
                    {unlocking ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5 fill-current" />
                    )}
                    {unlocking ? "PROCESSING..." : `UNLOCK ARTIFACT: ${note.premiumCost} CR`}
                  </button>
                ) : (
                  <button onClick={handleDownload} disabled={downloading}
                    className="w-full group/btn relative flex items-center justify-center gap-3 py-6 rounded-2xl bg-accent text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent-h hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-accent/20 disabled:opacity-50 border border-accent/20"
                  >
                    {downloading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {downloading ? "DOWNLOADING..." : "DOWNLOAD ARTIFACT"}
                  </button>
                )}
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── Note Content ── */}
      <div className="bg-surface-1 dark:bg-surface-2 border border-border rounded-[40px] overflow-hidden shadow-sm">
        <div className="p-10 md:p-20">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-text-2 prose-a:text-accent hover:prose-a:underline font-medium leading-relaxed text-lg">
             {note.content}
          </div>
        </div>
        
        {/* Author Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-surface-2 dark:bg-surface-3 border-t border-border gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-border shadow-lg">
                {note.uploader?.image ? (
                  <img src={note.uploader.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent text-bg flex items-center justify-center font-black text-xl">
                    {note.uploader?.name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xl font-black text-text-1 uppercase tracking-tight">{note.uploader?.name}</p>
                <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Verified Knowledge Curator</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {note.video?._id && (
                <Link href={`/videos/${note.video?._id}`} className="flex items-center gap-3 px-10 py-5 bg-accent text-bg rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-accent/20">
                  <Play className="w-4 h-4 fill-current" />
                  RELATED SESSION
                </Link>
              )}
              <button className="p-5 rounded-2xl bg-surface-1 dark:bg-surface-2 border border-border text-text-3 hover:text-accent hover:border-accent/20 transition-all shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </button>
            </div>
        </div>
      </div>

      {/* ── Control Navigation ── */}
      <div className="flex items-center justify-between pt-16 border-t border-border/50">
        <button onClick={() => router.back()}
          className="group flex items-center gap-4 px-10 py-5 rounded-2xl bg-surface-1 dark:bg-surface-2 border border-border text-[10px] font-black uppercase tracking-[0.3em] text-text-4 hover:text-text-1 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform duration-500" />
          TERMINATE SESSION
        </button>
        
        <div className="flex flex-wrap items-center gap-10 opacity-30">
           <div className="flex items-center gap-3 text-[10px] font-black text-text-4 uppercase tracking-[0.2em] leading-none">
              <Cpu className="w-5 h-5" />
              SAFE ENCRYPTED DELIVERY
           </div>
           <div className="w-2 h-2 rounded-full bg-border" />
           <div className="flex items-center gap-3 text-[10px] font-black text-text-4 uppercase tracking-[0.2em] leading-none">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              VERIFIED KNOWLEDGE NODE
           </div>
        </div>
      </div>
    </div>
  );
}
