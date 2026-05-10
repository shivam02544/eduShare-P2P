import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getPersonalizedRecommendations } from "@/services/recommendation.service";

export const GET = apiHandler(async (ctx) => {
  const { user } = ctx;
  const recommendations = await getPersonalizedRecommendations(user._id);
  return NextResponse.json(recommendations);
}, { isProtected: true });
