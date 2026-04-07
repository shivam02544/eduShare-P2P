import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import { awardCredits } from "@/lib/credits";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  // 30 video views per hour per IP — prevents bot inflation
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "video-view"), limit: 30, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const video = await Video.findById(params.id);
  if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

  const viewerId = auth.mongoUser._id.toString();

  if (video.uploader.toString() === viewerId)
    return NextResponse.json({ message: "Self-view, no credits" });

  if (video.viewedBy.map(String).includes(viewerId))
    return NextResponse.json({ message: "Already viewed" });

  video.views += 1;
  video.viewedBy.push(auth.mongoUser._id);
  await video.save();

  await awardCredits({
    userId: video.uploader,
    amount: 5,
    reason: "video_view",
    video: video._id,
    description: `Someone watched "${video.title}"`,
  });

  return NextResponse.json({ message: "View recorded, +5 credits awarded" });
}
