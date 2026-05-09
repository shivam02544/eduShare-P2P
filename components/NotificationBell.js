"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const N_ICONS = {
  follow: <User className="w-4 h-4 text-indigo-500" />,
  like_video: <Heart className="w-4 h-4 text-rose-500 fill-current" />,
  like_note: <Heart className="w-4 h-4 text-rose-500 fill-current" />,
  comment: <MessageSquare className="w-4 h-4 text-emerald-500" />,
  credit: <Zap className="w-4 h-4 text-amber-500 fill-current" />,
  system: <Activity className="w-4 h-4 text-gray-500" />,
};

export default function NotificationBell() {
  const { user, authFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const lastSeenIdRef = useRef(null);
  const ref = useRef(null);
  const triggerRef = useRef(null);

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
                icon: latest.type === "credit" ? "⚡" : "🔔",
                style: {
                  borderRadius: '12px',
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '13px',
                  fontWeight: '500',
                }
              });
            }
            lastSeenIdRef.current = latest._id;
          }
          setNotifications(d.notifications || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
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

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

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
      <button
        ref={triggerRef}
        onClick={handleOpen}
        aria-label={unread > 0 ? `${unread} unread notifications – open notifications` : "Notifications – no new notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`group relative p-2 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${open ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-500'}`}
      >
        <Bell className={`w-5 h-5 transition-transform group-active:scale-95 ${unread > 0 ? 'animate-[pulse_2s_infinite]' : ''}`} aria-hidden="true" />
        
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={springConfig}
            role="dialog"
            aria-label="Notifications"
            aria-modal="false"
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-border overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-slate-50/50 dark:bg-slate-800/50">
               <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                      {unread} new
                    </span>
                  )}
               </div>
               {notifications.length > 0 && (
                 <button
                   onClick={() => {
                     setNotifications([]);
                     authFetch("/api/notifications", { method: "PATCH" });
                   }}
                   aria-label="Mark all notifications as read"
                   className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                   <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                 </button>
               )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: "none" }} aria-live="polite" aria-atomic="false">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                     <Bell className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">No notifications</p>
                  <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <Link href={getLink(n)}
                      key={n._id}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        !n.read ? "bg-indigo-50/50 dark:bg-indigo-500/5" : ""
                      }`}>
                      <div className="relative shrink-0 mt-0.5">
                        {n.sender?.image ? (
                          <img src={n.sender.image} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold border border-indigo-200 dark:border-indigo-800">
                            {n.sender?.name?.[0] || <User className="w-4 h-4" />}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                          {N_ICONS[n.type]}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>

                      {!n.read && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-1.5" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border bg-slate-50/50 dark:bg-slate-800/50">
                <Link href="/notifications" onClick={() => setOpen(false)}
                  className="block w-full py-2 text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

