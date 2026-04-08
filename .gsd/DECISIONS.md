## Phase 1 Decisions (Optimization Base)

**Date:** 2026-04-09

### Scope
- Caching Strategy: Implement Upstash Redis for leaderboards and dashboards with a 5-minute TTL. Includes invalidation hooks triggered by uploads, transactions, or credits updates.
- Search Strategy: Fully rely on MongoDB Atlas Search (Lucene) traversing Videos, Notes, and Users.

### Approach
- Chose: MongoDB Atlas Search natively, caching via Upstash Redis plugins, and AWS CloudFront for S3 Asset Delivery.
- Reason: User opted for a fully native MongoDB schema strategy preventing the need to synchronize data onto 3rd parties like Algolia. User also strictly demands zero hard-coded database rewrites to maintain backward compatibility (CloudFront domains will generate dynamically onto the standard S3 URLs at runtime).

### Constraints
- Must aggressively maintain backward compatibility.
- Ensure no DB migrations are explicitly forced avoiding broken UI components.
- Enhance the performance seamlessly behind the existing components.
