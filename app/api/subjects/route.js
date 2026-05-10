import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Note from "@/models/Note";
import Video from "@/models/Video";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const CACHE_KEY = "global:subjects";
  const cached = await getCache(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  // Get unique subjects from both collections
  const [noteSubjects, videoSubjects] = await Promise.all([
    Note.distinct("subject"),
    Video.distinct("subject")
  ]);

  // Merge and filter empty/null
  const allSubjects = Array.from(new Set([...noteSubjects, ...videoSubjects]))
    .filter(s => s && s.trim() !== "")
    .sort();

  // Always include "All"
  const subjects = ["All", ...allSubjects];

  await setCache(CACHE_KEY, subjects, 3600); // Cache for 1 hour

  return NextResponse.json(subjects);
}, { isProtected: false });
