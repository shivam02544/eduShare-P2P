"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function CertificateSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="skeleton h-8 w-48 mx-auto" />
      <div className="skeleton rounded-3xl" style={{ height: "480px" }} />
    </div>
  );
}

export default function CertificatePage() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const certRef = useRef(null);

  useEffect(() => {
    fetch(`/api/certificates/${certId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.valid) setNotFound(true);
        else setCert(d);
        setLoading(false);
      });
  }, [certId]);

  const handlePrint = () => window.print();

  if (loading) return <CertificateSkeleton />;
  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-3">🔍</p>
      <p className="text-lg font-semibold text-zinc-700">Certificate not found</p>
      <p className="text-sm text-zinc-400 mt-1">This certificate ID doesn't exist or may have been revoked.</p>
    </div>
  );

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Certificate of Completion</h1>
          <p className="text-sm text-zinc-400 mt-0.5">ID: {cert.certId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied!");
          }} className="btn-secondary text-sm flex items-center gap-2">
            🔗 Copy Link
          </button>
          <button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-2">
            ⬇ Download
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div ref={certRef}
        className="relative overflow-hidden rounded-3xl print:rounded-none"
        style={{
          background: "linear-gradient(135deg, #fefce8 0%, #fff7ed 40%, #fef3c7 100%)",
          border: "2px solid #fde68a",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
          minHeight: "480px",
        }}>

        {/* Decorative corner ornaments */}
        <div className="absolute top-4 left-4 w-16 h-16 opacity-20">
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 28 M4 4 L28 4" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 4 L20 20" stroke="#92400e" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4"/>
          </svg>
        </div>
        <div className="absolute top-4 right-4 w-16 h-16 opacity-20" style={{ transform: "scaleX(-1)" }}>
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 28 M4 4 L28 4" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 4 L20 20" stroke="#92400e" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4"/>
          </svg>
        </div>
        <div className="absolute bottom-4 left-4 w-16 h-16 opacity-20" style={{ transform: "scaleY(-1)" }}>
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 28 M4 4 L28 4" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="absolute bottom-4 right-4 w-16 h-16 opacity-20" style={{ transform: "scale(-1)" }}>
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 28 M4 4 L28 4" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #92400e 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-12 py-14 gap-5">

          {/* Logo + platform */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span className="text-amber-900 font-bold text-sm tracking-widest uppercase">EduShare</span>
          </div>

          {/* Title */}
          <div>
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-[0.2em] mb-1">
              Certificate of Completion
            </p>
            <div className="w-24 h-px bg-amber-400 mx-auto" />
          </div>

          {/* This certifies */}
          <p className="text-amber-800/70 text-sm italic">This certifies that</p>

          {/* Recipient name */}
          <div>
            <h2 className="text-4xl font-black text-amber-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}>
              {cert.recipientName}
            </h2>
            <div className="w-48 h-0.5 bg-amber-400/60 mx-auto mt-2" />
          </div>

          {/* Achievement text */}
          <p className="text-amber-800/80 text-sm max-w-md leading-relaxed">
            has successfully completed the knowledge assessment for
          </p>

          {/* Course name */}
          <div className="bg-white/50 backdrop-blur-sm border border-amber-200 rounded-2xl px-6 py-3 max-w-md">
            <p className="text-amber-900 font-bold text-lg leading-snug">
              {cert.videoTitle}
            </p>
            {cert.video?.subject && (
              <p className="text-amber-700/70 text-xs mt-1 uppercase tracking-wide">{cert.video.subject}</p>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-amber-800">{cert.score}%</p>
              <p className="text-xs text-amber-700/60 uppercase tracking-wide mt-0.5">Score</p>
            </div>
            <div className="w-px h-10 bg-amber-300" />
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-800">{cert.issuerName}</p>
              <p className="text-xs text-amber-700/60 uppercase tracking-wide mt-0.5">Instructor</p>
            </div>
            <div className="w-px h-10 bg-amber-300" />
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-800">{issuedDate}</p>
              <p className="text-xs text-amber-700/60 uppercase tracking-wide mt-0.5">Issued</p>
            </div>
          </div>

          {/* Verification */}
          <div className="flex items-center gap-2 bg-white/40 border border-amber-200 rounded-full px-4 py-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs text-amber-800/70 font-mono">{cert.certId}</span>
          </div>
        </div>
      </div>

      {/* Verification info */}
      <div className="card p-4 flex items-center gap-3 print:hidden">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-800">Verified Certificate</p>
          <p className="text-xs text-zinc-400">
            This certificate is authentic and verifiable at{" "}
            <span className="font-mono text-zinc-600">/certificates/verify/{cert.certId}</span>
          </p>
        </div>
        <Link href={`/profile/${cert.recipient?.firebaseUid}`}
          className="ml-auto btn-secondary text-xs">
          View Profile
        </Link>
      </div>
    </div>
  );
}
