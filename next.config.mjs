import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
    ],
  },
  // Allow large file uploads (500MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: "edushare",
  project: "edushare-web",
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  webpack: {
    // Replaces deprecated disableLogger: true
    treeshake: {
      removeDebugLogging: true,
    },
    // Replaces deprecated automaticVercelMonitors: true
    automaticVercelMonitors: true,
  },
});
