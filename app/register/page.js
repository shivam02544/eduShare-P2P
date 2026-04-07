"use client";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const errorMap = {
  "auth/email-already-in-use": "Email already registered.",
  "auth/weak-password": "Password must be 6+ characters.",
  "auth/invalid-email": "Invalid email.",
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.name });
      router.push("/dashboard");
    } catch (err) { setError(errorMap[err.code] || "Something went wrong."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGLoading(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) { setError(errorMap[err.code] || "Something went wrong."); }
    finally { setGLoading(false); }
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
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Join EduShare and start sharing</p>
        </div>

        <div className="card p-6 space-y-4">
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
            Sign up with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[11px]" style={{ color: "var(--text-3)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {error && (
            <div className="text-[13px] px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            <input type="text" placeholder="Full name" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input text-[13px]" />
            <input type="email" placeholder="Email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input text-[13px]" />
            <input type="password" placeholder="Password (min 6)" required minLength={6}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input text-[13px]" />
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-[13px]">
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Creating…</span> : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] mt-4" style={{ color: "var(--text-2)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--text-1)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
