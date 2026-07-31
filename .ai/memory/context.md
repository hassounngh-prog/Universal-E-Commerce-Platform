# Project Context

---

# Project Identity

## Name

CommerceCore — Universal E-Commerce Platform

## Short Description

CommerceCore is a production-grade universal e-commerce platform that powers virtually any online business through configuration, extension, and branding instead of code changes. Supports physical goods, digital products, services, subscriptions, and more across any industry.

---

# Business Domain

Universal e-commerce — business-agnostic platform.

Key concepts:
- Products are typed (physical, digital, service, subscription) with dynamic attributes per industry.
- Categories organize products by type, industry, or custom grouping.
- Collections curate products manually or via rules.
- Orders represent completed purchases with line items, tax breakdown, and shipping.
- Cart is a temporary collection before checkout, mergable across guest/authenticated sessions.
- Tenants represent individual stores with independent configuration, branding, and domains.

---

# Business Terminology

| Preferred             | Avoid                   |
| --------------------- | ----------------------- |
| Product               | Item, Article           |
| Product Type          | Category (when meaning type) |
| Attribute             | Field, Property         |
| Attribute Value       | Value, Option           |
| Variant               | SKU, Option Combination |
| Collection            | Group, Set              |
| Tenant                | Store, Site             |
| Order                 | Purchase, Invoice       |
| Customer              | User, Client            |
| Provider              | Service, Integration    |
| Provider Interface    | Adapter, Driver         |

---

# Business Assumptions

- One email per customer account.
- A customer may own multiple orders.
- A product belongs to exactly one category.
- A product may have multiple attributes (industry-defined).
- Prices stored in cents (smallest currency unit).
- Multi-currency support via conversion or per-tenant defaults.
- Unauthenticated users can browse and cart but must authenticate to checkout.
- Guest carts merge into user carts on login.
- Each tenant has independent configuration (branding, providers, domains).
- Providers (payment, storage, search, shipping, tax) are swappable via configuration.

---

# Project Conventions

- Feature directories use singular form (`products/`, `cart/`).
- Database tables use `snake_case`.
- Components use `PascalCase.tsx`.
- Files use `camelCase.ts`.
- Route segments use `kebab-case`.
- Features expose only their `index.ts` as public API.
- Core layer directories use singular form (`product/`, `order/`, `payment/`).
- Provider interfaces use `Provider` suffix (`PaymentProvider`, `StorageProvider`).
- Provider implementations use provider name prefix (`StripeProvider`, `SupabaseStorageProvider`).

---

# User Roles

- **Guest** — Browse, view products, add to local cart. Cannot checkout.
- **Customer** — All guest capabilities, persistent cart, place/track orders.
- **Administrator** — All customer capabilities, manage products/categories/orders/tenants/plugins.

---

# External Systems

- **Database** — PostgreSQL via Supabase (swappable).
- **Storage** — Supabase Storage initially (abstracted via StorageProvider interface).
- **Payment** — Stripe initially (abstracted via PaymentProvider interface).
- **Search** — PostgreSQL Full Text initially (abstracted via SearchProvider interface).
- **Email** — TBD (abstracted via NotificationChannel interface).

---

# Supported Platforms

Desktop (1024px+), Tablet (768px-1023px), Mobile (320px-767px).
Browsers: Chrome, Firefox, Safari, Edge (latest 2 versions).

---

# AI Loading Order

1. `AGENT.md`
2. `core/`
3. `project/overview.md`
4. `project/architecture.md`
5. `project/stack.md`
6. `project/universal-platform.md`
7. `memory/context.md`
8. `memory/current-state.md`
9. Relevant specs and ADRs
