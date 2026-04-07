"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLoading } from "@/context/LoadingContext";
import { useRouter } from "next/navigation";
import { invalidateCache } from "@/lib/cache";

export default function LikeBookmarkBar({ item, type = "video" }) {
  const { user, authFetch } = useAuth();
  const { withLoading } = useLoading();
  const router = useRouter();

  const [likes, setLikes] = useState(item?.likes?.length || 0);
  const [liked, setLiked] = useState(item?.isLiked || false);
  const [bookmarked, setBookmarked] = useState(item?.isBookmarked || false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const requireAuth = () => {
    if (!user) { router.push("/login"); return false; }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    setLikeLoading(true);
    // Trigger heart beat animation
    const btn = document.querySelector(`[data-like-id="${item._id}"]`);
    if (btn) { btn.classList.remove("heart-beat"); void btn.offsetWidth; btn.classList.add("heart-beat"); }
    await withLoading(async () => {
      const res = await authFetch(`/api/${type}s/${item._id}/like`, { method: "POST" });
      const data = await res.json();
      setLikes(data.likes);
      setLiked(data.liked);
      invalidateCache(`${type}s:All:recent`);
      invalidateCache(`${type}s:All:popular`);
    }, liked ? "Removing like..." : "Liking...");
    setLikeLoading(false);
  };

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    setBookmarkLoading(true);
    await withLoading(async () => {
      const res = await authFetch(`/api/${type}s/${item._id}/bookmark`, { method: "POST" });
      const data = await res.json();
      setBookmarked(data.bookmarked);
      invalidateCache("videos:All:recent");
      invalidateCache("videos:All:popular");
    }, bookmarked ? "Removing bookmark..." : "Saving...");
    setBookmarkLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Like */}
      <button
        onClick={handleLike}
        disabled={likeLoading}
        data-like-id={item._id}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
          ${liked
            ? "bg-violet-100 text-violet-700 border border-violet-200"
            : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200"
          } disabled:opacity-60`}>
        <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <span>{likes > 0 ? likes : ""} {liked ? "Liked" : "Like"}</span>
      </button>

      {/* Bookmark (videos only) */}
      {type === "video" && (
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
            ${bookmarked
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
            } disabled:opacity-60`}>
          <svg className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
          <span>{bookmarked ? "Saved" : "Save"}</span>
        </button>
      )}

      {/* Share */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied!");
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
        </svg>
        Share
      </button>
    </div>
  );
}
