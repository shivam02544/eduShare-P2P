"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
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
  Activity,
  Cpu,
  Monitor,
  Menu,
  X,
  Target,
  Sparkles,
  ArrowRight
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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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
      {/* ── Desktop Global Protocol Bridge ── */}
      <header className="sticky top-0 z-[100] hidden lg:block select-none">
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-border/50 shadow-sm transition-colors duration-500" />
        
        <div className="relative max-w-[1440px] mx-auto px-8 h-[72px] flex items-center gap-6">
          {/* Logo: Mission Control Brand */}
          <Link href="/" className="flex items-center gap-4 mr-8 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={springConfig}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              <Command className="w-5 h-5" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-text-1 leading-none">EduShare</span>
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1 pl-0.5">Peer Learning</span>
            </div>
          </Link>

          {/* Primary Navigation */}
          <nav className="flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-border/50">
            {[...MISSION_NAV, ...(user ? AUTH_ALIGNED : [])].map((l) => {
              const Icon = l.icon;
              const active = isActive(l.href);
              return (
                <Link key={l.href} href={l.href} className="relative px-5 py-2 group overflow-hidden">
                  <div className={`flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    active ? "text-indigo-600 dark:text-indigo-400" : "text-text-3 group-hover:text-text-1"
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${active ? "opacity-100" : "opacity-40"}`} />
                    {l.label}
                  </div>
                  {active && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border/30 -z-10"
                      transition={springConfig}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Actions & Core Interfacing */}
          <div className="flex items-center gap-4 min-w-0">
            {user && (
              <div className="flex-1 max-w-[320px] min-w-[40px] transition-all duration-500">
                <SearchBar />
              </div>
            )}

            <div className="h-8 w-px bg-border/50 mx-2" />

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50 text-text-2 hover:text-indigo-500 transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {loading ? (
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse border border-border/50" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="relative" ref={dropRef}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDropOpen(!dropOpen)}
                    className={`flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border transition-all ${
                      dropOpen 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xl" 
                        : "bg-white dark:bg-white/5 border-border/50 hover:bg-slate-50 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="relative">
                       {user.photoURL ? (
                         <img src={user.photoURL} alt="" className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20" />
                       ) : (
                         <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
                           {initials}
                         </div>
                       )}
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">User Account</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ${dropOpen ? "rotate-180" : ""}`} />
                  </motion.button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(10px)" }}
                        transition={springConfig}
                        className="absolute right-0 mt-4 w-72 rounded-[32px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-border shadow-3xl overflow-hidden z-[100] p-3 ring-1 ring-border/50"
                      >
                        <div className="px-5 py-6 mb-3 bg-slate-50 dark:bg-white/5 rounded-[24px] border border-border/50 relative overflow-hidden group/profile">
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl transition-all group/profile:scale-150" />
                          <p className="text-[11px] font-bold text-text-3 uppercase tracking-widest mb-1">User Profile</p>
                          <p className="text-sm font-bold text-text-1 truncate tracking-tight">{user.displayName || "Student"}</p>
                          <p className="text-[9px] text-text-3 truncate font-bold uppercase tracking-widest mt-2 opacity-50">{user.email}</p>
                        </div>

                        <div className="space-y-1">
                          {IDENTITY_PROTOCOLS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link 
                                key={item.href}
                                href={item.dynamic ? `/profile/${user.uid}` : item.href}
                                className="flex items-center gap-4 px-5 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-widest text-text-2 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                              >
                                <Icon className="w-3.5 h-3.5 text-text-3 group-hover:text-indigo-500 transition-all" />
                                {item.label}
                                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
                              </Link>
                            );
                          })}

                          <div className="h-px bg-border/50 mx-4 my-2" />

                          <Link href="/admin" className="flex items-center gap-4 px-5 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white dark:text-slate-900 bg-slate-900 dark:bg-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <ShieldCheck className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/50 px-2">
                          <button 
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            {signingOut ? "Signing Out..." : "Sign Out"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-4">
                <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.3em] text-text-2 hover:text-text-1 px-6 py-3 transition-colors">Log in</Link>
                <Link href="/register" className="relative group overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.03] active:scale-[0.97] transition-all shadow-2xl">
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Join Now
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Mission Dock Transitions ── */}
      <header className="sticky top-0 z-[100] lg:hidden bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-border/50 h-[64px] flex items-center px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl">
            <Command className="w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tighter">EduShare</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-border/50 text-text-2 transition-transform active:rotate-12">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user ? (
            <Link href={`/profile/${user.uid}`} className="w-9 h-9 rounded-xl overflow-hidden border border-border shadow-sm active:scale-90 transition-transform">
               {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500" />}
            </Link>
          ) : (
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl shadow-lg">Login</Link>
          )}
        </div>
      </header>

      {/* ── Floating Mobile Bottom Mission Dock ── */}
      <nav className="fixed bottom-4 left-4 right-4 z-[100] lg:hidden">
        <div className="flex bg-slate-900/90 dark:bg-white/95 backdrop-blur-2xl border border-white/10 dark:border-black/5 rounded-[28px] h-16 py-2 px-3 shadow-3xl shadow-indigo-500/20">
          {[...MISSION_NAV, ...(user ? AUTH_ALIGNED : [])].slice(0, 4).map((l) => {
            const Icon = l.icon;
            const active = isActive(l.href);
            return (
              <Link key={l.href} href={l.href} className="flex-1 flex flex-col items-center justify-center gap-1.5 transition-all">
                <motion.div 
                  animate={{ scale: active ? 1.2 : 1, y: active ? -4 : 0 }}
                  className={`${active ? "text-indigo-400 dark:text-indigo-600" : "text-white/40 dark:text-slate-900/40"}`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? "text-indigo-400 dark:text-indigo-600" : "text-white/20 dark:text-slate-900/20"}`}>
                  {l.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
          <div className="w-px h-8 bg-white/10 dark:bg-black/10 my-auto mx-2" />
          <Link href={user ? "/dashboard" : "/register"} className="flex-1 flex flex-col items-center justify-center gap-1.5 group">
             <motion.div 
               animate={{ scale: isActive("/dashboard") ? 1.2 : 1, y: isActive("/dashboard") ? -4 : 0 }}
               className="relative"
             >
                <LayoutDashboard className={`w-5 h-5 ${isActive("/dashboard") ? "text-indigo-400 dark:text-indigo-600" : "text-white/40 dark:text-slate-900/40"}`} />
                {user && <Activity className="absolute -top-1 -right-1 w-2.5 h-2.5 text-emerald-400 animate-pulse" />}
             </motion.div>
             <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isActive("/dashboard") ? "text-indigo-400 dark:text-indigo-600" : "text-white/20 dark:text-slate-900/20"}`}>
               {user ? "DASH" : "JOIN"}
             </span>
          </Link>
        </div>
      </nav>
    </>
  );
}


