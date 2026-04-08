# EduShare — Peer Knowledge Exchange Platform

A student-driven learning platform where users upload teaching videos, share study notes, and host live sessions — all powered by a credit reward system. No money, just knowledge.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Credit System](#credit-system)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Security](#security)

---

## Features

### Core
- **Video Upload** — Upload teaching videos to AWS S3, earn 5 credits per view
- **Study Notes** — Upload PDF notes, earn 3 credits per download. Supports premium notes (paid with credits)
- **Live Sessions** — Schedule and host live teaching sessions, earn 10 credits per attendee
- **Credit System** — Pure knowledge economy — no money, only credits

### Engagement
- **Comments** — Comment on videos with like/delete support
- **Likes & Bookmarks** — Like videos/notes, bookmark videos for later
- **Follow System** — Follow users, get a personalized activity feed
- **Notifications** — Real-time notifications for likes, comments, follows, quiz passes
- **Search** — Full-text search across videos, notes, and users

### Learning
- **Quizzes** — Uploaders can attach quizzes to videos. Pass = +10 credits for viewer, +5 for uploader
- **Certificates** — Auto-issued on quiz pass with unique verifiable ID (`/certificates/verify/[id]`)
- **Video Chapters** — Add timestamps to videos for easy navigation
- **Watch History** — Resume videos where you left off, "Continue Watching" on dashboard
- **Collections** — Curate videos into playlists, follow others' collections

### Marketplace
- **Tip Teachers** — Send credits directly to any user (5/10/25/50/100)
- **Boost Content** — Spend 20 credits to pin your content to top of Explore for 24h
- **Premium Notes** — Set a credit price on your notes

### Platform
- **Leaderboard** — Top contributors ranked by credits
- **Dark Mode** — System preference + manual toggle, persisted in localStorage
- **Admin Panel** — `/admin/reports` for content moderation (email-gated)
- **Content Reporting** — Report videos, notes, comments. Auto-flag at 3+ reports
- **Rate Limiting** — Sliding window rate limiter on all high-risk endpoints
- **Email Verification** — Custom branded emails via nodemailer, token-based verification

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), JavaScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MongoDB (Mongoose) |
| Authentication | Firebase Auth (Google OAuth + Email/Password) |
| File Storage | AWS S3 |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | AWS EC2 + Nginx + PM2 |

---

## Project Structure

```
edushare/
├── app/
│   ├── api/                    # All API routes
│   │   ├── auth/               # send-verification, verify-email
│   │   ├── videos/             # CRUD, view, like, bookmark, quiz, chapters
│   │   ├── notes/              # CRUD, download, like, unlock
│   │   ├── live/               # Sessions, join
│   │   ├── collections/        # CRUD, videos, follow
│   │   ├── users/              # follow, tip
│   │   ├── certificates/       # list, verify by certId
│   │   ├── notifications/      # list, mark read
│   │   ├── watch-history/      # save progress, list
│   │   ├── feed/               # activity from followed users
│   │   ├── search/             # search videos, notes, users
│   │   ├── leaderboard/        # top users by credits
│   │   ├── boost/              # boost content
│   │   ├── reports/            # submit reports
│   │   ├── admin/reports/      # admin review queue
│   │   ├── credits/            # transaction history
│   │   ├── bookmarks/          # saved videos
│   │   ├── profile/            # public profile, edit
│   │   └── dashboard/          # user stats
│   ├── (pages)/                # All page components
│   └── globals.css             # Design system + animations
├── components/                 # Reusable UI components
├── context/                    # AuthContext, ThemeContext, LoadingContext
├── hooks/                      # useWatchProgress, useScrollReveal
├── lib/                        # mongodb, firebase, firebaseAdmin, s3, mailer, rateLimit, credits, notify, cache
├── models/                     # Mongoose schemas
├── deploy/                     # EC2 setup script
├── nginx.conf                  # Nginx reverse proxy config
└── ecosystem.config.js         # PM2 config
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project
- AWS S3 bucket
- Gmail account with App Password

### Installation

```bash
git clone https://github.com/your-username/edushare.git
cd edushare
npm install
```

### Setup

1. Copy `.env.local.example` to `.env.local` and fill in all values (see [Environment Variables](#environment-variables))
2. Start MongoDB locally: `net start MongoDB` (Windows) or `mongod` (Mac/Linux)
3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create `edushare/.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/edushare

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Firebase Client (safe to expose — NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only — NEVER expose)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=EduShare <your@gmail.com>

# Admin access
ADMIN_EMAILS=admin@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Google providers
3. Go to Project Settings → Service Accounts → Generate new private key
4. Copy credentials to `.env.local`
5. In Authentication → Templates → Email address verification → set Action URL to `http://localhost:3000/verify-email`

### AWS S3 Setup

1. Create an S3 bucket
2. Disable "Block all public access"
3. Add bucket policy for public reads:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}
```
4. Create IAM user with `AmazonS3FullAccess`, generate access keys
5. Add CORS configuration:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": ["http://localhost:3000"],
  "ExposeHeaders": []
}]
```

### Gmail App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Create an app password for "EduShare"
3. Use the 16-character password as `EMAIL_PASS`

---

## Authentication Flow

### Email/Password Registration
1. User fills form → Firebase creates account
2. Our API generates a secure 64-char hex token → stores in MongoDB with 24h TTL
3. Nodemailer sends branded HTML email with verification link
4. User clicks link → `/verify-email?token=xxx` → API validates token → marks `isVerified: true`
5. User can now sign in

### Login
- Unverified email/password users are blocked at both the client (login page) and server (`verifyAuth`)
- Google OAuth users bypass verification (Google pre-verifies)
- All API routes use `verifyAuth()` which checks Firebase token + MongoDB `isVerified` flag

---

## Credit System

| Action | Credits |
|---|---|
| Someone views your video | +5 |
| Someone downloads your note | +3 |
| Someone joins your live session | +10 |
| Pass a quiz | +10 (viewer) |
| Student passes your quiz | +5 (uploader) |
| Tip received | +amount |
| Tip sent | -amount |
| Boost content | -20 |
| Unlock premium note | -cost |

All credit transactions are logged in the `transactions` collection. Atomic transfers use MongoDB sessions to prevent partial updates.

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/send-verification` | Send verification email |
| GET | `/api/auth/verify-email?token=` | Verify email token |

### Videos
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/videos` | List videos (filter by subject, sort) |
| POST | `/api/videos` | Upload video (multipart) |
| GET | `/api/videos/[id]` | Get single video |
| POST | `/api/videos/[id]/view` | Record view (+5 credits) |
| POST | `/api/videos/[id]/like` | Toggle like |
| POST | `/api/videos/[id]/bookmark` | Toggle bookmark |
| GET/POST | `/api/videos/[id]/quiz` | Get/create quiz |
| POST | `/api/videos/[id]/quiz/attempt` | Submit quiz answers |
| PUT | `/api/videos/[id]/chapters` | Update chapters |
| GET/POST | `/api/videos/[id]/comments` | Get/post comments |

### Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | List notes |
| POST | `/api/notes` | Upload note (multipart) |
| GET | `/api/notes/[id]` | Get single note |
| POST | `/api/notes/[id]/download` | Download (+3 credits) |
| POST | `/api/notes/[id]/like` | Toggle like |
| POST | `/api/notes/[id]/unlock` | Unlock premium note |

### Live Sessions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/live` | List upcoming sessions |
| POST | `/api/live` | Create session |
| POST | `/api/live/[id]/join` | Join session (+10 credits) |

### Users & Social
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/[uid]/follow` | Toggle follow |
| POST | `/api/users/[uid]/tip` | Send credits |
| GET | `/api/feed` | Activity from followed users |
| GET | `/api/search?q=` | Search videos, notes, users |
| GET | `/api/leaderboard` | Top 20 users by credits |

### Collections
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/collections` | List/create collections |
| GET/PATCH/DELETE | `/api/collections/[id]` | Get/update/delete |
| POST/DELETE | `/api/collections/[id]/videos` | Add/remove video |
| POST | `/api/collections/[id]/follow` | Toggle follow |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | User stats |
| GET | `/api/notifications` | Notifications list |
| PATCH | `/api/notifications` | Mark all read |
| GET/POST/DELETE | `/api/watch-history` | Watch progress |
| GET | `/api/credits` | Transaction history |
| GET | `/api/bookmarks` | Saved videos |
| GET/PATCH | `/api/profile` | Own profile |
| GET | `/api/profile/[uid]` | Public profile |
| POST | `/api/boost` | Boost content |
| POST | `/api/reports` | Report content |
| GET/PATCH | `/api/admin/reports` | Admin review queue |
| GET | `/api/certificates` | My certificates |
| GET | `/api/certificates/[certId]` | Verify certificate |

---

## Deployment

### Deploy to Vercel (Recommended)

EduShare is built on Next.js and deploys perfectly to Vercel.

#### Prerequisites
- [Vercel account](https://vercel.com) (free)
- [MongoDB Atlas](https://cloud.mongodb.com) (free M0 cluster)
- [Upstash Redis](https://upstash.com) (free tier — needed for rate limiting on serverless)

#### Steps

**1. MongoDB Atlas**
- Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
- Create a database user with read/write access
- Whitelist `0.0.0.0/0` in Network Access (Vercel uses dynamic IPs)
- Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/edushare`

**2. Upstash Redis** *(for rate limiting)*
- Create a free Redis database at [upstash.com](https://upstash.com)
- Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Update `edushare/lib/rateLimit.js` to use Upstash (see note below)

**3. Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the edushare directory
cd edushare
vercel
```

**4. Set Environment Variables**

In your Vercel dashboard → Project → Settings → Environment Variables, add all variables from `.env.local`:

```
MONGODB_URI
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET_NAME
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
ADMIN_EMAILS
NEXT_PUBLIC_APP_URL   ← set to your Vercel URL e.g. https://edushare.vercel.app
```

**5. Update Firebase Action URL**

In Firebase Console → Authentication → Templates → Email address verification → Action URL:
```
https://your-app.vercel.app/verify-email
```

**6. Update S3 CORS**

Add your Vercel domain to the S3 bucket CORS configuration:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://your-app.vercel.app"
  ],
  "ExposeHeaders": []
}]
```

#### Important: Rate Limiter on Vercel

The current rate limiter uses in-memory storage which **does not work on Vercel** (serverless — each request may run in a different instance). 

For production on Vercel, replace `edushare/lib/rateLimit.js` with an Upstash Redis implementation:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Then update `rateLimit.js`:
```js
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const limiters = new Map();

export function rateLimit({ key, limit, windowMs }) {
  const windowSec = Math.floor(windowMs / 1000);
  const mapKey = `${limit}:${windowSec}`;
  
  if (!limiters.has(mapKey)) {
    limiters.set(mapKey, new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    }));
  }
  
  return limiters.get(mapKey).limit(key);
}

export function getClientIp(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function buildKey(ip, suffix) {
  return `${ip}:${suffix}`;
}

export function rateLimitResponse(resetIn) {
  const seconds = Math.ceil(resetIn / 1000);
  return new Response(
    JSON.stringify({ error: `Too many requests. Try again in ${seconds}s.` }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(seconds) } }
  );
}
```

Add to `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

#### Vercel Deployment Checklist

- [ ] MongoDB Atlas connection string set (not localhost)
- [ ] All Firebase env vars added to Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set to your Vercel domain
- [ ] Firebase Action URL updated to Vercel domain
- [ ] S3 CORS updated with Vercel domain
- [ ] Rate limiter updated to use Upstash Redis (for production)
- [ ] `FIREBASE_PRIVATE_KEY` — paste the full key including `-----BEGIN/END PRIVATE KEY-----` with literal `\n` characters

> **Note on FIREBASE_PRIVATE_KEY in Vercel**: In the Vercel dashboard, paste the key exactly as it appears in your service account JSON file. Vercel handles the newlines correctly.

---

## Security

### Rate Limiting
All high-risk endpoints are rate limited using a sliding window algorithm:

| Endpoint | Limit | Window |
|---|---|---|
| Search | 20 req | 1 min |
| Reports | 5 req | 10 min |
| Video views | 30 req | 1 hour |
| Quiz attempts | 10 req | 1 hour |
| Tips | 10 req | 1 hour |
| Boosts | 5 req | 1 hour |
| Comments | 20 req | 10 min |
| Email verification | 5 req | 10 min |

### Authentication
- Firebase ID tokens verified server-side on every API request
- Unverified email users blocked at API level (not just client)
- Google OAuth users bypass email verification (pre-verified by Google)

### Data Integrity
- Credit transfers use MongoDB sessions (atomic — both deduct and award succeed or both fail)
- Quiz attempts enforced by unique compound index at DB level
- Certificate IDs are cryptographically unique

### File Uploads
- Video: MP4/WebM/OGG/MOV only, max 500MB
- Notes: PDF only, max 50MB
- Thumbnails: Images only, max 5MB
- All validated server-side before S3 upload

---

## License

MIT — free to use, modify, and distribute.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

Built with ❤️ by the EduShare team.
