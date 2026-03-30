# Iteration 6 — Feedback Collection & Dashboard

Add a unified feedback table and API endpoint for collecting user feedback across all extension products. Supports four feedback types (uninstall, general, bug, feature_request) validated at code level. Surface feedback data in the dashboard with filtering.

## 1. Feedback Schema

- [x] 1.0 Checkout new branch to work in
- [x] **1.1** Add `feedback` table to `packages/db/src/schema.ts`: `id` (uuid PK), `productId` (uuid FK → products), `installId` (uuid, nullable), `type` (text, not null), `reason` (text, nullable), `message` (text, nullable), `email` (text, nullable), `version` (text, nullable), `metadata` (jsonb, nullable — for rating, browser, OS, etc.), `status` (text, not null, default `new`), `notes` (text, nullable — internal team notes), `createdAt` (timestamptz, default now)
- [x] **1.2** Add indexes on `feedback(productId)`, `feedback(type)`, and `feedback(status)`
- [x] **1.3** Export `Feedback` and `NewFeedback` inferred types from the schema
- [x] **1.4** Run `pnpm db:generate` to create the migration, verify the generated SQL

## 2. Feedback Constants

- [x] **2.1** Create `packages/db/src/feedback-types.ts` exporting `FEEDBACK_TYPES` array (`uninstall`, `general`, `bug`, `feature_request`), `FEEDBACK_STATUSES` array (`new`, `reviewed`, `in_progress`, `resolved`, `dismissed`), and derived `FeedbackType` and `FeedbackStatus` union types
- [x] **2.2** Re-export from `packages/db/src/index.ts`

## 3. Feedback API Endpoint

- [x] **3.1** Create `apps/api/src/routes/feedback.ts` with POST `/v1/feedback` — accepts `{ product, installId?, type, reason?, message?, email?, version?, metadata? }`, validates product key and type against `FEEDBACK_TYPES`, inserts into `feedback` table
- [x] **3.2** Also emit a `feedback_submitted` event into the `events` table with `properties: { type, reason }` so event history stays consistent
- [x] **3.3** Register the feedback route in `apps/api/src/server.ts`

## 4. Dashboard Feedback Queries

- [x] **4.1** Add `getRecentFeedback(days: number | null)` to `apps/web/src/lib/queries/dashboard.ts` — returns recent feedback rows joined with product name, ordered by `createdAt` desc, limit 20
- [x] **4.2** Add `getProductFeedback(productId, opts: { type?, status?, limit, offset })` to `apps/web/src/lib/queries/product-detail.ts` — paginated, filterable by type and status

## 5. Dashboard Feedback UI

- [x] **5.1** Create `apps/web/src/components/dashboard/feedback-table.tsx` — table showing type (badge), status (badge), product, reason, message (truncated), email, rating (from metadata, if present), date
- [x] **5.2** Add the feedback table to the main dashboard page below the product stats table with a "Recent Feedback" heading
- [x] **5.3** Add the feedback table to the product detail page with type and status filters and pagination
- [x] **5.4** Add server action `updateFeedbackStatus(id, status, notes?)` in `apps/web/src/lib/actions/feedback.ts` to update status and notes from the dashboard
- [x] **5.5** Add inline status dropdown and notes edit to feedback table rows so team can triage directly from the dashboard

## 6. Testing & Finalization

- [x] **6.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint`
- [x] **6.2** Manual test: POST `/v1/feedback` with valid type succeeds, with unknown type returns 400
- [x] **6.3** Manual test: dashboard and product detail pages show feedback tables
- [x] **6.4** `/checkout`, `/commit`, `/push`, `/create-pr`