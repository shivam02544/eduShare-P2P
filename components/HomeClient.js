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
           <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">What We Offer</p>
             <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter italic">Everything You Need to Learn</h2>
          <p className="text-sm md:text-base text-text-2 font-medium max-w-xl mx-auto leading-relaxed italic">
            A frictionless learning ecosystem engineered for the next generation of scholars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          {protocolNodes.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all"
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-surface-2 rounded-full blur-2xl group-hover:scale-150 transition-all opacity-20" />
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-border/50 ${f.bg} ${f.color} shadow-inner`}>
                  <Icon className="w-6 h-6 stroke-[2.5px]" />
                </div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 text-[9px] font-black uppercase tracking-widest text-text-3 mb-4 italic">
                  <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                  {f.tag}
                </div>
                
                <h3 className="text-lg font-black text-text-1 tracking-tight mb-3 italic group-hover:text-indigo-500 transition-colors">{f.title}</h3>
                <p className="text-xs font-semibold text-text-2 leading-relaxed italic opacity-80">{f.desc}</p>
                
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
        <div className="absolute top-1/2 left-0 w-full h-[500px] bg-indigo-500/5 -translate-y-1/2 blur-[120px] -z-10" />
        
        <div className="text-center mb-20 space-y-4">
           <div className="flex items-center justify-center gap-2 mb-2">
             <div className="w-12 h-px bg-indigo-500/20" />
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">How It Works</p>
             <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter italic">Getting Started is Simple</h2>
          <p className="text-sm md:text-base text-text-2 font-medium max-w-xl mx-auto leading-relaxed italic">
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
                className="relative bg-white/40 dark:bg-white/[0.02] border border-border p-10 rounded-[48px] backdrop-blur-md group hover:bg-white dark:hover:bg-white/5 transition-all"
              >
                <div className="absolute -top-4 -right-4 text-[120px] font-black leading-none select-none opacity-[0.03] group-hover:opacity-[0.08] transition-all text-text-1">
                  {s.n}
                </div>
                
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 border border-border bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 ${s.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-black text-text-1 tracking-tight mb-4 italic">{s.title}</h3>
                <p className="text-sm font-semibold text-text-2 leading-relaxed italic opacity-70 italic">{s.desc}</p>
                
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
             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">Student Stories</p>
             <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-text-1 tracking-tighter italic">Loved by Students</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {agentTestimonials.map((t, i) => (
            <motion.div 
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-10 rounded-[48px] shadow-sm relative group hover:shadow-3xl transition-all"
            >
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-current" />
                ))}
              </div>
              
              <div className="relative mb-8">
                <p className="text-lg font-black text-text-1 leading-relaxed italic relative z-10 line-clamp-4">
                  "{t.text}"
                </p>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-all" />
              </div>
              
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-lg ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-black text-text-1 italic">{t.name}</p>
                  <p className="text-[10px] font-black text-text-3 uppercase tracking-widest italic opacity-60">{t.role}</p>
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
         <div className="space-y-6">
            <Sparkles className="w-12 h-12 text-indigo-500 mx-auto animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-black text-text-1 tracking-tighter italic">Start Learning Together.</h2>
            <p className="text-lg text-text-2 font-medium italic leading-relaxed">
              Join thousands of students sharing and discovering knowledge on EduShare.
            </p>
         </div>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="group relative w-full sm:w-auto px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] font-black text-[13px] uppercase tracking-[0.3em] italic hover:scale-105 active:scale-95 transition-all shadow-3xl">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-6">
               <div className="h-px w-8 bg-border" />
               <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.2em] italic">or</span>
               <div className="h-px w-8 bg-border" />
            </div>
            <Link href="/login" className="text-[13px] font-black uppercase tracking-[0.3em] text-text-2 hover:text-indigo-500 transition-colors italic">
              Sign In
            </Link>
         </div>
      </section>

    </div>
  );
}

