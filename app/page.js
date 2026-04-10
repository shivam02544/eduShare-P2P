import Link from "next/link";
import SpotlightHero from "@/components/SpotlightHero";
import HomeClient from "@/components/HomeClient";

const stats = [
  { value: "10K+", label: "Students",     icon: "👥" },
  { value: "5K+",  label: "Resources",    icon: "📚" },
  { value: "500+", label: "Live Sessions", icon: "📡" },
  { value: "50K+", label: "Credits Earned", icon: "🏆" },
];

export default function HomePage() {
  return (
    <div className="space-y-28 pb-12">

      {/* ── Hero ── */}
      <SpotlightHero className="pt-16 sm:pt-24 pb-4 text-center max-w-4xl mx-auto">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full -z-10 animate-drift pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-16 right-1/4 w-64 h-64 rounded-full -z-10 animate-drift pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)", filter: "blur(60px)", animationDelay: "3s" }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-40 -translate-x-1/2 -z-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.08), transparent 70%)", filter: "blur(40px)" }} />

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12px] font-medium mb-8 animate-fade-up"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-2)", boxShadow: "var(--shadow-sm)" }}>
          <span className="live-dot" style={{ width: 7, height: 7 }} />
          Student-driven knowledge exchange
        </div>

        {/* Headline */}
        <h1 className="text-[44px] sm:text-[60px] lg:text-[70px] font-black leading-[1.04] tracking-[-0.04em] mb-5 animate-fade-up"
          style={{ animationDelay: "60ms", color: "var(--text-1)" }}>
          Learn from peers,
          <br />
          <span className="gradient-text">teach the world.</span>
        </h1>

        <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-xl mx-auto mb-10 animate-fade-up"
          style={{ animationDelay: "120ms", color: "var(--text-2)" }}>
          Upload videos, share notes, host live sessions — all powered by a credit reward system.
          <strong style={{ color: "var(--text-1)" }}> No money, just knowledge.</strong>
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-up" style={{ animationDelay: "180ms" }}>
          <Link href="/register"
            className="btn-accent px-7 py-3 text-[14px] rounded-xl"
            style={{ boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}>
            Start for free →
          </Link>
          <Link href="/explore" className="btn-secondary px-7 py-3 text-[14px] rounded-xl">
            Browse content
          </Link>
        </div>

        <p className="mt-6 text-[12px] animate-fade-up" style={{ animationDelay: "240ms", color: "var(--text-3)" }}>
          Free forever · No credit card required · 10,000+ students
        </p>
      </SpotlightHero>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 stagger-grid">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 sm:p-6 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-[28px] sm:text-[32px] font-black tracking-tight stat-number" style={{ color: "var(--text-1)" }}>
              {s.value}
            </p>
            <p className="text-[11px] mt-1 font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Client-side interactive sections: Features / Steps / Testimonials ── */}
      <HomeClient />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)" }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full animate-drift pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18), transparent 70%)", filter: "blur(50px)" }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full animate-drift pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.14), transparent 70%)", filter: "blur(40px)", animationDelay: "4s" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-[11px] font-medium text-white/60 mb-6">
            <span className="live-dot" style={{ width: 6, height: 6, background: "#4ade80" }} />
            Join EduShare today
          </div>
          <h2 className="text-[28px] sm:text-[38px] font-black tracking-tight text-white leading-tight mb-4">
            Ready to start teaching?
          </h2>
          <p className="text-[15px] mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Join thousands of students sharing knowledge and earning credits every day.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:shadow-xl"
              style={{ background: "white", color: "#1e1b4b" }}>
              Create free account →
            </Link>
            <Link href="/explore"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[14px] font-medium text-white transition-all duration-200 hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.25)" }}>
              Browse content
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
