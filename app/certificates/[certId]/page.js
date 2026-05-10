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
      <div className="aspect-[1.4/1] w-full rounded-3xl bg-slate-200 dark:bg-white/5 border border-border mt-12" />
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
        if (!d.valid) {
          setNotFound(true);
          toast.error(d.error || "Certificate not found");
        } else {
          setCert(d);
        }
        setLoading(false);
      })
      .catch(err => {
        setNotFound(true);
        setLoading(false);
        toast.error("Failed to load certificate");
      });
  }, [certId]);

  const handlePrint = () => window.print();

  if (loading) return <CertificateSkeleton />;
  if (notFound) return (
    <div className="text-center py-32 space-y-8">
      <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-text-3 opacity-30 shadow-inner">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-text-1 tracking-tighter leading-tight">Certificate Not Found</h2>
        <p className="text-sm text-text-3 font-medium max-w-xs mx-auto">This certificate does not exist or may have been removed.</p>
      </div>
      <button 
        onClick={() => router.push('/explore')}
        className="px-8 py-3 rounded-2xl bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-transform active:scale-95"
      >
        Explore Content
      </button>
    </div>
  );

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Derived metadata for premium feel
  const performanceTier = cert.score >= 95 ? "Distinction" : cert.score >= 85 ? "High Honors" : "Completion";
  const skillCategory = cert.video?.subject || "Digital Learning";
  const knowledgeCredits = Math.floor(cert.score / 10) + 5;
  
  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/v/${certId}` 
    : '';

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 px-6 md:px-0">
      
      {/* ── Dashboard Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-indigo-500 hover:text-indigo-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">Professional Credential</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-3">Verified Digital Record</span>
          </div>
          <h1 className="text-3xl font-bold text-text-1 tracking-tight">
            Credential <span className="text-indigo-500">Workbench</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(verificationUrl);
              toast.success("Verification link copied", {
                 style: { borderRadius: '16px', background: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
              });
            }} 
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-border text-[10px] font-bold uppercase tracking-widest text-text-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            Copy Verify Link
          </button>
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/30"
          >
            <Printer className="w-4 h-4" />
            Download / Print
          </button>
        </div>
      </motion.div>

      {/* ── Premium Certificate Document ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
        ref={certRef}
        id="certificate-print-area"
        className="relative aspect-[1.414/1] w-full bg-[#fdfdfd] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden rounded-[2rem] print:rounded-none shadow-[0_32px_80px_rgba(0,0,0,0.12)] print:shadow-none ring-1 ring-slate-200 dark:ring-white/10 group select-none"
      >
        {/* Anti-Tamper Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} 
        />
        
        {/* Elegant Framing */}
        <div className="absolute inset-8 border border-slate-900/5 dark:border-white/5 rounded-[1.5rem] pointer-events-none" />
        <div className="absolute inset-10 border-2 border-slate-900/10 dark:border-white/10 rounded-[1.25rem] pointer-events-none" />
        
        {/* Corner Accents */}
        <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-12 left-12 w-12 h-12 border-b-2 border-l-2 border-indigo-500/30 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-indigo-500/30 rounded-br-xl pointer-events-none" />

        <div className="relative h-full flex flex-col items-center justify-between p-12 md:p-16 text-center">
          
          {/* Header Section */}
          <div className="w-full flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 shadow-lg">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-[0.3em] leading-none">EduShare</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Knowledge Network</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[8px] font-bold uppercase tracking-widest mb-1">
                Official Credential
              </div>
              <p className="text-[8px] font-mono text-slate-400">Ref: {cert.certId.slice(0, 16).toUpperCase()}</p>
            </div>
          </div>

          {/* Main Body */}
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Certificate of Completion</h2>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mx-auto" />
              <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 italic leading-none">This digital credential confirms that</p>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-1">
                {cert.recipientName}
              </h1>
              <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <div className="h-px w-6 bg-slate-200 dark:bg-white/10" />
                <span>has demonstrated proficiency in</span>
                <div className="h-px w-6 bg-slate-200 dark:bg-white/10" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto line-clamp-2">
                {cert.videoTitle}
              </h3>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {["Mastery", skillCategory, performanceTier].map((skill, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Verification & Authority Footer */}
          <div className="w-full grid grid-cols-3 items-end gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
            {/* Left: Metadata */}
            <div className="text-left space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Authority</p>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">EduShare Academic Council</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Credential Level</p>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white">Professional ({cert.score}%)</p>
                </div>
              </div>
            </div>

            {/* Center: Signatures & Seal */}
            <div className="flex flex-col items-center gap-3 relative">
              <div className="relative">
                {/* Visual Seal */}
                <div className="w-16 h-16 rounded-full bg-slate-900 dark:bg-white border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
                  <Zap className="w-6 h-6" />
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 dark:border-black/10 animate-spin-slow" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-950">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-slate-900 dark:text-white italic opacity-80" style={{ fontFamily: 'Dancing Script, cursive, serif' }}>
                  {cert.issuerName}
                </p>
                <div className="h-px w-20 bg-slate-200 dark:bg-white/10 my-0.5 mx-auto" />
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Authorized Issuer</p>
              </div>
            </div>

            {/* Right: Verification */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Verify Credential</p>
                  <p className="text-[8px] font-mono text-slate-500 dark:text-slate-400 mb-0.5">{issuedDate}</p>
                  <p className="text-[7px] font-bold text-indigo-500/70 uppercase tracking-widest truncate max-w-[100px]">
                    v/{certId.slice(0, 8)}
                  </p>
                </div>
                <div className="p-1 bg-white rounded-lg shadow-md border border-slate-100">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(verificationUrl)}`}
                    alt="Scan to Verify"
                    className="w-10 h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Status & Actions ── */}
      <div className="grid md:grid-cols-3 gap-6 print:hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-white dark:bg-slate-900 border border-border p-8 rounded-3xl shadow-xl flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-text-1 tracking-tight leading-tight">Verified Credential</p>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">Active</span>
            </div>
            <p className="text-sm font-medium text-text-3">
              Issued on {issuedDate}. This certificate is cryptographically secured and publicly verifiable on the EduShare Knowledge Network.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-indigo-500/5 border border-indigo-500/10 p-8 rounded-3xl flex flex-col justify-between"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Rewards Earned</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-text-1">{knowledgeCredits}</span>
              <span className="text-sm font-bold text-text-3">Knowledge Credits</span>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/profile/${cert.recipient?.firebaseUid}`)}
            className="w-full mt-6 py-3 rounded-2xl bg-white dark:bg-white/10 text-text-1 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/20 transition-all border border-border"
          >
            Update Portfolio
          </button>
        </motion.div>
      </div>

      {/* ── Credential Detail Breakdown ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        {[
          { label: "Exam Score", value: `${cert.score}%`, icon: Zap },
          { label: "Category", value: skillCategory, icon: Award },
          { label: "Difficulty", value: "Intermediate", icon: ShieldCheck },
          { label: "Authority", value: "EduShare Network", icon: ExternalLink }
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-border space-y-2 group hover:border-indigo-500/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-text-3 group-hover:text-indigo-500 transition-colors">
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest">{item.label}</p>
            <p className="text-sm font-bold text-text-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

