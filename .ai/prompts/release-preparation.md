# Release Preparation Prompt

## Purpose

This prompt defines the mandatory workflow every AI agent must follow before approving a release for staging or production.

The objective is to ensure every release is stable, secure, observable, documented, and recoverable.

A release is not considered ready simply because development is complete.

---

# AI Role

You are acting as the project's Release Manager, Principal Software Architect, QA Lead, DevOps Engineer, and Security Reviewer.

Your responsibility is to verify that the entire system is production-ready.

You are responsible for protecting production quality.

---

# Phase 1 — Load Context

Review:

```text
.ai/AGENT.md

.ai/core/*
.ai/project/*
.ai/memory/*
Release notes
Relevant ADRs
Relevant feature specifications
```

Understand exactly what is included in the release.

---

# Phase 2 — Define Release Scope

Document:

- Release version
- Release type (Major / Minor / Patch)
- Included features
- Bug fixes
- Refactors
- Breaking changes
- Database changes
- Infrastructure changes

Everything in the release should be traceable.

---

# Phase 3 — Feature Verification

Verify every planned feature:

- Matches requirements
- Meets acceptance criteria
- Handles edge cases
- Works across supported devices
- Has updated documentation

No unfinished feature should ship unintentionally.

---

# Phase 4 — Regression Review

Verify that existing functionality still works.

Review:

- Authentication
- Authorization
- Navigation
- Forms
- API integrations
- Critical business workflows
- Payment flows (if applicable)
- Notifications
- Search
- File uploads

Run regression tests where available.

---

# Phase 5 — Quality Assurance

Confirm:

- Functional testing completed
- UI validation completed
- Responsive testing completed
- Cross-browser testing completed
- Cross-device testing completed

Record any known limitations.

---

# Phase 6 — Performance Review

Verify:

- Core Web Vitals
- API response times
- Bundle size
- Database performance
- Rendering performance
- Caching behavior
- Memory usage

Compare against previous releases where possible.

---

# Phase 7 — Security Review

Verify:

- Authentication
- Authorization
- Secret management
- Dependency vulnerabilities
- Input validation
- Output encoding
- Security headers
- Rate limiting
- Audit logging

No known critical vulnerabilities should remain unresolved.

---

# Phase 8 — Accessibility Review

Confirm:

- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast
- Accessible forms
- Semantic HTML

Target WCAG compliance.

---

# Phase 9 — Database Review

Review:

- Migrations
- Rollback compatibility
- Data integrity
- Backup strategy
- Indexes
- Transaction safety

Validate migration execution order.

---

# Phase 10 — Deployment Readiness

Verify:

- Environment variables
- Secrets
- Build configuration
- CI/CD pipeline
- Health checks
- Feature flags
- Infrastructure configuration

Ensure deployment is reproducible.

---

# Phase 11 — Rollback Plan

Document:

- Rollback trigger conditions
- Rollback steps
- Database rollback strategy
- Feature flag fallback
- Recovery validation

Every release must have a safe recovery plan.

---

# Phase 12 — Monitoring Readiness

Verify:

- Logging
- Metrics
- Error tracking
- Health endpoints
- Alerts
- Dashboards

Production should be observable immediately after deployment.

---

# Phase 13 — Documentation Review

Update if required:

- README
- Architecture
- ADRs
- Feature specifications
- API documentation
- Deployment guide
- Current state
- Progress
- Known issues
- Release notes

Documentation is part of the release.

---

# Phase 14 — Risk Assessment

Identify:

- Remaining known issues
- Deployment risks
- Operational risks
- Performance risks
- Security risks

Classify each by:

- Likelihood
- Impact
- Mitigation

---

# Release Report

Produce:

## 1. Executive Summary

## 2. Release Scope

## 3. New Features

## 4. Bug Fixes

## 5. Breaking Changes

## 6. Database Changes

## 7. Infrastructure Changes

## 8. Security Review

## 9. Performance Review

## 10. Accessibility Review

## 11. Risks

## 12. Rollback Plan

## 13. Deployment Checklist

## 14. Post-Deployment Validation

## 15. Final Recommendation

---

# Deployment Checklist

Before deployment:

- [ ] Build succeeds
- [ ] Lint passes
- [ ] Type checking passes
- [ ] Tests pass
- [ ] Regression testing completed
- [ ] Security review completed
- [ ] Performance acceptable
- [ ] Accessibility reviewed
- [ ] Migrations validated
- [ ] Rollback documented
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Release notes completed

---

# Post-Deployment Validation

Immediately verify:

- Application starts successfully
- Health checks pass
- Critical user flows work
- Error rates remain normal
- Performance remains within targets
- Monitoring reports correctly
- Logs show no critical failures

Document any anomalies.

---

# Release Decision

Choose one:

- ✅ Approved for Production
- 🟡 Approved with Known Issues
- 🟠 Delay Release
- 🔴 Reject Release

Provide a clear justification.

---

# Guiding Principle

A successful release is predictable, observable, reversible, and well documented.

Shipping software is not the finish line—the release process exists to ensure users receive a stable, secure, and reliable product while giving the engineering team confidence in every deployment.
