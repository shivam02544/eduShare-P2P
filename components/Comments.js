"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function CommentItem({ comment, currentUserId, authFetch, onDelete }) {
  const [likes, setLikes] = useState(comment.likes?.length || 0);
  const [liked, setLiked] = useState(
    comment.likes?.some((l) => l === currentUserId || l?._id === currentUserId)
  );
  const [deleting, setDeleting] = useState(false);
  const isOwn = comment.author?.firebaseUid === currentUserId ||
    comment.author?._id === currentUserId;

  const handleLike = async () => {
    const res = await authFetch(`/api/comments/${comment._id}`, { method: "PATCH" });
    const data = await res.json();
    setLikes(data.likes);
    setLiked(data.liked);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    setDeleting(true);
    await authFetch(`/api/comments/${comment._id}`, { method: "DELETE" });
    onDelete(comment._id);
  };

  return (
    <div className="flex gap-3 group animate-fade-in">
      {/* Avatar */}
      <Link href={`/profile/${comment.author?.firebaseUid}`} className="flex-shrink-0 mt-0.5">
        {comment.author?.image ? (
          <img src={comment.author.image} alt=""
            className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-violet-300 transition-all" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold hover:ring-2 hover:ring-violet-300 transition-all">
            {comment.author?.name?.[0]?.toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="bg-zinc-50 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/profile/${comment.author?.firebaseUid}`}
              className="text-sm font-semibold text-zinc-800 hover:text-violet-600 transition-colors">
              {comment.author?.name}
            </Link>
            <span className="text-xs text-zinc-400">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap break-words">
            {comment.text}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1.5 px-1">
          <button onClick={handleLike}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              liked ? "text-violet-600" : "text-zinc-400 hover:text-violet-500"
            }`}>
            <svg className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {likes > 0 && <span>{likes}</span>}
          </button>

          {isOwn && (
            <button onClick={handleDelete} disabled={deleting}
              className="text-xs text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          {!isOwn && (
            <ReportButton contentType="comment" contentId={comment._id} compact />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Comments({ videoId }) {
  const { user, authFetch } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((d) => { setComments(d); setLoading(false); });
  }, [videoId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);

    const res = await authFetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!data.error) {
      setComments((prev) => [data, ...prev]);
      setText("");
      textareaRef.current?.focus();
    }
    setPosting(false);
  };

  const handleDelete = (id) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
        Comments
        <span className="text-sm font-normal text-zinc-400">({comments.length})</span>
      </h2>

      {/* Post a comment */}
      {user ? (
        <form onSubmit={handlePost} className="flex gap-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0 mt-1">
              {user.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(e); }}}
              placeholder="Add a comment... (Enter to post)"
              rows={2}
              maxLength={1000}
              className="input resize-none text-sm w-full"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-400">{text.length}/1000</span>
              <button type="submit" disabled={!text.trim() || posting}
                className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50">
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-500 text-center">
          <Link href="/login" className="text-violet-600 font-medium hover:underline">Sign in</Link> to leave a comment
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-16 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              currentUserId={user?.uid}
              authFetch={authFetch}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
