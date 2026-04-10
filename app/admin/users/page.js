"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  ExternalLink, 
  Zap, 
  Mail, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  Target,
  Sparkles,
  Loader2
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

export default function AdminUsersPage() {
  const { authFetch } = useAuth();
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    authFetch(`/api/admin/users?q=${q}&role=${role}&page=${page}`)
      .then((r) => r.json())
      .then((d) => { if (d.users) setData(d); setLoading(false); });
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const handleUpdate = async (userId, update) => {
    setUpdating(userId);
    const res = await authFetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...update }),
    });
    setUpdating(null);
    if (res.ok) fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      
      {/* ── Header HUD ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Admin Portal</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3">User Management</span>
          </div>
          <h1 className="text-3xl font-black text-text-1 tracking-tight">
            User <span className="text-indigo-500">Accounts</span>
          </h1>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 border border-border px-4 py-2 rounded-2xl flex items-center gap-3">
           <Users className="w-4 h-4 text-text-3" />
           <p className="text-[10px] font-black uppercase tracking-widest text-text-2">
             {data.total} Total Users
           </p>
        </div>
      </motion.div>

      {/* ── Filter Matrix ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-4 rounded-[32px] shadow-sm flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative group">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl pl-14 pr-6 py-4 text-xs font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none" 
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            className="bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-1 outline-none cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-all appearance-none min-w-[160px]"
          >
            <option value="" className="bg-slate-900">All Roles</option>
            <option value="user" className="bg-slate-900">Tier: User</option>
            <option value="moderator" className="bg-slate-900">Tier: Moderator</option>
            <option value="admin" className="bg-slate-900">Tier: Admin</option>
          </select>
          
          <button 
            onClick={fetchUsers}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            Search
          </button>
        </div>
      </motion.div>

      {/* ── Agent Table ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[48px] overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-border">
                <th className="px-10 py-6 text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">User</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">Role</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-3 uppercase tracking-[0.3em]">Credits</th>
                <th className="px-10 py-6 text-[10px] font-black text-text-3 uppercase tracking-[0.3em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td colSpan={5} className="px-10 py-8">
                         <div className="flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl" />
                            <div className="space-y-2">
                               <div className="h-4 w-48 bg-slate-100 dark:bg-white/5 rounded-lg" />
                               <div className="h-3 w-32 bg-slate-100 dark:bg-white/5 rounded-lg" />
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : data.users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center text-text-3">
                       <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-10" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Users Found.</p>
                    </td>
                  </tr>
                ) : (
                  data.users.map((u, i) => (
                    <motion.tr 
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border bg-slate-100 dark:bg-white/5 shadow-inner transition-transform group-hover:scale-105">
                              {u.image ? (
                                <img src={u.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-3 font-black text-xl uppercase">
                                  {u.name?.[0]}
                                </div>
                              )}
                            </div>
                            {u.isSuspended && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-lg bg-rose-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                 <ShieldAlert className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-text-1 tracking-tight flex items-center gap-2">
                              {u.name}
                              {u.isSuperAdmin && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black bg-indigo-500 text-white uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                  <Shield className="w-2.5 h-2.5" />
                                  Super Admin
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                               <Mail className="w-3 h-3 text-text-3" />
                               <p className="text-[10px] font-medium text-text-3 tracking-wide">{u.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="relative">
                          <select 
                            value={u.role} 
                            disabled={updating === u._id || u.isSuperAdmin}
                            onChange={(e) => handleUpdate(u._id, { role: e.target.value })}
                            className={`w-full bg-slate-100/50 dark:bg-white/5 border border-border px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-text-1 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <option value="user" className="bg-slate-900">Tier: User</option>
                            <option value="moderator" className="bg-slate-900">Tier: Moderator</option>
                            <option value="admin" className="bg-slate-900">Tier: Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        {u.isSuspended ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit">
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">Suspended</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2 text-text-1">
                           <Zap className="w-4 h-4 text-amber-500" />
                           <span className="text-sm font-black tabular-nums">{u.credits}</span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-text-3 ml-1">Credits</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          <Link 
                            href={`/profile/${u.firebaseUid}`} 
                            className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                            title="Signal Access"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          
                          {!u.isSuperAdmin && (
                            u.isSuspended ? (
                              <button 
                                onClick={() => handleUpdate(u._id, { isSuspended: false })}
                                disabled={updating === u._id}
                                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  const reason = prompt("Reason for suspension?");
                                  if (reason !== null) handleUpdate(u._id, { isSuspended: true, suspensionReason: reason });
                                }}
                                disabled={updating === u._id}
                                className="px-6 py-2.5 rounded-xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                              >
                                Suspend
                              </button>
                            )
                          )}
                          
                          {u.isSuperAdmin && (
                             <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-border flex items-center justify-center text-text-3 cursor-not-allowed" title="System Anchor Protocol - Immutable">
                               <Lock className="w-4 h-4" />
                             </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* ── Pagination HUD ── */}
        {data.pages > 1 && (
          <div className="px-10 py-8 bg-slate-50 dark:bg-white/5 border-t border-border flex items-center justify-between">
            <button 
              onClick={() => setPage(p => Math.max(1, p-1))} 
              disabled={page === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border text-[9px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-1">Page {page} <span className="text-text-3">/</span> {data.pages}</span>
            </div>

            <button 
              onClick={() => setPage(p => Math.min(data.pages, p+1))} 
              disabled={page === data.pages}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border text-[9px] font-black uppercase tracking-widest text-text-3 hover:text-text-1 disabled:opacity-30 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Lock({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>
  );
}

