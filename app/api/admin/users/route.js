import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import User from "@/models/User";
import { z } from "zod";

export const dynamic = "force-dynamic";

  // GET /api/admin/users — search and list users
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const query = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }
  if (role) query.role = role;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Mark Super Admins from ENV
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
  
  const result = users.map(u => {
    const obj = u.toObject();
    obj.isSuperAdmin = adminEmails.includes(obj.email.toLowerCase());
    return obj;
  });

  return NextResponse.json({
    users: result,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  });
}, { isProtected: true, allowedRoles: ["admin"] });

const userUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "moderator", "admin"]).optional(),
  isSuspended: z.boolean().optional(),
  suspensionReason: z.string().max(200).optional(),
});

// PATCH /api/admin/users — update user role or status
export const PATCH = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;
  const { userId, role, isSuspended, suspensionReason } = body;

  const targetUser = await User.findById(userId);
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Prevent modification of Super Admins (from ENV)
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
  if (adminEmails.includes(targetUser.email.toLowerCase())) {
    return NextResponse.json({ error: "Cannot modify a Super Admin defined in system environment" }, { status: 403 });
  }

  // Prevent self-modification of important fields
  if (userId === me._id.toString()) {
    return NextResponse.json({ error: "Cannot modify your own administrative status" }, { status: 400 });
  }

  const update = {};
  if (role) update.role = role;
  if (typeof isSuspended === "boolean") {
    update.isSuspended = isSuspended;
    update.suspensionReason = isSuspended ? (suspensionReason || "Violated community guidelines") : "";
  }

  const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });

  return NextResponse.json({ message: "User updated successfully", user: updatedUser });
}, { isProtected: true, allowedRoles: ["admin"], schema: userUpdateSchema });
