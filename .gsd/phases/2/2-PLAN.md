---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: HLS Architecture Implementation Arrays

## Objective
Convert raw S3 MP4 uploads into Adaptive Bitrate Streaming (HLS) playlists by integrating AWS MediaConvert webhooks, preventing viewers from downloading gigabytes sequentially to load classes.

## Context
- .gsd/phases/2/RESEARCH.md
- models/Video.js
- app/api/videos/route.js

## Tasks

<task type="auto">
  <name>Task 1: Model & Video Processing Triggers</name>
  <files>
    d:\peer-to--peer-leaning-plateform\edushare\models\Video.js
    d:\peer-to--peer-leaning-plateform\edushare\app\api\videos\route.js
  </files>
  <action>
    - Inject `status` (processing/ready) and `hlsUrl` properties to `models/Video.js`.
    - Install `@aws-sdk/client-mediaconvert`.
    - Update the `POST /api/videos` handler so that it executes a `MediaConvertClient` CreateJobCommand instantly right after the Mongoose save sequence wraps.
  </action>
  <verify>grep -q "MediaConvertClient" "app/api/videos/route.js"</verify>
  <done>AWS transcoding instructions trigger seamlessly into the cloud sequentially.</done>
</task>

<task type="auto">
  <name>Task 2: AWS Webhooks & Player Migration</name>
  <files>
    d:\peer-to--peer-leaning-plateform\edushare\app\api\webhooks\mediaconvert\route.js
    d:\peer-to--peer-leaning-plateform\edushare\app\videos\[id]\page.js
  </files>
  <action>
    - Build `/api/webhooks/mediaconvert/route.js` catching AWS EventBridge POSTs. Map the `status: 'COMPLETE'` payload to update the database state seamlessly.
    - Install `react-player`.
    - Strip out the primitive `<video>` DOM nodes on the Frontend, wrapping the output inside a dynamic `<ReactPlayer url={video.hlsUrl} />` layout component natively interpreting streaming matrices.
  </action>
  <verify>grep -q "ReactPlayer" "app/videos/[id]/page.js"</verify>
  <done>Webhooks intercept AWS jobs successfully, and the React frontend translates streaming logic securely over Edge nodes.</done>
</task>

## Success Criteria
- [ ] Users upload videos, and the player switches to "Processing" appropriately.
- [ ] Adaptive bitrates scale actively depending precisely on downstream bandwidth requirements via `.m3u8` lists.
