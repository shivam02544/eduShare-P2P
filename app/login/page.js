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
  Fingerprint,
  Globe,
  Zap,
  ShieldAlert,
  ChevronLeft
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

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
    <div className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden py-20 pb-40">
      
      {/* ── Background Decoration ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
         <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-slate-200 dark:bg-white/5 rounded-full blur-[120px]" 
         />
         <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-200 dark:bg-indigo-500/10 rounded-full blur-[100px]" 
         />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="w-full max-w-[440px] space-y-10"
      >

        {/* ── Header HUD ── */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 rounded-[24px] bg-slate-900 dark:bg-white flex items-center justify-center mx-auto shadow-2xl border border-white/10"
          >
            <Fingerprint className="w-8 h-8 text-white dark:text-slate-900" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-text-1 tracking-tight uppercase">Account <span className="text-indigo-500">Login</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Secure access to EduShare</p>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-10 rounded-[48px] shadow-3xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Social Protocol */}
          <div className="space-y-4">
            <button 
              onClick={handleGoogle} 
              disabled={gLoading}
              className="group w-full flex items-center justify-center gap-4 py-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-border text-[11px] font-black uppercase tracking-widest text-text-1 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {gLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue via Google
            </button>

            <div className="flex items-center gap-4 px-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-3">or use email credentials</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {unverified && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 space-y-4 shadow-inner"
              >
                <div className="flex items-start gap-4">
                  <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
                   <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-500">Verification Required</p>
                    <p className="text-[10px] font-medium text-amber-500/80 leading-relaxed">
                      Check your email inbox and confirm your account before signing in.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleResend} 
                  disabled={resending || resent}
                  className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    resent 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}
                >
                  {resending ? "Sending…" : resent ? "✓ Verification email sent" : "Resend verification email"}
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/5 border border-rose-500/20 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-inner"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Protocol */}
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="group relative w-full overflow-hidden rounded-[28px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-5 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Sign In</span>
              </div>
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[40px] -z-0" />
            </button>
          </form>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">
            New user?{" "}
            <Link href="/register" className="text-text-1 border-b border-text-1 hover:text-indigo-500 hover:border-indigo-500 transition-all ml-2 pb-0.5">Create Account</Link>
          </p>
        </motion.div>

        {/* ── Infrastructure Node ── */}
        <div className="pt-10 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
           <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">System Online</span>
           </div>
           <span className="w-1 h-1 rounded-full bg-border" />
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-widest">Secure Connection</span>
           </div>
        </div>

      </motion.div>
    </div>
  );
}

