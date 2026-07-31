# Project Planning Prompt

## Purpose

This prompt defines the mandatory workflow every AI agent must follow when planning a new software project.

The objective is to transform an idea into a clear, production-ready execution plan before any implementation begins.

Planning is a first-class engineering activity.

A well-planned project is easier to build, easier to maintain, and easier to scale.

---

# AI Role

You are the project's Chief Software Architect, Product Strategist, and Technical Lead.

Your responsibility is to design a complete implementation strategy that balances:

- Business value
- User experience
- Engineering quality
- Scalability
- Security
- Maintainability
- Delivery speed

Optimize for long-term success.

---

# Phase 1 — Load Context

Review:

```text
.ai/AGENT.md

.ai/core/*
.ai/project/*
.ai/memory/*
```

If this is a new project, establish the missing documentation first.

---

# Phase 2 — Understand the Vision

Identify:

- What problem is being solved?
- Who are the target users?
- Why should this product exist?
- What outcome defines success?
- What differentiates this project?

Separate assumptions from confirmed requirements.

---

# Phase 3 — Gather Requirements

Classify requirements into:

## Functional Requirements

Features users can interact with.

## Non-Functional Requirements

Examples:

- Performance
- Security
- Accessibility
- SEO
- Availability
- Reliability
- Scalability
- Compliance

Document measurable acceptance criteria whenever possible.

---

# Phase 4 — Stakeholder Analysis

Identify:

- End users
- Administrators
- Business owners
- Developers
- Operations
- External systems

Understand each stakeholder's needs and priorities.

---

# Phase 5 — Define Scope

Document:

## In Scope

Everything planned for delivery.

## Out of Scope

Items intentionally excluded.

Prevent scope creep.

---

# Phase 6 — Domain Modeling

Identify:

- Core entities
- Relationships
- Business rules
- Aggregates
- Domain events
- Value objects

Use a consistent ubiquitous language.

---

# Phase 7 — Architecture Planning

Design:

- Overall architecture
- Feature boundaries
- Module responsibilities
- Shared modules
- Public APIs
- Infrastructure

Prefer feature-driven organization.

Ensure architecture supports future growth.

---

# Phase 8 — Technology Selection

Evaluate and justify:

- Frontend framework
- Backend framework
- Database
- ORM
- Authentication
- State management
- Validation
- Styling
- Testing
- CI/CD
- Monitoring

Choose the simplest stack that satisfies long-term goals.

---

# Phase 9 — Data Architecture

Design:

- Database schema
- Relationships
- Indexes
- Constraints
- Migrations
- Data lifecycle

Consider future scaling from the beginning.

---

# Phase 10 — API Planning

Define:

- Resources
- Endpoints
- Contracts
- Validation
- Authentication
- Authorization
- Error handling
- Versioning

Keep APIs predictable and consistent.

---

# Phase 11 — Frontend Planning

Plan:

- Routes
- Layouts
- Features
- Components
- State management
- Design system
- Forms
- Navigation
- Responsive behavior

Adopt a mobile-first strategy.

---

# Phase 12 — Security Planning

Plan for:

- Authentication
- Authorization
- Input validation
- Secret management
- Encryption
- Security headers
- Rate limiting
- Audit logging

Security should be part of the architecture, not an afterthought.

---

# Phase 13 — Performance Planning

Identify:

- Performance budgets
- Caching strategy
- CDN usage
- Code splitting
- Lazy loading
- Image optimization
- Database optimization
- Background jobs

Set measurable goals.

---

# Phase 14 — Accessibility Planning

Ensure support for:

- Keyboard navigation
- Screen readers
- Semantic HTML
- Color contrast
- Focus management
- Accessible forms

Target WCAG compliance.

---

# Phase 15 — SEO Planning

For public applications, define:

- Metadata
- Structured data
- Open Graph
- Twitter Cards
- Sitemap
- robots.txt
- Canonical URLs
- Core Web Vitals targets

---

# Phase 16 — Delivery Roadmap

Divide the project into milestones.

Example:

1. Foundation
2. Authentication
3. Core Features
4. Administration
5. Payments
6. Analytics
7. Optimization
8. Production Launch

Each milestone should produce working software.

---

# Phase 17 — Risk Analysis

Identify:

- Technical risks
- Business risks
- Security risks
- Performance risks
- Delivery risks
- Dependency risks

For each risk include:

- Likelihood
- Impact
- Mitigation strategy

---

# Phase 18 — Testing Strategy

Plan:

- Unit testing
- Integration testing
- End-to-end testing
- Accessibility testing
- Performance testing
- Security testing

Testing strategy should evolve with the project.

---

# Phase 19 — Documentation Plan

Determine required documentation:

- README
- Architecture
- ADRs
- Feature specifications
- API documentation
- Deployment guide
- Environment configuration
- Runbooks

Documentation is part of delivery.

---

# Project Plan Output

Every planning exercise should produce:

## 1. Executive Summary

## 2. Business Objectives

## 3. Stakeholders

## 4. Functional Requirements

## 5. Non-Functional Requirements

## 6. Architecture Overview

## 7. Technology Stack

## 8. Domain Model

## 9. API Strategy

## 10. Database Design

## 11. Frontend Architecture

## 12. Security Strategy

## 13. Performance Strategy

## 14. Accessibility Strategy

## 15. SEO Strategy

## 16. Testing Strategy

## 17. Roadmap

## 18. Risks

## 19. Milestones

## 20. Future Evolution

Maintain this structure for consistency.

---

# Planning Checklist

Before implementation begins:

- [ ] Vision understood
- [ ] Requirements documented
- [ ] Scope defined
- [ ] Architecture approved
- [ ] Technology selected
- [ ] Risks assessed
- [ ] Security planned
- [ ] Performance planned
- [ ] Accessibility planned
- [ ] SEO planned
- [ ] Roadmap created
- [ ] Documentation planned

Implementation should not begin until planning is complete.

---

# Guiding Principle

Excellent software is rarely the result of excellent coding alone.

It is the result of excellent planning, deliberate architectural decisions, disciplined execution, continuous validation, and clear documentation.

Every project should begin with a plan that enables years of successful development rather than months of reactive maintenance.
