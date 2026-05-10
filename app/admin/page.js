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
  hidden: { opacity: 0, scale: 0.98, y: 10 },
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
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-sm font-bold uppercase tracking-widest text-text-3">Syncing data...</p>
    </div>
  );

  if (!data) return (
    <div className="max-w-7xl mx-auto text-center py-40 space-y-4">
       <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto opacity-40" />
       <p className="text-sm font-semibold uppercase tracking-wider text-text-3">Access Denied: Analytics unavailable.</p>
    </div>
  );

  const { counts, growth, distribution } = data;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32"
    >
      {/* ── Header HUD ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Platform Analytics</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">System: Online</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-1 tracking-tight">
            Admin <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-sm font-medium text-text-3">Real-time platform statistics and activity overview.</p>
        </div>
        
         <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 rounded-xl bg-surface-1 border border-border flex items-center gap-2 shadow-sm">
             <Globe className="w-4 h-4 text-accent" />
             <span className="text-xs font-bold text-text-1 uppercase tracking-widest">Global Status: Active</span>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
          { label: "Total Users", value: counts.users, icon: Users, accent: "accent" },
          { label: "Total Content", value: counts.videos + counts.notes, icon: Files, accent: "emerald" },
          { label: "User Reports", value: counts.reports, icon: AlertCircle, accent: "rose" },
          { label: "Total Credits", value: counts.credits, icon: Zap, accent: "amber" },
        ].map((kpi, i) => (
          <motion.div 
            key={i} 
            variants={cardVariants}
             className="group relative bg-surface-1 border border-border p-6 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden shadow-sm flex flex-col"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.accent === 'accent' ? 'accent' : kpi.accent}-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            
             <div className="relative flex justify-between items-center mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.accent === 'accent' ? 'bg-accent/10 text-accent border-accent/20' : `bg-${kpi.accent}-50 dark:bg-${kpi.accent}-500/10 text-${kpi.accent}-600 dark:text-${kpi.accent}-400 border border-${kpi.accent}-100 dark:border-${kpi.accent}-500/20`} border`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <Sparkles className={`w-4 h-4 ${kpi.accent === 'accent' ? 'text-accent' : `text-${kpi.accent}-500`} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
            
            <div className="mt-auto space-y-1">
                <div className="text-2xl font-bold text-text-1 tabular-nums tracking-tight">
                 {kpi.value.toLocaleString()}
               </div>
               <p className="text-xs font-bold text-text-4 uppercase tracking-widest">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Analytics Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
         {/* Growth Velocity */}
        <motion.div variants={cardVariants} className="lg:col-span-8 relative bg-surface-1 border border-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-1 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Growth Overview
              </h3>
              <p className="text-xs font-medium text-text-3">User signups over the last 7 days</p>
            </div>
            <div className="px-3 py-1 bg-accent/5 rounded-lg border border-accent/10 text-[10px] font-bold text-accent uppercase tracking-widest">
              Real-time
            </div>
          </div>

          <div className="h-48 md:h-64 flex items-end gap-2 md:gap-4 px-2">
            {growth.map((day, i) => {
              const max = Math.max(...growth.map(g => g.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-help">
                  <div className="relative w-full h-full flex items-end">
                     <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ ...springConfig, delay: i * 0.05 }}
                      className="w-full bg-surface-2 rounded-t-xl relative transition-all group-hover:bg-accent overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent" />
                    </motion.div>
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-text-1 text-surface-1 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap shadow-xl z-10">
                      {day.count} Users
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-text-3 tabular-nums">
                    {day._id.split("-")[1]}/{day._id.split("-")[2]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

         {/* Knowledge Distribution */}
        <motion.div variants={cardVariants} className="lg:col-span-4 bg-surface-1 border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
          <div className="space-y-1 mb-8">
            <h3 className="text-sm font-bold text-text-1 uppercase tracking-widest flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              Inventory Mix
            </h3>
            <p className="text-xs font-medium text-text-3">Assets by category</p>
          </div>
          
          <div className="space-y-6 flex-1">
            {distribution.slice(0, 5).map((item, i) => {
              const max = Math.max(...distribution.map(d => d.count), 1);
              const pct = (item.count / max) * 100;
              return (
                 <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-text-2 uppercase tracking-widest">{item._id}</span>
                    <span className="text-[10px] font-bold text-accent tabular-nums tracking-widest">{item.count} Assets</span>
                  </div>
                   <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden border border-border/20">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ...springConfig, delay: i * 0.1 }}
                      className="h-full bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent-rgb),0.3)]" 
                    />
                  </div>
                </div>
              );
            })}
          </div>

           <Link href="/admin/manage-content" className="mt-8 w-full py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-3 hover:text-accent hover:bg-accent/5 hover:border-accent/20 transition-all active:scale-[0.98]">
             View Global Inventory
             <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

       {/* ── Security Command Vault ── */}
      <motion.div 
        variants={cardVariants}
        className="relative group bg-text-1 rounded-2xl p-8 md:p-12 text-surface-1 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 opacity-30" />
        
         <div className="relative text-center lg:text-left space-y-4 max-w-xl">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
             <div className="w-10 h-10 rounded-xl bg-surface-1/10 border border-surface-1/20 flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-5 h-5 text-rose-400" />
              </div>
             <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Reports Need Review</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Content <span className="text-rose-400">Moderation</span></h2>
          <p className="text-surface-1/70 text-sm md:text-base leading-relaxed font-medium">
            There are reported content items that require review. Please inspect the moderation list.
          </p>
        </div>
        
         <div className="relative shrink-0 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => router.push('/admin/reports')} 
            className="flex items-center justify-center gap-2 bg-surface-1 text-text-1 px-8 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl w-full sm:w-auto uppercase tracking-widest"
          >
            Review Reports
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </button>
          
          <Link 
            href="/admin/users"
            className="flex items-center justify-center gap-2 bg-surface-1/10 text-surface-1 px-8 py-4 rounded-xl text-sm font-bold border border-surface-1/20 hover:bg-surface-1/20 transition-all w-full sm:w-auto uppercase tracking-widest"
          >
            Users
            <Users className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

    </motion.div>
  );
}


