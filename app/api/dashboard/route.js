import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getDashboardData } from "@/services/dashboard.service";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { user } = ctx;
  const result = await getDashboardData(user);
  return NextResponse.json(result);
}, { isProtected: true });
