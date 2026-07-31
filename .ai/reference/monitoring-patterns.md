**Path:**

```text
.ai/reference/monitoring-patterns.md
```

```md
# Monitoring Patterns

## 1. Monitoring Philosophy

Monitoring is not only about detecting failures.

A production system must provide visibility into:

- System health
- Application behavior
- User experience
- Performance
- Security events
- Business impact

A system that cannot be observed cannot be reliably maintained.

The goal of monitoring is:

- Detect problems early
- Understand system behavior
- Reduce downtime
- Improve reliability
- Support better decisions

---

# 2. Observability Principles

Observability answers:

"Why is the system behaving this way?"

A complete observability strategy uses:
```

Logs

-

Metrics

-

Traces

↓

System Understanding

```

Each provides different information.

---

# 3. The Three Pillars of Observability

## Logs

Logs describe events that happened.

Useful for:

- Errors
- User actions
- System events
- Debugging

Examples:

```

User authentication failed

Payment processing completed

Database connection error

```

---

## Metrics

Metrics measure system behavior over time.

Examples:

- CPU usage
- Memory usage
- Request count
- Response time
- Error rate
- Database performance

Metrics help identify:

- Trends
- Bottlenecks
- Capacity issues

---

## Distributed Tracing

Tracing follows a request across multiple services.

Example:

```

User Request

↓

API Gateway

↓

Authentication Service

↓

Payment Service

↓

Database

```

Useful for:

- Microservices
- Complex workflows
- Performance debugging

---

# 4. Application Monitoring

Applications should monitor:

## Availability

Questions:

- Is the application running?
- Are critical services available?

Track:

- Uptime
- Health checks
- Service status

---

## Performance

Monitor:

- Response time
- API latency
- Page loading speed
- Database queries

Important metrics:

- Average response time
- P95 latency
- P99 latency

---

## Errors

Track:

- Exceptions
- Failed requests
- Failed background jobs
- External service failures

Errors should include enough context to debug safely.

---

# 5. Health Checks

Every production service should expose health information.

Example:

```

GET /health

````

Possible responses:

Healthy:

```json
{
  "status": "ok"
}
````

Unhealthy:

```json
{
  "status": "error"
}
```

Health checks help:

- Load balancers
- Deployment systems
- Monitoring tools

---

# 6. Structured Logging

Logs should be machine-readable.

Prefer:

```json
{
  "event": "user_login",
  "userId": "123",
  "success": true
}
```

Avoid:

```
User logged in successfully
```

Structured logs allow:

- Searching
- Filtering
- Analysis
- Automation

---

# 7. Logging Levels

Use appropriate levels.

## DEBUG

Detailed information for development.

Example:

- Function execution details

---

## INFO

Normal system events.

Example:

- User created account
- Deployment completed

---

## WARNING

Unexpected situations that do not break the system.

Example:

- Retry triggered
- Slow external service

---

## ERROR

Failures requiring attention.

Example:

- Database connection failed
- Payment failed

---

## CRITICAL

Major system failures.

Example:

- Production outage
- Data corruption risk

---

# 8. What Should Never Be Logged

Never log:

- Passwords
- Authentication tokens
- API keys
- Private credentials
- Sensitive personal data

Before logging:

Ask:

"Would exposing this information create a security problem?"

If yes, remove it.

---

# 9. Monitoring Metrics

Important application metrics:

## Traffic

Measure:

- Requests per second
- Active users
- API calls

---

## Errors

Measure:

- Error percentage
- Failed requests
- Exceptions

---

## Latency

Measure:

- Response time
- Database time
- External API time

---

## Saturation

Measure:

- CPU usage
- Memory usage
- Storage
- Queue size

---

# 10. The Four Golden Signals

For services, monitor:

## Latency

How long requests take.

---

## Traffic

How much demand exists.

---

## Errors

How many requests fail.

---

## Saturation

How much capacity is being used.

Example:

```
Traffic increases

↓

Latency increases

↓

Errors increase

↓

System saturation
```

---

# 11. Alerting Strategy

Alerts should be actionable.

A good alert:

- Detects a real problem
- Has clear severity
- Has an owner
- Suggests action

Avoid:

- Alert spam
- Low-value notifications
- Alerts without response plans

---

# 12. Alert Severity

## Critical

Immediate action required.

Examples:

- Complete outage
- Database unavailable
- Security incident

---

## High

Important issue.

Examples:

- High error rate
- Severe performance degradation

---

## Medium

Needs investigation.

Examples:

- Increasing latency
- Resource usage growth

---

## Low

Informational.

Examples:

- Minor warnings
- Non-critical events

---

# 13. Performance Monitoring

Track:

Frontend:

- Page load time
- Core Web Vitals
- JavaScript errors
- User experience

Backend:

- API latency
- Database queries
- Memory usage
- CPU usage

Infrastructure:

- Server health
- Network usage
- Storage

---

# 14. Database Monitoring

Monitor:

- Query performance
- Slow queries
- Connection count
- Locks
- Storage growth
- Replication status

Avoid waiting for users to report database problems.

---

# 15. User Experience Monitoring

Technical health is not enough.

Monitor:

- Failed user actions
- Broken workflows
- Checkout failures
- Login problems
- Frontend crashes

The system should be healthy from the user's perspective.

---

# 16. Error Tracking

Use dedicated error tracking systems.

Capture:

- Stack traces
- Error frequency
- Affected users
- Environment
- Release version

Every error should help answer:

- What happened?
- Where?
- Who is affected?
- How often?

---

# 17. Monitoring During Deployment

Every deployment should be monitored.

Watch:

Before deployment:

- Current health
- Baseline metrics

During deployment:

- Error rate
- Latency
- Resource usage

After deployment:

- User impact
- New errors
- Performance changes

---

# 18. Logging and Privacy

Monitoring must respect privacy.

Rules:

- Collect only necessary data.
- Protect stored logs.
- Restrict access.
- Remove sensitive information.

Monitoring should improve systems without creating privacy risks.

---

# 19. Monitoring Tools Categories

Common categories:

## Application Monitoring

For:

- Errors
- Performance
- User experience

Examples:

- Sentry
- Datadog
- New Relic

---

## Infrastructure Monitoring

For:

- Servers
- Containers
- Networks

Examples:

- Prometheus
- Grafana
- Cloud monitoring tools

---

## Log Management

For:

- Searching
- Aggregating
- Analyzing logs

Examples:

- Elasticsearch
- Loki
- Cloud logging services

---

# 20. Monitoring Checklist

Before production:

## Visibility

- Are logs available?
- Are metrics collected?
- Are errors tracked?

## Alerts

- Are important failures detected?
- Are alerts actionable?

## Performance

- Are latency metrics tracked?
- Are slow operations visible?

## Security

- Are sensitive logs removed?
- Is access controlled?

## Reliability

- Are health checks implemented?
- Can problems be diagnosed quickly?

---

# Monitoring Principle

A reliable system is not a system that never fails.

A reliable system is one where:

- Problems are detected quickly.
- Causes are understood.
- Recovery is efficient.
- Improvements are continuously made.

Good monitoring turns unknown failures into manageable engineering problems.

```

```
