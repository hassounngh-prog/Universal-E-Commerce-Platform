# Implementation Roadmap — Post-Audit (SUPERSEDED)

> **⛔ DEPRECATED**: This roadmap was produced before the Universal Platform Architecture decision (ADR-006).
> It is superseded by `reviews/universal-platform-roadmap.md`, which includes all security
> hardening, foundation work, and feature development within the new universal platform layers.
> This file is retained for reference but should not be followed.

Prioritized by impact and dependency order. Each phase must be completed before the next begins.

---

## Phase 0: Security Critical (Do Immediately)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 0a | Rotate all exposed credentials | Supabase Dashboard + `.env.local` | 15min |
| 0b | Remove `.env` and `.env.local` from git tracking | `git rm --cached .env .env.local` | 2min |
| 0c | Verify `.gitignore` prevents re-committing | `.gitignore` (already has `.env*`) | 1min |
| 0d | Add `.env.local` to `.gitignore` explicitly (it's currently covered by `.env*` but verify) | `.gitignore` | 1min |

**Exit criteria:** No secrets in git history (or at minimum, HEAD has no secrets).

---

## Phase 1: Security Hardening (Before Any Feature Code)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1a | Add security headers via `next.config.ts` | `next.config.ts` | 15min |
| 1b | Add session `maxAge` (24h) and `updateAge` | `src/auth.config.ts` | 5min |
| 1c | Add `signIn` callback with email verification gate | `src/auth.config.ts` | 10min |
| 1d | Configure security headers in next.config | `next.config.ts` | 15min |
| 1e | Add rate limiting for auth routes | New middleware or edge function | 1hr |

**Exit criteria:** Auth config hardened, security headers served, rate limiting active.

---

## Phase 2: Foundation Hardening (One Session)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 2a | Clean `next.config.ts` (remove `turbopack.root`, add production config) | `next.config.ts` | 10min |
| 2b | Update `tsconfig.json` target to ES2022 | `tsconfig.json:3` | 1min |
| 2c | Add Prisma indexes for query performance | `prisma/schema.prisma` | 15min |
| 2d | Add `index.ts` barrel exports for all 5 features | `src/features/*/index.ts` | 10min |
| 2e | Create root `error.tsx`, `loading.tsx`, `not-found.tsx` | `src/app/` | 15min |
| 2f | Create API response envelope helpers | `src/shared/api/response.ts` | 15min |
| 2g | Create shared config constants | `src/shared/config/site.ts` | 10min |
| 2h | Clean up default public SVGs | `public/` | 2min |
| 2i | Fix body font-family to use CSS variable | `src/app/globals.css` | 2min |

**Exit criteria:** Build passes, lint passes, no warnings, foundation ready for features.

---

## Phase 3: Testing Scaffold

| # | Task | Files | Effort |
|---|------|-------|--------|
| 3a | Install Vitest + config | `package.json`, `vitest.config.ts` | 15min |
| 3b | Write smoke tests for Zod schemas | `src/shared/lib/__tests__/validation.test.ts` | 20min |
| 3c | Write auth callback tests | `src/features/auth/tests/` | 30min |
| 3d | Add `"prisma": { "seed": "tsx prisma/seed.ts" }` to package.json | `package.json` | 2min |
| 3e | Add `prettier --check` to CI script | `package.json` | 2min |
| 3f | Add `.prettierignore` entries | `.prettierignore` | 1min |

**Exit criteria:** `npm test` passes, coverage > 0%.

---

## Phase 4: Feature Development — Product Catalog

| # | Task | Files | Effort |
|---|------|-------|--------|
| 4a | Install shadcn/ui + configure | — | 15min |
| 4b | Install TanStack Query + configure provider | — | 15min |
| 4c | Install Lucide icons | — | 5min |
| 4d | Create shared UI primitives (Button, Input, Card, Badge, etc.) using shadcn | `src/shared/ui/` | 1hr |
| 4e | Create product API route handlers | `src/app/api/products/` | 1hr |
| 4f | Create product service layer | `src/features/products/services/` | 30min |
| 4g | Create product types and schemas | `src/features/products/types/`, `schemas/` | 20min |
| 4h | Create product hooks (useProducts, useProduct) | `src/features/products/hooks/` | 30min |
| 4i | Build product listing page | `src/app/(store)/products/page.tsx` | 1hr |
| 4j | Build product detail page | `src/app/(store)/products/[slug]/page.tsx` | 1hr |
| 4k | Build category filter/sidebar | `src/app/(store)/products/` | 45min |
| 4l | Add SEO metadata | product pages | 20min |

**Exit criteria:** Products browsable, filterable, searchable. Server components + client component composition working.

---

## Phase 5: Auth UI & Cart

| # | Task | Files | Effort |
|---|------|-------|--------|
| 5a | Build login page | `src/app/(auth)/login/page.tsx` | 30min |
| 5b | Build register page | `src/app/(auth)/register/page.tsx` | 30min |
| 5c | Install React Hook Form + integrate with Zod | — | 20min |
| 5d | Build auth forms with validation | `src/features/auth/components/` | 45min |
| 5e | Implement guest cart (session-based) | `src/features/cart/` | 1hr |
| 5f | Implement user cart (persistent) | `src/features/cart/` | 30min |
| 5g | Implement cart merge on login | `src/features/auth/services/` | 30min |
| 5h | Build cart UI (drawer or page) | `src/app/(store)/cart/` | 1hr |

**Exit criteria:** Register, login, logout working. Cart functional for both guest and authenticated users. Cart persists across login.

---

## Phase 6: Checkout & Orders

| # | Task | Files | Effort |
|---|------|-------|--------|
| 6a | Integrate Stripe (or other payment provider) | — | 2hr |
| 6b | Build checkout flow (address, payment, review) | `src/app/(store)/checkout/` | 2hr |
| 6c | Build order creation logic | `src/features/checkout/services/` | 1hr |
| 6d | Build order confirmation page | `src/app/(store)/orders/` | 30min |
| 6e | Build order history page | `src/app/account/orders/` | 30min |
| 6f | Build order detail page | `src/app/account/orders/[id]/` | 20min |

**Exit criteria:** Full checkout flow working, orders created in database, order history visible.

---

## Phase 7: Admin Panel

| # | Task | Files | Effort |
|---|------|-------|--------|
| 7a | Build admin layout with navigation | `src/app/admin/layout.tsx` | 30min |
| 7b | Build product management (CRUD) | `src/app/admin/products/` | 2hr |
| 7c | Build order management | `src/app/admin/orders/` | 1hr |
| 7d | Build category management | `src/app/admin/categories/` | 30min |
| 7e | Add admin-only route protection (already in proxy) | `src/proxy.ts` (verify) | 5min |

**Exit criteria:** Admin can manage products, view orders, manage categories.

---

## Phase 8: Deployment Readiness

| # | Task | Files | Effort |
|---|------|-------|--------|
| 8a | Set up GitHub Actions CI | `.github/workflows/` | 1hr |
| 8b | Configure Supabase Storage for product images | — | 1hr |
| 8c | Add image upload handling | `src/app/api/upload/` | 1hr |
| 8d | Add `output: "standalone"` to next.config | `next.config.ts` | 2min |
| 8e | Set up Docker configuration | `Dockerfile`, `docker-compose.yml` | 1hr |
| 8f | SEO audit and metadata completion | All pages | 1hr |
| 8g | Enable Supabase RLS on all tables | Supabase Dashboard | 30min |
| 8h | End-to-end testing with Playwright | `e2e/` | 3hr |

**Exit criteria:** Deployed to staging, E2E tests green, security audit passes.

---

## Immediate Next Action

1. Rotate credentials **now** — before any other work.
2. Then start Phase 1 (security hardening).
3. Then Phase 2 (foundation hardening).
4. Then Phase 3 (testing) before any feature code.
