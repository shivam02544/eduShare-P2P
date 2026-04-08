export function getCdnUrl(url) {
  if (!url) return url;
  
  // Example: NEXT_PUBLIC_CDN_DOMAIN=d12345abcdef.cloudfront.net
  const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;
  
  if (!cdnDomain) return url;
  
  try {
    const s3Url = new URL(url);
    // Only map if original URL is routed to AWS S3 directly
    if (s3Url.hostname.includes("s3.") && s3Url.hostname.includes("amazonaws.com")) {
      return `https://${cdnDomain}${s3Url.pathname}`;
    }
  } catch (e) {
    // If URL parsing fails, return original fallback string 
    return url;
  }
  
  return url;
}
