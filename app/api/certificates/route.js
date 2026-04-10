import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import Certificate from "@/models/Certificate";
import Video from "@/models/Video";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/certificates — get current user's certificates
export const GET = apiHandler(async (ctx) => {
  const certs = await Certificate.find({ recipient: ctx.user._id })
    .sort({ issuedAt: -1 })
    .populate("video", "title thumbnailUrl subject");

  return NextResponse.json(certs);
}, { isProtected: true });
