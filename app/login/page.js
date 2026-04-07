"use client";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const errorMap = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/popup-closed-by-user": "Sign-in cancelled.",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/dashboard");
    } catch (err) { setError(errorMap[err.code] || "Something went wrong."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) { setError(errorMap[err.code] || "Something went wrong."); }
    finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="fixed top-20 left-1/3 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)", filter: "blur(50px)" }} />

      <div className="w-full max-w-sm animate-scale-in">
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="w-11 h-11 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900">Welcome back</h1>
            <p className="text-zinc-400 text-sm mt-1">Sign in to your EduShare account</p>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 border border-stone-200 bg-white
                       py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-stone-50
                       transition-colors mb-4 shadow-sm disabled:opacity-60">
            {googleLoading ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-zinc-400">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleEmail} className="space-y-3">
            <input type="email" placeholder="Email address" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input" />
            <input type="password" placeholder="Password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input" />
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in...</span> : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-5">
            No account?{" "}
            <Link href="/register" className="text-zinc-700 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
