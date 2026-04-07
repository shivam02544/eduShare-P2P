import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import { uploadFile } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDB();

  let mongoUserId = null;
  try {
    const { verifyAuth } = await import("@/lib/verifyAuth");
    const auth = await verifyAuth(req);
    if (auth) mongoUserId = auth.mongoUser._id.toString();
  } catch {}

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const query = subject ? { subject } : {};

  const notes = await Note.find(query)
    .sort({ createdAt: -1 })
    .populate("uploader", "name image firebaseUid");

  const result = notes.map((n) => {
    const obj = n.toObject();
    obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
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
    const subject = formData.get("subject");
    const file = formData.get("file");

    if (!title || !subject || !file)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    if (file.type !== "application/pdf")
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });

    if (file.size > 50 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadFile(buffer, file.name, file.type, "notes");

    const isPremium = formData.get("isPremium") === "true";
    const premiumCost = Math.min(100, Math.max(0, parseInt(formData.get("premiumCost") || "0")));

    await connectDB();
    const note = await Note.create({
      title, subject, fileUrl,
      uploader: auth.mongoUser._id,
      isPremium: isPremium && premiumCost > 0,
      premiumCost: isPremium ? premiumCost : 0,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
