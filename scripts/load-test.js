import http from 'k6/http';
import { check, sleep } from 'k6';

// Run with: k6 run scripts/load-test.js
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 },  // Spike to 50 users simulating a burst
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Simulate Search Flooding (Abuse Testing)
  const searchRes = http.get(`${BASE_URL}/api/search?q=test`);
  check(searchRes, {
    'Search returned 200 or 429 (rate limited)': (r) => r.status === 200 || r.status === 429,
  });

  // 2. Simulate Upload Request Spam
  const uploadPayload = JSON.stringify({
    filename: 'test-spam.pdf',
    contentType: 'application/pdf',
    size: 1048576,
  });
  
  const uploadRes = http.post(`${BASE_URL}/api/upload/presigned-url`, uploadPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Note: Expecting 401 Unauthorized if run without tokens, 
  // but it verifies the Edge/Serverless function spins up and rejects correctly without crashing
  check(uploadRes, {
    'Upload endpoint handles traffic without 500s': (r) => r.status !== 500,
  });

  sleep(1); // Think time between requests
}
