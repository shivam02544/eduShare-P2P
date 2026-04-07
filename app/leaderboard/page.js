"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCache, setCache } from "@/lib/cache";

const medals = ["🥇", "🥈", "🥉"];

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array(10).fill(0).map((_, i) => (
        <div key={i} className="card px-5 py-4 flex items-center gap-4">
          <div className="skeleton h-5 w-5 rounded" />
          <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const cached = getCache("leaderboard");
    if (cached) { setUsers(cached); setLoading(false); return; }

    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { setCache("leaderboard", d, 60_000); setUsers(d); setLoading(false); });
  }, [user]);

  const myRank = users.findIndex((u) => u.firebaseUid === user?.uid) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Leaderboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Top contributors ranked by credits earned</p>
      </div>

      {/* My rank banner */}
      {myRank > 0 && (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-violet-600">#{myRank}</span>
            <div>
              <p className="text-sm font-semibold text-violet-900">Your rank</p>
              <p className="text-xs text-violet-500">{users[myRank - 1]?.credits} credits</p>
            </div>
          </div>
          <Link href={`/profile/${user?.uid}`} className="btn-primary text-xs px-4 py-2">
            View Profile
          </Link>
        </div>
      )}

      {loading ? <LeaderboardSkeleton /> : (
        <div className="space-y-2">
          {users.map((u, i) => {
            const isMe = u.firebaseUid === user?.uid;
            return (
              <Link key={u._id} href={`/profile/${u.firebaseUid}`}
                className={`card px-5 py-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform ${
                  isMe ? "ring-2 ring-violet-200 bg-violet-50/50" : ""
                }`}>
                {/* Rank */}
                <div className="w-7 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-xl">{medals[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-zinc-400">#{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                {u.image ? (
                  <img src={u.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold flex-shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900 truncate text-sm">{u.name}</p>
                    {isMe && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">You</span>}
                  </div>
                  {u.skills?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {u.skills.slice(0, 2).map((s) => (
                        <span key={s} className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Credits */}
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl flex-shrink-0">
                  <span className="text-sm">🏆</span>
                  <span className="text-sm font-bold text-amber-700">{u.credits}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
