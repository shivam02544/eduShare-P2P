import Link from "next/link";
import SpotlightHero from "@/components/SpotlightHero";

const features = [
  { icon: "🎥", title: "Teaching Videos", desc: "Upload lessons. Earn 5 credits per view.", tag: "Video" },
  { icon: "📄", title: "Study Notes", desc: "Share PDFs. Earn 3 credits per download.", tag: "Notes" },
  { icon: "📡", title: "Live Sessions", desc: "Host live teaching. Earn 10 credits per attendee.", tag: "Live" },
  { icon: "🏆", title: "Credit Rewards", desc: "The more you teach, the more you earn.", tag: "Credits" },
];

const stats = [
  { value: "10K+", label: "Students" },
  { value: "5K+", label: "Resources" },
  { value: "500+", label: "Sessions" },
  { value: "50K+", label: "Credits" },
];

const steps = [
  { n: "01", title: "Create account", desc: "Sign up free in seconds." },
  { n: "02", title: "Share knowledge", desc: "Upload videos, notes, or go live." },
  { n: "03", title: "Earn credits", desc: "Get rewarded every time someone learns." },
];

export default function HomePage() {
  return (
    <div className="space-y-28">

      {/* ── Hero ── */}
      <SpotlightHero className="pt-20 pb-6 text-center max-w-3xl mx-auto">
        {/* Drifting blobs */}
        <div className="absolute top-4 left-1/4 w-64 h-64 rounded-full -z-10 animate-drift"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)", filter: "blur(48px)" }} />
        <div className="absolute top-12 right-1/4 w-56 h-56 rounded-full -z-10 animate-drift"
          style={{ background: "radial-gradient(circle, rgba(109,86,245,0.1), transparent 70%)", filter: "blur(48px)", animationDelay: "3s" }} />

        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-8 animate-fade-up"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-2)" }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          Student-driven knowledge exchange
        </div>

        {/* Headline */}
        <h1 className="text-[52px] sm:text-[64px] font-black leading-[1.05] tracking-[-0.03em] mb-5 animate-fade-up"
          style={{ animationDelay: "60ms", color: "var(--text-1)" }}>
          Learn from peers,
          <br />
          <span style={{ color: "var(--accent)" }}>teach the world</span>
        </h1>

        <p className="text-lg leading-relaxed max-w-lg mx-auto mb-8 animate-fade-up"
          style={{ animationDelay: "120ms", color: "var(--text-2)" }}>
          Upload videos, share notes, host live sessions — all powered by a credit reward system. No money, just knowledge.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-up" style={{ animationDelay: "180ms" }}>
          <Link href="/register" className="btn-primary px-6 py-2.5 text-sm">
            Start for free →
          </Link>
          <Link href="/explore" className="btn-secondary px-6 py-2.5 text-sm">
            Browse content
          </Link>
        </div>
      </SpotlightHero>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-grid">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className="text-3xl font-black tracking-tight stat-number" style={{ color: "var(--text-1)" }}>{s.value}</p>
            <p className="text-xs mt-1 font-medium uppercase tracking-widest" style={{ color: "var(--text-3)" }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section>
        <div className="text-center mb-10">
          <p className="section-label mb-2">Platform</p>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
            Everything in one place
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger-grid">
          {features.map((f) => (
            <div key={f.title} className="card p-5 group">
              <div className="card-shine" />
              <div className="text-2xl mb-3">{f.icon}</div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>{f.tag}</p>
              <h3 className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-1)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="card p-8 sm:p-12">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Process</p>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Simple as 1, 2, 3</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 stagger-grid">
          {steps.map((s, i) => (
            <div key={s.n} className="text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black mx-auto mb-4"
                style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                {s.n}
              </div>
              <h3 className="font-semibold mb-1.5 text-sm" style={{ color: "var(--text-1)" }}>{s.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-2)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden rounded-2xl p-10 sm:p-14 text-center"
        style={{ background: "var(--text-1)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -z-0 animate-drift"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.15), transparent 70%)", filter: "blur(40px)", animationDelay: "1s" }} />
        <div className="relative z-10">
          <p className="section-label mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Join EduShare</p>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Ready to start teaching?</h2>
          <p className="mb-8 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Join thousands of students sharing knowledge and earning credits.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "white", color: "var(--text-1)" }}>
            Create free account →
          </Link>
        </div>
      </section>

    </div>
  );
}
