# Architecture Patterns Reference

## Purpose

This document contains proven software architecture patterns that help design scalable, maintainable, and reliable systems.

These patterns are references, not mandatory rules.

Every architectural decision must still respect:

- Business requirements
- Project constraints
- Existing architecture
- Simplicity principles

---

# 1. Clean Architecture

## Principle

Separate software into layers with clear responsibilities.

The main goal:

> Business logic should not depend on external technologies.

---

## Structure

```text
Presentation Layer

        ↓

Application Layer

        ↓

Domain Layer

        ↓

Infrastructure Layer
```

---

## Presentation Layer

Responsible for:

- User interaction
- Request handling
- Data presentation

Should not contain:

- Business rules
- Database logic
- Complex calculations

Examples:

- React components
- Controllers
- API routes

---

## Application Layer

Responsible for:

- Use cases
- Application workflows
- Coordinating operations

Examples:

```text
CreateUser
ProcessPayment
GenerateReport
```

---

## Domain Layer

Contains:

- Business rules
- Entities
- Core logic
- Domain validations

This layer represents what the product does.

---

## Infrastructure Layer

Responsible for external systems:

- Database
- APIs
- File storage
- Third-party services

Infrastructure can change without rewriting business logic.

---

# 2. Feature-Based Architecture

## Principle

Organize code around business features instead of technical categories.

Prefer:

```text
features/

├── authentication
├── users
├── products
└── orders
```

Over:

```text
components/
services/
controllers/
models/
```

---

## Feature Example

```text
products/

├── components
├── hooks
├── services
├── schemas
├── types
├── utils
└── index.ts
```

Benefits:

- Better ownership
- Easier scaling
- Less coupling
- Easier onboarding

---

# 3. Separation of Concerns

Each part of the system should have one responsibility.

Example:

Frontend:

```text
Component

↓

Hook

↓

Service

↓

API Client

↓

Backend
```

Backend:

```text
Controller

↓

Service

↓

Repository

↓

Database
```

Avoid mixing layers.

---

# 4. Dependency Direction

Dependencies should point toward stable business logic.

Preferred:

```text
UI

↓

Application Logic

↓

Domain Logic

↓

External Systems
```

Avoid:

```text
Business Logic

↓

UI Framework
```

Business rules should survive technology changes.

---

# 5. Modular Design

A module should have:

- Clear responsibility
- Public interface
- Controlled dependencies

Prefer:

```text
Feature A

↓

Public API

↓

Feature B
```

Avoid:

```text
Feature A

↓

Feature B internal files
```

---

# 6. Repository Pattern

## Purpose

Separate database access from business logic.

Example:

```text
Service

↓

Repository

↓

Database
```

Benefits:

- Easier testing
- Database flexibility
- Cleaner business logic

---

# 7. Service Layer Pattern

Services contain application behavior.

Good:

```text
OrderService
PaymentService
UserService
```

Avoid:

```text
Controller:

- Validate everything
- Calculate business rules
- Access database
```

Controllers should coordinate, not think.

---

# 8. Component Composition Pattern

Frontend components should be:

- Small
- Reusable
- Composable

Preferred:

```text
Page

↓

Feature Component

↓

Reusable Component

↓

Primitive Component
```

Avoid large components containing:

- UI
- Business logic
- Data fetching
- Validation

---

# 9. Event-Driven Architecture

Useful when systems grow.

Instead of:

```text
Order Service

↓

Email Service

↓

Analytics Service
```

Use:

```text
Order Created Event

↓

Subscribers:

Email
Analytics
Notifications
```

Benefits:

- Lower coupling
- Easier scaling
- Independent features

Use only when complexity justifies it.

---

# 10. Architecture Decision Rule

Before introducing a pattern, ask:

1. Does this solve a real problem?
2. Does it reduce complexity?
3. Does it improve maintainability?
4. Will future developers understand it?

Patterns are tools.

Using more patterns does not automatically create better architecture.

---

# Architecture Principle

The best architecture is not the one with the most layers.

The best architecture is the one that makes the system:

- Easy to understand
- Easy to change
- Easy to test
- Easy to scale
- Easy for teams to maintain
