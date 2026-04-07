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

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/collections", label: "Collections" },
  { href: "/live", label: "Live" },
  { href: "/leaderboard", label: "Leaderboard" },
];

const AUTH_NAV = [{ href: "/feed", label: "Feed" }];

const DROPDOWN = [
  { href: "/dashboard",    icon: "▦", label: "Dashboard" },
  { href: "/profile",      icon: "◉", label: "My Profile", dynamic: true },
  { href: "/profile/edit", icon: "✎", label: "Edit Profile" },
  { href: "/history",      icon: "📺", label: "Watch History" },
  { href: "/bookmarks",    icon: "◈", label: "Saved" },
  { href: "/credits",      icon: "◆", label: "Credits" },
  { href: "/certificates", icon: "🏅", label: "Certificates" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const { toggle, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setDropOpen(false); setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    invalidateAll();
    await signOut(auth);
    setSigningOut(false);
    router.push("/");
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");
  const initials = (user?.displayName || user?.email || "?")[0].toUpperCase();

  return (
    <header className="sticky top-0 z-50"
      style={{
        background: "color-mix(in srgb, var(--bg) 80%, transparent)",
        backdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid var(--border)",
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity group-hover:opacity-80"
            style={{ background: "var(--text-1)" }}>
            <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text-1)" }}>
            EduShare
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 ml-2">
          {[...NAV, ...(user ? AUTH_NAV : [])].map((l) => (
            <Link key={l.href} href={l.href}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150"
              style={{
                color: isActive(l.href) ? "var(--text-1)" : "var(--text-2)",
                background: isActive(l.href) ? "var(--surface-2)" : "transparent",
              }}
              onMouseEnter={(e) => { if (!isActive(l.href)) e.currentTarget.style.color = "var(--text-1)"; }}
              onMouseLeave={(e) => { if (!isActive(l.href)) e.currentTarget.style.color = "var(--text-2)"; }}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        {user && <div className="hidden md:block w-52"><SearchBar /></div>}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-1">
          {/* Theme toggle */}
          <button onClick={toggle}
            className="btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-lg"
            title={isDark ? "Light mode" : "Dark mode"}>
            {isDark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--text-2)" }}>
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--text-2)" }}>
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>

          {loading ? (
            <div className="skeleton w-7 h-7 rounded-full" />
          ) : user ? (
            <>
              <NotificationBell />
              {/* Avatar dropdown */}
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-150 ml-1"
                  style={{ background: dropOpen ? "var(--surface-2)" : "transparent" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={(e) => { if (!dropOpen) e.currentTarget.style.background = "transparent"; }}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{ background: "var(--accent-2)", color: "var(--accent)" }}>
                      {initials}
                    </div>
                  )}
                  <span className="text-[13px] font-medium max-w-[90px] truncate" style={{ color: "var(--text-1)" }}>
                    {user.displayName?.split(" ")[0] || user.email}
                  </span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-3)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 animate-pop-in"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                    }}>
                    {/* User info */}
                    <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                      <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-1)" }}>
                        {user.displayName || "User"}
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-3)" }}>
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {DROPDOWN.map((item) => (
                        <Link key={item.href}
                          href={item.dynamic ? `/profile/${user.uid}` : item.href}
                          className="flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors duration-100"
                          style={{ color: "var(--text-2)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                          <span className="text-[11px] w-4 opacity-60">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t py-1" style={{ borderColor: "var(--border)" }}>
                      <button onClick={handleSignOut} disabled={signingOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors duration-100 text-left"
                        style={{ color: "#ef4444" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <span className="text-[11px] w-4 opacity-60">⏻</span>
                        {signingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost text-[13px] px-3 py-1.5">Login</Link>
              <Link href="/register" className="btn-primary text-[13px] px-3 py-1.5">Get started</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden btn-ghost w-8 h-8 p-0 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: "var(--text-2)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t animate-pop-in"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-4 py-3 space-y-0.5">
            {[...NAV, ...(user ? AUTH_NAV : [])].map((l) => (
              <Link key={l.href} href={l.href}
                className="block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
                style={{
                  color: isActive(l.href) ? "var(--text-1)" : "var(--text-2)",
                  background: isActive(l.href) ? "var(--surface-2)" : "transparent",
                }}>
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <div className="h-px my-2" style={{ background: "var(--border)" }} />
                <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-[13px]" style={{ color: "var(--text-2)" }}>Dashboard</Link>
                <Link href={`/profile/${user.uid}`} className="block px-3 py-2 rounded-lg text-[13px]" style={{ color: "var(--text-2)" }}>My Profile</Link>
                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-lg text-[13px] text-red-500">
                  Sign out
                </button>
              </>
            )}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1 btn-secondary text-center text-[13px]">Login</Link>
                <Link href="/register" className="flex-1 btn-primary text-center text-[13px]">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
