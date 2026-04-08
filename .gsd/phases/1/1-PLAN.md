---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: System Architectures & Scaling (Redis, CloudFront, Algolia-Search)

## Objective
Enhance EduShare's capacity to handle global-scale traffic by removing backend bottlenecks (Regex scans, constant database calculations, single-region S3 downloads). 

## Context
- .gsd/DECISIONS.md
- lib/rateLimit.js (already imports Upstash Redis)

## Tasks

<task type="auto">
  <name>Task 1: AWS CloudFront Dynamic Rerouting</name>
  <files>
    d:\peer-to--peer-leaning-plateform\edushare\lib\cdn.js
    d:\peer-to--peer-leaning-plateform\edushare\app\videos\[id]\page.js
    d:\peer-to--peer-leaning-plateform\edushare\app\dashboard\page.js
  </files>
  <action>
    - Create `lib/cdn.js` containing `export function getCdnUrl(originalS3Url) { ... }` logic.
    - If `process.env.NEXT_PUBLIC_CDN_DOMAIN` exists, intelligently replace the heavy `s3.aws.com` host with the CDN domain.
    - Update video player elements safely so playback leverages Edge caching automatically.
  </action>
  <verify>grep -q "getCdnUrl(video.url" "app/videos/[id]/page.js"</verify>
  <done>CloudFront utilities exist and map implicitly to frontend states without requiring DB mass-updates.</done>
</task>

<task type="auto">
  <name>Task 2: Upstash Redis Caching</name>
  <files>
    d:\peer-to--peer-leaning-plateform\edushare\lib\cache.js
    d:\peer-to--peer-leaning-plateform\edushare\app\api\leaderboard\route.js
    d:\peer-to--peer-leaning-plateform\edushare\app\api\dashboard\route.js
  </files>
  <action>
    - Create a reusable `lib/cache.js` utilizing the existing `@upstash/redis` dependency via `getCache` and `setCache` parameters. 
    - Wrap the `/api/leaderboard` MongoDB aggregation results behind a 300-second TTL logic map.
    - Integrate invalidation triggers inside Mongoose or the `apiHandler` dynamically where users purchase boosts/notes.
  </action>
  <verify>grep -q "getCache" "app/api/leaderboard/route.js"</verify>
  <done>Heavy API calls bypass MongoDB entirely during cool-down windows.</done>
</task>

<task type="auto">
  <name>Task 3: Atlas Search Migration</name>
  <files>
    d:\peer-to--peer-leaning-plateform\edushare\app\api\search\route.js
  </files>
  <action>
    - Rip out `$or` native regex expressions block.
    - Replace `Video.find()`, `Note.find()`, and `User.find()` with `aggregate([{ $search: { text: { query: queryTerm, path: ["title", "subject", "description"] } } }])`.
    - Provide fallback graceful errors if indexes aren't natively published onto Atlas yet.
  </action>
  <verify>grep -q "\$search:" "app/api/search/route.js"</verify>
  <done>Global platform search executes in logarithmic scale via native Lucene.</done>
</task>

## Success Criteria
- [ ] User leaderboard arrays execute via memory (Redis).
- [ ] Large MP4 binaries are intelligently pipelined through scalable Edge Delivery networks.
- [ ] Search endpoints rely on tokenized inverse indexing instead of raw sequence scanning.
