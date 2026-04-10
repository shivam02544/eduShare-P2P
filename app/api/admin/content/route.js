import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import Video from "@/models/Video";
import Note from "@/models/Note";
import { connectDB } from "@/lib/mongodb";

export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth || auth.mongoUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    await connectDB();

    const query = q ? { title: { $regex: q, $options: "i" } } : {};
    
    let items = [];
    let total = 0;

    if (type === "video" || type === "all") {
      const videos = await Video.find(query)
        .populate("uploader", "name email image")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
      
      items = [...items, ...videos.map(v => ({ ...v, contentType: "video" }))];
      total += await Video.countDocuments(query);
    }

    if (type === "note" || type === "all") {
      const notes = await Note.find(query)
        .populate("uploader", "name email image")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
      
      items = [...items, ...notes.map(n => ({ ...n, contentType: "note" }))];
      total += await Note.countDocuments(query);
    }

    // Sort combined if type is all
    if (type === "all") {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      items = items.slice(0, limit);
    }

    return NextResponse.json({ items, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[AdminContentAPI] Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await verifyAuth(req);
  if (!auth || auth.mongoUser.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  try {
    await connectDB();
    if (type === "video") await Video.findByIdAndDelete(id);
    else if (type === "note") await Note.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
