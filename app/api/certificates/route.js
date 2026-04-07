import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { connectDB } from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

export const dynamic = "force-dynamic";

// GET /api/certificates — get current user's certificates
export async function GET(req) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const certs = await Certificate.find({ recipient: auth.mongoUser._id })
    .sort({ issuedAt: -1 })
    .populate("video", "title thumbnailUrl subject");

  return NextResponse.json(certs);
}
