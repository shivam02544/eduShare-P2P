import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getCreditsHistory } from "@/services/credit.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
});

// GET /api/credits — paginated transaction history
export const GET = apiHandler(async (ctx) => {
  const { req, user: me } = ctx;
  const { searchParams } = new URL(req.url);
  const { page } = querySchema.parse(Object.fromEntries(searchParams));

  const result = await getCreditsHistory(me._id, page);
  return NextResponse.json(result);
}, { isProtected: true });
