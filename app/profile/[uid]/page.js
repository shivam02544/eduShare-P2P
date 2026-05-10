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

import PageContainer from "@/components/layouts/PageContainer";
import ResponsiveGrid from "@/components/layouts/ResponsiveGrid";

function ProfileSkeleton() {
  return (
    <PageContainer>
      <div className="h-64 md:h-80 rounded-[48px] bg-surface-2 dark:bg-surface-3 border border-border/50 animate-pulse" />
      <ResponsiveGrid columns={4}>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-32 rounded-[32px] bg-surface-2 dark:bg-surface-3 border border-border/50 animate-pulse" />
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
        <div className="w-24 h-24 rounded-[32px] bg-surface-2 dark:bg-surface-3 flex items-center justify-center text-text-3 border border-border shadow-xl">
          <User className="w-10 h-10" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-black text-text-1">User Not Found</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-4">The profile you are looking for does not exist.</p>
        </div>
        <Link href="/explore" className="flex items-center gap-3 px-8 py-4 bg-accent text-bg rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-accent/20 active:scale-95">
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
      <div className="bg-surface-1 border border-border p-8 md:p-12 rounded-[48px] shadow-sm relative overflow-hidden mb-12 group/header">
        {/* Decorative Background Aura */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none group-hover/header:bg-accent/10 transition-colors duration-1000" />
        
        <div className="flex flex-col lg:flex-row gap-8 md:gap-14 items-start relative z-10">
          {/* Profile Picture */}
          <div className="shrink-0 relative">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[48px] overflow-hidden bg-surface-2 dark:bg-surface-3 border border-border shadow-2xl transition-all duration-700 hover:rounded-[32px] hover:scale-[1.02]">
              {profileUser.image ? (
                <img src={profileUser.image} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl md:text-7xl font-black text-accent bg-accent/5">
                  {profileUser.name?.[0]}
                </div>
              )}
            </div>
            {!profileUser.isSuspended && (
              <div className="absolute -bottom-3 -right-3 w-10 h-10 md:w-14 md:h-14 rounded-[18px] bg-bg border-4 border-surface-1 shadow-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-10 min-w-0 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-3xl md:text-5xl font-black text-text-1 tracking-tight">
                      {profileUser.name}
                    </h1>
                    {profileUser.isSuspended && (
                      <div className="px-4 py-1.5 rounded-[12px] bg-red-500 text-bg text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-red-500/20">
                        <ShieldAlert className="w-4 h-4" />
                        Suspended
                      </div>
                    )}
                    {isOwnProfile && (
                       <div className="px-4 py-1.5 rounded-[12px] bg-surface-2 dark:bg-surface-3 text-text-2 text-[10px] font-black uppercase tracking-[0.2em] border border-border shadow-sm">
                          Verified Profile
                       </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-4">
                    <div className="flex items-center gap-2 group/meta">
                      <div className="w-8 h-8 rounded-[10px] bg-surface-2 dark:bg-surface-3 flex items-center justify-center text-accent group-hover/meta:scale-110 transition-transform">
                        <Mail className="w-4 h-4" />
                      </div>
                      {profileUser.email}
                    </div>
                    <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-2 group/meta">
                      <div className="w-8 h-8 rounded-[10px] bg-surface-2 dark:bg-surface-3 flex items-center justify-center text-accent group-hover/meta:scale-110 transition-transform">
                        <Calendar className="w-4 h-4" />
                      </div>
                      Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {profileUser.bio && !profileUser.isSuspended && (
                  <p className="text-text-2 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">{profileUser.bio}</p>
                )}

                {/* Skills Overview */}
                {profileUser.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {profileUser.skills.map((s) => (
                      <div key={s} className="px-4 py-2 rounded-[14px] bg-surface-2 dark:bg-surface-3 text-text-1 border border-border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:border-accent/30 transition-colors">
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {isOwnProfile ? (
                  <Link href="/profile/edit" className="flex items-center gap-3 px-8 py-4 rounded-[20px] bg-text-1 text-bg text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-text-1/20 active:scale-95">
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

            <div className="flex items-center gap-8 md:gap-14 pt-10 border-t border-border flex-wrap">
              {[
                { label: "Balance", value: `${profileUser.credits} CR`, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { label: "Followers", value: profileUser.followersCount || 0, icon: Users, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
                { label: "Following", value: profileUser.followingCount || 0, icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-14 h-14 rounded-[20px] ${stat.bg} flex items-center justify-center ${stat.color} border ${stat.border} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <stat.icon className={`w-7 h-7 ${stat.icon === Zap ? 'fill-current' : ''}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">{stat.label}</div>
                    <div className="text-2xl font-black text-text-1">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ResponsiveGrid columns={4} className="mb-16">
        {[
          { label: "Videos", value: stats.totalVideos, icon: Video, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
          { label: "Notes", value: stats.totalNotes, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Views", value: stats.totalViews, icon: Eye, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
          { label: "Downloads", value: stats.totalDownloads, icon: Download, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        ].map((s, i) => (
          <div 
            key={i} 
            className="p-10 rounded-[40px] bg-surface-1 border border-border text-center shadow-sm hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 group relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className={`relative z-10 w-16 h-16 rounded-[24px] mx-auto flex items-center justify-center ${s.color} ${s.bg} ${s.border} border mb-6 shadow-xl shadow-current/5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
              <s.icon className="w-8 h-8" />
            </div>
            <p className="relative z-10 text-4xl md:text-5xl font-black text-text-1">{s.value}</p>
            <p className="relative z-10 text-[10px] font-black text-text-4 uppercase tracking-[0.3em] mt-4">{s.label}</p>
          </div>
        ))}
      </ResponsiveGrid>

      {/* ── Profile Content ── */}
      <div className="space-y-12 pb-24">
        <div className="flex justify-center">
          <div className="flex gap-4 md:gap-10 p-2 bg-surface-2/50 dark:bg-surface-3/30 backdrop-blur-xl border border-border rounded-[28px] overflow-x-auto no-scrollbar">
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
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-[22px] transition-all whitespace-nowrap relative ${
                    isActive ? "bg-accent text-bg shadow-xl shadow-accent/20" : "text-text-3 hover:text-text-1 hover:bg-surface-2 dark:hover:bg-surface-3"
                  }`}
                >
                  <t.icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.label}</span>
                  {!isActive && (
                    <span className="px-2.5 py-0.5 rounded-[8px] text-[10px] font-black bg-surface-3/50 text-text-2 border border-border/50 ml-1">
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {tab === "videos" ? (
                  videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 rounded-[48px] border-2 border-dashed border-border/50 bg-surface-1 text-center space-y-8">
                      <div className="w-24 h-24 rounded-[32px] bg-surface-2 dark:bg-surface-3 border border-border flex items-center justify-center text-text-4 shadow-inner">
                          <Video className="w-12 h-12" />
                      </div>
                      <div className="space-y-3">
                          <p className="text-2xl font-black text-text-1 tracking-tight">No Videos Published</p>
                          <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">This user has not uploaded any video content yet</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveGrid columns={3}>
                      {videos.map((v) => <VideoCard key={v._id} video={{...v, uploader: profileUser}} />)}
                    </ResponsiveGrid>
                  )
                ) : tab === "notes" ? (
                  notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 rounded-[48px] border-2 border-dashed border-border/50 bg-surface-1 text-center space-y-8">
                      <div className="w-24 h-24 rounded-[32px] bg-surface-2 dark:bg-surface-3 border border-border flex items-center justify-center text-text-4 shadow-inner">
                          <FileText className="w-12 h-12" />
                      </div>
                      <div className="space-y-3">
                          <p className="text-2xl font-black text-text-1 tracking-tight">No Notes Published</p>
                          <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">This user has not shared any study materials yet</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveGrid columns={3}>
                      {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
                    </ResponsiveGrid>
                  )
                ) : tab === "collections" ? (
                  myCollections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 rounded-[48px] border-2 border-dashed border-border/50 bg-surface-1 text-center space-y-8">
                      <div className="w-24 h-24 rounded-[32px] bg-surface-2 dark:bg-surface-3 border border-border flex items-center justify-center text-text-4 shadow-inner">
                          <Library className="w-12 h-12" />
                      </div>
                      <div className="space-y-3">
                          <p className="text-2xl font-black text-text-1 tracking-tight">No Collections Found</p>
                          <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Curated resource lists will appear here</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveGrid columns={3}>
                      {myCollections.map((c) => (
                        <Link key={c._id} href={`/collections/${c._id}`}
                          className="group flex flex-col bg-surface-1 border border-border rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 hover:-translate-y-2"
                        >
                          <div className="aspect-video bg-surface-2 dark:bg-surface-3 flex items-center justify-center overflow-hidden border-b border-border relative">
                            {c.coverImage ? (
                              <img src={c.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="text-text-4 group-hover:scale-110 transition-transform duration-700">
                                 <BookOpen className="w-16 h-16" />
                              </div>
                            )}
                            <div className="absolute top-5 right-5 px-4 py-1.5 rounded-[12px] bg-bg/90 backdrop-blur-md border border-border shadow-xl text-[10px] font-black uppercase tracking-[0.2em]">
                               Collection
                            </div>
                          </div>
                          <div className="p-8 flex flex-col gap-6 bg-gradient-to-b from-transparent to-surface-2/30">
                            <h3 className="font-black text-text-1 text-xl line-clamp-1 group-hover:text-accent transition-colors duration-300 tracking-tight">{c.title}</h3>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                               <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.2em]">
                                  <BookOpen className="w-4 h-4" />
                                  <span>Resources</span>
                               </div>
                               <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                  <Users className="w-4 h-4" />
                                  <span>{c.followers?.length || 0}</span>
                               </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </ResponsiveGrid>
                  )
                ) : (
                  myCerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 rounded-[48px] border-2 border-dashed border-border/50 bg-surface-1 text-center space-y-8">
                      <div className="w-24 h-24 rounded-[32px] bg-surface-2 dark:bg-surface-3 border border-border flex items-center justify-center text-text-4 shadow-inner">
                          <Award className="w-12 h-12" />
                      </div>
                      <div className="space-y-3">
                          <p className="text-2xl font-black text-text-1 tracking-tight">No Certificates Earned</p>
                          <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Complete quizzes to validate your learning path</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveGrid columns={3}>
                      {myCerts.map((c) => (
                        <Link key={c._id} href={`/certificates/${c.certId}`}
                          className="group flex flex-col bg-surface-1 border border-border rounded-[40px] p-10 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-700 relative overflow-hidden hover:-translate-y-2"
                        >
                          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-amber-500/10 transition-colors duration-700" />
                          
                          <div className="flex items-start justify-between mb-10 relative z-10">
                            <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                               <Award className="w-8 h-8 fill-current" />
                            </div>
                            <div className="text-right">
                               <div className="px-3 py-1 rounded-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 inline-block">Verified</div>
                               <span className="block text-[9px] font-black text-text-4 mt-2 uppercase tracking-[0.1em] opacity-50">ID: {c.certId.slice(0,12)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-10 relative z-10 flex-1">
                             <h3 className="font-black text-text-1 text-2xl line-clamp-2 group-hover:text-accent transition-colors duration-300 tracking-tight leading-tight">{c.videoTitle}</h3>
                             <p className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em]">Mastery Certification</p>
                          </div>
      
                          <div className="flex items-center justify-between border-t border-border/50 pt-8 mt-auto relative z-10">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em]">
                               <Zap className="w-4 h-4 fill-current" />
                               <span>{c.score}% SCORE</span>
                            </div>
                            <div className="text-[10px] font-black text-text-4 uppercase tracking-[0.2em] opacity-60">
                               {new Date(c.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </ResponsiveGrid>
                  )
                )}
              </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}



