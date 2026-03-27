# Project Name

## Stack

- **Package manager**: pnpm workspaces
- **Language**: TypeScript
- **Database**: Postgres + Drizzle ORM
- **Linter/formatter**: Biome

## Monorepo Layout

```
apps/              ← Application services
packages/          ← Shared internal packages
plans/             ← Implementation plans (AI-assisted)
docs/              ← Human-written reference documentation
scripts/           ← Automation scripts
```

## Conventions

- **Package naming**: `@scope/*` (replace `scope` with your org)
- **Env vars**: All in `.env` at root. Never committed.
- **pnpm**: Never install global packages. All deps go into workspace packages.

## Database

Local Postgres via Docker Compose.

```bash
docker compose up -d     # start postgres
pnpm db:migrate          # apply migrations
pnpm db:studio           # inspect data
```

## Running Locally

```bash
docker compose up -d
pnpm install
cp .env.example .env     # first time only
pnpm db:migrate
pnpm dev
```