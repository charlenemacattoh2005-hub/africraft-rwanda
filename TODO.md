# TODO — EWA408510 E-Commerce Web Application (Africraft Rwanda)

## Steps
1. Frontend sanity check: identify missing/empty page components + broken imports.
2. Implement missing frontend pages: ProductsPage, ProductDetailsPage, plus full Cart/Checkout/Auth/Orders pages.
3. Implement frontend state: local cart storage + auth token handling.
4. Verify backend endpoints match frontend expectations (paths + payload shapes).
5. Backend security/validation: ensure request validation + consistent error responses.
6. Evidence: run dev servers and capture working flow (register/login → browse → checkout → order history).
7. Documentation: update README with final run instructions + env vars.
8. CI/Docker: Dockerfile, docker-compose.yml, GitHub Actions workflow added.

## Progress
- [x] Step 1: Repo audit confirmed major scaffold/missing implementation.
- [x] Step 2: Backend models/auth/products/orders are implemented.
- [x] Step 3: Fix frontend pages and complete remaining pages.
- [x] Step 4: End-to-end verification (run both apps, test flows).
- [x] Step 5: Seed sample products (seed:products) + update README/TODO if needed.
- [x] Step 6: server/Product model updated with badge + featured fields.
- [x] Step 7: server/scripts/seedProducts.js updated with all 30 products.
- [x] Step 8: productController supports featured + badge query filters.
- [x] Step 9: Frontend products service has fetchFeaturedProducts, fetchBestSellers, fetchNewArrivals.
- [x] Step 10: HomePage fetches and displays featured, best sellers, and new arrivals from DB.

## Remaining
- [ ] Deploy to Render/Railway/Vercel and update README live links.
- [ ] Write project report (3-5 pages).

