import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getCertificates } from "@/services/certificate.service";

export const dynamic = "force-dynamic";

// GET /api/certificates — get current user's certificates
export const GET = apiHandler(async (ctx) => {
  const result = await getCertificates(ctx.user._id);
  return NextResponse.json(result);
}, { isProtected: true });
