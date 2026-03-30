# @zanalytics/sdk

Client-side analytics SDK for zAnalytics. ESM-only, works in Chrome extensions and web apps.

## Installation

```bash
pnpm add @zanalytics/sdk
```

> Requires `react ^19` if you use the feedback UI components.

## Quick start

### 1. Initialize in your background service worker

Call `init()` once, as early as possible. On first run it generates and persists an `installId` and automatically fires an `install` event.

```ts
// src/background.ts
import { init } from '@zanalytics/sdk'

chrome.runtime.onInstalled.addListener(async () => {
  await init({
    productKey: import.meta.env.VITE_ZA_PRODUCT_KEY,
    version: import.meta.env.VITE_ZA_VERSION,
    apiUrl: import.meta.env.VITE_ZA_API_URL,
  })
})
```

### 2. Track events

```ts
import { track, trackOpen, trackUpdate } from '@zanalytics/sdk'

// When the extension side panel opens
await trackOpen()

// Track a custom event with properties
await track('color_picked', { format: 'hex', value: '#ff0000' })

// When the extension updates
await trackUpdate('0.2.1') // previous version
```

### 3. Environment variables (Vite)

Add to your extension's `.env`:

```
VITE_ZA_PRODUCT_KEY=your-product-key
VITE_ZA_VERSION=0.1.0
VITE_ZA_API_URL=https://your-api-url.com
```

Read the version directly from your manifest to avoid duplication:

```ts
// vite.config.ts
import manifest from './manifest.json'
export default defineConfig({
  define: {
    'import.meta.env.VITE_ZA_VERSION': JSON.stringify(manifest.version),
  },
})
```

## Feedback UI components

Drop-in React components — no external dependencies beyond React.

### General feedback form

```tsx
import { FeedbackForm } from '@zanalytics/sdk/react'

function MyFeedbackPage() {
  return (
    <FeedbackForm
      defaultType="general"
      onSuccess={() => console.log('sent!')}
      onError={(err) => console.error(err)}
    />
  )
}
```

### Uninstall survey

Render this on your extension's uninstall page (`chrome_url_overrides` or the URL set in `chrome.runtime.setUninstallURL`).

```tsx
import { UninstallSurvey } from '@zanalytics/sdk/react'

function UninstallPage() {
  return <UninstallSurvey onSuccess={() => window.close()} />
}
```

### Theming

Both components use CSS custom properties so you can match your extension's look:

```css
.my-wrapper {
  --za-primary: #7c3aed;
  --za-primary-text: #fff;
  --za-bg: #1e1e2e;
  --za-text: #cdd6f4;
  --za-border: #45475a;
  --za-radius: 8px;
  --za-gap: 16px;
}
```

## API reference

### Core

| Export | Description |
|---|---|
| `init(opts)` | Initialize SDK, resolve/generate `installId`, fire `install` on first run |
| `track(eventName, properties?)` | Send a custom event |
| `trackInstall()` | Send `install` event |
| `trackOpen()` | Send `open` event |
| `trackUpdate(previousVersion)` | Send `update` event |
| `getInstallId()` | Returns current `installId` (throws if not initialized) |
| `submitFeedback(opts)` | Submit feedback directly without UI |
| `chromeStorageAdapter` | Default storage adapter using `chrome.storage.local` |

### React (`@zanalytics/sdk/react`)

| Export | Description |
|---|---|
| `FeedbackForm` | General / bug / feature-request form |
| `UninstallSurvey` | Uninstall reason survey |
