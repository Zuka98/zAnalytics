# Iteration 4 — Enhanced Dashboard with Charts

Upgrade the dashboard with time-series charts, trend comparisons, and richer analytics. Overview cards show % change vs previous period, line charts visualize daily installs/events with a date range selector, and product detail pages get install trend charts and event type breakdowns.

## 1. Dependencies

- [x] **1.1** Install shadcn `chart` and `tabs` components via `pnpm dlx shadcn@latest add chart tabs` in `apps/web`
- [x] **1.2** Verify `recharts` is installed as a dependency (shadcn chart depends on it)

## 2. Time-Series Query Functions

- [x] **2.1** Add `getDailyInstalls(days: number)` to `apps/web/src/lib/queries/dashboard.ts` — returns rows of `{ date, installs, uninstalls }` grouped by day from `installs.first_seen_at`, scoped to the last N days
- [x] **2.2** Add `getDailyEvents(days: number)` to `apps/web/src/lib/queries/dashboard.ts` — returns rows of `{ date, count }` grouped by day from `events.occurred_at`, scoped to the last N days
- [x] **2.3** Add `getOverviewStatsWithTrend(days: number)` to `apps/web/src/lib/queries/dashboard.ts` — returns current period stats (active installs, uninstalls, total events) and previous period stats for % change calculation. Period comparison matches the selected range (e.g. 7d vs prior 7d)
- [x] **2.4** Add `getProductDailyInstalls(productId, days)` to `apps/web/src/lib/queries/product-detail.ts` — returns daily install counts for a specific product
- [x] **2.5** Add `getProductEventBreakdown(productId, days)` to `apps/web/src/lib/queries/product-detail.ts` — returns event counts grouped by `event_name` for horizontal bar chart

## 3. Dashboard Overview Page Enhancements

- [x] **3.1** Create date range selector component (`apps/web/src/components/dashboard/date-range-tabs.tsx`) — client component with Tabs (7d / 30d / 90d), updates URL search params to trigger server re-fetch
- [x] **3.2** Update `apps/web/src/components/dashboard/overview-stats.tsx` — add trend arrow (up/down) and % change badge below each stat value, accept `previousPeriod` data as props
- [x] **3.3** Create installs line chart component (`apps/web/src/components/dashboard/installs-chart.tsx`) — Recharts `LineChart` inside shadcn `ChartContainer` showing daily installs and uninstalls as two lines with tooltip
- [x] **3.4** Create events line chart component (`apps/web/src/components/dashboard/events-chart.tsx`) — Recharts `LineChart` showing daily event count with tooltip
- [x] **3.5** Update `apps/web/src/app/(app)/dashboard/page.tsx` — read `searchParams.range` (default 30), pass to new query functions, render date range tabs + enhanced stat cards + installs chart + events chart above the product stats table

## 4. Product Detail Page Enhancements

- [x] **4.1** Create product installs chart component (`apps/web/src/components/dashboard/product-installs-chart.tsx`) — line chart of daily installs for a single product
- [x] **4.2** Create event breakdown chart component (`apps/web/src/components/dashboard/event-breakdown-chart.tsx`) — horizontal `BarChart` with event types on Y axis and counts on X axis
- [x] **4.3** Update `apps/web/src/app/(app)/dashboard/[productId]/page.tsx` — read `searchParams.range`, add date range tabs, render product installs chart and event breakdown chart between stat cards and recent events table

## 5. Testing & Finalization

- [x] **5.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint`
- [x] **5.2** Manual test: dashboard shows trend arrows on stat cards, charts render with mock data, date range tabs switch between 7d/30d/90d
- [x] **5.3** Manual test: product detail page shows install trend chart and event breakdown bar chart
- [ ] **5.4** `/checkout`, `/commit`, `/push`, `/create-pr`
