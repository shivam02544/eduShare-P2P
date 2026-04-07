"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LikeBookmarkBar from "@/components/LikeBookmarkBar";
import { useLoading } from "@/context/LoadingContext";
import ReportButton from "@/components/ReportButton";

function NoteSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="skeleton h-7 w-2/3" />
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton w-full rounded-2xl" style={{ height: "600px" }} />
    </div>
  );
}

export default function NoteDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [creditMsg, setCreditMsg] = useState("");
  const [previewMode, setPreviewMode] = useState("embed"); // "embed" | "iframe"

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((d) => { setNote(d); setLoading(false); });
  }, [id, user]);

  const isOwnNote = note?.uploader?.firebaseUid === user?.uid;
  const isPremium = note?.isPremium && !isOwnNote;
  const alreadyUnlocked = note?.downloadedBy?.map(String).includes(note?.uploader?._id) || false;

  const handleDownload = async () => {
    setDownloading(true);
    const res = await authFetch(`/api/notes/${id}/download`, { method: "POST" });
    const data = await res.json();
    setDownloading(false);
    if (data.message) setCreditMsg(data.message);
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    const res = await authFetch(`/api/notes/${id}/unlock`, { method: "POST" });
    const data = await res.json();
    setUnlocking(false);
    if (data.error) { setCreditMsg(`Error: ${data.error}`); return; }
    setCreditMsg(data.message);
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
    fetch(`/api/notes/${id}`).then(r => r.json()).then(setNote);
  };

  if (authLoading || loading) return <NoteSkeleton />;
  if (!note || note.error) return (
    <div className="text-center py-20">
      <p className="text-lg font-semibold text-zinc-700">Note not found</p>
      <Link href="/explore" className="text-sm text-violet-600 hover:underline mt-2 block">Back to Explore</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge bg-rose-50 text-rose-600 border border-rose-100">
                {note.subject}
              </span>
              {note.isPremium && (
                <span className="badge bg-amber-100 text-amber-800 border border-amber-200">
                  🔒 Premium · {note.premiumCost} credits
                </span>
              )}
              {creditMsg && (
                <span className={`badge animate-fade-in ${
                  creditMsg.startsWith("Error")
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}>
                  {creditMsg.startsWith("Error") ? "⚠ " : "✓ "}{creditMsg.replace("Error: ", "")}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{note.title}</h1>
          </div>

          {/* Download / Unlock button */}
          {note.isPremium && !isOwnNote ? (
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <button onClick={handleUnlock} disabled={unlocking}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:opacity-60 shadow-sm">
                {unlocking ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : "🔓"}
                {unlocking ? "Unlocking..." : `Unlock for ${note.premiumCost} credits`}
              </button>
              <p className="text-xs text-zinc-400">One-time unlock · PDF opens immediately</p>
            </div>
          ) : (
            <button onClick={handleDownload} disabled={downloading}
              className="btn-primary flex items-center gap-2 flex-shrink-0 disabled:opacity-60">
              {downloading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              )}
              {downloading ? "Opening..." : "Download PDF"}
            </button>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link href={`/profile/${note.uploader?.firebaseUid}`}
            className="flex items-center gap-2.5 group">
            {note.uploader?.image ? (
              <img src={note.uploader.image} alt=""
                className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                {note.uploader?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-800 group-hover:text-violet-600 transition-colors">
                {note.uploader?.name}
              </p>
              <p className="text-xs text-zinc-400">Author</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 ml-auto text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {note.downloads} downloads
            </span>
            <span>
              {new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Like / Share */}
        <div className="flex items-center gap-3">
          <LikeBookmarkBar item={note} type="note" />
          <ReportButton contentType="note" contentId={id} compact />
        </div>
      </div>

      {/* PDF Preview */}
      <div className="card overflow-hidden">
        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-zinc-50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            </svg>
            <span className="text-xs font-medium text-zinc-600">PDF Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle embed vs iframe */}
            <button onClick={() => setPreviewMode(previewMode === "embed" ? "iframe" : "embed")}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
              Switch renderer
            </button>
            <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-violet-600 hover:underline">
              Open in new tab ↗
            </a>
          </div>
        </div>

        {/* PDF embed */}
        <div className="relative bg-zinc-100" style={{ height: "70vh" }}>
          {previewMode === "embed" ? (
            <embed
              src={`${note.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              type="application/pdf"
              className="w-full h-full"
            />
          ) : (
            <iframe
              src={`${note.fileUrl}#toolbar=0`}
              className="w-full h-full border-0"
              title={note.title}
            />
          )}

          {/* Fallback message — shown if PDF doesn't render */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 -z-10">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-zinc-600 font-medium">PDF preview not available</p>
            <p className="text-zinc-400 text-sm mt-1 mb-4">Your browser may not support inline PDF viewing</p>
            <button onClick={handleDownload} className="btn-primary">
              Download to view
            </button>
          </div>
        </div>
      </div>

      {/* Back */}
      <button onClick={() => router.back()}
        className="btn-ghost flex items-center gap-2 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
        Back
      </button>
    </div>
  );
}
