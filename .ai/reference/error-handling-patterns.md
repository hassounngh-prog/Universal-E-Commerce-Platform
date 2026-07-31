# Error Handling Patterns

## 1. Error Handling Philosophy

Errors are expected parts of software systems.

A production application must assume:

- Users make mistakes.
- Networks fail.
- External services become unavailable.
- Data can be invalid.
- Systems can behave unexpectedly.

Good error handling should:

- Prevent crashes.
- Protect users.
- Preserve system integrity.
- Provide useful feedback.
- Help developers diagnose problems.

The goal:

```
Detect

↓

Understand

↓

Handle

↓

Recover

↓

Learn
```

---

# 2. Fail Safely

Systems should fail in a controlled way.

When an error occurs:

- Protect user data.
- Keep the system stable.
- Avoid exposing internal details.
- Provide a clear user experience.

Avoid:

```
Application crashed
Database error exposed
Stack trace shown to user
```

Prefer:

```
Something went wrong.

Please try again later.
```

while logging technical details internally.

---

# 3. Error Categories

Classify errors correctly.

## User Errors

Caused by incorrect user actions.

Examples:

- Invalid input
- Missing required fields
- Invalid format

Response:

- Explain the problem.
- Guide the user.
- Allow correction.

---

## Business Logic Errors

Valid requests that violate business rules.

Examples:

- Insufficient balance
- Duplicate purchase
- Expired subscription

Response:

- Return meaningful business messages.
- Keep rules centralized.

---

## System Errors

Problems inside the application.

Examples:

- Database failure
- Unexpected exceptions
- Memory issues

Response:

- Log details.
- Recover if possible.
- Alert when necessary.

---

## External Service Errors

Failures from outside systems.

Examples:

- Payment provider unavailable
- Third-party API timeout
- Email service failure

Response:

- Retry when appropriate.
- Handle fallback behavior.
- Monitor failures.

---

# 4. Error Boundaries

Errors should be handled at the correct layer.

Architecture:

```
UI Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer
```

Each layer has responsibility.

Example:

Frontend:

- Display friendly messages.

Application:

- Handle workflows.

Domain:

- Enforce business rules.

Infrastructure:

- Handle external failures.

---

# 5. Centralized Error Handling

Avoid handling errors randomly.

Bad:

```ts
try {
} catch (error) {}
```

everywhere.

Prefer:

```
Error Source

↓

Error Handler

↓

Logging

↓

User Response
```

Benefits:

- Consistency
- Easier maintenance
- Better monitoring

---

# 6. Custom Error Types

Use meaningful error types.

Avoid:

```ts
throw new Error("failed");
```

Prefer:

```ts
throw new PaymentFailedError();
```

Examples:

```
ValidationError

AuthenticationError

AuthorizationError

NotFoundError

ConflictError

DatabaseError

ExternalServiceError
```

Errors should communicate intent.

---

# 7. Error Messages

User messages and developer messages are different.

User:

```
Unable to complete payment.
Please try again.
```

Developer log:

```
Payment provider timeout after 5000ms.
Order ID: 123.
Provider response unavailable.
```

Never expose internal information.

---

# 8. Validation Errors

Validation should happen early.

Validate:

- User input
- API payloads
- Query parameters
- External responses

Benefits:

- Prevent invalid states.
- Reduce unexpected failures.
- Improve user experience.

Example:

```
Request

↓

Validation

↓

Business Logic

↓

Database
```

---

# 9. Async Error Handling

Every async operation needs a failure strategy.

Consider:

- Timeout
- Retry
- Fallback
- User feedback
- Logging

Avoid:

```ts
await fetchData();
```

without considering failure.

---

# 10. Retry Patterns

Retries are useful for temporary failures.

Good retry cases:

- Network timeout
- Temporary service unavailable
- Rate limit response

Avoid retrying:

- Invalid input
- Permission errors
- Business rule violations

Use:

- Maximum retry count
- Backoff strategy
- Timeout limits

Example:

```
Attempt 1

↓

Wait

↓

Attempt 2

↓

Wait longer

↓

Final failure
```

---

# 11. Graceful Degradation

When a feature fails, avoid breaking the entire system.

Examples:

Without recommendation service:

```
Show products normally
Hide recommendations
```

Without analytics:

```
Continue user experience
Queue analytics later
```

Critical features should not depend on optional features.

---

# 12. Frontend Error Handling

Frontend applications should handle:

## Loading States

Show progress.

Examples:

- Skeleton screens
- Loading indicators

---

## Empty States

Explain missing data.

Example:

```
No orders yet.

Start shopping to see your orders here.
```

---

## Error States

Provide recovery actions.

Example:

```
Unable to load products.

[Retry]
```

---

# 13. Backend Error Handling

Backend systems should:

- Validate requests.
- Return correct status codes.
- Log internal details.
- Hide sensitive information.

Example:

```
400
Invalid request

401
Not authenticated

403
Not authorized

404
Resource not found

500
Internal server error
```

---

# 14. Database Error Handling

Database failures require special care.

Handle:

- Connection failures
- Constraint violations
- Transaction failures
- Timeout errors

Never:

- Expose database messages.
- Ignore failed transactions.

---

# 15. Transaction Safety

Operations that must succeed together should use transactions.

Example:

```
Create Order

+

Decrease Inventory

+

Create Payment Record
```

Either:

```
Everything succeeds
```

or:

```
Everything rolls back
```

Avoid partial system states.

---

# 16. Security Considerations

Errors must never reveal:

- Passwords
- Tokens
- Database structure
- Internal paths
- Server details

Bad:

```
Database user postgres failed password authentication
```

Good:

```
Unable to process request
```

---

# 17. Monitoring Errors

Important errors should be tracked.

Monitor:

- Error frequency
- Error rate changes
- Critical failures
- User impact

Combine:

```
Logs

+

Metrics

+

Tracing

=

Complete visibility
```

---

# 18. Error Handling Checklist

Before releasing a feature:

## User Experience

- Are errors understandable?
- Are recovery actions available?
- Are loading and empty states handled?

## Technical

- Are failures handled?
- Are errors logged?
- Are retries appropriate?

## Security

- Are sensitive details hidden?
- Are permissions protected?

## Reliability

- Can the system recover?
- Are critical workflows protected?

---

# Error Handling Principle

A good system does not avoid errors.

A good system:

- Detects errors.
- Handles errors.
- Explains errors.
- Recovers from errors.
- Learns from errors.

Errors are part of the design, not exceptions to it.
