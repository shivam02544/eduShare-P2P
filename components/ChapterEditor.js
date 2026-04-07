"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/** Convert seconds to MM:SS or HH:MM:SS */
function formatTime(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Parse MM:SS or HH:MM:SS to seconds */
function parseTime(str) {
  const parts = str.trim().split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

export default function ChapterEditor({ videoId, initialChapters = [], onSaved }) {
  const { authFetch } = useAuth();
  const [chapters, setChapters] = useState(
    initialChapters.length > 0
      ? initialChapters.map((c) => ({ title: c.title, time: formatTime(c.timestamp) }))
      : [{ title: "Introduction", time: "0:00" }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const addChapter = () => {
    if (chapters.length >= 20) return;
    setChapters([...chapters, { title: "", time: "" }]);
  };

  const removeChapter = (i) => {
    if (chapters.length === 1) return;
    setChapters(chapters.filter((_, idx) => idx !== i));
  };

  const update = (i, field, value) => {
    const updated = [...chapters];
    updated[i] = { ...updated[i], [field]: value };
    setChapters(updated);
  };

  const handleSave = async () => {
    setError(""); setSuccess(false);

    const parsed = [];
    for (let i = 0; i < chapters.length; i++) {
      const c = chapters[i];
      if (!c.title.trim()) return setError(`Chapter ${i + 1} needs a title`);
      const ts = parseTime(c.time);
      if (ts === null) return setError(`Chapter ${i + 1} has invalid time format (use M:SS or H:MM:SS)`);
      parsed.push({ title: c.title.trim(), timestamp: ts });
    }

    setSaving(true);
    const res = await authFetch(`/api/videos/${videoId}/chapters`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapters: parsed }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) return setError(data.error);

    // Sync back sorted chapters from server
    setChapters(data.chapters.map((c) => ({ title: c.title, time: formatTime(c.timestamp) })));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    onSaved?.(data.chapters);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Chapters saved
        </div>
      )}

      <p className="text-xs text-zinc-400">
        Format: <span className="font-mono">M:SS</span> or <span className="font-mono">H:MM:SS</span> · First chapter must be 0:00
      </p>

      <div className="space-y-2">
        {chapters.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Time input */}
            <input
              type="text"
              placeholder="0:00"
              value={c.time}
              onChange={(e) => update(i, "time", e.target.value)}
              className="input w-24 font-mono text-sm text-center flex-shrink-0"
            />
            {/* Title input */}
            <input
              type="text"
              placeholder={`Chapter ${i + 1} title`}
              value={c.title}
              onChange={(e) => update(i, "title", e.target.value)}
              maxLength={100}
              className="input flex-1"
            />
            {/* Remove */}
            {chapters.length > 1 && (
              <button onClick={() => removeChapter(i)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400
                           hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {chapters.length < 20 && (
        <button onClick={addChapter}
          className="w-full py-2.5 border-2 border-dashed border-stone-300 rounded-xl text-sm text-zinc-500
                     hover:border-zinc-400 hover:text-zinc-700 transition-colors">
          + Add Chapter
        </button>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
        {saving ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : null}
        {saving ? "Saving..." : "Save Chapters"}
      </button>
    </div>
  );
}
