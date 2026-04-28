import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { createReport, ReportError } from "@/services/report.service";
import { rateLimit, getClientIp, buildKey, rateLimitResponse } from "@/lib/rateLimit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
  contentType: z.enum(["video", "note", "comment"]),
  contentId: z.string().min(1, "contentId required"),
  reason: z.enum(["spam", "inappropriate", "copyright", "misinformation", "harassment", "other"]),
  description: z.string().optional(),
});

/**
 * POST /api/reports — submit a content report
 */
export const POST = apiHandler(async (ctx) => {
  const { req, user: me, body } = ctx;

  // 5 reports per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = rateLimit({ key: buildKey(ip, "reports"), limit: 5, windowMs: 10 * 60_000 });
  if (!rl.allowed) return rateLimitResponse(rl.resetIn);

  try {
    const result = await createReport(me._id, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ReportError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, schema: reportSchema });
