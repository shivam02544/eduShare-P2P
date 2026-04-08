# Phase 2 Research: HLS Architecture (AWS MediaConvert)

## Technology Overview
Adaptive Bitrate Streaming (HLS) resolves continuous buffering issues by chopping raw MP4 uploads into microscopic `.ts` components managed by an `.m3u8` playlist matrix.

### The Stack required to execute this inside Next.js 14:
1.  **SDK Dependency:** `@aws-sdk/client-mediaconvert` to interact with custom AWS endpoints.
2.  **Transcoder Trigger:** Intercept the `POST /api/videos` endpoint. After the Presigned URL upload hits the `bucket`, tell AWS to execute a conversion job.
3.  **Database Strategy:** Update the `Video.js` schema with `{ status: "processing" | "ready", hlsUrl: String }`. The UI will poll or handle the `processing` state without displaying an empty video rectangle.
4.  **AWS Webhook:** Construct `/api/webhooks/mediaconvert` where AWS EventBridge sends the JSON success ping, allowing our backend to mutate the Database `status` to `ready`.
5.  **Frontend Player:** A standard `<video>` tag does not natively parse HLS across all browsers (especially Desktop Chrome/Firefox). We must install an HLS client like `react-player` or `hls.js`. Given our Tailwind/React environment, `react-player` natively bridges the gap seamlessly.

## Trade-off Analysis & Restrictions
- **Risk:** AWS MediaConvert pipelines require an IAM Role specifically granting MediaConvert access to Read/Write S3.
- **Risk:** HLS transcodings cost exactly \$0.015 per minute of video. Users should define robust input validations (already handled by Zod) so malicious users don't upload 10-hour blank loops draining the AWS budget.
