import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getProfile, updateProfile } from "@/services/profile.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/profile — get current user's full profile
export const GET = apiHandler(async (ctx) => {
  const result = await getProfile(ctx.user._id);
  return NextResponse.json(result);
}, { isProtected: true });

const profileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  bio: z.string().max(300, "Bio max 300 characters").optional(),
  skills: z.array(z.string()).max(15, "Max 15 skills allowed").optional(),
});

// PATCH /api/profile — update name, bio, skills
export const PATCH = apiHandler(async (ctx) => {
  const result = await updateProfile(ctx.user._id, ctx.body);
  return NextResponse.json(result);
}, { isProtected: true, schema: profileSchema });
