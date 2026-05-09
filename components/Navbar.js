"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import NotificationBell from "@/components/NotificationBell";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, 
  Layers, 
  Video as VideoIcon, 
  Trophy, 
  Rss, 
  LayoutDashboard, 
  User as UserIcon, 
  Edit3, 
  History, 
  Bookmark, 
  Zap, 
  Award, 
  LogOut, 
  ChevronDown, 
  Sun, 
  Moon,
  ShieldCheck,
  Command,
  Menu,
  X,
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

const MISSION_NAV = [
  { href: "/explore",     label: "Explore Content",     icon: Compass },
  { href: "/collections", label: "My Collections", icon: Layers },
  { href: "/live",        label: "Live Classes",        icon: VideoIcon },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const AUTH_ALIGNED = [
  { href: "/feed", label: "Social Feed", icon: Rss },
];

const IDENTITY_PROTOCOLS = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "My Dashboard" },
  { href: "/profile",      icon: UserIcon,        label: "My Profile", dynamic: true },
  { href: "/profile/edit", icon: Edit3,           label: "Edit Profile" },
  { href: "/history",      icon: History,         label: "Watch History" },
  { href: "/bookmarks",    icon: Bookmark,        label: "Bookmarks" },
  { href: "/credits",      icon: Zap,             label: "Credits" },
  { href: "/certificates", icon: Award,           label: "Certificates" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const { toggle, isDark } = useTheme();
  const [dropOpen, setDropOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropRef = useRef(null);
  const dropTriggerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setDropOpen(false); }, [pathname]);

  // Keyboard: Escape closes dropdown and returns focus to trigger
  useEffect(() => {
    if (!dropOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setDropOpen(false);
        dropTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropOpen]);

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
      {/* ── Desktop Global Navigation ── */}
      <header className="sticky top-0 z-[100] hidden lg:block select-none" role="banner">
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-b border-border/50 shadow-sm transition-colors duration-500" aria-hidden="true" />
        
        <div className="relative max-w-[1440px] mx-auto px-4 xl:px-8 h-[72px] flex items-center justify-between gap-3 xl:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 xl:gap-3 shrink-0" aria-label="EduShare – Go to homepage">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={springConfig}
              className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl flex items-center justify-center shadow-lg bg-indigo-600 dark:bg-indigo-500 text-white"
              aria-hidden="true"
            >
              <Command className="w-5 h-5 xl:w-6 xl:h-6" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg xl:text-xl tracking-tight text-slate-900 dark:text-white leading-none">EduShare</span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-1">Peer Learning</span>
            </div>
          </Link>

          {/* Primary Navigation */}
          <nav className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-border/50 shrink-0" aria-label="Primary navigation">
            {/* Desktop (xl) - Show All */}
            <div className="hidden xl:flex items-center gap-1">
              {[...MISSION_NAV, ...(user ? AUTH_ALIGNED : [])].map((l) => {
                const Icon = l.icon;
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className="relative px-3 py-1.5 group shrink-0 rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                  >
                    <div className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                    }`}>
                      <Icon className={`w-4 h-4 ${active ? "opacity-100" : "opacity-50"}`} aria-hidden="true" />
                      {l.label}
                    </div>
                    {active && (
                      <motion.div 
                        layoutId="nav-glow-xl"
                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm border border-border/50 rounded-lg -z-10"
                        transition={springConfig}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Laptop (lg) - Adaptive Layout */}
            <div className="hidden lg:flex xl:hidden items-center gap-1">
              {[...MISSION_NAV].slice(0, 3).map((l) => {
                const Icon = l.icon;
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className="relative px-3 py-1.5 group shrink-0 rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                  >
                    <div className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                    }`}>
                      <Icon className={`w-4 h-4 ${active ? "opacity-100" : "opacity-50"}`} aria-hidden="true" />
                      {l.label}
                    </div>
                    {active && (
                      <motion.div 
                        layoutId="nav-glow-lg"
                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm border border-border/50 rounded-lg -z-10"
                        transition={springConfig}
                      />
                    )}
                  </Link>
                );
              })}
              
              {/* "More" Dropdown for remaining items on lg */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-haspopup="true"
                  aria-label="More navigation items"
                >
                  <Menu className="w-4 h-4 opacity-50" aria-hidden="true" />
                  More
                </button>
                <div
                  className="absolute top-full left-0 mt-2 w-48 py-2 rounded-xl bg-white dark:bg-slate-900 border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                  role="menu"
                >
                   {[...MISSION_NAV.slice(3), ...(user ? AUTH_ALIGNED : [])].map((l) => {
                      const Icon = l.icon;
                      const active = isActive(l.href);
                      return (
                        <Link
                          key={l.href}
                          href={l.href}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300"}`}
                        >
                           <Icon className="w-4 h-4 opacity-50" aria-hidden="true" />
                           {l.label}
                        </Link>
                      )
                   })}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-1 min-w-[24px]" />

          {/* Actions */}
          <div className="flex items-center gap-2 xl:gap-4 min-w-0 shrink-0">
            {user && (
              <div className="flex-none w-[200px] xl:flex-1 xl:max-w-[320px] transition-all duration-500">
                <SearchBar />
              </div>
            )}

            <div className="h-6 w-px bg-border mx-1" aria-hidden="true" />

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-border text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isDark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </motion.button>

            {loading ? (
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse border border-border" aria-hidden="true" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="relative" ref={dropRef}>
                  <motion.button 
                    ref={dropTriggerRef}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDropOpen(!dropOpen)}
                    aria-expanded={dropOpen}
                    aria-haspopup="true"
                    aria-label={`${user.displayName || "Account"} – User menu`}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      dropOpen 
                        ? "bg-slate-100 dark:bg-slate-800 border-border shadow-sm" 
                        : "bg-white dark:bg-transparent border-border hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="relative shrink-0">
                       {user.photoURL ? (
                         <img src={user.photoURL} alt="" className="w-7 h-7 xl:w-8 xl:h-8 rounded-md object-cover ring-1 ring-border" />
                       ) : (
                         <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white" aria-hidden="true">
                           {initials}
                         </div>
                       )}
                       <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium hidden xl:block whitespace-nowrap text-slate-900 dark:text-white px-1" aria-hidden="true">
                      {user.displayName?.split(' ')[0] || "Account"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${dropOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </motion.button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={springConfig}
                        role="menu"
                        aria-label="User account menu"
                        className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-border shadow-lg overflow-hidden z-[100] p-2"
                      >
                        <div className="px-4 py-4 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-border">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.displayName || "Student"}</p>
                          <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                        </div>

                        <div className="space-y-1" role="none">
                          {IDENTITY_PROTOCOLS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link 
                                key={item.href}
                                href={item.dynamic ? `/profile/${user.uid}` : item.href}
                                role="menuitem"
                                onClick={() => setDropOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800"
                              >
                                <Icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" aria-hidden="true" />
                                {item.label}
                              </Link>
                            );
                          })}

                          <div className="h-px bg-border mx-2 my-2" aria-hidden="true" />

                          <Link
                            href="/admin"
                            role="menuitem"
                            onClick={() => setDropOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors focus-visible:outline-none focus-visible:bg-indigo-50 dark:focus-visible:bg-indigo-500/10"
                          >
                            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                            Admin Panel
                          </Link>
                        </div>

                        <div className="mt-2 pt-2 border-t border-border">
                          <button 
                            role="menuitem"
                            onClick={handleSignOut}
                            disabled={signingOut}
                            aria-disabled={signingOut}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:bg-rose-50 dark:focus-visible:bg-rose-500/10"
                          >
                            <LogOut className="w-4 h-4" aria-hidden="true" />
                            {signingOut ? "Signing out…" : "Sign Out"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2 xl:pl-4 shrink-0">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:underline">Log in</Link>
                <Link href="/register" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Header ── */}
      <header className="sticky top-0 z-[100] lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-border h-16 flex items-center px-4" role="banner">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg" aria-label="EduShare – Go to homepage">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 text-white shadow-sm" aria-hidden="true">
            <Command className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">EduShare</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-border text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isDark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>
          {user ? (
            <Link
              href={`/profile/${user.uid}`}
              aria-label={`View profile of ${user.displayName || "Account"}`}
              className="w-9 h-9 rounded-lg overflow-hidden border border-border shadow-sm active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
               {user.photoURL ? (
                 <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">{initials}</div>
               )}
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-semibold px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Login</Link>
          )}
        </div>
      </header>

      {/* ── Mobile Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden bg-white dark:bg-slate-900 border-t border-border pb-safe"
        aria-label="Mobile navigation"
      >
        <div className="flex h-16">
          {[...MISSION_NAV.slice(0, 4)].map((l) => {
            const Icon = l.icon;
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                aria-label={l.label}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800"
              >
                <Icon className={`w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} aria-hidden="true" />
                <span className={`text-[10px] font-medium ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"}`}>
                  {l.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
          <Link
            href={user ? "/dashboard" : "/register"}
            aria-current={isActive("/dashboard") ? "page" : undefined}
            aria-label={user ? "My Dashboard" : "Join EduShare"}
            className="flex-1 flex flex-col items-center justify-center gap-1 border-l border-border/50 focus-visible:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800"
          >
             <div className="relative">
                <LayoutDashboard className={`w-5 h-5 ${isActive("/dashboard") ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} aria-hidden="true" />
                {user && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" aria-hidden="true" />}
             </div>
             <span className={`text-[10px] font-medium ${isActive("/dashboard") ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"}`}>
               {user ? "Dash" : "Join"}
             </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
