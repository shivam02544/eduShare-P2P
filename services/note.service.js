import Note from "@/models/Note";

export class NoteError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getNotes(subject, userId) {
  const query = subject ? { subject, flagged: { $ne: true } } : { flagged: { $ne: true } };

  const notes = await Note.find(query)
    .sort({ createdAt: -1 })
    .populate("uploader", "name image firebaseUid");

  const mongoUserId = userId ? userId.toString() : null;

  return notes.map((n) => {
    const obj = n.toObject();
    obj.isLiked = mongoUserId ? obj.likes?.map(String).includes(mongoUserId) : false;
    return obj;
  });
}

export async function createNote(data, uploaderId) {
  const { title, subject, fileUrl, isPremium, premiumCost } = data;

  const isActuallyPremium = isPremium && premiumCost > 0;

  const note = await Note.create({
    title,
    subject,
    fileUrl,
    uploader: uploaderId,
    isPremium: isActuallyPremium,
    premiumCost: isActuallyPremium ? premiumCost : 0,
  });

  return note;
}

export async function getNoteById(noteId) {
  const note = await Note.findById(noteId)
    .populate("uploader", "name image firebaseUid credits");
    
  if (!note) {
    throw new NoteError("Not found", 404);
  }

  return note;
}

export async function downloadNote(noteId, user) {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new NoteError("Note not found", 404);
  }

  const userId = user._id.toString();

  if (note.uploader.toString() === userId) {
    return { fileUrl: note.fileUrl, message: "Self-download, no credits" };
  }

  if (note.downloadedBy.map(String).includes(userId)) {
    return { fileUrl: note.fileUrl, message: "Already downloaded" };
  }

  note.downloads += 1;
  note.downloadedBy.push(user._id);
  await note.save();

  const { awardCredits } = await import("@/lib/credits");
  await awardCredits({
    userId: note.uploader,
    amount: 3,
    reason: "note_download",
    note: note._id,
    description: `Someone downloaded "${note.title}"`,
  });

  return { fileUrl: note.fileUrl, message: "+3 credits awarded to uploader" };
}

export async function toggleLikeNote(noteId, user) {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new NoteError("Not found", 404);
  }

  const userId = user._id.toString();
  const liked = note.likes.map(String).includes(userId);

  if (liked) {
    note.likes = note.likes.filter((l) => l.toString() !== userId);
  } else {
    note.likes.push(user._id);
  }

  await note.save();
  return { likes: note.likes.length, liked: !liked };
}

export async function unlockPremiumNote(noteId, user) {
  const note = await Note.findById(noteId).select("uploader title isPremium premiumCost fileUrl downloadedBy");
  if (!note) {
    throw new NoteError("Not found", 404);
  }

  if (!note.isPremium) {
    throw new NoteError("This note is not premium", 400);
  }

  const userId = user._id.toString();

  // Already unlocked (downloaded before)
  if (note.downloadedBy.map(String).includes(userId)) {
    return { fileUrl: note.fileUrl, message: "Already unlocked" };
  }

  // Self-unlock free
  if (note.uploader.toString() === userId) {
    return { fileUrl: note.fileUrl, message: "Your own note" };
  }

  const { transferCredits } = await import("@/lib/credits");
  const result = await transferCredits({
    fromUserId: user._id,
    toUserId: note.uploader,
    amount: note.premiumCost,
    fromReason: "premium_note_unlock",
    toReason: "premium_note_earned",
    note: note._id,
    fromDescription: `Unlocked premium note "${note.title}"`,
    toDescription: `${user.name} unlocked your premium note "${note.title}"`,
  });

  if (!result.success) {
    throw new NoteError(result.error, 400);
  }

  // Record download
  note.downloads += 1;
  note.downloadedBy.push(user._id);
  await note.save();

  const { createNotification } = await import("@/lib/notify");
  await createNotification({
    recipient: note.uploader,
    sender: user._id,
    type: "credit",
    note: note._id,
    message: `${user.name} unlocked your premium note "${note.title}" for ${note.premiumCost} credits`,
  });

  return { fileUrl: note.fileUrl, message: `Unlocked for ${note.premiumCost} credits` };
}

