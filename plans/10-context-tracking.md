# Iteration 10 — Context Tracking

Collect device/environment context (OS, timezone, browser, locale, screen, hardware, network) from Chrome extensions and store it per-event and as latest snapshot on installs. Covers database schema, API routes, SDK collection + publication, and extension upgrades.

## 1. Database Schema

- [x] **1.1** Add columns to `installs` table in `packages/db/src/schema.ts`: `os` (text, nullable), `browserVersion` (text, nullable), `timezone` (text, nullable), `context` (jsonb, nullable)
- [x] **1.2** Add `context` (jsonb, nullable) column to `events` table in `packages/db/src/schema.ts`
- [x] **1.3** Add `context` (jsonb, nullable) column to `feedback` table in `packages/db/src/schema.ts`
- [x] **1.4** Run `pnpm db:generate` to create the migration, verify the generated SQL
- [x] **1.5** Run `pnpm db:migrate` against local database

## 2. API — Accept & Store Context

- [x] **2.1** Update `eventBodySchema` in `apps/api/src/routes/events.ts` — add optional `context` property (`{ type: "object", additionalProperties: true }`)
- [x] **2.2** Update the event route handler — extract `context` from `request.body`, pass it to the `events` insert, and include `os`, `browserVersion`, `timezone` (extracted from context) + full `context` in the `installs` upsert (`onConflictDoUpdate`)
- [x] **2.3** Update `feedbackBodySchema` in `apps/api/src/routes/feedback.ts` — add optional `context` property
- [x] **2.4** Update the feedback route handler — extract `context` from `request.body`, pass it to the `feedback` insert, and include it in the `events` insert for `feedback_submitted`

## 3. SDK — Collect Context

- [x] **3.1** Create `packages/sdk/src/context.ts` — export `async function collectContext(): Promise<Context>` that gathers: `locale` (navigator.language), `languages` (navigator.languages), `timezone` (Intl.DateTimeFormat), `os` + `arch` (chrome.runtime.getPlatformInfo), `platform` (navigator.userAgentData?.platform), `mobile` (navigator.userAgentData?.mobile), `memory` (navigator.deviceMemory), `cores` (navigator.hardwareConcurrency), `touchPoints` (navigator.maxTouchPoints), `screenWidth` (screen.width), `screenHeight` (screen.height), `pixelRatio` (devicePixelRatio), `colorDepth` (screen.colorDepth), `browser` + `browserVersion` (from navigator.userAgentData?.brands), `connectionType` (navigator.connection?.effectiveType). Wrap each accessor in try/catch so missing APIs don't break collection
- [x] **3.2** Export the `Context` type from `context.ts`
- [x] **3.3** Update `track()` in `packages/sdk/src/track.ts` — call `collectContext()` and attach the result as `context` in the request body
- [x] **3.4** Update `submitFeedback()` in `packages/sdk/src/feedback.ts` — call `collectContext()` and attach the result as `context` in the request body
- [x] **3.5** Re-export `Context` type from `packages/sdk/src/index.ts`

## 4. SDK — Publish

- [x] **4.1** Bump version in `packages/sdk/package.json` from `0.2.0` to `0.3.0`
- [x] **4.2** Run `pnpm build` in `packages/sdk` to verify the build succeeds
- [x] **4.3** Run `pnpm type-check` in `packages/sdk`
- [x] **4.4** Publish with `pnpm publish` from `packages/sdk`

## 5. Extensions — Upgrade SDK

- [x] **5.1** Update `@zuka98/zanalytics-sdk` dependency to `^0.3.0` in `bookmark-manager/package.json`, run `pnpm install`
- [x] **5.2** Update `@zuka98/zanalytics-sdk` dependency to `^0.3.0` in `pigment/package.json`, run `pnpm install`
- [x] **5.3** Run `pnpm build` in bookmark-manager to verify no breakage
- [x] **5.4** Run `pnpm build` in pigment to verify no breakage

## 6. Dashboard — Display Context in Tables

- [x] **6.1** Update `getProductEvents()` in `apps/web/src/lib/queries/product-detail.ts` — add `context` to the selected columns so it's returned to the table
- [x] **6.2** Update `RecentEventsTable` in `apps/web/src/components/dashboard/recent-events-table.tsx` — add **OS** and **Browser** columns (extract `context.os` and `context.browserVersion` from the row data, render as text or badge, handle null gracefully for older events without context)
- [x] **6.3** Update `getProductFeedback()` in `apps/web/src/lib/queries/product-detail.ts` and `getAllFeedback()` in `apps/web/src/lib/queries/feedback.ts` — add `context` to selected columns
- [x] **6.4** Update `FeedbackTable` in `apps/web/src/components/dashboard/feedback-table.tsx` — add **OS** column (extract `context.os`, handle null)

## 7. Verification

- [x] **7.1** Run `pnpm type-check` and `pnpm build` across zAnalytics monorepo
- [x] **7.2** Start local API (`pnpm dev:api`), load one extension in dev mode, open the side panel, check server logs for the `context` payload on the `open` event
- [x] **7.3** Verify `installs` row was updated with `os`, `browser_version`, `timezone`, and `context` columns
- [x] **7.4** Submit feedback from the extension, verify `context` is stored on the `feedback` row
- [x] **7.5** Check events and feedback tables in the admin panel — verify OS and Browser columns render correctly, and show empty/dash for older rows without context