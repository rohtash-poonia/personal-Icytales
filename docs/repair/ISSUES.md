# Repair issue ledger

Status date: 2026-10-18 (Asia/Calcutta). No production database, payment provider, Cloudinary account, deployment, or real customer record was accessed.

## Resolved — 54

### Authentication and security (12)

- SEC-01 — Removed every development authentication/admin bypass; all environments enforce cookie authentication and role checks.
- SEC-02 — Loads environment configuration before routers, validates required secrets/origins/ports, connects before listening, and shuts down cleanly.
- SEC-03 — Removed registration double hashing; password hashing now occurs once in the User pre-save hook.
- SEC-04 — Replaced browser-stored JWTs with HttpOnly, Secure-in-production, SameSite cookies and sanitized user responses.
- SEC-05 — Invalid, expired, malformed, blocked-user, and revoked sessions return 401 instead of leaking a 500.
- SEC-06 — Added session-version revocation for logout and blocking; administrator accounts cannot be blocked or deleted through customer endpoints.
- SEC-07 — Added signed, expiring, timing-safe double-submit CSRF protection for every mutation and one safe client retry.
- SEC-08 — Replaced localhost-only CORS behavior with exact configurable origin allowlists and credential support.
- SEC-09 — Added Helmet, global/login/registration/content rate limits, request size limits, and proxy configuration validation.
- SEC-10 — Added field allowlists, primitive/type/length checks, Mongo operator-key rejection, ObjectId checks, bounded pagination, and sanitized errors.
- SEC-11 — Bounded image uploads by type/count/size, verifies file signatures, cleans temporary files, and fails truthfully without Cloudinary configuration.
- SEC-12 — Protected drafts and admin collections; public product queries cannot use all=true or read inactive products.

### Orders, stock, payments, and reporting (15)

- ORD-01 — Server ignores client prices, shipping, totals, and payment status.
- ORD-02 — Validates product references, quantities, shipping fields, payment method, and idempotency keys.
- ORD-03 — Reserves stock and creates Order/Payment records in one MongoDB transaction.
- ORD-04 — Prevents overselling under concurrent checkout.
- ORD-05 — Rolls back all inventory/accounting writes when any line or payment write fails.
- ORD-06 — Adds per-user idempotency with request fingerprints, replay, and payload-conflict handling.
- ORD-07 — Enforces order ownership inside the service as well as the router.
- ORD-08 — Supports only truthful COD checkout; card/UPI return 422 until a provider exists.
- ORD-09 — Uses the shared pending/processing/completed/cancelled status contract.
- ORD-10 — Restores proven reservations exactly once on cancellation and aligns failed payment state.
- ORD-11 — Requires explicit administrator confirmation before COD cash is recorded as paid.
- ORD-12 — Archives only cancelled unpaid orders while retaining accounting history.
- ORD-13 — Adds bounded list queries, deterministic sorting, ownership/history/status/idempotency indexes.
- ORD-14 — Calculates dashboard counts and trailing-month revenue from verified collections only.
- ORD-15 — Keeps legacy string product snapshots readable without inventing stock restoration; seed defaults to dry-run drafts.

### Storefront and content (12)

- FE-01 — Central API client now sends credentials, CSRF, cancellation signals, filters, typed errors, and no conflicting localhost fallback.
- FE-02 — Catalog/list/detail/related/best-seller/favorite views use the backend envelope and actual Product schema.
- FE-03 — Cart actions now mutate one persisted normalized cart and preserve variant identity and stock limits.
- FE-04 — Checkout sends product IDs/quantities and complete validated shipping data, quotes server totals, uses stable idempotency, and clears only on confirmed success.
- FE-05 — Added authenticated paginated order history and ownership-protected order confirmation pages.
- FE-06 — Authentication restores `/api/auth/me`, preserves safe return paths, reports failures, and uses shared customer/admin forms.
- FE-07 — Wishlist persistence, product saves, cart additions, loading, empty, retry, and out-of-stock states are connected.
- FE-08 — Shared Button/Input controls now have safe button types, loading/disabled semantics, refs, labels, described errors, and focus styles.
- FE-09 — Reconciled 95 broken image references across 13 source files without restoring the 78 user-deleted assets.
- FE-10 — Contact and newsletter forms validate, persist, report real failures, require consent, and make no unimplemented discount promise.
- FE-11 — Blog filtering/pagination uses actual counts; ten cards have working SSG detail routes and the missing shared header/footer layout.
- FE-12 — Fixed the broken `/flavors` navigation, full-page search navigation, React SVG/iframe DOM properties, hydration markup, and inert legacy catalog links.

### Administration (8)

- ADM-01 — One layout-level gate protects every administrator page while leaving the login route accessible.
- ADM-02 — Dashboard uses the aggregate stats endpoint and shows collected/pending revenue without invented growth.
- ADM-03 — Product administration uses paginated envelopes, valid active/draft/archived enums, typed payloads, bounded uploads, and an accessible modal.
- ADM-04 — Order administration supports only the shared status enum, recoverable errors, audited cash collection, and retention-preserving archive.
- ADM-05 — User administration adds block/unblock/delete controls while protecting administrators and revoking blocked sessions.
- ADM-06 — Added a paginated administrator inbox for persisted contact messages.
- ADM-07 — Admin tables now have stable keys, scoped headers, empty states, horizontal overflow, pagination, loading, retry, and action states.
- ADM-08 — Sidebar works on small screens, identifies the current page/user, and handles sign-out errors.

### Build, dependencies, and verification (7)

- QLT-01 — Added meaningful unit, component, API integration, concurrency, rollback, security, and browser journey tests.
- QLT-02 — Added repeatable lint, syntax, unit/component, browser, build, seed, and administration scripts.
- QLT-03 — Upgraded Next/React and security-sensitive backend packages while preserving JavaScript, App Router, Express, MongoDB, and Mongoose.
- QLT-04 — Backend production dependency audit is zero; frontend production dependency audit is zero.
- QLT-05 — Added same-origin API proxy support and response security headers.
- QLT-06 — Added safe environment examples, startup validation, operations documentation, secret ignores, and a neutral fallback asset.
- QLT-07 — Preserved the initial Git branch, 78 deleted assets, three edited storefront files, and the untracked copied image; no reset, commit, push, seed apply, or production write occurred.

## External or manual blockers — 8

- EXT-01 — Card/UPI authorization, capture, webhook verification, and refunds need a selected payment provider and credentials. Those methods intentionally remain unavailable.
- EXT-02 — Production checkout needs MongoDB Atlas or another replica set. Existing data must be reviewed for duplicate Payment.order values before unique index creation.
- EXT-03 — Product uploads need valid Cloudinary credentials; no account was available for a live upload.
- EXT-04 — The 78 deleted brand/decorative images were intentionally preserved as deletions. Broken references now use surviving product art or a neutral placeholder; final brand artwork must be supplied.
- EXT-05 — Template business copy still contains unverified address/phone/blog prose. Real business owners must provide authoritative contact, policy, social, and editorial content.
- EXT-06 — The backend and root are outside the frontend Git repository, so one repository-level CI/deployment pipeline cannot include them until the repository layout is decided.
- EXT-07 — `eslint-config-next@16.4.2` retains five high npm advisories in its development-only glob chain. npm proposes a breaking downgrade to Next 14; production dependencies audit clean.
- EXT-08 — `backend/cookies.txt` and the real `.env` predate the repair and remain local. They are ignored now; rotate the JWT secret and remove obsolete session artifacts during environment provisioning.

## Remaining verification gaps

- No real Atlas index rollout, production data reconciliation, Cloudinary upload, provider payment/refund, DNS/TLS, or deployment test was possible without external systems.
- No sustained load test, formal screen-reader audit, or visual-regression baseline was available.
- CI remains blocked by the split repository topology described in EXT-06.
