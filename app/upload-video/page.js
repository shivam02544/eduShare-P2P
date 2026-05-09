"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
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

    // ── Timeout guard: if seeked never fires (corrupt file, codec issue),
    //    resolve null after 5 seconds rather than hanging forever.
    const cleanup = (result) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve(result);
    };
    const timeout = setTimeout(() => cleanup(null), 5_000);

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => cleanup(blob), "image/jpeg", 0.85);
    }, { once: true });

    video.addEventListener("error", () => cleanup(null), { once: true });

    video.load();
    // Seek after load to avoid race on some browsers
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(atSecond, video.duration - 0.1 || atSecond);
    }, { once: true });
  });
}

export default function UploadVideoPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const { withLoading } = useLoading();
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
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

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
    setError("");

    await withLoading(async () => {
      setUploading(true);
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
        setError(err.message);
        toast.error(err.message);
      } finally {
        setUploading(false);
        setUploadStep("");
      }
    });
  };

  return (
    <PageContainer>
      <SectionHeader 
        title="Upload Video"
        badge="Type: Media"
        action={
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-border text-sm font-bold text-text-2 hover:text-text-1 transition-all"
          >
            <X className="w-4 h-4" />
            Cancel Upload
          </button>
        }
      />

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* ── Upload Form (Left) ── */}
        <div className="lg:col-span-7 space-y-8">
          <motion.form 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-border p-6 md:p-10 rounded-3xl space-y-8"
          >
            {/* Error Banner */}
            {error && (
              <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400">
                <span className="text-sm font-medium leading-snug">{error}</span>
              </div>
            )}

            {/* Title Section */}
            <div className="space-y-3">
              <label htmlFor="video-title" className="text-sm font-bold text-text-2 ml-1">Video Title</label>
              <input 
                id="video-title"
                type="text" 
                placeholder="Enter title..." 
                required
                autoComplete="off"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            {/* Subject Selection */}
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label htmlFor="video-subject" className="text-sm font-bold text-text-2 ml-1">Category</label>
                <select 
                  id="video-subject"
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-1 focus:border-indigo-500 transition-all outline-none cursor-pointer appearance-none"
                >
                  {SUBJECTS.map((s) => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                 <label className="text-sm font-bold text-text-2 ml-1">Verification Status</label>
                 <div className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-500">Verified Educator</span>
                 </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <label htmlFor="video-description" className="text-sm font-bold text-text-2 ml-1">Description</label>
              <textarea 
                id="video-description"
                placeholder="Enter video description..." 
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-4 flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-bold">{uploadStep || "Uploading..."}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span className="text-sm font-bold">Upload Video</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Assets Selection (Right) ── */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Video Drop Zone */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            role="button"
            tabIndex={0}
            aria-label={file ? `Selected: ${file.name}. Click to replace.` : "Select a video file"}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
            onClick={() => fileRef.current?.click()}
            className={`group relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden ${
              file 
                ? "border-indigo-500/50 bg-indigo-500/5" 
                : "border-border bg-slate-50 dark:bg-slate-900 hover:border-indigo-500/30"
            }`}
          >
            <input 
              ref={fileRef} 
              id="video-file-input"
              type="file" 
              accept="video/*" 
              className="sr-only"
              aria-label="Choose video file"
              onChange={(e) => handleVideoSelect(e.target.files[0])} 
            />
            {file ? (
              <div className="text-center space-y-3 px-8">
                 <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white mx-auto shadow-sm">
                    <FileVideo className="w-8 h-8" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-text-1 truncate">{file.name}</p>
                    <p className="text-xs font-medium text-text-3">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                 </div>
                 <button className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-xl mt-2">Replace Video</button>
              </div>
            ) : (
              <>
                 <UploadCloud className="w-12 h-12 text-text-3 group-hover:translate-y-[-4px] transition-transform" />
                 <div className="text-center">
                    <p className="text-sm font-bold text-text-1">Select Video File</p>
                    <p className="text-xs text-text-3 mt-1">MP4 / HEVC / MOV / WebM</p>
                 </div>
              </>
            )}
          </motion.div>

          {/* Thumbnail Settings */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-text-2" />
                <h3 className="text-sm font-bold text-text-1">Thumbnail</h3>
              </div>
              <AnimatePresence>
                {thumbSource && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-xs font-bold px-3 py-1 rounded-xl ${
                      thumbSource === "auto" ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
                    }`}
                  >
                    {thumbSource === "auto" ? "Auto-Generated" : "Manual Upload"}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="relative w-full md:w-40 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center shrink-0">
                 {thumbPreview ? (
                   <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                 ) : uploadStep === "Generating thumbnail..." ? (
                   <Loader2 className="w-6 h-6 animate-spin text-text-3 opacity-30" />
                 ) : (
                   <Sparkles className="w-8 h-8 text-text-3 opacity-20" />
                 )}
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                 <p className="text-sm text-text-2 leading-relaxed break-words">
                   {file 
                     ? "Automatic thumbnail generated from your video. You can override it with a custom image."
                     : "The system will automatically generate a thumbnail preview after you select a video."}
                 </p>
                 <div className="flex flex-wrap gap-3">
                    <input 
                      ref={thumbRef} 
                      id="thumb-file-input"
                      type="file" 
                      accept="image/*" 
                      className="sr-only"
                      aria-label="Choose thumbnail image"
                      onChange={handleManualThumb} 
                    />
                    <button 
                      type="button"
                      onClick={() => thumbRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-border text-sm font-bold text-text-1 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                      Upload Thumbnail
                    </button>
                    {thumbPreview && (
                      <button 
                        type="button"
                        onClick={() => { setThumbnail(null); setThumbPreview(""); setThumbSource(""); }}
                        className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
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
    </PageContainer>
  );
}

