import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false }, // email verified via our system
    isSuspended: { type: Boolean, default: false }, // blocked by admin
    suspensionReason: { type: String, default: "" },
    bio: { type: String, default: "" },
    credits: { type: Number, default: 0 },
    skills: [{ type: String }],
    image: { type: String, default: "" },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
