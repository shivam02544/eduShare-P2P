"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { invalidateAll } from "@/lib/cache";
import SearchBar from "@/components/SearchBar";
import NotificationBell from "@/components/NotificationBell";
import { useTheme } from "@/context/ThemeContext";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/collections", label: "Collections" },
  { href: "/live", label: "Live" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const authLinks = [{ href: "/feed", label: "Feed" }];

export default function Navbar() {
  const { user, loading } = useAuth();
  const { toggle, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setDropdownOpen(false); setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    invalidateAll();
    await signOut(auth);
    setSigningOut(false);
    router.push("/");
  };

  const isActive = (href) => pathname === href;
  const initials = (user?.displayName || user?.email || "?")[0].toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b"
      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center
                            bg-zinc-900 group-hover:bg-zinc-700 transition-colors shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span className="font-bold text-zinc-900 text-[15px] tracking-tight">EduShare</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 mx-4">
            {[...navLinks, ...(user ? authLinks : [])].map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(l.href)
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-stone-100"
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          {user && <div className="hidden md:block flex-1 max-w-xs mx-2"><SearchBar /></div>}

          {/* Auth */}
          <div className="hidden md:flex items-center gap-1.5">
            {loading ? (
              <div className="skeleton h-8 w-8 rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-1" ref={dropdownRef}>
                <NotificationBell />
                {/* Dark mode toggle */}
                <button onClick={toggle}
                  className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                  {isDark ? (
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                    </svg>
                  )}
                </button>
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl
                               hover:bg-stone-100 border border-transparent hover:border-stone-200
                               transition-all duration-150">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-700 max-w-[100px] truncate">
                      {user.displayName?.split(" ")[0] || user.email}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border py-1.5 animate-slide-down overflow-hidden"
                      style={{ background: "var(--surface)", borderColor: "var(--border)",
                               boxShadow: "0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)" }}>
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{user.displayName || "User"}</p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {[
                          { href: "/dashboard", icon: "▦", label: "Dashboard" },
                          { href: `/profile/${user.uid}`, icon: "◉", label: "My Profile" },
                          { href: "/profile/edit", icon: "✎", label: "Edit Profile" },
                          { href: "/history", icon: "📺", label: "Watch History" },
                          { href: "/bookmarks", icon: "◈", label: "Saved Videos" },
                          { href: "/credits", icon: "◆", label: "Credit History" },
                          { href: "/certificates", icon: "🏅", label: "My Certificates" },
                          { href: "/upload-video", icon: "▶", label: "Upload Video" },
                          { href: "/upload-notes", icon: "◻", label: "Upload Notes" },
                        ].map((item) => (
                          <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-stone-50 transition-colors">
                            <span className="text-zinc-400 text-xs w-4">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-stone-100 pt-1">
                        <button onClick={handleSignOut} disabled={signingOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                          <span className="text-xs w-4">⏻</span>
                          {signingOut ? "Signing out..." : "Sign out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t animate-slide-down"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <div className="px-4 py-3 space-y-1">
            {[...navLinks, ...(user ? authLinks : [])].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.href) ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-stone-100"
                }`}>
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-stone-100">Dashboard</Link>
                <Link href={`/profile/${user.uid}`} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-stone-100">My Profile</Link>
              </>
            )}
            <div className="pt-2 border-t border-stone-200 mt-2">
              {user ? (
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Sign out</button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-secondary text-center text-sm">Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-center text-sm">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
