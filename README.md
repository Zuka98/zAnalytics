# ts-monorepo-template

Opinionated starting point for TypeScript monorepo projects. Framework-agnostic — you bring the frameworks, this gives you the scaffolding.

## What's included


| Category                 | What                                              | File(s)                                            |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------- |
| **Workspace**            | pnpm workspaces with `apps/` and `packages/`      | `pnpm-workspace.yaml`                              |
| **TypeScript**           | Strict base config, extended by each app/package  | `tsconfig.base.json`                               |
| **Linting & formatting** | Biome (replaces ESLint + Prettier)                | `biome.json`                                       |
| **Editor**               | VSCode format-on-save with Biome                  | `.vscode/settings.json`, `.vscode/extensions.json` |
| **Database**             | Postgres 16 via Docker Compose                    | `docker-compose.yaml`                              |
| **Environment**          | `.env.example` with database defaults             | `.env.example`                                     |
| **pnpm enforcement**     | `preinstall` script + `.npmrc` engine-strict      | `package.json`, `.npmrc`                           |
| **AI-assisted dev**      | Claude Code project config with standard sections | `.claude/CLAUDE.md`, `.claude/settings.json`       |
| **Git**                  | Comprehensive `.gitignore` for Node/TS monorepos  | `.gitignore`                                       |


## Directory structure

```
.
├── apps/              ← Application services (web, api, workers, etc.)
├── packages/          ← Shared internal packages (db, ui, sdk, etc.)
├── plans/             ← Implementation plans (AI-assisted, dated)
├── docs/              ← Human-written reference docs
├── scripts/           ← Automation scripts
├── .claude/           ← Claude Code config
├── .vscode/           ← Editor settings
├── biome.json
├── tsconfig.base.json
├── docker-compose.yaml
├── pnpm-workspace.yaml
├── .npmrc
├── .env.example
├── .gitignore
└── package.json
```

Add or remove `apps/` and `packages/` entries as needed. The workspace config auto-discovers anything under those directories.

## Getting started

### 1. Clone / use as template

```bash
# Option A: GitHub template
gh repo create my-project --template your-org/ts-monorepo-template --private --clone

# Option B: Manual
git clone https://github.com/your-org/ts-monorepo-template.git my-project
cd my-project
rm -rf .git && git init
```

### 2. Find and replace `@scope`

Replace `@scope` with your org name across all files:

```bash
grep -r "@scope" --include="*.json" --include="*.ts" --include="*.md" -l
```

Update these:

- `package.json` — workspace filter scripts (add as you create apps)
- `.npmrc` — GitHub Packages registry scope (if publishing packages)
- `.claude/CLAUDE.md` — convention docs

### 3. Set up environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Start Postgres

```bash
docker compose up -d
```

### 5. Install and run

```bash
corepack enable  # if pnpm not installed
pnpm install
pnpm dev
```

## Naming conventions

Don't invent names. Pick from this vocabulary so every project reads the same.

### Apps (services that run)


| Name        | When to use                                   | Example framework         |
| ----------- | --------------------------------------------- | ------------------------- |
| `web`       | Primary web application                       | Next.js, Remix, SvelteKit |
| `api`       | REST/HTTP API service                         | Fastify, Hono, Express    |
| `worker`    | Background job processor                      | Temporal, BullMQ          |
| `admin`     | Internal admin panel (if separate from `web`) | Next.js, Retool           |
| `extension` | Browser extension                             | Plasmo, WXT               |
| `mobile`    | Mobile application                            | React Native, Expo        |
| `docs`      | Documentation site                            | Starlight, Docusaurus     |


### Packages (shared code, imported not run)


| Name     | When to use                                                            |
| -------- | ---------------------------------------------------------------------- |
| `db`     | Database schema, migrations, client                                    |
| `ui`     | Shared UI components                                                   |
| `sdk`    | Publishable client library (GitHub Packages / npm)                     |
| `ai`     | AI/LLM clients and utilities                                           |
| `mail`   | Email templates and sending                                            |
| `config` | Shared config (tsconfig, biome presets) — only if 3+ consumers need it |


### Rules

- **Always singular**: `worker` not `workers`, `db` not `database`
- **Scope matches project**: `@crm/db`, `@dterm/ui`, `@acme/sdk`
- **If it runs, it's an app. If it's imported, it's a package.**
- **One app? Call it `web`.** Don't invent a name for the only service.
- **Only create what you need.** The template ships empty — add folders as the project demands.

## Adding apps and packages

### New app (e.g. Next.js web app)

```bash
mkdir apps/web && cd apps/web
pnpm init
# Install your framework, set up tsconfig extending ../../tsconfig.base.json
```

Then add convenience scripts to root `package.json`:

```json
{
  "scripts": {
    "dev": "pnpm --parallel --filter @scope/web --filter @scope/api dev",
    "dev:web": "pnpm --filter @scope/web dev",
    "build:web": "pnpm --filter @scope/web build"
  }
}
```

### New internal package (e.g. database)

```bash
mkdir packages/db && cd packages/db
pnpm init
```

Key `package.json` fields for internal packages:

```json
{
  "name": "@scope/db",
  "private": true,
  "type": "module",
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": { "import": "./index.ts", "types": "./index.ts" }
  }
}
```

Extend the base tsconfig:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Publishable package (e.g. SDK via GitHub Packages)

Same as internal, but:

```json
{
  "name": "@scope/sdk",
  "private": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Uncomment the GitHub Packages lines in `.npmrc` and update the scope.

## Standard root scripts

Every project built from this template should have these scripts in the root `package.json`:


| Script        | Purpose                                |
| ------------- | -------------------------------------- |
| `dev`         | Start all services in parallel         |
| `build`       | Build all packages and apps            |
| `lint`        | Check with Biome                       |
| `lint:fix`    | Auto-fix with Biome                    |
| `format`      | Format with Biome                      |
| `type-check`  | Run `tsc --noEmit` across all packages |
| `db:generate` | Generate Drizzle migrations            |
| `db:migrate`  | Run Drizzle migrations                 |
| `db:studio`   | Open Drizzle Studio                    |


Add `dev:<name>` and `build:<name>` shortcuts as you add apps.

## Conventions

### Planning

Implementation plans go in `plans/` with dated filenames:

```
plans/
  2026-03-27-user-auth.md
  2026-04-01-api-v2.md
```

### Documentation

Human-written reference docs go in `docs/`:

```
docs/
  architecture.md
  deployment.md
```

## Tooling details

### TypeScript

`tsconfig.base.json` sets strict mode, ESNext modules, bundler resolution. Every app and package extends it and overrides what it needs (e.g. `jsx`, `paths`, `outDir`).

### Biome

Replaces ESLint + Prettier. Configured for:

- Tab indentation
- Double quotes
- Auto import organization
- CSS linting with Tailwind directive support
- Recommended lint rules

### Docker Compose

Postgres 16 with configurable port, user, password, and database name via `.env`. Data persists in a named volume.

### pnpm

Enforced via `preinstall` script and `engine-strict=true` in `.npmrc`. Hoisted `node_modules` for workspace package resolution.

### Claude Code

`.claude/CLAUDE.md` is a project-level instruction file that Claude Code reads at the start of every conversation. It tells Claude about your stack, conventions, and workflows so it can make informed decisions without asking repetitive questions. Think of it as onboarding docs — but for your AI assistant.

**How loading works:** Claude Code merges [CLAUDE.md](http://CLAUDE.md) files by scope. The root `.claude/CLAUDE.md` is always loaded. If a subdirectory (e.g. `apps/web/` or `packages/db/`) contains its own `.claude/CLAUDE.md`, those instructions are loaded *in addition* to the root file when Claude touches files in that path. This lets you keep the root file lean and push team- or domain-specific rules closer to the code they apply to.

**What belongs in [CLAUDE.md](http://CLAUDE.md):**

- Stack and tooling choices Claude can't infer
- Monorepo layout and what each workspace does
- Naming conventions, env var rules, common gotchas
- Build/test/migrate commands

**What doesn't belong:** standard language conventions Claude already knows, detailed API docs (link instead), or anything that changes frequently.

**Planning** is handled by custom Claude Code skills (`/plan` and `/execute-plan`) included in this template. Plans are written as numbered markdown checklists in the `plans/` directory with dated filenames. See the [Planning](#planning) section for the file format.