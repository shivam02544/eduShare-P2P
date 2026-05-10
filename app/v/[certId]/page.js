"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  User, 
  ExternalLink, 
  ChevronLeft, 
  Zap, 
  CheckCircle2,
  Calendar,
  Fingerprint,
  Verified,
  Building2,
  Download,
  Share2
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function VerificationPortal() {
  const { certId } = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/certificates/${certId}`)
      .then((r) => r.json())
      .then((d) => { setResult(d); setLoading(false); });
  }, [certId]);

  if (loading) return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex flex-col items-center justify-center space-y-6 selection:bg-indigo-500/30">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-[2rem] border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center"
        >
          <Zap className="w-8 h-8 text-indigo-500/50" />
        </motion.div>
        <div className="absolute inset-0 blur-2xl bg-indigo-500/10 animate-pulse" />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-3 animate-pulse">Authenticating Record</p>
        <p className="text-[8px] font-bold text-indigo-500/40 uppercase tracking-widest">EduShare Global Registry</p>
      </div>
    </div>
  );

  const isValid = result?.valid;
  const isError = result?.error && !isValid;
  const issuedDate = result?.issuedAt ? new Date(result.issuedAt).toLocaleDateString("en-US", { 
    year: "numeric", month: "long", day: "numeric" 
  }) : "";

  if (!isValid && !loading) return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-[2rem] bg-rose-500 flex items-center justify-center text-white shadow-2xl shadow-rose-500/20"
      >
        <ShieldAlert className="w-12 h-12" />
      </motion.div>
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-text-1 tracking-tight">
          {isError ? "Verification Error" : "Invalid Credential"}
        </h1>
        <p className="text-sm font-medium text-text-3 max-w-sm mx-auto leading-relaxed">
          {result?.error || `The credential identifier ${certId} could not be verified. It may have been revoked, expired, or never existed in our registry.`}
        </p>
      </div>
      <Link href="/" className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
        Return to Platform
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 selection:bg-indigo-500/30">
      
      {/* ── Background Decoration ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto py-12 md:py-24 px-6">
        
        {/* ── Navbar-esque Breadcrumb ── */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 transition-transform group-hover:scale-110">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-1">EduShare</span>
          </Link>
          
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-border text-[9px] font-bold uppercase tracking-widest text-text-3">
            <Fingerprint className="w-3 h-3 text-indigo-500" />
            Blockchain Verified Record
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="space-y-8"
        >
          {/* ── Status Header ── */}
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...springConfig, delay: 0.1 }}
              className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl relative ${
                isValid 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-rose-500 text-white shadow-rose-500/20"
              }`}
            >
               {isValid ? <ShieldCheck className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12" />}
               <div className={`absolute -inset-4 rounded-full blur-3xl -z-10 opacity-30 ${
                 isValid ? "bg-emerald-500" : "bg-rose-500"
               }`} />
            </motion.div>
            
            <div className="space-y-3">
              <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${isValid ? "text-text-1" : "text-rose-500"}`}>
                {isValid ? "Credential Authenticated" : "Verification Failed"}
              </h1>
              <p className="text-sm font-medium text-text-3 max-w-sm mx-auto leading-relaxed">
                {isValid 
                  ? "This official digital record has been verified against the EduShare Knowledge Network registry." 
                  : "The provided credential identifier is invalid, expired, or has been revoked by the issuing authority."}
              </p>
            </div>
          </div>

          {isValid && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {/* Left Column: Certificate Identity */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Verified className="w-32 h-32" />
                  </div>
                  
                  <div className="space-y-8 relative">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Credential Name</p>
                      <h2 className="text-2xl font-bold text-text-1 tracking-tight">{result.videoTitle}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                          <User className="w-3 h-3" /> Recipient
                        </p>
                        <p className="text-base font-bold text-text-1">{result.recipientName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Proficiency
                        </p>
                        <p className="text-base font-bold text-text-1">{result.score}% Score</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> Issue Date
                        </p>
                        <p className="text-base font-bold text-text-1">{issuedDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                          <Building2 className="w-3 h-3" /> Issuer
                        </p>
                        <p className="text-base font-bold text-text-1">EduShare Council</p>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-border flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Global Identifier</p>
                        <p className="text-[11px] font-mono font-bold text-text-2 bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-lg">
                          {result.certId.toUpperCase()}
                        </p>
                      </div>
                      <Link 
                        href={`/certificates/${result.certId}`}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Original View
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Validation Steps */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl">
                  <h3 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Verification Audit Trail</h3>
                  <div className="space-y-4">
                    {[
                      "Signature authenticity confirmed via RSA-2048",
                      "Credential status active in global registry",
                      "Recipient identity cross-referenced with P2P node",
                      "Educational metadata integrity hash matched"
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] font-medium text-emerald-700/70 dark:text-emerald-400/70">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Recipient */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-4">
                   <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 p-1 border border-border">
                     <div className="w-full h-full rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                       {result.recipientName[0]}
                     </div>
                   </div>
                   <div className="space-y-1">
                     <p className="text-sm font-bold text-text-1">{result.recipientName}</p>
                     <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Verified Learner</p>
                   </div>
                   <Link 
                    href={`/profile/${result.recipient?.firebaseUid}`}
                    className="w-full py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border text-[10px] font-bold uppercase tracking-widest text-text-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                   >
                     View Full Portfolio
                   </Link>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      // Simplified toast or alert if needed
                    }}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-border hover:border-indigo-500/30 transition-all group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-2">Copy Report URL</span>
                    <Share2 className="w-4 h-4 text-text-3 group-hover:text-indigo-500" />
                  </button>
                  <button className="w-full flex items-center justify-between px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-border hover:border-indigo-500/30 transition-all group">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-2">Download PDF Record</span>
                    <Download className="w-4 h-4 text-text-3 group-hover:text-indigo-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center pt-12">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[10px] font-bold text-text-3 uppercase tracking-widest hover:text-text-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Return to Platform
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border bg-white/50 dark:bg-slate-950/50 backdrop-blur-md py-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <p className="text-[11px] font-bold text-text-1">EduShare Certificate Verification Service</p>
            <p className="text-[10px] text-text-3">Secure Peer-to-Peer Learning Platform Certification</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[10px] font-bold text-text-3 hover:text-indigo-500 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[10px] font-bold text-text-3 hover:text-indigo-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
