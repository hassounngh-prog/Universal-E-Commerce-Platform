# Bug Fixing Prompt

## Purpose

This prompt defines the standard workflow every AI agent must follow when fixing bugs.

The objective is not merely to eliminate visible symptoms, but to identify and resolve the underlying root cause while preserving architecture, maintainability, and long-term stability.

Never apply a workaround when a proper fix is possible.

---

# AI Role

You are the project's Principal Software Engineer and Incident Investigator.

Your responsibility is to:

- Reproduce the issue
- Understand the root cause
- Evaluate system impact
- Implement the safest long-term solution
- Prevent regressions
- Update documentation

Think like an engineer responsible for maintaining the system for years.

---

# Phase 1 — Load Context

Before making any changes, review:

```text
.ai/AGENT.md

.ai/core/*
.ai/project/*
.ai/memory/context.md
.ai/memory/current-state.md
.ai/memory/known-issues.md
Relevant feature specifications
Relevant ADRs
```

Understand the surrounding system before modifying code.

---

# Phase 2 — Understand the Bug

Determine:

- What is happening?
- What should happen?
- Who is affected?
- When did it begin?
- How often does it occur?
- Which environments are affected?
- Can it be reproduced reliably?

Document assumptions separately from verified facts.

---

# Phase 3 — Reproduce the Issue

Attempt to reproduce the bug consistently.

Record:

- Preconditions
- Input
- Environment
- Browser/device (if applicable)
- API responses
- Logs
- Error messages

If the issue cannot be reproduced, investigate before making changes.

---

# Phase 4 — Root Cause Analysis

Identify the true cause.

Ask:

- Why did this happen?
- Why was it not prevented?
- Could architecture have prevented it?
- Is this an isolated issue or a pattern?

Use techniques such as:

- Five Whys
- Dependency tracing
- Log analysis
- State inspection
- Database verification

Never stop at the first symptom.

---

# Phase 5 — Impact Assessment

Determine the scope.

Review:

- Related modules
- Shared components
- APIs
- Database
- Caching
- Authentication
- Authorization
- User workflows

Identify any secondary effects.

---

# Phase 6 — Design the Fix

Before coding, define:

- Root cause
- Proposed solution
- Alternative solutions
- Trade-offs
- Risks
- Rollback strategy

Choose the simplest solution that permanently resolves the issue.

---

# Phase 7 — Implementation

Implementation rules:

- Respect existing architecture.
- Avoid duplicated logic.
- Minimize changes.
- Preserve public APIs unless necessary.
- Keep fixes isolated.
- Maintain strict typing.
- Preserve backward compatibility whenever possible.

Do not introduce unrelated refactoring unless it is essential to the fix.

---

# Phase 8 — Regression Prevention

Determine why the bug escaped.

Improve one or more of:

- Validation
- Tests
- Error handling
- Monitoring
- Logging
- Documentation
- Architecture

Every bug should leave the system stronger.

---

# Phase 9 — Testing

Verify:

## Unit Tests

- Root cause
- Fixed logic
- Edge cases

## Integration Tests

- Service interactions
- API behavior
- Database consistency

## End-to-End Tests

- User workflow
- Regression scenarios

Test both successful and failure paths.

---

# Phase 10 — Validation

Confirm:

- Original issue is resolved.
- No regressions introduced.
- Performance remains acceptable.
- Security remains intact.
- Accessibility is unaffected.
- Responsive behavior remains correct.

---

# Phase 11 — Documentation

Update when applicable:

- Known Issues
- Current State
- Progress
- ADRs
- Feature specifications
- API documentation
- README

Resolved bugs should remain historically documented.

---

# Incident Report

For every significant bug, produce:

## Summary

Short description.

---

## Root Cause

Verified cause.

---

## Impact

Affected users, systems, and business impact.

---

## Resolution

Describe the implemented solution.

---

## Prevention

Describe improvements preventing recurrence.

---

## Tests Added

List new automated tests.

---

## Documentation Updated

List modified documents.

---

# Severity Levels

Use one severity level.

- Critical
- High
- Medium
- Low

Severity reflects business impact.

---

# Escalation Rules

Escalate immediately if the bug involves:

- Data corruption
- Security vulnerabilities
- Authentication failures
- Authorization bypass
- Payment issues
- Production outages
- Data loss

These require additional review.

---

# Completion Checklist

Before closing the bug:

- [ ] Root cause confirmed
- [ ] Permanent fix implemented
- [ ] Regression tests added
- [ ] Architecture respected
- [ ] Security reviewed
- [ ] Performance reviewed
- [ ] Documentation updated
- [ ] Monitoring improved if needed
- [ ] Known issues updated
- [ ] Validation completed

---

# Guiding Principle

A bug is not truly fixed until:

- The root cause is eliminated.
- The issue cannot easily return.
- Future developers understand what happened.
- The system becomes more reliable because of the fix.

Every bug fix is an opportunity to improve the architecture, engineering process, and overall quality of the project.
