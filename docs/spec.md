# Analytics Platform - Phase 1

## Goal

Unified internal analytics platform for multiple Chrome extensions.

Scope:
- installs
- activity (open / heartbeat)
- uninstall signals
- feedback collection
- Slack notifications
- internal admin dashboard

---

## Stack

| Layer | Choice |
|---|---|
| Admin | Next.js + shadcn/ui + Tailwind |
| Backend | Fastify (Node.js) |
| Database | Neon Postgres |
| SDK | GitHub npm package |
| Infra | Railway (or similar) |
| Repo | Monorepo (platform) + separate extension repos |

---

## Architecture

Extensions -> SDK -> Fastify API -> Postgres -> Slack
Admin (Next.js) -> Postgres

---

## Core Principles

- one DB for all products
- shared tables (not per product)
- installs = state, events = history
- uninstall = best-effort signal
- activity drives lifecycle truth
- metrics are query-based first
- anonymous by default
- optimise for simplicity

---

## SDK

### Distribution

Installed via GitHub:

```bash
npm install github:your-org/analytics-sdk
```

### Usage

```ts
const analytics = createAnalytics({
  product: "definio_ai",
  version: chrome.runtime.getManifest().version,
  apiBaseUrl: "https://api.yourdomain.com",
});

analytics.track("open");
analytics.feedback({ reasonCode: "missing_feature" });
```

### Responsibilities

- generate/store installId (UUID)
- attach metadata
- send events
- lightweight retry

Rules:
- one installId per extension
- do not share across products

---

## Database

### products

- id (PK)
- key (unique)
- name
- platform
- created_at

### installs (state)

- id (PK)
- product_id (FK)
- install_id (UUID)
- first_seen_at
- last_seen_at
- current_version
- status (active | inactive | likely_uninstalled | uninstall_signalled)
- linked_user_id (nullable)
- created_at
- updated_at

UNIQUE(product_id, install_id)

### events (history)

- id (PK)
- product_id (FK)
- install_id (nullable)
- event_name
- occurred_at
- version
- properties (JSONB)
- source
- created_at

### uninstall_feedback

- id (PK)
- product_id (FK)
- install_id (nullable)
- reason_code
- comment
- version
- submitted_at

---

## Events

- install
- open
- heartbeat
- update
- uninstall_page_opened
- uninstall_feedback_submitted

Rule: product is a field, not part of event name.

---

## Data Flow

### Install
- SDK generates installId
- send install event
- upsert installs row

### Activity
- send open / heartbeat
- update last_seen_at

### Uninstall
- best-effort via page
- may miss or lack installId
- never sole source of truth

### Lifecycle inference
- inactive after threshold (e.g. 14 days)
- likely_uninstalled after longer threshold

---

## Metrics

### Strategy

- query-based first
- no precomputed tables initially

### Examples

Daily active:

```sql
select product_id, count(distinct install_id)
from events
where event_name in ('open','heartbeat')
and occurred_at >= now() - interval '1 day'
group by product_id;
```

Installs:

```sql
select product_id, count(*)
from events
where event_name = 'install'
and occurred_at >= now() - interval '1 day'
group by product_id;
```

Churn:

```sql
select count(*)
from installs
where last_seen_at < now() - interval '14 days';
```

Introduce aggregates only when needed.

---

## API

### POST /v1/events
- validate payload
- insert event
- update installs

### POST /v1/feedback
- insert feedback
- send Slack notification

---

## Anti-Spam (Phase 1)

No strong auth (extensions cannot hold secrets).

Use layered protection:

- product + public key check
- strict schema validation
- body size limits
- rate limiting (IP + installId)
- timestamp sanity checks
- duplicate suppression
- logging suspicious patterns

---

## Identity

| Field | Scope |
|---|---|
| installId | per extension |
| userId | optional (after login) |

Rules:
- no cross-product install tracking
- link later via user account

---

## Key Decisions

- Fastify over Express
- no Lambda (Phase 1)
- GitHub-based SDK
- single Postgres DB
- shared tables
- query-first analytics
- minimal infra

---

## Summary

- installs = current state
- events = source of truth
- uninstall = noisy signal
- activity = strongest lifecycle indicator
- keep system simple, evolve later
