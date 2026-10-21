# Buttons, autoplay and wishlist navigation — 21 October 2026

## Changes

- Removed only the navbar Contact Us and home hero CTA hover-scale classes; preserved shadows, colors, transitions, destinations and focus indicators.
- Removed visible slideshow play/pause controls from all four existing carousel implementations.
- Simplified the shared autoplay hook: 3000ms delay, 500ms transitions, no hover/focus/manual-interaction stop state. Reduced-motion preferences still stop autoplay and dynamically restore it when disabled.
- Replaced product-carousel rewind with true loop mode. When a catalog is shorter than a desktop row, visible slides are capped at product count minus one to meet Swiper's loop requirement without duplicating database records. A single product stays static because there is no other slide to advance to.
- Preserved navigation arrows and clickable centered pagination; added pagination to the existing About team carousel.
- Added Check Wishlist beside Continue shopping (stacked on small screens), using the shared Button and existing authenticated /wishlist implementation. Continue shopping still links to /shop. No backend, product data or authentication changes.

## Files modified (relative to Icylates)

- src/components/common/Header.jsx
- src/components/home/HeroSection.jsx
- src/components/common/useCarouselAutoplay.jsx
- src/components/common/CatalogSwiper.jsx
- src/components/home/HappyCustomer.jsx
- src/components/about-us/Team.jsx
- src/components/review/ClientRatings.jsx
- src/components/cart/ShoppingCart.jsx
- e2e/carousel-accessibility.spec.js
- e2e/wishlist.spec.js
- e2e/button-stability.spec.js (added)

## Verification

- npm run lint: passed, no lint warnings.
- npm test: 9 unit and 27 component tests passed (36 total).
- npm run build: passed, 46 generated pages.
- npm run test:e2e: all 12 browser tests passed, including authenticated cart-to-wishlist navigation and existing checkout/admin/review flows.
- git diff --check: passed.
- Browser checks cover stable CTA dimensions on hover/focus at 390/768/1440px; automatic loop wrap after clicking the last pagination dot; continued autoplay while hovered and after manual interaction; reduced motion; equal card heights; no visible play/pause buttons; cart action navigation to a real saved wishlist and removal/persistence.

Existing image-dimension/LCP advisory messages and Node toolchain warnings were observed. No unrelated template-image changes were made. No dependencies, environment variables or migrations are required; no files were staged or committed.
