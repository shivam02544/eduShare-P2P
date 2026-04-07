import { getAdminApp } from "./firebaseAdmin";
import { connectDB } from "./mongodb";
import User from "@/models/User";

export async function verifyAuth(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    console.warn("[verifyAuth] No Bearer token");
    return null;
  }

  // Step 1: Verify Firebase token (lazy init — safe at runtime, not build time)
  let decoded;
  try {
    const app = getAdminApp();
    const adminAuth = (await import("firebase-admin/auth")).getAuth(app);
    decoded = await adminAuth.verifyIdToken(token);
  } catch (err) {
    console.error("[verifyAuth] Firebase token failed:", err.message);
    return null;
  }

  // Step 2: Upsert user in MongoDB
  let mongoUser = null;
  try {
    await connectDB();
    mongoUser = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          firebaseUid: decoded.uid,
          name: decoded.name || decoded.email.split("@")[0],
          email: decoded.email,
          image: decoded.picture || "",
          credits: 0,
          skills: [],
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[verifyAuth] MongoDB upsert failed:", err.message);
    return null;
  }

  return { uid: decoded.uid, email: decoded.email, name: decoded.name, mongoUser };
}
