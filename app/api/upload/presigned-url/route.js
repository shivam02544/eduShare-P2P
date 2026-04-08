import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { generatePresignedUrl } from "@/lib/s3";
import { z } from "zod";

const presignedSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content Type is required"),
  folder: z.enum(["videos", "notes", "thumbnails"]),
});

export const POST = apiHandler(async (ctx) => {
  const { filename, contentType, folder } = ctx.body;

  const { presignedUrl, key, fileUrl } = await generatePresignedUrl(
    filename,
    contentType,
    folder
  );

  return NextResponse.json({ presignedUrl, key, fileUrl });
}, { isProtected: true, schema: presignedSchema });
