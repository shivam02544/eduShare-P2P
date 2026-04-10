"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { invalidateCache } from "@/lib/cache";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Fingerprint, 
  Sparkles, 
  Plus, 
  X, 
  ShieldCheck, 
  ChevronLeft, 
  Zap, 
  Info,
  CheckCircle2,
  Loader2,
  Tag
} from "lucide-react";
import { toast } from "react-hot-toast";

const springConfig = { mass: 1, tension: 120, friction: 20 };
const SKILL_SUGGESTIONS = ["Math", "Physics", "Chemistry", "Biology", "Programming", "History", "English", "Science", "Economics"];

export default function EditProfilePage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", bio: "", skills: [] });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      authFetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          setForm({ name: d.name || "", bio: d.bio || "", skills: d.skills || [] });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s) && form.skills.length < 10) {
      setForm({ ...form, skills: [...form.skills, s] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (form.name && form.name !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.name });
      }

      await authFetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, bio: form.bio, skills: form.skills }),
      });

      invalidateCache("dashboard");
      toast.success("Identity synchronization complete");
      setSaving(false);
    } catch (err) {
      toast.error("Synchronization failure: " + err.message);
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-vh-50 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Loading Profile...</p>
      </div>
    );
  }

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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">User Profile</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">Status: Verified</span>
          </div>
          <h1 className="text-2xl font-black text-text-1 tracking-tight">
            Edit <span className="text-indigo-500">Profile</span>
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
        
        {/* ── Identity Matrix (Left) ── */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-10 rounded-[48px] shadow-3xl text-center flex flex-col items-center gap-6"
          >
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] overflow-hidden ring-4 ring-slate-100 dark:ring-white/5 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white text-4xl font-black">
                    {form.name?.[0]?.toUpperCase() || "E"}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border border-border">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-text-1">{user.displayName || "EduShare User"}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-3 opacity-60">{user.email}</p>
            </div>
          </motion.div>

          {/* Configuration Form */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...springConfig }}
            onSubmit={handleSubmit}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-10 rounded-[48px] shadow-3xl space-y-8"
          >
            {/* Display Identity */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 ml-1 flex items-center gap-2">
                <User className="w-3 h-3 text-indigo-500" />
                Display Name
              </label>
              <input 
                type="text" 
                placeholder="Enter your name..." 
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-base font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            {/* Biography Hub */}
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 flex items-center gap-2">
                  <Fingerprint className="w-3 h-3 text-indigo-500" />
                  Bio & Description
                </label>
                <span className="text-[10px] font-black text-text-3 tabular-nums">{form.bio.length} / 200</span>
              </div>
              <textarea 
                placeholder="Tell us about yourself..." 
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
                className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-3xl px-6 py-4 text-sm font-medium text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none resize-none"
              />
            </div>

            {/* Sync HUD */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving}
                className="group relative w-full overflow-hidden rounded-[32px] bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-6 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Saving Changes...</p>
                  </>
                ) : (
                  <>
                    <Zap className="w-8 h-8 group-hover:scale-125 transition-transform" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-1">Update Profile Details</p>
                  </>
                )}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[60px] -z-0" />
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Intelligence Hub (Right) ── */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Skill Matrix */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[48px] p-10 shadow-3xl space-y-8"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-black text-text-1">Skills & Interests</h3>
              </div>
              <p className="text-[10px] font-medium text-text-3">List your specialized areas of knowledge</p>
            </div>

            {/* Active Core */}
            <div className="flex flex-wrap gap-3 min-h-[48px] p-4 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-border/50">
              <AnimatePresence>
                {form.skills.map((s) => (
                  <motion.span 
                    key={s}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-lg shadow-indigo-500/20"
                  >
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:rotate-90 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              {form.skills.length === 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-text-3 opacity-20 flex items-center justify-center w-full">No skills added yet</p>
              )}
            </div>

            {/* Node Injector */}
            <div className="space-y-4">
              <div className="relative group">
                <input 
                  type="text" 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }}}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3 text-sm font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
                  placeholder="Add a new skill..." 
                />
                <button 
                  type="button" 
                  onClick={() => addSkill(skillInput)}
                  className="absolute right-2 top-2 w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                >
                   <Plus className="w-4 h-4 shadow-sm" />
                </button>
              </div>

              {/* Suggestions Node */}
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-3 ml-1">Suggested Skills</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map((s) => (
                    <button 
                      key={s} 
                      type="button" 
                      onClick={() => addSkill(s)}
                      className="text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-border text-text-3 hover:border-indigo-500 hover:text-text-1 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Security */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-indigo-500/5 border border-indigo-500/10 rounded-[40px] p-8 flex items-start gap-6"
          >
             <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-2xl">
                <Info className="w-6 h-6" />
             </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Profile Picture</p>
                <p className="text-[11px] font-medium text-text-3 leading-relaxed">
                  Your profile picture is linked to your Google account and cannot be modified directly on this platform.
                </p>
              </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

