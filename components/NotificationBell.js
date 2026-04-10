"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  User, 
  Heart, 
  MessageSquare, 
  Zap, 
  Activity, 
  ShieldCheck, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Inbox,
  Radio
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just Sync'd";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const N_ICONS = {
  follow: <User className="w-3.5 h-3.5 text-indigo-500" />,
  like_video: <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />,
  like_note: <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />,
  comment: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />,
  credit: <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />,
  system: <Activity className="w-3.5 h-3.5 text-slate-500" />,
};

export default function NotificationBell() {
  const { user, authFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const lastSeenIdRef = useRef(null);
  const ref = useRef(null);

  // Poll unread count every 15s
  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const res = await authFetch("/api/notifications");
        if (!res.ok) return; 
        const d = await res.json();
        
        if (!d.error) {
          setUnread(d.unreadCount);
          if (d.notifications?.length > 0) {
            const latest = d.notifications[0];
            if (lastSeenIdRef.current && latest._id !== lastSeenIdRef.current && !latest.read) {
              toast(latest.message, { 
                icon: latest.type === "credit" ? "⚡" : "🛰️",
                style: {
                  borderRadius: '24px',
                  background: '#0f172a',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontStyle: 'italic'
                }
              });
            }
            lastSeenIdRef.current = latest._id;
          }
          setNotifications(d.notifications || []);
        }
      } catch (err) {
        console.error("Communication sync failure", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15_000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unread > 0) {
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try { authFetch("/api/notifications", { method: "PATCH" }); } catch {}
    }
  };

  const getLink = (n) => {
    if (n.type === "follow") return `/profile/${n.sender?.firebaseUid}`;
    if (n.video) return `/videos/${n.video?._id}`;
    return "#";
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen}
        className={`group relative p-2.5 rounded-[18px] transition-all duration-500 overflow-hidden ${open ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 dark:bg-white/5 border border-border hover:bg-white dark:hover:bg-white/10 hover:border-indigo-500/30'}`}
      >
        <Bell className={`w-5 h-5 transition-transform group-active:scale-90 ${unread > 0 ? 'animate-[pulse_2s_infinite]' : ''}`} />
        
        {unread > 0 && (
          <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-indigo-500 group-hover:bg-white border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={springConfig}
            className="absolute right-0 mt-5 w-[360px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[40px] shadow-3xl border border-border overflow-hidden z-50 p-2"
          >
            {/* Hub Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-border/50">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                     <Radio className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-text-1 uppercase tracking-widest italic">Intelligence Hub</p>
                     <p className="text-[8px] font-bold text-text-3 uppercase tracking-widest italic opacity-50">Sync Active</p>
                  </div>
               </div>
               {notifications.length > 0 && (
                 <button
                   onClick={() => {
                     setNotifications([]);
                     authFetch("/api/notifications", { method: "PATCH" });
                   }}
                   className="p-2 rounded-xl text-text-3 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                   <CheckCircle2 className="w-4 h-4" />
                 </button>
               )}
            </div>

            {/* Sync Logs */}
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar py-2 px-1">
              {notifications.length === 0 ? (
                <div className="text-center py-16 px-8 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-[24px] flex items-center justify-center mx-auto border border-border text-text-3 opacity-20">
                     <Inbox className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[11px] font-bold text-text-1 uppercase tracking-widest italic">Zero Input Detected</p>
                     <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest italic opacity-50">Intelligence registry is currently clear.</p>
                  </div>
                </div>
              ) : (
                notifications.map((n, idx) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={getLink(n)}
                      onClick={() => setOpen(false)}
                      className={`group flex items-start gap-4 p-4 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-border/50 ${
                        !n.read ? "bg-indigo-500/5" : ""
                      }`}>
                      <div className="relative flex-shrink-0">
                        {n.sender?.image ? (
                          <img src={n.sender.image} alt="" className="w-11 h-11 rounded-2xl object-cover border border-border group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-[14px] font-bold italic shadow-inner">
                            {n.sender?.name?.[0]}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-border flex items-center justify-center shadow-sm">
                          {N_ICONS[n.type]}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-[12px] font-bold text-text-1 italic leading-tight group-hover:text-indigo-500 transition-colors">{n.message}</p>
                        <div className="flex items-center gap-2 italic">
                           <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest opacity-50">{timeAgo(n.createdAt)}</span>
                           <div className="w-1 h-1 rounded-full bg-border" />
                           <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Protocol Sync</span>
                        </div>
                      </div>

                      {!n.read && (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-4 animate-pulse" />
                      )}
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            {/* Hub Footer */}
            <div className="p-4 border-t border-border/50">
               <div className="text-center">
                  <p className="text-[8px] font-bold text-text-3 uppercase tracking-widest italic opacity-30">Synapse Network Active</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

