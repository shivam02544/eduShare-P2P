"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/VideoCard";
import { 
  Users, 
  Video, 
  Lock, 
  Globe, 
  Edit3, 
  UserPlus, 
  UserMinus,
  Calendar,
  LayoutGrid,
  ChevronLeft,
  X,
  Sparkles,
  BookOpen
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

function CollectionSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-6 lg:px-0 animate-pulse">
      <div className="h-64 rounded-3xl bg-surface-2 border border-border" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-[380px] rounded-2xl bg-surface-2 border border-border" />
        ))}
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
    if (!confirm("Remove this resource from the collection?")) return;
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
    <div className="text-center py-32 flex flex-col items-center gap-6">
      <div className="w-24 h-24 rounded-2xl bg-surface-2 flex items-center justify-center text-text-3 opacity-30 shadow-inner">
        <LayoutGrid className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <p className="text-xl font-bold text-text-1 tracking-tight">Collection Not Found</p>
        <p className="text-text-3 text-sm font-medium">The requested collection does not exist.</p>
      </div>
      <Link href="/collections" className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-text-1 text-bg text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all">
        <ChevronLeft className="w-4 h-4" />
        Back to Collections
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-6 lg:px-0">
      
      {/* ── Collection Protocol Board ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springConfig}
        className="relative bg-surface-1/70 backdrop-blur-xl border border-border p-10 md:p-14 rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -z-10" />
        
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Cover Art */}
          <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-3xl overflow-hidden bg-surface-2 dark:bg-surface-3 shrink-0 shadow-2xl border border-border">
            {collection.coverImage ? (
              <img src={collection.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-accent/10 to-accent/5">
                <BookOpen className="w-12 h-12 text-accent/40" />
                <Sparkles className="w-4 h-4 text-accent/50 animate-pulse" />
              </div>
            )}
            {!collection.isPublic && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-8 h-8 text-white/50" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-8 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {!collection.isPublic && (
                    <span className="px-3 py-1 rounded-xl bg-surface-3/80 text-text-1 text-[10px] font-bold uppercase tracking-[0.2em] border border-border flex items-center gap-2 shadow-lg">
                      <Lock className="w-3 h-3 text-accent" />
                      Private Protocol
                    </span>
                  )}
                  {collection.subject && (
                    <span className="px-3 py-1 rounded-xl bg-accent text-bg text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-xl shadow-accent/20">
                      {collection.subject}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-text-1 tracking-tight leading-tight line-clamp-2">
                  {collection.title}
                </h1>
                {collection.description && (
                  <p className="text-text-2 text-lg font-medium leading-relaxed max-w-2xl">{collection.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {collection.isCreator ? (
                  <Link href={`/collections/${id}/edit`} className="group flex items-center gap-2.5 px-8 py-4 rounded-3xl bg-surface-2 text-text-1 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-surface-3 transition-all active:scale-95 shadow-xl">
                    <Edit3 className="w-4 h-4 text-accent group-hover:rotate-12 transition-transform" />
                    Edit Collection
                  </Link>
                ) : (
                  <button 
                    onClick={handleFollow} 
                    disabled={followLoading}
                    className={`group flex items-center gap-3 px-10 py-4 rounded-3xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                      following
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                        : "bg-text-1 text-bg shadow-accent/10"
                    }`}
                  >
                    {followLoading ? (
                      <div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    ) : following ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Protocol Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-6 border-t border-border/50">
              <Link href={`/profile/${collection.creator?.firebaseUid}`} className="flex items-center gap-3 group">
                <div className="relative">
                  {collection.creator?.image ? (
                    <img src={collection.creator.image} alt="" className="w-9 h-9 rounded-xl object-cover ring-1 ring-border shadow-md" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center text-xs font-bold text-text-3 border border-border uppercase">
                      {collection.creator?.name?.[0]}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-lg bg-emerald-500 border-2 border-surface-1 shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-4 uppercase tracking-[0.2em]">Architect</span>
                  <span className="text-sm font-bold text-text-1 group-hover:text-accent transition-colors">{collection.creator?.name}</span>
                </div>
              </Link>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-4 uppercase tracking-[0.2em] mb-1">
                  <Video className="w-3 h-3 text-accent" />
                  Resources
                </div>
                <span className="text-sm font-bold text-text-1">{collection.videoCount} Modules</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-4 uppercase tracking-[0.2em] mb-1">
                  <Users className="w-3 h-3 text-accent" />
                  Community
                </div>
                <span className="text-sm font-bold text-text-1">{followerCount} Learners</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-4 uppercase tracking-[0.2em] mb-1">
                  <Calendar className="w-3 h-3 text-accent" />
                  Timestamp
                </div>
                <span className="text-sm font-bold text-text-1">{new Date(collection.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Resource Matrix ── */}
      {collection.videos.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 rounded-[32px] border-2 border-dashed border-border/50 bg-surface-1"
        >
          <div className="w-20 h-20 bg-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-border">
            <Video className="w-8 h-8 text-accent opacity-30" />
          </div>
          <h3 className="text-xl font-bold text-text-1 tracking-tight">Resource Matrix Empty</h3>
          <p className="text-[10px] font-bold text-text-4 uppercase tracking-widest mt-2">This collection does not contain any modules yet.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {collection.videos.map((video, i) => (
            <motion.div 
              key={video._id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", ...springConfig } }
              }}
              className="relative group h-full"
            >
              {/* Position Matrix Badge */}
              <div className="absolute top-4 left-4 z-20 w-8 h-8 rounded-xl bg-surface-1/80 backdrop-blur-md text-text-1 text-[10px] font-bold flex items-center justify-center shadow-2xl border border-border group-hover:bg-accent group-hover:text-bg group-hover:border-transparent transition-all">
                {String(i + 1).padStart(2, "0")}
              </div>
              
              <VideoCard video={video} />
              
              {collection.isCreator && (
                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-rose-500/10 backdrop-blur-md text-rose-500 border border-rose-500/20
                             opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center
                             hover:bg-rose-500 hover:text-white shadow-2xl active:scale-90"
                  title="Remove from collection"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

