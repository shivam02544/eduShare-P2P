import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/profile — get current user's full profile
export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(auth.mongoUser._id).select("-__v");
  return NextResponse.json(user);
}

// PATCH /api/profile — update name, bio, skills
export async function PATCH(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio, skills } = await req.json();

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    auth.mongoUser._id,
    {
      ...(name && { name }),
      ...(bio !== undefined && { bio }),
      ...(skills && { skills }),
    },
    { new: true }
  ).select("-__v");

  return NextResponse.json(updated);
}
