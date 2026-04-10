"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { authFetch, profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/admin/stats")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="skeleton h-80 rounded-3xl" />
        <div className="skeleton h-80 rounded-3xl" />
      </div>
    </div>
  );

  const { counts, growth, distribution } = data;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Platform Insights</h1>
        <p className="text-zinc-500 mt-1 text-sm">Overview of edushare performance and growth metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: counts.users, color: "bg-violet-600", bg: "bg-violet-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
          { label: "Videos + Notes", value: counts.videos + counts.notes, color: "bg-emerald-600", bg: "bg-emerald-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
          { label: "Pending Reports", value: counts.reports, color: "bg-amber-600", bg: "bg-amber-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
          { label: "Ecosystem Credits", value: counts.credits, color: "bg-zinc-900", bg: "bg-zinc-50", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between group hover:border-zinc-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`} style={{ color: kpi.color.replace('bg-', '')}}>
                {kpi.icon}
              </div>
              <div className="stat-number text-2xl font-black text-zinc-900">{kpi.value.toLocaleString()}</div>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">7-Day User Growth</h3>
            <span className="badge bg-emerald-50 text-emerald-600 text-[10px] uppercase font-bold tracking-tight">Trending Up</span>
          </div>
          <div className="h-48 flex items-end gap-1.5 px-2">
            {growth.map((day, i) => {
              const max = Math.max(...growth.map(g => g.count), 1);
              const height = (day.count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-violet-100 rounded-t-lg relative transition-all group-hover:bg-violet-600" style={{ height: `${height}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.count} new
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">{day._id.split("-").slice(1).join("/")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Distribution */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-6">Top Subjects</h3>
          <div className="space-y-5">
            {distribution.map((item, i) => {
              const max = Math.max(...distribution.map(d => d.count), 1);
              const pct = (item.count / max) * 100;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-700">{item._id}</span>
                    <span className="text-zinc-900">{item.count}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-zinc-900 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-zinc-200">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold">Modaration Required</h2>
          <p className="text-zinc-400 text-sm mt-1">There are {counts.reports} items awaiting human review in the queue.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.location.href='/admin/reports'} className="bg-white text-zinc-900 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-100 transition-all">
            Review Queue
          </button>
        </div>
      </div>
    </div>
  );
}
