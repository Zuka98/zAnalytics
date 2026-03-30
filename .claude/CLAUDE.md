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
  web/                          ← Next.js (App Router) — admin panel
    src/
      app/
        (app)/                  ← Protected routes (requires auth)
          dashboard/
        (auth)/                 ← Auth routes (login)
        api/auth/[...nextauth]/ ← NextAuth API route
      components/
        shadcn/                 ← Unmodified shadcn primitives
        auth/                   ← Auth-specific components
      lib/
        auth/                   ← NextAuth config (edge-config, config, roles)
        utils.ts
      types/                    ← Type augmentations (e.g. next-auth.d.ts)
    middleware.ts               ← Route protection (edge runtime)
  api/                          ← Fastify — standalone API server
    src/
      routes/                   ← Route handlers (events, products)
      db.ts                     ← DB connection
packages/
  db/                           ← Drizzle ORM + Postgres — shared database layer
    src/
      schema.ts                 ← Table definitions (users, products, installs, events)
      index.ts                  ← DB client + re-exports
      migrate.ts                ← Migration runner
    drizzle/                    ← Generated SQL migrations
plans/                          ← Implementation plans (AI-assisted)
docs/                           ← Human-written reference documentation
scripts/                        ← Automation scripts (e.g. create-user.ts)
```

## Conventions

- **Package naming**: `@zanalytics/*`
- **Env vars**: All in `.env` at root. Never committed. Apps load via symlink or `dotenv-cli`.
- **pnpm**: Never install global packages. All deps go into workspace packages.
- **shadcn components**: Installed to `apps/web/src/components/shadcn/` (not `ui/`). These are unmodified primitives.
- **Custom components**: `apps/web/src/components/<feature>/` (e.g. `auth/`).
- **Comments in Code: **Do not write unnecessary comments in code to explain things. Code is self explanatory unless there is something that needs to be explicitly mentioned

## Auth

- NextAuth v5 (Auth.js) with JWT sessions and Credentials provider.
- Invite-only — users are created via `pnpm create:user <email> <password> [name] [role]`.
- Middleware at `apps/web/middleware.ts` protects all routes except `/login` and `/api`.
- Edge-safe config in `edge-config.ts`, full config (with DB access) in `config.ts`.

## Database

- **Local**: Postgres via Docker Compose. Do not start or stop Docker — the user manages it manually.
- **Production**: Neon.
- **Schema**: `packages/db/src/schema.ts` — tables: `users`, `products`, `installs`, `events`.
- **Migrations**: `pnpm db:generate` then `pnpm db:migrate`.

## Scripts

- `pnpm dev` — start API + web concurrently
- `pnpm dev:api` / `pnpm dev:web` — start individually
- `pnpm build` — build all packages
- `pnpm type-check` — typecheck all packages
- `pnpm lint` / `pnpm lint:fix` — Biome check
- `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` — Drizzle commands
- `pnpm create:user` — create admin panel user