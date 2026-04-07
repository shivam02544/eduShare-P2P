"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const icons = {
  follow: "👤",
  like_video: "❤️",
  like_note: "❤️",
  comment: "💬",
  credit: "🏆",
};

export default function NotificationBell() {
  const { user, authFetch } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Poll unread count every 30s
  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const res = await authFetch("/api/notifications");
        if (!res.ok) return; // silently skip on auth errors
        const text = await res.text();
        if (!text) return; // empty body guard
        const d = JSON.parse(text);
        if (!d.error) {
          setUnread(d.unreadCount);
          setNotifications(d.notifications);
        }
      } catch {
        // Network error or bad JSON — don't crash
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  // Close on outside click
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
        className="relative p-2 rounded-xl hover:bg-zinc-100 transition-colors">
        <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold badge-new">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50 animate-slide-down">
          <div className="px-4 py-3 border-b border-zinc-50 flex items-center justify-between">
            <p className="font-semibold text-zinc-900 text-sm">Notifications</p>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  setNotifications([]);
                  authFetch("/api/notifications", { method: "PATCH" });
                }}
                className="text-xs text-zinc-400 hover:text-zinc-600">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-zinc-400">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link key={n._id} href={getLink(n)}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 ${
                    !n.read ? "bg-violet-50/50" : ""
                  }`}>
                  {/* Sender avatar */}
                  <div className="relative flex-shrink-0">
                    {n.sender?.image ? (
                      <img src={n.sender.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-sm font-bold">
                        {n.sender?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none">
                      {icons[n.type]}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700 leading-snug">{n.message}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>

                  {!n.read && (
                    <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
