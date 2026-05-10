"use client";
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ChevronLeft,
  Zap,
  Globe,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import Logo from "@/components/Logo";

const springConfig = { type: "spring", stiffness: 300, damping: 30 };

const errorMap = {
  "auth/user-not-found": "User not found. Please check your email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid credentials. Please try again.",
  "auth/too-many-requests": "Too many requests. Please try again later.",
  "auth/popup-closed-by-user": "Login cancelled.",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const formId = React.useId();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  
  // Unverified state
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setUnverified(false);
    try {
      const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);

      if (!user.emailVerified) {
        await signOut(auth);
        setUnverified(true);
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(errorMap[err.code] || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) {
      setError(errorMap[err.code] || "Google sign-in failed. Please try again.");
    } finally {
      setGLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setResent(false);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, name: "" }),
      });
      if (res.ok) setResent(true);
    } catch {
      // silent
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden py-24">
      
      {/* ── Background Decoration ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
         <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[140px]" 
         />
         <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
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
            <h1 className="text-4xl font-black text-text-1 tracking-tight uppercase">Protocol <span className="text-accent">Access</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-4">Enter credentials for secure synchronization</p>
          </div>
        </div>

        <div className="bg-surface-1 dark:bg-surface-2 border border-border p-12 rounded-[40px] shadow-2xl space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Social login */}
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">Local Auth</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {unverified && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-500/5 border border-amber-500/20 rounded-[32px] p-8 space-y-6 shadow-inner"
              >
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6 text-amber-500" />
                  </div>
                   <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Identity Pending</p>
                    <p className="text-xs font-medium text-amber-500/80 leading-relaxed">
                      Your digital identity requires verification. Please check your transmission queue (inbox).
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleResend} 
                  disabled={resending || resent}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    resent 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                  }`}
                >
                  {resending ? "Transmitting…" : resent ? "✓ Verification Re-sent" : "Resend Link"}
                </button>
              </motion.div>
            )}

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

          {/* Login form */}
          <form onSubmit={handleEmail} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group/input">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-4 group-focus-within/input:text-accent transition-colors" />
                <input
                  type="email"
                  placeholder="IDENTITY EMAIL"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold text-text-1 placeholder:text-text-4 placeholder:opacity-40 focus:border-accent transition-all outline-none shadow-inner"
                />
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-4 group-focus-within/input:text-accent transition-colors" />
                <input
                  type="password"
                  placeholder="SECURITY KEY"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-[24px] pl-16 pr-8 py-5 text-sm font-bold text-text-1 placeholder:text-text-4 placeholder:opacity-40 focus:border-accent transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group/btn relative w-full overflow-hidden rounded-[24px] bg-text-1 text-bg p-6 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />}
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {loading ? "Authenticating…" : "Authorize Session"}
                </span>
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
            New Identity Required?{" "}
            <Link href="/register" className="text-accent border-b-2 border-accent/20 hover:border-accent transition-all ml-3 pb-1">Register Node</Link>
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
