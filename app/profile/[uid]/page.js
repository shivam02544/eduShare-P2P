"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import VideoCard from "@/components/VideoCard";
import NoteCard from "@/components/NoteCard";
import FollowButton from "@/components/FollowButton";
import TipButton from "@/components/TipButton";
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Users, 
  Video, 
  FileText, 
  Eye, 
  Download, 
  Sparkles,
  Library,
  Award,
  Edit3,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Heart,
  Database,
  Cpu,
  Monitor,
  Activity,
  ShieldCheck,
  Zap,
  Target,
  ArrowRight,
  Layers,
  Terminal,
  BookOpen
} from "lucide-react";

const springConfig = { mass: 1, tension: 120, friction: 20 };

import PageContainer from "@/components/layouts/PageContainer";
import ResponsiveGrid from "@/components/layouts/ResponsiveGrid";

function ProfileSkeleton() {
  return (
    <PageContainer>
      <div className="h-64 md:h-80 rounded-2xl bg-slate-200 dark:bg-white/5 border border-border/50 animate-pulse" />
      <ResponsiveGrid columns={4}>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-white/5 border border-border/50 animate-pulse" />
        ))}
      </ResponsiveGrid>
    </PageContainer>
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
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!uid || !user) return;

    const fetchProfile = () => {
      authFetch(`/api/profile/${uid}`)
        .then((r) => {
          if (!r.ok) throw new Error(`Profile fetch failed (${r.status})`);
          return r.json();
        })
        .then((d) => {
          if (d.error) setNotFound(true);
          else setProfile(d);
          setLoading(false);
        })
        .catch(() => { setNotFound(true); setLoading(false); });
    };

    fetchProfile();
    window.addEventListener("focus", fetchProfile);

    fetch(`/api/collections?creatorUid=${uid}`)
      .then((r) => r.json())
      .then((d) => setMyCollections(Array.isArray(d) ? d : []))
      .catch(() => setMyCollections([]));

    fetch(`/api/certificates?uid=${uid}`)
      .then((r) => r.json())
      .then((d) => setMyCerts(Array.isArray(d) ? d : []))
      .catch(() => setMyCerts([]));

    return () => window.removeEventListener("focus", fetchProfile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-3 shadow-sm">
          <User className="w-10 h-10" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-text-1">User Not Found</h2>
          <p className="text-text-3 font-semibold uppercase tracking-wider text-xs">The user you are looking for does not exist.</p>
        </div>
        <Link href="/explore" className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 hover:text-indigo-600 rounded-xl font-bold text-sm transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Explore
        </Link>
      </div>
    </PageContainer>
  );

  const { user: profileUser, stats, videos, notes } = profile;

  return (
    <PageContainer>

      {/* ── User Profile Header ── */}
      <div className="bg-white dark:bg-slate-900 border border-border p-6 md:p-10 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10 items-start">
          {/* Profile Picture */}
          <div className="shrink-0 relative">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-border">
              {profileUser.image ? (
                <img src={profileUser.image} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl md:text-6xl font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10">
                  {profileUser.name?.[0]}
                </div>
              )}
            </div>
            {!profileUser.isSuspended && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-8 min-w-0 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-4xl font-bold text-text-1">
                      {profileUser.name}
                    </h1>
                    {profileUser.isSuspended && (
                      <div className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Suspended
                      </div>
                    )}
                    {isOwnProfile && (
                       <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-text-2 text-xs font-bold">
                          You
                       </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-text-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {profileUser.email}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {profileUser.bio && !profileUser.isSuspended && (
                  <p className="text-text-2 text-base md:text-lg max-w-2xl">{profileUser.bio}</p>
                )}

                {/* Skills Overview */}
                {profileUser.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profileUser.skills.map((s) => (
                      <div key={s} className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-text-2 border border-border text-xs font-semibold">
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {isOwnProfile ? (
                  <Link href="/profile/edit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold transition-transform hover:-translate-y-0.5">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </Link>
                ) : !profileUser.isSuspended && (
                  <>
                    <FollowButton
                      targetUid={uid}
                      initialFollowing={profile.isFollowing}
                      initialCount={profileUser.followersCount}
                    />
                    <TipButton targetUid={uid} targetName={profileUser.name} />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 md:gap-10 pt-6 border-t border-border flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-3 uppercase">Balance</div>
                  <div className="text-lg font-bold text-text-1">{profileUser.credits} CR</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-3 uppercase">Followers</div>
                  <div className="text-lg font-bold text-text-1">{profileUser.followersCount || 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-3 uppercase">Following</div>
                  <div className="text-lg font-bold text-text-1">{profileUser.followingCount || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveGrid columns={4}>
        {[
          { label: "Videos", value: stats.totalVideos, icon: Video, color: "text-indigo-500" },
          { label: "Notes", value: stats.totalNotes, icon: FileText, color: "text-emerald-500" },
          { label: "Views", value: stats.totalViews, icon: Eye, color: "text-rose-500" },
          { label: "Downloads", value: stats.totalDownloads, icon: Download, color: "text-amber-500" },
        ].map((s, i) => (
          <div 
            key={i} 
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border text-center shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${s.color} bg-slate-50 dark:bg-slate-800 mb-4`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-text-1">{s.value}</p>
            <p className="text-xs font-semibold text-text-3 uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </ResponsiveGrid>

      {/* ── Profile Content ── */}
      <div className="space-y-8">
        <div className="flex justify-center border-b border-border">
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar">
            {[
              { key: "videos", label: "Videos", icon: Video, count: videos.length },
              { key: "notes", label: "Notes", icon: FileText, count: notes.length },
              { key: "collections", label: "Collections", icon: Library, count: myCollections.length },
              { key: "certificates", label: "Certificates", icon: Award, count: myCerts.length },
            ].map((t) => {
              const isActive = tab === t.key;
              return (
                <button 
                  key={t.key} 
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    isActive ? "border-indigo-500 text-indigo-500" : "border-transparent text-text-3 hover:text-text-1"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="text-sm font-bold">{t.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-slate-100 text-text-2 dark:bg-slate-800"}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
            {tab === "videos" ? (
              videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border/50 bg-slate-50 dark:bg-slate-800/30 text-center space-y-4">
                   <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center justify-center text-text-3 shadow-sm">
                      <Video className="w-8 h-8" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-lg font-bold text-text-1">No Videos Found.</p>
                      <p className="text-xs text-text-3">This user hasn't uploaded any videos yet.</p>
                   </div>
                </div>
              ) : (
                <ResponsiveGrid columns={3}>
                  {videos.map((v) => <VideoCard key={v._id} video={{...v, uploader: profileUser}} />)}
                </ResponsiveGrid>
              )
            ) : tab === "notes" ? (
              notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border/50 bg-slate-50 dark:bg-slate-800/30 text-center space-y-4">
                   <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center justify-center text-text-3 shadow-sm">
                      <FileText className="w-8 h-8" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-lg font-bold text-text-1">No Notes Found.</p>
                      <p className="text-xs text-text-3">This user hasn't uploaded any notes yet.</p>
                   </div>
                </div>
              ) : (
                <ResponsiveGrid columns={3}>
                  {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
                </ResponsiveGrid>
              )
            ) : tab === "collections" ? (
              myCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border/50 bg-slate-50 dark:bg-slate-800/30 text-center space-y-4">
                   <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center justify-center text-text-3 shadow-sm">
                      <Library className="w-8 h-8" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-lg font-bold text-text-1">No Collections Found.</p>
                      <p className="text-xs text-text-3">This user hasn't created any collections yet.</p>
                   </div>
                </div>
              ) : (
                <ResponsiveGrid columns={3}>
                  {myCollections.map((c) => (
                    <Link key={c._id} href={`/collections/${c._id}`}
                      className="group flex flex-col bg-white dark:bg-slate-900 border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-border">
                        {c.coverImage ? (
                          <img src={c.coverImage} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="text-text-3 opacity-50">
                             <BookOpen className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-3">
                        <h3 className="font-bold text-text-1 text-lg line-clamp-1">{c.title}</h3>
                        <div className="flex items-center justify-between mt-auto">
                           <div className="flex items-center gap-1.5 text-text-2 text-sm">
                              <BookOpen className="w-4 h-4" />
                              <span>Resources</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-text-3 text-sm">
                              <Users className="w-4 h-4" />
                              <span>Followers</span>
                           </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </ResponsiveGrid>
              )
            ) : (
              myCerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border/50 bg-slate-50 dark:bg-slate-800/30 text-center space-y-4">
                   <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-border flex items-center justify-center text-text-3 shadow-sm">
                      <Award className="w-8 h-8" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-lg font-bold text-text-1">No Certificates Found.</p>
                      <p className="text-xs text-text-3">Earn certificates by completing quizzes.</p>
                   </div>
                </div>
              ) : (
                <ResponsiveGrid columns={3}>
                  {myCerts.map((c) => (
                    <Link key={c._id} href={`/certificates/${c.certId}`}
                      className="flex flex-col bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                           <Award className="w-6 h-6 fill-current" />
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase">Verified</span>
                           <span className="block text-xs text-text-3 mt-0.5">ID: {c.certId.slice(0,8)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-6">
                         <h3 className="font-bold text-text-1 text-xl line-clamp-2">{c.videoTitle}</h3>
                         <p className="text-sm text-text-3">Course Certificate</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                           <Zap className="w-4 h-4" />
                           <span>{c.score}%</span>
                        </div>
                        <div className="text-sm text-text-3">
                           {new Date(c.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </ResponsiveGrid>
              )
            )}
        </div>
      </div>
    </PageContainer>
  );
}


