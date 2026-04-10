"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import NotificationBell from "@/components/NotificationBell";
import { useTheme } from "@/context/ThemeContext";

const NAV = [
  { href: "/explore",     label: "Explore",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { href: "/collections", label: "Collections", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: "/live",        label: "Live",        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M23 7 16 12 23 17z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
  { href: "/leaderboard", label: "Leaderboard", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
];
const AUTH_NAV = [
  { href: "/feed", label: "Feed", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
];

const DROPDOWN = [
  { 
    href: "/dashboard",    
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, 
    label: "Dashboard" 
  },
  { 
    href: "/profile",      
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, 
    label: "My Profile",    
    dynamic: true 
  },
  { 
    href: "/profile/edit", 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>, 
    label: "Edit Profile" 
  },
  { 
    href: "/history",      
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
    label: "Watch History" 
  },
  { 
    href: "/bookmarks",    
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>, 
    label: "Bookmarks" 
  },
  { 
    href: "/credits",      
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
    label: "Credits" 
  },
  { 
    href: "/certificates", 
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>, 
    label: "Certificates" 
  },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const { toggle, isDark } = useTheme();
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

  useEffect(() => { setDropOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut(auth);
    setSigningOut(false);
    router.push("/");
  };

  const isActive = (href) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  const initials = (user?.displayName || user?.email || "?")[0].toUpperCase();

  return (
    <>
      {/* ── Desktop / Tablet Top Bar ── */}
      <header className="sticky top-0 z-50 hidden md:block"
        style={{
          background: "color-mix(in srgb, var(--bg) 82%, transparent)",
          backdropFilter: "blur(20px) saturate(200%)",
          borderBottom: "1px solid var(--border)",
        }}>
        <div className="max-w-7xl mx-auto px-5 xl:px-6 h-[58px] flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group mr-2">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                <path d="M9.848 20.788a1 1 0 00.636-1.166v-4.93l-5.2-2.229A1 1 0 004 13.39v3.566a1 1 0 00.576.904l5 2.25a1 1 0 00.272.048 1 1 0 00.637-.37z" opacity=".6"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--text-1)" }}>
              EduShare
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="flex items-center gap-0.5">
            {[...NAV, ...(user ? AUTH_NAV : [])].map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive(l.href)
                    ? "text-[var(--text-1)] bg-[var(--surface-2)]"
                    : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          {user && <div className="w-56 xl:w-64"><SearchBar /></div>}

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button onClick={toggle}
              className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center"
              title={isDark ? "Light mode" : "Dark mode"}>
              {isDark ? (
                <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--text-2)" }}>
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--text-2)" }}>
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              )}
            </button>

            {loading ? (
              <div className="skeleton w-8 h-8 rounded-full ml-1" />
            ) : user ? (
              <>
                <NotificationBell />
                {/* Avatar dropdown */}
                <div className="relative ml-0.5" ref={dropRef}>
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 ${
                      dropOpen ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]"
                    }`}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-[var(--border)]" />
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
                        {initials}
                      </div>
                    )}
                    <span className="text-[13px] font-medium max-w-[80px] truncate" style={{ color: "var(--text-1)" }}>
                      {user.displayName?.split(" ")[0] || user.email?.split("@")[0]}
                    </span>
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-3)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 animate-pop-in overflow-hidden"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-lg)",
                      }}>
                      {/* User info header */}
                      <div className="px-4 py-3 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
                        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-1)" }}>
                          {user.displayName || "User"}
                        </p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-3)" }}>
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1 px-2">
                        {DROPDOWN.map((item) => (
                          <Link key={item.href}
                            href={item.dynamic ? `/profile/${user.uid}` : item.href}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-100 group"
                            style={{ color: "var(--text-2)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                            <span className="w-5 flex items-center justify-center opacity-70 flex-shrink-0">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                          <Link href="/admin"
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-100 bg-amber-50 text-amber-700 hover:bg-amber-100 group">
                            <span className="w-5 flex items-center justify-center flex-shrink-0 opacity-80">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </span>
                            Admin Console
                          </Link>
                      </div>

                      <div className="px-2 pt-1 pb-1" style={{ borderTop: "1px solid var(--border)" }}>
                        <button onClick={handleSignOut} disabled={signingOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-100 text-left"
                          style={{ color: "var(--red)" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--red-2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                          <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                          </svg>
                          {signingOut ? "Signing out…" : "Sign out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login" className="btn-ghost text-[13px] px-3 py-1.5">Log in</Link>
                <Link href="/register" className="btn-accent text-[13px] px-4 py-1.5">Get started</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Top Bar ── */}
      <header className="sticky top-0 z-50 md:hidden"
        style={{
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid var(--border)",
        }}>
        <div className="px-4 h-[54px] flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--text-1)" }}>EduShare</span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            {user && <NotificationBell />}
            <button onClick={toggle} className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center">
              {isDark ? (
                <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--text-2)" }}>
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--text-2)" }}>
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              )}
            </button>
            {user ? (
              <Link href={`/profile/${user.uid}`} className="ml-0.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-[var(--border)]" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
                    {initials}
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login" className="btn-accent text-[12px] px-3 py-1.5">Login</Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="bottom-nav">
        {[...NAV, ...(user ? AUTH_NAV : [])].slice(0, 5).map((l) => (
          <Link key={l.href} href={l.href}
            className={`bottom-nav-item ${isActive(l.href) ? "active" : ""}`}>
            {l.icon}
            <span>{l.label}</span>
          </Link>
        ))}
        {user ? (
          <Link href="/dashboard" className={`bottom-nav-item ${isActive("/dashboard") ? "active" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link href="/register" className="bottom-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Join</span>
          </Link>
        )}
      </nav>
    </>
  );
}
