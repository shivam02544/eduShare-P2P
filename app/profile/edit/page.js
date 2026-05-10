"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { invalidateCache } from "@/lib/cache";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layouts/PageContainer";
import SectionHeader from "@/components/layouts/SectionHeader";
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

// ── Skeleton: matches the real form layout to prevent CLS ─────────────────────
function ProfileEditSkeleton() {
  return (
    <PageContainer aria-label="Loading profile" aria-busy="true">
      <div className="h-10 w-48 rounded-xl bg-surface-2 dark:bg-surface-3 animate-pulse" />
      <div className="grid lg:grid-cols-12 gap-8 mt-8">
        {/* Left: identity + form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-bg dark:bg-surface-2 border border-border p-8 rounded-2xl space-y-4 flex flex-col items-center animate-pulse shadow-sm">
            <div className="w-32 h-32 rounded-full bg-surface-2 dark:bg-surface-3" />
            <div className="h-5 w-36 rounded bg-surface-2 dark:bg-surface-3" />
            <div className="h-4 w-48 rounded bg-surface-2 dark:bg-surface-3" />
          </div>
          <div className="bg-bg dark:bg-surface-2 border border-border p-8 rounded-2xl space-y-6 animate-pulse shadow-sm">
            <div className="h-10 rounded-xl bg-surface-2 dark:bg-surface-3" />
            <div className="h-28 rounded-xl bg-surface-2 dark:bg-surface-3" />
            <div className="h-12 rounded-xl bg-accent/20" />
          </div>
        </div>
        {/* Right: skills panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-bg dark:bg-surface-2 border border-border p-8 rounded-2xl space-y-4 animate-pulse shadow-sm">
            <div className="h-5 w-24 rounded bg-surface-2 dark:bg-surface-3" />
            <div className="flex flex-wrap gap-2">
              {Array(5).fill(0).map((_, i) => <div key={i} className="h-8 w-20 rounded-lg bg-surface-2 dark:bg-surface-3" />)}
            </div>
            <div className="h-10 rounded-xl bg-surface-2 dark:bg-surface-3" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function EditProfilePage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", bio: "", skills: [] });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      authFetch("/api/profile")
        .then((r) => {
          if (!r.ok) throw new Error(`Failed to load profile (${r.status})`);
          return r.json();
        })
        .then((d) => {
          setForm({ name: d.name || "", bio: d.bio || "", skills: d.skills || [] });
          setLoading(false);
        })
        .catch((err) => {
          setFetchError(err.message);
          setLoading(false);
        });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
      toast.success("Profile updated successfully");
      setSaving(false);
    } catch (err) {
      toast.error("Update failed: " + err.message);
      setSaving(false);
    }
  };

  if (authLoading || loading) return <ProfileEditSkeleton />;

  if (fetchError) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-500">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-text-1">Could Not Load Profile</h2>
            <p className="text-sm text-text-3">{fetchError}</p>
          </div>
          <button
            onClick={() => { setFetchError(null); setLoading(true); }}
            className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Retry
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader 
        title="Edit Profile"
        badge="User Settings"
        action={
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 dark:bg-surface-3 border border-border text-sm font-bold text-text-2 hover:text-text-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Cancel
          </button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mt-8">
        
        {/* ── Identity Matrix (Left) ── */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="bg-surface-1 dark:bg-surface-2 border border-border p-8 md:p-10 rounded-[32px] shadow-sm text-center flex flex-col items-center gap-6"
          >
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden ring-8 ring-surface-2 dark:ring-surface-3 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent text-5xl font-bold">
                    {form.name?.[0]?.toUpperCase() || "E"}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-surface-1 dark:bg-surface-3 rounded-2xl shadow-xl flex items-center justify-center border border-border">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-1 tracking-tight">{user.displayName || "EduShare User"}</h2>
              <p className="text-xs font-black text-text-3 uppercase tracking-[0.2em]">{user.email}</p>
            </div>
          </motion.div>

          {/* Configuration Form */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...springConfig }}
            onSubmit={handleSubmit}
            className="bg-surface-1 dark:bg-surface-2 border border-border p-8 md:p-10 rounded-[32px] shadow-sm space-y-8"
          >
            {/* Display Identity */}
            <div className="space-y-3">
              <label htmlFor="profile-name" className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <User className="w-4 h-4 text-accent" aria-hidden="true" />
                Display Name
              </label>
              <input 
                id="profile-name"
                type="text" 
                placeholder="Enter your name..." 
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-2xl px-5 py-4 text-sm font-bold text-text-1 placeholder:text-text-4 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
              />
            </div>

            {/* Biography Hub */}
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="profile-bio" className="text-[10px] font-black text-text-2 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-accent" aria-hidden="true" />
                  Biography
                </label>
                <span className="text-[10px] font-black text-text-4 tracking-widest tabular-nums">{form.bio.length} / 200</span>
              </div>
              <textarea 
                id="profile-bio"
                placeholder="Tell us about yourself..." 
                rows={5}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
                className="w-full bg-surface-2 dark:bg-surface-3 border border-border rounded-2xl px-5 py-4 text-sm font-medium text-text-1 placeholder:text-text-4 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Sync HUD */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full rounded-2xl bg-accent text-white py-5 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-accent-h transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-accent/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Syncing Profile...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Update Profile Identity</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>

        {/* ── Intelligence Hub (Right) ── */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Skill Matrix */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-1 dark:bg-surface-2 border border-border rounded-[32px] p-8 md:p-10 shadow-sm space-y-8"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                   <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-text-1">Skills & Domain</h3>
              </div>
              <p className="text-xs font-bold text-text-3 uppercase tracking-widest leading-relaxed">Define your areas of academic expertise</p>
            </div>

            {/* Active Core */}
            <div className="flex flex-wrap gap-2 min-h-[64px] p-5 bg-surface-2/50 dark:bg-surface-3/30 rounded-2xl border border-border">
              <AnimatePresence>
                {form.skills.map((s) => (
                  <motion.span 
                    key={s}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 bg-accent/10 text-accent text-[10px] font-black px-3 py-2 rounded-xl border border-accent/20 uppercase tracking-widest group/skill"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      aria-label={`Remove skill: ${s}`}
                      className="hover:text-red-500 transition-colors focus-visible:outline-none rounded p-0.5"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              {form.skills.length === 0 && (
                <div className="flex items-center justify-center w-full py-2">
                   <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">No Nodes Integrated</p>
                </div>
              )}
            </div>

            {/* Node Injector */}
            <div className="space-y-6">
              <div className="relative flex gap-3">
                <label htmlFor="skill-input" className="sr-only">Add a skill</label>
                <input
                  id="skill-input"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }}}
                  className="flex-1 bg-surface-2 dark:bg-surface-3 border border-border rounded-xl px-5 py-3 text-sm font-bold text-text-1 placeholder:text-text-4 focus:border-accent transition-all outline-none"
                  placeholder="Insert new expertise..."
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  aria-label="Add skill"
                  className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-h transition-all shrink-0 active:scale-95 shadow-lg shadow-accent/10"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Suggestions Node */}
              <div className="space-y-4 pt-2">
                <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em] ml-1">Knowledge Suggestions</p>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Suggested skills">
                  {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="listitem"
                      onClick={() => addSkill(s)}
                      aria-label={`Add skill: ${s}`}
                      className="text-[10px] font-black px-3 py-2 rounded-xl border border-border text-text-3 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all uppercase tracking-widest active:scale-95"
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
            className="bg-accent/10 border border-accent/20 rounded-[32px] p-8 flex items-start gap-5 shadow-sm"
          >
             <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shrink-0 border border-accent/30 shadow-sm">
                <Info className="w-6 h-6" />
             </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-text-1 uppercase tracking-widest">Authentication Link</p>
                <p className="text-xs text-text-3 font-medium leading-relaxed">
                  Your profile identity is managed through your primary authentication provider. Modifications to the avatar must be performed at the source.
                </p>
              </div>
          </motion.div>

        </div>
      </div>
    </PageContainer>
  );
}

