"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";

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
      aria-disabled={loading}
      aria-busy={loading}
      aria-pressed={following}
      aria-label={following ? `Unfollow – ${count} followers` : `Follow – ${count} followers`}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 ${
        following
          ? "bg-slate-100 text-slate-700 border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-slate-800 dark:text-slate-300"
          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
      }`}>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : following ? (
        <UserCheck className="w-4 h-4" aria-hidden="true" />
      ) : (
        <UserPlus className="w-4 h-4" aria-hidden="true" />
      )}
      {following ? "Following" : "Follow"}
      {count > 0 && <span className="text-xs opacity-70 ml-1" aria-hidden="true">· {count}</span>}
    </button>
  );
}
