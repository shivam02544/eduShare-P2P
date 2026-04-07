"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "copyright", label: "Copyright violation" },
  { value: "misinformation", label: "Misinformation" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "other", label: "Other" },
];

export default function ReportButton({ contentType, contentId, compact = false }) {
  const { user, authFetch } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSubmit = async () => {
    if (!user) { router.push("/login"); return; }
    if (!reason) return setError("Please select a reason");
    setSubmitting(true); setError("");

    const res = await authFetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, contentId, reason, description }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) { setError(data.error); return; }
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); setReason(""); setDescription(""); }, 2500);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { if (!user) { router.push("/login"); return; } setOpen(!open); }}
        className={`flex items-center gap-1.5 text-zinc-400 hover:text-red-500 transition-colors ${
          compact ? "text-xs" : "text-sm"
        }`}
        title="Report content">
        <svg className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>
        </svg>
        {!compact && "Report"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border py-4 px-4 z-50 animate-slide-down space-y-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)",
                   boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>

          {done ? (
            <div className="text-center py-3">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Report submitted
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Thank you for keeping EduShare safe.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                Report {contentType}
              </p>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                {REASONS.map((r) => (
                  <label key={r.value}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                      reason === r.value
                        ? "bg-red-50 border border-red-200"
                        : "hover:bg-stone-50 border border-transparent"
                    }`}>
                    <input type="radio" name="reason" value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="w-3.5 h-3.5 accent-red-500" />
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{r.label}</span>
                  </label>
                ))}
              </div>

              {/* Optional description */}
              <textarea
                placeholder="Additional details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
                className="input resize-none text-xs"
              />

              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="btn-secondary flex-1 text-xs py-2">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting || !reason}
                  className="flex-1 text-xs py-2 rounded-xl font-medium bg-red-500 text-white
                             hover:bg-red-600 transition-colors disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
