"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  X, 
  AlertCircle, 
  UploadCloud, 
  ChevronLeft, 
  FileType, 
  Sparkles,
  CreditCard,
  Target
} from "lucide-react";
import { toast } from "react-hot-toast";

const springConfig = { mass: 1, tension: 120, friction: 20 };
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
      body: JSON.stringify({ filename: uploadFile.name, contentType: uploadFile.type, folder }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to get upload URL");

    const s3Res = await fetch(data.presignedUrl, {
      method: "PUT",
      body: uploadFile,
      headers: { "Content-Type": uploadFile.type },
    });
    if (!s3Res.ok) throw new Error("Failed to upload file");
    return data.fileUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF file");
    setError("");

    await withLoading(async () => {
      try {
        const fileUrl = await uploadDirectToS3(file, "notes");

        const res = await authFetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, fileUrl, isPremium, premiumCost }),
        });

        if (!res.ok) throw new Error("Failed to save notes");

        toast.success("Notes uploaded successfully");
        router.push("/dashboard");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      }
    }, "Uploading Notes...");
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Upload Notes</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Type: PDF</span>
          </div>
          <h1 className="text-2xl font-black text-text-1 tracking-tight">
            Upload <span className="text-emerald-500">Notes</span>
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
            {/* Identity Node */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Title</label>
              <input 
                type="text" 
                placeholder="Enter title..." 
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-base font-black text-text-1 placeholder:opacity-30 focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            {/* Config Matrix */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Category</label>
                <select 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-sm font-black text-text-1 focus:border-emerald-500 transition-all outline-none cursor-pointer appearance-none"
                >
                  {SUBJECTS.map((s) => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Visibility</label>
                 <div className="w-full bg-indigo-500/5 border border-indigo-500/10 rounded-3xl px-6 py-4 flex items-center gap-3">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Public Access</span>
                 </div>
              </div>
            </div>

            {/* Premium Configuration */}
            <div className="bg-slate-50/50 dark:bg-white/5 border border-border p-8 rounded-[32px] space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-black text-text-1 tracking-tight">Charge for Download</p>
                  <p className="text-[10px] font-medium text-text-3">Set a price in credits for this document</p>
                </div>
                <div 
                  onClick={() => setIsPremium(!isPremium)}
                  className={`w-14 h-8 rounded-full transition-all relative cursor-pointer ${isPremium ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" : "bg-slate-300 dark:bg-white/10 shadow-inner"}`}
                >
                  <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${isPremium ? "translate-x-7" : "translate-x-1.5"}`} />
                </div>
              </div>

              <AnimatePresence>
                {isPremium && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-border/50 space-y-4"
                  >
                    <div className="flex items-center gap-6">
                       <div className="space-y-2 flex-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-text-3 opacity-60">Price (Credits)</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={100} 
                            value={premiumCost}
                            onChange={(e) => setPremiumCost(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-full bg-white dark:bg-slate-800 border border-border rounded-2xl px-4 py-2 text-sm font-black text-text-1 outline-none"
                          />
                       </div>
                       <div className="flex items-center justify-center p-4 bg-amber-500 group rounded-2xl shadow-xl shadow-amber-500/20">
                          <CreditCard className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                       </div>
                    </div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="w-3 h-3" />
                       Price set to: {premiumCost} Credits per download
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit HUD */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="group relative w-full overflow-hidden rounded-[32px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-6 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <BookOpen className="w-8 h-8 group-hover:scale-125 transition-transform" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-1">Upload Notes</p>
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[60px] -z-0" />
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Asset Matrix (Right) ── */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* PDF Drop Zone */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => fileRef.current?.click()}
            className={`group relative aspect-square md:aspect-[4/5] rounded-[48px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden ${
              file 
                ? "border-emerald-500/50 bg-emerald-500/5" 
                : "border-border bg-white/30 dark:bg-white/5 hover:border-emerald-500/30 hover:bg-slate-50/50 dark:hover:bg-white/10"
            }`}
          >
            <input 
              ref={fileRef} 
              type="file" 
              accept="application/pdf" 
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])} 
            />
            {file ? (
              <div className="text-center space-y-6 px-10">
                 <div className="relative">
                    <div className="w-24 h-32 rounded-2xl bg-white dark:bg-slate-800 border border-border shadow-2xl flex items-center justify-center mx-auto group-hover:-translate-y-2 transition-transform">
                       <FileType className="w-10 h-10 text-emerald-500" />
                       <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-950 shadow-xl border border-white/10">
                       <p className="text-[10px] font-black uppercase">PDF</p>
                    </div>
                 </div>
                 <div className="space-y-1 pt-4">
                    <p className="text-sm font-black text-text-1 truncate">{file.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                 </div>
                 <button className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/10">Replace Node</button>
              </div>
            ) : (
              <>
                 <UploadCloud className="w-16 h-16 text-text-3 opacity-30 group-hover:translate-y-[-4px] transition-transform" />
                 <div className="text-center px-10">
                    <p className="text-base font-black text-text-1 tracking-tight">Select PDF File</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 opacity-40 mt-1">Portable Document Format (PDF)</p>
                 </div>
              </>
            )}
            <div className="absolute bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-[8px] font-black uppercase tracking-widest text-text-3">Max file size: 50MB</p>
            </div>
          </motion.div>

          {/* Integrity Badge */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[32px] p-6 flex items-center gap-6"
          >
             <div className="w-12 h-12 rounded-[18px] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 shadow-xl">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <div className="flex-1 space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-1">Copyright Agreement</p>
                <p className="text-[11px] font-medium text-text-3 leading-tight">By uploading this file, you confirm that you own the rights to this content.</p>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

