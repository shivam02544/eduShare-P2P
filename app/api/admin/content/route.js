import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getContent, deleteContent } from "@/services/admin.service";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (ctx) => {
  const { req } = ctx;
  const { searchParams } = new URL(req.url);
  
  const type = searchParams.get("type") || "all";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;

  const result = await getContent(type, q, page);
  return NextResponse.json(result);
}, { isProtected: true, allowedRoles: ["admin"] });

export const DELETE = apiHandler(async (ctx) => {
  const { req } = ctx;
  const { searchParams } = new URL(req.url);
  
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const result = await deleteContent(id, type);
  return NextResponse.json(result);
}, { isProtected: true, allowedRoles: ["admin"] });
