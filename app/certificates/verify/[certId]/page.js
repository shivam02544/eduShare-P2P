"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function VerifyCertificatePage() {
  const { certId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/certificates/${certId}`)
      .then((r) => r.json())
      .then((d) => { setResult(d); setLoading(false); });
  }, [certId]);

  if (loading) return (
    <div className="max-w-lg mx-auto text-center py-20 text-zinc-400">
      <div className="skeleton h-6 w-48 mx-auto mb-3" />
      <div className="skeleton h-4 w-64 mx-auto" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          result.valid ? "bg-emerald-100" : "bg-red-100"
        }`}>
          {result.valid ? (
            <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          )}
        </div>
        <h1 className={`text-2xl font-bold ${result.valid ? "text-emerald-700" : "text-red-600"}`}>
          {result.valid ? "Certificate Verified ✓" : "Invalid Certificate"}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {result.valid ? "This is an authentic EduShare certificate." : "This certificate ID was not found."}
        </p>
      </div>

      {result.valid && (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Recipient", value: result.recipientName },
              { label: "Score", value: `${result.score}%` },
              { label: "Course", value: result.videoTitle },
              { label: "Instructor", value: result.issuerName },
              { label: "Certificate ID", value: result.certId },
              { label: "Issued", value: new Date(result.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5 break-words">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-stone-100">
            <Link href={`/certificates/${result.certId}`} className="btn-primary text-sm flex-1 text-center">
              View Certificate
            </Link>
            <Link href={`/profile/${result.recipient?.firebaseUid}`} className="btn-secondary text-sm flex-1 text-center">
              View Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
