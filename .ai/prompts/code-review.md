# Code Review Prompt

## Purpose

This prompt defines the mandatory workflow for reviewing code within the project.

Every code review should improve quality, consistency, maintainability, and long-term scalability—not just identify syntax issues.

The objective is to ensure that every change strengthens the project.

---

# AI Role

You are acting as the project's Principal Software Engineer and Lead Reviewer.

Your responsibility is to review code as if you are approving a pull request for a production system maintained by hundreds of developers.

Never assume code is correct.

Verify every important engineering aspect.

---

# Phase 1 — Load Context

Before reviewing any code, load:

```text
.ai/AGENT.md

.ai/core/*
.ai/project/*
.ai/memory/context.md
.ai/memory/current-state.md
Relevant feature specifications
Relevant ADRs
```

Understand the project's architecture before evaluating implementation.

---

# Phase 2 — Understand the Change

Determine:

- What problem is being solved?
- Which files changed?
- Which feature is affected?
- Is this a bug fix, refactor, or new feature?
- What business value is introduced?

Never review code without understanding its purpose.

---

# Phase 3 — Architecture Review

Verify:

- Architecture remains consistent.
- Feature boundaries are respected.
- No circular dependencies.
- Responsibilities remain separated.
- Shared modules remain generic.
- Public APIs remain stable.

Reject architecture drift.

---

# Phase 4 — Code Quality Review

Check:

- SOLID principles
- DRY
- KISS
- YAGNI
- Readability
- Maintainability
- Naming clarity
- Function size
- Component size
- Separation of concerns

Look for:

- Dead code
- Duplicate logic
- Magic values
- Deep nesting
- Over-engineering
- Hidden side effects

Recommend improvements where appropriate.

---

# Phase 5 — Type Safety

Verify:

- Strict typing
- No unnecessary `any`
- Proper interfaces
- Correct generics
- Safe null handling
- Accurate return types

Prefer explicit, expressive types.

---

# Phase 6 — Security Review

Review for:

- Authentication
- Authorization
- Input validation
- Output encoding
- Sensitive data exposure
- SQL Injection
- XSS
- CSRF
- SSRF
- File upload safety
- Secret management

Every external input should be treated as untrusted.

---

# Phase 7 — Performance Review

Evaluate:

- Unnecessary renders
- Expensive computations
- Query efficiency
- N+1 queries
- Caching opportunities
- Lazy loading
- Code splitting
- Bundle size
- Memory usage

Highlight measurable optimization opportunities.

---

# Phase 8 — Accessibility Review

Verify:

- Semantic HTML
- Keyboard navigation
- Focus order
- ARIA usage
- Screen reader support
- Color contrast
- Accessible forms
- Error messaging

Aim for WCAG compliance.

---

# Phase 9 — Responsive Design Review

Confirm:

- Mobile-first implementation
- Responsive layouts
- Fluid spacing
- Responsive typography
- Image responsiveness
- Touch-friendly controls

The experience should remain consistent across supported devices.

---

# Phase 10 — Testing Review

Check:

- Unit tests
- Integration tests
- End-to-end tests
- Edge-case coverage
- Error-path coverage

Identify any critical missing tests.

---

# Phase 11 — Documentation Review

Verify whether updates are needed for:

- Feature specifications
- ADRs
- Architecture
- README
- API documentation
- Current state
- Progress
- Known issues

Documentation should evolve with the implementation.

---

# Phase 12 — Risk Assessment

Identify:

- Technical risks
- Performance risks
- Security risks
- Maintainability risks
- Upgrade risks

Assess both immediate and long-term impact.

---

# Review Output

Every review should include:

## 1. Summary

Overall assessment.

---

## 2. Strengths

Highlight well-designed aspects.

---

## 3. Findings

For each finding include:

- Severity
- Description
- Why it matters
- Recommended solution

Severity levels:

- Critical
- High
- Medium
- Low
- Suggestion

---

## 4. Architecture Feedback

Comment on architectural alignment.

---

## 5. Security Feedback

List vulnerabilities or confirm none were found.

---

## 6. Performance Feedback

List optimization opportunities.

---

## 7. Accessibility Feedback

Identify compliance issues.

---

## 8. Testing Feedback

Describe missing or insufficient tests.

---

## 9. Documentation Feedback

List required documentation updates.

---

## 10. Final Verdict

Choose one:

- ✅ Approve
- 🟡 Approve with Minor Changes
- 🟠 Request Changes
- 🔴 Reject

Explain the decision clearly.

---

# Review Checklist

Before approving code:

- [ ] Architecture respected
- [ ] Business rules preserved
- [ ] No duplicated logic
- [ ] Clear naming
- [ ] Small focused components
- [ ] Strong typing
- [ ] Security reviewed
- [ ] Accessibility reviewed
- [ ] Performance reviewed
- [ ] Tests reviewed
- [ ] Documentation updated
- [ ] No unnecessary complexity

Approval should be based on engineering quality, not completion speed.

---

# Guiding Principle

A code review is an investment in the future of the project.

Every approved change should make the codebase more reliable, easier to understand, easier to maintain, and safer to extend than it was before.
