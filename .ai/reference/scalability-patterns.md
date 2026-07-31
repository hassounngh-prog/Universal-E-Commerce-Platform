Create this file:

`/.ai/reference/scalability-patterns.md`

```md
# Scalability Patterns

## 1. Scalability Philosophy

Scalability is the ability of a system to handle growth without losing reliability, performance, or maintainability.

Growth can mean:

- More users
- More requests
- More data
- More features
- More developers
- More business complexity

A scalable system is not only one that handles more traffic.

It is one that remains understandable and maintainable while growing.

---

# 2. Scalability Before Optimization

Do not optimize everything prematurely.

Before adding complexity, ask:

1. Is there a real performance problem?
2. Where is the bottleneck?
3. What is the simplest solution?
4. Will this improve future scalability?

Avoid:

- Premature microservices
- Unnecessary caching
- Complex infrastructure without need
- Optimizing without measurements

Measure first.

Optimize second.

---

# 3. Horizontal vs Vertical Scaling

## Vertical Scaling

Increasing the power of one machine.

Example:
```

Small Server

↓

More CPU
More RAM
More Storage

↓

Bigger Server

```

Advantages:

- Simple
- Easy to implement
- Good for early stages

Limitations:

- Hardware limits
- Expensive at scale
- Single point of failure

---

## Horizontal Scaling

Adding more machines.

Example:

```

Server

↓

Load Balancer

↓

Server 1
Server 2
Server 3

```

Advantages:

- Handles large traffic
- Better reliability
- Easier expansion

Requirements:

- Stateless services
- Shared storage
- Proper architecture

---

# 4. Stateless Application Design

Applications should avoid storing important state locally.

Bad:

```

User session

↓

Server Memory

```

Problem:

Another server cannot access the session.

---

Better:

```

User Session

↓

Database / Redis

↓

Any Application Server

```

Benefits:

- Easier scaling
- Load balancing support
- Better reliability

---

# 5. Load Balancing Patterns

A load balancer distributes traffic between servers.

Architecture:

```

Users

↓

Load Balancer

↓

Application Servers

↓

Database

```

Responsibilities:

- Traffic distribution
- Health checks
- Failover
- SSL termination

---

# 6. Database Scalability

Databases are often the first bottleneck.

Important strategies:

## Proper Schema Design

Consider:

- Relationships
- Constraints
- Indexes
- Query patterns

---

## Query Optimization

Avoid:

- N+1 queries
- Unnecessary joins
- Loading unused data

Prefer:

- Pagination
- Selecting required fields
- Optimized queries

---

## Database Indexing

Indexes improve read performance.

Example:

Without index:

```

Search all users
↓
Check every row

```

With index:

```

Search index
↓
Find matching rows quickly

```

Do not add indexes blindly.

Indexes also increase:

- Storage usage
- Write cost

---

# 7. Caching Patterns

Caching reduces repeated work.

Common cache locations:

```

User

↓

Application Cache

↓

Database

```

---

## Cache Types

### Browser Cache

Used for:

- Images
- Static assets
- Frontend resources

---

### Application Cache

Used for:

- Expensive calculations
- Frequently requested data

---

### Database Cache

Used for:

- Query results
- Frequently accessed records

---

# 8. Cache Strategy

A cache needs:

- Expiration rules
- Invalidations
- Consistency strategy

Common patterns:

## Cache Aside

Flow:

```

Request

↓

Check Cache

↓

If missing

↓

Get Database

↓

Store Cache

↓

Return Data

```

Most common application caching pattern.

---

## Write Through Cache

Flow:

```

Write Data

↓

Update Cache

↓

Update Database

```

Useful when consistency matters.

---

# 9. Background Job Patterns

Long operations should not block users.

Avoid:

```

User Request

↓

Process Heavy Task

↓

Wait

↓

Response

```

Prefer:

```

User Request

↓

Create Job

↓

Queue

↓

Background Worker

↓

Complete Task

```

Examples:

- Email sending
- Image processing
- Reports
- Notifications

---

# 10. Queue Architecture

Typical structure:

```

Application

↓

Message Queue

↓

Workers

↓

External Services / Database

```

Benefits:

- Better response times
- Retry handling
- Traffic smoothing
- Failure isolation

---

# 11. Rate Limiting

Protect systems from excessive usage.

Apply limits to:

- APIs
- Authentication endpoints
- Expensive operations

Example:

```

100 requests / minute / user

```

Benefits:

- Prevent abuse
- Protect resources
- Improve stability

---

# 12. Pagination Patterns

Never load unlimited data.

Bad:

```

GET /users

Return 5 million users

```

Better:

```

GET /users?page=1&limit=20

```

Pagination strategies:

## Offset Pagination

Example:

```

?page=2&limit=20

```

Simple but slower with large datasets.

---

## Cursor Pagination

Example:

```

?after=user_123

```

Better for large datasets and real-time systems.

---

# 13. File Storage Scalability

Do not store large files inside application servers.

Avoid:

```

Application Server

↓

Images
Videos
Documents

```

Prefer:

```

Application

↓

Object Storage

↓

CDN

↓

Users

```

Benefits:

- Faster delivery
- Reduced server load
- Better scalability

---

# 14. Content Delivery Network (CDN)

CDNs distribute static content closer to users.

Use for:

- Images
- Videos
- CSS
- JavaScript
- Downloads

Benefits:

- Lower latency
- Reduced server traffic
- Better global performance

---

# 15. Service Architecture Evolution

Do not start with microservices unless needed.

Recommended evolution:

```

Monolith

↓

Modular Monolith

↓

Service Extraction

↓

Microservices

```

A well-designed modular monolith can scale very far.

---

# 16. Feature Scalability

New features should not create dependency chaos.

Follow:

- Clear boundaries
- Feature ownership
- Independent modules
- Stable interfaces

Avoid:

- Shared global logic
- Tight coupling
- Hidden dependencies

---

# 17. Reliability Patterns

Scalable systems must handle failure.

Use:

- Retries
- Timeouts
- Circuit breakers
- Graceful degradation
- Health checks

Never assume external services always work.

---

# 18. Scalability Checklist

Before adding complexity:

## Architecture

- Are boundaries clear?
- Can modules evolve independently?

## Performance

- Are bottlenecks measured?
- Are queries optimized?

## Infrastructure

- Can services scale horizontally?
- Are deployments reliable?

## Data

- Can databases handle growth?
- Is storage strategy correct?

## Reliability

- Are failures handled?
- Are retries controlled?

---

# Scalability Principle

Build simple systems with strong foundations.

Scale complexity only when real growth requires it.

The goal is not the most advanced architecture.

The goal is a system that can grow without becoming impossible to maintain.
```
