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

function ProfileSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-16 pb-40 px-8 animate-pulse">
      <div className="h-80 rounded-[64px] bg-slate-200 dark:bg-white/5 border border-border/50" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-32 rounded-[40px] bg-slate-200 dark:bg-white/5 border border-border/50" />
        ))}
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
    window.addEventListener("focus", fetchProfile);

    fetch(`/api/collections?creatorUid=${uid}`)
      .then((r) => r.json())
      .then((d) => setMyCollections(Array.isArray(d) ? d : []));

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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center space-y-10">
      <div className="relative">
         <div className="w-40 h-40 rounded-[48px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner">
           <User className="w-20 h-20" />
         </div>
         <motion.div 
           animate={{ rotate: -360 }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute -inset-4 border border-indigo-500/10 rounded-full border-dashed"
         />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-text-1 tracking-tighter">User Not Found</h2>
        <p className="text-text-3 font-black uppercase tracking-[0.3em] text-[10px]">The user you are looking for does not exist.</p>
      </div>
      <Link href="/explore" className="group flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all">
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rotate-180" />
        Back to Explore
      </Link>
    </div>
  );

  const { user: profileUser, stats, videos, notes } = profile;

  return (
    <div className="max-w-[1440px] mx-auto space-y-16 pb-40 px-8">

      {/* ── User Profile ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-border p-12 md:p-16 rounded-[64px] shadow-3xl overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Profile Picture */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 md:w-52 md:h-52 rounded-[64px] overflow-hidden bg-slate-50 dark:bg-white/5 border border-border shadow-3xl transition-transform group-hover:rotate-1 duration-700">
              {profileUser.image ? (
                <img src={profileUser.image} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl font-black text-indigo-500 bg-indigo-500/10">
                  {profileUser.name?.[0]}
                </div>
              )}
            </div>
            {!profileUser.isSuspended && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-white/5 shadow-2xl flex items-center justify-center"
              >
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
              </motion.div>
            )}
            <div className="absolute -top-4 -left-4 p-2 px-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em]">
               EduShare Member
            </div>
          </div>

          <div className="flex-1 space-y-12 min-w-0 w-full">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-4xl md:text-7xl font-black text-text-1 tracking-tighter">
                      {profileUser.name}
                    </h1>
                    {profileUser.isSuspended && (
                      <div className="px-4 py-2 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-rose-500/20">
                        <ShieldAlert className="w-4 h-4" />
                        Account Suspended
                      </div>
                    )}
                    {isOwnProfile && (
                       <div className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20">
                          Current User
                       </div>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-text-3 uppercase tracking-[0.5em] opacity-50">Profile Details</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2.5 text-text-2 text-sm font-black">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    {profileUser.email}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <div className="flex items-center gap-2.5 text-text-2 text-sm font-black">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                </div>

                {profileUser.bio && !profileUser.isSuspended && (
                  <div className="relative">
                    <p className="text-text-2 text-xl font-medium leading-relaxed max-w-2xl opacity-90">{profileUser.bio}</p>
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full" />
                  </div>
                )}

                {/* Skills Overview */}
                {profileUser.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    {profileUser.skills.map((s) => (
                      <div key={s} className="px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-text-1 border border-border text-[11px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-white/10 transition-colors cursor-default">
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-5 shrink-0 pt-4">
                {isOwnProfile ? (
                  <Link href="/profile/edit" className="group flex items-center gap-3 px-10 py-5 rounded-[32px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-3xl">
                    <Edit3 className="w-5 h-5" />
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

            <div className="flex items-center gap-12 pt-10 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] opacity-50">Balance</span>
                  <span className="text-xl font-black text-text-1">{profileUser.credits} CR</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] opacity-50">Followers</span>
                  <span className="text-xl font-black text-text-1">{profileUser.followersCount || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.3em] opacity-50">Following</span>
                  <span className="text-xl font-black text-text-1">{profileUser.followingCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Videos", value: stats.totalVideos, icon: Video, color: "text-indigo-500", bg: "bg-indigo-500/5" },
          { label: "Notes", value: stats.totalNotes, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/5" },
          { label: "Views", value: stats.totalViews, icon: Eye, color: "text-rose-500", bg: "bg-rose-500/5" },
          { label: "Downloads", value: stats.totalDownloads, icon: Download, color: "text-amber-500", bg: "bg-amber-500/5" },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group p-10 rounded-[48px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border text-center transition-all hover:shadow-3xl relative overflow-hidden"
          >
            <div className={`absolute -top-10 -right-10 w-24 h-24 ${s.bg} rounded-full blur-2xl group-hover:scale-150 transition-all opacity-20`} />
            <div className={`w-14 h-14 rounded-[22px] bg-surface mx-auto flex items-center justify-center ${s.color} border border-border mb-6 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all`}>
              <s.icon className="w-7 h-7" />
            </div>
            <p className="text-4xl font-black text-text-1 tracking-tighter">{s.value}</p>
            <p className="text-[9px] font-black text-text-3 uppercase tracking-[0.4em] mt-2 opacity-50">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Profile Content ── */}
      <div className="space-y-12">
        <div className="flex justify-center">
          <div className="inline-flex p-2 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-border shadow-inner backdrop-blur-md">
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
                  className={`relative flex items-center gap-4 px-8 py-5 rounded-[32px] transition-all group ${
                    isActive ? "bg-white dark:bg-slate-900 shadow-3xl ring-1 ring-border" : "text-text-3 hover:text-text-1"
                  }`}
                >
                  <t.icon className={`w-5 h-5 ${isActive ? "text-indigo-500" : "group-hover:scale-110 transition-transform"}`} />
                  <span className={`hidden lg:block text-[11px] font-black uppercase tracking-widest ${isActive ? "text-text-1" : ""}`}>{t.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="tabCountProfile"
                      className="px-2.5 py-1 rounded-xl bg-indigo-500 text-white text-[9px] font-black shadow-lg shadow-indigo-500/20"
                    >
                      {t.count}
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={springConfig}
          >
            {tab === "videos" ? (
              videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-[64px] border-2 border-dashed border-border/50 bg-slate-50/30 dark:bg-white/[0.02] text-center space-y-6 group hover:border-indigo-500/30 transition-colors">
                   <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner group-hover:scale-110 transition-all">
                      <Video className="w-12 h-12" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-xl font-black text-text-1">No Videos Found.</p>
                      <p className="text-[10px] font-black text-text-3 uppercase tracking-widest">This user hasn't uploaded any videos yet.</p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {videos.map((v) => <VideoCard key={v._id} video={{...v, uploader: profileUser}} />)}
                </div>
              )
            ) : tab === "notes" ? (
              notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-[64px] border-2 border-dashed border-border/50 bg-slate-50/30 dark:bg-white/[0.02] text-center space-y-6 group hover:border-emerald-500/30 transition-colors">
                   <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner group-hover:scale-110 transition-all">
                      <FileText className="w-12 h-12" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-xl font-black text-text-1">No Notes Found.</p>
                      <p className="text-[10px] font-black text-text-3 uppercase tracking-widest">This user hasn't uploaded any notes yet.</p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {notes.map((n) => <NoteCard key={n._id} note={n} onDownload={handleDownload} />)}
                </div>
              )
            ) : tab === "collections" ? (
              myCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-[64px] border-2 border-dashed border-border/50 bg-slate-50/30 dark:bg-white/[0.02] text-center space-y-6 group hover:border-indigo-500/30 transition-colors">
                   <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner group-hover:scale-110 transition-all">
                      <Library className="w-12 h-12" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-xl font-black text-text-1">No Collections Found.</p>
                      <p className="text-[10px] font-black text-text-3 uppercase tracking-widest">This user hasn't created any collections yet.</p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {myCollections.map((c) => (
                    <Link key={c._id} href={`/collections/${c._id}`}
                      className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-8 rounded-[48px] transition-all hover:shadow-3xl hover:-translate-y-3 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-all">
                         <Library className="w-20 h-20" />
                      </div>
                      <div className="aspect-[16/10] rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden mb-8 border border-border/50 shadow-inner">
                        {c.coverImage ? (
                          <img src={c.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="flex flex-col items-center gap-4 text-text-3 opacity-20">
                             <BookOpen className="w-12 h-12" />
                             <span className="text-[9px] font-black uppercase tracking-[0.4em]">Empty</span>
                          </div>
                        )}
                      </div>
                      <div className="px-2 space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                           <p className="font-black text-text-1 text-xl tracking-tight leading-none truncate">{c.title}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                           <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="text-[10px] font-black text-text-1 uppercase">Resources</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-text-3" />
                              <span className="text-[10px] font-black text-text-3 uppercase">Followers</span>
                           </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              myCerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-[64px] border-2 border-dashed border-border/50 bg-slate-50/30 dark:bg-white/[0.02] text-center space-y-6 group hover:border-amber-500/30 transition-colors">
                   <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-20 shadow-inner group-hover:scale-110 transition-all">
                      <Award className="w-12 h-12" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-xl font-black text-text-1">No Certificates Found.</p>
                      <p className="text-[10px] font-black text-text-3 uppercase tracking-widest">Earn certificates by completing quizzes.</p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {myCerts.map((c) => (
                    <Link key={c._id} href={`/certificates/${c.certId}`}
                      className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border p-8 rounded-[48px] transition-all hover:shadow-3xl hover:-translate-y-3 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-all">
                         <Award className="w-20 h-20" />
                      </div>
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="w-14 h-14 rounded-[28px] bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/10 transition-transform group-hover:rotate-12 duration-500">
                             <Award className="w-7 h-7 fill-current" />
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] block mb-1">Verified</span>
                             <span className="text-[9px] font-bold text-text-3 uppercase opacity-40">ID: {c.certId.slice(0,8)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                           <p className="font-black text-text-1 text-2xl tracking-tighter leading-tight h-14 line-clamp-2">{c.videoTitle}</p>
                           <p className="text-[10px] font-black text-text-3 uppercase tracking-widest opacity-50">Course Certificate</p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-black border-t border-border/50 pt-8">
                          <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                             <Zap className="w-4 h-4" />
                             <span>{c.score}% SCORE</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-3">
                             <Calendar className="w-4 h-4" />
                             <span>{new Date(c.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


