"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import { SkeletonCard, SkeletonAvatar, SkeletonText } from "@/components/Skeleton";
import FollowButton from "@/components/FollowButton";
import TipButton from "@/components/TipButton";

function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="card p-6 flex flex-col sm:flex-row gap-6 items-start">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-32" />
          <SkeletonText lines={2} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="card p-4 space-y-2"><div className="skeleton h-6 w-12"/><div className="skeleton h-3 w-20"/></div>)}
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const { uid } = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("videos");
  const [notFound, setNotFound] = useState(false);
  const [myCollections, setMyCollections] = useState([]);
  const [myCerts, setMyCerts] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!uid || !user) return;

    const fetchProfile = () => {
      authFetch(`/api/profile/${uid}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) setNotFound(true);
          else setProfile(d);
          setLoading(false);
        });
    };

    fetchProfile();

    // Refetch when tab regains focus (e.g. after another user follows)
    window.addEventListener("focus", fetchProfile);

    fetch(`/api/collections?creatorUid=${uid}`)
      .then((r) => r.json())
      .then((d) => setMyCollections(Array.isArray(d) ? d : []));

    // Fetch certificates (public — no auth needed)
    fetch(`/api/certificates?uid=${uid}`)
      .then((r) => r.json())
      .then((d) => setMyCerts(Array.isArray(d) ? d : []));

    return () => window.removeEventListener("focus", fetchProfile);
  }, [uid, user]);

  const isOwnProfile = user?.uid === uid;

  const handleDownload = async (note) => {
    if (!user) return;
    const res = await authFetch(`/api/notes/${note._id}/download`, { method: "POST" });
    const data = await res.json();
    if (data.fileUrl) window.open(data.fileUrl, "_blank");
  };

  if (authLoading || loading) return <ProfileSkeleton />;

  if (notFound) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-3">👤</div>
      <p className="text-lg font-semibold text-zinc-700">User not found</p>
      <Link href="/explore" className="text-sm text-violet-600 hover:underline mt-2 block">Back to Explore</Link>
    </div>
  );

  const { user: profileUser, stats, videos, notes } = profile;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          {profileUser.image ? (
            <img src={profileUser.image} alt={profileUser.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-zinc-100 flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 text-3xl font-bold flex-shrink-0">
              {profileUser.name?.[0]?.toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-900">{profileUser.name}</h1>
                  {profileUser.isSuspended && (
                    <span className="badge bg-red-50 text-red-600 border-red-100 text-[10px] uppercase font-bold tracking-wider">
                      Suspended
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-0.5">{profileUser.email}</p>
              </div>
              {isOwnProfile ? (
                  <Link href="/profile/edit" className="btn-secondary flex items-center gap-2 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit Profile
                  </Link>
                ) : !profileUser.isSuspended && (
                  <div className="flex items-center gap-2">
                    <FollowButton
                      targetUid={uid}
                      initialFollowing={profile.isFollowing}
                      initialCount={profileUser.followersCount}
                    />
                    <TipButton targetUid={uid} targetName={profileUser.name} />
                  </div>
                )}
            </div>

            {profileUser.isSuspended && (
              <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-red-900">Restricted Account</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    This account has been suspended for violating community guidelines.
                    {profileUser.suspensionReason && ` Reason: ${profileUser.suspensionReason}`}
                  </p>
                </div>
              </div>
            )}

            {profileUser.bio && !profileUser.isSuspended && (
              <p className="text-sm text-zinc-600 mt-3 leading-relaxed">{profileUser.bio}</p>
            )}

            {/* Skills */}
            {profileUser.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profileUser.skills.map((s) => (
                  <span key={s} className="badge bg-violet-50 text-violet-700 border border-violet-100 text-xs px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Credits + follow stats */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500">🏆</span>
                <span className="text-sm font-semibold text-zinc-700">{profileUser.credits} credits</span>
              </div>
              <span className="text-zinc-300">·</span>
              <span className="text-sm text-zinc-600">
                <strong className="text-zinc-900">{profileUser.followersCount ?? 0}</strong> followers
              </span>
              <span className="text-sm text-zinc-600">
                <strong className="text-zinc-900">{profileUser.followingCount ?? 0}</strong> following
              </span>
              <span className="text-zinc-300">·</span>
              <span className="text-xs text-zinc-400">
                Member since {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Videos", value: stats.totalVideos, icon: "🎥" },
          { label: "Notes", value: stats.totalNotes, icon: "📄" },
          { label: "Total Views", value: stats.totalViews, icon: "👁" },
          { label: "Downloads", value: stats.totalDownloads, icon: "⬇️" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content tabs */}
      <div>
        <div className="flex gap-0 border-b border-zinc-200 mb-5">
          {[
            { key: "videos", label: "Videos", count: videos.length },
            { key: "notes", label: "Notes", count: notes.length },
            { key: "collections", label: "Collections", count: myCollections.length },
            { key: "certificates", label: "Certificates", count: myCerts.length },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}>
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {tab === "videos" ? (
          videos.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <div className="text-4xl mb-2">🎥</div>
              <p className="text-sm">{isOwnProfile ? "You haven't uploaded any videos yet." : "No videos yet."}</p>
              {isOwnProfile && <Link href="/upload-video" className="text-xs text-violet-600 hover:underline mt-1 block">Upload your first video</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((v) => <VideoCard key={v._id} video={v} />)}
            </div>
          )
        ) : tab === "notes" ? (
          notes.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm">{isOwnProfile ? "You haven't uploaded any notes yet." : "No notes yet."}</p>
              {isOwnProfile && <Link href="/upload-notes" className="text-xs text-violet-600 hover:underline mt-1 block">Upload your first notes</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
            </div>
          )
        ) : tab === "collections" ? (
          myCollections.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm">{isOwnProfile ? "You haven't created any collections yet." : "No collections yet."}</p>
              {isOwnProfile && <Link href="/collections" className="text-xs text-violet-600 hover:underline mt-1 block">Create your first collection</Link>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCollections.map((c) => (
                <Link key={c._id} href={`/collections/${c._id}`}
                  className="card overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="h-28 bg-stone-100 flex items-center justify-center overflow-hidden">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : <span className="text-4xl">📚</span>}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-zinc-900 text-sm truncate">{c.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.videoCount} videos · {c.followerCount} followers</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          // Certificates tab
          myCerts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-sm">{isOwnProfile ? "No certificates yet. Pass a quiz to earn one!" : "No certificates yet."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCerts.map((c) => (
                <Link key={c._id} href={`/certificates/${c.certId}`}
                  className="card overflow-hidden hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="h-2" style={{ background: "linear-gradient(90deg, #f59e0b, #d97706)" }} />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏅</span>
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Certificate</span>
                    </div>
                    <p className="font-semibold text-zinc-900 text-sm line-clamp-2">{c.videoTitle}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{c.score}% score</span>
                      <span>{new Date(c.issuedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
