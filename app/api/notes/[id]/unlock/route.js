import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import { transferCredits } from "@/lib/credits";
import { createNotification } from "@/lib/notify";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * POST /api/notes/[id]/unlock
 * Spend credits to unlock a premium note.
 * Returns the fileUrl on success.
 */
export async function POST(req, { params }) {
  // 20 unlocks per hour per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "note-unlock"), limit: 20, windowMs: 60 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const note = await Note.findById(params.id).select("uploader title isPremium premiumCost fileUrl downloadedBy");
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!note.isPremium)
    return NextResponse.json({ error: "This note is not premium" }, { status: 400 });

  const userId = auth.mongoUser._id.toString();

  // Already unlocked (downloaded before)
  if (note.downloadedBy.map(String).includes(userId))
    return NextResponse.json({ fileUrl: note.fileUrl, message: "Already unlocked" });

  // Self-unlock free
  if (note.uploader.toString() === userId)
    return NextResponse.json({ fileUrl: note.fileUrl, message: "Your own note" });

  const result = await transferCredits({
    fromUserId: auth.mongoUser._id,
    toUserId: note.uploader,
    amount: note.premiumCost,
    fromReason: "premium_note_unlock",
    toReason: "premium_note_earned",
    note: note._id,
    fromDescription: `Unlocked premium note "${note.title}"`,
    toDescription: `${auth.mongoUser.name} unlocked your premium note "${note.title}"`,
  });

  if (!result.success)
    return NextResponse.json({ error: result.error }, { status: 400 });

  // Record download
  note.downloads += 1;
  note.downloadedBy.push(auth.mongoUser._id);
  await note.save();

  await createNotification({
    recipient: note.uploader,
    sender: auth.mongoUser._id,
    type: "credit",
    note: note._id,
    message: `${auth.mongoUser.name} unlocked your premium note "${note.title}" for ${note.premiumCost} credits`,
  });

  return NextResponse.json({ fileUrl: note.fileUrl, message: `Unlocked for ${note.premiumCost} credits` });
}
