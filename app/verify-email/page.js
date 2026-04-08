"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const called = useRef(false); // prevent StrictMode double-invoke

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    // Guard against React StrictMode calling useEffect twice
    if (called.current) return;
    called.current = true;

    // Decode in case the token was URL-encoded
    const decodedToken = decodeURIComponent(token);

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(decodedToken)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          setEmail(data.email || "");
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] animate-fade-up text-center">

        {status === "verifying" && (
          <>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: "var(--text-1)" }}>
              Verifying your email…
            </h1>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>Just a moment</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ color: "#22c55e" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: "var(--text-1)" }}>
              Email verified!
            </h1>
            {email && (
              <p className="text-sm mb-1" style={{ color: "var(--text-2)" }}>
                <span className="font-semibold" style={{ color: "var(--text-1)" }}>{email}</span> is now verified.
              </p>
            )}
            <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
              Redirecting to sign in…
            </p>
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
            </div>
            <Link href="/login" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
              Go to sign in now →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "#ef4444" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: "var(--text-1)" }}>
              Verification failed
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>{message}</p>
            <div className="flex flex-col gap-2">
              <Link href="/register" className="btn-primary w-full py-2.5 text-[13px] flex items-center justify-center">
                Register again
              </Link>
              <Link href="/login" className="btn-secondary w-full py-2.5 text-[13px] flex items-center justify-center">
                Back to sign in
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
