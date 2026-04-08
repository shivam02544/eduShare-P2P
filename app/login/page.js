"use client";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const errorMap = {
  "auth/user-not-found": "No account with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/too-many-requests": "Too many attempts. Try later.",
  "auth/popup-closed-by-user": "Cancelled.",
};

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
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

      // Block unverified email/password accounts
      if (!user.emailVerified) {
        await signOut(auth);
        setUnverified(true);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(errorMap[err.code] || "Something went wrong.");
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
      setError(errorMap[err.code] || "Something went wrong.");
    } finally {
      setGLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setResent(false);
    try {
      // Use our nodemailer API — no Firebase sendEmailVerification
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] animate-fade-up">

        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--text-1)" }}>
            <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Sign in to your account</p>
        </div>

        <div className="card p-6 space-y-4">
          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 border"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-1)" }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-2)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}>
            {gLoading ? <Spinner /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Unverified email banner */}
          {unverified && (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                  style={{ color: "#d97706" }}>
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "#92400e" }}>Email not verified</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#b45309" }}>
                    Check your inbox and click the verification link before signing in.
                  </p>
                </div>
              </div>
              <button onClick={handleResend} disabled={resending || resent}
                className="w-full py-2 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: resent ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.15)",
                  color: resent ? "#16a34a" : "#92400e",
                  border: `1px solid ${resent ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                }}>
                {resending ? "Sending…" : resent ? "✓ Verification email sent" : "Resend verification email"}
              </button>
            </div>
          )}

          {error && (
            <div className="text-[13px] px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEmail} className="space-y-3">
            <input type="email" placeholder="Email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input text-[13px]" />
            <input type="password" placeholder="Password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input text-[13px]" />
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-[13px]">
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span> : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] mt-4" style={{ color: "var(--text-2)" }}>
          No account?{" "}
          <Link href="/register" className="font-medium" style={{ color: "var(--text-1)" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
