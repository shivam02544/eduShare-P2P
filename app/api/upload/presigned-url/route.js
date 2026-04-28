import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getPresignedUrl } from "@/services/upload.service";
import { z } from "zod";

const presignedSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content Type is required"),
  folder: z.enum(["videos", "notes", "thumbnails"]),
});

export const POST = apiHandler(async (ctx) => {
  const { filename, contentType, folder } = ctx.body;
  const result = await getPresignedUrl(filename, contentType, folder);
  return NextResponse.json(result);
}, { isProtected: true, schema: presignedSchema });
