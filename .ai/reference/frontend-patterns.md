# Frontend Patterns Reference

## Purpose

This document defines frontend engineering patterns that should be followed when building user interfaces.

The goal is to create frontend systems that are:

- Consistent
- Scalable
- Maintainable
- Accessible
- Performant
- Easy for other developers to understand

Frontend development is not only about creating screens.

It is about creating a reliable interface system that can evolve for years.

---

# 1. Frontend Architecture Philosophy

Frontend code should be organized around:

- Features
- User experiences
- Business domains
- Clear responsibilities

Avoid organizing only by technical type.

Prefer:

```
features/

├── authentication/
├── dashboard/
├── products/
└── profile/
```

Avoid:

```
components/
hooks/
services/
pages/
```

with hundreds of unrelated files.

The closer code is to the feature it belongs to, the easier it is to maintain.

---

# 2. Component Design Principles

Components should be:

- Small
- Focused
- Reusable
- Composable
- Predictable

A component should have one clear responsibility.

Avoid:

- Huge components
- Components containing business logic
- Components handling API calls directly
- Components managing unrelated states

Prefer:

```
Page

↓

Feature Component

↓

Reusable Components

↓

UI Primitives
```

---

# 3. Component Structure Pattern

Recommended:

```
ComponentName/

├── ComponentName.tsx
├── ComponentName.types.ts
├── ComponentName.constants.ts
├── ComponentName.utils.ts
└── index.ts
```

For simple components:

```
Button.tsx
Card.tsx
Input.tsx
```

For complex features:

```
features/

products/

├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
└── index.ts
```

---

# 4. UI Component Hierarchy

Use layered components.

Example:

```
Application Page

↓

Feature Components

↓

Shared Components

↓

Design System Components

↓

Primitive Elements
```

Responsibilities:

## Pages

Handle:

- Routing
- Page composition
- Data loading coordination

Should not contain:

- Complex reusable UI
- Business rules

---

## Feature Components

Handle:

- Feature-specific UI
- Feature behavior
- Feature state

Example:

```
ProductCard
CheckoutSummary
UserProfileHeader
```

---

## Shared Components

Used by multiple features.

Examples:

```
Modal
Dropdown
DataTable
Pagination
```

Only move components here when they are truly shared.

---

# 5. State Management Pattern

Use the simplest state solution.

Priority:

1. Local component state

For:

- Forms
- Toggles
- UI interactions

---

2. Server state

For:

- API data
- Cached resources
- Remote synchronization

---

3. Shared client state

For:

- Global UI state
- User preferences
- Application state

Avoid storing duplicated data.

Bad:

```
API data
+
global state copy
+
component state copy
```

Prefer one source of truth.

---

# 6. Data Fetching Pattern

Components should not directly handle complex API logic.

Preferred:

```
Component

↓

Custom Hook

↓

Service Layer

↓

API Client

↓

Backend
```

Example:

```
useProducts()

↓

productService.getProducts()

↓

apiClient.get()
```

Benefits:

- Easier testing
- Cleaner components
- Reusable logic

---

# 7. Form Pattern

Forms should separate:

UI:

```
Input components
Button
Layout
```

from:

Logic:

```
Validation
Submission
Error handling
API calls
```

Recommended flow:

```
Form Component

↓

Form Hook

↓

Schema Validation

↓

Service

↓

Backend
```

Always handle:

- Loading state
- Validation errors
- Server errors
- Success feedback

---

# 8. Loading States

Every async UI must consider:

## Loading

Show:

- Skeletons
- Progress indicators
- Disabled states

---

## Success

Show:

- Data clearly
- Confirmation when needed

---

## Empty

Explain:

- Nothing exists yet
- What user can do next

---

## Error

Provide:

- Clear message
- Recovery action

Never leave users with blank screens.

---

# 9. Responsive Design Pattern

Mobile-first is mandatory.

Build order:

```
Mobile

↓

Tablet

↓

Desktop

↓

Large Screens
```

Avoid designing desktop first and shrinking later.

Consider:

- Touch targets
- Navigation changes
- Content priority
- Layout changes

---

# 10. Accessibility Pattern

Every component should consider:

- Semantic HTML
- Keyboard navigation
- Focus states
- Screen readers
- Color contrast

Examples:

Bad:

```
<div onClick={handleClick}>
```

Better:

```
<button onClick={handleClick}>
```

Accessibility is part of quality, not an extra feature.

---

# 11. Design System Consistency

Never create random UI styles.

Follow:

- Design tokens
- Existing components
- Existing spacing rules
- Existing typography rules

Before creating a new component:

Check:

- Does it already exist?
- Can an existing component be extended?
- Does this create inconsistency?

Use:

1. Untitled UI Icons
2. Lucide
3. Heroicons

Avoid mixing icon styles.

---

# 12. Performance Patterns

Always consider:

## Rendering

Avoid:

- Unnecessary re-renders
- Large component trees
- Expensive calculations during render

---

## Images

Use:

- Optimized formats
- Proper sizing
- Lazy loading

---

## Bundle Size

Avoid:

- Unnecessary dependencies
- Large libraries for small tasks

---

## Data

Consider:

- Pagination
- Caching
- Prefetching
- Request optimization

---

# 13. Frontend Security Patterns

Never trust frontend code.

Always protect:

- User permissions
- Sensitive actions
- Data access

Frontend validation improves UX.

Backend validation provides security.

---

# 14. Error Boundary Pattern

Applications should handle unexpected failures.

Provide:

- User-friendly fallback UI
- Error reporting
- Recovery options

Never show broken interfaces without explanation.

---

# 15. Frontend Quality Checklist

Before completing a feature:

## Architecture

- Is responsibility clear?
- Is code placed correctly?
- Are dependencies controlled?

## Components

- Are components reusable?
- Are they too large?
- Is logic separated?

## UX

- Loading state exists?
- Error state exists?
- Empty state exists?

## Responsive

- Mobile works?
- Tablet works?
- Desktop works?

## Accessibility

- Keyboard support?
- Semantic HTML?
- Proper contrast?

## Performance

- Optimized rendering?
- Optimized assets?
- No unnecessary requests?

---

# Frontend Rule

A good frontend is not only visually attractive.

It is:

- Easy to use
- Easy to maintain
- Easy to extend
- Fast
- Accessible
- Consistent

Build interfaces that can survive product growth.
