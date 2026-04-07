import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Video from "@/models/Video";
import { uploadFile } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDB();

  // Try to get current user for like/bookmark state
  let mongoUserId = null;
  try {
    const { verifyAuth } = await import("@/lib/verifyAuth");
    const auth = await verifyAuth(req);
    if (auth) mongoUserId = auth.mongoUser._id.toString();
  } catch {}

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const sort = searchParams.get("sort");

  const query = subject ? { subject } : {};
  const sortOption = sort === "popular" ? { views: -1 } : { createdAt: -1 };

  const videos = await Video.find(query)
    .sort(sortOption)
    .populate("uploader", "name image firebaseUid");

  // Attach isLiked / isBookmarked for current user
  const result = videos.map((v) => {
    const obj = v.toObject();
    obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
    obj.isBookmarked = mongoUserId ? obj.bookmarks?.map(String).includes(mongoUserId) : false;
    return obj;
  });

  return NextResponse.json(result);
}

export async function POST(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const subject = formData.get("subject");
    const file = formData.get("file");
    const thumbnailFile = formData.get("thumbnail"); // optional

    if (!title || !subject || !file)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: "Only video files allowed" }, { status: 400 });

    if (file.size > 500 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const videoUrl = await uploadFile(buffer, file.name, file.type, "videos");

    // Upload thumbnail if provided
    let thumbnailUrl = "";
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      thumbnailUrl = await uploadFile(thumbBuffer, thumbnailFile.name, thumbnailFile.type, "thumbnails");
    }

    await connectDB();
    const video = await Video.create({
      title, description, subject,
      videoUrl,
      thumbnailUrl,
      uploader: auth.mongoUser._id,
    });

    return NextResponse.json(video, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
