"use client";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";


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
  const [pendingEmail, setPendingEmail] = useState(null);
  const [resent, setResent] = useState(false);

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
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-up failed. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    try {
      await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, name }),
      });
      setResent(true);
    } catch {}
  };


  if (pendingEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "var(--accent)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-10"
              style={{ background: "var(--accent)" }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-1)" }}>Check your inbox</h1>
          <p className="text-sm mb-1" style={{ color: "var(--text-2)" }}>Verification link sent to</p>
          <p className="text-sm font-semibold mb-6" style={{ color: "var(--text-1)" }}>{pendingEmail}</p>
          <div className="card p-5 text-left space-y-3 mb-5">
            {["Open the email from EduShare", "Click the verification link", "Come back and sign in"].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--accent-2)", color: "var(--accent)" }}>{i + 1}</div>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>{s}</p>
              </div>
            ))}
          </div>
          <Link href="/login" onClick={() => savePending(null)}
            className="btn-primary w-full py-2.5 text-sm mb-3 flex items-center justify-center">
            Go to sign in
          </Link>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span style={{ color: "var(--text-3)" }}>Didn't get it?</span>
            <button onClick={handleResend} disabled={resent}
              style={{ color: resent ? "#22c55e" : "var(--accent)" }}>
              {resent ? "Sent" : "Resend"}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--text-1)" }}>
            <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Join EduShare and start sharing</p>
        </div>
        <div className="card p-6 space-y-4">
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium border"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-1)" }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-3)" }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          {error && (
            <p className="text-sm px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Full name" required value={name}
              onChange={(e) => setName(e.target.value)} className="input text-sm" />
            <input type="email" placeholder="Email" required value={email}
              onChange={(e) => setEmail(e.target.value)} className="input text-sm" />
            <input type="password" placeholder="Password (min 6)" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)} className="input text-sm" />
            <p className="text-xs px-1" style={{ color: "var(--text-3)" }}>
              A verification link will be sent before you can sign in.
            </p>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: "var(--text-2)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--text-1)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
