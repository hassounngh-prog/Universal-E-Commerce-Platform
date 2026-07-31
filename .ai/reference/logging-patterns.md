# Logging Patterns

## 1. Logging Philosophy

Logging is not only for debugging.

A good logging system helps with:

- Understanding system behavior
- Detecting failures
- Monitoring performance
- Investigating security events
- Improving reliability

Logs should provide useful information without exposing sensitive data.

The goal:

```
Useful information

+

Minimal noise

+

No sensitive data leaks
```

---

# 2. Structured Logging

Prefer structured logs over plain text.

Good:

```json
{
  "event": "user_login",
  "userId": "123",
  "status": "success",
  "timestamp": "2026-01-01T10:00:00Z"
}
```

Avoid:

```
User 123 logged in successfully
```

Structured logs are easier to:

- Search
- Filter
- Analyze
- Monitor
- Automate

---

# 3. Log Levels

Use appropriate log levels.

## DEBUG

Used for development details.

Examples:

- Function execution details
- Variable states
- Internal flow information

Should usually be disabled in production.

---

## INFO

Normal system events.

Examples:

- Application started
- User registered
- Payment completed
- Deployment completed

---

## WARN

Something unexpected happened but the system can continue.

Examples:

- Deprecated feature usage
- Retry occurred
- Slow response detected

---

## ERROR

A failure occurred.

Examples:

- API request failed
- Database operation failed
- External service unavailable

Errors should include enough context to investigate.

---

## FATAL / CRITICAL

System cannot continue normally.

Examples:

- Database unavailable
- Application startup failure
- Security breach detected

---

# 4. What Should Be Logged

Log important system events:

## Application Events

Examples:

- Application startup
- Shutdown events
- Configuration loading
- Background jobs

---

## User Events

Examples:

- Login attempts
- Account changes
- Permission changes
- Important user actions

---

## Business Events

Examples:

- Order created
- Payment processed
- Subscription changed

---

## Security Events

Examples:

- Failed authentication
- Permission denied
- Suspicious activity
- Access violations

---

## Performance Events

Examples:

- Slow requests
- Database latency
- External API delays

---

# 5. What Should Never Be Logged

Never log:

- Passwords
- API keys
- Access tokens
- Refresh tokens
- Cookies
- Private keys
- Full payment information
- Sensitive personal data

Bad:

```ts
logger.info({
  password,
  token,
});
```

Good:

```ts
logger.info({
  userId,
  action: "login",
});
```

---

# 6. Contextual Logging

Every important log should contain context.

Include when useful:

- Request ID
- User ID
- Session ID
- Service name
- Environment
- Operation name
- Timestamp

Example:

```json
{
  "requestId": "abc123",
  "service": "payment-service",
  "operation": "create-payment",
  "status": "failed"
}
```

Context makes debugging faster.

---

# 7. Request Logging

API requests should capture:

- HTTP method
- Route
- Status code
- Response time
- Request ID

Example:

```
GET /users/123

Status: 200

Duration: 120ms
```

Avoid logging:

- Request bodies containing sensitive data
- Authentication headers
- Personal information

---

# 8. Error Logging

Errors should include:

- Error message
- Error type
- Stack trace internally
- Related context

Example:

```json
{
  "error": "PaymentFailed",
  "orderId": "123",
  "reason": "Provider timeout"
}
```

Avoid:

```json
{
  "error": "Something went wrong"
}
```

without context.

---

# 9. Logging in Frontend Applications

Frontend logs should focus on:

- User-facing failures
- Unexpected errors
- Performance issues

Avoid sending:

- User secrets
- Private information
- Excessive debug data

Handle errors gracefully.

---

# 10. Logging in Backend Applications

Backend logs should track:

- Requests
- Business operations
- Database failures
- External integrations
- Background jobs

Backend logs are usually the primary source for production investigation.

---

# 11. Distributed System Logging

In systems with multiple services:

Every request should have a correlation ID.

Flow:

```
Client Request

↓

API Gateway
(requestId)

↓

Service A

↓

Service B

↓

Database
```

All services should keep the same identifier.

This allows tracing one operation across the system.

---

# 12. Audit Logging

Audit logs record important actions.

Examples:

- User permission changes
- Account deletion
- Financial actions
- Administrative actions

Audit logs should be:

- Reliable
- Protected
- Immutable when required

---

# 13. Logging Performance

Logging must not slow down the application.

Consider:

- Log level configuration
- Async logging
- Log rotation
- Storage limits

Avoid:

- Logging huge objects
- Logging inside high-frequency loops
- Excessive debug logs in production

---

# 14. Log Storage and Retention

Define:

- Where logs are stored
- How long they are kept
- Who can access them

Consider:

- Compliance requirements
- Security needs
- Storage costs

Delete unnecessary logs.

---

# 15. Monitoring Integration

Logs should work with:

- Monitoring systems
- Alerting systems
- Error tracking tools

Useful combinations:

```
Logs

+

Metrics

+

Traces

=

Complete system visibility
```

---

# 16. Logging Checklist

Before releasing a feature:

## Quality

- Are important events logged?
- Are logs understandable?
- Are logs structured?

## Security

- Are secrets excluded?
- Is sensitive data protected?

## Debugging

- Can developers investigate failures?
- Is enough context available?

## Performance

- Are logs optimized?
- Is production noise controlled?

---

# Logging Principle

Good logs answer:

- What happened?
- Where did it happen?
- When did it happen?
- Why did it happen?
- Who was affected?

The best logging system helps engineers solve problems quickly without creating new security risks.
