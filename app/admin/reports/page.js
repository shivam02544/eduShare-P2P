"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  dismissed: "bg-text-4/10 text-text-4 border-text-4/20",
  actioned: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminReportsPage() {
  const { authFetch } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [updating, setUpdating] = useState(null);

  const fetchReports = () => {
    authFetch(`/api/admin/reports?status=${statusFilter}`)
      .then((r) => r.json())
      .then((d) => { if (d) { setReports(d || []); setLoading(false); } });
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleAction = async (reportId, status, unflag = false) => {
    if (status === "actioned" && !confirm("Warning: This will permanently delete the content and notify the user. Are you sure?")) return;
    
    setUpdating(reportId);
    const res = await authFetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status, unflag }),
    });
    setUpdating(null);
    if (res.ok) fetchReports();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-text-1 tracking-tight">Moderation <span className="text-accent">Queue</span></h1>
        <p className="text-text-4 text-sm font-medium">Review flagged content and take enforcement actions.</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 bg-surface-1 p-4 rounded-3xl border border-border shadow-xl">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {["pending", "reviewed", "dismissed", "actioned"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setLoading(true); }}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                statusFilter === s 
                  ? "bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-[1.02]" 
                  : "text-text-4 border-transparent hover:bg-surface-2 hover:text-text-2"
              }`}>
              {s}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-bold text-text-4 uppercase tracking-[0.2em] hidden sm:block px-4">
          {reports.length} Reports Found
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-surface-1 border border-border p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="skeleton h-5 w-24 rounded-full bg-surface-3" />
                <div className="skeleton h-4 w-12 bg-surface-3" />
              </div>
              <div className="skeleton h-5 w-3/4 bg-surface-3 rounded-lg" />
              <div className="skeleton h-4 w-1/2 bg-surface-3 rounded-lg" />
              <div className="flex gap-2 pt-2">
                <div className="skeleton h-9 w-20 rounded-xl bg-surface-3" />
                <div className="skeleton h-9 w-24 rounded-xl bg-surface-3" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-32 bg-surface-1/50 rounded-[40px] border border-dashed border-border">
          <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-6 text-text-4 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-text-1">Queue Clear</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-4 mt-2">No {statusFilter} reports found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
          {reports.map((r) => (
            <div key={r._id} className="bg-surface-1 border border-border p-6 flex flex-col hover:border-accent/30 transition-all group animate-fade-in rounded-3xl shadow-sm hover:shadow-2xl">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-3 text-text-2 border border-border text-[9px] uppercase font-bold tracking-wider">
                    {r.contentType}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-text-4 uppercase tracking-[0.2em]">
                  {timeAgo(r.createdAt)}
                </span>
              </div>

              {/* Content Info */}
              <div className="mb-4">
               <div className="flex items-center gap-2 group/title">
                  <p className="text-base font-bold text-text-1 tracking-tight line-clamp-1 group-hover:text-accent transition-colors">
                    {r.contentTitle || "Untitled Content"}
                  </p>
                  {r.status === "pending" && (
                    <Link href={`/${r.contentType}s/${r.contentId}`} target="_blank"
                      className="text-accent opacity-0 group-hover/title:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </Link>
                  )}
                </div>
                 {r.description && (
                  <p className="text-sm text-text-2 mt-4 bg-surface-2 p-4 rounded-2xl border border-border leading-relaxed italic shadow-inner">
                    "{r.description}"
                  </p>
                )}
                 <div className="flex items-center gap-2 mt-6 text-[10px] font-bold text-text-4 uppercase tracking-widest">
                  <span className="opacity-50">Reason:</span>
                  <span className="text-rose-500">{r.reason.replace("_", " ")}</span>
                </div>
              </div>

               {/* Reporter */}
              <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-surface-3 flex items-center justify-center text-[10px] font-bold text-accent shadow-sm">
                    {r.reporter?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-text-2">{r.reporter?.name}</span>
                </div>
                
                 {/* Actions */}
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(r._id, "dismissed", true)}
                      disabled={updating === r._id}
                      className="p-3 rounded-xl border border-border text-text-4 hover:text-text-1 hover:bg-surface-2 transition-all shadow-sm active:scale-95"
                      title="Dismiss & Unflag">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    <button onClick={() => handleAction(r._id, "actioned")}
                      disabled={updating === r._id}
                      className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50">
                      Take Action
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
