import pino from "pino";

// Define a structured logger ensuring no sensitive user data is accidentally emitted
// Note: We bypass `pino-pretty` transport to prevent thread-stream crashes inside Next.js HMR.
// You can pipe `npm run dev | npx pino-pretty` in your console manually if you want pretty logs locally.
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Redact potentially sensitive headers or payload fields
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.password",
      "body.token",
      "firebaseUser.uid", 
      "firebaseUser.email",
    ],
    censor: "**REDACTED**",
  },
});
