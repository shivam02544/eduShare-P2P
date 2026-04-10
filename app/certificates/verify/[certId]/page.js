"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Award, User, ExternalLink, ChevronLeft, Zap, CheckCircle2 } from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function VerifyCertificatePage() {
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
    <div className="max-w-xl mx-auto text-center py-32 space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse mx-auto" />
      <div className="h-6 w-48 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse mx-auto" />
      <div className="h-4 w-64 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse mx-auto opacity-50" />
    </div>
  );

  const isValid = result?.valid;

  return (
    <div className="max-w-2xl mx-auto py-24 px-6 md:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="space-y-10"
      >
        {/* ── Status HUD ── */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springConfig, delay: 0.1 }}
            className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl relative ${
              isValid ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}
          >
             {isValid ? <ShieldCheck className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12" />}
             <div className={`absolute -inset-4 rounded-full blur-2xl -z-10 opacity-30 ${
               isValid ? "bg-emerald-500" : "bg-rose-500"
             }`} />
          </motion.div>
          
          <div className="space-y-3">
            <h1 className={`text-4xl font-black tracking-tighter ${isValid ? "text-emerald-500" : "text-rose-500"}`}>
              {isValid ? "Verified Successfully" : "Verification Failed"}
            </h1>
            <p className="text-sm font-medium text-text-3 max-w-sm mx-auto">
              {isValid 
                ? "This certificate is valid and was issued by the EduShare platform." 
                : "The provided certificate ID could not be found or has been removed."}
            </p>
          </div>
        </div>

        {isValid && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-10 rounded-[48px] shadow-3xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { label: "Recipient name", value: result.recipientName, icon: User },
                { label: "Final Score", value: `${result.score}% Score`, icon: Zap },
                { label: "Course Title", value: result.videoTitle, icon: Award },
                { label: "Instructor", value: result.issuerName, icon: ShieldCheck },
                { label: "Certificate ID", value: result.certId, icon: ExternalLink, mono: true },
                { label: "Issue date", value: new Date(result.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex items-center gap-2 opacity-40">
                    <item.icon className="w-3.5 h-3.5 text-text-1" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-1">{item.label}</p>
                  </div>
                  <p className={`text-sm font-black text-text-1 tracking-tight leading-snug ${item.mono ? 'font-mono' : ''}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row gap-4">
              <Link href={`/certificates/${result.certId}`} 
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all"
              >
                View Certificate
              </Link>
              <Link href={`/profile/${result.recipient?.firebaseUid}`} 
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border text-[11px] font-black uppercase tracking-widest text-text-1 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                Recipient Profile
              </Link>
            </div>
          </motion.div>
        )}

        <div className="flex justify-center pt-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black text-text-3 uppercase tracking-widest hover:text-text-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

