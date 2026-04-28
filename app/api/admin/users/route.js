import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { searchUsers, updateUser, UserError } from "@/services/user.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

// GET /api/admin/users — search and list users
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role");
  const page = parseInt(searchParams.get("page") || "1");

  const result = await searchUsers(q, role, page);

  return NextResponse.json(result);
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
  
  try {
    const result = await updateUser(me._id, body.userId, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof UserError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, allowedRoles: ["admin"], schema: userUpdateSchema });
