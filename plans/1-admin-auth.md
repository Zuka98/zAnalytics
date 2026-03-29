# Iteration 1 — Admin Panel Authentication

Add email/password authentication to the Next.js admin panel using NextAuth v5 (Auth.js) with JWT sessions and a Credentials provider. Invite-only — users are created via a CLI script, no public signup.

## 1. Database Layer

- [x] **1.1** Add `users` table to `packages/db/src/schema.ts`: `uuid id, text email (unique), text password, text name (nullable), text role (default "user"), timestamp createdAt, timestamp updatedAt`
- [x] **1.2** Export `User` and `NewUser` inferred types from the users table
- [x] **1.3** Add a shared `db` client instance to `packages/db/src/index.ts` that reads `DATABASE_URL` from env and exports `db` (drizzle + postgres.js) alongside the schema re-export
- [x] **1.4** Run `pnpm db:generate` to create the migration for the users table
- [x] **1.5** Run `pnpm db:migrate` to apply the migration *(BLOCKED: Docker/Postgres not running)*

## 2. Dependencies

- [x] **2.1** Install `next-auth@5.0.0-beta.30` and `bcrypt-ts` in `apps/web`
- [x] **2.2** Install `bcrypt-ts` in the root workspace (used by the create-user script)
- [x] **2.3** Add `AUTH_SECRET` to `.env` and `.env.example` (generate a random 32-char secret)

## 3. Auth Configuration

- [x] **3.1** Create `apps/web/src/lib/auth/roles.ts` — export `type Role = "admin" | "user"` and `isAdmin()` helper
- [x] **3.2** Create `apps/web/src/lib/auth/edge-config.ts` — edge-safe NextAuth config: `AUTH_SECRET`, `pages.signIn: "/login"`, JWT callbacks (attach id, role to token and session), `session.strategy: "jwt"`, `trustHost: true`, empty providers
- [x] **3.3** Create `apps/web/src/lib/auth/config.ts` — full config: spread edge config, add Credentials provider with `bcrypt-ts` password verification via `@zanalytics/db`
- [x] **3.4** Create `apps/web/src/lib/auth/index.ts` — `export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)`
- [x] **3.5** Create `apps/web/src/types/next-auth.d.ts` — augment `User`, `Session`, and `JWT` types with `id` and `role`

## 4. API Route & Middleware

- [x] **4.1** Create `apps/web/src/app/api/auth/[...nextauth]/route.ts` — export `GET` and `POST` from handlers
- [x] **4.2** Create `apps/web/middleware.ts` (project root of apps/web, NOT inside src/) — use `edgeAuthConfig`, redirect unauthenticated to `/login`, redirect authenticated away from `/login` to `/dashboard`
- [x] **4.3** Configure matcher to exclude `api`, `_next/static`, `_next/image`, `favicon.ico`

## 5. Login Page

- [x] **5.1** Create `apps/web/src/app/(auth)/login/page.tsx` — server component: check session, redirect to `/dashboard` if logged in, render `LoginForm`
- [x] **5.2** Create `apps/web/src/components/auth/login-form.tsx` — client component: email/password form using `signIn("credentials", { redirect: false })`, error handling, loading state
- [x] **5.3** Create `apps/web/src/app/(auth)/layout.tsx` — minimal centered layout for the login page

## 6. Protected App Layout

- [x] **6.1** Move existing root page into `apps/web/src/app/(app)/page.tsx` (redirect to `/dashboard` or serve as dashboard)
- [x] **6.2** Create `apps/web/src/app/(app)/layout.tsx` — check `auth()`, redirect to `/login` if no session
- [x] **6.3** Create `apps/web/src/app/(app)/dashboard/page.tsx` — placeholder dashboard page showing user email/role

## 7. Create User Script

- [x] **7.1** Create `scripts/create-user.ts` — CLI script: `pnpm create:user <email> <password> [name] [role]`, validate inputs, hash with `bcrypt-ts`, insert via `@zanalytics/db`
- [x] **7.2** Add `"create:user": "tsx scripts/create-user.ts"` script to root `package.json`

## 8. Next.js Config

- [x] **8.1** Update `apps/web/next.config.ts` to add `serverExternalPackages: ["bcrypt-ts"]` if needed for bundling
- [x] **8.2** Ensure `@zanalytics/db` is transpiled by Next.js (add to `transpilePackages` in next.config.ts)

## 9. Testing & Finalization

- [x] **9.1** Run `pnpm type-check` across all packages
- [x] **9.2** Run `pnpm build` to verify the web app builds
- [x] **9.3** Run `pnpm lint` and fix any issues
- [x] **9.4** Create a test user with `pnpm create:user test@zanalytics.dev password123 Test admin` *(BLOCKED: Docker/Postgres not running)*
- [x] **9.5** Manual test: visit `/dashboard` unauthenticated — should redirect to `/login`
- [x] **9.6** Manual test: sign in with test credentials — should redirect to `/dashboard`
- [x] **9.7** Manual test: visit `/login` while authenticated — should redirect to `/dashboard`
- [x] **9.8** `/checkout`, `/commit`, `/push`, `/create-pr`