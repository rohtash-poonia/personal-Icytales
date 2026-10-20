# IcyTales Premium Storefront and Cloudinary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete safe multi-image product management and align the working storefront with the inspected premium Figma design.

**Architecture:** Extend the existing Express/Mongoose product boundary with structured media and a cleanup service while keeping JSON compatibility. Add multipart admin saves with local previews and progress, then refine existing shared storefront components and assets without replacing commerce flows.

**Tech Stack:** Next.js 16, React 19, JavaScript, Tailwind CSS 4, Express 4, Mongoose 7, Multer, Cloudinary, Node test runner, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-18-premium-storefront-cloudinary-design.md`

## Global Constraints

- Preserve the current App Router, API routes, contexts, Swipers, cart, checkout, authentication, and unrelated dirty-tree changes.
- Keep Cloudinary credentials server-only and never invent or print secret values.
- Accept legacy string images until migration is complete.
- Use dynamic MongoDB products throughout storefront product surfaces.
- Do not restore deleted files in place; add required Figma assets under `Icylates/public/images/figma`.

## Review Focus

- Partial Cloudinary upload failure must clean only assets created by that request.
- Shared `publicId` references must prevent premature Cloudinary deletion.
- Legacy string and structured images must render identically.
- Closing or correcting the admin form must not upload remote assets.
- Mobile layouts must preserve all content and actions.

---

### Task 1: Product media contract and lifecycle

**Files:**
- Modify: `backend/models/Product.js`
- Modify: `backend/utils/cloudinary.js`
- Create: `backend/services/productMediaService.js`
- Modify: `backend/controllers/productController.js`
- Modify: `backend/routes/products.js`
- Test: `backend/tests/product-media.integration.test.js`

**Interfaces:**
- Produces: normalized `{ url, publicId, alt }` image records and multipart create/update behavior.
- Produces: reference-safe cleanup used by update and delete controllers.

- [x] Write integration tests for legacy normalization, multi-file validation, rollback, and shared-reference cleanup; run them and observe the expected failures.
- [x] Implement the schema, media service, multipart parser, and controller lifecycle.
- [x] Run the focused test and full backend suite.

### Task 2: Repeatable legacy migration

**Files:**
- Create: `backend/scripts/migrateProductImages.js`
- Modify: `backend/package.json`
- Modify: `backend/.env.example`
- Test: `backend/tests/product-media.integration.test.js`

**Interfaces:**
- Consumes: Task 1 image contract.
- Produces: dry-run-by-default migration with explicit `--apply`.

- [x] Add a failing migration-shape test.
- [x] Implement idempotent migration and documented command.
- [x] Verify dry-run behavior without modifying the configured database.

### Task 3: Admin product editor and API progress

**Files:**
- Modify: `Icylates/src/lib/api.js`
- Modify: `Icylates/src/components/admin/ProductModal.jsx`
- Modify: `Icylates/src/app/admin/products/page.js`
- Test: `Icylates/tests/admin-products.test.jsx`
- Test: `Icylates/tests/storefront.test.mjs`

**Interfaces:**
- Consumes: Task 1 multipart contract.
- Produces: local previews, progress callback, structured retained images, notifications, and thumbnails.

- [x] Write failing normalization and administrator interaction tests.
- [x] Implement multipart XHR requests, validation, previews, progress, flavor, and notifications.
- [x] Run focused and full frontend tests.

### Task 4: Figma-aligned storefront refinement

**Files:**
- Modify: existing shared/home/shop/detail/cart components and `src/app/globals.css` only where inspection shows a gap.
- Add: required static assets under `Icylates/public/images/figma/`.

**Interfaces:**
- Consumes: structured-image normalization from Task 3.
- Produces: responsive Figma-aligned home, shop, product, cart, and checkout presentation.

- [x] Add or update visual-structure tests before changing shared behavior.
- [x] Download required Figma assets permanently and verify non-empty files.
- [x] Refine existing components without replacing data flows or Swipers.
- [x] Run lint, tests, and production build.

### Task 5: Journey verification and documentation

**Files:**
- Modify: `Icylates/e2e/customer-admin.spec.js` only if coverage gaps require it.
- Modify: `Icylates/README.md`
- Modify: `docs/repair/OPERATIONS.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: reproducible setup, migration, and verification evidence.

- [x] Run backend syntax/tests and frontend lint/tests/build.
- [x] Run the existing Playwright customer/admin journey.
- [x] Record live Cloudinary verification only if real credentials are configured; otherwise document the exact manual step.

## Completion evidence

- Backend syntax: 40 JavaScript files passed.
- Backend tests: 47 passed after final legacy-reference and per-upload alt-text coverage.
- Frontend lint: passed with zero warnings.
- Frontend tests: 9 Node tests and 20 component tests passed.
- Next.js production build: 41 routes compiled and generated.
- Playwright: customer checkout through MongoDB and administrator COD collection passed in Chromium.
- Product image migration dry run: scanned the configured database and reported `Would migrate 0 of 0 products`; no writes were made.
- Cloudinary live upload/deletion remains a manual deployment check because the configured credentials are placeholders.

