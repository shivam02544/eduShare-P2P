import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getReports, updateReport, AdminError } from "@/services/admin.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const getQuerySchema = z.object({
  status: z.string().optional().default("pending"),
});

// GET /api/admin/reports — list pending reports
export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;

  const { searchParams } = new URL(req.url);
  const { status } = getQuerySchema.parse(Object.fromEntries(searchParams));

  const enriched = await getReports(status);

  return NextResponse.json(enriched);
}, { isProtected: true, allowedRoles: ["admin", "moderator"] });

const patchSchema = z.object({
  reportId: z.string().min(1, "reportId required"),
  status: z.enum(["reviewed", "dismissed", "actioned"]),
  unflag: z.boolean().optional(),
});

// PATCH /api/admin/reports — update report status
export const PATCH = apiHandler(async (ctx) => {
  const { user: me, body } = ctx;
  const { reportId, status, unflag } = body;

  try {
    const result = await updateReport(me._id, reportId, status, unflag);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AdminError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: true, allowedRoles: ["admin", "moderator"], schema: patchSchema });
