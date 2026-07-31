# Known Issues

## Purpose

This document records all known issues that affect the project.

---

# Current Issues

## Critical (Unresolved)

- **Secrets committed to git** — `.env` and `.env.local` contain `AUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and database password in plaintext. Must rotate credentials and remove from tracking before any deployment.
- **Supabase Service Role exposed** — Full-admin credential committed in `.env.local`. Bypasses all Row-Level Security.

## High (Unresolved)

- No security headers (CSP, HSTS, X-Frame-Options) configured in `next.config.ts`
- No rate limiting on auth endpoints — brute force possible
- No session TTL / maxAge configured — JWT tokens valid for 30 days by default
- No signIn callback for pre-auth checks (email verification, ban status)
- No brute-force protection on password comparison
- No production-ready build configuration in `next.config.ts`
- No API response envelope implemented — inconsistent patterns will emerge
- No barrel exports (`index.ts`) in feature modules — internals fully exposed

## Medium (Unresolved)

- No root error/loading/not-found pages
- `tsconfig.json` targets ES2017 instead of ES2022
- Zod v4 API compatibility not verified
- No Prisma `previewFeatures` or optimized config
- No database indexes beyond unique constraints
- Key fields missing from address models (phone, email)
- No email verification flow designed
- No guest cart merge strategy documented
- No ESLint boundary enforcement (`import/no-restricted-paths`)
- `next-env.d.ts` not in `.prettierignore`
- No test configuration or test baseline

## Low (Unresolved)

- Default Next.js public SVGs not cleaned
- Body font-family fallback inconsistent with Geist
- No Prettier check in CI/lint workflow
- No explicit PostCSS content paths
- CUID IDs may cause index performance issues at scale
- No `tsx` configured for seed script in package.json

---

# Documented in Architecture Review

Full findings with scores and remediation in `.ai/reviews/final-architecture-review.md` (2026-07-30).

---

# Resolved

- **Plugin architecture** — Specified in `.ai/specs/plugin-system.md` (2026-07-30)
- **DI container approach** — Documented in `.ai/project/dependency-injection.md` — Manual DI with Container Registry (2026-07-30)
- **Multi-tenancy isolation strategy** — Documented in ADR-009, `.ai/project/decisions.md` (2026-07-30)
 - **`memory/decisions-history.md`** — Created to satisfy reference in `core/decision-making.md` (2026-07-30)
 - **HookRegistry/EventBus Clean Architecture violation** — Interfaces moved from `src/plugins/` to `src/core/plugin/`, Core imports Core-level contracts (2026-07-30)
 - **`getPaymentProvider` → `container.resolve`** — `architecture.md` updated to use DI container instead of ad-hoc function call (2026-07-30)
 - **Missing plugins in directory tree** — `pos`, `ai-recommendations` added to plugin list in `architecture.md` (2026-07-30)
 - **`src/providers/` undefined** — Defined as React Context providers (auth, tenant, theme, cart) in `architecture.md` tree (2026-07-30)
 - **Container `singleton` dead parameter** — Removed from `register()` signature, non-singleton branch eliminated per YAGNI (2026-07-30)
 - **Auth provider not registered** — Added `AuthProvider` registration to `dependency-injection.md` (2026-07-30)
 - **V1 hook/event scope overbuild** — Reduced from 16→5 hook points and 12→4 events in `plugin-system.md` (2026-07-30)
