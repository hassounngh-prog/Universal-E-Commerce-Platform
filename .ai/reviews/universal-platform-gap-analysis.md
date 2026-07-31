# Universal Platform Gap Analysis

> Date: 2026-07-30
> Status: Complete
> Compares current architecture against Universal Platform vision (`project/universal-platform.md`)

---

## Executive Summary

| Dimension | Current State | Universal Target | Gap Severity |
|-----------|--------------|------------------|-------------|
| Project Identity | Anime-specific | Business-agnostic platform | CRITICAL |
| Database Schema | Physical goods only | Multi-type, extensible | CRITICAL |
| Provider Abstractions | None (direct Supabase refs) | Plugin-based providers | CRITICAL |
| Product System | Hardcoded fields | EAV / custom attributes | CRITICAL |
| Architecture Layers | 3 tiers (app/features/shared) | 7 tiers (+ core/infrastructure/plugins/config) | HIGH |
| Multi-tenant / White Label | Not supported | Tenant-isolated, config-driven branding | HIGH |
| Pricing Engine | Single price integer | Tiered, sale, wholesale, multicurrency | HIGH |
| Internationalization | Not addressed | Multi-language, RTL, localization | HIGH |
| Shipping | Not implemented | Provider-plugin architecture | HIGH |
| Tax Engine | Not implemented | Abstracted, region-configurable | HIGH |
| Search | Not implemented | Provider-swappable | HIGH |
| Notifications | Not implemented | Multi-channel provider interface | HIGH |
| API Standards | `{ data, error, meta }` (not implemented) | `{ success, data, error, meta }` with codes | MEDIUM |
| Folder Structure | No core/, infrastructure/, plugins/ | Full 7-directory structure | MEDIUM |
| Feature Modules | 5 (products/cart/checkout/orders/auth) | 15+ (add brands/collections/reviews/coupons/cms/analytics) | MEDIUM |
| CMS | Not implemented | Full page/blog/content block system | MEDIUM |
| Plugin System | Not designed | Extension architecture | MEDIUM |
| Testing | Not started | Every layer testable | MEDIUM |
| Security Headers | Not configured | CSP, HSTS mandatory | MEDIUM |

---

## Domain Gap Analysis

### 1. Project Identity

| Aspect | Current | Required | Impact |
|--------|---------|----------|--------|
| Repository name | `AnimaxStore` | Platform-agnostic name | Rename required |
| Package name | `animaxstore` | Platform name (`@commerce/platform`) | Update package.json |
| Description | "anime and manga merchandise" | "Universal e-commerce platform" | All doc updates |
| Branding | Anime-specific | Configurable per tenant | Architecture change |
| Business terminology | "Anime", "Figures", "Apparel" | Generic commerce terms | Ubiquitous language rewrite |

### 2. Product System

| Capability | Current | Universal Target |
|-----------|---------|-----------------|
| Product types | Physical only | Physical, Digital, Service, Subscription, Bundle, Gift Card, Configurable |
| Variants | None (single product) | Variant model (size, color, etc.) |
| Attributes | None (hardcoded fields) | EAV pattern via Attribute + AttributeValue |
| Brand | None | Brand model with relationships |
| Collection | None (categories only) | Collection model (curated groups) |
| Custom fields | None | Dynamic metadata / JSON fields |
| Specifications | `metadata` JSON (unstructured) | Typed specification system |
| Media | Single ProductImage model | Polymorphic Media model |

### 3. Pricing Engine

| Capability | Current | Universal Target |
|-----------|---------|-----------------|
| Base price | `price: Int` ✅ | Retained |
| Sale price | `compareAtPrice: Int?` (partial) | Full sale price with date ranges |
| Cost tracking | `costPrice: Int?` ✅ | Retained |
| Tier pricing | Not supported | Quantity-based tier pricing |
| Wholesale | Not supported | B2B pricing tiers |
| Multi-currency | Not supported | Currency conversion, per-tenant defaults |
| Tax modes | Not supported | Tax-inclusive / tax-exclusive |
| Scheduled pricing | Not supported | Date-range pricing rules |
| Price rules / coupons | Not supported | Discount engine |

### 4. Database Schema

| Model | Current | Universal Gap |
|-------|---------|--------------|
| Product | Physical goods only | Missing: type discriminator, variant support, attribute system |
| Variant | ❌ Missing | Sku, price, image, attributes, stock per variant |
| Attribute | ❌ Missing | Name, type, options, validation |
| AttributeValue | ❌ Missing | Value, product/variant binding |
| Brand | ❌ Missing | Name, logo, description, website |
| Collection | ❌ Missing | Products, type (manual/automated), rules |
| Coupon | ❌ Missing | Code, type (percentage/fixed), conditions, usage limits |
| TaxRate | ❌ Missing | Region, rate, type (VAT/GST/sales), compound |
| TaxZone | ❌ Missing | Geographic area → rates mapping |
| ShippingZone | ❌ Missing | Region → rates/methods mapping |
| ShippingRate | ❌ Missing | Method, price, conditions, carrier |
| Review | ❌ Missing | Rating, content, product, user, moderation |
| CMS Page | ❌ Missing | Slug, content, metadata, template |
| Blog Post | ❌ Missing | Title, content, author, publish date |
| ContentBlock | ❌ Missing | Key, type, value, localization |
| Tenant / Store | ❌ Missing | Name, domain, settings, branding |
| Notification | ❌ Missing | Type, channel, template, status |
| AuditLog | ❌ Missing | Actor, action, resource, changes |
| SoftDelete | ❌ Not used | `deletedAt` on all core models |
| Address | ✅ Exists | Needs phone, email, company fields |
| Order | ✅ Exists | Needs tax breakdown, shipping method ref |
| OrderItem | ✅ Exists | Needs variant ref, tax breakdown |
| Cart | ✅ Exists | Needs merged with guest strategy |

### 5. Architecture Layers

Layers specified by universal platform vs current:

```
Universal Target:               Current:
┌──────────────────────┐       ┌──────────────────────┐
│ Application           │       │ Application           │
│  ├─ Store            │       │  ├─ (marketing)       │
│  ├─ Admin            │       │  ├─ (store)           │
│  ├─ API              │       │  ├─ (auth)            │
│  └─ CMS              │       │  ├─ account/          │
├──────────────────────┤       │  ├─ admin/            │
│ Business Config      │       │  └─ api/              │
├──────────────────────┤       ├──────────────────────┤
│ Commerce Core         │       │ Features              │
│  ├─ Products         │       │  ├─ products          │
│  ├─ Cart             │       │  ├─ cart              │
│  ├─ Checkout         │       │  ├─ checkout          │
│  ├─ Orders           │       │  ├─ orders            │
│  └─ ...              │       │  └─ auth              │
├──────────────────────┤       ├──────────────────────┤
│ Shared Platform       │       │ Shared                │
├──────────────────────┤       ├──────────────────────┤
│ Infrastructure        │       │ (none — ad-hoc)       │
└──────────────────────┘       └──────────────────────┘
```

Missing:
- **Commerce Core** (`src/core/`): Business-agnostic commerce engine. No domain-specific logic.
- **Infrastructure** (`src/infrastructure/`): Provider implementations (stripe, supabase storage, algolia).
- **Plugins** (`src/plugins/`): Extension system for wishlist, affiliate, loyalty, etc.
- **Config** (`src/config/`): Tenant/store configuration, feature flags.

### 6. Provider Abstractions

| Provider | Current | Universal Target |
|----------|---------|-----------------|
| Payment | TBD placeholder | Interface: `PaymentProvider` with create/refund/webhook |
| Storage | Direct Supabase reference | Interface: `StorageProvider` with upload/delete/serve |
| Search | Not designed | Interface: `SearchProvider` with index/query/facets |
| Shipping | Not designed | Interface: `ShippingProvider` with rates/tracking |
| Email | Not designed | Interface: `NotificationChannel` with send/delivery |
| SMS | Not designed | Same notification interface |
| Tax | Not designed | Interface: `TaxProvider` with calculate |
| Auth | NextAuth.js ✅ | Extensible via NextAuth providers |
| Database | PostgreSQL + Prisma ✅ | Replaceable via Prisma adapter |

Current: Tight coupling to Supabase (storage, database).
Target: Every provider behind an interface, swappable via configuration.

### 7. Missing Feature Modules

| Module | Current | Priority | Depends On |
|--------|---------|----------|-----------|
| brands/ | ❌ Missing | Medium | products |
| collections/ | ❌ Missing | Medium | products |
| reviews/ | ❌ Missing | Medium | products, orders |
| coupons/ | ❌ Missing | High | checkout, pricing |
| cms/ | ❌ Missing | High | core platform |
| search/ | ❌ Missing | High | products |
| notifications/ | ❌ Missing | High | orders |
| analytics/ | ❌ Missing | Low | orders |
| settings/ | ❌ Missing | High | admin |
| shipping/ | ❌ Missing | High | checkout |
| tax/ | ❌ Missing | High | checkout, pricing |

### 8. Configuration / White Label

| Area | Current | Universal Target |
|------|---------|-----------------|
| Store name | Hardcoded | Configurable per tenant |
| Logo | None | Configurable |
| Theme | Default Tailwind | Full theme tokens (colors, fonts, spacing) |
| Navigation | Not designed | Configurable menu system |
| Footer | Not designed | Configurable content |
| Homepage | Static placeholder | Configurable layout |
| Social links | None | Configurable |
| SEO defaults | Static metadata | Per-tenant dynamic |
| Legal pages | None | Configurable content |
| Currencies | USD hardcoded | Per-tenant configurable |
| Languages | English only | Per-tenant configurable |
| Business domain | Anime | Configurable per tenant |

---

## Breaking Changes Required

| Change | Impact | Migration Risk |
|--------|--------|---------------|
| Database schema rewrite | All current queries, seed data, migration history | HIGH — requires migration reset |
| Product model restructure | Product features, API, UI | HIGH — core domain change |
| Provider abstraction layer | All direct Supabase imports | MEDIUM — interface extraction |
| Architecture layer addition | Folder restructure, import paths | MEDIUM — import path changes |
| Package/project rename | CI/CD, environment, domain | LOW — isolated to config |
| API response format change | All future route handlers | LOW — not yet implemented |

---

## Migration Strategy

The platform should NOT be rewritten from scratch. Instead:

```
Phase 0: Rename & identity change
Phase 1: Architecture layer creation (core/, infrastructure/, plugins/)
Phase 2: Provider interface definitions
Phase 3: Database schema extension (additive, non-breaking)
Phase 4: Feature module additions
Phase 5: White-label / configuration system
Phase 6: Plugin architecture
```

All existing code remains compatible during migration. The current feature modules become wrappers that use the new core layer.
