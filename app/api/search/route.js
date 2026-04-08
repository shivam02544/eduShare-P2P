import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Video from "@/models/Video";
import Note from "@/models/Note";
import User from "@/models/User";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const searchSchema = z.object({
  q: z.string().optional(),
});

// GET /api/search?q=query
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  
  // 20 searches per minute per IP — search is expensive (regex on DB)
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "search"), limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);
  
  const { searchParams } = new URL(req.url);
  const { q } = searchSchema.parse(Object.fromEntries(searchParams));

  const queryTerm = q?.trim();
  if (!queryTerm || queryTerm.length < 2)
    return NextResponse.json({ videos: [], notes: [], users: [] });

  // Attempt Native Atlas Search (Lucene) for scale
  // NOTE: Requires Search Indexes explicitly generated in the MongoDB Cloud Panel!
  let videos = [];
  let notes = [];
  let users = [];

  try {
    [videos, notes, users] = await Promise.all([
      Video.aggregate([
        { $search: { index: "default", text: { query: queryTerm, path: ["title", "subject", "description"], fuzzy: { maxEdits: 1 } } } },
        { $limit: 6 },
        { $lookup: { from: "users", localField: "uploader", foreignField: "_id", as: "uploader" } },
        { $unwind: { path: "$uploader", preserveNullAndEmptyArrays: true } },
        { $project: { "uploader.password": 0, "uploader.email": 0 } }
      ]),
      Note.aggregate([
        { $search: { index: "default", text: { query: queryTerm, path: ["title", "subject"], fuzzy: { maxEdits: 1 } } } },
        { $limit: 6 },
        { $lookup: { from: "users", localField: "uploader", foreignField: "_id", as: "uploader" } },
        { $unwind: { path: "$uploader", preserveNullAndEmptyArrays: true } },
        { $project: { "uploader.password": 0, "uploader.email": 0 } }
      ]),
      User.aggregate([
        { $search: { index: "default", text: { query: queryTerm, path: ["name", "skills"], fuzzy: { maxEdits: 1 } } } },
        { $limit: 4 },
        { $project: { name: 1, image: 1, firebaseUid: 1, skills: 1, credits: 1 } }
      ])
    ]);
  } catch (error) {
    // If the Atlas index hasn't been built by the user yet, log warning and fallback to legacy regex safely.
    if (error.codeName === "IndexNotFound" || error.message.includes("$search")) {
      const regex = new RegExp(queryTerm, "i");
      [videos, notes, users] = await Promise.all([
        Video.find({ $or: [{ title: regex }, { subject: regex }, { description: regex }] })
          .limit(6).populate("uploader", "name image"),
        Note.find({ $or: [{ title: regex }, { subject: regex }] })
          .limit(6).populate("uploader", "name image"),
        User.find({ $or: [{ name: regex }, { skills: regex }] })
          .limit(4).select("name image firebaseUid skills credits"),
      ]);
    } else {
      throw error;
    }
  }

  return NextResponse.json({ videos, notes, users });
}, { isProtected: false });
