# Project improvements — 20 October 2026

Both supplied attachments are identical. Preserve existing Next App Router, Express/Mongoose, authentication/CSRF, Figma assets, commerce and user changes. No staging or commits.

## Design and implementation checklist

- [x] Ignore only generated captures/caches/internal artifacts; preserve public assets and sanitized environment examples; inspect tracked files.
- [x] Align all product card variants with consistent image/title/action areas and larger contained imagery.
- [x] Correct navbar icon alignment, public Pages links and hero spacing/breakpoints.
- [x] Audit all four Swiper implementations; reuse a reduced-motion-aware autoplay hook with hover/focus/manual controls.
- [x] Fix About decorative overlap and restore Happy Faces background from verified existing assets.
- [x] Reuse common Button for matching navigation/actions without replacing specialized controls.
- [x] Database wishlist: authenticated GET/PUT/DELETE /api/wishlist, session-owned User references, atomic duplicate prevention, maximum 100 entries, active products only. Retain existing context interface; guests receive sign-in guidance, never another user's list.
- [x] Reviews: separate Review collection, unique product/user index; eligibility requires an order containing product that is completed and paid. Authenticated create/update/delete own review, public paginated list/summary. Transactionally serialize product rating/count updates with review mutations. Reject user IDs/body extras. Add product/order UI and tests.
- [x] Verify ownership, eligibility, duplicates, aggregates and stale sessions; run backend/frontend suites, browser flows, lint/build, responsive checks at 360/390/768/1024/1440/1920.
- [x] Record changed files, endpoints, database/environment requirements and actual verification results.

Previous Figma file is nRb7bleKQ7vNhdh5GY408Z. User's new link appears unfinished; requested clarification while backend work proceeds. Existing saved references remain available. No live Cloudinary credentials are invented.

Final evidence: 59 backend tests, 36 frontend tests, 9 browser journeys, 120 responsive checks, clean lint, 47-file backend syntax check, production build (46 generated pages), and Git diff whitespace check pass. No commits/staging/pushes. See IMPROVEMENTS-REPORT-2026-10-20.md for details and external limitations.

Review corrections: support both auth ID shapes in review state; remove unavailable wishlist references during add so hidden entries cannot permanently fill capacity; attach native hover/focus listeners because Swiper React consumes on-prefixed props as slider events; normalize multiline testimonial classes to remove hydration mismatch. Targeted tests failed before the relevant corrections and the final combined browser suite passed.
