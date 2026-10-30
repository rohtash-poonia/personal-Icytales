# IcyTales frontend

Next.js 16 App Router storefront and administrator interface for the IcyTales catalog.

## Local setup

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local`. The local API origin defaults to `http://localhost:5000`.
3. Start the Express backend, then run `npm run dev`.
4. Open http://localhost:3000.

Browser API calls use `NEXT_PUBLIC_API_URL`. Set it to `https://personal-icytales.onrender.com` for Vercel Production and Preview deployments. The server-side Next.js rewrite uses `API_PROXY_URL`, which should also point to the Render HTTPS URL in Vercel; its development default is `http://127.0.0.1:5000`.

## Verification

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:e2e` after Playwright browsers and an isolated test environment are configured

Authentication uses HttpOnly cookies and CSRF headers. Online card and UPI payments are unavailable until a verified payment provider and refund workflow are implemented; checkout supports cash on delivery.

## Product image administration

The product editor sends authenticated multipart requests to the backend and supports up to ten local previews with upload progress. Cloudinary credentials belong only in `backend/.env`; configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` there. Run the backend image migration as a dry run with `npm run migrate:product-images`, then apply it after review with `npm run migrate:product-images -- --apply`.
