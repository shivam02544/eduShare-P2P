"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AMOUNTS = [5, 10, 25, 50, 100];

export default function TipButton({ targetUid, targetName }) {
  const { user, authFetch } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(null);
  const [feedback, setFeedback] = useState("");
  const ref = useRef(null);

  // Don't show on own profile
  if (user?.uid === targetUid) return null;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleTip = async (amount) => {
    if (!user) { router.push("/login"); return; }
    setSending(amount);
    const res = await authFetch(`/api/users/${targetUid}/tip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    setSending(null);
    if (data.error) {
      setFeedback(`Error: ${data.error}`);
    } else {
      setFeedback(`🎁 Sent ${amount} credits!`);
      setTimeout(() => { setFeedback(""); setOpen(false); }, 2000);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                   bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all">
        🎁 Tip
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-stone-200 p-4 z-50 animate-slide-down"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
                   boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Send credits to {targetName?.split(" ")[0]}
          </p>

          {feedback ? (
            <p className={`text-sm text-center py-2 font-medium ${
              feedback.startsWith("Error") ? "text-red-600" : "text-emerald-600"
            }`}>{feedback}</p>
          ) : (
            <div className="grid grid-cols-5 gap-1.5">
              {AMOUNTS.map((amount) => (
                <button key={amount} onClick={() => handleTip(amount)}
                  disabled={!!sending}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    sending === amount
                      ? "bg-amber-200 border-amber-300 text-amber-800"
                      : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                  } disabled:opacity-60`}>
                  {sending === amount ? (
                    <svg className="w-3 h-3 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : amount}
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-zinc-400 text-center mt-2">Credits are deducted from your balance</p>
        </div>
      )}
    </div>
  );
}
