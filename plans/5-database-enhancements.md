# Iteration 5 — Database Enhancements

Optimize database queries, add missing indexes, consolidate round trips, enforce singleton connection patterns, and remove dead code.

## 1. Singleton Database Connection

- [x] **1.1** Update `packages/db/src/index.ts` to use a `globalThis` singleton guard so Next.js dev hot reloads don't create new postgres connections on every module re-evaluation
- [x] **1.2** Update `apps/api/src/db.ts` to use the shared `db` from `@zanalytics/db` instead of creating its own separate connection — remove the duplicate `postgres()` + `drizzle()` setup

## 2. Database Indexes

- [x] **2.1** Add index on `installs.status` — used by every overview stat query
- [x] **2.2** Add index on `installs.product_id` — used by all per-product install queries (FK exists but not auto-indexed in Postgres)
- [x] **2.3** Add composite index on `installs(product_id, status)` — covers the most common filter combination
- [x] **2.4** Add index on `installs.first_seen_at` — used by time-range filters and daily installs chart
- [x] **2.5** Add index on `events.product_id` — used by all per-product event queries
- [x] **2.6** Add index on `events.occurred_at` — used by every time-range event query and daily events chart
- [x] **2.7** Add composite index on `events(product_id, occurred_at)` — covers per-product time-filtered event queries
- [x] **2.8** Add index on `events.event_name` — used by event type filtering and grouping
- [x] **2.9** Run `pnpm db:generate` to create the migration, verify the generated SQL

## 3. Query Consolidation

- [x] **3.1** Rewrite `getPeriodStats()` in `dashboard.ts` from 3 separate queries into a single query using conditional `count` with `CASE WHEN` across the `installs` and `events` tables
- [x] **3.2** Rewrite `getOverviewStatsWithTrend()` to combine the totals queries (active count, uninstall count) with the period queries into a single call to `getPeriodStats` plus one totals query — reduce from 8 round trips to 3
- [x] **3.3** Rewrite `getProductStats()` in `dashboard.ts` to replace correlated subqueries with `LEFT JOIN` + conditional aggregation — one query with grouped counts instead of 3 subqueries per product row
- [x] **3.4** Remove `getEventBreakdown()` window function `ORDER BY` since JS already sorts by total — use a plain `GROUP BY` without `sum(...) OVER (...)`

## 4. Cleanup

- [x] **4.1** Remove dead `getOverviewStats()` function from `dashboard.ts` — superseded by `getOverviewStatsWithTrend()`
- [x] **4.2** Remove unused `product-installs-chart.tsx` component — replaced by the shared `installs-chart.tsx`
- [x] **4.3** Remove unused `event-type-pie-chart.tsx` component — replaced by `event-breakdown-chart.tsx`

## 5. Testing & Finalization

- [x] **5.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint`
- [x] **5.2** Manual test: dashboard loads with correct stats, charts, and trend comparisons across all date ranges
- [x] **5.3** Manual test: product detail page loads with charts, events table, filtering, and pagination
- [ ] **5.4** `/checkout`, `/commit`, `/push`, `/create-pr`
