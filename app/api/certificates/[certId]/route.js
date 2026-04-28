import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getCertificateById, CertificateError } from "@/services/certificate.service";

export const dynamic = "force-dynamic";

// GET /api/certificates/[certId] — public verification endpoint
export const GET = apiHandler(async (ctx) => {
  try {
    const result = await getCertificateById(ctx.params.certId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof CertificateError) {
      return NextResponse.json({ valid: false, error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}, { isProtected: false });
