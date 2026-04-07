import admin from "firebase-admin";

/**
 * Lazily initialize Firebase Admin only when first called.
 * This prevents Next.js from trying to parse the private key at build time.
 */
export function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set");

  // Normalize: strip surrounding quotes, unescape \n
  const cleaned = privateKey.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: cleaned,
    }),
  });
}

export default admin;
