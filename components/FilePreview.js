"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  AlertTriangle,
  Loader2,
  X,
  Type,
  Table,
} from "lucide-react";
import { getFileInfo, getGoogleViewerUrl } from "@/lib/fileUtils";

const ICON_MAP = {
  pdf: FileText,
  image: ImageIcon,
  office: File,
  text: Type,
  unknown: File,
};

// Sub-icon for office types
function getOfficeIcon(ext) {
  if (["doc", "docx"].includes(ext)) return FileText;
  if (["ppt", "pptx"].includes(ext)) return Presentation;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  return File;
}

/* ─────────────────────────────────────────────
   Image Preview with zoom / pan / fullscreen
   ───────────────────────────────────────────── */
function ImagePreview({ url, title }) {
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const resetZoom = () => setZoom(1);

  if (error) return <PreviewError url={url} title={title} />;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Zoom toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border shadow-xl">
        <button onClick={zoomOut} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-3 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-black text-text-2 tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-3 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-border/50" />
        <button onClick={resetZoom} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-3 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all" title="Reset">
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Image viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}
        <img
          src={url}
          alt={title || "Preview"}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className="max-w-full max-h-full object-contain transition-transform duration-300 rounded-lg shadow-2xl"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Text Preview — fetches & renders raw text
   ───────────────────────────────────────────── */
function TextPreview({ url, title, extension }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [url]);

  if (error) return <PreviewError url={url} title={title} />;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const isCSV = extension === "csv";

  return (
    <div className="w-full h-full overflow-auto">
      {isCSV ? (
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {content.split("\n").filter(Boolean).map((row, ri) => {
              const cells = row.split(",");
              const Tag = ri === 0 ? "th" : "td";
              return (
                <tr key={ri} className={ri === 0 ? "bg-slate-100 dark:bg-white/5 sticky top-0" : ri % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-slate-50/50 dark:bg-white/[0.02]"}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} className={`px-4 py-2.5 border border-border/50 text-left ${ri === 0 ? "font-black text-[10px] uppercase tracking-widest text-text-1" : "text-text-2 font-medium"}`}>
                      {cell.trim()}
                    </Tag>
                  ))}
                </tr>
              );
            })}
          </table>
        </div>
      ) : (
        <pre className="p-8 text-sm font-mono text-text-2 leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </pre>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Iframe Preview — for PDF & Google Docs Viewer
   ───────────────────────────────────────────── */
function IframePreview({ url, title, useGoogleViewer }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  const src = useGoogleViewer ? getGoogleViewerUrl(url) : url;

  useEffect(() => {
    setLoading(true);
    setError(false);
    // Timeout fallback — if iframe doesn't load in 15s, show error
    timeoutRef.current = setTimeout(() => {
      if (loading) setError(true);
    }, 15000);
    return () => clearTimeout(timeoutRef.current);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    clearTimeout(timeoutRef.current);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  if (error) {
    return <PreviewError url={url} title={title} message="Could not load document preview." />;
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-slate-900/80">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-3">Loading Document...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full border-0"
        title={title || "Document Preview"}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Error / Unsupported Fallback
   ───────────────────────────────────────────── */
function PreviewError({ url, title, message }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-8">
      <div className="relative">
        <div className="w-28 h-28 rounded-[40px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-3 opacity-30 shadow-inner">
          <AlertTriangle className="w-14 h-14" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border border-indigo-500/10 rounded-full border-dashed"
        />
      </div>
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-xl font-black text-text-1 tracking-tight">Preview Unavailable</h3>
        <p className="text-[11px] font-medium text-text-3 leading-relaxed">
          {message || "This file type cannot be previewed directly in the browser. Download it to view with a compatible application."}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <a
          href={url}
          download
          className="group flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          <Download className="w-4 h-4" />
          Download File
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-white/5 border border-border text-text-2 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-indigo-500 hover:border-indigo-500/30 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Tab
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main FilePreview Component
   ═══════════════════════════════════════════════ */
export default function FilePreview({ url, title, onDownload }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const fileInfo = getFileInfo(url);
  const { type, extension, label, color, bg, borderColor } = fileInfo;
  const TypeIcon = type === "office" ? getOfficeIcon(extension) : (ICON_MAP[type] || File);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Render the appropriate preview based on file type
  const renderPreview = () => {
    switch (type) {
      case "pdf":
        // Use Google Docs Viewer for PDFs — S3 URLs get blocked by Chrome's X-Frame-Options
        return <IframePreview url={url} title={title} useGoogleViewer />;

      case "image":
        return <ImagePreview url={url} title={title} />;

      case "office":
        return <IframePreview url={url} title={title} useGoogleViewer />;

      case "text":
        return <TextPreview url={url} title={title} extension={extension} />;

      default:
        return <PreviewError url={url} title={title} />;
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ mass: 1, tension: 120, friction: 20, delay: 0.2 }}
      className="space-y-6"
    >
      {/* ── Preview Header Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${bg} border ${borderColor} flex items-center justify-center ${color}`}>
            <TypeIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.4em] opacity-50">Document Preview</span>
            <h2 className="text-xl md:text-2xl font-black text-text-1 tracking-tight">Preview</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* File type badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${bg} border ${borderColor} ${color}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{extension.toUpperCase()}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              {isFullscreen ? "Exit" : "Fullscreen"}
            </button>

            <div className="w-px h-5 bg-border/50" />

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-3 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>

            {onDownload && (
              <>
                <div className="w-px h-5 bg-border/50" />
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Preview Container ── */}
      <div className={`relative group rounded-[32px] md:rounded-[48px] border ${borderColor} bg-white dark:bg-slate-950 overflow-hidden shadow-3xl ${isFullscreen ? "rounded-none" : ""}`}>
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="grid grid-cols-12 h-full gap-4 p-8">
            {Array(48).fill(0).map((_, i) => (
              <div key={i} className="h-full border-r border-slate-900 dark:border-white" />
            ))}
          </div>
        </div>

        {/* Render area */}
        <div className="relative z-10 w-full" style={{ height: isFullscreen ? "100vh" : "75vh", minHeight: "400px" }}>
          {renderPreview()}
        </div>
      </div>
    </motion.div>
  );
}
