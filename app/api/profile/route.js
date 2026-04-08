import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import User from "@/models/User";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/profile — get current user's full profile
export const GET = apiHandler(async (ctx) => {
  const user = await User.findById(ctx.user._id).select("-__v");
  return NextResponse.json(user);
}, { isProtected: true });

const profileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  bio: z.string().max(300, "Bio max 300 characters").optional(),
  skills: z.array(z.string()).max(15, "Max 15 skills allowed").optional(),
});

// PATCH /api/profile — update name, bio, skills
export const PATCH = apiHandler(async (ctx) => {
  const { name, bio, skills } = ctx.body;

  const updated = await User.findByIdAndUpdate(
    ctx.user._id,
    {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(skills && { skills }),
    },
    { new: true }
  ).select("-__v");

  return NextResponse.json(updated);
}, { isProtected: true, schema: profileSchema });
