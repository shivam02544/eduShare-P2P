"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";

const SUBJECTS = ["Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology", "Other"];

export default function UploadNotesPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "Math" });
  const [isPremium, setIsPremium] = useState(false);
  const [premiumCost, setPremiumCost] = useState(10);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const uploadDirectToS3 = async (uploadFile, folder) => {
    const res = await authFetch("/api/upload/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: uploadFile.name,
        contentType: uploadFile.type,
        folder,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get upload URL");

    const s3Res = await fetch(data.presignedUrl, {
      method: "PUT",
      body: uploadFile,
      headers: { "Content-Type": uploadFile.type },
    });
    if (!s3Res.ok) throw new Error("Failed to upload file to S3 directly");

    return data.fileUrl; // the public url
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file");
    setError("");

    await withLoading(async () => {
      try {
        const fileUrl = await uploadDirectToS3(file, "notes");

        const res = await authFetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            subject: form.subject,
            fileUrl,
            isPremium,
            premiumCost,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save note data");

        router.push("/dashboard");
      } catch (err) {
        setError(err.message);
      }
    }, "Uploading Note and Saving...");
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Upload Notes</h1>
        <p className="text-zinc-400 text-sm mt-1">Share your study notes and earn 3 credits per download</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Title</label>
          <input type="text" placeholder="e.g. Organic Chemistry Chapter 3" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Subject</label>
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input">
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Drop zone */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">PDF File</label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file ? "border-rose-300 bg-rose-50" : "border-zinc-200 hover:border-zinc-300 bg-zinc-50"
            }`}>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
              onChange={(e) => setFile(e.target.files[0])} />
            {file ? (
              <div className="space-y-1">
                <div className="text-2xl">📄</div>
                <p className="text-sm font-medium text-rose-700">{file.name}</p>
                <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl text-zinc-300">📁</div>
                <p className="text-sm font-medium text-zinc-600">Click to select PDF</p>
                <p className="text-xs text-zinc-400">PDF only — max 50MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Premium settings */}
        <div className="rounded-xl border border-stone-200 p-4 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-zinc-800">Premium Note</p>
              <p className="text-xs text-zinc-400 mt-0.5">Charge credits for others to download</p>
            </div>
            <div onClick={() => setIsPremium(!isPremium)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${isPremium ? "bg-amber-500" : "bg-stone-200"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPremium ? "translate-x-5" : "translate-x-1"}`} />
            </div>
          </label>
          {isPremium && (
            <div className="flex items-center gap-3 animate-fade-in">
              <label className="text-xs text-zinc-500 flex-shrink-0">Cost (credits):</label>
              <input type="number" min={1} max={100} value={premiumCost}
                onChange={(e) => setPremiumCost(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input w-24 text-sm py-1.5" />
              <p className="text-xs text-zinc-400">Students pay {premiumCost} credits to download</p>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary w-full py-3">
          Upload Notes
        </button>
      </form>
    </div>
  );
}
