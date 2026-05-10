"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
import {
  Video,
  Play,
  ShieldCheck,
  Zap,
  X,
  AlertCircle,
  UploadCloud,
  CheckCircle,
  Plus,
  Shield,
  Info,
  Loader2,
  MonitorPlay,
  Eye,
  Target,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

const springConfig = { mass: 1, tension: 120, friction: 20 };
const SUBJECTS = ["Math", "Science", "Programming", "Design", "Business", "History", "Other"];

export default function UploadVideoPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();
  
  const [form, setForm] = useState({ title: "", description: "", subject: "Programming", tags: [] });
  const [tagInput, setTagInput] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const videoInputRef = useRef();
  const thumbInputRef = useRef();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  const uploadToS3 = async (file, folder) => {
    const res = await authFetch("/api/upload/presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get upload URL");

    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open("PUT", data.presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && folder === "videos") {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => xhr.status === 200 ? resolve(data.fileUrl) : reject(new Error("S3 Upload Failed"));
      xhr.onerror = () => reject(new Error("XHR Error"));
      xhr.send(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return toast.error("Video file is required");
    setError("");

    await withLoading(async () => {
      setUploading(true);
      try {
        const [videoUrl, thumbnailUrl] = await Promise.all([
          uploadToS3(videoFile, "videos"),
          thumbnailFile ? uploadToS3(thumbnailFile, "thumbnails") : Promise.resolve(null)
        ]);

        const res = await authFetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, videoUrl, thumbnailUrl }),
        });

        if (!res.ok) throw new Error("Failed to index video");

        toast.success("Video broadcast initialized");
        router.push("/dashboard");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }, "Broadcasting Video...");
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (t) => setForm({ ...form, tags: form.tags.filter(tag => tag !== t) });

  return (
    <PageContainer>
      <SectionHeader
        title="Broadcast Video"
        badge="TYPE: MULTIMEDIA"
        action={
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-1 dark:bg-surface-3 border border-border text-[10px] font-black text-text-2 hover:text-accent transition-all shadow-sm uppercase tracking-widest"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Abort Broadcast
          </button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mt-8">
        {/* ── Main Production Deck (Left) ── */}
        <div className="lg:col-span-8 space-y-8">
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            onSubmit={handleSubmit}
            className="bg-surface-1 dark:bg-surface-2 border border-border p-8 md:p-10 rounded-[32px] shadow-sm space-y-10"
          >
            {/* Video Node Selector */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Master Video File</label>
              <div
                onClick={() => videoInputRef.current.click()}
                className={`
                  relative aspect-video rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden
                  ${videoFile ? 'border-accent bg-accent/5' : 'border-border bg-surface-2/50 dark:bg-surface-3/30 hover:border-accent/40'}
                `}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
                
                {videoFile ? (
                   <div className="text-center space-y-4 z-10">
                      <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center text-white shadow-2xl mx-auto animate-in zoom-in duration-500">
                         <Play className="w-10 h-10 fill-current" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black text-text-1 truncate max-w-md mx-auto">{videoFile.name}</p>
                        <p className="text-xs font-bold text-text-3 uppercase tracking-widest">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • READY FOR BROADCAST</p>
                      </div>
                   </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-surface-1 dark:bg-surface-2 border border-border flex items-center justify-center text-text-4 group-hover:text-accent transition-all duration-500 shadow-xl">
                      <Video className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-black text-text-1 uppercase tracking-widest">Select Production Source</p>
                    <div className="px-6 py-2 bg-surface-1 dark:bg-surface-2 border border-border rounded-xl text-[10px] font-black text-text-4 uppercase tracking-widest">
                      MP4 • MKV • WEBM (MAX 100MB)
                    </div>
                  </div>
                )}

                {/* Progress Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-surface-1/90 dark:bg-surface-2/90 backdrop-blur-sm flex flex-col items-center justify-center p-12 z-20">
                     <div className="w-full max-w-sm space-y-6 text-center">
                        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-1">
                             <span>Broadcasting Stream</span>
                             <span>{uploadProgress}%</span>
                           </div>
                           <div className="h-3 bg-surface-3 rounded-full overflow-hidden border border-border">
                              <motion.div 
                                className="h-full bg-accent"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                              />
                           </div>
                        </div>
                        <p className="text-xs text-text-3 font-medium">Compressing and distributing to global nodes...</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail + Details */}
            <div className="grid md:grid-cols-2 gap-10">
               {/* Thumbnail Hub */}
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Visual Identity (Thumbnail)</label>
                  <div
                    onClick={() => thumbInputRef.current.click()}
                    className={`
                      relative aspect-video rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden
                      ${thumbnailFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-surface-2/50 dark:bg-surface-3/30 hover:border-emerald-500/30'}
                    `}
                  >
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setThumbnailFile(e.target.files[0])}
                    />
                    
                    {thumbnailFile ? (
                      <div className="absolute inset-0 w-full h-full">
                         <img src={URL.createObjectURL(thumbnailFile)} alt="" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <ImageIcon className="w-8 h-8 text-white" />
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center space-y-4">
                         <ImageIcon className="w-8 h-8 text-text-4" />
                         <p className="text-[10px] font-black text-text-3 uppercase tracking-widest">Optional Cover</p>
                      </div>
                    )}
                  </div>
               </div>

               {/* Metadata Stack */}
               <div className="space-y-8">
                  <div className="space-y-3">
                    <label htmlFor="video-title" className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Broadcast Title</label>
                    <input
                      id="video-title"
                      type="text"
                      placeholder="E.g. Neural Networks Explained"
                      required
                      className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-2xl px-5 py-4 text-sm font-bold text-text-1 placeholder:text-text-4 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="video-subject" className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Domain category</label>
                    <select
                      id="video-subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-2xl px-5 py-4 text-sm font-bold text-text-1 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none cursor-pointer appearance-none"
                    >
                      {SUBJECTS.map((s) => <option key={s} className="bg-surface-1 text-text-1">{s}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            {/* Synopsis Hub */}
            <div className="space-y-3">
              <label htmlFor="video-description" className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Broadcast Synopsis</label>
              <textarea
                id="video-description"
                placeholder="What will your viewers learn in this production?"
                rows={4}
                className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-2xl px-5 py-4 text-sm font-medium text-text-1 placeholder:text-text-4 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none resize-none leading-relaxed"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Tag Engine */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Index tags</label>
              <div className="flex flex-wrap gap-2 mb-4">
                <AnimatePresence>
                  {form.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2 bg-accent/10 text-accent text-[10px] font-black px-4 py-2 rounded-xl border border-accent/20 uppercase tracking-widest"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Insert index tag..."
                  className="flex-1 bg-surface-2 dark:bg-surface-3 border border-border rounded-xl px-5 py-3 text-sm font-bold text-text-1 placeholder:text-text-4 focus:border-accent transition-all outline-none"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-h transition-all active:scale-95 shadow-lg shadow-accent/10"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Broadcast Control */}
            <div className="pt-6">
               <button
                type="submit"
                disabled={uploading || !videoFile}
                className="w-full rounded-2xl bg-accent text-white py-5 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-accent-h hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-accent/20"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                    <span>Transmitting Signal...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 fill-current" aria-hidden="true" />
                    <span>Initialize Global Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Production Intelligence (Right) ── */}
        <div className="lg:col-span-4 space-y-8">
           {/* Guidelines */}
           <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-1 dark:bg-surface-2 border border-border rounded-[32px] p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-text-1 uppercase tracking-widest">Broadcast Standards</h3>
            </div>
            
            <ul className="space-y-4 pt-2">
              {[
                "Preferred resolution: 1080p or higher",
                "Clear audio track with minimal noise",
                "Educational focused content only",
                "Custom thumbnails increase engagement"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 mt-0.5 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-text-2 font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Visibility Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-accent/10 border border-accent/20 rounded-[32px] p-8 flex items-start gap-5 shadow-sm"
          >
             <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shrink-0 border border-accent/30 shadow-sm">
                <Eye className="w-6 h-6" />
             </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-text-1 uppercase tracking-widest">Audience Reach</p>
                <p className="text-xs text-text-3 font-medium leading-relaxed">
                  Your production will be discoverable in the global feed and subject-specific domains. 
                </p>
              </div>
          </motion.div>

          {/* Verification Protocol */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-1 dark:bg-surface-2 border border-border rounded-[32px] p-8 flex items-start gap-5 shadow-sm"
          >
             <div className="w-12 h-12 rounded-2xl bg-surface-2 dark:bg-surface-3 flex items-center justify-center text-text-4 shrink-0 border border-border">
                <ShieldCheck className="w-6 h-6" />
             </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-text-1 uppercase tracking-widest">Rights Management</p>
                <p className="text-[10px] text-text-3 font-medium leading-relaxed">
                  By broadcasting, you grant EduShare peers the right to view this content for educational purposes.
                </p>
              </div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
