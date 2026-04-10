"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  Film, 
  Image as ImageIcon, 
  Zap, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  ChevronLeft, 
  Play, 
  Sparkles,
  Loader2,
  FileVideo
} from "lucide-react";
import { toast } from "react-hot-toast";

const springConfig = { mass: 1, tension: 120, friction: 20 };
const SUBJECTS = ["Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology", "Other"];

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
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState("");
  const [thumbSource, setThumbSource] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();
  const thumbRef = useRef();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const handleVideoSelect = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setThumbPreview("");
    setThumbnail(null);
    setThumbSource("");

    setUploadStep("Creating thumbnail...");
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
    if (!f.type.startsWith("image/")) return toast.error("Thumbnail must be an image");
    if (f.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5MB)");

    setThumbnail(f);
    setThumbPreview(URL.createObjectURL(f));
    setThumbSource("manual");
  };

  const uploadDirectToS3 = async (uploadFile, folder) => {
    const res = await authFetch("/api/upload/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: uploadFile.name, contentType: uploadFile.type, folder }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get upload URL");

    const s3Res = await fetch(data.presignedUrl, {
      method: "PUT",
      body: uploadFile,
      headers: { "Content-Type": uploadFile.type },
    });
    if (!s3Res.ok) throw new Error("Failed to upload file to S3");
    return data.fileUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a video file");
    setUploading(true);
    setError("");

    try {
      setUploadStep("Uploading video...");
      const videoUrl = await uploadDirectToS3(file, "videos");

      let thumbnailUrl = "";
      if (thumbnail) {
        setUploadStep("Uploading thumbnail...");
        const thumbFile = thumbnail instanceof Blob && !(thumbnail instanceof File)
          ? new File([thumbnail], "thumbnail.jpg", { type: "image/jpeg" })
          : thumbnail;
        thumbnailUrl = await uploadDirectToS3(thumbFile, "thumbnails");
      }

      setUploadStep("Finishing up...");
      const res = await authFetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, videoUrl, thumbnailUrl }),
      });

      if (!res.ok) throw new Error("Failed to save video");

      toast.success("Video uploaded successfully");
      router.push("/dashboard");
    } catch (err) {
      setUploading(false);
      setError(err.message);
      setUploadStep("");
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 md:px-0">
      
      {/* ── Header HUD ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Video Upload</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Status: Ready</span>
          </div>
          <h1 className="text-2xl font-black text-text-1 tracking-tight">
            Upload <span className="text-indigo-500">Video</span>
          </h1>
        </div>

        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 transition-all"
        >
          <X className="w-4 h-4" />
          Cancel Upload
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* ── Manifest Form (Left) ── */}
        <div className="lg:col-span-7 space-y-8">
          <motion.form 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            onSubmit={handleSubmit}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-10 rounded-[48px] shadow-3xl space-y-8"
          >
            {/* Title Node */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Video Title</label>
              <input 
                type="text" 
                placeholder="Enter title..." 
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-base font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            {/* Subject Node */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Category</label>
                <select 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-sm font-black text-text-1 focus:border-indigo-500 transition-all outline-none cursor-pointer appearance-none"
                >
                  {SUBJECTS.map((s) => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Integrity Check</label>
                 <div className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-3xl px-6 py-4 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified Educator</span>
                 </div>
              </div>
            </div>

            {/* Description Node */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Description</label>
              <textarea 
                placeholder="Enter video description..." 
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-sm font-medium text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none resize-none"
              />
            </div>

            {/* Submit HUD */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={uploading}
                className="group relative w-full overflow-hidden rounded-[32px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-6 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">{uploadStep || "Uploading..."}</p>
                  </>
                ) : (
                  <>
                    <Zap className="w-8 h-8 group-hover:scale-125 transition-transform" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-1">Upload Video</p>
                  </>
                )}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[60px] -z-0" />
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Asset Matrix (Right) ── */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Video Drop Zone */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => fileRef.current?.click()}
            className={`group relative aspect-video rounded-[48px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden ${
              file 
                ? "border-indigo-500/50 bg-indigo-500/5" 
                : "border-border bg-white/30 dark:bg-white/5 hover:border-indigo-500/30 hover:bg-slate-50/50 dark:hover:bg-white/10"
            }`}
          >
            <input 
              ref={fileRef} 
              type="file" 
              accept="video/*" 
              className="hidden"
              onChange={(e) => handleVideoSelect(e.target.files[0])} 
            />
            {file ? (
              <div className="text-center space-y-3 px-8">
                 <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center text-white mx-auto shadow-2xl">
                    <FileVideo className="w-8 h-8" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black text-text-1 truncate">{file.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                 </div>
                 <button className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-full">Replace Video</button>
              </div>
            ) : (
              <>
                 <UploadCloud className="w-12 h-12 text-text-3 opacity-30 group-hover:translate-y-[-4px] transition-transform" />
                 <div className="text-center">
                    <p className="text-sm font-black text-text-1 tracking-tight">Select Video File</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 opacity-40 mt-1">MP4 / HEVC / MOV / WebM</p>
                 </div>
              </>
            )}
            <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-[8px] font-black uppercase tracking-widest text-text-3">Max File Size: 500MB</p>
            </div>
          </motion.div>

          {/* Thumbnail Node */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[48px] p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-text-3" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-1">Thumbnail</h3>
              </div>
              <AnimatePresence>
                {thumbSource && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      thumbSource === "auto" ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white"
                    }`}
                  >
                    {thumbSource === "auto" ? "Native Sync" : "Custom Node"}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative aspect-video w-48 rounded-[24px] overflow-hidden bg-slate-100 dark:bg-white/5 border border-border flex items-center justify-center group shadow-xl">
                 {thumbPreview ? (
                   <img src={thumbPreview} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 ) : uploadStep === "Generating thumbnail..." ? (
                   <Loader2 className="w-6 h-6 animate-spin text-text-3 opacity-30" />
                 ) : (
                   <Sparkles className="w-8 h-8 text-text-3 opacity-20" />
                 )}
                 <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors" />
              </div>

              <div className="flex-1 space-y-4">
                 <p className="text-[10px] font-medium text-text-3 leading-relaxed">
                   {file 
                     ? "Native thumbnail synchronized from intake stream. You may override with a custom visual signature."
                     : "Waiting for intelligence node to generate visual signature preview."}
                 </p>
                 <div className="flex gap-3">
                    <input 
                      ref={thumbRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleManualThumb} 
                    />
                    <button 
                      type="button"
                      onClick={() => thumbRef.current?.click()}
                      className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                    >
                      Upload Thumbnail
                    </button>
                    {thumbPreview && (
                      <button 
                        type="button"
                        onClick={() => { setThumbnail(null); setThumbPreview(""); setThumbSource(""); }}
                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                      >
                         <X className="w-4 h-4" />
                      </button>
                    )}
                 </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

