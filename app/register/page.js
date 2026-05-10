"use client";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Fingerprint,
  Globe,
  Zap,
  ShieldCheck,
  ChevronLeft,
  MailCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import Logo from "@/components/Logo";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("reg_pending");
    if (saved) setPendingEmail(saved);
  }, []);

  const savePending = (val) => {
    if (val) sessionStorage.setItem("reg_pending", val);
    else sessionStorage.removeItem("reg_pending");
    setPendingEmail(val);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send email."); return; }
      savePending(email);
      await signOut(auth);
    } catch (err) {
      const map = {
        "auth/email-already-in-use": "Email already registered.",
        "auth/weak-password": "Password must be 6+ characters.",
        "auth/invalid-email": "Invalid email.",
      };
      setError(map[err.code] || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-up failed. Please try again.");
      }
    } finally {
      setGLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, name }),
      });
      if (res.ok) setResent(true);
    } catch {}
    setResending(false);
  };


  // ── Pending Email Verification View ──
  if (pendingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden py-24">

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
           <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[140px]" 
           />
           <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" 
           />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springConfig}
          className="w-full max-w-[520px] space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-6">
            <Logo showText={false} size="xl" className="mx-auto" />
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-text-1 tracking-tight uppercase">Validate <span className="text-accent">Node</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-4">Awaiting signal from your transmission queue</p>
            </div>
          </div>

          <div className="bg-surface-1 dark:bg-surface-2 border border-border p-12 rounded-[48px] shadow-2xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Sent-to info */}
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">Verification Sent To</p>
              <p className="text-xl font-black text-accent bg-accent/5 border border-accent/20 px-8 py-4 rounded-[24px] inline-block tracking-tight">{pendingEmail}</p>
            </div>

            {/* Steps */}
            <div className="space-y-6 bg-surface-2 dark:bg-surface-3 rounded-[32px] p-8 border border-border/50">
              {[
                { text: "Access your secure mailbox", icon: Mail },
                { text: "Authorize the verification token", icon: ShieldCheck },
                { text: "Return to the platform to synchronize", icon: Activity }
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-xl bg-accent text-bg flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-text-2 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <Link 
              href="/login" 
              onClick={() => savePending(null)}
              className="group/btn relative w-full overflow-hidden rounded-[24px] bg-text-1 text-bg p-6 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
            >
              <Zap className="w-6 h-6 group-hover/btn:scale-125 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize Auth Protocol</span>
              <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent/10 rounded-full blur-[40px] -z-0" />
            </Link>

            {/* Resend */}
            <div className="text-center">
              <button 
                onClick={handleResend} 
                disabled={resending || resent}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                  resent 
                    ? "text-emerald-500" 
                    : "text-text-4 hover:text-accent"
                }`}
              >
                {resending ? "Transmitting…" : resent ? "✓ Verification signal broadcasted" : "Signal lost? Resend Link"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }


  // ── Main Registration Form ──
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden py-24">
      
      {/* ── Background Decoration ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
         <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[140px]" 
         />
         <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" 
         />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfig}
        className="w-full max-w-[480px] space-y-12"
      >

        {/* ── Header ── */}
        <div className="text-center space-y-6">
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            <Logo showText={false} size="xl" className="mx-auto" />
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-text-1 tracking-tight uppercase">Register <span className="text-accent">Node</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-4">Initialize your contributor profile</p>
          </div>
        </div>

        <div className="bg-surface-1 dark:bg-surface-2 border border-border p-12 rounded-[48px] shadow-2xl space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Social Protocol */}
          <div className="space-y-6">
            <button 
              onClick={handleGoogle} 
              disabled={gLoading}
              className="group/google w-full flex items-center justify-center gap-4 py-5 rounded-[24px] bg-surface-2 dark:bg-surface-3 border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-1 hover:bg-surface-1 dark:hover:bg-surface-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {gLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5 group-hover/google:rotate-12 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Initialize with Google
            </button>

            <div className="flex items-center gap-6 px-2">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">Manual Config</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/5 border border-rose-500/20 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-inner"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-rose-500 leading-tight">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group/input">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-4 group-focus-within/input:text-accent transition-colors" />
                <input 
                  type="text" 
                  placeholder="FULL NAME" 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold text-text-1 placeholder:text-text-4 placeholder:opacity-40 focus:border-accent transition-all outline-none shadow-inner" 
                />
              </div>
              <div className="relative group/input">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-4 group-focus-within/input:text-accent transition-colors" />
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold text-text-1 placeholder:text-text-4 placeholder:opacity-40 focus:border-accent transition-all outline-none shadow-inner" 
                />
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-4 group-focus-within/input:text-accent transition-colors" />
                <input 
                  type="password" 
                  placeholder="SECRET KEY (MIN 6 CHARS)" 
                  required 
                  minLength={6}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold text-text-1 placeholder:text-text-4 placeholder:opacity-40 focus:border-accent transition-all outline-none shadow-inner" 
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-2 py-2">
               <ShieldAlert className="w-5 h-5 text-accent opacity-50" />
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-4 leading-relaxed">
                 A verification signal will be transmitted to your email to authorize account synchronization.
               </p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="group/btn relative w-full overflow-hidden rounded-[24px] bg-text-1 text-bg p-6 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />}
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{loading ? "Broadcasting..." : "Initialize Profile"}</span>
              </div>
              <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent/10 rounded-full blur-[40px] -z-0" />
            </button>
          </form>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">
            Identity already exists?{" "}
            <Link href="/login" className="text-accent border-b-2 border-accent/20 hover:border-accent transition-all ml-3 pb-1">Authorize Session</Link>
          </p>
        </motion.div>

        {/* ── Status Node ── */}
        <div className="pt-12 flex items-center justify-center gap-10 opacity-40">
           <div className="flex items-center gap-3">
              <Globe className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Global Network Active</span>
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-border" />
           <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">AES-256 Encrypted</span>
           </div>
        </div>

      </motion.div>
    </div>
  );
}
