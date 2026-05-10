"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { 
    href: "/admin", 
    label: "Dashboard", 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  },
  { 
    href: "/admin/reports", 
    label: "Moderation Queue", 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  },
  { 
    href: "/admin/users", 
    label: "User Management", 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  },
  { 
    href: "/admin/manage-content", 
    label: "Manage Content", 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  },
];

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    if (profile && (profile.role !== "admin" && profile.role !== "moderator")) {
      setForbidden(true);
    }
  }, [user, profile, loading]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="skeleton w-32 h-8 rounded-xl bg-surface-3" />
    </div>
  );

  if (forbidden) return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6 text-text-1">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V7m0 10a9 9 0 110-18 9 9 0 010 18z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Access Restricted</h2>
        <p className="text-text-3 mt-2 font-medium">
          This secure area requires elevated administrative privileges.
        </p>
        <Link href="/dashboard" className="mt-8 inline-block px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-h transition-all shadow-lg shadow-accent/20">Return to Safety</Link>
      </div>
    </div>
  );

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-bg flex text-text-1">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-border p-6 z-40 hidden lg:block shadow-xl">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-text-1 tracking-tight">Admin Console</span>
          </div>
          <p className="text-[10px] text-text-4 font-bold uppercase tracking-widest px-1">Control Center v1.0</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            // Restrictions: Only admins can see user management
            if (item.href === "/admin/users" && !isAdmin) return null;
            if (item.href === "/admin/manage-content" && !isAdmin) return null;

            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-text-3 hover:bg-surface-2 hover:text-text-1"
                }`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-sm font-bold text-accent shadow-sm">
              {profile?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text-1 truncate">{profile?.name || "Admin"}</p>
              <p className="text-[10px] text-text-4 font-bold uppercase tracking-tight">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-border">
          <span className="font-bold text-text-1">Admin Console</span>
          <div className="flex gap-2">
            {NAV_ITEMS.map((i) => (
              <Link key={i.href} href={i.href} title={i.label} 
                className={`p-2 rounded-lg transition-colors ${pathname === i.href ? "bg-accent text-white shadow-md shadow-accent/10" : "text-text-4 hover:text-text-1"}`}>
                {i.icon}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
