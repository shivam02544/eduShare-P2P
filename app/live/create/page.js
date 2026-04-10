"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radio, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  Zap, 
  ChevronLeft, 
  Info, 
  Video,
  Loader2,
  Sparkles,
  Signal,
  CreditCard
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };
const SUBJECTS = ["Math", "Science", "History", "Programming", "English", "Physics", "Chemistry", "Biology", "Other"];

export default function CreateSessionPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "Math",
    date: "",
    time: "",
    meetingLink: "",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.meetingLink) {
      toast.error("Please complete all mandatory fields");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: new Date(`${form.date}T${form.time}`).toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Session scheduled successfully");
        router.push("/live");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to start session");
      }
    } catch (err) {
      toast.error("Transmission error. Please try again.");
    } finally {
      setLoading(false);
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Live Session</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Status: Ready</span>
          </div>
          <h1 className="text-2xl font-black text-text-1 tracking-tight">
            Schedule <span className="text-rose-500">Session</span>
          </h1>
        </div>

        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Cancel
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* ── Broadcast Form (Left) ── */}
        <div className="lg:col-span-7 space-y-8">
          <motion.form 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            onSubmit={handleSubmit}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-10 rounded-[48px] shadow-3xl space-y-8"
          >
            {/* Session Identity */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Session Title</label>
              <input 
                type="text" 
                placeholder="Enter session title..." 
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-base font-black text-text-1 placeholder:opacity-30 focus:border-rose-500 transition-all outline-none"
              />
            </div>

            {/* Config Matrix */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Subject Area</label>
                <select 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-sm font-black text-text-1 focus:border-rose-500 transition-all outline-none cursor-pointer appearance-none"
                >
                  {SUBJECTS.map((s) => <option key={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Stream Status</label>
                 <div className="w-full bg-rose-500/5 border border-rose-500/10 rounded-3xl px-6 py-4 flex items-center gap-3">
                    <Signal className="w-5 h-5 text-rose-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Live Stream</span>
                 </div>
              </div>
            </div>

            {/* Intelligence Summary */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Session Description</label>
              <textarea 
                placeholder="Describe what students will learn..." 
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-sm font-medium text-text-1 placeholder:opacity-30 focus:border-rose-500 transition-all outline-none resize-none"
              />
            </div>

            {/* Temporal Matrix */}
            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 ml-1 text-[9px] font-black uppercase tracking-widest text-text-3">
                     <Calendar className="w-3 h-3" />
                     Session Date
                  </div>
                  <input 
                    type="date" 
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3 text-sm font-black text-text-1 outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-2 ml-1 text-[9px] font-black uppercase tracking-widest text-text-3">
                     <Clock className="w-3 h-3" />
                     Session Time
                  </div>
                  <input 
                    type="time" 
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3 text-sm font-black text-text-1 outline-none"
                  />
               </div>
            </div>

            {/* Launch Path */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1 flex items-center gap-2">
                <LinkIcon className="w-3 h-3 text-rose-500" />
                Meeting Link (URL)
              </label>
              <input 
                type="url" 
                placeholder="Zoom, Google Meet, etc." 
                required
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-base font-black text-text-1 placeholder:opacity-30 focus:border-rose-500 transition-all outline-none"
              />
            </div>

            {/* Submit HUD */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-[32px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-6 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Starting Session...</p>
                  </>
                ) : (
                  <>
                    <Radio className="w-8 h-8 group-hover:scale-125 transition-transform" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-1">Start Session</p>
                  </>
                )}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[60px] -z-0" />
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Intelligence Hub (Right) ── */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Signal Statistics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[48px] p-10 shadow-3xl space-y-8"
          >
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-[24px] bg-rose-500 flex items-center justify-center text-white shadow-2xl">
                  <Zap className="w-8 h-8" />
               </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-text-1">Session Rewards</h3>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Tier 1: Global</span>
                  </div>
               </div>
             </div>

             <div className="bg-slate-50 dark:bg-white/5 border border-border rounded-[32px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black uppercase tracking-widest text-text-3">Reward Per Student</p>
                   <p className="text-sm font-black text-emerald-500">+10 Credits</p>
                </div>
                <p className="text-[11px] font-medium text-text-3 leading-relaxed">
                   You will earn 10 credits for every student that joins your session live.
                </p>
             </div>

             <div className="pt-2">
                <div className="flex items-center gap-3 text-text-3">
                   <Info className="w-4 h-4 text-rose-500" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Active Verification Required</p>
                </div>
             </div>
          </motion.div>

          {/* Infrastructure Node */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative aspect-video rounded-[48px] border border-border bg-slate-900 overflow-hidden shadow-2xl"
          >
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                   <Video className="w-6 h-6" />
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Camera Preview</p>
                   <p className="text-[8px] font-medium text-white/60 uppercase tracking-widest mt-1">Camera Offline</p>
                </div>
             </div>
             <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-white/80">System: Online</span>
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

