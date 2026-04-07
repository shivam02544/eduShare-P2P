"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";

export default function FollowButton({ targetUid, initialFollowing, initialCount }) {
  const { user, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount ?? 0);
  const [loading, setLoading] = useState(false);

  // Don't show on own profile
  if (user?.uid === targetUid) return null;

  const handleClick = async () => {
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    await withLoading(async () => {
      const res = await authFetch(`/api/users/${targetUid}/follow`, { method: "POST" });
      const data = await res.json();
      if (!data.error) {
        setFollowing(data.following);
        setCount(data.followersCount);
      }
    }, following ? "Unfollowing..." : "Following...");
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 ${
        following
          ? "bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}>
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      ) : following ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
      )}
      {following ? "Following" : "Follow"}
      {count > 0 && <span className="text-xs opacity-70">· {count}</span>}
    </button>
  );
}
