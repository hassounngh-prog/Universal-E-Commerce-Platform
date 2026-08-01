# Current Project State

---

# Last Updated

Date: 2026-07-31

Updated By: AI Agent

---

# Current Phase

Phase 3 — Core Engine Layer. Universal platform architecture is **FROZEN** as of 2026-07-31; Core services are being implemented against frozen provider contracts.

---

# Current Priorities

1. Implement remaining Phase 3 Core services (3.6 ShippingService, 3.7 TenantService, 3.9 CollectionService, 3.10 ReviewService)
2. Complete unit tests for every Core service (3.11)
3. Write integration tests for provider pipelines (3.12)
4. Preserve Core purity: `src/core/` depends only on Core contracts + Shared primitives/errors, never Infrastructure
5. Keep `npm run build`, typecheck, lint, prisma validate green

---

# Current Focus

Phase 3 Core Engine in progress. Tasks 3.1–3.5 complete: ProductService (CRUD + EAV), CartService (guest/authenticated merge, pricing), OrderService (creation, payment, fulfillment, tax, shipping) — **AAB APPROVED**, PricingEngine, PaymentService (thin PaymentProvider orchestration). Reconciliation report delivered; governance closure recorded as ADR-011/012/013. Next task: **3.6 ShippingService**.

---

# Recently Completed

- **Task 3.5 PaymentService** (2026-07-31): `src/core/payment/payment-service.interface.ts`, `default-payment-service.ts`, `default-payment-service.test.ts` (24 tests); container wired (`KEYS.paymentService`, factory resolves `PaymentProvider`); `container.test.ts` extended. Thin, order-agnostic orchestration — validates input → delegates to `PaymentProvider` → returns results unchanged. No order/repo access, no webhook infra, stateless, provider-agnostic. OrderService untouched.
- **AAB review Phase 3.3 OrderService** (2026-07-31): **APPROVED** (0 blockers). 2 ACCEPTABLE TECHNICAL DEBT + 2 COSMETIC findings — see `known-issues.md`.
- **Governance closure** (2026-07-31): ADR-011 (attribute module co-located in `src/core/product/`), ADR-012 (`setAttributeValues` additive contract), ADR-013 (Prisma P2002 → ConflictError). All Status: Implemented. Verified against code before recording.
- **Phase 3 reconciliation** (2026-07-31): `.ai/reviews/universal-platform-roadmap.md` status table; 3.1–3.4 done, 3.5–3.7/3.9/3.10/3.12 unimplemented, 3.11 partial.
- **Tasks 3.1–3.4** (2026-07-31): ProductService (d0cf191/665b3b9), CartService (cdd491e), OrderService (79dc4a3 = HEAD), PricingEngine (f54ce8a). Order/pricing suites 45/45; full suite 215 tests / 20 files at that point.
- **Phase 0 / freeze** (2026-07-31): layer dirs, six provider interfaces, plugin contracts + registry, `src/config/{platform,tenant}.config.ts`, shared base files, security headers, JWT TTL 7d, ESLint layer zones. Architecture FROZEN.

---

# In Progress

Task 3.6 ShippingService (next, not started).

---

# Blockers

None

---

# Upcoming Work

1. Task 3.6 ShippingService — orchestrates ShippingProvider for rate calculation/label creation
2. Task 3.7 TenantService — configuration loading, domain resolution
3. Task 3.9 CollectionService, Task 3.10 ReviewService
4. Task 3.11 unit tests for every Core service; Task 3.12 provider pipeline integration tests
5. Commit uncommitted Phase 2/3 WIP (provider impls, prisma schema, PaymentService) at the appropriate checkpoint
6. Address `npm audit` findings (defer vs. fix decision still open)

---

# Known Issues

See `.ai/memory/known-issues.md`. Accepted (non-blocking) technical debt from OrderService AAB review: (1) `OrderService.update()` bypasses the `TRANSITIONS` state machine for status/timestamp fields; (2) provider side-effects run before transition validation in OrderService payment/fulfillment methods; (3) `resolveDimensions` casts JSONB without runtime validation; (4) OrderRepository lacks P2002 mapping (out of ADR-013 scope, mitigated by order-number pre-check + retry + ConflictError).

---

# Technical Debt

Low. Accepted debt above; Core purity enforced via ESLint `import/no-restricted-paths` + manual rg guard.

---

# Current Feature Status

| Feature              | Status      | Notes                                   |
|----------------------|-------------|-----------------------------------------|
| Documentation        | Complete    | Architecture frozen; decisions/memory maintained |
| Scaffolding          | Complete    | Next.js + tooling set up                |
| Layer Structure      | Complete    | Core/Infrastructure/Config + contracts  |
| Database Schema      | Partial     | Order/SearchDocument added; more extension pending |
| Authentication       | Complete    | NextAuth.js v5 + credentials provider   |
| Core Interfaces      | Complete    | 6 provider interfaces frozen            |
| PaymentService       | Complete    | 3.5 — thin PaymentProvider orchestration |
| ProductService       | Complete    | 3.1 — CRUD + EAV + attributes           |
| CartService          | Complete    | 3.2 — guest/authenticated merge         |
| OrderService         | Complete    | 3.3 — AAB APPROVED                      |
| PricingEngine        | Complete    | 3.4 — pricing/coupons/tax               |
| ShippingService      | Planned     | 3.6 — next                              |
| TenantService        | Planned     | 3.7                                    |
| CollectionService    | Planned     | 3.9                                    |
| ReviewService        | Planned     | 3.10                                   |
| Provider Impls       | Partial     | Stripe/Search/Tax WIP uncommitted       |
| Multi-tenant         | Planned     | Configuration-driven                    |
| Plugin System        | Planned     | Extension registry                      |

---

# Environment Status

Development: Running against Supabase PostgreSQL (project: dntivcvhbwslsimvibmy)
Testing: 239 tests / 21 files passing (`npx vitest run`)
Production: Not Deployed

---

# Open Decisions

- Search provider roadmap (PostgreSQL FTS → Meilisearch → Algolia)
- Internationalization library
- `npm audit` findings: defer vs. fix
- Commit strategy for uncommitted Phase 2/3 WIP

---

# Notes for Next Session

Phase 3 Core Engine in progress. PaymentService (3.5) complete and verified (239/239 tests, typecheck/lint/build/prisma-validate green, no infra imports in `src/core/payment/`). OrderService AAB-approved with accepted debt tracked in known-issues.md. Next task is **3.6 ShippingService** — same rules apply: thin provider orchestration in `src/core/shipping/`, constructor DI, typed platform errors, no OrderService duplication, frozen contracts untouched, output plan before code. Uncommitted WIP (provider impls, prisma schema extension, PaymentService) awaits a commit checkpoint.
