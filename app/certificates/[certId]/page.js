"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, 
  Share2, 
  Download, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  Printer, 
  ExternalLink,
  ShieldCheck,
  Zap
} from "lucide-react";
import { toast } from "react-hot-toast";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function CertificateSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse pb-32">
      <div className="h-10 w-48 bg-slate-200 dark:bg-white/5 rounded-2xl mx-auto" />
      <div className="aspect-[1.4/1] w-full rounded-[48px] bg-slate-200 dark:bg-white/5 border border-border mt-12" />
    </div>
  );
}

export default function CertificatePage() {
  const { certId } = useParams();
  const router = useRouter();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    fetch(`/api/certificates/${certId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.valid) setNotFound(true);
        else setCert(d);
        setLoading(false);
      });
  }, [certId]);

  const handlePrint = () => window.print();

  if (loading) return <CertificateSkeleton />;
  if (notFound) return (
    <div className="text-center py-32 space-y-8">
      <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-text-3 opacity-30 shadow-inner">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-black text-text-1 tracking-tighter leading-tight">Certificate Not Found</h2>
        <p className="text-sm text-text-3 font-medium max-w-xs mx-auto">This certificate does not exist or may have been removed.</p>
      </div>
      <button 
        onClick={() => router.push('/explore')}
        className="px-8 py-3 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-transform active:scale-95"
      >
        Explore Content
      </button>
    </div>
  );

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 md:px-0">
      
      {/* ── Action HUD ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Certificate Details</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">ID: {cert.certId.slice(-12)}</span>
          </div>
          <h1 className="text-2xl font-black text-text-1 tracking-tight">
            Course <span className="text-indigo-500">Certificate</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard", {
                 style: { borderRadius: '16px', background: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
              });
            }} 
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border text-[10px] font-black uppercase tracking-widest text-text-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
          >
            <Download className="w-4 h-4" />
            Print / Download
          </button>
        </div>
      </motion.div>

      {/* ── Certificate Canvas ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
        ref={certRef}
        className="relative aspect-[1.4/1] w-full bg-white dark:bg-slate-950 overflow-hidden rounded-[48px] print:rounded-none shadow-3xl ring-1 ring-border group"
      >
        {/* Anti-Gravity Decor */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] -z-10 group-hover:bg-indigo-500/10 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px] -z-10" />
        
        {/* High-End Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{ backgroundImage: 'radial-gradient(var(--text-1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />

        {/* Framing */}
        <div className="absolute inset-8 border border-text-1/5 rounded-[32px] pointer-events-none" />
        <div className="absolute inset-12 border-2 border-text-1/5 rounded-[24px] pointer-events-none" />

        <div className="relative h-full flex flex-col items-center justify-between p-16 md:p-24 text-center">
          
          {/* Logo HUD */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 shadow-2xl">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[12px] font-black text-text-1 uppercase tracking-[0.4em]">EduShare Platform</span>
            </div>
            <div className="flex items-center justify-center gap-4">
               <div className="h-px w-8 bg-text-1/10" />
               <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Official Document</span>
               <div className="h-px w-8 bg-text-1/10" />
            </div>
          </div>

          {/* Recipient Logic */}
          <div className="space-y-6">
            <p className="text-[13px] font-black text-text-3 uppercase tracking-[0.3em] font-serif">Certificate of Completion</p>
            <div className="space-y-2">
              <p className="text-[11px] font-black text-text-3 uppercase tracking-widest opacity-40">This verifies that</p>
              <h2 className="text-5xl md:text-7xl font-black text-text-1 tracking-tighter leading-tight drop-shadow-2xl">
                {cert.recipientName}
              </h2>
            </div>
            <div className="max-w-xl mx-auto space-y-4 pt-4">
              <p className="text-[14px] font-medium text-text-2 leading-relaxed opacity-80">
                Has successfully completed the final quiz for the course:
              </p>
              <div className="px-8 py-6 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-border inline-block shadow-inner">
                <p className="text-xl md:text-2xl font-black text-text-1 tracking-tight leading-tight">
                  {cert.videoTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Vitals Matrix */}
          <div className="flex items-center gap-12 pt-8">
            <div className="text-center space-y-1">
              <p className="text-2xl font-black text-text-1 tracking-tighter">{cert.score}%</p>
              <p className="text-[9px] font-black text-text-3 uppercase tracking-widest opacity-50">Score</p>
            </div>
            <div className="w-px h-10 bg-border shadow-inner" />
            <div className="text-center space-y-1">
              <p className="text-[15px] font-black text-text-1 tracking-tight">{cert.issuerName}</p>
              <p className="text-[9px] font-black text-text-3 uppercase tracking-widest opacity-50">Instructor</p>
            </div>
            <div className="w-px h-10 bg-border shadow-inner" />
            <div className="text-center space-y-1">
              <p className="text-[15px] font-black text-text-1 tracking-tight">{issuedDate}</p>
              <p className="text-[9px] font-black text-text-3 uppercase tracking-widest opacity-50">Issue Date</p>
            </div>
          </div>

          {/* Integrity Seal */}
          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Account</span>
             </div>
             <p className="text-[9px] font-black text-text-3 uppercase tracking-widest opacity-30 font-mono">
               Certificate ID: {cert.certId}
             </p>
          </div>
        </div>
      </motion.div>

      {/* ── Integrity HUD ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-8 rounded-[48px] shadow-2xl flex items-center gap-6 print:hidden"
      >
        <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-lg font-black text-text-1 tracking-tight leading-tight">Certificate Verified</p>
          <p className="text-sm font-medium text-text-3">
            This certificate is an official record issued by EduShare and can be publicly verified.
          </p>
        </div>
        <button 
          onClick={() => router.push(`/profile/${cert.recipient?.firebaseUid}`)}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
        >
          View Profile
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </motion.div>
    </div>
  );
}

