"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Trash2, 
  ShieldAlert, 
  Send, 
  MessageSquare, 
  Clock, 
  User as UserIcon, 
  Sparkles, 
  Loader2,
  MoreHorizontal,
  ThumbsUp,
  CornerDownRight,
  Shield
} from "lucide-react";
import ReportButton from "@/components/ReportButton";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function CommentItem({ comment, currentUserId, authFetch, onDelete, index }) {
  const [likes, setLikes] = useState(comment.likes?.length || 0);
  const [liked, setLiked] = useState(
    comment.likes?.some((l) => l === currentUserId || l?._id === currentUserId)
  );
  const [deleting, setDeleting] = useState(false);
  const isOwn = comment.author?.firebaseUid === currentUserId || comment.author?._id === currentUserId;

  const handleLike = async () => {
    try {
      const res = await authFetch(`/api/comments/${comment._id}`, { method: "PATCH" });
      const data = await res.json();
      setLikes(data.likes);
      setLiked(data.liked);
    } catch (err) {
      console.error("Transmission error in Pulse reaction.", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Protocol Confirmation: Purge this interaction node?")) return;
    setDeleting(true);
    await authFetch(`/api/comments/${comment._id}`, { method: "DELETE" });
    onDelete(comment._id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4 group relative"
    >
      {/* Avatar Node */}
      <Link href={`/profile/${comment.author?.firebaseUid}`} className="flex-shrink-0 relative">
        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-border bg-slate-100 dark:bg-white/5 shadow-inner group-hover:scale-105 transition-transform">
          {comment.author?.image ? (
            <img src={comment.author.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-3 font-black text-xs italic">
              {comment.author?.name?.[0]}
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-lg bg-emerald-500 border border-white dark:border-slate-900 shadow-sm" />
      </Link>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border rounded-[28px] rounded-tl-none p-5 shadow-sm group-hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${comment.author?.firebaseUid}`} className="text-xs font-black text-text-1 hover:text-indigo-500 transition-colors italic">
                {comment.author?.name}
              </Link>
              <div className="flex items-center gap-1.5 opacity-40">
                 <Clock className="w-3 h-3" />
                 <span className="text-[10px] font-black uppercase tracking-widest italic">{timeAgo(comment.createdAt)}</span>
              </div>
            </div>
            {comment.author?.role === 'admin' && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500 text-white">
                 <Shield className="w-2.5 h-2.5" />
                 <span className="text-[8px] font-black uppercase tracking-widest italic">Core</span>
              </div>
            )}
          </div>
          <p className="text-[13px] font-medium text-text-1 leading-relaxed whitespace-pre-wrap break-words italic">
            {comment.text}
          </p>
        </div>

        {/* Pulse Actions */}
        <div className="flex items-center gap-5 px-2">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${
              liked ? "text-rose-500" : "text-text-3 hover:text-rose-500"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current scale-110" : ""}`} />
            {likes > 0 && <span>{likes} Reactions</span>}
          </button>

          {isOwn ? (
            <button 
              onClick={handleDelete} 
              disabled={deleting}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 hover:text-rose-500 transition-colors disabled:opacity-50 italic"
            >
              {deleting ? "Purging..." : "Purge node"}
            </button>
          ) : (
            <ReportButton contentType="comment" contentId={comment._id} compact />
          )}
        </div>
      </div>
    </motion.div>
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
      .then((d) => { setComments(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [videoId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);

    try {
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
    } catch (err) {
      console.error("Comment projection failed.", err);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (id) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="space-y-10">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-text-1 tracking-tight italic flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          Pulse Interaction
          <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.3em] ml-2 italic">({comments.length} Nodes)</span>
        </h2>
        <div className="h-px flex-1 mx-6 bg-border opacity-50" />
      </div>

      {/* Input Hub */}
      {user ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-6 rounded-[40px] shadow-sm flex gap-4 ring-1 ring-border/50"
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-border bg-slate-100 dark:bg-white/5 shrink-0">
             {user.photoURL ? (
               <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-text-3 font-black text-xs italic">
                 {user.displayName?.[0]}
               </div>
             )}
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(e); }}}
              placeholder="Materialize your perspective... (Shift+Enter for newline)"
              rows={2}
              maxLength={1000}
              className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-6 py-4 text-sm font-black text-text-1 placeholder:opacity-30 focus:border-indigo-500 transition-all outline-none italic resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-3 italic">{text.length} / 1000 Symbols</span>
              <button 
                onClick={handlePost}
                disabled={!text.trim() || posting}
                className="group flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-2.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl italic disabled:opacity-30"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                Project Perspective
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-border rounded-[32px] p-8 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-3 italic">Identify yourself to join the pulse stream</p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-3 bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg shadow-indigo-500/30 transition-all italic"
          >
            Authenticate Profile
            <ChevronRight className="w-4 h-4 font-black" />
          </Link>
        </div>
      )}

      {/* interaction Stream */}
      <div className="space-y-8 relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border group-hover:bg-indigo-500/20 transition-colors" />
        
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-20 w-full bg-slate-100 dark:bg-white/5 rounded-[28px]" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-3"
            >
              <Sparkles className="w-10 h-10 text-text-3 opacity-10 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-text-3 italic">Pulse stream currently dormant. Be the first to synchronize.</p>
            </motion.div>
          ) : (
            <div className="space-y-10">
              {comments.map((c, i) => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  currentUserId={user?.uid}
                  authFetch={authFetch}
                  onDelete={handleDelete}
                  index={i}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

