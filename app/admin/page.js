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
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-sm font-semibold uppercase tracking-wider text-text-3">Loading stats...</p>
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
            <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Platform Analytics</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">System: Online</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-1 tracking-tight">
            Admin <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-sm font-medium text-text-3">Real-time platform statistics and activity overview.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center gap-2 shadow-sm">
             <Globe className="w-4 h-4 text-emerald-500" />
             <span className="text-xs font-bold text-text-1 uppercase tracking-wider">Global Status: Active</span>
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
            className="group relative bg-white dark:bg-slate-900 border border-border p-6 rounded-2xl transition-shadow hover:shadow-md overflow-hidden shadow-sm flex flex-col"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.accent}-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative flex justify-between items-center mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${kpi.accent}-50 dark:bg-${kpi.accent}-500/10 text-${kpi.accent}-600 dark:text-${kpi.accent}-400 border border-${kpi.accent}-100 dark:border-${kpi.accent}-500/20`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <Sparkles className={`w-4 h-4 text-${kpi.accent}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
            
            <div className="mt-auto space-y-1">
               <div className="text-2xl font-bold text-text-1 tabular-nums">
                 {kpi.value.toLocaleString()}
               </div>
               <p className="text-xs font-semibold text-text-3 uppercase tracking-wider">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Analytics Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Growth Velocity */}
        <motion.div variants={cardVariants} className="lg:col-span-8 relative bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 md:p-8 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-1 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Growth Overview
              </h3>
              <p className="text-xs font-medium text-text-3">User signups over the last 7 days</p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Tracking
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
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl relative transition-all group-hover:bg-indigo-500 overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
                    </motion.div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap shadow-lg z-10">
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
        <motion.div variants={cardVariants} className="lg:col-span-4 bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
          <div className="space-y-1 mb-8">
            <h3 className="text-sm font-bold text-text-1 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Content Distribution
            </h3>
            <p className="text-xs font-medium text-text-3">Content by subject</p>
          </div>
          
          <div className="space-y-6 flex-1">
            {distribution.slice(0, 5).map((item, i) => {
              const max = Math.max(...distribution.map(d => d.count), 1);
              const pct = (item.count / max) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-text-1 uppercase tracking-wider">{item._id}</span>
                    <span className="text-xs font-bold text-indigo-600 tabular-nums">{item.count} Assets</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ...springConfig, delay: i * 0.1 }}
                      className="h-full bg-slate-800 dark:bg-white rounded-full" 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/admin/manage-content" className="mt-8 w-full py-3 border border-border rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-text-3 hover:text-text-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
             View Global Inventory
             <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* ── Security Command Vault ── */}
      <motion.div 
        variants={cardVariants}
        className="relative group bg-slate-900 rounded-2xl p-8 md:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 opacity-30" />
        
        <div className="relative text-center lg:text-left space-y-4 max-w-xl">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
             <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-rose-400" />
              </div>
             <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Reports Need Review</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Content <span className="text-rose-400">Moderation</span></h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            There are reported content items that require review. Please inspect the moderation list.
          </p>
        </div>
        
        <div className="relative shrink-0 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => router.push('/admin/reports')} 
            className="flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-4 rounded-xl text-sm font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm w-full sm:w-auto"
          >
            Review Reports
            <ShieldAlert className="w-4 h-4" />
          </button>
          
          <Link 
            href="/admin/users"
            className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-4 rounded-xl text-sm font-bold border border-white/10 hover:bg-slate-700 transition-colors w-full sm:w-auto"
          >
            User Management
            <Users className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </motion.div>

    </motion.div>
  );
}


