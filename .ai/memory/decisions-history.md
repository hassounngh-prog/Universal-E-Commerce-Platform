# Decisions History

> This file exists to satisfy the reference in `ai/core/decision-making.md` (lines 340, 360).
> Formal ADRs are recorded in `ai/project/decisions.md`.

---

## Purpose

This file records technical decisions that do not warrant a full ADR (Architecture Decision Record) but are important enough to document for historical context. ADR-worthy decisions (architecturally significant) go to `ai/project/decisions.md`.

---

## Current Status

All architecturally significant decisions have been recorded as ADRs in `ai/project/decisions.md`:

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | Adopt Next.js App Router with Feature-Driven Architecture | Implemented |
| ADR-002 | PostgreSQL with Prisma ORM | Implemented |
| ADR-003 | Co-located API Routes with Next.js Route Handlers | Accepted |
| ADR-004 | Auth.js for authentication | Accepted |
| ADR-005 | proxy.ts as middleware strategy | Accepted |
| ADR-006 | Universal E-Commerce Platform architecture | Accepted |
| ADR-007 | Provider Interface pattern | Accepted |
| ADR-008 | EAV with JSONB hybrid for product attributes | Accepted |
| ADR-009 | Multi-Tenancy: Shared Database with Tenant ID Isolation | Accepted |
| ADR-010 | `src/config/` is the Dependency Composition Root | Implemented |
| ADR-011 | Product Attribute System co-located in `src/core/product/` | Implemented |
| ADR-012 | `ProductRepository.setAttributeValues` as additive repository contract extension | Implemented |
| ADR-013 | Map Prisma `P2002` to `ConflictError` for product/attribute persistence | Implemented |

---

## Historical Decisions

*No historical decisions recorded yet. This file was created on 2026-07-30 to resolve the missing reference in `core/decision-making.md`.*
