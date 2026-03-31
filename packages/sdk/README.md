# @zuka98/zanalytics-sdk

Client-side analytics SDK for [zAnalytics](https://github.com/Zuka98/zAnalytics). Tracks installs, events, and feedback from Chrome extensions. ESM-only.

## Installation

```bash
pnpm add @zuka98/zanalytics-sdk
```

Add to your extension's `.npmrc` to pull from GitHub Packages:

```
@zuka98:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

## Quick start

### 1. Environment variables

```
VITE_ZANALYTICS_PRODUCT_KEY=your-product-key
VITE_ZANALYTICS_API_URL=https://your-api-url.com
```

To keep version in sync with your manifest automatically:

```ts
// vite.config.ts
import manifest from './manifest.json'
export default defineConfig({
  define: {
    'import.meta.env.VITE_ZA_VERSION': JSON.stringify(manifest.version),
  },
})
```

### 2. Initialize in your background service worker

Call `init()` once on startup. On first run it generates a UUID `installId`, persists it to `chrome.storage.local`, and automatically fires an `install` event.

```ts
// src/background.ts
import { init } from '@zuka98/zanalytics-sdk'

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await init({
    productKey: import.meta.env.VITE_ZANALYTICS_PRODUCT_KEY,
    version: import.meta.env.VITE_ZA_VERSION,
    apiUrl: import.meta.env.VITE_ZANALYTICS_API_URL,
  })
})
```

> `init()` must be awaited before calling `track()` or `submitFeedback()`.

### 3. Track events

```ts
import { track, trackOpen, trackUpdate } from '@zuka98/zanalytics-sdk'

await trackOpen()                                  // send "open" event
await trackUpdate('0.2.0')                         // send "update" with previous version
await track('color_picked', { format: 'hex' })     // custom event with properties
```

### 4. Collect feedback

```ts
import { submitFeedback } from '@zuka98/zanalytics-sdk'

await submitFeedback({
  type: 'bug',
  message: 'Sidebar crashes on dark mode',
  email: 'user@example.com', // optional
})
```

For uninstall surveys, use the built-in reason constants:

```ts
import { UNINSTALL_REASONS, submitFeedback } from '@zuka98/zanalytics-sdk'

// UNINSTALL_REASONS provides standard reasons with labels:
// [{ value: "too_slow", label: "It was too slow" }, ...]

await submitFeedback({
  type: 'uninstall',
  reason: 'missing_features',
  message: 'Needed X feature',
})
```

---

## API reference

### Core (`@zuka98/zanalytics-sdk`)

| Export | Description |
|---|---|
| `init(opts)` | Initialize SDK. Generates `installId` on first run and fires `install` event automatically |
| `track(eventName, properties?)` | Send a custom event. Fire-and-forget, never throws |
| `trackOpen()` | Send `open` event |
| `trackUpdate(previousVersion)` | Send `update` event |
| `trackInstall()` | Send `install` event (called automatically by `init()` on first run) |
| `getInstallId()` | Returns current `installId`. Throws if called before `init()` |
| `submitFeedback(opts)` | Submit feedback. Returns `{ ok, feedbackId?, error? }`, never throws |
| `FEEDBACK_TYPES` | Valid feedback type values |
| `UNINSTALL_REASONS` | Standard uninstall reasons with labels |
| `chromeStorageAdapter` | Default storage adapter using `chrome.storage.local` |

### `init()` options

```ts
init({
  productKey: string       // your product key registered in zAnalytics
  version: string          // current extension version
  apiUrl: string           // base URL of the zAnalytics API
  storage?: StorageAdapter // optional — defaults to chrome.storage.local
})
```

---

## Event names

Reserved names trigger special server-side logic:

| Event | Effect |
|---|---|
| `install` | Creates install record, sets status `active` |
| `open` | Updates `lastSeenAt`, sets status `active` |
| `heartbeat` | Updates `lastSeenAt`, sets status `active` |
| `update` | Updates `lastSeenAt` and `currentVersion` |
| `uninstall_page_opened` | Sets install status to `uninstalled` |

Any other event name is stored as-is with no side effects.

---

## Feedback types

Valid values for `type` in `submitFeedback()`:

- `uninstall`
- `general`
- `bug`
- `feature_request`

---

## Custom storage adapter

The default storage is `chrome.storage.local`. Pass a custom adapter if needed:

```ts
await init({
  productKey: '...',
  version: '...',
  apiUrl: '...',
  storage: {
    get: async (key) => localStorage.getItem(key),
    set: async (key, value) => localStorage.setItem(key, value),
  },
})
```
