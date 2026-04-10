"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const icons = {
  follow: (
    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    </svg>
  ),
  like_video: (
    <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  like_note: (
    <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
  comment: (
    <svg className="w-4 h-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
    </svg>
  ),
  credit: (
    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.294 2.744.88 4.226a1 1 0 01-1.476 1.065L10 17.024l-3.991 2.026a1 1 0 01-1.476-1.065l.88-4.226-3.294-2.744a1 1 0 01-.285-1.05L3.57 7.509l-1.233-.616a1 1 0 01.894-1.79l1.599.8L8.954 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  system: (
    <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  ),
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
          
          // Detect new notifications for Toast
          if (d.notifications?.length > 0) {
            const latest = d.notifications[0];
            
            // If we have a new ID that isn't the one we saw last
            if (lastSeenIdRef.current && latest._id !== lastSeenIdRef.current && !latest.read) {
              if (latest.type === "credit") {
                toast(latest.message, { icon: "🏆" });
              } else {
                toast(latest.message);
              }
            }
            lastSeenIdRef.current = latest._id;
          }
          
          setNotifications(d.notifications || []);
        }
      } catch (err) {
        console.error("Notification fetch failed", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15_000);
    return () => clearInterval(interval);
  }, [user]); // Removed lastSeenId from dependencies

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
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </div>
                <p className="text-sm font-medium">No notifications yet</p>
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
