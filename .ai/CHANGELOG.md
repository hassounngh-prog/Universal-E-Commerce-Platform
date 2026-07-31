# Changelog

---

# v0.1.0

Date: 2026-07-30

## Added

### Application Foundation

Scaffolded the project (originally "AnimaxStore") with Next.js 16 (App Router) + TypeScript.

- Initialized Next.js with TypeScript, Tailwind CSS, ESLint
- Configured TypeScript strict mode (strict, strictNullChecks, noUncheckedIndexedAccess)
- Configured Prettier formatting
- Created feature-based directory structure

### Project Structure

```
src/
├── app/            # App Router (route groups, API routes)
├── features/       # Products, cart, checkout, orders, auth
├── shared/         # UI, API client, lib, hooks, types, config
└── providers/      # React context providers
```

### Configuration

- Environment variable templates (.env.example, .env.local)
- ESLint flat config with TypeScript and Prettier integration
- Project README with structure documentation
- .gitignore with environment file patterns

### Decisions

Documented 4 Architecture Decision Records (ADR-001 through ADR-004):
- Next.js App Router with feature-driven architecture
- PostgreSQL with Prisma ORM
- Co-located API routes
- NextAuth.js for authentication

## Verified

- Clean build with no errors or warnings
- ESLint passes with no violations

# v0.2.0

Date: 2026-07-30

## Added

### Database Schema (Prisma 7.9)

14 PostgreSQL tables across the e-commerce domain:
- **Auth**: Account, Session, VerificationToken, Authenticator (NextAuth.js v5 compatible)
- **Users**: User (with CUSTOMER/ADMIN roles, password hash)
- **Catalog**: Category (self-referencing for hierarchy), Product, ProductImage
- **Cart**: Cart, CartItem (with unique constraint on cart + product)
- **Orders**: Order (with status lifecycle), OrderItem, Address, OrderAddress

### Prisma Client

- Singleton client with global caching (prevents hot-reload connection leaks)
- @prisma/adapter-pg for PostgreSQL connection
- Seed script for initial categories

### Authentication (NextAuth.js v5)

- Credentials provider with bcryptjs password hashing
- Prisma adapter for database-backed sessions
- JWT session strategy
- API route at /api/auth/[...nextauth]

### Environment

- Updated .env with Supabase connection string
- Updated .env.example and .env.local with Supabase URL and anon key
- Installed dependencies: prisma, @prisma/client, @prisma/adapter-pg, pg, next-auth@beta, @auth/prisma-adapter, bcryptjs

## Changed

- Application resolves DATABASE_URL from environment for Prisma adapter

## Verified

- Clean build with no errors or warnings
- ESLint passes with no violations

# v0.3.0

Date: 2026-07-30

## Added

### Universal Platform Transformation

Transitioned from anime-specific store architecture to CommerceCore — a universal e-commerce platform.

- **Vision**: `project/universal-platform.md` adopted as source of truth
- **Architecture**: 6-layer platform architecture (Application → Business Configuration → Commerce Core → Shared → Infrastructure → External Services)
- **8 ADRs**: Universal platform architecture, provider interface pattern, dynamic attribute system (EAV)
- **Provider abstractions**: Defined interfaces for Payment, Storage, Search, Shipping, Tax, Notification
- **Gap analysis**: 22 critical/high gaps identified; `reviews/universal-platform-gap-analysis.md`
- **Roadmap**: 10-phase implementation plan; `reviews/universal-platform-roadmap.md`

### Renamed

- `project/overview.md`: "AnimaxStore (anime)" → "CommerceCore (universal e-commerce)"
- `project/architecture.md`: Store layers → Universal platform layers
- `project/stack.md`: Anime tech stack → Universal platform stack
- `memory/context.md`: Anime terminology → Domain-agnostic ubiquitous language
- `memory/current-state.md`: Anime-phase priorities → Universal platform phase

### Documentation

- `project/decisions.md`: Extended from 5 → 8 ADRs (006, 007, 008)
- `project/architecture.md`: Full rewrite with layer diagrams, directory structure, provider patterns
- `project/stack.md`: Core modules table, Infrastructure provider implementations table
- `reviews/universal-platform-gap-analysis.md`: 22-gap analysis across 7 dimensions
- `reviews/universal-platform-roadmap.md`: 10-phase, 13-week implementation plan

## Verified

- All architecture documents consistent with universal platform vision
- No anime-specific business logic leaks in any document
- Clean build with no errors or warnings
- ESLint passes with no violations
