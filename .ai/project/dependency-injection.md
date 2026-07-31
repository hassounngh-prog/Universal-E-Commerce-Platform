# Dependency Injection Architecture

> Version: 1.0.0
> Status: Approved
> Priority: High
> Applies to: All provider resolution across `src/core/`, `src/infrastructure/`, `src/config/`

---

# Decision

## Use Manual DI with a Container Registry

**No DI framework.** A lightweight, explicit container registry that maps interfaces to implementations via factory functions.

## Rationale

| Factor | Manual DI (Chosen) | DI Framework (tsyringe/inversify) |
|--------|-------------------|----------------------------------|
| Dependencies | None | Decorators, reflection, polyfills |
| Edge Runtime | Native support | Decorator/metadata polyfills needed, compatibility risk |
| Bundle size | ~0 KB | 15-60 KB (inversify) |
| Type safety | Explicit generics | Decorator-based, less type-safe |
| Debuggability | Fully traceable | Black-box resolution |
| Startup cost | Negligible | Decorator parsing + reflection |
| Learning curve | Minimal | Framework-specific API |
| Testability | Direct mock injection | Framework mock setup required |

The architecture prioritizes simplicity (KISS) and edge compatibility. A DI framework adds complexity, bundle size, and runtime risk with no compensating benefit for this architecture.

---

# Architecture Fit

```
Why Manual DI fits:
┌──────────────────────────────────────────────────┐
│  1. Clean Architecture — Layers are explicit     │
│  2. Provider count is small (< 10 interfaces)    │
│  3. All providers are stateless singletons       │
│  4. Resolution is configuration-driven (static)  │
│  5. No runtime discovery needed                  │
│  6. Full type safety without decorators          │
└──────────────────────────────────────────────────┘
```

The provider surface is stable and small (7 interfaces: Payment, Storage, Search, Shipping, Tax, Notification, Auth). Runtime resolution is config-driven, not dynamic. This makes a DI framework unnecessary overhead.

---

# Dependency Flow

```
                          ┌──────────────────┐
                          │   Application     │
                          │  (pages, routes)  │
                          └────────┬─────────┘
                                   │
                          Invokes feature modules
                                   │
                          ┌────────▼─────────┐
                          │   Feature Module  │
                          │  (presentation)   │
                          └────────┬─────────┘
                                   │
                     Uses Core services via imports
                                   │
                          ┌────────▼─────────┐
                          │   Commerce Core   │
                          │  (business logic) │
                          └────────┬─────────┘
                                   │
            Depends on interfaces, not implementations
                                   │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
              │ Payment    │  │ Storage   │  │ Search    │
              │ Provider   │  │ Provider  │  │ Provider  │
              │ (interface)│  │(interface)│  │(interface)│
              └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                     Container resolves interface →
                     config-driven implementation
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
              │ Stripe    │  │ Supabase  │  │ Postgres  │
              │ Provider  │  │ Storage   │  │ Search    │
              │           │  │ Provider  │  │ Provider  │
              └───────────┘  └───────────┘  └───────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                          ┌────────▼─────────┐
                          │  External World   │
                          │  (Stripe API,     │
                          │   Supabase, etc.) │
                          └──────────────────┘
```

---

# Container Architecture

```
Container
│
├── register(interface, factory)   — Define how to create a provider
├── resolve<T>(interface)          — Get the provider instance
├── getRegistered()                — List all registered interfaces
└── reset()                        — Clear all instances (testing)
```

## Implementation

```ts
// src/config/container-registry.ts

type Factory<T> = () => T;

export class Container {
  private factories = new Map<string, Factory<unknown>>();
  private instances = new Map<string, unknown>();
  private singletonDefaults = true;

  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
  }

  resolve<T>(key: string): T {
    // Check for cached singleton instance first
    if (this.singletonDefaults && this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    const factory = this.factories.get(key);
    if (!factory) {
      throw new ContainerError(`No provider registered for: ${key}`);
    }

    const instance = factory() as T;

    // Cache singleton instances
    if (this.singletonDefaults) {
      this.instances.set(key, instance);
    }

    return instance;
  }

  reset(): void {
    this.instances.clear();
  }

  list(): string[] {
    return [...this.factories.keys()];
  }
}

export class ContainerError extends Error {
  constructor(message: string) {
    super(`[Container] ${message}`);
    this.name = 'ContainerError';
  }
}
```

---

# Provider Registration

```ts
// src/config/container.ts

import { Container } from './container-registry';
import { config } from './platform.config';

// Import interfaces (for type safety)
import type { PaymentProvider } from '../core/payment/payment-provider.interface';
import type { StorageProvider } from '../core/storage/storage-provider.interface';
import type { SearchProvider } from '../core/search/search-provider.interface';
import type { ShippingProvider } from '../core/shipping/shipping-provider.interface';
import type { TaxProvider } from '../core/tax/tax-provider.interface';
import type { AuthProvider } from '../core/auth/auth-provider.interface';
import type { NotificationChannel } from '../core/notification/notification-channel.interface';

// Import implementations
import { StripeProvider } from '../infrastructure/payment/stripe-provider';
import { PayPalProvider } from '../infrastructure/payment/paypal-provider';
import { SupabaseStorageProvider } from '../infrastructure/storage/supabase-storage-provider';
import { PostgresSearchProvider } from '../infrastructure/search/postgres-search-provider';
import { PostgresTaxProvider } from '../infrastructure/tax/postgres-tax-provider';
import { ResendEmailProvider } from '../infrastructure/notification/resend-email-provider';
import { SupabaseAuthProvider } from '../infrastructure/auth/supabase-auth-provider';

function createContainer(): Container {
  const container = new Container();

  // Payment: config-driven selection
  container.register<PaymentProvider>('payment', () => {
    switch (config.payment.provider) {
      case 'stripe':
        return new StripeProvider(config.payment.stripe);
      case 'paypal':
        return new PayPalProvider(config.payment.paypal);
      default:
        throw new ContainerError(`Unknown payment provider: ${config.payment.provider}`);
    }
  });

  // Storage
  container.register<StorageProvider>('storage', () => {
    return new SupabaseStorageProvider(config.storage.supabase);
  });

  // Search
  container.register<SearchProvider>('search', () => {
    return new PostgresSearchProvider(config.search.postgres);
  });

  // Shipping (default: manual)
  container.register<ShippingProvider>('shipping', () => {
    return new ManualShippingProvider(config.shipping.manual);
  });

  // Tax
  container.register<TaxProvider>('tax', () => {
    return new PostgresTaxProvider(config.tax);
  });

  // Notification (email)
  container.register<NotificationChannel>('email', () => {
    return new ResendEmailProvider(config.notification.email);
  });

  // Auth
  container.register<AuthProvider>('auth', () => {
    return new SupabaseAuthProvider(config.auth.supabase);
  });

  return container;
}

export const container = createContainer();
```

---

# Provider Resolution in Core

Core services receive providers through their constructor. Services never touch the container directly.

```ts
// src/core/payment/payment.service.ts

import type { PaymentProvider } from './payment-provider.interface';

export class PaymentService {
  constructor(private paymentProvider: PaymentProvider) {}

  async createPayment(amount: number, currency: string): Promise<PaymentResult> {
    // Core logic, uses the injected provider
    return this.paymentProvider.createPayment(amount, currency);
  }

  async refund(orderId: string, amount?: number): Promise<PaymentResult> {
    return this.paymentProvider.refund(orderId, amount);
  }
}
```

---

# Core Service Instantiation

Core services are instantiated by the container, which wires their provider dependencies:

```ts
// src/config/container.ts (continued)

container.register<PaymentService>('paymentService', () => {
  const provider = container.resolve<PaymentProvider>('payment');
  return new PaymentService(provider);
});

container.register<OrderService>('orderService', () => {
  const payment = container.resolve<PaymentService>('paymentService');
  const shipping = container.resolve<ShippingProvider>('shipping');
  const tax = container.resolve<TaxProvider>('tax');
  const notification = container.resolve<NotificationChannel>('email');
  return new OrderService(payment, shipping, tax, notification);
});
```

---

# Usage in Feature Modules

Feature modules resolve services from the container. API routes and pages follow the same pattern.

```ts
// src/features/checkout/services/checkout-service.ts

import { container } from '../../../config/container';
import type { PaymentService } from '../../../core/payment/payment.service';

export class CheckoutFeatureService {
  private paymentService = container.resolve<PaymentService>('paymentService');
  private cartService = container.resolve<CartService>('cartService');
  private orderService = container.resolve<OrderService>('orderService');
}
```

---

# Testing: Mock Injection

The container is resettable, making tests straightforward:

```ts
// src/core/payment/__tests__/payment.service.test.ts

import { container } from '../../../config/container';
import { MockPaymentProvider } from './mock-payment-provider';

beforeEach(() => {
  container.reset();
  container.register<PaymentProvider>('payment', () => new MockPaymentProvider());
});

test('creates payment successfully', async () => {
  const paymentService = container.resolve<PaymentService>('paymentService');
  const result = await paymentService.createPayment(1000, 'USD');
  expect(result.success).toBe(true);
});
```

---

# Tenant-Specific Providers

For multi-tenant deployments, each tenant may use different providers:

```ts
// src/config/tenant-container.ts

export function createTenantContainer(tenantConfig: TenantConfig): Container {
  const c = new Container();

  c.register<PaymentProvider>('payment', () => {
    switch (tenantConfig.paymentProvider) {
      case 'stripe': return new StripeProvider(tenantConfig.stripe);
      case 'paypal': return new PayPalProvider(tenantConfig.paypal);
    }
  });

  // Same pattern for other providers
  return c;
}
```

Feature modules resolve from the tenant container when tenant-specific providers are configured:

```ts
const tenantContainer = createTenantContainer(tenantConfig);
const payment = tenantContainer.resolve<PaymentProvider>('payment');
```

---

# Container Access Rules

| Component | Can resolve from container? | Should receive via injection? |
|-----------|---------------------------|-------------------------------|
| Core services | No | Yes (constructor injection) |
| Feature modules | Yes | Convenience pattern only |
| API route handlers | Yes | When using feature modules |
| Pages/Components | No | Via feature modules or hooks |
| Tests | Yes | Override registrations |
| Plugins | No | Via PluginContext only |

---

# Registered Service Map

| Key | Interface | Default Implementation | Swappable |
|-----|-----------|----------------------|-----------|
| `payment` | `PaymentProvider` | `StripeProvider` | Yes |
| `storage` | `StorageProvider` | `SupabaseStorageProvider` | Yes |
| `search` | `SearchProvider` | `PostgresSearchProvider` | Yes |
| `shipping` | `ShippingProvider` | `ManualShippingProvider` | Yes |
| `tax` | `TaxProvider` | `PostgresTaxProvider` | Yes |
| `email` | `NotificationChannel` | `ResendEmailProvider` | Yes |
| `paymentService` | `PaymentService` | Core service | No |
| `orderService` | `OrderService` | Core service | No |
| `cartService` | `CartService` | Core service | No |
| `productService` | `ProductService` | Core service | No |

---

# Risk: Circular Dependencies

Circular dependencies between services are prevented by:
1. Core services depend on provider interfaces only (never on other Core services that might depend back)
2. Feature modules never depend on each other's internals
3. Container registration order enforces creation order
4. Runtime cycle detection in `container.register()`

---

# Review History

| Date | Author | Summary |
|------|--------|---------|
| 2026-07-30 | OpenCode | Initial specification |
