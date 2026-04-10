import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Certificate from "@/models/Certificate";
import Video from "@/models/Video";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/certificates/[certId] — public verification endpoint
export async function GET(req, { params }) {
  await connectDB();
  const cert = await Certificate.findOne({ certId: params.certId })
    .populate("recipient", "name image firebaseUid")
    .populate("video", "title subject thumbnailUrl");

  if (!cert) return NextResponse.json({ valid: false, error: "Certificate not found" }, { status: 404 });

  return NextResponse.json({
    valid: true,
    certId: cert.certId,
    recipientName: cert.recipientName,
    videoTitle: cert.videoTitle,
    issuerName: cert.issuerName,
    score: cert.score,
    issuedAt: cert.issuedAt,
    recipient: cert.recipient,
    video: cert.video,
  });
}
