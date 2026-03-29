# Iteration 6 — Event Type Validation & Feedback

Ensure all six event types from the spec are properly handled end-to-end: define a shared canonical event type list, add the missing `uninstall_feedback` table and `/v1/feedback` endpoint, validate incoming event names against the allowed set, and surface feedback data in the dashboard.

## 1. Shared Event Type Constants

- [ ] **1.1** Create `packages/db/src/event-types.ts` exporting a `VALID_EVENT_NAMES` array (`install`, `open`, `heartbeat`, `update`, `uninstall_page_opened`, `uninstall_feedback_submitted`) and a derived `EventName` union type
- [ ] **1.2** Export `INSTALL_EVENTS` and `ACTIVITY_EVENTS` sets from the same file so the API can import them instead of defining its own local copies
- [ ] **1.3** Re-export `event-types.ts` from `packages/db/src/index.ts`

## 2. API Event Validation

- [ ] **2.1** Update `apps/api/src/routes/events.ts` to import `VALID_EVENT_NAMES`, `INSTALL_EVENTS`, and `ACTIVITY_EVENTS` from `@zanalytics/db` — remove the local hardcoded sets
- [ ] **2.2** Add validation in the POST `/v1/events` handler that rejects requests with an `eventName` not in `VALID_EVENT_NAMES`, returning `400 { error: "Unknown event type: <name>" }`
- [ ] **2.3** Add handling for `uninstall_feedback_submitted` — when this event is received with an `installId`, mark the install status as `uninstalled` (same as `uninstall_page_opened`)

## 3. Uninstall Feedback Table

- [ ] **3.1** Add `uninstallFeedback` table to `packages/db/src/schema.ts` with columns: `id` (uuid PK), `productId` (FK), `installId` (uuid, nullable), `reasonCode` (text, not null), `comment` (text, nullable), `version` (text, nullable), `submittedAt` (timestamp with timezone, default now)
- [ ] **3.2** Export `UninstallFeedback` and `NewUninstallFeedback` inferred types from the schema
- [ ] **3.3** Run `pnpm db:generate` to create the migration and verify the generated SQL

## 4. Feedback API Endpoint

- [ ] **4.1** Create `apps/api/src/routes/feedback.ts` with a POST `/v1/feedback` route — accepts `{ product, installId?, reasonCode, comment?, version? }`, validates the product key, inserts into `uninstallFeedback` table
- [ ] **4.2** Also emit an `uninstall_feedback_submitted` event into the `events` table from the feedback endpoint so the event history is consistent
- [ ] **4.3** Register the feedback route in `apps/api/src/server.ts` (or wherever routes are mounted)

## 5. Dashboard Feedback Visibility

- [ ] **5.1** Add `getRecentFeedback(days: number)` query to `apps/web/src/lib/queries/dashboard.ts` — returns recent uninstall feedback rows joined with product name, ordered by `submittedAt` desc
- [ ] **5.2** Create `apps/web/src/components/dashboard/recent-feedback-table.tsx` — table showing product, reason code, comment, and submission date
- [ ] **5.3** Add the feedback table to the main dashboard page (`apps/web/src/app/(app)/dashboard/page.tsx`) below the existing charts
- [ ] **5.4** Add `getProductFeedback(productId, days)` query to `apps/web/src/lib/queries/product-detail.ts`
- [ ] **5.5** Add the feedback table to the product detail page (`apps/web/src/app/(app)/dashboard/[productId]/page.tsx`)

## 6. Testing & Finalization

- [ ] **6.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint`
- [ ] **6.2** Manual test: POST `/v1/events` with a valid event name succeeds, with an unknown name returns 400
- [ ] **6.3** Manual test: POST `/v1/feedback` inserts a feedback row and emits an `uninstall_feedback_submitted` event
- [ ] **6.4** Manual test: dashboard and product detail pages show the feedback table
- [ ] **6.5** `/checkout`, `/commit`, `/push`, `/create-pr`