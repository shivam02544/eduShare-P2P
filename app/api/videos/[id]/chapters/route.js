import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

/**
 * PUT /api/videos/[id]/chapters
 * Replace all chapters for a video. Uploader only.
 * Body: { chapters: [{ title, timestamp }] }
 */
export async function PUT(req, { params }) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const video = await Video.findById(params.id).select("uploader chapters");
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (video.uploader.toString() !== auth.mongoUser._id.toString())
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { chapters } = await req.json();

  if (!Array.isArray(chapters))
    return NextResponse.json({ error: "chapters must be an array" }, { status: 400 });
  if (chapters.length > 20)
    return NextResponse.json({ error: "Maximum 20 chapters allowed" }, { status: 400 });

  // Validate each chapter
  for (let i = 0; i < chapters.length; i++) {
    const c = chapters[i];
    if (!c.title?.trim())
      return NextResponse.json({ error: `Chapter ${i + 1} needs a title` }, { status: 400 });
    if (typeof c.timestamp !== "number" || c.timestamp < 0)
      return NextResponse.json({ error: `Chapter ${i + 1} has invalid timestamp` }, { status: 400 });
  }

  // Sort by timestamp before saving
  const sorted = [...chapters]
    .map((c) => ({ title: c.title.trim(), timestamp: Math.floor(c.timestamp) }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // First chapter must start at 0:00
  if (sorted.length > 0 && sorted[0].timestamp !== 0)
    sorted.unshift({ title: "Introduction", timestamp: 0 });

  video.chapters = sorted;
  await video.save();

  return NextResponse.json({ chapters: video.chapters });
}
