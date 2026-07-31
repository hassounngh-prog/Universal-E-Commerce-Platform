Create this file:

`/.ai/reference/observability-patterns.md`

```md
# Observability Patterns

## 1. Observability Philosophy

Observability is the ability to understand the internal state of a system by analyzing its external outputs.

A production system must not only work.

It must be:

- Understandable
- Debuggable
- Measurable
- Traceable
- Reliable

A system without observability creates blind spots.

The goal:

> Detect problems quickly, understand their cause, and recover efficiently.

---

# 2. Three Pillars of Observability

Modern observability is built on three main pillars:
```

Logs

- Metrics
- # Traces

Observability

````

Each provides a different perspective.

---

# 3. Logging Patterns

Logs explain what happened.

Good logs should answer:

- What happened?
- When did it happen?
- Where did it happen?
- Why did it happen?
- Who triggered it?

---

## Structured Logging

Prefer structured logs over plain text.

Avoid:

```text
User failed login
````

Prefer:

```json
{
  "event": "login_failed",
  "userId": "123",
  "reason": "invalid_password",
  "timestamp": "2026-01-01T10:00:00Z"
}
```

Benefits:

- Searchable
- Filterable
- Machine-readable
- Easier monitoring

---

# 4. Log Levels

Use appropriate severity levels.

## Debug

Development information.

Examples:

- Internal state
- Temporary debugging information

Avoid in production unless needed.

---

## Info

Normal system events.

Examples:

- User created account
- Payment completed
- Background job finished

---

## Warning

Unexpected situations that do not break the system.

Examples:

- Retry triggered
- External API slow response
- Deprecated feature usage

---

## Error

Failures requiring attention.

Examples:

- Database failure
- API request failed
- Unexpected exception

---

## Critical

System-level failures.

Examples:

- Service unavailable
- Data corruption risk
- Security breach

---

# 5. What Should Be Logged

Log:

- Application events
- Security events
- Errors
- Important business actions
- Performance problems
- External service failures

Examples:

```text
User authentication attempt
Order creation
Payment processing result
Failed API request
Database timeout
```

---

# 6. What Should Never Be Logged

Never log:

- Passwords
- API keys
- Access tokens
- Refresh tokens
- Cookies
- Personal secrets
- Sensitive user information

Bad:

```json
{
  "password": "mypassword"
}
```

Good:

```json
{
  "userId": "123",
  "action": "login_failed"
}
```

---

# 7. Metrics Patterns

Metrics measure system behavior over time.

Important categories:

## System Metrics

Monitor:

- CPU usage
- Memory usage
- Disk usage
- Network usage

---

## Application Metrics

Monitor:

- Request count
- Error rate
- Response time
- Active users
- Queue size

---

## Business Metrics

Monitor:

- Orders created
- Payments completed
- User registrations
- Conversion rate

Technical metrics show health.

Business metrics show value.

---

# 8. Key Performance Indicators

Track important reliability indicators.

## Latency

How long requests take.

Example:

```
Average API response time: 120ms
```

---

## Traffic

How much work the system handles.

Example:

```
1000 requests/minute
```

---

## Errors

How often failures happen.

Example:

```
0.5% failed requests
```

---

## Saturation

How close resources are to limits.

Example:

```
Database CPU: 85%
```

---

# 9. Distributed Tracing

Tracing follows a request through multiple services.

Example:

```
User Request

↓

Frontend

↓

API Gateway

↓

Authentication Service

↓

Payment Service

↓

Database
```

A trace shows:

- Where time was spent
- Which service failed
- Request journey

Essential for:

- Microservices
- Distributed systems
- Complex applications

---

# 10. Error Monitoring

Production errors must be captured automatically.

Monitor:

- Exceptions
- Failed requests
- Stack traces
- User impact
- Frequency

Every error should include:

- Error message
- Context
- User action
- Environment
- Version

---

# 11. Health Checks

Every production service should expose health information.

Example:

```
GET /health
```

Response:

```json
{
  "status": "healthy",
  "database": "connected",
  "cache": "connected"
}
```

Health checks help:

- Deployment systems
- Load balancers
- Monitoring tools

---

# 12. Alerting Strategy

Alerts should indicate actionable problems.

Bad alert:

```
CPU changed
```

Good alert:

```
API error rate above 5% for 10 minutes
```

Avoid:

- Too many alerts
- Non-actionable notifications
- Alert fatigue

---

# 13. Production Debugging Workflow

When an issue happens:

```
Detect
 ↓
Investigate
 ↓
Identify root cause
 ↓
Fix
 ↓
Verify
 ↓
Document
```

Never immediately patch production without understanding the cause.

---

# 14. Observability Architecture

Recommended structure:

```
Application

    ↓

Logging Layer

    ↓

Metrics Layer

    ↓

Tracing Layer

    ↓

Monitoring Platform

    ↓

Alerts / Dashboard
```

---

# 15. Development Requirements

Every new feature should include:

## Logging

- Important events
- Errors
- Security actions

## Metrics

- Performance impact
- Business impact

## Error Tracking

- Failure visibility
- Debug context

---

# 16. Security and Privacy

Observability must respect privacy.

Rules:

- Remove sensitive information
- Protect logs
- Control access
- Audit usage

Logs can become a security risk if not protected.

---

# 17. Observability Checklist

Before production release:

## Logs

- Are important events logged?
- Are errors captured?
- Are secrets removed?

## Metrics

- Are important behaviors measurable?
- Are performance indicators tracked?

## Tracing

- Can requests be followed?
- Can failures be isolated?

## Alerts

- Are critical failures detected?
- Are alerts actionable?

---

# Observability Principle

A production system that cannot be understood cannot be reliably maintained.

Build systems that tell engineers:

- What happened
- Why it happened
- Where it happened
- How to fix it

Observability is not monitoring.

Monitoring tells you something is wrong.

Observability helps you understand why.

```

```
