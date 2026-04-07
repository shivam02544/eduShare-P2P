import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

/**
 * Upload a file buffer to S3
 * @param {Buffer} buffer - file data
 * @param {string} originalName - original filename
 * @param {string} mimeType - MIME type
 * @param {string} folder - S3 folder prefix (e.g. "videos" | "notes")
 * @returns {string} public URL of uploaded file
 */
export async function uploadFile(buffer, originalName, mimeType, folder) {
  const ext = originalName.split(".").pop();
  const key = `${folder}/${uuidv4()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
