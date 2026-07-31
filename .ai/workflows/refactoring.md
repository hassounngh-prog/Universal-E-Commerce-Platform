# Refactoring Workflow

## Purpose

This workflow defines the standard process for improving existing code without changing its intended behavior.

Refactoring is used to:

- Reduce complexity
- Improve readability
- Remove technical debt
- Improve maintainability
- Improve performance when needed
- Prepare the system for future growth

Refactoring is not rewriting.

The goal is a better internal structure with the same external behavior.

---

# Phase 1 — Identify the Need

Before refactoring, understand why it is needed.

Common reasons:

- Duplicate code
- Large files
- Complex functions
- Poor architecture boundaries
- Difficult testing
- Slow performance
- Hard onboarding
- Increasing maintenance cost

Avoid refactoring without a clear purpose.

---

# Phase 2 — Analyze Current Code

Understand the existing system.

Review:

- Current behavior
- Dependencies
- Data flow
- Related features
- Existing tests
- Performance impact

Questions:

- What problem are we solving?
- What risks exist?
- What should remain unchanged?
- Who depends on this code?

---

# Phase 3 — Define Refactoring Goals

Before changing code, define success criteria.

Examples:

## Code Quality

- Reduce file complexity
- Improve naming
- Remove duplication

## Architecture

- Improve boundaries
- Separate responsibilities
- Reduce coupling

## Performance

- Reduce unnecessary operations
- Improve rendering
- Optimize queries

---

# Phase 4 — Create a Safe Plan

Plan changes before implementation.

Consider:

- Small incremental changes
- Backward compatibility
- Migration strategy
- Testing requirements

Avoid:

- Large uncontrolled rewrites
- Changing multiple unrelated systems
- Removing working behavior

---

# Phase 5 — Refactoring Principles

Follow:

## Preserve Behavior

The application should continue working the same way unless improvement requires a behavior change.

## Improve Clarity

Prefer:

- Better names
- Smaller functions
- Clear responsibilities

## Reduce Complexity

Remove:

- Duplicate logic
- Unnecessary conditions
- Dead code
- Unused dependencies

## Improve Structure

Move code toward:

- Better modules
- Cleaner boundaries
- Reusable abstractions

---

# Phase 6 — Common Refactoring Patterns

## Extract Function

When a function does too much.

Before:

```ts
processEverything();
```

After:

```ts
validateInput();
calculatePrice();
saveOrder();
```

---

## Extract Component

When UI becomes too large.

Before:

```text
LargePageComponent
```

After:

```text
Page

├── Header
├── Form
├── Results
└── Actions
```

---

## Extract Service

When business logic is mixed with controllers or UI.

Before:

```text
Controller
 ├── Validation
 ├── Business Logic
 └── Database Calls
```

After:

```text
Controller

↓

Service

↓

Repository
```

---

## Remove Duplication

Find repeated logic and create a single source of truth.

Avoid copying fixes across multiple places.

---

# Phase 7 — Testing During Refactoring

Tests are protection during change.

Before refactoring:

- Understand existing coverage.
- Add missing tests for risky areas.

During refactoring:

- Run tests frequently.
- Verify behavior.

After refactoring:

- Confirm everything works.

---

# Phase 8 — Performance Considerations

Refactoring should not accidentally reduce performance.

Review:

Frontend:

- Component renders
- Bundle size
- State updates
- Network requests

Backend:

- Database queries
- API response times
- Memory usage

Measure before optimizing.

---

# Phase 9 — Security Considerations

Ensure refactoring does not introduce:

- Missing authorization checks
- Exposed data
- Unsafe input handling
- Removed validation
- Weakened security rules

Security behavior must remain protected.

---

# Phase 10 — Code Review

Review:

## Architecture

- Are boundaries improved?
- Are responsibilities clearer?

## Code Quality

- Is code easier to understand?
- Is duplication reduced?

## Maintainability

- Will future changes be easier?

## Risk

- Did behavior accidentally change?

---

# Phase 11 — Documentation

Update documentation when refactoring changes:

- Architecture
- Folder structure
- Development patterns
- Important decisions

Record major changes in:

```text
.ai/project/decisions.md
```

---

# Refactoring Checklist

## Before

- [ ] Clear reason identified
- [ ] Current behavior understood
- [ ] Risks analyzed

## During

- [ ] Small changes made
- [ ] Tests maintained
- [ ] Architecture improved

## After

- [ ] Tests pass
- [ ] Performance checked
- [ ] Security reviewed
- [ ] Documentation updated

---

# Refactoring Principle

Good refactoring makes the codebase easier to change tomorrow.

The goal is not fewer lines of code.

The goal is:

- Better design
- Lower complexity
- Higher confidence
- Faster future development
