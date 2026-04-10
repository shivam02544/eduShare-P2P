"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Comments from "@/components/Comments";
import LikeBookmarkBar from "@/components/LikeBookmarkBar";
import QuizTaker from "@/components/QuizTaker";
import QuizBuilder from "@/components/QuizBuilder";
import AddToCollection from "@/components/AddToCollection";
import BoostButton from "@/components/BoostButton";
import ChapterList from "@/components/ChapterList";
import ChapterEditor from "@/components/ChapterEditor";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import ReportButton from "@/components/ReportButton";
import { getCdnUrl } from "@/lib/cdn";

function VideoSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="skeleton w-full rounded-2xl" style={{ aspectRatio: "16/9" }} />
      <div className="space-y-3">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function VideoPage() {
  const { id } = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading]);

  // SEO: Update page title
  useEffect(() => {
    if (video?.title) {
      document.title = `${video.title} — EduShare`;
    }
    return () => { document.title = "EduShare – Peer Knowledge Exchange"; };
  }, [video]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/videos/${id}`).then((r) => r.json()),
      authFetch(`/api/videos/${id}/quiz`).then((r) => r.json()),
      authFetch(`/api/watch-history`).then((r) => r.json()),
    ]).then(([videoData, quizData, historyData]) => {
      // Attach saved progress to video object
      const myProgress = Array.isArray(historyData)
        ? historyData.find((h) => h.video?._id === id || h.video === id)
        : null;
      setVideo({ ...videoData, watchProgress: myProgress });
      setQuiz(quizData);
      setLoading(false);
    });
  }, [id, user]);

  // Track watch progress
  useWatchProgress({
    videoRef,
    videoId: id,
    authFetch,
    enabled: !!video && !!user,
  });

  // Record view once loaded
  useEffect(() => {
    if (video && user) {
      authFetch(`/api/videos/${id}/view`, { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (d.message?.includes("credits")) {
             toast(d.message, {
               icon: (
                 <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.294 2.744.88 4.226a1 1 0 01-1.476 1.065L10 17.024l-3.991 2.026a1 1 0 01-1.476-1.065l.88-4.226-3.294-2.744a1 1 0 01-.285-1.05L3.57 7.509l-1.233-.616a1 1 0 01.894-1.79l1.599.8L8.954 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                 </svg>
               )
             });
          }
        });
    }
  }, [video, user]);

  if (authLoading || loading) return <VideoSkeleton />;
  if (!video || video.error) return (
    <div className="text-center py-20">
      <p className="text-lg font-semibold text-zinc-700">Video not found</p>
      <Link href="/explore" className="text-sm text-violet-600 hover:underline mt-2 block">Back to Explore</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* Video player — direct MP4 via S3/CloudFront */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          src={getCdnUrl(video.videoUrl)}
          controls
          className="w-full h-full"
          preload="metadata"
          poster={getCdnUrl(video.thumbnailUrl || "")}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration);
            // Resume from saved progress if available
            if (video?.watchProgress?.progressSeconds > 10) {
              e.target.currentTime = video.watchProgress.progressSeconds;
            }
          }}
        />
      </div>

      {/* Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge bg-violet-50 text-violet-700 border border-violet-100">
                {video.subject}
              </span>
              {video.boostedUntil && new Date(video.boostedUntil) > new Date() && (
                <span className="badge bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0111 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Boosted
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{video.title}</h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link href={`/profile/${video.uploader?.firebaseUid}`}
            className="flex items-center gap-2.5 group">
            {video.uploader?.image ? (
              <img src={video.uploader.image} alt="" className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
                {video.uploader?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-800 group-hover:text-violet-600 transition-colors">
                {video.uploader?.name}
              </p>
              <p className="text-xs text-zinc-400">Instructor</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 ml-auto text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {video.views} views
            </span>
            <span>
              {new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <ReportButton contentType="video" contentId={id} compact />
          </div>
        </div>

        {/* Like / Bookmark / Share / Add to Collection */}
        <div className="flex items-center gap-2 flex-wrap">
          <LikeBookmarkBar item={video} type="video" />
          <AddToCollection videoId={id} />
          {/* Boost — only for uploader */}
          {video?.uploader?.firebaseUid === user?.uid && (
            <BoostButton
              type="video"
              id={id}
              boostedUntil={video.boostedUntil}
              onBoosted={(until) => setVideo((v) => ({ ...v, boostedUntil: until }))}
            />
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="card p-4">
            <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{video.description}</p>
          </div>
        )}

        {/* Back link */}
        <div className="pt-2">
          <button onClick={() => router.back()}
            className="btn-ghost flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Chapters — viewer */}
      {video.chapters?.length > 0 && (
        <div className="card p-5">
          <ChapterList
            chapters={video.chapters}
            videoRef={videoRef}
            videoDuration={duration}
          />
        </div>
      )}

      {/* Chapter editor — uploader only */}
      {video?.uploader?.firebaseUid === user?.uid && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">
                {video.chapters?.length > 0 ? "Edit Chapters" : "Add Chapters"}
              </h2>
              <p className="text-xs text-zinc-400">
                {video.chapters?.length > 0
                  ? `${video.chapters.length} chapters · Viewers can click to jump`
                  : "Add timestamps so viewers can navigate your video"}
              </p>
            </div>
          </div>
          <ChapterEditor
            videoId={id}
            initialChapters={video.chapters || []}
            onSaved={(chapters) => setVideo((v) => ({ ...v, chapters }))}
          />
        </div>
      )}

      {/* Quiz section */}
      {quiz?.exists && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">Knowledge Check</h2>
              <p className="text-xs text-zinc-400">
                {quiz.attempted
                  ? `You scored ${quiz.attempt.score}% — ${quiz.attempt.passed ? "Passed ✓" : "Not passed"}`
                  : `${quiz.questionCount} questions · Pass at ${quiz.passingScore}%`}
              </p>
            </div>
            {quiz.attempted && quiz.attempt.creditsAwarded > 0 && (
              <span className="ml-auto badge bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.294 2.744.88 4.226a1 1 0 01-1.476 1.065L10 17.024l-3.991 2.026a1 1 0 01-1.476-1.065l.88-4.226-3.294-2.744a1 1 0 01-.285-1.05L3.57 7.509l-1.233-.616a1 1 0 01.894-1.79l1.599.8L8.954 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                +{quiz.attempt.creditsAwarded} earned
              </span>
            )}
          </div>

          {quiz.attempted ? (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              quiz.attempt.passed
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {quiz.attempt.passed
                ? `You passed with ${quiz.attempt.score}%! Great work.`
                : `You scored ${quiz.attempt.score}%. You need ${quiz.passingScore}% to pass. Each video allows one attempt.`}
            </div>
          ) : (
            <QuizTaker
              quiz={quiz}
              videoId={id}
              onComplete={(result) => {
                setQuiz((prev) => ({
                  ...prev,
                  attempted: true,
                  attempt: { score: result.score, passed: result.passed, creditsAwarded: result.creditsAwarded },
                }));
              }}
            />
          )}
        </div>
      )}

      {/* Quiz builder — only for uploader */}
      {video?.uploader?.firebaseUid === user?.uid && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">
                {quiz?.exists ? "Edit Quiz" : "Add Quiz"}
              </h2>
              <p className="text-xs text-zinc-400">
                {quiz?.exists
                  ? `${quiz.questionCount} questions · ${quiz.isPublished ? "Published" : "Draft"}`
                  : "Add a quiz to test your viewers and earn bonus credits"}
              </p>
            </div>
          </div>
          <QuizBuilder
            videoId={id}
            existingQuiz={quiz?.exists ? quiz : null}
            onSaved={() => authFetch(`/api/videos/${id}/quiz`).then(r => r.json()).then(setQuiz)}
          />
        </div>
      )}

      {/* Comments */}
      <div className="card p-6">
        <Comments videoId={id} />
      </div>
    </div>
  );
}
