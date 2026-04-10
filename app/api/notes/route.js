import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Note from "@/models/Note";
import { z } from "zod";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { req, user } = ctx;
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");

  const query = subject ? { subject, flagged: { $ne: true } } : { flagged: { $ne: true } };

  const notes = await Note.find(query)
    .sort({ createdAt: -1 })
    .populate("uploader", "name image firebaseUid");

  const mongoUserId = user ? user._id.toString() : null;

  const result = notes.map((n) => {
    const obj = n.toObject();
    obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
    return obj;
  });

  return NextResponse.json(result);
}, { isProtected: false });

const notePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  subject: z.string().min(1, "Subject is required"),
  fileUrl: z.string().url("Must be a valid URL"),
  isPremium: z.boolean().default(false),
  premiumCost: z.number().min(0).max(100).default(0),
});

export const POST = apiHandler(async (ctx) => {
  const { title, subject, fileUrl, isPremium, premiumCost } = ctx.body;

  const isActuallyPremium = isPremium && premiumCost > 0;

  const note = await Note.create({
    title,
    subject,
    fileUrl,
    uploader: ctx.user._id,
    isPremium: isActuallyPremium,
    premiumCost: isActuallyPremium ? premiumCost : 0,
  });

  return NextResponse.json(note, { status: 201 });
}, { isProtected: true, schema: notePostSchema });
