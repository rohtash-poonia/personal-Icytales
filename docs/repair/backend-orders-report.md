# Backend order repair report

## Scope and safety
T2 changes only Product/Order/Payment models, order controller/router/service, isolated tests, optional draft seed and this report. No production database was contacted, migrations executed, live order edited, payment provider called, or deployment performed. The existing real mongod process was not touched. Tests use their own temporary local database/process; real .env is never loaded. Existing deleted public assets are not restored.

## Checklist and issue inventory
- [x] ORD-01: Ignore client item prices, shipping and totals. Actual active Product ObjectIds determine snapshots; all calculations use integer cents and reject invalid catalog money.
- [x] ORD-02: Validate 1–50 distinct products, quantity integer 1–100, required fullName/address/city/postalCode/country, bounded optional phone, paymentMethod and required Idempotency-Key.
- [x] ORD-03: Atomic stock reservation, order creation and matching pending payment in MongoDB transactions. Concurrent purchases cannot oversell; any failure rolls all writes back.
- [x] ORD-04: Unique user+idempotencyKey index plus request fingerprint, safe retries/replays and 409 on key reuse for a different payload.
- [x] ORD-05: All environments enforce ownership in the controller/service independently of route guards. Admin-only mutation authorization is also checked in service.
- [x] ORD-06: Only COD checkout supported. Card/UPI return 422 and never fabricate paid status.
- [x] ORD-07: Cancellation is terminal, transactionally restores proven reserved stock once and marks order/payment failed consistently. Paid orders require a verified refund before cancellation.
- [x] ORD-08: Explicit admin cash collection requires confirmed:true and COD processing/completed state. Order and Payment update atomically, retaining collectedAt/collectedBy audit. Completing an order alone does not imply payment.
- [x] ORD-09: DELETE only archives cancelled unpaid orders, retaining Order/Payment/accounting history. Completed/paid orders cannot be deleted.
- [x] ORD-10: Paginated order lists {items,pagination:{page,limit,total,pages}}, default25/max100, deterministic sorting and history/global/status indexes.
- [x] ORD-11: Admin aggregate stats use actual counts and verified received money, trailing12 UTC months; legacy fabricated paid rows are not counted as collections.
- [x] ORD-12: Trusted checkout quote returns currency, amounts and cents without reserving stock. Shipping configured by ORDER_SHIPPING_PRICE, default20; STORE_CURRENCY defaultUSD.
- [x] ORD-13: New items require ObjectId refs; existing legacy string refs remain readable via lean queries and are not rewritten. Legacy cancellation does not invent a stock restoration when no stockCommittedAt record exists.
- [x] ORD-14: Standalone MongoDB transaction failure returns actionable503; no fake success/partial writes.
- [x] ORD-15: Optional 13-entry demo seed defaults to nonconnecting dry-run. Explicit --apply only upserts missing slugs as draft, stock0, rating0, no fabricated reviews and no overwritten products.

## Files
- backend/models/Product.js: bounded validated money/integer inventory, status/category/sort indexes; removed redundant slug index.
- backend/models/Order.js: real Product refs and monetary cents/currency snapshots; idempotency fingerprint/index; reservation/restoration, collection and archive audit fields; bounded items/status indexes.
- backend/models/Payment.js: one Payment per Order, cents/currency, collection/provider verification audit and pending/completed/failed state.
- backend/services/orderService.js: strict normalization, trusted pricing/quote, inventory/accounting transactions, idempotency, ownership, transitions, audited cash collection and archive behavior.
- backend/controllers/orderController.js: delegates invariants, sends201new/200replay; aggregate getStats export.
- backend/routes/orders.js: existing endpoints retained; adds authenticated POST /quote and admin POST /:id/collect-cash.
- backend/tests/orders.test.js:17 isolated replica-set regressions covering input contracts, pricing tampering, idempotency/concurrency, oversell, rollback including simulated Payment write failure, permissions, cancellation, collection, stats, quote, legacy reads and archive.
- backend/tests/orders-standalone.test.js:1 isolated standalone regression proving503 plus zero partial writes.
- backend/scripts/seedProducts.js: optional non-destructive draft catalog import, no automatic .env loading.

## API contract
POST /api/orders: Idempotency-Key header (8–128 safe characters), items [{product:ObjectId,quantity:integer}], shippingAddress required fields, paymentMethod:"cod". Client prices ignored. Success201new or200same-key replay returns Order.
POST /api/orders/quote: {items,paymentMethod:"cod"}; returns trusted items/amounts/cents/currency without reservation.
GET /api/orders and /api/orders/user/:userId: bounded paginated envelope; user requests restricted to self, admin sees authorized history.
PUT /api/orders/:id/status: admin {orderStatus}; pending→processing/cancelled, processing→completed/cancelled, terminal states cannot reopen. Payment status cannot be changed here.
POST /api/orders/:id/collect-cash: admin {confirmed:true}; cash must actually have been received. Audit retained; retries return the collected order.
DELETE /api/orders/:id: admin archive of cancelled unpaid orders only.
GET /api/stats: admin, {counts:{products,users,orders,pendingOrders},revenue:{collected,pending,currency},monthly:[{month,orders,revenue}]}.
Global CSRF protection supplied by T1 applies to all mutating endpoints.

## Verification and limitations
Initial red: node --test tests/orders.test.js failed because the not-yet-created order service did not exist.
First integration run:5pass/5fail exposed Mongoose7/MongoDB-driver5 withTransaction returning commit metadata, not the callback value; fixed by capturing callback result and returning only after commit.
Second integration run:12pass/1fail exposed ownership lookup after user population; fixed by checking the original stored reference first.
Final: node --test tests/orders.test.js tests/orders-standalone.test.js —18tests,18pass,0fail (2026-10-17).
MongoDB-memory-server used installed MongoDB8.3.7 exclusively for fresh temporary DB/process, with warnings because shared helper initially requested8.3.0; no production connection.
Application-level auth/CSRF tests and whole-project verification are owned by T1/root.

Production needs MongoDB Atlas or a replica set and successful index creation before accepting checkout. Existing duplicate Payment.order rows can make the new unique index fail and need explicit human-reviewed reconciliation; no destructive migration is provided. Existing malformed/legacy order items remain read-only snapshots; cancellation restores only explicitly recorded reservations. Legacy paid records lacking collection/provider audit are excluded from received revenue. Online payments/refunds require a real provider and remain unavailable; COD is complete through explicit audited cash collection. Draft seed is optional and has never been applied.
