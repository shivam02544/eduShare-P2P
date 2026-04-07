"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function BoostButton({ type, id, boostedUntil, onBoosted }) {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const isBoosted = boostedUntil && new Date(boostedUntil) > new Date();

  const handleBoost = async () => {
    if (isBoosted) return;
    if (!confirm("Spend 20 credits to boost this content to the top of Explore for 24 hours?")) return;

    setLoading(true);
    const res = await authFetch("/api/boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setMsg(data.error);
      setTimeout(() => setMsg(""), 4000);
    } else {
      setMsg(data.message);
      onBoosted?.(data.boostedUntil);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button onClick={handleBoost} disabled={loading || isBoosted}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
          isBoosted
            ? "bg-violet-100 text-violet-700 border-violet-200 cursor-default"
            : "bg-stone-100 text-zinc-600 border-stone-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
        } disabled:opacity-60`}>
        {loading ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : "⚡"}
        {isBoosted ? "Boosted" : "Boost (20 cr)"}
      </button>
      {msg && <p className={`text-xs ${msg.includes("Error") || msg.includes("Need") ? "text-red-500" : "text-emerald-600"}`}>{msg}</p>}
      {isBoosted && (
        <p className="text-[11px] text-zinc-400">
          Until {new Date(boostedUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}
