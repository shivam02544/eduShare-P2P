"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard } from "@/components/Skeleton";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function FeedPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [feed, setFeed] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/feed")
      .then((r) => r.json())
      .then((d) => {
        setFeed(d.items || []);
        setEmpty(d.empty);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Your Feed</h1>
        <p className="text-zinc-400 text-sm mt-1">Latest from people you follow</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : empty ? (
        <div className="text-center py-20 text-zinc-400">
          <div className="text-5xl mb-3">👥</div>
          <p className="font-medium text-zinc-600">Your feed is empty</p>
          <p className="text-sm mt-1 mb-4">Follow people to see their uploads here</p>
          <Link href="/explore" className="btn-primary">Discover people</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((item) => (
            <div key={item._id} className="animate-fade-in">
              {/* Who posted */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <Link href={`/profile/${item.uploader?.firebaseUid}`} className="flex items-center gap-2 group">
                  {item.uploader?.image ? (
                    <img src={item.uploader.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold">
                      {item.uploader?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-violet-600 transition-colors">
                    {item.uploader?.name}
                  </span>
                </Link>
                <span className="text-xs text-zinc-400">
                  uploaded a {item.kind} · {timeAgo(item.createdAt)}
                </span>
              </div>

              {/* Content card */}
              {item.kind === "video" ? (
                <VideoCard video={item} />
              ) : (
                <NoteCard note={item} onDownload={async (note) => {
                  const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
                  const data = await res.json();
                  if (data.fileUrl) window.open(data.fileUrl, "_blank");
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
