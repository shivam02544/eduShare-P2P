"use client";

const features = [
  {
    icon: "🎥",
    title: "Teaching Videos",
    desc: "Upload your lessons and earn credits every time a student watches. Build your teaching portfolio.",
    tag: "Video",
    color: "#6366f1",
    bg: "#f5f3ff",
  },
  {
    icon: "📄",
    title: "Study Notes",
    desc: "Share PDFs, handouts, and study guides. Get rewarded with credits for every download.",
    tag: "Notes",
    color: "#10b981",
    bg: "#f0fdf4",
  },
  {
    icon: "📡",
    title: "Live Sessions",
    desc: "Host interactive live classes. Connect with students in real-time and earn bonus credits.",
    tag: "Live",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    icon: "🏆",
    title: "Credit Rewards",
    desc: "A fair economy where teaching is valued. The more you share, the more you earn.",
    tag: "Credits",
    color: "#ec4899",
    bg: "#fdf2f8",
  },
];

const steps = [
  {
    n: "01",
    title: "Create your account",
    desc: "Sign up free in seconds. No credit card needed.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
  {
    n: "02",
    title: "Share your knowledge",
    desc: "Upload videos, notes, or go live. Any subject, any level.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
      </svg>
    ),
  },
  {
    n: "03",
    title: "Earn as you teach",
    desc: "Get credits for every view, download, and attendee. Spend credits to access premium content.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
];

const testimonials = [
  {
    name: "Priya S.",
    role: "Engineering Student",
    text: "EduShare helped me ace my semester exams. The peer-uploaded content is gold.",
    avatar: "P",
    color: "#6366f1",
  },
  {
    name: "Rahul M.",
    role: "Content Creator",
    text: "I've earned over 2000 credits teaching programming. It's genuinely rewarding.",
    avatar: "R",
    color: "#10b981",
  },
  {
    name: "Aisha K.",
    role: "Study Group Leader",
    text: "The live sessions feature changed how our group revises. Real-time teaching is powerful.",
    avatar: "A",
    color: "#f59e0b",
  },
];

export default function HomeClient() {
  return (
    <>
      {/* ── Features ── */}
      <section>
        <div className="text-center mb-12">
          <p className="section-label mb-3">Platform</p>
          <h2 className="section-title mb-3">Everything in one place</h2>
          <p className="text-[15px] max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
            A complete learning ecosystem built by students, for students.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-grid">
          {features.map((f) => (
            <div key={f.title}
              className="card p-6 cursor-default"
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
              <div className="card-shine" />
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
                style={{ background: f.bg }}>
                {f.icon}
              </div>
              <span className="badge mb-2 text-[10px]"
                style={{ background: f.bg, color: f.color, border: `1px solid ${f.color}30` }}>
                {f.tag}
              </span>
              <h3 className="font-bold text-[14px] mb-2 mt-1" style={{ color: "var(--text-1)" }}>{f.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-2)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section>
        <div className="text-center mb-12">
          <p className="section-label mb-3">Process</p>
          <h2 className="section-title mb-3">Simple as 1, 2, 3</h2>
          <p className="text-[15px] max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
            Get started in minutes and become part of a growing learning community.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-grid">
          {steps.map((s, i) => (
            <div key={s.n} className="card p-7 relative overflow-hidden">
              <div className="absolute -top-2 -right-2 text-[80px] font-black leading-none select-none pointer-events-none"
                style={{ color: "var(--border)", opacity: 0.5 }}>
                {s.n}
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                style={{ background: "var(--accent-2)", color: "var(--accent)", border: "1px solid var(--accent-3)" }}>
                {s.icon}
              </div>
              <h3 className="font-bold text-[14px] mb-2 relative z-10" style={{ color: "var(--text-1)" }}>{s.title}</h3>
              <p className="text-[13px] leading-relaxed relative z-10" style={{ color: "var(--text-2)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section>
        <div className="text-center mb-12">
          <p className="section-label mb-3">Community</p>
          <h2 className="section-title mb-3">Loved by students</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-0.5 mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="w-4 h-4" fill="#f59e0b" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-[13.5px] leading-relaxed mb-5 italic" style={{ color: "var(--text-2)" }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{t.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
