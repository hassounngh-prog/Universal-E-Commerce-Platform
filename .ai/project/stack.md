# Technology Stack

---

# Frontend Stack

## Framework

Next.js 16 (App Router)

Purpose:
- File-based routing with route groups
- React Server Components for performance
- Route Handlers for API endpoints
- Image optimization and metadata
- Streaming and Partial Prerendering

## Language

TypeScript (strict mode)

Purpose:
- Type safety across the entire codebase
- Better developer experience
- Reduced runtime errors

Rules:
- strict mode enabled with strictNullChecks and noUncheckedIndexedAccess.
- Avoid `any`. Prefer explicit domain types.
- Use Zod schemas for runtime validation and type inference.

## UI Framework

Tailwind CSS v4

Purpose:
- Utility-first styling
- Consistent responsive design
- Rapid UI development

## Component Library

shadcn/ui (to be installed)

Purpose:
- Accessible, reusable UI primitives
- Consistent design language
- Customizable via Tailwind tokens
- Theme-aware via CSS variables

## Icons

Priority:
1. Lucide
2. Heroicons

---

# State Management

## Client State

React built-in state + Context API

Purpose:
- Component-local state for simple needs.
- Context for lightweight shared state (theme, auth status, tenant config).

Zustand will be evaluated when complex client state is required.

## Server State

TanStack Query (to be installed)

Purpose:
- Data fetching and caching
- Loading and error state management
- Automatic cache invalidation

---

# Forms and Validation

## Form Management

React Hook Form (to be installed)

Purpose:
- Efficient form rendering
- Simplified validation integration

## Schema Validation

Zod (to be installed)

Purpose:
- Runtime validation shared between client and server
- TypeScript type inference from schemas

---

# Commerce Core

The platform's business-agnostic engine. Contains no industry-specific assumptions.

Core modules (in `src/core/`):
- Authentication & Authorization
- Product domain with dynamic attribute system
- Cart (guest + authenticated + merge)
- Checkout pipeline orchestration
- Order lifecycle
- Pricing engine (base, sale, tier, wholesale, multicurrency)
- Inventory abstraction
- Shipping provider interface
- Tax engine interface
- Payment provider interface
- Search provider interface
- Notification channel interface
- Storage provider interface
- Coupon & discount engine
- Review & rating system
- CMS (pages, blog, content blocks)
- Multi-tenant configuration
- User & account management

---

# Infrastructure Layer

Provider implementations live in `src/infrastructure/`. Each provider implements a Core interface.

## Payment Providers

- Stripe (planned)
- PayPal (planned)
- Additional providers as needed

## Storage Providers

- Supabase Storage (current)
- AWS S3 (planned)
- Cloudflare R2 (planned)
- Local filesystem (dev)

## Search Providers

- PostgreSQL Full Text (default)
- Meilisearch (planned)
- Algolia (planned)

## Shipping Providers

- Manual shipping (default)
- UPS (planned)
- FedEx (planned)
- DHL (planned)

## Notification Channels

- Email via Resend / SendGrid (planned)
- SMS via Twilio (planned)
- Push notifications (planned)

## Tax Providers

- Built-in tax engine (default)
- Third-party tax (planned)

---

# Backend Stack

## Framework

Next.js Route Handlers (App Router)

Purpose:
- Co-located API with frontend
- Serverless-ready architecture

## API Style

REST

Purpose:
- Predictable, resource-oriented endpoints
- Simple caching semantics
- Version-ready (`/api/v1/...`)

---

# Database Stack

## Database

PostgreSQL

## ORM

Prisma (installed v7.9.1)

Purpose:
- Type-safe database access
- Declarative schema management
- Migration generation

Rules:
- All database access through repository pattern in infrastructure
- Core defines data interfaces; infrastructure implements them with Prisma

---

# Authentication

NextAuth.js v5 (installed)

Purpose:
- Secure authentication with multiple providers
- Prisma adapter integration
- Session management
- Extensible provider system (credentials, OAuth, magic link, passkeys)

---

# Plugin System

Extensions live in `src/plugins/`. Each plugin is isolated.

Plugin types:
- Wishlist
- Affiliate Program
- Loyalty Points
- Gift Cards
- Marketplace / Multi-vendor
- Wholesale / B2B
- Subscription Commerce
- POS Integration
- AI Product Recommendations

---

# Storage

Supabase Storage (initial, to be abstracted)

Purpose:
- Product image and asset storage
- CDN delivery

Provider abstraction:
- All storage access through `StorageProvider` interface
- Swap provider via configuration (Supabase, S3, Cloudinary, R2)

---

# Infrastructure

## Containerization

Docker (to be configured)

## CI/CD

GitHub Actions (to be configured)

## Hosting

Vercel (target)

---

# Testing Stack

## Unit Testing

Vitest (to be installed)

Purpose:
- Test Core business logic in isolation
- Test shared utilities
- Test Zod validation schemas

## Integration Testing

Vitest + Supertest (to be installed)

Purpose:
- Test API routes with provider mocking
- Test database repository implementations

## End-to-End Testing

Playwright (to be installed)

Purpose:
- Test full user flows
- Test multi-tenant scenarios

---

# Development Tools

## Package Manager

npm

## Code Quality

- ESLint (flat config)
- Prettier
- TypeScript strict mode

## Version Control

Git

---

# Technology Decision Rules

Before adding any new dependency:
1. Does it solve a real problem?
2. Does it improve the system?
3. Is it actively maintained?
4. Does it increase complexity?
5. Can the team support it?

Avoid dependencies without strong justification.

Prefer:
- Provider abstractions over direct vendor imports
- Interfaces over concrete implementations in Core
- Configuration over hardcoding
- Convention over configuration where beneficial
