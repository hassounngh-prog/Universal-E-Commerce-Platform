# Software Architecture Principles

## Purpose

This document defines the architectural rules used by the AI when designing, reviewing, and evolving software systems.

Architecture exists to create:

- Clear boundaries
- Controlled complexity
- Long-term maintainability
- Scalable foundations
- Reliable development workflows

Architecture is not about creating more folders.

Architecture is about creating systems that remain understandable as they grow.

---

# 1. Architecture Goals

The architecture must optimize for:

- Scalability
- Maintainability
- Testability
- Reliability
- Security
- Performance
- Developer experience
- Business adaptability

The system should support:

- New features
- New developers
- Increased traffic
- Changing requirements
- Long-term evolution

Every architectural decision should reduce future complexity.

---

# 2. Architecture Before Implementation

Never design features directly inside code.

Before implementation:

```text
Requirement
    ↓
Business Understanding
    ↓
Architecture Analysis
    ↓
Technical Design
    ↓
Implementation
    ↓
Review
```

The AI must understand:

- Existing architecture
- Current patterns
- Dependencies
- Constraints
- Future impact

---

# 3. Feature-Driven Architecture

Prefer organizing software around business capabilities.

Avoid organizing only by technical categories.

Bad:

```text
src/

components/
services/
utils/
controllers/
models/
```

This becomes difficult as the project grows.

---

Preferred:

```text
src/

app/

features/

    authentication/

    users/

    products/

    orders/


shared/

providers/

config/

middleware/

tests/
```

Each feature owns its logic.

---

Example:

```text
features/

products/

├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── utils/
├── tests/
└── index.ts
```

A feature should contain everything required for that business capability.

---

# 4. Clear Module Boundaries

Every module must have:

- One clear responsibility
- A public interface
- Controlled dependencies
- Internal implementation protection

Prefer:

```text
Feature A

      ↓

Public Interface

      ↓

Feature B
```

Avoid:

```text
Feature A

      ↓

Feature B internal files
```

Internal details should not leak between modules.

---

# 5. Dependency Direction

Dependencies must point toward stable business logic.

Preferred:

```text
Presentation Layer

        ↓

Application Layer

        ↓

Domain Layer

        ↓

Infrastructure Layer
```

Business logic should not depend on:

- Frameworks
- Databases
- External APIs
- UI libraries

External systems should depend on business rules.

---

# 6. Clean Architecture Layers

## Presentation Layer

Responsible for:

- User interface
- User interaction
- Input collection
- Display states
- User feedback

Should not contain:

- Business rules
- Database access
- Complex calculations

---

## Application Layer

Responsible for:

- Use cases
- Workflows
- Application coordination

Examples:

```text
CreateOrderUseCase

UpdateUserProfileUseCase

ProcessPaymentUseCase
```

This layer connects the UI with business rules.

---

## Domain Layer

Contains the core business logic.

Responsible for:

- Entities
- Business rules
- Domain validations
- Core behaviors

This layer represents what the product actually does.

---

## Infrastructure Layer

Responsible for external concerns:

- Databases
- APIs
- Storage
- Messaging
- Third-party services

Infrastructure should be replaceable without rewriting business logic.

---

# 7. Frontend Architecture Rules

Frontend applications should follow:

```text
Page

 ↓

Feature Components

 ↓

Reusable Components

 ↓

UI Primitives
```

Components should be:

- Small
- Composable
- Reusable
- Predictable

Avoid:

- Giant components
- Mixed responsibilities
- Business logic inside UI
- Duplicate UI patterns

---

# 8. Backend Architecture Rules

Backend modules should follow:

```text
Module

├── Controller
├── Service
├── Repository
├── DTO
├── Entity
├── Validator
└── Tests
```

Responsibilities:

## Controller

Handles:

- HTTP requests
- Authentication extraction
- Response formatting

Should not contain business logic.

---

## Service

Handles:

- Business workflows
- Domain operations
- Application logic

---

## Repository

Handles:

- Data access
- Database queries
- Persistence logic

---

## DTO

Handles:

- External input validation
- Data transformation

---

# 9. Database Architecture

Database design must consider:

- Data integrity
- Relationships
- Query patterns
- Indexing
- Migration strategy
- Future growth

Always evaluate:

- Foreign keys
- Constraints
- Indexes
- Transaction handling
- Query performance

Avoid designing only for today's data size.

---

# 10. Shared Code Rules

Shared code must be intentional.

Move code to shared only when:

- Multiple features use it
- Its responsibility is stable
- It contains no feature-specific logic

Avoid:

```text
shared/

randomHelper.ts
misc.ts
commonStuff.ts
```

Prefer:

```text
shared/

date/

validation/

formatting/

api/

constants/

types/
```

---

# 11. API Architecture

APIs should have:

- Clear contracts
- Predictable responses
- Validation
- Error handling
- Versioning strategy when needed

Consider:

- Authentication
- Authorization
- Rate limits
- Documentation
- Monitoring

---

# 12. Scalability Principles

Architecture should support:

- More users
- More features
- More developers
- Multiple environments
- Multiple teams

Prepare foundations for:

- Authentication
- Permissions
- Localization
- Analytics
- Background jobs
- Caching
- Feature flags
- Monitoring
- Logging

Do not build complexity before it is needed.

Prepare boundaries, not unnecessary systems.

---

# 13. Architecture Decision Records

Important architectural choices must be documented.

Location:

```text
.ai/project/decisions.md
```

Each decision should include:

```markdown
## Decision

### Problem

[What problem existed]

### Options

[Solutions considered]

### Decision

[Chosen approach]

### Reason

[Why this was selected]

### Impact

[Future consequences]
```

Never rely only on memory.

---

# 14. Architecture Review Questions

Before approving architecture:

Ask:

## Responsibility

- Does every part have a clear purpose?

## Boundaries

- Are dependencies controlled?

## Scalability

- Can the system evolve?

## Maintainability

- Can another developer understand it?

## Complexity

- Is this complexity justified?

## Security

- Are risks considered?

---

# 15. Avoid Architecture Mistakes

Never create:

- Layers without purpose
- Abstractions without usage
- Generic folders without meaning
- Duplicate systems
- Tight coupling

Avoid:

- Following trends blindly
- Copying architectures without understanding
- Overengineering

---

# Architecture Vision

Build systems that are:

- Easy to understand
- Easy to modify
- Easy to scale
- Easy to test
- Easy for teams to collaborate on

The best architecture is almost invisible.

Users should only experience the quality of the product.
