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
  CheckCircle2,
  MailCheck
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

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
      <div className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden py-20 pb-40">

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
           <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-emerald-200 dark:bg-emerald-500/10 rounded-full blur-[120px]" 
           />
           <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0], opacity: [0.05, 0.1, 0.05] }}
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
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative w-16 h-16 mx-auto"
            >
              <div className="w-16 h-16 rounded-[24px] bg-emerald-500 flex items-center justify-center mx-auto shadow-2xl border border-emerald-400/20">
                <MailCheck className="w-8 h-8 text-white" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-[24px] bg-emerald-500/30 blur-md"
              />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-text-1 tracking-tight uppercase">Check Your <span className="text-emerald-500">Inbox</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Verification link sent</p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-10 rounded-[48px] shadow-3xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Sent-to info */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-text-2">We sent a verification link to</p>
              <p className="text-base font-black text-text-1 bg-slate-50 dark:bg-white/5 border border-border px-6 py-3 rounded-2xl inline-block">{pendingEmail}</p>
            </div>

            {/* Steps */}
            <div className="space-y-4 bg-slate-50 dark:bg-white/5 rounded-3xl p-6 border border-border/50">
              {["Open the email from EduShare", "Click the verification link", "Come back and sign in"].map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-lg shadow-indigo-500/20">
                    {i + 1}
                  </div>
                  <p className="text-sm font-bold text-text-2">{s}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <Link 
              href="/login" 
              onClick={() => savePending(null)}
              className="group/btn relative w-full overflow-hidden rounded-[28px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
            >
              <Zap className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Go to Sign In</span>
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[40px] -z-0" />
            </Link>

            {/* Resend */}
            <div className="text-center">
              <button 
                onClick={handleResend} 
                disabled={resending || resent}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                  resent 
                    ? "text-emerald-500" 
                    : "text-text-3 hover:text-indigo-500"
                }`}
              >
                {resending ? "Sending…" : resent ? "✓ Verification email sent" : "Didn't get it? Resend email"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }


  // ── Main Registration Form ──
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

        {/* ── Header ── */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 rounded-[24px] bg-slate-900 dark:bg-white flex items-center justify-center mx-auto shadow-2xl border border-white/10"
          >
            <Sparkles className="w-8 h-8 text-white dark:text-slate-900" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-text-1 tracking-tight uppercase">Create <span className="text-indigo-500">Account</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Join EduShare and start sharing</p>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-10 rounded-[48px] shadow-3xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Social Protocol */}
          <div className="space-y-4">
            <button 
              onClick={handleGoogle} 
              disabled={gLoading}
              className="group/g w-full flex items-center justify-center gap-4 py-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-border text-[11px] font-black uppercase tracking-widest text-text-1 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {gLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5 group-hover/g:rotate-12 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Sign up with Google
            </button>

            <div className="flex items-center gap-4 px-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-3">or use email</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </div>

          <AnimatePresence mode="wait">
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group/input">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within/input:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
                />
              </div>
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within/input:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
                />
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 group-focus-within/input:text-indigo-500 transition-colors" />
                <input 
                  type="password" 
                  placeholder="Password (min 6 characters)" 
                  required 
                  minLength={6}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
                />
              </div>
            </div>

            <p className="text-[10px] font-medium text-text-3 px-2 opacity-60">
              A verification link will be sent to your email before you can sign in.
            </p>

            <button 
              type="submit" 
              disabled={loading} 
              className="group/btn relative w-full overflow-hidden rounded-[28px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-5 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />}
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">{loading ? "Creating Account..." : "Create Account"}</span>
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
            Already have an account?{" "}
            <Link href="/login" className="text-text-1 border-b border-text-1 hover:text-indigo-500 hover:border-indigo-500 transition-all ml-2 pb-0.5">Sign In</Link>
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
