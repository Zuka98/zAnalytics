# zAnalytics

## Project Description

This project is an analytics platform for tracking usage across multiple Chrome extensions. Each extension installs a shared SDK, which generates an anonymous install identifier and sends events (e.g. installs, opens, activity, uninstall signals, and feedback) to a Fastify backend. The backend validates and ingests these events into a single Postgres database (Neon), separating current state (installs) from event history (events). Metrics such as active users, installs, and churn are computed via queries rather than precomputed aggregates. A Next.js admin panel reads from the database and visualises these metrics, while Slack notifications surface key signals. The architecture emphasises simplicity, strong validation, and an event-driven design that can scale over time without relying on serverless infrastructure.

## Stack

- **Language**: TypeScript
- **Package manager**: pnpm workspaces
- **Linter/formatter**: Biome

## Monorepo Layout

```
apps/
  web/             ← Next.js (App Router) — admin panel (shadcn/ui lives here, not a separate package)
  api/             ← Fastify — standalone API server
packages/
  db/              ← Drizzle ORM + Postgres — shared database layer
plans/             ← Implementation plans (AI-assisted)
docs/              ← Human-written reference documentation
scripts/           ← Automation scripts
```

## Conventions

- **Package naming**: `@zanalytics/*`
- **Env vars**: All in `.env` at root. Never committed.
- **pnpm**: Never install global packages. All deps go into workspace packages.

## Database

Local Postgres via Docker Compose. Do not start or stop Docker — the user manages it manually.