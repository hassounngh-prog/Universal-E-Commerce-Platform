# Universal E-Commerce Platform — Implementation Roadmap

> Source of truth: `project/universal-platform.md`
> Gap analysis: `reviews/universal-platform-gap-analysis.md`

---

## Phase 0: Foundation (Week 1)

### Objective
Establish the layer directories, core interfaces, and configuration system without modifying any existing code.

### Tasks

| Task | Description | Files |
|------|-------------|-------|
| 0.1 | Create `src/core/` directory with subdirectories per domain | `src/core/{product,order,cart,payment,storage,search,shipping,tax,notification,tenant,plugin}/` |
| 0.2 | Define PaymentProvider interface | `src/core/payment/payment-provider.interface.ts` |
| 0.3 | Define StorageProvider interface | `src/core/storage/storage-provider.interface.ts` |
| 0.4 | Define SearchProvider interface | `src/core/search/search-provider.interface.ts` |
| 0.5 | Define ShippingProvider interface | `src/core/shipping/shipping-provider.interface.ts` |
| 0.6 | Define TaxProvider interface | `src/core/tax/tax-provider.interface.ts` |
| 0.7 | Define NotificationChannel interface | `src/core/notification/notification-channel.interface.ts` |
| 0.8 | Create `src/infrastructure/` directory | `src/infrastructure/{payment,storage,search,shipping,tax,notification}/` |
| 0.9 | Create `src/plugins/` directory with plugin registry | `src/plugins/plugin-registry.ts` |
| 0.10 | Create `src/config/` directory with config schema | `src/config/{platform.config.ts,tenant.config.ts}` |
| 0.11 | Create `src/shared/` directory with base types | `src/shared/{types,errors,utils}/` |

### Acceptance Criteria
- All directory trees exist
- Every provider interface is defined as a TypeScript interface/type
- Plugin registry supports register/unregister with lifecycle hooks
- Configuration schema validates required platform settings
- Zero existing files modified
- `npm run build` passes

---

## Phase 1: Database Schema Extension (Week 2)

### Objective
Add universal commerce tables without breaking existing schema. All additions are additive.

### Tasks

| Task | Description |
|------|-------------|
| 1.1 | Add `Attribute` and `AttributeValue` models for EAV pattern |
| 1.2 | Add `Brand` model with product association |
| 1.3 | Add `Collection` and `CollectionRule` models |
| 1.4 | Add `Coupon` and `CouponUsage` models (discount engine) |
| 1.5 | Add `ProductType` model (physical, digital, service, subscription) |
| 1.6 | Add `ProductVariant` model (size, color, etc.) |
| 1.7 | Add `Tenant` model with configuration JSON |
| 1.8 | Add `TaxRate`, `TaxCategory` models |
| 1.9 | Add `Review` and `ReviewMedia` models |
| 1.10 | Add `CmsPage`, `CmsBlock`, `CmsMedia` models |
| 1.11 | Add `Subscription` and `SubscriptionPlan` models |
| 1.12 | Extend `Order` with tax breakdown, shipping carrier fields |
| 1.13 | Add foreign key indexes for new relationships |
| 1.14 | Update `seed.ts` with new model data |

### Acceptance Criteria
- `prisma migrate dev` applies without errors
- Existing tables unmodified
- All new models have proper indexes
- Seed script populates all new tables with demo data
- `npm run build` passes

---

## Phase 2: Infrastructure Provider Implementations (Week 3)

### Objective
Implement the first provider for each Core interface, keeping existing Supabase integration working.

### Tasks

| Task | Description |
|------|-------------|
| 2.1 | Extract existing Supabase client into `SupabaseStorageProvider` |
| 2.2 | Implement `StripePaymentProvider` (keep future integration flag) |
| 2.3 | Implement `PostgresSearchProvider` wrapping Prisma full-text search |
| 2.4 | Implement `PostgresTaxProvider` for simple tax rate calculation |
| 2.5 | Create dependency injection container in `src/config/container.ts` |
| 2.6 | Wire providers to container with config-driven selection |
| 2.7 | Write provider contract tests (same tests pass for any implementation) |

### Acceptance Criteria
- All Core interfaces have at least one implementation
- Provider selection driven by `src/config/` without code changes
- Provider contract tests exist covering each interface method
- `npm run build` passes

---

## Phase 3: Core Engine Layer (Week 4-5)

### Objective
Build the business-agnostic commerce engine — product, cart, order, pricing use cases that work with any product type, any provider, any tenant.

### Tasks

| Task | Description |
|------|-------------|
| 3.1 | Implement `ProductService` — CRUD with dynamic attributes, EAV query support |
| 3.2 | Implement `CartService` — guest/authenticated merge, validation, pricing |
| 3.3 | Implement `OrderService` — creation, payment, fulfillment, tax, shipping |
| 3.4 | Implement `PricingEngine` — base price, tier pricing, coupons, tax calculation |
| 3.5 | Implement `PaymentService` — orchestrates PaymentProvider for checkout |
| 3.6 | Implement `ShippingService` — rate calculation, carrier selection |
| 3.7 | Implement `TenantService` — configuration loading, domain resolution |
| 3.8 | Implement `PluginService` — hooks, middleware, extension points |
| 3.9 | Implement `CollectionService` — manual and rule-based curation |
| 3.10 | Implement `ReviewService` — moderation, rating aggregation |
| 3.11 | Write unit tests for every Core service |
| 3.12 | Write integration tests for provider pipelines |

### Acceptance Criteria
- All Core services are tenant-aware (accept tenantId where needed)
- No business-specific assumptions in any Core service
- All external access goes through provider interfaces
- Unit test coverage > 80% for Core layer
- Integration tests verify provider pipeline end-to-end
- `npm run build` passes

---

## Phase 4: Feature Module Migration (Week 6-7)

### Objective
Refactor existing feature modules to use Core layer services. Feature modules become thin presentation layers.

### Tasks

| Task | Description |
|------|-------------|
| 4.1 | Refactor `products/` feature — use `ProductService`, remove direct Prisma queries |
| 4.2 | Refactor `cart/` feature — use `CartService`, guest merge flow |
| 4.3 | Refactor `orders/` feature — use `OrderService`, status machine |
| 4.4 | Refactor `checkout/` feature — use `PaymentService` + `ShippingService` |
| 4.5 | Refactor `auth/` feature — add tenant-aware login |
| 4.6 | Add `collections/` feature module — browse collections, curated lists |
| 4.7 | Add `brands/` feature module — brand pages, product filtering |
| 4.8 | Add `reviews/` feature module — write/read reviews with moderation |
| 4.9 | Add `coupons/` feature module — admin coupon management, cart application |
| 4.10 | Add `cms/` feature module — pages, blocks, media |
| 4.11 | Add `account/` feature module — profile, subscriptions, saved payment methods |

### Acceptance Criteria
- Every feature module imports from Core layer, not Prisma directly
- All existing routes/pages continue working
- New feature modules functional
- URL structure follows `/products/`, `/collections/`, `/brands/`, etc.
- `npm run build` passes

---

## Phase 5: Multi-Tenancy & White Label (Week 8)

### Objective
Enable platform to serve multiple stores with independent branding, domains, and configuration.

### Tasks

| Task | Description |
|------|-------------|
| 5.1 | Implement `TenantResolver` — domain → tenantId mapping |
| 5.2 | Implement tenant-scoped configuration loading |
| 5.3 | Implement theme/branding system — CSS variables, component overrides, logo |
| 5.4 | Add provider mapping per tenant (tenant A uses Stripe, tenant B uses PayPal) |
| 5.5 | Implement tenant isolation middleware |
| 5.6 | Create tenant admin UI |
| 5.7 | Add tenant seeding script |

### Acceptance Criteria
- Two tenants can run on same deployment with different branding
- Each tenant selects its own providers
- Tenant isolation guarantees data separation
- URL-based tenant resolution works (tenant.domain.com or domain.com/tenant)
- `npm run build` passes

---

## Phase 6: Plugin System (Week 9)

### Objective
Allow third-party extensions via plugin registration without modifying core code.

### Tasks

| Task | Description |
|------|-------------|
| 6.1 | Finalize plugin registration API (register, unregister, hooks) |
| 6.2 | Implement hook system (before/after/around pattern) |
| 6.3 | Add lifecycle hooks (onActivate, onDeactivate, onConfigChange) |
| 6.4 | Create plugin manifest standard |
| 6.5 | Build plugin management UI |
| 6.6 | Write example plugin (analytics tracking) |
| 6.7 | Write plugin developer documentation |

### Acceptance Criteria
- Plugin can register hooks on any Core service method
- Plugin lifecycle events fire correctly
- Plugin can be enabled/disabled without server restart
- Example plugin works end-to-end
- `npm run build` passes

---

## Phase 7: Internationalization & Localization (Week 10)

### Objective
Support multiple languages, currencies, and regional formats.

### Tasks

| Task | Description |
|------|-------------|
| 7.1 | Select i18n library (i18next, react-intl, next-intl) |
| 7.2 | Set up translation file structure |
| 7.3 | Implement locale detection (URL, cookie, browser) |
| 7.4 | Implement currency conversion service |
| 7.5 | Add regional formatting (dates, numbers, addresses) |
| 7.6 | Create translation management workflow |

### Acceptance Criteria
- UI renders in detected locale automatically
- Currency displays in tenant-default or user-preferred currency
- All user-facing strings externalized to translation files
- Locale persists across sessions
- `npm run build` passes

---

## Phase 8: Admin Panel & Operations (Week 11-12)

### Objective
Provide domain-agnostic admin interface for order management, product management, tenant configuration, and plugin management.

### Tasks

| Task | Description |
|------|-------------|
| 8.1 | Admin layout with sidebar navigation |
| 8.2 | Dashboard with configurable widgets |
| 8.3 | Product management with dynamic attribute forms |
| 8.4 | Order management with status workflow |
| 8.5 | Customer management |
| 8.6 | Coupon management |
| 8.7 | CMS editor |
| 8.8 | Tenant configuration UI |
| 8.9 | Plugin management UI |
| 8.10 | Analytics & reporting basics |

### Acceptance Criteria
- Admin panel supports all commerce domains
- All CRUD operations go through Core layer
- Role-based access control
- Responsive admin layout
- `npm run build` passes

---

## Phase 9: Testing, Security & Production Readiness (Week 13)

### Objective
Hardening, security audit, performance optimization, and deployment preparation.

### Tasks

| Task | Description |
|------|-------------|
| 9.1 | Full E2E test suite with Playwright |
| 9.2 | Provider integration test suite (each provider) |
| 9.3 | Security audit (OWASP Top 10) |
| 9.4 | Rate limiting implementation |
| 9.5 | Caching strategy (Redis/CDN) |
| 9.6 | Performance budget enforcement |
| 9.7 | Load testing |
| 9.8 | Documentation finalization |
| 9.9 | Production infrastructure setup |

### Acceptance Criteria
- E2E tests cover all user journeys
- Security scan passes with no critical/high findings
- Lighthouse score > 90 on all pages
- P95 API response < 200ms
- Load test supports 1000 concurrent users
- `npm run build` passes

---

## Migration Principles

### Additive Only
Existing schema tables and code files remain untouched during Phases 0-1. New tables and directories are added alongside existing ones.

### Backward Compatibility
Existing API routes continue working. New routes follow `/api/v1/...` pattern. Old routes remain until Phase 4 migration.

### Progressive Adoption
Each phase produces a working, deployable state. The system is production-usable at every phase boundary (features available don't regress).

### Test Separation
New Core layer has its own test suite. Existing tests remain unchanged until the features they test are migrated.

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Scope creep during migration | Schedule slip | Medium | Strict additive-only rule; new features deferred |
| Prisma EAV performance | Performance degradation | Medium | Hybrid JSONB + EAV approach; benchmark before phase 3 |
| Plugin system overengineering | Wasted effort | Low | Start with minimal hook API; extend on demand |
| Multi-tenancy data leak | Security critical | Low | Tenant isolation middleware + per-tenant query filters |
| Provider abstraction overhead | Code complexity | Medium | Keep interface surface minimal; prefer composition over inheritance |
| Team learning curve | Velocity drop | Medium | Phase 0 is pure interface design — no runtime code; phased approach teaches one concept at a time |

---

## Success Criteria

1. A new business vertical (e.g., electronics) can be onboarded with zero code changes — only config and data
2. Payment provider can be swapped by changing one config value
3. Two tenants can run on same deployment with distinct branding and providers
4. Plugin can extend checkout flow without modifying Core
5. Database migrations remain additive for all future business domains
6. All existing user journeys continue working throughout migration
