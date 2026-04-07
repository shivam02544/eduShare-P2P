"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { SkeletonCard } from "@/components/Skeleton";

export default function BookmarksPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    authFetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => { setVideos(d); setLoading(false); });
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Saved Videos</h1>
        <p className="text-zinc-400 text-sm mt-1">Videos you've bookmarked for later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <div className="text-5xl mb-3">🔖</div>
          <p className="font-medium text-zinc-600">No saved videos yet</p>
          <p className="text-sm mt-1">Bookmark videos while watching to find them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
