"use client";
import React from "react";
import { 
  Video, 
  FileText, 
  Zap, 
  Shield, 
  Sparkles, 
  Star, 
  Users, 
  ArrowRight,
  Activity,
  Layers,
  Database,
  Cpu,
  Monitor,
  ShieldCheck,
  ChevronRight,
  Target,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const protocolNodes = [
  {
    icon: Video,
    title: "Share Video Lessons",
    desc: "Upload high-quality video lessons on any subject. Earn credits every time a peer watches your content.",
    tag: "Video",
    color: "text-indigo-500",
    bg: "bg-indigo-500/5",
  },
  {
    icon: FileText,
    title: "Upload Study Notes",
    desc: "Share PDFs, revision sheets, and study guides. Earn credits for every download by a fellow student.",
    tag: "Notes",
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
  },
  {
    icon: Activity,
    title: "Host Live Classes",
    desc: "Run interactive live sessions in real-time. Engage directly with students and earn bonus credits.",
    tag: "Live",
    color: "text-rose-500",
    bg: "bg-rose-500/5",
  },
  {
    icon: Zap,
    title: "Earn Credits",
    desc: "A merit-based economy where quality contributions are rewarded. The more you teach, the more you earn.",
    tag: "Credits",
    color: "text-amber-500",
    bg: "bg-amber-500/5",
  },
];

const syncSequence = [
  {
    n: "01",
    title: "Create Your Account",
    desc: "Sign up in seconds with no complex setup. Your profile is your academic identity on the platform.",
    icon: Users,
    color: "text-indigo-500",
  },
  {
    n: "02",
    title: "Share Your Knowledge",
    desc: "Upload videos, notes, or go live. Every subject, any format — your knowledge has a home here.",
    icon: Database,
    color: "text-emerald-500",
  },
  {
    n: "03",
    title: "Earn & Grow",
    desc: "Collect credits for every view and download. Spend them to unlock premium content from other creators.",
    icon: Zap,
    color: "text-amber-500",
  },
];

const agentTestimonials = [
  {
    name: "Priya S.",
    role: "Engineering Student",
    text: "EduShare completely changed how I study. The peer-created content is so much more relatable than textbooks.",
    avatar: "P",
    color: "bg-indigo-500",
  },
  {
    name: "Rahul M.",
    role: "Computer Science",
    text: "I've earned over 2,000 credits by uploading my notes. It actually motivates me to make them better.",
    avatar: "R",
    color: "bg-emerald-500",
  },
  {
    name: "Aisha K.",
    role: "Pre-Med Student",
    text: "Live classes on EduShare are incredible. Real-time doubt clearing with peers is unmatched.",
    avatar: "A",
    color: "bg-rose-500",
  },
];

export default function HomeClient() {
  return (
    <div className="space-y-40 pb-40">
      
      {/* ── Foundation Nodes: Features ── */}
      <section>
        <div className="text-center mb-20 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
             <div className="w-12 h-px bg-indigo-500/20" />
           <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">What We Offer</p>
             <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-1 tracking-tight">Everything You Need to Learn</h2>
          <p className="text-sm md:text-base text-text-2 font-medium max-w-xl mx-auto leading-relaxed">
            A frictionless learning ecosystem engineered for the next generation of scholars.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-6">
          {protocolNodes.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all"
              >
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-border/50 ${f.bg} ${f.color}`}>
                  <Icon className="w-6 h-6 stroke-[2px]" />
                </div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 text-[9px] font-bold uppercase tracking-widest text-text-3 mb-4">
                  <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                  {f.tag}
                </div>
                
                <h3 className="text-lg font-bold text-text-1 tracking-tight mb-3 group-hover:text-indigo-500 transition-colors">{f.title}</h3>
                <p className="text-sm text-text-2 leading-relaxed">{f.desc}</p>
                
                <div className="pt-6 flex justify-end">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-border flex items-center justify-center text-text-3 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Synchronization Sequence: How it works ── */}
      <section className="relative overflow-hidden py-10">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 dark:bg-white/[0.02] -z-10" />
        
        <div className="text-center mb-16 space-y-4">
           <div className="flex items-center justify-center gap-2 mb-2">
             <div className="w-12 h-px bg-indigo-500/20" />
             <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">How It Works</p>
             <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-1 tracking-tight">Getting Started is Simple</h2>
          <p className="text-sm md:text-base text-text-2 font-medium max-w-xl mx-auto leading-relaxed">
            From sign-up to sharing — go from zero to contributing in just minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto">
          {syncSequence.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div 
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white border border-border p-6 md:p-8 rounded-3xl group hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900 transition-all"
              >
                <div className="absolute -top-2 -right-2 text-[100px] font-bold leading-none select-none opacity-[0.03] text-text-1">
                  {s.n}
                </div>
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-border bg-slate-50 dark:bg-slate-800 ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold text-text-1 tracking-tight mb-3">{s.title}</h3>
                <p className="text-sm text-text-2 leading-relaxed opacity-90">{s.desc}</p>
                
                {i < syncSequence.length - 1 && (
                  <div className="absolute top-1/2 -right-4 translate-x-full hidden md:block opacity-20 group-hover:opacity-100 group-hover:-translate-x-1 transition-all">
                     <ArrowRight className="w-6 h-6 text-indigo-500" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Agent Testimonials ── */}
      <section className="px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
             <div className="w-12 h-px bg-indigo-500/20" />
             <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Student Stories</p>
             <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-1 tracking-tight">Loved by Students</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {agentTestimonials.map((t, i) => (
            <motion.div 
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-6 md:p-8 rounded-3xl shadow-sm relative group hover:shadow-md transition-all"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-current" />
                ))}
              </div>
              
              <div className="relative mb-8">
                <p className="text-base font-medium text-text-1 leading-relaxed relative z-10 line-clamp-4">
                  "{t.text}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-1">{t.name}</p>
                  <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest opacity-80">{t.role}</p>
                </div>
                <div className="ml-auto">
                   <ShieldCheck className="w-5 h-5 text-indigo-500 opacity-30" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Global Call to Action: Final Polish ── */}
      <section className="px-6 text-center max-w-4xl mx-auto space-y-12">
         <div className="space-y-4">
            <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />
            <h2 className="text-4xl md:text-5xl font-bold text-text-1 tracking-tight">Start Learning Together.</h2>
            <p className="text-base text-text-2 font-medium leading-relaxed">
              Join thousands of students sharing and discovering knowledge on EduShare.
            </p>
         </div>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="group relative w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[13px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-6">
               <div className="h-px w-8 bg-border" />
               <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">or</span>
               <div className="h-px w-8 bg-border" />
            </div>
            <Link href="/login" className="text-[13px] font-bold uppercase tracking-widest text-text-2 hover:text-indigo-500 transition-colors">
              Sign In
            </Link>
         </div>
      </section>

    </div>
  );
}

