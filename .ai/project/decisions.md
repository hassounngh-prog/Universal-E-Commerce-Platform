# Architecture Decision Records (ADR)

---

## ADR-001

### Title

Adopt Next.js App Router with Feature-Driven Architecture

### Status

Implemented

### Date

2026-07-30

### Context

Greenfield e-commerce platform. Architecture needs to support rapid initial development while scaling to a full-featured platform.

### Decision

Adopt Next.js 16 App Router as the full-stack framework with feature-driven directory organization. Pages use route groups; business logic lives in feature modules; shared code remains generic.

### Alternatives

- **Remix** — smaller ecosystem, lower team familiarity
- **CRA + separate backend** — deprecated, more infrastructure

### Consequences

Positive: Single framework, Server Components, file-based routing, streamlined Vercel deployment.
Negative: Co-located API routes may need extraction as the platform grows.

---

## ADR-002

### Title

PostgreSQL with Prisma ORM

### Status

Implemented

### Date

2026-07-30

### Context

Relational database required for products, users, orders, and cart data.

### Decision

PostgreSQL with Prisma ORM. All database access through Prisma Client; migrations via `prisma migrate`. Database access lives in the Infrastructure layer.

### Alternatives

- **MongoDB + Mongoose** — weaker relationships, no built-in migrations
- **Drizzle** — smaller ecosystem, less mature migration tooling

### Consequences

Positive: Type-safe queries, declarative schema, strong relational integrity.
Negative: Prisma abstraction can generate suboptimal queries for complex joins. Mitigated by repository pattern that allows optimization without changing business logic.

---

## ADR-003

### Title

Co-located API Routes with Next.js Route Handlers

### Status

Accepted

### Date

2026-07-30

### Context

API layer needed to serve the Next.js frontend and external clients.

### Decision

Use Next.js Route Handlers (`src/app/api/`) for the API layer. Route handlers delegate to Core use cases. Response format follows the platform standard `{ success, data, error, meta }`.

### Alternatives

- **Separate NestJS backend** — extra deployment, increased initial complexity
- **tRPC** — tighter coupling, less familiar

### Consequences

Positive: Fast initial velocity, single deployment target, Server Actions simplify forms.
Negative: Extracting to a separate backend later requires API abstraction work. API versioning strategy should be established early (`/api/v1/...`).

---

## ADR-004

### Title

Authentication via NextAuth.js (Auth.js)

### Status

Implemented

### Date

2026-07-30

### Context

User authentication required for accounts, order history, and admin access.

### Decision

NextAuth.js v5 with Prisma adapter and credentials provider. Authentication logic lives in the Core layer; NextAuth configuration is infrastructure.

### Alternatives

- **Clerk** — vendor lock-in, cost scales with users
- **Supabase Auth** — ties auth to Supabase

### Consequences

Positive: Open source, self-hosted, Prisma integration, flexible providers, supports OAuth/magic link/passkeys.
Negative: More setup than managed solutions.

---

## ADR-005

### Title

Next.js 16 Proxy Convention Adopted

### Status

Implemented

### Date

2026-07-30

### Context

Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`.

### Decision

Renamed `src/middleware.ts` to `src/proxy.ts`. Functionality preserved.

### Consequences

Positive: Follows Next.js 16 convention, no deprecation warnings.
Negative: None.

---

## ADR-006

### Title

Universal E-Commerce Platform Architecture

### Status

Accepted

### Date

2026-07-30

### Context

The project is transitioning from an anime-specific store to a universal e-commerce platform capable of powering any online business. The current architecture has hardcoded business assumptions, no provider abstractions, and no multi-tenant support.

### Decision

Adopt a layered architecture as defined in `project/architecture.md` and `project/universal-platform.md`:

- Application Layer — user-facing interfaces
- Business Configuration — per-tenant settings
- Commerce Core — business-agnostic engine
- Shared Platform — reusable utilities
- Infrastructure — provider implementations
- Plugins — isolated extensions

Key principles:
- Core must never contain business-specific assumptions
- All external providers behind interfaces defined in Core
- Infrastructure implements interfaces; Core depends only on interfaces
- Plugins extend without modifying Core
- Multi-tenant via configuration, not code duplication

### Alternatives

- **Keep current architecture** — would require rewrites for each new business domain
- **Monolithic store codebase** — violates DRY across multiple store deployments
- **Microservices from start** — premature complexity for current stage

### Consequences

Positive: Single platform serves unlimited business domains. Provider independence prevents vendor lock-in. Plugin system enables extensibility without core modification. White-label support for multi-tenant deployments.

Negative: Increased initial architectural complexity. Migration from current schema requires careful additive changes. Team must learn abstraction patterns.

### Migration Strategy

1. Create new layer directories (`src/core/`, `src/infrastructure/`, `src/plugins/`)
2. Define Core interfaces for each provider domain (payment, storage, search, shipping, tax, notification)
3. Implement first provider for each interface using existing dependencies
4. Extend database schema additively (no breaking changes to existing tables)
5. Add missing feature modules (brands, collections, coupons, reviews, CMS)
6. Build plugin system
7. Implement configuration-driven tenant system

---

## ADR-007

### Title

Provider Interface Pattern

### Status

Accepted

### Date

2026-07-30

### Context

The platform must support multiple payment, storage, search, shipping, tax, and notification providers without modifying business logic.

### Decision

Every external dependency must be accessed through a provider interface defined in `src/core/`. The Core layer defines the contract. Infrastructure implements it. Configuration selects the active provider at runtime.

### Pattern

```ts
// Core defines
interface PaymentProvider {
  createPayment(amount: number, currency: string): Promise<PaymentResult>;
}

// Infrastructure implements
class StripeProvider implements PaymentProvider {}
class PayPalProvider implements PaymentProvider {}

// Selection via config
const provider = container.resolve<PaymentProvider>("payment");
```

### Consequences

Positive: Zero business logic changes when switching providers. Clear separation of concerns. Testable via interface mocking.

Negative: More files per provider (interface + implementation). Runtime provider resolution adds minor complexity.

---

## ADR-008

### Title

Dynamic Attribute System (EAV Pattern)

### Status

Accepted

### Date

2026-07-30

### Context

Different industries require different product attributes (clothing: size/color, electronics: voltage/storage, books: ISBN/author). Hardcoding attributes per industry is not sustainable.

### Decision

Adopt an Entity-Attribute-Value (EAV) pattern for product attributes. Products have a base set of universal fields plus dynamic attributes defined per category or product type.

### Schema

```
Product (base fields: name, description, price, etc.)
  └── Attribute (name, type, validation, options)
        └── AttributeValue (value, productId, attributeId)
```

### Consequences

Positive: Any industry defines its own attributes without schema changes. Attributes are queryable and filterable. No hardcoded industry assumptions.

Negative: EAV queries are more complex. Requires careful indexing for performance. JSON aggregation may be needed for efficient listing queries.

### Mitigation

Use PostgreSQL JSONB for frequently-queried attribute sets with a GIN index. Reserve EAV for extensible/custom attributes. Combine with Prisma's JSON support for hybrid approach.

---

## ADR-009

### Title

Multi-Tenancy Architecture: Shared Database with Tenant ID Isolation

### Status

Accepted

### Date

2026-07-30

### Context

The universal platform must support multiple stores (tenants) from a single deployment. Each tenant needs independent branding, configuration, product catalog, orders, customers, and provider selection. The platform must also support single-tenant deployments (one store, one codebase).

The key architectural question is data isolation strategy: share a single database with tenant-scoped rows, use per-tenant schemas within one database, or use completely separate databases per tenant.

Additionally, how tenants are resolved (domain-based, path-based, header-based) and how tenant context flows through the system must be determined.

### Options

#### Option A: Shared Database with Tenant ID Column

Every tenant-scoped table has a `tenantId` column. All queries are filtered by `tenantId`. Row-Level Security (RLS) enforces isolation at the database level. Single deployment serves all tenants.

**Pros**:
- Single database to manage, backup, and monitor
- Zero infrastructure per new tenant
- Simple deployment model (one server, one DB)
- RLS provides defense-in-depth isolation
- Easy to evolve (add tables, indexes once)
- Single-tenant deployment = one tenant with fixed tenantId
- Lowest operational cost

**Cons**:
- Noisy neighbor: one tenant's load affects all others
- Migration risk: a bad migration impacts all tenants simultaneously
- Maximum scale lower than isolated databases
- Query complexity: all queries must include tenantId (mistakes cause data leaks)
- Harder tenant data portability (exporting one tenant's data)

#### Option B: Per-Tenant Schema (Shared Database, Separate Schemas)

Each tenant gets its own PostgreSQL schema (`tenant_<id>`) within the same database. Same migration runs against each schema. Same deployment.

**Pros**:
- Better data isolation than tenantId column
- Can restore individual tenants from backup
- No tenantId in every query (each query runs in tenant's schema)
- Easier tenant data export

**Cons**:
- Migration complexity: N schemas to migrate (slow at scale)
- Connection pooling: more schemas = more connections
- Schema cache pressure in PostgreSQL
- Cross-tenant reporting requires UNION ALL across schemas
- Operational complexity: schema-per-tenant management
- Not truly separable for single-tenant deployments

#### Option C: Separate Databases per Tenant

Each tenant gets its own PostgreSQL database (or Supabase project). Per-tenant deployment.

**Pros**:
- Complete data isolation
- Independent scaling per tenant
- No noisy neighbor
- Per-tenant backup/restore
- Zero migration risk across tenants

**Cons**:
- Highest operational cost
- Complex deployment orchestration
- Connection management overhead
- Cross-tenant features (marketplace, analytics) nearly impossible
- Significant infrastructure per new tenant
- Single-tenant overkill for small stores

### Decision

**Option A: Shared Database with Tenant ID Column**

The platform uses a single database with `tenantId` on every tenant-scoped table. Row-Level Security provides database-level enforcement. The application enforces tenant context via middleware (proxy.ts).

### Reasoning

1. **Simplicity** — Single DB, single migration, single backup. Aligns with KISS principle.

2. **Multi-tenancy first** — The platform is designed to serve many tenants. Separate databases make this operationally expensive and limit cross-tenant features.

3. **Evolution path** — If a tenant outgrows the shared model, their data can be migrated to a dedicated database (Option C). The abstraction layer (tenant-scoped repositories) makes this possible without application changes.

4. **RLS defense-in-depth** — Even if application code omits a tenantId filter, the database row-level security policy prevents cross-tenant data access.

5. **Single-tenant deployment** — A single-tenant install simply has one tenant with a fixed ID. No code changes needed.

6. **Provider-per-tenant** — The DI container (see `project/dependency-injection.md`) supports per-tenant provider resolution via `createTenantContainer()`, allowing Tenant A to use Stripe while Tenant B uses PayPal.

### Tenant Resolution Strategy

```
Incoming Request
       │
       ▼
proxy.ts ──────────────────────────────────┐
       │                                   │
       ▼                                   ▼
Domain-based:                    Path-based (fallback):
shop.example.com                  example.com/shop/shop-a
       │                                   │
       └───────────────┬───────────────────┘
                       ▼
          TenantResolver.resolve(host, path)
                       │
                       ▼
          ┌─────────────────────┐
          │ Tenant found?       │
          ├───────┬─────────────┤
          │  Yes  │   No        │
          ▼       ▼             │
    Set tenantId  Default tenant│
    in request ctx  or 404      │
                       │        │
                       ▼        ▼
                  Feature Module / Core Service
                  (always receives tenantId)
```

**Resolution order**:
1. Check request hostname against tenant domain mapping (primary)
2. Check request path prefix `/shop/<slug>` (fallback)
3. Check request header `X-Tenant-Id` (API clients)
4. Fall back to default tenant for single-tenant deployments

### Tenant Data Model

```prisma
model Tenant {
  id          String   @id @default(cuid())
  slug        String   @unique       // URL-friendly identifier
  name        String                  // Store name
  domain      String?  @unique       // Custom domain (null for path-based)
  description String?
  logo        String?                 // Logo URL
  favicon     String?                 // Favicon URL
  settings    Json     @default("{}") // Full configuration object
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  // Relationships to tenant-scoped models
  products     Product[]
  orders       Order[]
  users        User[]
  categories   Category[]
  collections  Collection[]
  brands       Brand[]
  coupons      Coupon[]
  reviews      Review[]
  cmsPages     CmsPage[]
  cmsBlocks    CmsBlock[]
}
```

### Tenant-Scoped Query Pattern

```ts
// Repository pattern — every query is scoped
class ProductRepository {
  constructor(private tenantId: string) {}

  async findAll(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { tenantId: this.tenantId },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        slug,
        tenantId: this.tenantId,  // Always scoped
      },
    });
  }
}
```

### RLS Policy (Defense-in-Depth)

```sql
-- Example RLS policy for products table
CREATE POLICY tenant_isolation ON products
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);
```

The application sets `app.current_tenant_id` at the start of each request. RLS enforces it for every query.

### Tenant Configuration

```ts
interface TenantConfig {
  tenantId: string;
  brand: {
    name: string;
    logo: string;
    favicon: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    typography: {
      heading: string;
      body: string;
    };
  };
  locale: {
    defaultCurrency: string;
    defaultLanguage: string;
    supportedLanguages: string[];
    timezone: string;
  };
  providers: {
    payment: string;     // 'stripe' | 'paypal' | ...
    storage: string;     // 'supabase' | 's3' | ...
    search: string;      // 'postgres' | 'algolia' | ...
    shipping: string;    // 'manual' | 'ups' | ...
    tax: string;         // 'postgres' | 'taxjar' | ...
    email: string;       // 'resend' | 'sendgrid' | ...
  };
  features: {
    reviews: boolean;
    wishlist: boolean;
    giftCards: boolean;
    // Plugin enable/disable per tenant
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  legal: {
    termsUrl: string;
    privacyUrl: string;
    returnsUrl: string;
  };
}
```

### Tenant Middleware (proxy.ts)

```ts
// src/proxy.ts
export async function proxy(request: NextRequest): Promise<NextResponse | undefined> {
  const host = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

  // Resolve tenant
  const tenant = await tenantResolver.resolve(host, path);

  if (!tenant && !isDefaultTenantMode()) {
    return NextResponse.json(
      { success: false, error: { code: 'TENANT_NOT_FOUND', message: 'Unknown store' } },
      { status: 404 },
    );
  }

  // Set tenant context for the request
  const requestHeaders = new Headers(request.headers);
  if (tenant) {
    requestHeaders.set('x-tenant-id', tenant.id);
  }

  // Clone request with tenant header
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  return response;
}
```

### Security Implications

1. **tenantId injection** — Malicious requests could override tenantId in headers. Mitigation: middleware sets tenantId from domain/path resolution, not from inbound headers. RLS provides database-level enforcement.

2. **Cross-tenant data access** — Application code might omit tenantId filter. Mitigation: RLS policies on every tenant-scoped table; repository pattern enforces tenantId in every query.

3. **Tenant enumeration** — Attackers could probe for valid tenant slugs/domains. Mitigation: generic error responses ("store not found"), rate limiting on tenant resolution.

4. **Admin access** — Super-admin can view all tenants. Mitigation: separate admin authentication with explicit cross-tenant permissions, audit logging for all cross-tenant operations.

### Scalability Trade-offs

| Aspect | Shared DB (Option A) | Per-Schema (Option B) | Separate DB (Option C) |
|--------|---------------------|----------------------|----------------------|
| Max tenants | Thousands | Hundreds | Unlimited |
| Per-tenant cost | $0 | $0 | $10-50/mo |
| Migration cost | 1 migration | N migrations | N migrations |
| Query perf | TenantId index needed | Naturally isolated | Best |
| Ops complexity | Low | Medium | High |
| Cross-tenant features | Easy | Hard | Nearly impossible |

**Scaling path**: Start with shared DB (Option A). When any tenant consistently exceeds resource thresholds, migrate that tenant to a dedicated database (Option C). The repository abstraction makes this migration an infrastructure change, not an application change.

### Consequences

**Positive**:
- Single deployment serves unlimited tenants (thousands+)
- Zero cost to add a new tenant
- RLS provides database-level safety net
- Single-tenant deployment is a configuration change, not an architecture change
- Tenant-specific provider selection via per-tenant container
- Migration path to dedicated databases for high-volume tenants

**Negative**:
- Every developer must remember to scope queries by tenantId
- Shared resource contention under load
- Database migrations affect all tenants simultaneously
- Data export for a single tenant requires filtered extraction
- Hot tenant can degrade experience for others

### Migration Strategy

1. Add `Tenant` model to Prisma schema
2. Add `tenantId` column to all existing tenant-scoped tables (nullable initially)
3. Create default tenant record
4. Backfill `tenantId` on existing data (single-tenant assumption)
5. Make `tenantId` required (NOT NULL) after backfill
6. Add indexes on `tenantId` for all tenant-scoped tables
7. Implement `TenantResolver` with domain + path resolution
8. Add tenant middleware to proxy.ts
9. Implement RLS policies
10. Add tenant management to admin panel

### References

- ADR-006: Universal E-Commerce Platform Architecture
- `.ai/project/dependency-injection.md` — Per-tenant container pattern
- `.ai/specs/plugin-system.md` — Per-tenant plugin enablement
- `.ai/project/architecture.md` — Business Configuration layer definition

---

## ADR-010

### Title

`src/config/` is the Dependency Composition Root

### Status

Implemented

### Date

2026-07-31

### Context

The approved DI specification (`project/dependency-injection.md`) places the container registry and composition root at `src/config/container-registry.ts` and `src/config/container.ts`. The container imports Core interfaces (for type safety) and Infrastructure implementations (provider factories), and reads provider settings from configuration.

The Phase 0 architecture boundary in `eslint.config.mjs` declared `src/config` as a pure configuration layer that "may only depend on `src/shared`". Implementation of Phase 2 (provider implementations + DI wiring) surfaced a conflict between two approved artifacts: the container as designed cannot exist under the existing boundary, and no other layer is permitted to depend on both `src/config` and `src/infrastructure`.

### Decision

Treat `src/config/` as the **dependency composition root**. Relax the `src/config` boundary so it may depend on `src/core` (type-only interface imports) and `src/infrastructure` (provider implementations). The boundary remains: `src/config` must NOT import from `src/features`, `src/app`, or `src/plugins`.

The pure, dependency-free `Container` registry class stays in `src/config/container-registry.ts`. All provider selection remains configuration-driven: `src/config/container.ts` reads `providerConfig` and resolves the matching implementation; changing a provider is a config change, not a code change.

### Alternatives

- **Place the container in `src/infrastructure/`** — rejected because Infrastructure is a leaf layer that must not know about configuration, and the approved DI doc specifies `src/config`.
- **Place the composition root in `src/features/`** — rejected because features are presentation modules and must not own global wiring.

### Consequences

Positive: Matches the approved DI specification. Provider selection stays config-driven. Core remains implementation-agnostic. Infrastructure remains unaware of configuration.

Negative: `src/config` is no longer a purely declarative layer; it is now the composition root and must be kept free of business logic.

---

## ADR-011

### Title

Product Attribute System Co-located in `src/core/product/`

### Status

Implemented

### Date

2026-07-31

### Context

ADR-008 adopted the Entity-Attribute-Value (EAV) pattern for product attributes. The attribute system spans `Attribute` definitions and `ProductAttributeValue` rows. A decision was required on where the attribute module lives: a dedicated top-level Core module or co-located with the product domain.

### Decision

Place the attribute interfaces and types in `src/core/product/` (`attribute-repository.interface.ts`, `attribute-types.ts`). The Prisma implementation lives in `src/infrastructure/database/attribute-repository.ts`. No separate `src/core/attribute/` module.

### Alternatives

- **Separate `src/core/attribute/` module** — rejected: attributes currently exist only as product attributes; a dedicated module would be an empty abstraction layer.

### Consequences

Positive: Attribute contracts are co-located with the domain that consumes them; no premature abstraction; consistent with the product-domain directory ownership in `project/architecture.md`.
Negative: If attributes are later generalized to other entities (collections, categories), they must be extracted into a shared module.

---

## ADR-012

### Title

`ProductRepository.setAttributeValues` as an Additive Repository Contract Extension

### Status

Implemented

### Date

2026-07-31

### Context

`ProductService` must persist dynamic attribute values (EAV) for a product. The existing `ProductRepository` contract covered product CRUD, list, delete, and stock adjustment. Attribute-value persistence was not yet part of the contract.

### Decision

Extend the `ProductRepository` interface with an additive method:

```ts
setAttributeValues(
  tenantId: string | null,
  id: string,
  values: ProductAttributeValueInput[],
): Promise<Product>;
```

The method is additive only — all existing repository methods remain unchanged, so no downstream consumer breaks. The Prisma implementation lives in `src/infrastructure/database/product-repository.ts`.

### Alternatives

- **Fold attribute persistence into `create`/`update`** — rejected: would couple the write path of every product mutation to the attribute write path and complicate the transaction surface.
- **Separate `AttributeValueRepository`** — rejected: over-abstraction for a write that belongs to the product aggregate.

### Consequences

Positive: Additive, non-breaking contract extension; attribute writes are explicit and testable; single entry point for product aggregate persistence.
Negative: `ProductRepository` now also owns attribute-value writes; acceptable given the product aggregate boundary.

---

## ADR-013

### Title

Map Prisma `P2002` to `ConflictError` for Product/Attribute Persistence Conflicts

### Status

Implemented

### Date

2026-07-31

### Context

Product and attribute persistence can hit unique-constraint violations on `slug` or `sku`. Prisma surfaces these as `Prisma.PrismaClientKnownRequestError` with code `P2002`. Propagating the raw Prisma error would leak infrastructure details into the Core layer.

### Decision

In `src/infrastructure/database/product-repository.ts`, detect Prisma unique-constraint errors via an `isPrismaUniqueConstraintError` guard (checks `code === "P2002"`) and throw `ConflictError` with a domain message ("Product with the same slug or sku already exists"). `ConflictError` is defined in `src/shared/errors/platform-error.ts` with code `"conflict"`.

### Alternatives

- **Propagate the raw Prisma error** — rejected: leaks infrastructure error types into Core.
- **Reuse `NotFoundError`/generic `PlatformError`** — rejected: loses the semantic distinction required to signal a uniqueness conflict.

### Consequences

Positive: Core and callers receive a typed, stable `ConflictError`; consistent with the platform error taxonomy; infrastructure details stay in the Infrastructure layer.
Negative: The mapping must be applied per repository; `attribute-repository.ts` currently performs no writes, so the mapping lives in the product repository write path today.
