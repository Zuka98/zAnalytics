# @zuka98/zanalytics-sdk

## What this is

This is the client-side SDK for zAnalytics — an analytics platform that tracks installs, events, and feedback across Chrome extensions. The SDK sends data to a Fastify API which stores it in a Postgres database and surfaces it in a Next.js admin dashboard.

**Backend repo:** `Zuka98/zAnalytics`
**API routes:** `POST /v1/events`, `POST /v1/feedback`

---

## Setup in a Chrome extension

### 1. Install

```bash
pnpm add @zuka98/zanalytics-sdk
```

Add to the extension's `.npmrc` (needed to pull from GitHub Packages):

```
@zuka98:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

### 2. Environment variables (Vite)

Add to `.env`:

```
VITE_ZA_PRODUCT_KEY=your-product-key
VITE_ZA_VERSION=0.1.0
VITE_ZA_API_URL=https://your-api-url.com
```

To keep version in sync with the manifest automatically, add to `vite.config.ts`:

```ts
import manifest from './manifest.json'
export default defineConfig({
  define: {
    'import.meta.env.VITE_ZA_VERSION': JSON.stringify(manifest.version),
  },
})
```

### 3. Initialize in background service worker

Call `init()` once, as early as possible. On first run it generates a UUID `installId`, stores it in `chrome.storage.local`, and automatically fires an `install` event to the API.

```ts
// src/background.ts
import { init } from '@zuka98/zanalytics-sdk'

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await init({
    productKey: import.meta.env.VITE_ZA_PRODUCT_KEY,
    version: import.meta.env.VITE_ZA_VERSION,
    apiUrl: import.meta.env.VITE_ZA_API_URL,
  })

  if (reason === 'update') {
    // optionally track version update — pass the previous version if known
    // await trackUpdate('0.x.x')
  }
})
```

> **Important:** `init()` must be awaited before calling `track()` or `submitFeedback()`. The `installId` is only available after `init()` resolves.

---

## Tracking events

```ts
import { track, trackOpen, trackUpdate } from '@zuka98/zanalytics-sdk'

// When the extension UI opens
await trackOpen()

// When the extension updates (pass previous version)
await trackUpdate('0.2.0')

// Custom events — any string name, optional properties
await track('color_picked', { format: 'hex' })
await track('bookmark_created')
await track('search_used', { query_length: 12 })
```

### Reserved event names (handled by the API with special logic)

| Event | Triggers |
|---|---|
| `install` | Creates install record, sets status `active` |
| `open` | Updates `lastSeenAt`, sets status `active` |
| `heartbeat` | Updates `lastSeenAt`, sets status `active` |
| `update` | Updates `lastSeenAt` and `currentVersion` |
| `uninstall_page_opened` | Sets install status to `uninstalled` |
| `feedback_submitted` | Auto-emitted by the API when feedback is submitted — do not call manually |

Custom event names (anything else) are stored as-is with no special side effects.

---

## Product keys

Each product registered in the zAnalytics database has a unique `key`. The current products are:

- `pigment` — Pigment Chrome extension
- `bookmark-manager` — Bookmark Manager Chrome extension

If adding a new product, create it first via the zAnalytics admin panel or directly via `POST /v1/products` on the API.

---

## Feedback

### Programmatic submission

```ts
import { submitFeedback } from '@zuka98/zanalytics-sdk'

await submitFeedback({
  type: 'bug',
  message: 'The sidebar crashes on dark mode',
  email: 'user@example.com', // optional
})
```

### Valid feedback types

| Type | When to use |
|---|---|
| `uninstall` | User is uninstalling the extension |
| `general` | General feedback |
| `bug` | Bug report |
| `feature_request` | Feature request |

### Drop-in React components

```tsx
import { FeedbackForm } from '@zuka98/zanalytics-sdk/react'
import { UninstallSurvey } from '@zuka98/zanalytics-sdk/react'

// General feedback form (general / bug / feature_request)
<FeedbackForm
  defaultType="general"
  onSuccess={() => console.log('sent')}
  onError={(err) => console.error(err)}
/>

// Uninstall survey — render on the uninstall page
<UninstallSurvey onSuccess={() => window.close()} />
```

Both components call `submitFeedback()` internally. They require `init()` to have been called first.

### Theming the feedback components

Override with CSS custom properties on a wrapper:

```css
.wrapper {
  --za-primary: #7c3aed;
  --za-primary-text: #fff;
  --za-bg: #1e1e2e;
  --za-text: #cdd6f4;
  --za-border: #45475a;
  --za-radius: 8px;
  --za-gap: 16px;
  --za-input-padding: 8px;
  --za-input-size: 14px;
  --za-label-size: 13px;
  --za-btn-padding: 8px 16px;
  --za-font: inherit;
}
```

---

## InstallId

The SDK generates a random UUID on first `init()` call and persists it to `chrome.storage.local` under the key `za_install_id`. Subsequent `init()` calls reuse the stored ID. This ID is sent with every event and feedback submission to identify the install.

To read the current installId:

```ts
import { getInstallId } from '@zuka98/zanalytics-sdk'
const id = getInstallId() // throws if init() hasn't been called yet
```

---

## Error handling

All `track()` calls are fire-and-forget — they never throw. Failures are logged as `console.warn`. `submitFeedback()` returns `{ ok: boolean, error?: string }` and also never throws.

---

## Storage adapter

The default storage uses `chrome.storage.local`. If you need a different storage backend (e.g. `localStorage` for an extension popup running in a regular page context), pass a custom adapter:

```ts
import { init } from '@zuka98/zanalytics-sdk'

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
