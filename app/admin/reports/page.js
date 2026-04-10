"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  reviewed: "bg-blue-50 text-blue-600 border-blue-100",
  dismissed: "bg-zinc-50 text-zinc-500 border-zinc-100",
  actioned: "bg-red-50 text-red-600 border-red-100",
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
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Moderation Queue</h1>
        <p className="text-zinc-500 mt-1 text-sm">Review flagged content and take enforcement actions.</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {["pending", "reviewed", "dismissed", "actioned"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setLoading(true); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === s 
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                  : "text-zinc-500 hover:bg-stone-50 hover:text-zinc-900"
              }`}>
              {s}
            </button>
          ))}
        </div>
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">
          {reports.length} Reports Found
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="skeleton h-5 w-24 rounded-full" />
                <div className="skeleton h-4 w-12" />
              </div>
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="skeleton h-9 w-20 rounded-xl" />
                <div className="skeleton h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-24 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <p className="text-lg font-bold text-zinc-900">Queue Clear</p>
          <p className="text-sm text-zinc-400 mt-1">No {statusFilter} reports found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-list">
          {reports.map((r) => (
            <div key={r._id} className="card p-6 flex flex-col hover:border-zinc-300 transition-all group animate-fade-in">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                  <span className="badge bg-zinc-900 text-white text-[10px] uppercase font-bold tracking-wider">
                    {r.contentType}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {timeAgo(r.createdAt)}
                </span>
              </div>

              {/* Content Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 group/title">
                  <p className="text-base font-bold text-zinc-900 line-clamp-1">
                    {r.contentTitle || "Untitled Content"}
                  </p>
                  {r.status === "pending" && (
                    <Link href={`/${r.contentType}s/${r.contentId}`} target="_blank"
                      className="text-violet-600 opacity-0 group-hover/title:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </Link>
                  )}
                </div>
                {r.description && (
                  <p className="text-sm text-zinc-500 mt-2 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed">
                    "{r.description}"
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-zinc-500">
                  <span className="text-zinc-300">Reason:</span>
                  <span className="text-red-500 uppercase tracking-wider">{r.reason.replace("_", " ")}</span>
                </div>
              </div>

              {/* Reporter */}
              <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-700">
                    {r.reporter?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-zinc-600">{r.reporter?.name}</span>
                </div>
                
                {/* Actions */}
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(r._id, "dismissed", true)}
                      disabled={updating === r._id}
                      className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 transition-all"
                      title="Dismiss & Unflag">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    <button onClick={() => handleAction(r._id, "actioned")}
                      disabled={updating === r._id}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50">
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
