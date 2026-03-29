# Iteration 3 — Dashboard Analytics

Add an analytics dashboard showing aggregate stats across all products and per-product detail views with install metrics and recent event feeds.

## 1. Data Queries

- [x] **1.1** Create `apps/web/src/lib/queries/dashboard.ts` with server-side query functions (not server actions — read-only): `getOverviewStats()` returning total products, total active installs, total uninstalls; `getProductStats()` returning per-product row with name, platform, active count, uninstall count, last activity timestamp
- [x] **1.2** Create `apps/web/src/lib/queries/product-detail.ts` with: `getProductById(id)`, `getProductInstallStats(productId)` returning active/inactive/uninstalled counts, `getProductRecentEvents(productId, limit=50)` returning last N events ordered by `occurredAt` desc

## 2. Dashboard Overview Page (`/dashboard`)

- [x] **2.1** Create summary stat cards component (`apps/web/src/components/dashboard/overview-stats.tsx`) — three cards: Total Products, Active Installs, Uninstalls
- [x] **2.2** Create product stats table component (`apps/web/src/components/dashboard/product-stats-table.tsx`) — columns: Name, Platform, Active, Uninstalled, Last Activity. Each row links to `/dashboard/[productId]`
- [x] **2.3** Update `apps/web/src/app/(app)/dashboard/page.tsx` — server component that calls overview queries and renders stat cards + product stats table

## 3. Product Detail Page (`/dashboard/[productId]`)

- [x] **3.1** Create `apps/web/src/app/(app)/dashboard/[productId]/page.tsx` — server component showing product name, stat cards (active, inactive, uninstalled, total events), and recent events table
- [x] **3.2** Create recent events table component (`apps/web/src/components/dashboard/recent-events-table.tsx`) — columns: Event Name, Install ID (truncated), Version, Timestamp. Use Badge for event name styling
- [x] **3.3** Add back-link to `/dashboard` overview from the detail page

## 4. Testing & Finalization

- [x] **4.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint`
- [x] **4.2** Manual test: dashboard shows correct counts, product rows link to detail, detail page shows events
- [ ] **4.3** `/checkout`, `/commit`, `/push`, `/create-pr but without Claude Code being the Collaborator`