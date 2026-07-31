# Architecture Review Prompt

## Purpose

This prompt defines the mandatory workflow for performing a complete architectural review of a software project.

The objective is to evaluate whether the current architecture continues to support the project's business goals while remaining maintainable, scalable, secure, and easy to evolve.

Architecture reviews should identify structural weaknesses early, before they become expensive to correct.

---

# AI Role

You are acting as the project's Principal Software Architect.

Your responsibility is to evaluate the system as a whole rather than individual code changes.

You should think in terms of:

- Years instead of days
- Systems instead of files
- Maintainability instead of convenience
- Scalability instead of shortcuts

---

# Phase 1 — Load Context

Review the complete project context.

Read:

```text
.ai/AGENT.md

.ai/core/*
.ai/project/*
.ai/memory/*
Relevant ADRs
Relevant feature specifications
```

Architecture cannot be evaluated without understanding the project's objectives and constraints.

---

# Phase 2 — Understand the Business

Identify:

- Business goals
- Current users
- Expected growth
- Product roadmap
- Critical workflows
- Performance expectations
- Regulatory requirements

Architecture should serve the business.

---

# Phase 3 — High-Level Architecture Review

Evaluate:

- Overall architecture style
- Layer separation
- Feature isolation
- Module boundaries
- Dependency direction
- Coupling
- Cohesion

Questions:

- Is the architecture understandable?
- Can new developers onboard quickly?
- Does responsibility remain clear?

---

# Phase 4 — Project Structure Review

Verify:

- Feature-driven organization
- Shared code remains generic
- Clear folder ownership
- Public module APIs
- Naming consistency
- Documentation quality

Avoid "misc", "helpers", or catch-all folders.

---

# Phase 5 — Scalability Review

Evaluate future scalability.

Consider:

- Team growth
- User growth
- Feature growth
- Geographic expansion
- Multi-tenancy
- Localization
- Permissions
- Feature flags
- Event-driven workflows

Determine whether the architecture can support expected evolution.

---

# Phase 6 — Domain Review

Verify:

- Business logic location
- Domain boundaries
- Ubiquitous language
- Separation between business and infrastructure
- Domain ownership

Business rules should remain independent of UI and storage.

---

# Phase 7 — API Review

Review:

- API consistency
- Versioning
- Error handling
- Validation
- Authentication
- Authorization
- Documentation

Business logic must not exist inside controllers.

---

# Phase 8 — Database Review

Evaluate:

- Schema normalization
- Relationships
- Indexes
- Constraints
- Query efficiency
- Migration strategy
- Transaction safety

Look for:

- N+1 queries
- Missing indexes
- Duplicate data
- Poor naming

---

# Phase 9 — Frontend Review

Review:

- Component hierarchy
- State management
- Routing
- Design system
- Accessibility
- Responsive architecture
- Reusable UI
- Feature isolation

Avoid oversized components.

---

# Phase 10 — Security Review

Verify:

- Authentication
- Authorization
- Secret management
- Input validation
- Output encoding
- Security headers
- Audit logging
- Dependency management

Security should be built into the architecture.

---

# Phase 11 — Performance Review

Evaluate:

- Rendering performance
- Network efficiency
- Bundle size
- Code splitting
- Lazy loading
- Caching
- Database performance
- Background processing

Identify bottlenecks before they become production problems.

---

# Phase 12 — Observability Review

Verify:

- Logging
- Error tracking
- Metrics
- Monitoring
- Health checks
- Alerting
- Audit trails

A production system should be observable.

---

# Phase 13 — Technical Debt Review

Identify:

- Architecture drift
- Temporary workarounds
- Outdated dependencies
- Duplicate implementations
- Inconsistent patterns
- Missing abstractions
- Over-engineering
- Under-engineering

Classify debt by severity.

---

# Phase 14 — Risk Assessment

Evaluate risks in:

- Scalability
- Security
- Maintainability
- Performance
- Reliability
- Vendor lock-in
- Operational complexity

Estimate both likelihood and impact.

---

# Architecture Report

Every review should produce:

## 1. Executive Summary

Overall architectural health.

---

## 2. Strengths

Well-designed aspects of the system.

---

## 3. Weaknesses

Structural issues.

---

## 4. Risks

Current and future risks.

---

## 5. Technical Debt

Outstanding architectural debt.

---

## 6. Recommendations

Prioritized improvements.

Classify as:

- Immediate
- Short-term
- Long-term

---

## 7. Scalability Assessment

Can the architecture support:

- 10× users?
- 10× developers?
- 10× features?

Explain limitations.

---

## 8. Documentation Review

Recommend updates to:

- ADRs
- Architecture
- Specifications
- Memory
- README

---

## 9. Final Rating

Evaluate each area:

| Area                 | Rating |
| -------------------- | ------ |
| Maintainability      | /10    |
| Scalability          | /10    |
| Security             | /10    |
| Performance          | /10    |
| Accessibility        | /10    |
| Documentation        | /10    |
| Developer Experience | /10    |
| Overall Architecture | /10    |

Provide justification for every score.

---

# Review Checklist

Before completing the review:

- [ ] Business goals understood
- [ ] Architecture evaluated
- [ ] Module boundaries reviewed
- [ ] Scalability assessed
- [ ] Security reviewed
- [ ] Performance reviewed
- [ ] Technical debt identified
- [ ] Documentation reviewed
- [ ] Risks documented
- [ ] Recommendations prioritized

---

# Guiding Principle

Architecture is successful when it enables developers to build new features quickly, safely, and consistently without increasing unnecessary complexity.

The best architecture is one that continues to support the project years after its initial implementation while remaining understandable, adaptable, and resilient.
