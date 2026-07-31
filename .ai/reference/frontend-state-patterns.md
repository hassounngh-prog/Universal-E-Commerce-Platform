Create this file:

`/.ai/reference/frontend-state-patterns.md`

```md
# Frontend State Patterns

## 1. State Management Philosophy

State management is about controlling data that changes during the application lifecycle.

The goal is not to use the biggest state library.

The goal is:

- Correct ownership
- Predictable updates
- Minimal complexity
- Good performance
- Easy maintenance

Use the simplest state solution that solves the real problem.

---

# 2. Types of Frontend State

Frontend state should be categorized before choosing a tool.

The main categories:
```

UI State

-

Server State

-

URL State

-

Form State

-

Client Application State

````

Each type has different requirements.

---

# 3. UI State

UI state controls temporary interface behavior.

Examples:

- Modal visibility
- Dropdown state
- Active tab
- Sidebar open/close
- Loading indicators

Example:

```ts
const [isOpen, setIsOpen] = useState(false);
````

Use:

- Component state
- Local hooks

Avoid storing UI state globally unless multiple areas need it.

---

# 4. Server State

Server state represents data owned by a backend.

Examples:

- Users
- Products
- Orders
- Notifications

Characteristics:

- Remote source
- Async loading
- Cache requirements
- Synchronization needs

Do not manage server state manually with global state.

Prefer:

- TanStack Query
- Server components
- Framework data fetching solutions

---

# 5. Server State Pattern

Recommended flow:

```
Component

↓

Query Hook

↓

API Service

↓

Backend

↓

Database
```

Example:

```ts
const { data, isLoading, error } = useProducts();
```

Benefits:

- Automatic caching
- Refetching
- Loading handling
- Error management

---

# 6. Client Application State

Client state represents data owned by the frontend.

Examples:

- User preferences
- Theme
- Language
- Application settings
- Temporary workflow state

Use:

- Context
- Zustand
- Redux Toolkit when complexity requires it

---

# 7. State Selection Priority

Choose state solutions in this order:

```
1. Local Component State

↓

2. Server State Tools

↓

3. URL State

↓

4. Context

↓

5. Lightweight Global State

↓

6. Complex Global State Libraries
```

Do not start with global state.

---

# 8. Avoid Duplicate State

Duplicated state creates synchronization problems.

Bad:

```text
API Data

↓

Redux Store

↓

Component State
```

Multiple copies become inconsistent.

Prefer:

```text
Single Source of Truth

↓

Consumers
```

---

# 9. Derived State Pattern

Do not store values that can be calculated.

Bad:

```ts
const [itemsCount, setItemsCount] = useState(0);
```

Better:

```ts
const itemsCount = items.length;
```

Rules:

- Store original data.
- Calculate derived values.

---

# 10. URL State

Some state belongs in the URL.

Examples:

- Search filters
- Pagination
- Sorting
- Selected resource

Example:

```
/products?category=shoes&page=2
```

Benefits:

- Shareable links
- Browser navigation support
- Better UX

---

# 11. Form State

Forms have unique requirements:

- Validation
- Errors
- Dirty tracking
- Submission state

Prefer:

- React Hook Form
- Schema validation

Pattern:

```
Form Component

↓

Form Hook

↓

Validation Schema

↓

API Service
```

---

# 12. Global State Rules

Global state should be used only when:

- Multiple unrelated components need the same data
- Prop drilling becomes complex
- State lifecycle is application-wide

Examples:

Good:

- Authentication state
- Theme
- Global preferences

Bad:

- Single modal state
- One page table data
- Temporary input values

---

# 13. Context API Rules

Context is useful for:

- Dependency injection
- Global configuration
- Small shared state

Avoid:

- Large frequently-changing state
- Replacing all state management with Context

Large Context updates can cause unnecessary renders.

---

# 14. Zustand Pattern

Use lightweight stores for simple global client state.

Example:

```ts
interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
}
```

Good for:

- Small global states
- UI workflows
- Client preferences

---

# 15. Redux Toolkit Pattern

Use when the application requires:

- Complex state transitions
- Large teams
- Strict state rules
- Extensive debugging

Avoid Redux only because it is popular.

Complexity must be justified.

---

# 16. State Colocation

Keep state close to where it is used.

Prefer:

```
Page

 └── Feature Component

      └── Local State
```

Avoid:

```
Everything

↓

Global Store
```

Local state is easier to understand.

---

# 17. State Update Patterns

State updates should be:

- Predictable
- Immutable
- Minimal

Avoid:

- Mutating existing objects
- Unnecessary updates
- Large state objects

---

# 18. Performance Considerations

Avoid:

- Unnecessary global updates
- Large context providers
- Re-rendering unrelated components

Use:

- Memoization when needed
- Component splitting
- Selective subscriptions

Do not optimize before measuring.

---

# 19. State Architecture Example

A scalable frontend:

```
Application

├── Server State
│
│   └── TanStack Query
│
├── URL State
│
│   └── Router
│
├── Form State
│
│   └── React Hook Form
│
├── UI State
│
│   └── Component State
│
└── Global Client State
    │
    └── Zustand
```

---

# 20. State Management Checklist

Before adding state:

## Ownership

- Who owns this data?
- Where should it live?

## Lifetime

- Temporary?
- Page-level?
- Application-wide?

## Source

- Backend?
- Frontend?
- Derived?

## Complexity

- Is a library necessary?
- Can local state solve it?

---

# Frontend State Principle

Good state management is not about having more state tools.

It is about putting each piece of state in the correct place.

The best state architecture is the simplest one that keeps data predictable as the application grows.
