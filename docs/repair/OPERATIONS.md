# IcyTales operations

## Required backend configuration

Use a MongoDB replica set or Atlas deployment because checkout reserves stock and creates order/payment records in a transaction. Set a random JWT secret of at least 32 bytes, exact allowed frontend origins, and HTTPS cookies in production. Cloudinary settings are optional as a group; product uploads return a configuration error when they are absent.

Run `npm ci`, `npm run check:syntax`, and `npm test` in `backend`. Start with `npm start`. The process validates configuration and waits for MongoDB before listening. `GET /api/health` reports 503 unless the database is connected.

Product uploads require all three server-only variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Never add them to the frontend environment. Images are limited to PNG, JPEG, WEBP, or GIF files of at most 5 MB each, with at most ten images per product.

Before deploying structured product images, run `npm run migrate:product-images` in `backend` for a read-only report. Review the count and back up the database, then run `npm run migrate:product-images -- --apply` once to convert legacy image strings to `{ url, publicId, alt }` records. The migration is repeatable and leaves existing URLs unchanged.

## Required frontend configuration

Set `API_PROXY_URL` on the Next.js server to the private backend origin. Prefer same-origin browser requests by leaving `NEXT_PUBLIC_API_URL` empty. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build`.

Serve both applications over HTTPS. Set `CLIENT_ORIGINS` to exact public frontend origins and `COOKIE_SAME_SITE` to the deployment topology. Do not reuse development secrets.

## External blockers

Card and UPI payment flows remain disabled until a provider can verify payments and refunds. Existing duplicate payment records, if any, must be reviewed before the unique Payment order index is deployed. Product image uploads require valid Cloudinary credentials. No production database migration or seed was run during repair.

After setting real Cloudinary credentials, create a temporary product with two images in `/admin/products`, replace one image, and delete the product. Confirm the removed assets disappear from the `icytales/products` Cloudinary folder and any image shared by another product remains. This is the only verification that could not be performed with placeholder credentials.
