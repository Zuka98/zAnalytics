# @zuka98/zanalytics-sdk — Claude Code context

Full usage docs are in README.md. This file adds context specific to AI-assisted development.

## What this connects to

This SDK sends data to the zAnalytics Fastify API (`Zuka98/zAnalytics`). Two endpoints are used:
- `POST /v1/events` — event tracking
- `POST /v1/feedback` — feedback submission

## Product keys

Each extension has a unique key registered in the zAnalytics database:

- `pigment` — Pigment Chrome extension
- `bookmark-manager` — Bookmark Manager Chrome extension

If adding a new product, it must first be created in the zAnalytics admin panel or via `POST /v1/products`.

## Where to call init()

Always in the background service worker (`src/background.ts`), inside `chrome.runtime.onInstalled`. It must be awaited before any `track()` or `submitFeedback()` call.

## InstallId

Generated on first `init()`, stored in `chrome.storage.local` under `za_install_id`. Automatically attached to all events and feedback — never set it manually.

## Error handling convention

`track()` is fire-and-forget — never throws, logs warnings only. `submitFeedback()` returns `{ ok, error? }` and also never throws. Do not wrap these in try/catch.
