# IcyTales Premium Storefront and Product Media Design

## Goal

Bring the existing IcyTales storefront closer to the inspected Figma reference while preserving its working App Router commerce flows, and complete secure administrator product media management through Cloudinary.

## Existing system

The frontend uses Next.js 16 App Router, React 19, Tailwind CSS 4, Swiper, and client contexts for authentication, cart, and wishlist state. The backend uses Express, Mongoose, HttpOnly cookie authentication, CSRF protection, role guards, and controller-based APIs. Product CRUD and one-at-a-time server-side Cloudinary upload already exist, but product documents retain only image URLs and never clean remote assets.

The working tree contains substantial user changes and intentional asset deletions. Implementation must edit focused files in place, never reset the tree, and never overwrite unrelated assets.

## Visual direction

The implementation follows the inspected Figma frames `home 1` (`1:2`), `Shop Layout 1` (`1:1852`), `Single Product 1` (`1:2664`), and `Cart` (`1:3354`). It uses Berkshire Swash for display headings, Archivo for body copy, `#f83d8e` pink and `#683292` purple actions, pastel gradients, generous white space, rounded cards, soft shadows, image-led sections, and the dark-purple footer. Existing home sections and Swipers remain. Product imagery stays dynamic and comes from MongoDB.

Static reference assets already present in `public/images` are reused. Missing reference assets are downloaded from Figma into `public/images/figma` under descriptive names; temporary Figma URLs never appear in runtime source. Existing deleted files are not restored in place.

## Product media contract

Each product image is represented as `{ url, publicId, alt }`. `url` is required and must be an HTTPS URL or local `/` asset path. `publicId` is nullable for legacy/local assets and restricted to Cloudinary product-folder identifiers. `alt` is optional and bounded. The product gains an optional bounded `flavor` field.

Legacy string images remain readable during rollout. A repeatable migration converts strings to structured records without changing their URLs. Frontend normalization accepts both forms so deployment order cannot break the catalog.

Product create and update accept JSON for backward compatibility and multipart form data for the administrator editor. Multipart requests carry a JSON `product` field, zero to ten new image files, and retained structured image records. Files are signature-checked and bounded to 5 MB each.

The backend uploads new files with server-only Cloudinary credentials. If any upload or database write fails, newly uploaded assets are deleted best-effort before returning a safe error. After a successful update or product deletion, removed Cloudinary assets are destroyed only when no other product references the same `publicId`. Cleanup failures do not delete valid database data and are returned as a warning suitable for administrator display.

## Administrator experience

The product table displays the primary thumbnail, name, category/flavor, price, stock, status, and actions. The editor supports multiple selection, immediate object-URL previews, per-image removal, existing-image retention/removal, replacement through selection, required-field validation, progress reporting for the multipart request, disabled duplicate submission, accessible errors, and success notifications. Closing the editor before submission uploads nothing.

## Storefront behavior

Home, shop, detail, cart, checkout, authentication, orders, wishlist, and Swipers retain their data and interaction behavior. Shared image normalization converts structured records to display URLs. Product cards and galleries use live API data and meaningful alt text. Missing images continue to use the local fallback.

The visual pass focuses on shared tokens, page heroes, cards, controls, grids, and responsive spacing rather than replacing working components. Mobile layouts retain content and controls with stacked sections, scrollable galleries where appropriate, and touch-sized actions.

## Security and failure behavior

All mutations retain cookie authentication, CSRF checks, and admin authorization. The browser never receives Cloudinary credentials. MIME claims are verified against file signatures. Payload fields are allowlisted, filenames are generated, uploads are bounded, and database identifiers and URLs are validated. Public catalog responses expose `publicId` only because it is an asset identifier rather than a credential; destructive asset operations remain admin-only and server-side.

## Verification

Backend integration tests cover structured and legacy images, multipart authorization and validation, rollback of newly uploaded assets, shared-reference protection, and product deletion cleanup. Frontend tests cover image normalization, local previews, multiple selection, progress, retained-image removal, validation, notifications, and table thumbnails. Final verification runs backend syntax/tests, frontend lint/tests/build, and the existing Playwright customer/admin journey. Live Cloudinary verification occurs only when non-placeholder credentials are configured.

