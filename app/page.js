import Link from "next/link";

const features = [
  { icon: "🎥", title: "Teaching Videos", desc: "Upload lessons and earn 5 credits per view.", accent: "bg-amber-50 border-amber-200 text-amber-800" },
  { icon: "📄", title: "Study Notes", desc: "Share PDFs and earn 3 credits per download.", accent: "bg-teal-50 border-teal-200 text-teal-800" },
  { icon: "📡", title: "Live Sessions", desc: "Host live teaching and earn 10 credits per attendee.", accent: "bg-rose-50 border-rose-200 text-rose-800" },
  { icon: "🏆", title: "Credit Rewards", desc: "The more you teach, the more you earn.", accent: "bg-violet-50 border-violet-200 text-violet-800" },
];

const stats = [
  { value: "10K+", label: "Students" },
  { value: "5K+", label: "Resources" },
  { value: "500+", label: "Sessions" },
  { value: "50K+", label: "Credits" },
];

export default function HomePage() {
  return (
    <div className="space-y-20">

      {/* Hero */}
      <section className="relative pt-16 pb-8 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-20 -z-10"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-8 right-1/4 w-64 h-64 rounded-full opacity-15 -z-10"
          style={{ background: "radial-gradient(circle, #7c6af7, transparent 70%)", filter: "blur(40px)" }} />

        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-stone-200 text-zinc-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Student-driven knowledge exchange
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-zinc-900 leading-[1.1] tracking-tight mb-5 max-w-3xl mx-auto">
          Learn from peers,<br />
          <span className="relative inline-block">
            <span className="relative z-10">teach the world</span>
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-200/60 -z-0 rounded" />
          </span>
        </h1>

        <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Upload videos, share notes, host live sessions — all powered by a credit reward system. No money, just knowledge.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register" className="btn-primary px-7 py-3 text-base">
            Start for free →
          </Link>
          <Link href="/explore"
            className="btn-secondary px-7 py-3 text-base">
            Browse content
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className="text-3xl font-black text-zinc-900">{s.value}</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-10">
          <p className="section-label mb-2">Platform features</p>
          <h2 className="text-3xl font-bold text-zinc-900">Everything in one place</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title}
              className={`card-tinted p-6 border ${f.accent} hover:-translate-y-1 transition-transform duration-200`}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-zinc-900 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="card p-8 sm:p-12">
        <div className="text-center mb-10">
          <p className="section-label mb-2">How it works</p>
          <h2 className="text-3xl font-bold text-zinc-900">Simple as 1, 2, 3</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Create account", desc: "Sign up free with email or Google in seconds." },
            { step: "02", title: "Share knowledge", desc: "Upload videos, notes, or host a live session." },
            { step: "03", title: "Earn credits", desc: "Get rewarded every time someone learns from you." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-black mx-auto mb-4 shadow-md">
                {s.step}
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center"
        style={{ background: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)" }}>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)", filter: "blur(30px)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c6af7, transparent 70%)", filter: "blur(30px)" }} />

        <p className="section-label text-zinc-500 mb-3">Join EduShare</p>
        <h2 className="text-3xl font-bold text-white mb-3">Ready to start teaching?</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          Join thousands of students sharing knowledge and earning credits.
        </p>
        <Link href="/register"
          className="inline-block bg-white text-zinc-900 px-8 py-3 rounded-xl font-bold hover:bg-stone-100 transition-colors shadow-lg">
          Create free account
        </Link>
      </section>

    </div>
  );
}
