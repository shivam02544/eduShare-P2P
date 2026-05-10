import Certificate from "@/models/Certificate";

export class CertificateError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function getCertificates(userId) {
  const certs = await Certificate.find({ recipient: userId })
    .sort({ issuedAt: -1 })
    .populate("video", "title thumbnailUrl subject");

  return certs;
}

export async function getCertificateById(certId) {
  if (!certId) {
    throw new CertificateError("Certificate ID is required", 400);
  }
  
  const normalizedId = certId.toUpperCase();
  console.log(`[CertificateService] Verifying: ${normalizedId}`);
  
  const cert = await Certificate.findOne({ certId: normalizedId })
    .populate("recipient", "name image firebaseUid")
    .populate("video", "title subject thumbnailUrl");

  if (!cert) {
    console.error(`[CertificateService] Not Found: ${normalizedId}`);
    throw new CertificateError("Certificate not found", 404);
  }

  return {
    valid: true,
    certId: cert.certId,
    recipientName: cert.recipientName,
    videoTitle: cert.videoTitle,
    issuerName: cert.issuerName,
    score: cert.score,
    issuedAt: cert.issuedAt,
    recipient: cert.recipient,
    video: cert.video,
  };
}
