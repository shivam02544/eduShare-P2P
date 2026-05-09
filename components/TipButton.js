"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Gift, Loader2 } from "lucide-react";

const AMOUNTS = [5, 10, 25, 50, 100];

export default function TipButton({ targetUid, targetName }) {
  const { user, authFetch } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(null);
  const [feedback, setFeedback] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Don't show on own profile
  if (user?.uid === targetUid) return null;

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
      setFeedback(`Sent ${amount} credits!`);
      setTimeout(() => { setFeedback(""); setOpen(false); }, 2000);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5
                   bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 hover:shadow-md dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/50">
        <Gift className="w-4 h-4" /> Tip
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-border p-4 z-50 animate-in fade-in slide-in-from-top-2 bg-white dark:bg-slate-900 shadow-xl">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Send credits to {targetName?.split(" ")[0]}
          </p>

          {feedback ? (
            <p className={`text-sm py-2 font-medium flex items-center gap-2 ${
              feedback.startsWith("Error") ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {feedback.startsWith("Error") ? null : <Gift className="w-4 h-4" />}
              {feedback}
            </p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {AMOUNTS.map((amount) => (
                <button key={amount} onClick={() => handleTip(amount)}
                  disabled={!!sending}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    sending === amount
                      ? "bg-amber-200 border-amber-300 text-amber-900 dark:bg-amber-700 dark:border-amber-600 dark:text-amber-100"
                      : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
                  } disabled:opacity-60`}>
                  {sending === amount ? (
                    <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                  ) : amount}
                </button>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-3">Credits are deducted from your balance</p>
        </div>
      )}
    </div>
  );
}
