# Code Review Workflow

## Purpose

Code review is a quality control process that ensures every change improves the system.

A good review verifies:

- Correctness
- Maintainability
- Security
- Performance
- Architecture quality
- User experience
- Long-term impact

Code review is not about finding mistakes only.

It is about building better software together.

---

# 1. Review Mindset

Review code as if you will maintain it for years.

Ask:

- Is this easy to understand?
- Is this easy to modify?
- Does this follow project architecture?
- Will this scale?
- Does this introduce future problems?

Prefer improving the system over simply approving changes.

---

# 2. Review Process

Every review should follow:

## Step 1 — Understand the Change

Before reviewing code:

Understand:

- What problem is being solved?
- Why is this change needed?
- What behavior should change?
- What should remain unchanged?

Do not review code without understanding the purpose.

---

## Step 2 — Review Architecture

Check:

- Is the correct layer responsible?
- Are boundaries respected?
- Is the folder structure correct?
- Are dependencies flowing correctly?

Verify:

```
UI

↓

Business Logic

↓

Services

↓

Infrastructure
```

Avoid:

- Business logic in UI
- Database logic in controllers
- Feature leakage

---

# 3. Code Quality Review

Check:

## Readability

- Are names meaningful?
- Is the intent obvious?
- Is the code easy to follow?

## Simplicity

Avoid:

- Unnecessary complexity
- Over-engineering
- Clever code that is hard to maintain

## Maintainability

Check:

- Single responsibility
- Clear functions
- Clear modules
- Low coupling

---

# 4. TypeScript Review

Verify:

- Strong typing is used.
- No unnecessary `any`.
- Types represent real domain concepts.
- Interfaces are clear.

Avoid:

```ts
const data: any = response;
```

Prefer:

```ts
const user: User = response;
```

---

# 5. Frontend Review

Check:

## Components

- Are components small?
- Are responsibilities clear?
- Is duplication avoided?

## State

Verify:

- Correct state ownership.
- No unnecessary global state.
- No duplicated server state.

## UX

Confirm:

- Loading states exist.
- Error states exist.
- Empty states exist.
- User feedback exists.

## Responsive Design

Check:

- Mobile-first implementation.
- Tablet compatibility.
- Desktop compatibility.

---

# 6. Backend Review

Check:

## Controllers

Should handle:

- Request receiving
- Basic validation
- Response formatting

Should not contain:

- Business logic
- Complex calculations
- Database operations

---

## Services

Should contain:

- Business rules
- Application logic
- Feature behavior

---

## Repositories

Should handle:

- Database communication
- Queries
- Data persistence

---

# 7. Database Review

Check:

- Schema design
- Relationships
- Indexes
- Query performance
- Migration safety

Look for:

- N+1 queries
- Missing indexes
- Unnecessary database calls

---

# 8. Security Review

Every change must be checked for:

## Authentication

- Is access protected?

## Authorization

- Are permissions verified?

## Input Validation

- Is external data validated?

## Data Protection

- Are secrets protected?
- Is sensitive data exposed?

## Common Risks

Check for:

- XSS
- SQL injection
- CSRF
- SSRF
- Data leakage

---

# 9. Performance Review

Check:

## Frontend

- Unnecessary renders
- Large bundles
- Missing lazy loading
- Poor image handling

## Backend

- Slow queries
- Excessive API calls
- Missing caching opportunities

Performance improvements should be intentional.

---

# 10. Testing Review

Verify:

## Unit Tests

For:

- Business logic
- Utilities
- Validation

## Integration Tests

For:

- APIs
- Database interactions
- Services

## End-to-End Tests

For:

- Important user journeys

Ask:

"Could this change break existing behavior?"

---

# 11. Documentation Review

Check whether the change requires updates to:

- README
- API documentation
- Architecture documentation
- Environment documentation
- Feature specifications

Important decisions should be recorded.

---

# 12. Review Comments Guidelines

Good review comments are:

- Specific
- Constructive
- Actionable
- Focused on improvement

Avoid:

- Personal criticism
- Style preferences without reason
- Comments without explanation

Prefer:

"Extract this logic into a service because this controller is now handling business rules."

Over:

"Move this."

---

# 13. Approval Criteria

A change can be approved when:

## Functionality

- Works as expected.

## Architecture

- Fits the system design.

## Quality

- Clean and maintainable.

## Security

- No obvious vulnerabilities.

## Performance

- No unnecessary degradation.

## Testing

- Appropriate coverage exists.

---

# Code Review Checklist

## Understanding

- [ ] Purpose is clear
- [ ] Requirements are satisfied

## Architecture

- [ ] Correct responsibilities
- [ ] Correct folder structure
- [ ] Good dependency direction

## Code

- [ ] Clean naming
- [ ] No duplication
- [ ] Strong typing
- [ ] Maintainable design

## UX

- [ ] Responsive
- [ ] Accessible
- [ ] Proper states handled

## Security

- [ ] Inputs validated
- [ ] Permissions checked
- [ ] Sensitive data protected

## Testing

- [ ] Tests included
- [ ] Regression considered

---

# Code Review Principle

The purpose of review is not to block developers.

The purpose is to create software that is:

- Easier to maintain
- Safer to change
- More reliable
- Better for users
- Better for future developers
