"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { invalidateCache } from "@/lib/cache";

const SKILL_SUGGESTIONS = ["Math", "Physics", "Chemistry", "Biology", "Programming", "History", "English", "Science", "Economics"];

export default function EditProfilePage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", bio: "", skills: [] });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  // Load current profile
  useEffect(() => {
    if (user) {
      authFetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          setForm({ name: d.name || "", bio: d.bio || "", skills: d.skills || [] });
          setLoading(false);
        });
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
    setSuccess(false);

    // Update Firebase display name
    if (form.name && form.name !== user.displayName) {
      await updateProfile(auth.currentUser, { displayName: form.name });
    }

    // Update MongoDB
    await authFetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, bio: form.bio, skills: form.skills }),
    });

    invalidateCache("dashboard");
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
        <div className="skeleton h-7 w-40" />
        <div className="card p-6 space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-10 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Edit Profile</h1>
        <p className="text-zinc-400 text-sm mt-1">Update your public profile information</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Profile updated successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* Avatar preview */}
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-zinc-100" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 text-2xl font-bold">
              {form.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-zinc-700">Profile photo</p>
            <p className="text-xs text-zinc-400 mt-0.5">Managed by Google — change it in your Google account</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Display Name</label>
          <input type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input" placeholder="Your full name" />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Bio</label>
          <textarea rows={3} value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="input resize-none"
            placeholder="Tell others what you teach or study..." />
          <p className="text-xs text-zinc-400 mt-1">{form.bio.length}/200 characters</p>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
            Skills / Subjects
          </label>

          {/* Current skills */}
          <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
            {form.skills.map((s) => (
              <span key={s}
                className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-100 text-xs px-2.5 py-1 rounded-full">
                {s}
                <button type="button" onClick={() => removeSkill(s)}
                  className="hover:text-violet-900 ml-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {/* Skill input */}
          <div className="flex gap-2">
            <input type="text" value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }}}
              className="input flex-1" placeholder="Add a skill and press Enter" />
            <button type="button" onClick={() => addSkill(skillInput)} className="btn-secondary px-3">
              Add
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map((s) => (
              <button key={s} type="button" onClick={() => addSkill(s)}
                className="text-xs px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500 hover:border-violet-300 hover:text-violet-600 transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Saving...
            </span>
          ) : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
