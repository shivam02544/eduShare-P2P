import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getPublicProfile, ProfileError } from "@/services/profile.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
});

// GET /api/profile/[uid] — public profile by firebaseUid
export const GET = apiHandler(async (ctx) => {
  const { uid } = paramsSchema.parse(ctx.params);

  let requesterId = null;
  if (ctx.user) {
    requesterId = ctx.user._id;
  }

  try {
    const result = await getPublicProfile(uid, requesterId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ProfileError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: false });
