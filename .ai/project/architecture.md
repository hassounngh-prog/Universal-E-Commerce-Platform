# Universal Platform Architecture

---

# Architecture Philosophy

This is not a store architecture.

This is a **platform architecture** designed to power any e-commerce business through configuration, extension, and branding instead of code changes.

Every architectural decision optimizes for:
- Business-agnostic core
- Provider independence
- Plugin-based extensibility
- White-label multi-tenancy
- Long-term evolution

The platform must remain completely agnostic of which business it serves. Business-specific logic must never leak into the core platform.

---

# Universal Platform Layers

```
┌─────────────────────────────────────────────────────┐
│                    APPLICATION                       │
│  Storefront  │  Admin Panel  │  API  │  CMS          │
├─────────────────────────────────────────────────────┤
│              BUSINESS CONFIGURATION                  │
│  Tenant settings  │  Branding  │  Theme  │  Domains  │
├─────────────────────────────────────────────────────┤
│                   COMMERCE CORE                      │
│  Auth │ Products │ Cart │ Checkout │ Orders │        │
│  Pricing │ Inventory │ Shipping │ Taxes │ Search     │
├─────────────────────────────────────────────────────┤
│                  SHARED PLATFORM                      │
│  UI │ API Client │ Validation │ Types │ Hooks        │
├─────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE                       │
│  Database │ Storage │ Payment │ Search │ Email        │
├─────────────────────────────────────────────────────┤
│                  EXTERNAL SERVICES                    │
│  PostgreSQL │ Supabase │ Stripe │ Algolia │ AWS S3    │
└─────────────────────────────────────────────────────┘
```

Dependencies flow downward. Each layer has one responsibility. No layer may depend on a layer above it.

---

# Layer Definitions

## Application Layer

Responsible for:
- User-facing interfaces (storefront, admin, API, CMS)
- Route composition, layouts, pages
- Client-server interaction patterns
- SEO, metadata, performance optimization

This layer is tenant-aware. It reads business configuration and renders accordingly.

Contains:
- `src/app/` — Next.js App Router (pages, layouts, API routes)
- `src/app/(store)/` — Storefront routes
- `src/app/admin/` — Admin panel routes
- `src/app/api/` — Public and internal API routes

## Business Configuration Layer

Responsible for:
- Per-tenant store configuration
- White-label branding (name, logo, theme, colors, typography)
- Domain mapping and routing
- Feature flags per tenant
- Payment/shipping/tax provider selection
- Currency and locale settings

No code changes required to launch a new store. Everything is configuration-driven.

## Commerce Core Layer

Responsible for:
- Business-agnostic commerce engine
- Core domain entities and business rules
- Use case orchestration
- Domain events and workflows

This is the heart of the platform. It must never contain:
- Industry-specific assumptions ("anime", "fashion", "electronics")
- Provider-specific logic (Stripe, Supabase, Algolia)
- UI or presentation concerns

Modules:
- Authentication & Authorization
- User & Account management
- Product catalog (type-agnostic)
- Category, Collection, Brand management
- Dynamic Attribute system (EAV pattern)
- Pricing engine (tiered, sale, wholesale, multicurrency)
- Inventory & Warehouse management
- Cart (guest + authenticated, merge)
- Checkout pipeline (address → shipping → tax → payment → order)
- Order lifecycle & fulfillment
- Coupon & Discount engine
- Review & Rating system
- Search abstraction
- Notification orchestration
- CMS (pages, blog, content blocks)
- Media management
- Settings & Configuration

Contains:
- `src/core/` — Platform-internal directory

## Shared Platform Layer

Responsible for:
- Reusable UI primitives and components
- API client and HTTP utilities
- Shared hooks and composables
- Validation schemas and type definitions
- Utilities, constants, helpers

Contains:
- `src/shared/` — Existing shared directory

## Infrastructure Layer

Responsible for:
- Provider implementations (interfaces defined in core)
- Database access via Prisma
- Storage provider adapters
- Payment provider adapters
- Search provider adapters
- Shipping provider adapters
- Tax provider adapters
- Notification channel adapters
- Email, SMS, push implementations

Every provider must implement a common interface defined in the Core layer. No business logic lives here. Providers are swappable via configuration.

Contains:
- `src/infrastructure/` — Provider implementations

---

# Directory Structure

```
src/
├── app/                    # Application Layer (Next.js App Router)
│   ├── (store)/            # Storefront routes
│   ├── (auth)/             # Authentication routes
│   ├── account/            # User account routes
│   ├── admin/              # Admin panel routes
│   └── api/                # API route handlers
│
├── core/                   # Commerce Core (business-agnostic)
│   └── plugin/             # Plugin contract interfaces (HookRegistry, EventBus)
│   ├── auth/               # Auth interfaces and use cases
│   ├── product/            # Product domain + attribute system
│   ├── cart/               # Cart logic + merge strategy
│   ├── checkout/           # Checkout pipeline orchestration
│   ├── order/              # Order lifecycle
│   ├── pricing/            # Pricing engine + interfaces
│   ├── inventory/          # Inventory abstraction
│   ├── shipping/           # Shipping provider interface
│   ├── tax/                # Tax engine interface
│   ├── payment/            # Payment provider interface
│   ├── search/             # Search provider interface
│   ├── notification/       # Notification channel interface
│   ├── storage/            # Storage provider interface
│   ├── coupon/             # Discount engine
│   ├── review/             # Review system
│   ├── cms/                # Content management
│   ├── tenant/             # Multi-tenant configuration
│   └── user/               # User domain
│
├── features/               # Feature modules (tenant-aware wrappers)
│   ├── products/           # Product catalog feature UI
│   ├── cart/               # Cart feature
│   ├── checkout/           # Checkout feature
│   ├── orders/             # Orders feature
│   ├── auth/               # Auth feature
│   ├── brands/             # Brand management
│   ├── collections/        # Collection management
│   ├── reviews/            # Reviews feature
│   ├── coupons/            # Coupon management
│   ├── cms/                # CMS feature
│   ├── search/             # Search feature
│   ├── notifications/      # Notification management
│   └── settings/           # Admin settings
│
├── infrastructure/         # Provider implementations
│   ├── payment/            # Stripe, PayPal, etc.
│   ├── storage/            # Supabase, S3, Cloudinary, etc.
│   ├── search/             # Algolia, Meilisearch, PostgreSQL, etc.
│   ├── shipping/           # UPS, FedEx, DHL, etc.
│   ├── tax/                # VAT, Sales Tax, etc.
│   ├── notification/       # Email, SMS, Push, etc.
│   └── database/           # Prisma repository implementations
│
├── shared/                 # Reusable platform code
│   ├── ui/                 # UI primitives (shadcn/ui)
│   ├── api/                # API client + response helpers
│   ├── lib/                # Utilities, validation, constants
│   ├── hooks/              # Shared React hooks
│   ├── types/              # Shared TypeScript types
│   └── config/             # Shared configuration
│
├── plugins/                # Optional extensions
│   ├── wishlist/           # Wishlist plugin
│   ├── affiliate/          # Affiliate program
│   ├── loyalty/            # Loyalty points
│   ├── gift-card/          # Gift card support
│   ├── marketplace/        # Multi-vendor marketplace
│   ├── wholesale/          # B2B wholesale
│   ├── subscription/       # Subscription commerce
│   ├── pos/                # Point of sale integration
│   └── ai-recommendations/ # ML product recommendations
│
├── providers/              # React Context providers (auth, tenant, theme, cart)
│
└── config/                 # Application-wide configuration
    ├── tenant/             # Tenant definitions
    ├── features/           # Feature flags
    └── platform/           # Platform settings
```

---

# Data Flow

```
User Action → Page/Component → Feature Module → Core Use Case → Repository (interface)
                                                                        ↓
                                                           Infrastructure (implementation)
                                                                        ↓
                                                           External Service (DB, API, etc.)
```

All data flow passes through the Core layer. Features access core use cases. Core defines interfaces. Infrastructure implements those interfaces.

---

# State Management

Priority:
1. Local component state
2. TanStack Query (server state)
3. React Context (auth, tenant, theme)
4. Zustand (complex client state only when justified)

---

# API Architecture

RESTful routes with standardized response format:

```ts
{
  success: boolean,
  data: unknown,
  error: {
    code: string,
    message: string
  } | null,
  meta: {
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    },
    timestamp: string,
    requestId: string
  }
}
```

Version-ready API design (`/api/v1/...`).

---

# Provider Interface Pattern

Every external provider must follow this pattern:

```ts
// Core defines the interface
interface PaymentProvider {
  createPayment(amount: number, currency: string): Promise<PaymentResult>;
  capturePayment(id: string): Promise<PaymentResult>;
  refundPayment(id: string, amount?: number): Promise<PaymentResult>;
  handleWebhook(payload: unknown): Promise<WebhookResult>;
}

// Infrastructure implements it
class StripeProvider implements PaymentProvider { /* ... */ }
class PayPalProvider implements PaymentProvider { /* ... */ }

// Container resolves the active provider
const provider = container.resolve<PaymentProvider>('payment');
```

---

# Plugin Architecture

- Core must never depend on plugins
- Plugins may depend on Core
- Plugins register via a plugin registry
- Each plugin is isolated with its own data, routes, UI
- Feature flags control plugin availability per tenant

---

# Architectural Constraints

- Never duplicate business logic across features
- No circular dependencies between layers
- Core layer never depends on Infrastructure
- Presentation never mixed with business logic
- No direct database access from UI
- Feature modules never import other feature internals
- All provider access goes through interfaces defined in Core
- Secrets never stored in client-side code
- Business domain assumptions never leak into Core
