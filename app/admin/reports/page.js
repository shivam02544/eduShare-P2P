"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  pending:   "bg-amber-100 text-amber-800 border-amber-200",
  reviewed:  "bg-blue-100 text-blue-800 border-blue-200",
  dismissed: "bg-zinc-100 text-zinc-600 border-zinc-200",
  actioned:  "bg-red-100 text-red-700 border-red-200",
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminReportsPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [updating, setUpdating] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const fetchReports = () => {
    authFetch(`/api/admin/reports?status=${statusFilter}`)
      .then((r) => {
        if (r.status === 403) { setForbidden(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setReports(d); setLoading(false); } });
  };

  useEffect(() => { if (user) fetchReports(); }, [user, statusFilter]);

  const handleAction = async (reportId, status, unflag = false) => {
    setUpdating(reportId);
    await authFetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status, unflag }),
    });
    setUpdating(null);
    fetchReports();
  };

  if (forbidden) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-3">🚫</p>
      <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Access Denied</p>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
        You need admin privileges to view this page.
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            🛡 Admin — Reports
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {reports.length} {statusFilter} reports
          </p>
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5">
          {["pending", "reviewed", "dismissed", "actioned"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setLoading(true); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border ${
                statusFilter === s ? "bg-zinc-900 text-white border-zinc-900" : "border-stone-200 text-zinc-600 hover:bg-stone-50"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-64" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium">No {statusFilter} reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge border text-xs ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                  <span className="badge bg-stone-100 text-zinc-600 border border-stone-200 text-xs capitalize">
                    {r.contentType}
                  </span>
                  <span className="badge bg-stone-100 text-zinc-600 border border-stone-200 text-xs capitalize">
                    {r.reason.replace("_", " ")}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {timeAgo(r.createdAt)}
                </span>
              </div>

              {/* Content title */}
              {r.contentTitle && (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    "{r.contentTitle}"
                  </p>
                  <Link
                    href={`/${r.contentType}s/${r.contentId}`}
                    target="_blank"
                    className="text-xs text-violet-600 hover:underline">
                    View →
                  </Link>
                </div>
              )}

              {/* Description */}
              {r.description && (
                <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>
                  "{r.description}"
                </p>
              )}

              {/* Reporter */}
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Reported by{" "}
                <Link href={`/profile/${r.reporter?.firebaseUid}`} className="text-violet-600 hover:underline">
                  {r.reporter?.name}
                </Link>
              </p>

              {/* Actions */}
              {r.status === "pending" && (
                <div className="flex gap-2 pt-1 flex-wrap">
                  <button onClick={() => handleAction(r._id, "dismissed", true)}
                    disabled={updating === r._id}
                    className="btn-secondary text-xs px-3 py-1.5">
                    Dismiss
                  </button>
                  <button onClick={() => handleAction(r._id, "reviewed")}
                    disabled={updating === r._id}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50">
                    Mark Reviewed
                  </button>
                  <button onClick={() => handleAction(r._id, "actioned")}
                    disabled={updating === r._id}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                    Take Action
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
