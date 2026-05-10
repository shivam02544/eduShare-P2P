import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import User from "@/models/User";
import Note from "@/models/Note";
import Video from "@/models/Video";
import Quiz from "@/models/Quiz";
import Collection from "@/models/Collection";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const CACHE_KEY = "global:stats";
  
  const cachedStats = await getCache(CACHE_KEY);
  if (cachedStats) {
    return NextResponse.json(cachedStats);
  }

  const [
    totalUsers,
    totalNotes,
    totalVideos,
    totalQuizzes,
    totalCollections,
    creditStats
  ] = await Promise.all([
    User.countDocuments(),
    Note.countDocuments(),
    Video.countDocuments(),
    Quiz.countDocuments(),
    Collection.countDocuments(),
    User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: "$credits" } } }
    ])
  ]);

  const stats = {
    totalUsers,
    totalResources: totalNotes + totalVideos,
    totalNotes,
    totalVideos,
    totalQuizzes,
    totalCollections,
    totalCredits: creditStats[0]?.totalCredits || 0,
    timestamp: new Date()
  };

  // Cache for 10 minutes
  await setCache(CACHE_KEY, stats, 600);

  return NextResponse.json(stats);
}, { isProtected: false });
