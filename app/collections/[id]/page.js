"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import { SkeletonCard, SkeletonAvatar } from "@/components/Skeleton";

function CollectionSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6 flex gap-5">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-64" />
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-4 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const { id } = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  const fetchCollection = () => {
    authFetch(`/api/collections/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setNotFound(true); setLoading(false); return; }
        setCollection(d);
        setFollowing(d.isFollowing);
        setFollowerCount(d.followerCount);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) fetchCollection();
  }, [id, user]);

  const handleFollow = async () => {
    setFollowLoading(true);
    const res = await authFetch(`/api/collections/${id}/follow`, { method: "POST" });
    const data = await res.json();
    setFollowing(data.following);
    setFollowerCount(data.followerCount);
    setFollowLoading(false);
  };

  const handleRemoveVideo = async (videoId) => {
    if (!confirm("Remove this video from the collection?")) return;
    await authFetch(`/api/collections/${id}/videos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    setCollection((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v._id !== videoId),
    }));
  };

  if (authLoading || loading) return <CollectionSkeleton />;
  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-lg font-semibold text-zinc-700">Collection not found</p>
      <Link href="/collections" className="text-sm text-violet-600 hover:underline mt-2 block">Browse collections</Link>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Cover */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 flex items-center justify-center">
            {collection.coverImage ? (
              <img src={collection.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">📚</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {!collection.isPublic && (
                    <span className="badge bg-zinc-100 text-zinc-500 border border-zinc-200 text-[11px]">
                      🔒 Private
                    </span>
                  )}
                  {collection.subject && (
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">
                      {collection.subject}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-zinc-900">{collection.title}</h1>
                {collection.description && (
                  <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{collection.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {collection.isCreator ? (
                  <Link href={`/collections/${id}/edit`} className="btn-secondary text-sm">
                    Edit Collection
                  </Link>
                ) : (
                  <button onClick={handleFollow} disabled={followLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 ${
                      following
                        ? "bg-stone-100 text-zinc-700 border border-stone-200 hover:bg-red-50 hover:text-red-600"
                        : "btn-primary"
                    }`}>
                    {followLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : following ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 text-sm text-zinc-400 flex-wrap">
              <Link href={`/profile/${collection.creator?.firebaseUid}`}
                className="flex items-center gap-1.5 hover:text-zinc-700 transition-colors">
                {collection.creator?.image ? (
                  <img src={collection.creator.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-[10px] font-bold">
                    {collection.creator?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                {collection.creator?.name}
              </Link>
              <span>{collection.videoCount} videos</span>
              <span>{followerCount} followers</span>
              <span>Updated {new Date(collection.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Videos */}
      {collection.videos.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-zinc-600">No videos yet</p>
          {collection.isCreator && (
            <p className="text-sm mt-1">Add videos from the video watch page</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collection.videos.map((video, i) => (
            <div key={video._id} className="relative group">
              {/* Position badge */}
              <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/70 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <VideoCard video={video} />
              {collection.isCreator && (
                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-red-500 text-white text-xs
                             opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center
                             hover:bg-red-600">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
