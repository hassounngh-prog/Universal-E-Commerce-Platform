# Feature Specification Guide

## Purpose

Every feature must have a written specification before implementation begins.

A feature specification is the source of truth for:

- Product requirements
- Business rules
- User experience
- Technical design
- Edge cases
- Acceptance criteria

No implementation should begin without an approved specification.

---

# Folder Structure

Each feature should have its own folder.

Example:

```text
.ai/specs/features/

├── authentication/
│   ├── spec.md
│   ├── api.md
│   ├── database.md
│   ├── ui.md
│   └── tasks.md
│
├── dashboard/
│   └── ...
│
└── payments/
    └── ...
```

A simple feature may only require `spec.md`.

Complex features can be split into multiple documents.

---

# Feature Lifecycle

```text
Idea
    │
    ▼
Specification
    │
    ▼
Architecture Review
    │
    ▼
Approval
    │
    ▼
Implementation
    │
    ▼
Testing
    │
    ▼
Deployment
```

Implementation never comes before specification.

---

# Required Sections

Every `spec.md` should contain the following sections.

---

# 1. Feature Information

## Name

Feature name.

## Status

One of:

- Draft
- In Review
- Approved
- In Development
- Testing
- Released
- Deprecated

## Priority

Examples:

- Critical
- High
- Medium
- Low

## Owner

Responsible engineer or team.

---

# 2. Business Context

Describe:

- Why this feature exists.
- Which problem it solves.
- Business value.
- Success metrics.

Answer:

Why are we building this?

---

# 3. Goals

List measurable goals.

Example:

- Reduce checkout time.
- Improve onboarding.
- Increase conversion rate.

Goals should be specific whenever possible.

---

# 4. Non-Goals

Explicitly list what is **not** included.

Example:

Version 1 does not include:

- Offline mode
- Multi-language support
- Team collaboration

Clear boundaries reduce scope creep.

---

# 5. User Stories

Write from the user's perspective.

Example:

> As a customer, I want to save my address so I can check out faster.

Each story should provide user value.

---

# 6. Functional Requirements

Describe exactly what the system must do.

Examples:

- Users can create accounts.
- Users can reset passwords.
- Administrators can disable accounts.

Use clear, testable statements.

---

# 7. Business Rules

Document domain logic.

Examples:

- Email addresses must be unique.
- Orders cannot be cancelled after shipping.
- Coupons expire at midnight UTC.

Business rules belong here, not scattered in code.

---

# 8. User Experience

Define:

- User flow
- Loading states
- Empty states
- Error states
- Success states
- Notifications
- Responsive behavior

Include accessibility expectations.

---

# 9. Technical Design

Describe:

- Components
- Hooks
- Services
- APIs
- Database changes
- External integrations
- State management

Reference:

```text
.ai/project/architecture.md
```

The design should follow project architecture.

---

# 10. Data Model

If data changes are required, document:

- New entities
- Fields
- Relationships
- Constraints
- Indexes
- Migrations

Avoid undocumented schema changes.

---

# 11. API Contract

Document:

- Endpoints
- Methods
- Request body
- Response body
- Status codes
- Validation
- Error responses

API behavior must be predictable.

---

# 12. Security

Review:

- Authentication
- Authorization
- Input validation
- Sensitive data
- Abuse prevention
- Rate limiting

Every feature must include a security review.

---

# 13. Performance

Consider:

- Database queries
- Bundle size
- Rendering
- Network requests
- Caching
- Lazy loading

Performance should be planned, not added later.

---

# 14. Edge Cases

Document uncommon situations.

Examples:

- Empty data
- Slow network
- Expired sessions
- Duplicate submissions
- Concurrent updates
- Invalid input

Edge cases should be intentional.

---

# 15. Acceptance Criteria

Write measurable criteria.

Example:

- [ ] User can successfully log in.
- [ ] Invalid password shows an error.
- [ ] Session persists after refresh.
- [ ] Mobile layout functions correctly.

These criteria define completion.

---

# 16. Testing Strategy

Document required tests.

Include:

- Unit tests
- Integration tests
- End-to-end tests
- Manual verification

Critical business rules should always be tested.

---

# 17. Risks

Identify:

- Technical risks
- Business risks
- Performance risks
- Security risks

Document mitigation strategies.

---

# 18. Future Improvements

Ideas intentionally postponed.

Examples:

- Social login
- Offline support
- Advanced analytics

Do not mix future work into the current scope.

---

# AI Implementation Rules

Before implementing a feature, AI agents must verify:

- Specification is approved.
- Architecture is respected.
- Business rules are understood.
- Acceptance criteria are complete.
- Edge cases are documented.
- Security has been considered.

If the specification is incomplete or ambiguous, implementation should pause until clarification is provided.

---

# Specification Checklist

Before development begins:

- [ ] Business problem defined
- [ ] Goals documented
- [ ] Non-goals documented
- [ ] User stories written
- [ ] Functional requirements complete
- [ ] Business rules defined
- [ ] UX described
- [ ] Technical design reviewed
- [ ] Data model documented
- [ ] API contract defined
- [ ] Security reviewed
- [ ] Performance considered
- [ ] Edge cases documented
- [ ] Acceptance criteria complete
- [ ] Testing strategy defined

---

# Guiding Principle

A specification should answer every major question before implementation starts.

Developers and AI agents should be able to build the feature with confidence by following the specification, without guessing business intent or technical design.
