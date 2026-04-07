"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const SUBJECTS = ["Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology", "Other"];

/**
 * Capture a frame from a video file at a given time (seconds).
 * Returns a Blob (image/jpeg).
 */
function captureVideoFrame(videoFile, atSecond = 1) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.currentTime = atSecond;

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, "image/jpeg", 0.85);
    }, { once: true });

    video.addEventListener("error", () => { URL.revokeObjectURL(url); resolve(null); }, { once: true });
    video.load();
  });
}

export default function UploadVideoPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", subject: "Math" });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);       // Blob
  const [thumbPreview, setThumbPreview] = useState("");   // object URL for preview
  const [thumbSource, setThumbSource] = useState("");     // "auto" | "manual"
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();
  const thumbRef = useRef();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  // Auto-capture thumbnail when video is selected
  const handleVideoSelect = async (selectedFile) => {
    setFile(selectedFile);
    setThumbPreview("");
    setThumbnail(null);
    setThumbSource("");

    if (!selectedFile) return;

    setUploadStep("Generating thumbnail...");
    const blob = await captureVideoFrame(selectedFile, 2);
    if (blob) {
      setThumbnail(blob);
      setThumbPreview(URL.createObjectURL(blob));
      setThumbSource("auto");
    }
    setUploadStep("");
  };

  const handleManualThumb = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return setError("Thumbnail must be an image file");
    if (f.size > 5 * 1024 * 1024)
      return setError("Thumbnail too large (max 5MB)");

    setThumbnail(f);
    setThumbPreview(URL.createObjectURL(f));
    setThumbSource("manual");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a video file");
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("subject", form.subject);
    formData.append("file", file);
    if (thumbnail) {
      const thumbFile = thumbnail instanceof Blob && !(thumbnail instanceof File)
        ? new File([thumbnail], "thumbnail.jpg", { type: "image/jpeg" })
        : thumbnail;
      formData.append("thumbnail", thumbFile);
    }

    setUploadStep("Uploading video to S3...");
    const res = await authFetch("/api/videos", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    setUploadStep("");

    if (!res.ok) setError(data.error);
    else router.push("/dashboard");
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Upload Video</h1>
        <p className="text-zinc-400 text-sm mt-1">Share your knowledge and earn 5 credits per view</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Title</label>
          <input type="text" placeholder="e.g. Introduction to Calculus" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input" />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Subject</label>
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input">
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Description</label>
          <textarea placeholder="What will students learn?" rows={3}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none" />
        </div>

        {/* Video file */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Video File</label>
          <div onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              file ? "border-violet-300 bg-violet-50" : "border-zinc-200 hover:border-zinc-300 bg-zinc-50"
            }`}>
            <input ref={fileRef} type="file" accept="video/*" className="hidden"
              onChange={(e) => handleVideoSelect(e.target.files[0])} />
            {file ? (
              <div className="space-y-1">
                <div className="text-2xl">🎥</div>
                <p className="text-sm font-medium text-violet-700 truncate">{file.name}</p>
                <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-2xl text-zinc-300">📁</div>
                <p className="text-sm font-medium text-zinc-600">Click to select video</p>
                <p className="text-xs text-zinc-400">MP4, WebM, MOV — max 500MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Thumbnail
            </label>
            {thumbSource === "auto" && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ✓ Auto-captured
              </span>
            )}
            {thumbSource === "manual" && (
              <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                Custom
              </span>
            )}
          </div>

          <div className="flex gap-3 items-start">
            {/* Preview */}
            <div className="w-32 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 flex items-center justify-center border border-zinc-200">
              {thumbPreview ? (
                <img src={thumbPreview} alt="Thumbnail" className="w-full h-full object-cover" />
              ) : uploadStep === "Generating thumbnail..." ? (
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-5 h-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <span className="text-xs text-zinc-400">Capturing...</span>
                </div>
              ) : (
                <span className="text-2xl text-zinc-300">🖼️</span>
              )}
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-2">
              <p className="text-xs text-zinc-500">
                {file
                  ? "Thumbnail auto-captured from your video. You can replace it with a custom image."
                  : "Select a video first to auto-generate a thumbnail."}
              </p>
              <div className="flex gap-2">
                <input ref={thumbRef} type="file" accept="image/*" className="hidden"
                  onChange={handleManualThumb} />
                <button type="button" onClick={() => thumbRef.current?.click()}
                  className="btn-secondary text-xs px-3 py-1.5">
                  {thumbPreview ? "Replace" : "Upload custom"}
                </button>
                {thumbPreview && (
                  <button type="button"
                    onClick={() => { setThumbnail(null); setThumbPreview(""); setThumbSource(""); }}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={uploading} className="btn-primary w-full py-3">
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {uploadStep || "Uploading..."}
            </span>
          ) : "Upload Video"}
        </button>
      </form>
    </div>
  );
}
