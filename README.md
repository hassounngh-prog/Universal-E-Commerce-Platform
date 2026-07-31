<<<<<<< HEAD
# AnimaxStore

An e-commerce platform for anime and manga merchandise.

Built with Next.js, TypeScript, Tailwind CSS, and Prisma.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command         | Description          |
| --------------- | -------------------- |
| `npm run dev`   | Start dev server     |
| `npm run build` | Production build     |
| `npm run start` | Start production     |
| `npm run lint`  | Run ESLint           |
| `npm run typecheck` | Run TypeScript check |

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (marketing)/  # Marketing pages (home, about)
│   ├── (store)/      # Store pages (products, cart, checkout)
│   ├── (auth)/       # Auth pages (login, register)
│   ├── account/      # User account pages
│   ├── admin/        # Admin panel
│   └── api/          # Route handlers
├── features/         # Feature modules
│   ├── products/     # Product catalog feature
│   ├── cart/         # Shopping cart feature
│   ├── checkout/     # Checkout feature
│   ├── orders/       # Orders feature
│   └── auth/         # Authentication feature
├── shared/           # Reusable code
│   ├── ui/           # UI components
│   ├── api/          # API client
│   ├── lib/          # Utilities
│   ├── hooks/        # Shared hooks
│   ├── types/        # Shared types
│   └── config/       # Configuration
└── providers/        # React providers
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth.js
- **State:** TanStack Query

For detailed stack documentation, see `.ai/project/stack.md`.

---

## Architecture

This project follows feature-driven architecture with clean separation of concerns. Each business capability is a self-contained feature module.

For full architecture documentation, see `.ai/project/architecture.md`.
