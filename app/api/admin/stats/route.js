import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getStats } from "@/services/admin.service";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const stats = await getStats();
  return NextResponse.json(stats);
}, { isProtected: true, allowedRoles: ["admin", "moderator"] });
