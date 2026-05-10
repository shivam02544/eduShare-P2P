const fs = require('fs');

console.log("🔍 Checking required environment variables for production...");

const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PROJECT_ID",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET_NAME"
];

const missing = [];

for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    missing.push(envVar);
  }
}

// In local dev, variables might be in .env.local, which isn't loaded yet by plain Node,
// but Next.js will load it. If this is running in Vercel CI, process.env is populated.
// If this is just local build, we should try reading .env.local as a fallback just to be helpful.
if (missing.length > 0 && fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  for (let i = missing.length - 1; i >= 0; i--) {
    const regex = new RegExp(`^${missing[i]}=.*`, 'm');
    if (regex.test(envFile)) {
      missing.splice(i, 1);
    }
  }
}

if (missing.length > 0) {
  console.error("❌ Build failed: Missing required environment variables:");
  missing.forEach(v => console.error(`   - ${v}`));
  console.error("Please add these to your environment (Vercel) or .env.local.");
  process.exit(1);
}

console.log("✅ All required environment variables are present.");
process.exit(0);
