# Iteration 7 — Analytics SDK Package

Ship `@zanalytics/sdk` as an ESM-only TypeScript package inside the monorepo. It provides a lightweight client for tracking installs, events, and feedback from Chrome extensions, plus drop-in React feedback form components. Published to GitHub Packages for installation in external repos (pigment, bookmark-manager, etc.).

## 1. Package Scaffold

- [x] 1.0 Checkout new branch for the work
- [x] **1.1** Create `packages/sdk/` with `package.json`: name `@zanalytics/sdk`, type `module`, exports map (`"."` → core, `"./react"` → React components), peerDependencies on `react` ^19
- [x] **1.2** Create `packages/sdk/tsconfig.json` extending `../../tsconfig.base.json`, target ESNext, moduleResolution bundler, jsx react-jsx, outDir `dist`, declarationDir `dist`
- [x] **1.3** Add `tsup` as dev dependency for building (dual entry points: `src/index.ts` and `src/react/index.ts`), add `tsup.config.ts` with ESM-only output, dts generation, external react
- [x] **1.4** Add `build`, `type-check`, and `dev` scripts to `packages/sdk/package.json`

## 2. Core — Configuration & Init

- [x] **2.1** Create `packages/sdk/src/config.ts` — module-level state holding `productKey`, `version`, `apiUrl`, `installId`; export `getConfig()` that throws if not initialized
- [x] **2.2** Create `packages/sdk/src/storage.ts` — define `StorageAdapter` interface (`get(key): Promise<string | null>`, `set(key, value): Promise<void>`); export `chromeStorageAdapter` using `chrome.storage.local`
- [x] **2.3** Create `packages/sdk/src/init.ts` — export `init(opts: { productKey: string; version: string; apiUrl: string; storage?: StorageAdapter })`. On call: store config, read `installId` from storage, if missing generate `crypto.randomUUID()` and persist it. Return `Promise<void>`
- [x] **2.4** Export `getInstallId()` from `packages/sdk/src/init.ts` for consumers that need the ID directly

## 3. Core — Event Tracking

- [x] **3.1** Create `packages/sdk/src/track.ts` — export `track(eventName: string, properties?: Record<string, unknown>): Promise<void>`. Sends POST to `{apiUrl}/v1/events` with `{ product, installId, eventName, version, properties }`. Fire-and-forget (catch and warn on error, never throw)
- [x] **3.2** Add convenience functions in `packages/sdk/src/lifecycle.ts`: `trackInstall()` (sends `install` event, called automatically on first-ever init), `trackOpen()`, `trackUpdate(previousVersion: string)` (sends `update` event with `{ previousVersion }` in properties)
- [x] **3.3** In `init()`, auto-detect first-ever init (no existing installId in storage) and call `trackInstall()` automatically

## 4. Core — Feedback Submission

- [x] **4.1** Create `packages/sdk/src/feedback.ts` — export `submitFeedback(opts: { type: FeedbackType; reason?: string; message?: string; email?: string; metadata?: Record<string, unknown> }): Promise<{ ok: boolean; feedbackId?: string }>`. Sends POST to `{apiUrl}/v1/feedback`
- [x] **4.2** Re-export `FEEDBACK_TYPES` and `FeedbackType` from `@zanalytics/db/feedback-types` (or inline the constants to avoid coupling SDK to db package)

## 5. Core — Barrel Export

- [x] **5.1** Create `packages/sdk/src/index.ts` barrel exporting: `init`, `track`, `trackInstall`, `trackOpen`, `trackUpdate`, `submitFeedback`, `getInstallId`, `FEEDBACK_TYPES`, `FeedbackType`, `StorageAdapter`, `chromeStorageAdapter`

## 6. React — Feedback Form Components

- [x] **6.1** Create `packages/sdk/src/react/FeedbackForm.tsx` — generic feedback form with fields: type selector (general/bug/feature_request), message textarea, optional email input. Calls `submitFeedback()` on submit. Accepts `className`, `onSuccess`, `onError` props. Minimal inline styles with CSS custom properties for theming
- [x] **6.2** Create `packages/sdk/src/react/UninstallSurvey.tsx` — specialized uninstall feedback form with reason radio buttons (too slow, missing features, found alternative, other), optional message textarea, optional email. Auto-sets type to `uninstall`
- [x] **6.3** Create `packages/sdk/src/react/index.ts` barrel exporting `FeedbackForm` and `UninstallSurvey`
- [x] **6.4** Style components with a default minimal theme using CSS custom properties (`--za-bg`, `--za-text`, `--za-border`, `--za-primary`, etc.) so consumers can override via CSS without prop drilling

## 7. Build & Publish Configuration

- [x] **7.1** Add `files` field to `packages/sdk/package.json` to include only `dist/`
- [x] **7.2** Add `publishConfig` with `registry` pointing to GitHub Packages (`https://npm.pkg.github.com`) and `access: public`
- [x] **7.3** Add `prepublishOnly` script that runs `pnpm build`
- [x] **7.4** Create `packages/sdk/README.md` with quick-start: install, init in background.ts, track events, add feedback form

## 8. Testing & Finalization

- [x] **8.1** Run `pnpm type-check`, `pnpm build`, `pnpm lint`
- [x] **8.2** Manual test: import SDK in a test script, verify `init()` + `track()` + `submitFeedback()` send correct HTTP requests to the local API
- [ ] **8.3** `/checkout`, `/commit`, `/push`, `/create-pr`