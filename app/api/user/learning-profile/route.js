import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getLearningAnalysis } from "@/services/analytics.service";

export const GET = apiHandler(async (ctx) => {
  const { user } = ctx;
  const analysis = await getLearningAnalysis(user._id);
  return NextResponse.json(analysis);
}, { isProtected: true });
