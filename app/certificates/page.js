"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Share2, Eye, BookOpen, Clock, User, Download, ExternalLink, Zap } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function CertCard({ cert, index }) {
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...springConfig, delay: index * 0.05 }}
      className="group relative"
    >
      <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-border rounded-[40px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
        {/* Aesthetic accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/20 transition-colors" />
        
        {/* Header Board */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="w-14 h-14 rounded-[22px] bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner group-hover:rotate-12 transition-transform duration-500">
            <Award className="w-8 h-8" />
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
               Certified
             </span>
             <span className="text-[10px] font-black text-text-3 uppercase tracking-tighter opacity-50"># {cert.certId.slice(-8)}</span>
          </div>
        </div>

        {/* Content Node */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em]">Topic</p>
            <h3 className="text-xl font-black text-text-1 tracking-tight leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors">
              {cert.videoTitle}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
            <div className="space-y-1">
              <p className="text-[9px] font-black underline decoration-amber-500/30 underline-offset-4 text-text-3 uppercase tracking-widest">Score</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-text-1 tracking-tighter">{cert.score}%</p>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black underline decoration-amber-500/30 underline-offset-4 text-text-3 uppercase tracking-widest">Date Issued</p>
              <p className="text-[13px] font-black text-text-2 tracking-tight">{issuedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-4">
             <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-text-3 border border-border">
                <User className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[11px] font-black text-text-1 leading-none">{cert.issuerName}</p>
                <p className="text-[9px] font-medium text-text-3 mt-0.5">Instructor</p>
             </div>
          </div>
        </div>

        {/* Interaction HUD */}
        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/certificates/${cert.certId}`);
              toast.success("Link copied to clipboard", {
                 style: { borderRadius: '16px', background: '#0f172a', color: '#fff', fontSize: '12px' }
              });
            }}
            className="flex items-center gap-2 text-[10px] font-black text-text-3 uppercase tracking-widest hover:text-text-1 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          <Link href={`/certificates/${cert.certId}`}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
          >
            <Eye className="w-4 h-4" />
            View Certificate
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function CertificatesPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/certificates")
      .then((r) => r.json())
      .then((d) => { setCerts(Array.isArray(d) ? d : []); setLoading(false); });
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-6 lg:px-0">
      
      {/* ── Merit Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="relative overflow-hidden rounded-[48px] p-10 md:p-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Certificate Collection</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-text-1 tracking-tighter leading-tight">
              My <span className="text-amber-500">Certificates</span>
            </h1>
            <p className="text-base font-medium text-text-3 max-w-xl">
              View and share your earned certificates from completed course quizzes. Verify your skills and celebrate your learning progress.
            </p>
          </div>

          <div className="flex items-center gap-8 px-10 py-8 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-border shadow-inner">
             <div className="text-center">
               <p className="text-4xl font-black text-text-1 tracking-tighter mb-1">{certs.length}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-text-3">Certificates</p>
             </div>
             <div className="w-px h-12 bg-border" />
             <div className="text-center">
               <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto mb-2">
                 <Zap className="w-5 h-5" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-text-3">High-Rank</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── Merit Matrix ── */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <h2 className="text-sm font-black text-text-1 uppercase tracking-widest flex items-center gap-3">
            <Award className="w-5 h-5 text-text-3" />
            All Certificates
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-black text-text-3 uppercase tracking-tighter">
             Chronological Order
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[420px] rounded-[40px] bg-slate-100 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 space-y-8 bg-white/50 dark:bg-slate-900/50 rounded-[56px] border border-dashed border-border"
          >
            <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-text-3 opacity-30 shadow-inner">
               <Award className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-black text-text-1 tracking-tighter">No Certificates Yet</p>
              <p className="text-sm text-text-3 font-medium max-w-xs mx-auto">Complete course quizzes to earn certificates and keep them in your repository.</p>
            </div>
            <Link href="/explore" className="inline-flex items-center gap-2 px-10 py-4 rounded-3xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-transform">
              Explore Content
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {certs.map((c, i) => <CertCard key={c._id} cert={c} index={i} />)}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

