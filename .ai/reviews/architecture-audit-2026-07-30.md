# Architecture Audit Report — 2026-07-30

## Scope

Full-stack audit of the Foundation Phase (pre-universal-platform transition, originally "AnimaxStore"). 40 dimensions across architecture, security, performance, data, code quality, tooling, and deployment readiness.

---

## Audit Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 8 |
| Medium   | 12 |
| Low      | 6 |

---

## Critical Issues

### C1. Secrets committed to git repository

- **Severity:** Critical
- **Files:** `.env`, `.env.local`
- **Problem:** Both files are committed and tracked in git. `.env.local` exposes the production `AUTH_SECRET` (plaintext), `SUPABASE_SERVICE_ROLE_KEY` (full admin access to Supabase), and database `DATABASE_URL` password. `.env` duplicates the database password and exposes the Supabase anon key.
- **Risk:** Full database compromise, Supabase account takeover, forged auth tokens, data exfiltration. Any clone of this repo exposes production credentials.
- **Recommendation:** Rotate all exposed credentials immediately. Add `.env*` to `.gitignore` (it is present but these files were committed before the rule took effect). Use `git rm --cached .env .env.local` to remove from tracking. Never commit secrets.

### C2. Supabase Service Role Key in `.env.local`

- **Severity:** Critical
- **File:** `.env.local:15`
- **Problem:** `SUPABASE_SERVICE_ROLE_KEY` is a full-admin credential that bypasses all Row-Level Security. It is committed in plaintext.
- **Risk:** Any attacker with access to this key can read/write all database tables, manage storage, invoke admin APIs, and exfiltrate the entire user database (including password hashes).
- **Recommendation:** Revoke the key in Supabase dashboard immediately. Use the anon key (JWT-constrained) for client operations. Only use service role in trusted server-side contexts with strict IP restrictions.

---

## High Severity Issues

### H1. Missing security headers (CSP, HSTS, etc.)

- **Severity:** High
- **File:** `next.config.ts:3-7`
- **Problem:** `next.config.ts` only sets `turbopack.root`. No `headers()` function configured. The application serves without Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options, or Referrer-Policy headers.
- **Risk:** Vulnerable to XSS, clickjacking, MIME-type sniffing attacks.
- **Recommendation:** Add `async headers()` in `next.config.ts` with security headers:
  ```ts
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:;" },
      ],
    }];
  }
  ```

### H2. No rate limiting on auth endpoints

- **Severity:** High
- **File:** `src/app/api/auth/[...nextauth]/route.ts`
- **Problem:** Credentials-based authentication has no rate limiting, account lockout, or progressive delay. The `authorize` callback in `src/auth.ts:17-30` returns `null` silently on failure, indistinguishable from "user not found" vs "wrong password".
- **Risk:** Brute-force password attacks, credential stuffing, enumeration of valid emails.
- **Recommendation:** (A) Implement login rate limiting via middleware or Upstash Ratelimit. (B) Add constant-time comparison to prevent timing attacks. (C) Distinguish error types in server logs while returning generic "Invalid credentials" to the client. (D) Consider integrating next-auth v5's `authorize` with attempt tracking in the database.

### H3. No session TTL / maxAge configured

- **Severity:** High
- **File:** `src/auth.config.ts:6`
- **Problem:** Session strategy is JWT but `maxAge` is not set. Default JWT maxAge in NextAuth v5 is 30 days — too long for e-commerce.
- **Risk:** Stolen tokens remain valid for 30 days. Users who forget to logout on shared devices remain authenticated.
- **Recommendation:** Add `session: { strategy: "jwt", maxAge: 24 * 60 * 60 }` (24 hours) and `updateAge: 6 * 60 * 60` (renew every 6 hours) in `auth.config.ts`.

### H4. No signIn callback — missing pre-auth checks

- **Severity:** High
- **File:** `src/auth.config.ts`
- **Problem:** No `signIn` callback defined. Cannot prevent login for unverified emails, banned users, or disabled accounts. The `authorize` callback in `src/auth.ts` only checks password validity.
- **Risk:** Banned users can still authenticate if they know their password. No email verification gate.
- **Recommendation:** Add `callbacks.signIn` to check `user.emailVerified !== null` (once email verification is implemented) and a `bannedAt` or `isActive` field on the User model.

### H5. No brute-force protection on password comparison

- **Severity:** High
- **File:** `src/auth.ts:26`
- **Problem:** Uses `bcryptjs.compare()` without any delay or attempt tracking. bcryptjs is a pure-JS implementation (~3x slower than native bcrypt) which provides some inherent delay, but there's no application-level protection.
- **Recommendation:** Migrate to native `bcrypt` (faster hashing with same security guarantees). Add failed-attempt tracking on the User model (`loginAttempts`, `lockoutUntil`). Or use `@node-rs/bcrypt` for native performance.

### H6. No production-readiness build configuration

- **Severity:** High
- **File:** `next.config.ts`
- **Problem:** No `output: "standalone"` for Docker/Vercel, no `experimental` optimizations, no image optimization config, no logging configuration. The `turbopack.root` entry is unnecessary — Next.js auto-detects the root.
- **Recommendation:** Remove `turbopack.root`. Add production configuration: `output: "standalone"`, `logging: { fetches: { fullUrl: true } }`, `images: { formats: ["image/avif", "image/webp"] }`.

### H7. Missing API response envelope standards

- **Severity:** High
- **File:** `.ai/project/architecture.md:114`
- **Problem:** Architecture docs specify a `{ data, error, meta }` response format, but no implementation exists. No API routes exist except the NextAuth handler. No middleware for consistent error responses.
- **Risk:** Inconsistent API patterns will emerge as feature development starts, creating technical debt.
- **Recommendation:** Create `src/shared/api/response.ts` with helper functions (`ok(data, meta?)`, `error(message, status)`) before writing any route handlers. Enforce via the service layer.

### H8. No `index.ts` barrel exports — features are fully exposed

- **Severity:** High
- **File:** `src/features/*/`
- **Problem:** Architecture doc states "A feature exposes only its public `index.ts`", but no feature module has an `index.ts`. Internal files are fully accessible from outside the module.
- **Risk:** Tight coupling between features, no enforced module boundaries, internal implementation details become de facto public API.
- **Recommendation:** Create `index.ts` in each feature directory that re-exports only the public API. Use ESLint `import/no-restricted-paths` to enforce boundaries.

---

## Medium Severity Issues

### M1. No root error/loading/not-found pages

- **Files:** `src/app/(auth)`, `src/app/(marketing)`, `src/app/(store)`, `src/app/account`, `src/app/admin`
- **Problem:** Zero error boundaries, loading states, or not-found pages exist. A 404 or error anywhere in the app will show the default Next.js error page.
- **Recommendation:** Create `error.tsx`, `loading.tsx`, `not-found.tsx` at root layout level before adding feature routes.

### M2. `tsconfig.json` targets ES2017

- **File:** `tsconfig.json:3`
- **Problem:** `target: "ES2017"` — Next.js 16 and Node 18+ support ES2022 native features (async/await, `Array.at()`, `Object.hasOwn()`, etc.). Older target produces less optimized output.
- **Recommendation:** Change to `"target": "ES2022"`.

### M3. Zod v4 API compatibility not verified

- **File:** `package.json:23` (`zod: "^4.4.3"`)
- **Problem:** Zod v4 has a different API from v3 (which most libraries assume). `z.infer<T>`, `z.object()`, `.parse()`, `.refine()` are used in `validation.ts` and `login.ts` — need to verify these still work under v4 at runtime. The project builds but Zod v4 may have subtle behavioral differences.
- **Recommendation:** Pin to a specific Zod version and add a smoke test for schema parsing. Add `zod` to `devDependencies` with a test that exercises all custom schemas.

### M4. `seed.ts` duplicates Prisma client setup

- **File:** `prisma/seed.ts:1-8`
- **Problem:** Manual dotenv loading and PrismaPg adapter instantiation, duplicating the singleton in `src/shared/lib/prisma.ts`. If the Prisma config changes, seed.ts must be updated independently.
- **Recommendation:** Reuse the shared Prisma singleton. Better yet, configure Prisma's `prisma.config.ts` to handle the datasource URL so `prisma db seed` uses it directly.

### M5. No Prisma `previewFeatures` or optimized config

- **File:** `prisma/schema.prisma:1-8`
- **Problem:** Generator uses plain `prisma-client` without `previewFeatures` like `relationJoins` (significant performance improvement for JOIN queries). Using `PrismaPg` adapter manually instead of built-in driver adapter configuration in schema.
- **Recommendation:** Add `previewFeatures = ["relationJoins"]` to generator. Consider using the engine-native PostgreSQL connection for simplicity instead of `@prisma/adapter-pg`.

### M6. No database indexes beyond unique constraints

- **File:** `prisma/schema.prisma`
- **Problem:** Only unique indexes exist (on email, slug, SKU). No indexes on `Product.isPublished`, `Product.isFeatured`, `Product.categoryId`, `Order.userId`, `Cart.sessionId`, `OrderItem.productId`, `Address.userId`, or `Order.createdAt`. E-commerce queries will do full table scans.
- **Recommendation:** Add indexes:
  ```prisma
  @@index([isPublished, isFeatured])
  @@index([categoryId])
  @@index([userId])
  @@index([sessionId])
  @@index([createdAt])
  @@index([userId, createdAt])
  ```

### M7. `OrderAddress` denormalized but missing key fields

- **File:** `prisma/schema.prisma:218-228`
- **Problem:** `OrderAddress` duplicates Address fields but lacks the `isDefault` flag and `label` field consistency (label is `String?` but Address has `@default("Home")`). No `phone` or `email` on either address model for shipping contact.
- **Recommendation:** Add `phone` and `email` to both address types. Make `label` consistently nullable with defaults.

### M8. No `emailVerified` enforcement path designed

- **File:** `prisma/schema.prisma:28`
- **Problem:** User model has `emailVerified` field, `auth.config.ts` has `newUser: "/register"`, but no email verification flow exists or is designed. Users can register and login without email verification.
- **Recommendation:** Document in architecture whether email verification is required (it should be for e-commerce). Add `VerificationToken` model (already exists) handling in auth flow.

### M9. Cart `userId` is optional but no guest cart persistence strategy

- **File:** `prisma/schema.prisma:142-151`
- **Problem:** Cart has both `userId` (optional) and `sessionId` (optional). Architecture says "Unauthenticated users can browse and cart but must authenticate to checkout" but there's no documented strategy for merging guest carts into user carts on login.
- **Recommendation:** Document and implement the cart merge strategy. Add `@@index([sessionId])` for guest cart lookups.

### M10. No linting for feature boundary violations

- **File:** `eslint.config.mjs`
- **Problem:** ESLint config includes core-web-vitals and TypeScript rules but no `import/no-restricted-paths` or other module boundary enforcement.
- **Recommendation:** Add `eslint-plugin-import` and configure path restrictions. Features should not import from other features directly — only through shared types or API.

### M11. No `next-env.d.ts` in `.prettierignore`

- **File:** `.prettierignore`
- **Problem:** `next-env.d.ts` is auto-generated and changes per build. It's in `.gitignore` but not in `.prettierignore`, so Prettier may format it.
- **Recommendation:** Add `next-env.d.ts` to `.prettierignore`.

### M12. No test configuration or test baseline

- **File:** `package.json:5-11`
- **Problem:** No test script, no test framework installed. Vitest and Playwright are listed as "to be installed" in `stack.md`. Without tests, there's no regression safety net for the upcoming feature development.
- **Recommendation:** Install Vitest and write smoke tests for validation schemas and auth config before feature work begins.

---

## Low Severity Issues

### L1. Default Next.js public assets not cleaned

- **File:** `public/`
- **Problem:** Five default Vite/Next.js SVGs remain (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`). Not relevant to e-commerce branding.
- **Recommendation:** Remove unused default assets.

### L2. Body font-family fallback inconsistent with Geist

- **File:** `src/app/globals.css:23-25`
- **Problem:** `body { font-family: Arial, Helvetica, sans-serif; }` — this hardcoded fallback bypasses the Geist font configured via CSS variables. The `@theme inline` sets `--font-sans` but body doesn't use it.
- **Recommendation:** Use `font-family: var(--font-sans);` in body.

### L3. No Prettier check in CI/lint workflow

- **File:** `package.json:9`
- **Problem:** `lint` script runs ESLint only. No `prettier --check` to enforce formatting consistency.
- **Recommendation:** Add `"format:check": "prettier --check ."` script and integrate into CI.

### L4. No explicit `cwd` for `@tailwindcss/postcss`

- **File:** `postcss.config.mjs`
- **Problem:** Minimal PostCSS config. No content paths specified (Tailwind v4 auto-discovers but explicit config is more predictable).
- **Recommendation:** Add `@tailwindcss/postcss` with explicit source configuration once the UI component structure is settled.

### L5. CUID IDs may cause issues at scale

- **File:** `prisma/schema.prisma` (all models)
- **Problem:** `@default(cuid())` — CUIDs are 25-character strings, larger than UUIDs, and have no inherent ordering. At scale, this affects index performance and sorting.
- **Recommendation:** Consider `cuid2()` (shorter, more collision-resistant) or `uuid()` for ID generation. For Order IDs, consider sequential order numbers (`ORD-000001`).

### L6. No `ts-node` or `tsx` configured for seed script

- **File:** `prisma/seed.ts`
- **Problem:** The seed script is TypeScript but there's no `ts-node` or `tsx` in `devDependencies` and no `"prisma": { "seed": "..." }` in `package.json`. Seed must be run manually with `npx tsx prisma/seed.ts`.
- **Recommendation:** Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to `package.json` and add `tsx` as a dev dependency.

---

## Strengths (What's Done Well)

- **Auth architecture split:** `auth.config.ts` (stateless) vs `auth.ts` (full NextAuth with adapter) is correct for Edge Runtime compatibility.
- **Proxy middleware:** Using Next.js 16 proxy.ts for route protection is the correct modern pattern.
- **Prisma singleton:** Global caching of Prisma client prevents hot-reload connection leaks.
- **Zod validation layer:** Reusable validation schemas in `src/shared/lib/validation.ts` is a solid foundation.
- **Feature-driven structure:** The `features/` directories with subdirectories (components, hooks, services, schemas, types, tests) is well-designed.
- **Route groups:** Using `(auth)`, `(marketing)`, `(store)` route groups for logical separation.
- **Database schema:** Well-normalized with proper foreign keys, cascade deletes, and audit timestamps. Order status as enum is correct.
- **TypeScript configuration:** Strict mode with `strictNullChecks` and `noUncheckedIndexedAccess`.
- **ESLint flat config:** Modern `eslint.config.mjs` with Prettier integration.
- **Price in cents:** Integer-based pricing is the correct approach.
- **Idempotent seed script:** Checks for existing data before seeding.
- **Clean build:** `lint`, `typecheck`, and `build` all pass cleanly.

---

## Architecture Compliance Scorecard

| Dimension | Status | Notes |
|-----------|--------|-------|
| Feature isolation | ⚠️ Partial | Dirs exist but no barrel exports, no boundary enforcement |
| Server/Client separation | ✅ Good | RSC-compatible by default, auth split correct |
| Layer separation | ✅ Good | Service layer planned, no business logic in route handlers yet |
| Data flow direction | ✅ Good | Architecture diagram is clean |
| Error handling | ❌ Missing | No error boundaries, no API error response format implemented |
| State management | ⚠️ Planned | TanStack Query planned but not installed |
| Auth security | ⚠️ Partial | Missing rate limiting, session TTL, signIn callback |
| Input validation | ✅ Good | Zod shared layer exists, auth schemas use it |
| Database indexing | ❌ Incomplete | Only unique indexes exist |
| API consistency | ❌ Missing | No response envelope helpers implemented |
| Performance optimization | ❌ None | No caching, image optimization, or streaming configured |
| Security headers | ❌ Missing | No CSP, HSTS, or other security headers |
| Testing | ❌ Missing | No test framework or tests |
| CI/CD | ❌ Missing | No GitHub Actions or deployment config |
| Commit hygiene | ❌ Critical | Secrets committed |
