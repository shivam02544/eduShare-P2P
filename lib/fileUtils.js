/**
 * File type detection utilities for EduShare
 * Used by FilePreview component and upload forms
 */

const FILE_TYPES = {
  // PDFs
  pdf: { type: "pdf", label: "PDF Document", color: "text-red-500", bg: "bg-red-500/10", borderColor: "border-red-500/20" },

  // Images
  jpg:  { type: "image", label: "JPEG Image", color: "text-blue-500", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  jpeg: { type: "image", label: "JPEG Image", color: "text-blue-500", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  png:  { type: "image", label: "PNG Image", color: "text-blue-500", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  gif:  { type: "image", label: "GIF Image", color: "text-purple-500", bg: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  webp: { type: "image", label: "WebP Image", color: "text-blue-500", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  svg:  { type: "image", label: "SVG Image", color: "text-orange-500", bg: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  bmp:  { type: "image", label: "BMP Image", color: "text-blue-500", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },

  // Microsoft Office
  doc:  { type: "office", label: "Word Document", color: "text-blue-600", bg: "bg-blue-600/10", borderColor: "border-blue-600/20" },
  docx: { type: "office", label: "Word Document", color: "text-blue-600", bg: "bg-blue-600/10", borderColor: "border-blue-600/20" },
  ppt:  { type: "office", label: "PowerPoint", color: "text-orange-600", bg: "bg-orange-600/10", borderColor: "border-orange-600/20" },
  pptx: { type: "office", label: "PowerPoint", color: "text-orange-600", bg: "bg-orange-600/10", borderColor: "border-orange-600/20" },
  xls:  { type: "office", label: "Excel Sheet", color: "text-emerald-600", bg: "bg-emerald-600/10", borderColor: "border-emerald-600/20" },
  xlsx: { type: "office", label: "Excel Sheet", color: "text-emerald-600", bg: "bg-emerald-600/10", borderColor: "border-emerald-600/20" },

  // Text
  txt: { type: "text", label: "Text File", color: "text-slate-500", bg: "bg-slate-500/10", borderColor: "border-slate-500/20" },
  md:  { type: "text", label: "Markdown", color: "text-slate-600", bg: "bg-slate-600/10", borderColor: "border-slate-600/20" },
  csv: { type: "text", label: "CSV Data", color: "text-emerald-500", bg: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
};

/**
 * Extract file extension from a URL or filename
 */
export function getExtension(url) {
  if (!url) return "";
  try {
    // Remove query params and hash, then get extension
    const clean = url.split("?")[0].split("#")[0];
    const parts = clean.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  } catch {
    return "";
  }
}

/**
 * Get file type info from a URL
 * Returns { type, extension, label, color, bg, borderColor }
 */
export function getFileInfo(url) {
  const ext = getExtension(url);
  const info = FILE_TYPES[ext];

  if (info) {
    return { ...info, extension: ext };
  }

  return {
    type: "unknown",
    extension: ext || "file",
    label: ext ? `${ext.toUpperCase()} File` : "Unknown File",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    borderColor: "border-slate-400/20",
  };
}

/**
 * Check if a file can be previewed in the browser
 */
export function isPreviewable(url) {
  const { type } = getFileInfo(url);
  return ["pdf", "image", "office", "text"].includes(type);
}

/**
 * Get the Google Docs Viewer URL for a file
 */
export function getGoogleViewerUrl(url) {
  return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
}

/**
 * Format file size in human-readable form
 */
export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Full list of accepted MIME types for upload
 */
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/markdown",
  "text/csv",
].join(",");

export const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv";
