# Plugin System Specification

> Version: 1.0.0
> Status: Approved
> Priority: High
> Applies to: `src/plugins/` and all Core extension points

---

# Purpose

The plugin system allows third-party extensions to add or modify platform behavior without changing Core code. This is how the platform remains business-agnostic while supporting domain-specific features.

---

# Design Philosophy

1. **Core never depends on plugins** — Core must compile, test, and run with zero plugins loaded.
2. **Plugins extend, never modify** — Plugins cannot modify Core files or override Core logic; they hook into defined extension points.
3. **Isolation by default** — Each plugin owns its data, routes, UI, and configuration. No cross-plugin coupling unless explicitly configured.
4. **Tenant-aware** — Plugins can be enabled/disabled per tenant via configuration.
5. **KISS first** — The minimal hook system is delivered first. Complexity is added only when proven necessary.

---

# Plugin Lifecycle

```
  Discovered
      │
      ▼
  Registered ──── Validation Failure → Rejected
      │
      ▼
  Dependencies Resolved ──── Unsatisfied → Deferred
      │
      ▼
  Initialized ──── Init Error → Disabled
      │
      ▼
  Activated ──── Hook Registration
      │
      ▼
  Running ←────────────────────────────┐
      │                                │
      ├── Disabled (tenant config) ────┘
      │
      ▼
  Deactivated ──── Hooks unregistered
      │
      ▼
  Unregistered ──── Removed from registry
```

| Phase | Description |
|-------|-------------|
| **Discovered** | Plugin manifest found in `src/plugins/<id>/plugin.json` |
| **Registered** | Manifest parsed, validated against schema, added to registry |
| **Dependencies Resolved** | All required plugins present and their versions compatible |
| **Initialized** | Plugin constructor called, dependency references injected |
| **Activated** | `onActivate()` lifecycle hook fires, hooks register with Core |
| **Running** | Plugin responds to hooks and events normally |
| **Deactivated** | `onDeactivate()` fires, hooks unregistered, cleanup runs |
| **Unregistered** | Plugin data and registry entry removed (admin action) |

---

# Manifest Format

Each plugin lives in `src/plugins/<plugin-id>/` and MUST contain a `plugin.json`:

```json
{
  "$schema": "https://commercecore.dev/plugin-schema-v1.json",
  "id": "wishlist",
  "version": "1.2.0",
  "name": "Wishlist",
  "description": "Allow customers to save products for later purchase",
  "author": "CommerceCore",
  "license": "MIT",
  "icon": "heart",

  "minPlatformVersion": "1.0.0",
  "maxPlatformVersion": "2.0.0",

  "dependencies": {
    "core": "^1.0.0"
  },
  "optionalDependencies": {
    "loyalty": "^1.0.0"
  },

  "hooks": [
    "product:afterRender",
    "cart:beforeAddItem"
  ],

  "events": {
    "subscribes": [
      "order:completed",
      "product:updated"
    ],
    "emits": [
      "wishlist:itemAdded",
      "wishlist:itemRemoved"
    ]
  },

  "permissions": [
    "core:product:read",
    "core:cart:write",
    "core:user:read"
  ],

  "settings": {
    "type": "object",
    "properties": {
      "maxItems": {
        "type": "integer",
        "default": 100,
        "description": "Maximum wishlist items per user"
      },
      "notifyOnSale": {
        "type": "boolean",
        "default": true
      }
    }
  },

  "admin": {
    "menuItems": [
      {
        "label": "Wishlists",
        "route": "/admin/plugins/wishlist",
        "icon": "heart",
        "permissions": ["wishlist:admin:read"]
      }
    ],
    "settingsPage": true
  }
}
```

## Manifest Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique plugin identifier (kebab-case, matches directory name) |
| `version` | Yes | Semantic version of the plugin |
| `name` | Yes | Human-readable plugin name |
| `description` | Yes | Short description of plugin functionality |
| `author` | No | Author name or organization |
| `license` | No | SPDX license identifier |
| `icon` | No | Lucide icon name for admin UI |
| `minPlatformVersion` | Yes | Minimum platform version required |
| `maxPlatformVersion` | Yes | Maximum platform version supported |
| `dependencies` | No | Map of plugin-id to semver range for required plugins |
| `optionalDependencies` | No | Map of plugin-id to semver range for optional plugins |
| `hooks` | No | Array of hook identifiers the plugin attaches to |
| `events.subscribes` | No | Array of event types the plugin listens to |
| `events.emits` | No | Array of event types the plugin publishes |
| `permissions` | Yes | Array of permission strings the plugin requires |
| `settings` | No | JSON Schema for plugin configuration |
| `admin.menuItems` | No | Admin sidebar menu item definitions |
| `admin.settingsPage` | No | Whether plugin has an admin settings page |

---

# Directory Structure

```
src/
├── core/
│   └── plugin/                 # Plugin contract interfaces (Core-owned)
│       ├── hook-registry.interface.ts
│       ├── event-bus.interface.ts
│       ├── plugin-context.ts
│       └── types.ts            # PluginStatus, PluginManifest types
│
├── plugins/
│   ├── plugin-registry.ts      # Registry singleton
│   ├── plugin-manifest.schema.ts
│   │
│   ├── wishlist/               # Example plugin
│   ├── plugin.json
│   ├── index.ts                # Plugin entry point (default export)
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── schemas/
│   ├── types/
│   └── prisma/
│       └── schema.prisma       # Plugin-specific models
│
├── affiliate/
│   └── ...
│
├── loyalty/
│   └── ...
│
├── gift-card/
│   └── ...
│
├── marketplace/
│   └── ...
│
├── wholesale/
│   └── ...
│
├── subscription/
│   └── ...
│
└── pos/
    └── ...
```

Each plugin is completely self-contained. Plugins may contain their own Prisma schema files (namespaced with plugin prefix) that are merged during `prisma migrate`.

---

# Plugin Entry Point

Every plugin MUST export a default class that extends `PlatformPlugin`:

```ts
// src/plugins/wishlist/index.ts
import { PlatformPlugin } from '../../core/plugin/types';
import type { PluginContext } from '../../core/plugin/plugin-context';

export default class WishlistPlugin extends PlatformPlugin {
  async onActivate(ctx: PluginContext): Promise<void> {
    // Register hooks
    ctx.hooks.register('product:afterRender', this.addWishlistButton);

    // Subscribe to events
    ctx.events.subscribe('product:updated', this.handleProductUpdate);

    // Register admin routes
    ctx.admin.addMenuItem({
      label: 'Wishlists',
      route: '/admin/plugins/wishlist',
      icon: 'heart',
    });
  }

  async onDeactivate(ctx: PluginContext): Promise<void> {
    // Cleanup happens automatically (hooks unregistered, events unsubscribed)
    // Plugin-specific cleanup (e.g., close connections)
  }

  async onConfigChange(ctx: PluginContext): Promise<void> {
    // React to configuration changes without deactivation
  }
}
```

---

# Core Plugin Contracts

Plugin contract interfaces are owned by the Core layer in `src/core/plugin/`. The plugin system (`src/plugins/`) implements these interfaces. Core services import the interfaces; they never import from `src/plugins/`.

This ensures Core → Plugins dependency direction is maintained (Clean Architecture).

## Hook Registry Interface

```ts
// src/core/plugin/hook-registry.interface.ts

export type HookHandler = (input: unknown, context: HookContext) => Promise<unknown>;

export interface BeforeResult {
  modified?: unknown;
  cancelled?: boolean;
  reason?: string;
}

export interface HookContext {
  hookPoint: string;
  tenantId: string | null;
}

export interface HookRegistry {
  register(hookPoint: string, handler: HookHandler, priority?: number): void;
  unregister(hookPoint: string, handler: HookHandler): void;
  executeBefore(hookPoint: string, input: unknown): Promise<BeforeResult>;
  executeAfter(hookPoint: string, input: unknown, result: unknown): Promise<unknown>;
  executeAround(hookPoint: string, input: unknown, next: () => unknown): Promise<unknown>;
}
```

## Event Bus Interface

```ts
// src/core/plugin/event-bus.interface.ts

export interface EventHandler {
  (payload: unknown, context: EventContext): Promise<void>;
}

export interface EventContext {
  eventId: string;
  eventType: string;
  timestamp: string;
  tenantId: string | null;
  source: string;
}

export interface EventBus {
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
  publish(eventType: string, payload: unknown): Promise<void>;
}
```

## Plugin Context

```ts
// src/core/plugin/plugin-context.ts

export interface PluginConfig {
  [key: string]: unknown;
}

export interface PluginContext {
  config: PluginConfig;
  tenantId: string | null;
  hooks: HookRegistry;
  events: EventBus;
  admin: AdminExtensionAPI;
  storefront: StorefrontExtensionAPI;
  logger: PluginLogger;
}
```

## Plugin Instance Types

```ts
// src/core/plugin/types.ts

export interface PluginInstance {
  manifest: PluginManifest;
  status: PluginStatus;
  instance: PlatformPlugin | null;
  deps: {
    resolved: string[];
    missing: string[];
    optional: { id: string; present: boolean }[];
  };
}

export enum PluginStatus {
  Discovered = 'discovered',
  Registered = 'registered',
  Resolved = 'resolved',
  Initialized = 'initialized',
  Active = 'active',
  Deactivated = 'deactivated',
  Failed = 'failed',
}

export abstract class PlatformPlugin {
  abstract onActivate(ctx: PluginContext): Promise<void>;
  onDeactivate?(ctx: PluginContext): Promise<void>;
  onConfigChange?(ctx: PluginContext): Promise<void>;
}

export interface AdminMenuItem {
  label: string;
  route: string;
  icon: string;
  permissions: string[];
}

export interface AdminExtensionAPI {
  addMenuItem(item: AdminMenuItem): void;
}

export interface StorefrontExtensionAPI {
  addNavItem(item: { label: string; route: string }): void;
  addRoute(route: { path: string; component: string }): void;
}

export interface PluginLogger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}
```

---

# Hook System

## Hook Points

Hook points are defined in Core services as named interception locations:

```ts
// src/core/product/product.service.ts
import type { HookRegistry } from '../plugin/hook-registry.interface';

export class ProductService {
  constructor(private hookRegistry: HookRegistry) {}

  async getProduct(slug: string, tenantId: string): Promise<ProductResult> {
    // Before hook — can modify input or cancel
    const beforeResult = await this.hookRegistry.executeBefore(
      'product:beforeRender',
      { slug, tenantId },
    );
    if (beforeResult.cancelled) {
      throw new PluginCancelledError(beforeResult.reason);
    }

    const product = await this.productRepo.findBySlug(slug, tenantId);

    // After hook — can modify result
    const enriched = await this.hookRegistry.executeAfter(
      'product:afterRender',
      { slug, tenantId },
      product,
    );

    return enriched;
  }
}
```

## Hook Types

| Type | Signature | Use Case |
|------|-----------|----------|
| **Before** | `(input) => input \| { cancelled, reason }` | Validate, modify input, cancel operation |
| **After** | `(input, result) => result` | Enrich result, modify response |
| **Around** | `(input, next) => output` | Wrap entire operation (e.g., timing, caching) |

Handlers execute in priority order (lower number = higher priority, default 100). Same-priority handlers execute in registration order.

The HookRegistry interface is defined in `src/core/plugin/hook-registry.interface.ts`. Core services import this interface; they never depend on the plugin implementation.

## Planned Hook Points

### Core v1 (shipped)

| Hook Point | Type | Description |
|------------|------|-------------|
| `product:afterRender` | After | Enrich product response with plugin data |
| `cart:beforeAddItem` | Before | Validate or reject item addition |
| `checkout:beforeProcess` | Before | Validate checkout, add checks |
| `order:afterCreate` | After | Post-order actions (notifications, etc.) |
| `search:beforeQuery` | Before | Modify search query |

### Planned for v2+

| Hook Point | Type | Description |
|------------|------|-------------|
| `product:beforeRender` | Before | Modify product data before page render |
| `product:beforeSearch` | Before | Modify search query, add filters |
| `product:afterSearch` | After | Enrich search results |
| `cart:afterAddItem` | After | Enrich cart response |
| `cart:beforeApplyCoupon` | Before | Validate coupon |
| `checkout:afterProcess` | After | Post-checkout enrichment |
| `order:beforeCreate` | Before | Validate order creation |
| `order:statusChange` | After | Order status transition |
| `payment:beforeCharge` | Before | Modify payment intent |
| `payment:afterCharge` | After | Post-payment processing |
| `search:afterQuery` | After | Enrich search results |
| `review:beforeSubmit` | Before | Validate review content |

Hook points are listed in each plugin's manifest (`hooks` array) for documentation and permission scoping.

---

# Event System

Events are fire-and-forget domain notifications. Unlike hooks, events cannot modify data flow.

The EventBus interface is defined in `src/core/plugin/event-bus.interface.ts`. Core services import this interface; they never depend on the plugin implementation.

## Planned Events

### Core v1 (shipped)

| Event | Payload | Description |
|-------|---------|-------------|
| `order:created` | `{ orderId, tenantId, total }` | New order placed |
| `order:completed` | `{ orderId, tenantId }` | Order fulfilled |
| `product:updated` | `{ productId, tenantId, changes }` | Product updated |
| `user:registered` | `{ userId, tenantId }` | New user registered |

### Planned for v2+

| Event | Payload | Description |
|-------|---------|-------------|
| `product:created` | `{ productId, tenantId }` | New product created |
| `product:deleted` | `{ productId, tenantId }` | Product deleted |
| `order:cancelled` | `{ orderId, tenantId, reason }` | Order cancelled |
| `cart:merged` | `{ guestSessionId, userId }` | Guest cart merged to user |
| `user:login` | `{ userId, tenantId, method }` | User logged in |
| `review:submitted` | `{ reviewId, productId, rating }` | Review submitted |
| `inventory:low` | `{ productId, variantId, quantity }` | Low stock alert |
| `payment:failed` | `{ orderId, provider, reason }` | Payment failed |

---

# Extension Points

## Admin Panel

Plugins can extend the admin panel through:

| Extension | Mechanism | Example |
|-----------|-----------|---------|
| Sidebar menu | `ctx.admin.addMenuItem()` | "Wishlists" menu item |
| Settings page | Plugin provides React component | "Wishlist Settings" |
| Dashboard widget | Plugin registers widget component | "Top Wishlisted" card |
| Product edit tab | Plugin registers tab component | "Wishlist Stats" tab |
| Order detail section | Plugin registers section component | "Gift Message" section |

## Storefront

Plugins can extend the storefront through:

| Extension | Mechanism | Example |
|-----------|-----------|---------|
| Product page section | Hook `product:afterRender` + component | Wishlist button |
| Cart item display | Hook `cart:afterAddItem` + component | Gift wrap option |
| Navigation item | `ctx.storefront.addNavItem()` | "Wishlist" link |
| Checkout step | `ctx.storefront.addCheckoutStep()` | "Gift Message" step |
| Page route | `ctx.storefront.addRoute()` | `/wishlist` page |

## API

Plugins can register API routes:

```ts
ctx.api.registerRoutes([
  { path: '/api/v1/wishlist', handler: wishlistRouter },
]);
```

Routes are prefixed under the plugin namespace and isolated from Core routes.

---

# Permission Model

## Declared Permissions

Plugins declare required permissions in `plugin.json`:

```json
{
  "permissions": [
    "core:product:read",
    "core:cart:write",
    "core:order:read",
    "plugin:wishlist:data"
  ]
}
```

## Permission Namespace

```
core:<domain>:<action>     — Core domain access (product, order, cart, user, etc.)
plugin:<plugin-id>:<scope> — Plugin-specific data access
admin:<section>:<action>   — Admin panel access
```

Actions: `read`, `write`, `delete`, `admin`

## Permission Enforcement

- Permission check on plugin activation
- Tenant admin can approve/deny specific permissions
- Runtime permission check before hook execution
- Permission violations log and fail silently in production

---

# Version Compatibility

## Checking

On registration, the platform validates:

```
minPlatformVersion ≤ platform.version ≤ maxPlatformVersion
```

Versions follow semantic versioning (MAJOR.MINOR.PATCH).

- **MAJOR** mismatch → plugin rejected (breaking changes)
- **MINOR** mismatch → warning logged (new features, backward compatible)
- **PATCH** mismatch → accepted silently

## Breaking Changes

A MAJOR version bump in the platform means:
- Hook signatures changed
- Event payloads changed
- Plugin API methods changed or removed
- Permission names changed

Breaking changes are documented in `.ai/CHANGELOG.md` with migration notes.

---

# Dependency Resolution

## Algorithm

1. Collect all declared dependencies from plugin manifest
2. Resolve each dependency to an installed plugin by ID
3. Validate version range against resolved plugin's version
4. Check for circular dependencies (graph cycle detection)
5. Sort by topological order for initialization

## Rules

- Required dependency missing → plugin enters `Deferred` status
- Required dependency version incompatible → plugin enters `Failed` status
- Optional dependency missing → plugin activates without it
- Circular dependency → both plugins enter `Failed` status with error logged
- Plugin A depends on B → B MUST activate before A

---

# Plugin Registry

```ts
// src/plugins/plugin-registry.ts

import type { HookRegistry, EventBus } from '../../core/plugin/hook-registry.interface';
import type { PluginManifest, PluginInstance, PluginStatus } from '../../core/plugin/types';

export class PluginRegistry {
  private plugins: Map<string, PluginInstance> = new Map();
  private hookRegistry: HookRegistry;
  private eventBus: EventBus;

  async discover(): Promise<void> {
    // Scan src/plugins/<id>/plugin.json for all directories
    // Parse and validate manifests
  }

  async register(manifest: PluginManifest): Promise<void> {
    // Validate manifest structure
    // Check version compatibility
    // Add to registry with status = Registered
  }

  async resolveDependencies(): Promise<void> {
    // Topological sort
    // Detect circular deps
    // Mark deferred/failed plugins
  }

  async initializeAll(): Promise<void> {
    // For each plugin in topological order:
    //   1. Instantiate plugin class
    //   2. Create PluginContext
    //   3. Call plugin.onActivate(ctx)
    //   4. Mark as Active
  }

  async activate(pluginId: string): Promise<void> {
    // Activate a single deactivated plugin
    // Re-resolve dependencies, re-run hooks
  }

  async deactivate(pluginId: string): Promise<void> {
    // Call plugin.onDeactivate()
    // Unregister all hooks
    // Mark as Deactivated
  }

  getActivePlugins(): PluginInstance[] {
    return [...this.plugins.values()].filter(p => p.status === PluginStatus.Active);
  }

  isHookPointRegistered(hookPoint: string): boolean {
    return this.getActivePlugins().some(p => p.manifest.hooks.includes(hookPoint));
  }
}
```

---

# Tenant Awareness

- Plugins can be enabled/disabled per tenant via `tenant.config.plugins`
- Plugin settings are per-tenant (stored in tenant configuration)
- Hook execution receives current `tenantId` from context
- Events carry `tenantId` for routing to the correct tenant's plugin instances

```ts
// Tenant config example
{
  "tenantId": "electronics-store",
  "plugins": {
    "wishlist": {
      "enabled": true,
      "settings": {
        "maxItems": 50,
        "notifyOnSale": true
      }
    },
    "affiliate": {
      "enabled": false
    }
  }
}
```

---

# Error Handling

| Scenario | Behavior |
|----------|----------|
| Plugin throws in `onActivate` | Plugin marked as `Failed`, error logged, platform continues |
| Plugin hook throws | Single hook failure isolated, error logged, original result used |
| Plugin event handler throws | Single event handler failure isolated, error logged |
| Manifest validation fails | Plugin rejected, error returned to discoverer |
| Circular dependency | Both plugins deferred with error message |
| Permission denied on activation | Plugin rejected, admin notified |
| Runtime permission check fails | Hook skipped, error logged |

All plugin errors are non-fatal to the platform. A failing plugin never breaks Core.

---

# Plugin Data Isolation

- Plugin database tables are prefixed: `plugin_wishlist_items`
- Plugin files stored in `src/plugins/<id>/` only
- Plugin routes prefixed: `/api/v1/plugins/wishlist/`
- Plugin settings stored in tenant configuration object
- Cross-plugin data access requires explicit permission in manifest

---

# Available Plugin Types (Planned)

| Plugin | Status | Version | Description |
|--------|--------|---------|-------------|
| Wishlist | Planned | 1.0.0 | Save products for later purchase |
| Affiliate | Planned | 1.0.0 | Affiliate tracking and commission |
| Loyalty | Planned | 1.0.0 | Points, rewards, and tiers |
| Gift Card | Planned | 1.0.0 | Digital gift card sales and redemption |
| Marketplace | Planned | 1.0.0 | Multi-vendor product listing |
| Wholesale | Planned | 1.0.0 | B2B pricing, quantity tiers, approval |
| Subscription | Planned | 1.0.0 | Recurring billing and delivery |
| POS | Planned | 1.0.0 | Point of sale integration |
| AI Recommendations | Planned | 1.0.0 | ML-based product recommendations |

---

# Implementation Order (Phase 6)

1. Create `plugin-manifest.schema.ts` — Zod schema for manifest validation
2. Create `plugin-registry.interface.ts` — interfaces and types
3. Create `plugin-registry.ts` — registry implementation (discover, register, resolve, activate)
4. Create `hook-registry.ts` — hook registration and execution engine
5. Create `event-bus.ts` — event pub/sub implementation
6. Add hook points to Core services (product, cart, checkout, order, etc.)
7. Build plugin management admin UI
8. Write example plugin (Analytics tracking)
9. Write plugin developer documentation

---

# Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Hook overhead in hot paths | Performance | Low | Hook registry short-circuits when no plugins active; benchmarking before release |
| Plugin conflicts | Behavioral | Medium | Isolated hook execution; plugin can't affect other plugins' data |
| Security via plugin permissions | Authorization | Low | Permission model reviewed at activation; tenant admin approval gate |
| Version fragmentation | Maintenance | Medium | Strict semver; min/max platform version in manifest |
| Plugin bloat | UX | Medium | Plugin UI contributes to bundle; lazy-loaded separately |

---

# Review History

| Date | Author | Summary |
|------|--------|---------|
| 2026-07-30 | OpenCode | Initial specification |
