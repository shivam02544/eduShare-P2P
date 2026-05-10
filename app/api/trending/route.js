import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getTrendingContent } from "@/services/trending.service";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const trending = await getTrendingContent();
  return NextResponse.json(trending);
}, { isProtected: false });
