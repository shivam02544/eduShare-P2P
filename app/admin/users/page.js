"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">User Management</h1>
        <p className="text-zinc-500 mt-1 text-sm">Oversee platform membership, roles, and account statuses.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
        <div className="flex-1 relative">
          <input type="text" placeholder="Search by name or email..." 
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="input pl-10 h-11" />
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input sm:w-48 h-11 transition-all">
          <option value="">All Roles</option>
          <option value="user">Users Only</option>
          <option value="moderator">Moderators Only</option>
          <option value="admin">Admins Only</option>
        </select>
        <button onClick={fetchUsers} className="btn-primary h-11 px-8">Search</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden border-zinc-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Credits</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4"><div className="skeleton h-10 w-full" /></td>
                  </tr>
                ))
              ) : data.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-400">No users found.</td>
                </tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            {u.name}
                            {u.isSuperAdmin && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-zinc-900 text-white uppercase tracking-tighter">
                                Owner
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-zinc-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select value={u.role} disabled={updating === u._id || u.isSuperAdmin}
                        onChange={(e) => handleUpdate(u._id, { role: e.target.value })}
                        className={`text-xs font-bold bg-transparent focus:ring-0 border-none p-0 text-zinc-700 ${u.isSuperAdmin ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {u.isSuspended ? (
                        <span className="badge bg-red-50 text-red-600 border-red-100 text-[10px] uppercase font-bold tracking-wider">
                          Suspended
                        </span>
                      ) : (
                        <span className="badge bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] uppercase font-bold tracking-wider">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-700">
                      {u.credits} cr
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/profile/${u.firebaseUid}`} className="btn-secondary p-2" title="View Profile">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </Link>
                        {!u.isSuperAdmin && (
                          u.isSuspended ? (
                            <button onClick={() => handleUpdate(u._id, { isSuspended: false })}
                              disabled={updating === u._id}
                              className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-all font-bold text-[10px]"
                              title="Unsuspend User">
                              ACTIVATE
                            </button>
                          ) : (
                            <button onClick={() => {
                              const reason = prompt("Reason for suspension?");
                              if (reason !== null) handleUpdate(u._id, { isSuspended: true, suspensionReason: reason });
                            }}
                              disabled={updating === u._id}
                              className="bg-red-600 text-white p-2 rounded-xl hover:bg-red-700 transition-all font-bold text-[10px]"
                              title="Suspend User">
                              SUSPEND
                            </button>
                          )
                        )}
                        {u.isSuperAdmin && (
                           <div className="p-2 text-zinc-300 cursor-not-allowed" title="Protected System Account">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                               <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2h6v5c0 4.14-2.83 8.12-6 9.1-3.17-.98-6-4.96-6-9.1V4h6z"/>
                             </svg>
                           </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data.pages > 1 && (
          <div className="px-6 py-4 bg-stone-50 border-t border-zinc-100 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-40">Previous</button>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page === data.pages}
              className="btn-secondary px-4 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
