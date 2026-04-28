import { generatePresignedUrl } from "@/lib/s3";

export async function getPresignedUrl(filename, contentType, folder) {
  const { presignedUrl, key, fileUrl } = await generatePresignedUrl(
    filename,
    contentType,
    folder
  );

  return { presignedUrl, key, fileUrl };
}
