"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Files, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  PieChart, 
  ShieldAlert, 
  ArrowRight,
  Activity,
  Globe,
  Target,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Sparkles,
  BarChart3,
  Lock
} from "lucide-react";
import Link from "next/link";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", ...springConfig }
  }
};

export default function AdminDashboard() {
  const { authFetch, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/admin/stats")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Loading stats...</p>
    </div>
  );

  if (!data) return (
    <div className="max-w-7xl mx-auto text-center py-40 space-y-4">
       <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto opacity-20" />
       <p className="text-[10px] font-black uppercase tracking-widest text-text-3">Access Denied: Analytics unavailable.</p>
    </div>
  );

  const { counts, growth, distribution } = data;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-12 pb-32"
    >
      {/* ── Header HUD ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Platform Analytics</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">System: Online</span>
          </div>
          <h1 className="text-4xl font-black text-text-1 tracking-tight">
            Admin <span className="text-indigo-500">Dashboard</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-text-3">Real-time platform statistics and activity overview.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-border flex items-center gap-3 shadow-sm">
             <Globe className="w-4 h-4 text-emerald-500" />
             <span className="text-[10px] font-black text-text-1 uppercase tracking-widest">Global Status: Active</span>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: counts.users, icon: Users, accent: "indigo" },
          { label: "Total Content", value: counts.videos + counts.notes, icon: Files, accent: "emerald" },
          { label: "User Reports", value: counts.reports, icon: AlertCircle, accent: "rose" },
          { label: "Total Credits", value: counts.credits, icon: Zap, accent: "amber" },
        ].map((kpi, i) => (
          <motion.div 
            key={i} 
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-8 rounded-[40px] transition-all hover:shadow-2xl overflow-hidden shadow-sm"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${kpi.accent}-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative flex justify-between items-center mb-6">
              <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center bg-${kpi.accent}-500/10 text-${kpi.accent}-500 border border-${kpi.accent}-500/10`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-text-1 tabular-nums tracking-tighter">
                {kpi.value.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center justify-between">
               <p className="text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">{kpi.label}</p>
               <Sparkles className={`w-3 h-3 text-${kpi.accent}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Analytics Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Growth Velocity */}
        <motion.div variants={cardVariants} className="lg:col-span-8 relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[48px] p-10 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-text-1 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Growth Overview
              </h3>
              <p className="text-[10px] font-medium text-text-3">User signups over the last 7 days</p>
            </div>
            <div className="px-5 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              Growth Tracking
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 px-4">
            {growth.map((day, i) => {
              const max = Math.max(...growth.map(g => g.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-help">
                  <div className="relative w-full h-full flex items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ ...springConfig, delay: i * 0.05 }}
                      className="w-full bg-slate-900/5 dark:bg-white/5 rounded-2xl relative transition-all group-hover:bg-indigo-500 shadow-inner overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
                    </motion.div>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[9px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap shadow-2xl z-10 border border-white/10">
                      {day.count} New Users
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-text-3 uppercase tracking-tighter tabular-nums opacity-60">
                    {day._id.split("-")[1]}.{day._id.split("-")[2]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Knowledge Distribution */}
        <motion.div variants={cardVariants} className="lg:col-span-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[48px] p-10 shadow-sm space-y-10">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-text-1 uppercase tracking-widest flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              Content Distribution
            </h3>
            <p className="text-[10px] font-medium text-text-3">Content distribution by subject</p>
          </div>
          
          <div className="space-y-8">
            {distribution.slice(0, 5).map((item, i) => {
              const max = Math.max(...distribution.map(d => d.count), 1);
              const pct = (item.count / max) * 100;
              return (
                <div key={i} className="group space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-text-1 uppercase tracking-widest">{item._id}</span>
                    <span className="text-[9px] font-black text-indigo-500 tabular-nums">{item.count} Assets</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-border/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ...springConfig, delay: i * 0.1 }}
                      className="h-full bg-slate-900 dark:bg-white rounded-full shadow-lg" 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/admin/manage-content" className="w-full py-4 border border-border rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
             View Global Inventory
             <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>

      {/* ── Security Command Vault ── */}
      <motion.div 
        variants={cardVariants}
        className="relative group bg-slate-900 rounded-[56px] p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-12 shadow-3xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-30" />
        
        <div className="relative text-center lg:text-left space-y-4 max-w-xl">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
             <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-rose-500" />
              </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Reports Need Review</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight">Content <span className="text-rose-500 underline underline-offset-8">Moderation</span></h2>
          <p className="text-slate-400 text-base font-medium leading-relaxed">
            There are reported content items that require review. Please inspect the moderation list.
          </p>
        </div>
        
        <div className="relative shrink-0 flex flex-col sm:flex-row gap-6">
          <button 
            onClick={() => router.push('/admin/reports')} 
            className="group flex items-center justify-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Review Reports
            <ShieldAlert className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
          
          <Link 
            href="/admin/users"
            className="group flex items-center justify-center gap-4 bg-slate-800 text-white px-10 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-slate-700 transition-all font-bold"
          >
            User Management
            <Users className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-all" />
          </Link>
        </div>
      </motion.div>

    </motion.div>
  );
}


