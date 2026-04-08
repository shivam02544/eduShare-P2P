import { NextResponse } from "next/server";
import { verifyAuth } from "./verifyAuth";
import { connectDB } from "./mongodb";
import { ZodError } from "zod";
import * as Sentry from "@sentry/nextjs";
import { logger } from "./logger";

/**
 * Global wrapper for Next.js API Routes to handle authentication, formatting, DB connection, and Zod payload validation safely.
 * @param {Function} handler - The core business logic function
 * @param {object} options
 * @param {boolean} options.isProtected - Require a valid Firebase user token (verifyAuth)
 * @param {import("zod").ZodType} [options.schema] - Optional Zod schema to validate req.json body
 * @param {string[]} [options.allowedRoles] - Optional array of strings e.g., ["admin", "moderator"] to restrict access
 */
export function apiHandler(handler, { isProtected = true, schema = null, allowedRoles = null } = {}) {
  return async (req, paramsObj = {}) => {
    const startTime = Date.now();
    try {
      // 1. Establish Mongo connection on every wrapped incoming request.
      await connectDB();

      let auth = null;
      if (isProtected) {
        auth = await verifyAuth(req);
        if (!auth) {
          logger.warn({ method: req.method, url: req.url }, "Unauthorized request blocked");
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1b. Role Based Access Control validation
        if (allowedRoles && Array.isArray(allowedRoles)) {
          // If the authorized MongoDB User object lacks the matching explicitly required role:
          if (!allowedRoles.includes(auth.mongoUser.role)) {
            logger.warn(
              { method: req.method, url: req.url, uid: auth.mongoUser.firebaseUid, role: auth.mongoUser.role }, 
              "Forbidden request strictly blocked (RBAC)"
            );
            return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
          }
        }
      }

      // Context object passed down to the inner route handler
      const ctx = {
        req,
        user: auth?.mongoUser,
        firebaseUser: auth?.decodedToken,
        params: paramsObj?.params || {}, // dynamic slug params inside App Router
      };

      // 2. Validate body schema if requested + available
      if (schema && ["POST", "PUT", "PATCH"].includes(req.method)) {
        try {
          const body = await req.json();
          ctx.body = schema.parse(body);
        } catch (err) {
          if (err instanceof ZodError) {
            logger.warn({ method: req.method, url: req.url, errors: err.errors }, "Validation Error");
            return NextResponse.json(
              { error: "Validation Error", details: err.errors },
              { status: 400 }
            );
          }
          logger.warn({ method: req.method, url: req.url }, "Invalid JSON format");
          return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
        }
      }

      // 3. Execute business logic
      const response = await handler(ctx);
      
      // Log successful transaction metrics
      const durationMs = Date.now() - startTime;
      logger.info({ 
        method: req.method, 
        url: req.url, 
        durationMs, 
        status: response?.status || 200, 
        userId: auth?.mongoUser?._id 
      }, "API Request OK");
      
      return response;

    } catch (err) {
      const durationMs = Date.now() - startTime;

      // Log fully structured error payload using Pino
      logger.error({ 
        err, 
        method: req.method, 
        url: req.url, 
        durationMs 
      }, "Unhandled API Error");

      // Transmit trace context directly to Sentry dashboard
      Sentry.captureException(err, {
        extra: {
          url: req.url,
          method: req.method,
        },
      });

      // Only expose generic server errors to client to prevent stack leaks
      const message = err.message || "Internal Server Error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
