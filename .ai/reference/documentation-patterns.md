# Documentation Patterns

## 1. Documentation Philosophy

Documentation is part of the product.

Good documentation allows:

- Faster onboarding
- Better collaboration
- Easier maintenance
- Safer changes
- Knowledge preservation

Documentation should reduce dependency on individual people.

The goal:

```text
Knowledge

↓

Shared Understanding

↓

Better Decisions

↓

Better Software
```

---

# 2. Documentation Principles

Documentation should be:

- Clear
- Accurate
- Maintained
- Easy to find
- Written for the intended audience

Avoid:

- Documentation nobody reads
- Outdated information
- Explaining obvious code
- Duplicating information everywhere

---

# 3. Types of Documentation

A mature project should maintain different documentation levels.

## Project Documentation

Explains:

- What the product is
- Business goals
- Main features
- Target users

Location example:

```text
.ai/project/
```

---

## Architecture Documentation

Explains:

- System design
- Technical decisions
- Boundaries
- Data flow
- Infrastructure

Location example:

```text
.ai/project/architecture.md
```

---

## Feature Documentation

Explains:

- Feature purpose
- Requirements
- User behavior
- Technical considerations

Location:

```text
.ai/specs/features/
```

---

## Development Documentation

Explains:

- Setup instructions
- Development workflow
- Coding rules
- Contribution process

Example:

```text
README.md
CONTRIBUTING.md
```

---

# 4. README Standards

Every project should have a useful README.

A good README includes:

## Overview

Explain:

- What the project does
- Why it exists
- Main capabilities

---

## Technology Stack

Document:

- Frontend technologies
- Backend technologies
- Database
- Infrastructure

Example:

```text
Frontend:
React + TypeScript

Backend:
NestJS

Database:
PostgreSQL
```

---

## Installation

Explain:

- Requirements
- Dependencies
- Setup steps

Example:

```bash
npm install

npm run dev
```

---

## Environment Setup

Document:

- Required variables
- Configuration steps
- External services

Never include secrets.

---

## Development Workflow

Explain:

- Branch strategy
- Testing process
- Deployment flow

---

# 5. Architecture Documentation

Architecture documentation should explain decisions, not only structures.

Include:

## System Overview

Example:

```text
Frontend

↓

API

↓

Application Services

↓

Database
```

---

## Major Components

Explain:

- Responsibility
- Communication
- Dependencies

---

## Data Flow

Document:

- How information moves
- Where processing happens
- Where data is stored

---

# 6. Architecture Decision Records (ADR)

Important decisions should be documented.

Format:

```markdown
# Decision: Use PostgreSQL

## Context

Why this decision was needed.

## Options

Option A:
Option B:

## Decision

What was chosen.

## Reason

Why this option was selected.

## Consequences

Future impact.
```

Location:

```text
.ai/project/decisions.md
```

---

# 7. Code Documentation

Document code when it improves understanding.

Good comments explain:

- Why something exists
- Complex reasoning
- Important trade-offs

Example:

```ts
// Retry because payment provider
// occasionally returns temporary failures.
```

Avoid:

```ts
// Add two numbers
sum(a, b);
```

The code already explains that.

---

# 8. API Documentation

Every API should document:

- Endpoint purpose
- Request format
- Response format
- Authentication requirements
- Error responses

Example:

```text
POST /users

Purpose:
Create a new user

Request:
{
 name,
 email
}

Response:
{
 id,
 name
}
```

---

# 9. Database Documentation

Document:

- Important entities
- Relationships
- Constraints
- Migration decisions

Example:

```text
User

has many

Orders
```

Avoid undocumented critical business rules.

---

# 10. Feature Documentation

Every important feature should define:

## Purpose

Why does this feature exist?

---

## User Flow

Example:

```text
User opens page

↓

Submits form

↓

Validation

↓

Processing

↓

Success result
```

---

## Requirements

Include:

- Functional requirements
- Non-functional requirements
- Edge cases

---

# 11. Documentation During Development

Documentation should evolve with the code.

Update when:

- Architecture changes
- Important decisions are made
- New patterns are introduced
- Workflows change

Avoid waiting until the end.

---

# 12. Documentation Ownership

Every document should have clear ownership.

Define:

- Who maintains it
- When it should be updated
- What changes require updates

A document without ownership becomes outdated.

---

# 13. Documentation Structure

Recommended:

```text
project/

├── README.md

├── docs/

│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   ├── guides/
│   └── decisions/
```

For AI-assisted projects:

```text
.ai/

├── core/
├── project/
├── reference/
├── workflows/
└── memory/
```

---

# 14. Documentation Review

Review documentation regularly.

Check:

## Accuracy

- Is it still correct?

## Completeness

- Are important decisions documented?

## Clarity

- Can a new developer understand it?

## Consistency

- Does it match the current system?

---

# 15. Documentation Anti-Patterns

Avoid:

## Documentation Drift

Problem:

Documentation describes an old system.

Solution:

Update with changes.

---

## Too Much Documentation

Problem:

Huge documents nobody uses.

Solution:

Keep information focused.

---

## Missing Context

Problem:

Only explaining what, not why.

Solution:

Document decisions and reasoning.

---

## Duplicate Sources

Problem:

Same information exists in multiple places.

Solution:

Have one source of truth.

---

# 16. AI-Assisted Development Documentation

AI agents need structured context.

Maintain:

```text
.ai/

├── AGENT.md
├── core/
├── project/
├── reference/
├── prompts/
├── workflows/
└── memory/
```

The AI should understand:

- Project identity
- Engineering rules
- Architecture decisions
- Current progress
- Existing patterns

---

# Documentation Checklist

Before finishing a feature:

## Required

- Is the feature documented?
- Are decisions recorded?
- Is architecture updated if needed?
- Are setup instructions correct?

## Quality

- Is information easy to find?
- Is the document clear?
- Is it maintained?

---

# Documentation Principle

Good documentation is not writing more.

Good documentation is preserving the knowledge needed to build, maintain, and evolve the system.

The best documentation allows a new developer to become productive quickly without depending on another person.
