import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { performSearch } from "@/services/search.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const searchSchema = z.object({
  q: z.string().optional(),
});

// GET /api/search?q=query
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  
  // 20 searches per minute per IP — search is expensive (regex on DB)
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "search"), limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);
  
  const { searchParams } = new URL(req.url);
  const { q } = searchSchema.parse(Object.fromEntries(searchParams));

  const queryTerm = q?.trim();
  const results = await performSearch(queryTerm);

  return NextResponse.json(results);
}, { isProtected: false });
