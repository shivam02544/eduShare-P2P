import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const CertificateSchema = new mongoose.Schema(
  {
    // Human-readable unique ID for verification (e.g. CERT-A1B2C3D4)
    certId: {
      type: String,
      unique: true,
      default: () => "CERT-" + uuidv4().slice(0, 8).toUpperCase(),
    },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientName: { type: String, required: true }, // snapshot at issuance
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    videoTitle: { type: String, required: true },    // snapshot
    issuerName: { type: String, required: true },    // uploader name snapshot
    score: { type: Number, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Fast lookup by recipient
CertificateSchema.index({ recipient: 1, issuedAt: -1 });
// One certificate per user per video
CertificateSchema.index({ recipient: 1, video: 1 }, { unique: true });

export default mongoose.models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);
