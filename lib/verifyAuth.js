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

  let decoded;
  try {
    const app = getAdminApp();
    const adminAuth = (await import("firebase-admin/auth")).getAuth(app);
    decoded = await adminAuth.verifyIdToken(token);
  } catch (err) {
    console.error("[verifyAuth] Firebase token failed:", err.message);
    return null;
  }

  const isGoogleUser = decoded.firebase?.sign_in_provider === "google.com";

  let mongoUser = null;
  try {
    await connectDB();

    // Try to find existing user by firebaseUid first
    mongoUser = await User.findOne({ firebaseUid: decoded.uid });

    if (!mongoUser) {
      // Try by email (handles case where user was created before firebaseUid was set)
      mongoUser = await User.findOne({ email: decoded.email });

      if (mongoUser) {
        // Update existing user with firebaseUid
        mongoUser.firebaseUid = decoded.uid;
        if (!mongoUser.isVerified && isGoogleUser) mongoUser.isVerified = true;
        await mongoUser.save();
      } else {
        // Create new user
        mongoUser = await User.create({
          firebaseUid: decoded.uid,
          name: decoded.name || decoded.email.split("@")[0],
          email: decoded.email,
          image: decoded.picture || "",
          credits: 0,
          skills: [],
          isVerified: isGoogleUser,
        });
      }
    }
  } catch (err) {
    console.error("[verifyAuth] MongoDB error:", err.message);
    return null;
  }

  // Block unverified email/password users
  if (!mongoUser.isVerified && !isGoogleUser) {
    console.warn("[verifyAuth] Blocked unverified user:", decoded.email);
    return null;
  }

  // Block suspended users
  if (mongoUser.isSuspended) {
    console.warn("[verifyAuth] Blocked suspended user:", decoded.email);
    return null;
  }

  // Dynamic Admin Override via Environment Variable
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase()) : [];
  if (adminEmails.includes(decoded.email.toLowerCase())) {
    mongoUser.role = "admin";
  }

  return { uid: decoded.uid, email: decoded.email, name: decoded.name, mongoUser };
}
