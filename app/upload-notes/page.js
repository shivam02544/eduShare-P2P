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
        badge="Type: Document"
        action={
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-border text-sm font-bold text-text-2 hover:text-text-1 transition-all"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Cancel Upload
          </button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-8 mt-8">

        {/* ── Upload Form (Left) ── */}
        <div className="lg:col-span-7 space-y-8">
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6"
          >
            {/* Error Banner */}
            {error && (
              <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-400 leading-snug">{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="notes-title" className="text-sm font-bold text-text-2">Title</label>
              <input
                id="notes-title"
                type="text"
                placeholder="Enter title..."
                required
                autoComplete="off"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-1 placeholder:text-text-4 focus:border-emerald-500 transition-colors outline-none"
              />
            </div>

            {/* Category + Visibility */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="notes-subject" className="text-sm font-bold text-text-2">Category</label>
                <select
                  id="notes-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-1 focus:border-emerald-500 transition-colors outline-none cursor-pointer appearance-none"
                >
                  {SUBJECTS.map((s) => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-bold text-text-2" aria-hidden="true">Visibility</span>
                <div className="w-full bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Public Access</span>
                </div>
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-border p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p id="premium-toggle-label" className="text-sm font-bold text-text-1">Charge for Download</p>
                  <p className="text-xs text-text-3">Set a price in credits for this document</p>
                </div>
                {/* Accessible toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPremium}
                  aria-labelledby="premium-toggle-label"
                  onClick={() => setIsPremium(!isPremium)}
                  className={`relative w-12 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    isPremium ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      isPremium ? "translate-x-7" : "translate-x-1"
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
                    className="pt-4 border-t border-border space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="space-y-2 flex-1">
                        <label htmlFor="premium-cost" className="text-xs font-bold text-text-3 uppercase tracking-wider">
                          Price (Credits)
                        </label>
                        <input
                          id="premium-cost"
                          type="number"
                          min={1}
                          max={100}
                          value={premiumCost}
                          onChange={(e) => setPremiumCost(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-full bg-white dark:bg-slate-800 border border-border rounded-xl px-4 py-2 text-sm font-bold text-text-1 outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div className="flex items-center justify-center p-3 bg-amber-500 rounded-xl text-white" aria-hidden="true">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" aria-hidden="true" />
                      Price set to: {premiumCost} Credits per download
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={uploading}
                aria-disabled={uploading}
                aria-busy={uploading}
                className="w-full rounded-xl bg-emerald-600 text-white p-4 flex items-center justify-center gap-2 font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" aria-hidden="true" />
                    <span>Upload Notes</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Document Selection (Right) ── */}
        <div className="lg:col-span-5 space-y-6">

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
            className={`group relative aspect-square md:aspect-[4/5] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden ${
              file
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                : "border-border bg-slate-50 dark:bg-slate-800/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
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
              const TypeIcon = FileType;
              return (
                <div className="text-center space-y-6 px-10 z-10">
                  <div className="relative">
                    <div className="w-24 h-32 rounded-xl bg-white dark:bg-slate-800 border border-border shadow-md flex items-center justify-center mx-auto group-hover:-translate-y-2 transition-transform">
                      <TypeIcon className={`w-10 h-10 ${info.color}`} aria-hidden="true" />
                    </div>
                    <div className={`absolute -bottom-3 -right-3 px-3 py-1 ${info.bg} border ${info.borderColor} rounded-lg flex items-center justify-center shadow-sm`}>
                      <p className={`text-xs font-bold uppercase ${info.color}`}>{info.extension}</p>
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <p className="text-sm font-bold text-text-1 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs font-medium text-text-3">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${info.bg} ${info.color} border ${info.borderColor}`}>{info.label}</span>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-xl transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                  >
                    Replace File
                  </button>
                </div>
              );
            })() : (
              <>
                <UploadCloud className="w-12 h-12 text-text-4 group-hover:text-emerald-500 transition-colors" aria-hidden="true" />
                <div className="text-center px-10">
                  <p className="text-sm font-bold text-text-1">Select a Document</p>
                  <p className="text-xs font-medium text-text-3 mt-1">PDF, Images, Word, PPT, Excel, TXT, CSV</p>
                </div>
              </>
            )}
            <div className="absolute bottom-6 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
              <p className="text-xs font-medium text-text-4">Max file size: 50MB</p>
            </div>
          </motion.div>

          {/* Copyright Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl p-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-text-2 shadow-sm shrink-0" aria-hidden="true">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-1">Copyright Agreement</p>
              <p className="text-xs text-text-3 leading-relaxed">By uploading this file, you confirm that you own the rights to this content.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </PageContainer>
  );
}
