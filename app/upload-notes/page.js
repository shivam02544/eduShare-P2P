"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
import {
  FileText,
  BookOpen,
  ShieldCheck,
  Zap,
  X,
  AlertCircle,
  UploadCloud,
  FileType,
  CreditCard,
  Target,
  Loader2,
  CheckCircle,
  Plus,
  Shield,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getFileInfo, ACCEPTED_EXTENSIONS } from "@/lib/fileUtils";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

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
    if (!file) return toast.error("Please select a document file");
    setError("");

    await withLoading(async () => {
      setUploading(true);
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
      } finally {
        setUploading(false);
      }
    }, "Uploading Notes...");
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Upload Notes"
        badge="TYPE: DOCUMENT"
        action={
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-1 dark:bg-surface-3 border border-border text-[10px] font-black text-text-2 hover:text-accent transition-all shadow-sm uppercase tracking-widest"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Cancel Distribution
          </button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mt-8">
        {/* ── Main Form (Left) ── */}
        <div className="lg:col-span-7 space-y-8">
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            onSubmit={handleSubmit}
            className="bg-surface-1 dark:bg-surface-2 border border-border p-8 md:p-10 rounded-[32px] shadow-sm space-y-8"
          >
            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert" 
                  className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm font-bold text-rose-700 dark:text-rose-400 leading-snug">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <div className="space-y-3">
              <label htmlFor="notes-title" className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Distribution Title</label>
              <input
                id="notes-title"
                type="text"
                placeholder="E.g. Advanced Thermodynamics - Unit 4"
                required
                autoComplete="off"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-2xl px-5 py-4 text-sm font-bold text-text-1 placeholder:text-text-4 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
              />
            </div>

            {/* Category + Visibility */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="notes-subject" className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1">Domain category</label>
                <div className="relative">
                  <select
                    id="notes-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-2xl px-5 py-4 text-sm font-bold text-text-1 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none cursor-pointer appearance-none"
                  >
                    {SUBJECTS.map((s) => <option key={s} className="bg-surface-1 text-text-1">{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] ml-1" aria-hidden="true">Access protocol</span>
                <div className="w-full bg-accent/5 border border-accent/10 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <Target className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span className="text-sm font-black text-accent uppercase tracking-widest">Global Public</span>
                </div>
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="bg-surface-2 dark:bg-surface-3 border border-border p-8 rounded-[32px] space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p id="premium-toggle-label" className="text-sm font-black text-text-1 uppercase tracking-widest">Monetize Resource</p>
                  <p className="text-xs text-text-3 font-medium">Require credits for peer-to-peer download</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPremium}
                  aria-labelledby="premium-toggle-label"
                  onClick={() => setIsPremium(!isPremium)}
                  className={`relative w-14 h-7 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
                    isPremium ? "bg-amber-500 shadow-lg shadow-amber-500/20" : "bg-surface-4"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-500 ${
                      isPremium ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <AnimatePresence>
                {isPremium && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-6 border-t border-border space-y-5"
                  >
                    <div className="flex items-center gap-5">
                      <div className="space-y-2 flex-1">
                        <label htmlFor="premium-cost" className="text-[10px] font-black text-text-3 uppercase tracking-widest ml-1">
                          Price threshold (Credits)
                        </label>
                        <input
                          id="premium-cost"
                          type="number"
                          min={1}
                          max={100}
                          value={premiumCost}
                          onChange={(e) => setPremiumCost(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-full bg-surface-1 dark:bg-surface-2 border border-border rounded-2xl px-5 py-3 text-sm font-black text-text-1 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        />
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20" aria-hidden="true">
                        <CreditCard className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-600" aria-hidden="true" />
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                        Index as Premium Node: {premiumCost} Credits
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Control */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full rounded-2xl bg-accent text-white py-5 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-accent-h hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-accent/20"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                    <span>Indexing Resource...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 fill-current" aria-hidden="true" />
                    <span>Initialize Global Distribution</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Document Selection (Right) ── */}
        <div className="lg:col-span-5 space-y-8">
          {/* PDF Drop Zone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            role="button"
            tabIndex={0}
            aria-label={file ? `Selected: ${file.name}. Click to replace.` : "Select a document file"}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
            onClick={() => fileRef.current?.click()}
            className={`group relative aspect-[4/5] rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-8 transition-all duration-500 cursor-pointer overflow-hidden ${
              file
                ? "border-accent bg-accent/5"
                : "border-border bg-surface-2/50 dark:bg-surface-3/30 hover:border-accent hover:bg-accent/5"
            }`}
          >
            <input
              ref={fileRef}
              id="notes-file-input"
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              className="sr-only"
              aria-label="Choose document file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            
            {file ? (() => {
              const info = getFileInfo(file.name);
              const TypeIcon = FileText;
              return (
                <div className="text-center space-y-8 px-8 z-10">
                  <div className="relative">
                    <div className="w-32 h-44 rounded-3xl bg-surface-1 dark:bg-surface-2 border border-border shadow-2xl flex items-center justify-center mx-auto transition-transform group-hover:-translate-y-4 duration-500">
                      <TypeIcon className={`w-16 h-16 text-accent`} aria-hidden="true" />
                    </div>
                    <div className={`absolute -bottom-4 -right-2 px-4 py-2 bg-accent border border-accent/20 rounded-2xl flex items-center justify-center shadow-2xl`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest text-white`}>{info.extension || 'PDF'}</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <p className="text-lg font-black text-text-1 truncate max-w-[240px] mx-auto">{file.name}</p>
                    <p className="text-xs font-bold text-text-3 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • VERIFIED</p>
                  </div>
                  <div className="pt-4">
                    <span className="text-[10px] font-black text-accent bg-accent/10 px-6 py-3 rounded-2xl border border-accent/20 transition-all group-hover:bg-accent group-hover:text-white uppercase tracking-[0.2em]">
                      Switch Resource
                    </span>
                  </div>
                </div>
                );
            })() : (
              <div className="flex flex-col items-center text-center space-y-8 p-10">
                <div className="w-24 h-24 rounded-[32px] bg-surface-1 dark:bg-surface-2 border border-border flex items-center justify-center text-text-4 group-hover:text-accent group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                  <UploadCloud className="w-12 h-12" aria-hidden="true" />
                </div>
                <div className="space-y-3">
                  <p className="text-xl font-black text-text-1">Integrate Resource</p>
                  <p className="text-sm font-medium text-text-3 max-w-[200px]">Drag and drop your study materials or click to browse</p>
                </div>
                <div className="px-6 py-2 bg-surface-1 dark:bg-surface-2 border border-border rounded-xl text-[10px] font-black text-text-4 uppercase tracking-widest group-hover:text-accent group-hover:border-accent transition-all">
                  PDF • Images • Word • PPT
                </div>
              </div>
            )}

            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
            />
          </motion.div>

          {/* Quality Assurance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-1 dark:bg-surface-2 border border-border rounded-[32px] p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-text-1 uppercase tracking-widest">Quality Control</h3>
                <p className="text-xs text-text-3 font-medium">Academic integrity standards</p>
              </div>
            </div>
            
            <ul className="space-y-4 pt-2">
              {[
                "High-resolution scan or digital export",
                "Descriptive and accurate title strings",
                "Proper subject domain categorization",
                "Strict original content verification"
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

          {/* Global Identity Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-accent/10 border border-accent/20 rounded-[32px] p-8 flex items-start gap-5 shadow-sm"
          >
             <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shrink-0 border border-accent/30 shadow-sm">
                <Info className="w-6 h-6" />
             </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-text-1 uppercase tracking-widest">P2P Verification</p>
                <p className="text-xs text-text-3 font-medium leading-relaxed">
                  Upon distribution, your resource will be uniquely hashed and indexed. Peers can verify authenticity through the EduShare protocol.
                </p>
              </div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
