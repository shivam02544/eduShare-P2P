"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function CertCard({ cert }) {
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="card overflow-hidden animate-fade-in hover:-translate-y-0.5 transition-transform duration-200">
      {/* Top accent */}
      <div className="h-2" style={{ background: "linear-gradient(90deg, #f59e0b, #d97706)" }} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-xl">
            🏅
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Certificate</p>
            <h3 className="font-bold text-zinc-900 text-sm leading-snug mt-0.5 line-clamp-2">
              {cert.videoTitle}
            </h3>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-zinc-400">Score</p>
            <p className="font-bold text-zinc-800 text-base">{cert.score}%</p>
          </div>
          <div>
            <p className="text-zinc-400">Issued</p>
            <p className="font-medium text-zinc-700">{issuedDate}</p>
          </div>
          <div className="col-span-2">
            <p className="text-zinc-400">Instructor</p>
            <p className="font-medium text-zinc-700">{cert.issuerName}</p>
          </div>
        </div>

        {/* ID + actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <span className="text-[11px] font-mono text-zinc-400">{cert.certId}</span>
          <div className="flex gap-1.5">
            <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/certificates/${cert.certId}`);
              alert("Link copied!");
            }} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors px-2 py-1 rounded-lg hover:bg-stone-100">
              Share
            </button>
            <Link href={`/certificates/${cert.certId}`}
              className="text-xs bg-zinc-900 text-white px-3 py-1 rounded-lg hover:bg-zinc-700 transition-colors">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/certificates")
      .then((r) => r.json())
      .then((d) => { setCerts(Array.isArray(d) ? d : []); setLoading(false); });
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">My Certificates</h1>
        <p className="text-zinc-400 text-sm mt-1">Earned by passing video quizzes</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-2 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-5xl mb-3">🏅</p>
          <p className="font-medium text-zinc-600">No certificates yet</p>
          <p className="text-sm mt-1 mb-4">Pass a video quiz to earn your first certificate</p>
          <Link href="/explore" className="btn-primary">Browse Videos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((c) => <CertCard key={c._id} cert={c} />)}
        </div>
      )}
    </div>
  );
}
