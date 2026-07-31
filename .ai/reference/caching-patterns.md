Create this file:

`/.ai/reference/caching-patterns.md`

```md
# Caching Engineering Patterns

## 1. Caching Philosophy

Caching is a performance optimization strategy, not a replacement for good architecture.

A good caching system must balance:

- Performance
- Data freshness
- Complexity
- Reliability
- Cost
- User experience

Never add caching without understanding:

- What data is being cached.
- How long it remains valid.
- When it becomes stale.
- How it is invalidated.

The wrong cache strategy creates:

- Stale data.
- Hard-to-debug issues.
- Incorrect user experiences.
- Additional complexity.

---

# 2. Cache Decision Framework

Before adding caching, answer:

1. Is this data expensive to generate?
2. Is this data requested frequently?
3. Can slightly outdated data be acceptable?
4. How often does this data change?
5. What is the invalidation strategy?

Do not cache everything.

Prefer caching where it creates measurable value.

---

# 3. Types of Caching

## Browser Cache

Used for:

- Static assets.
- Images.
- Fonts.
- CSS.
- JavaScript files.

Benefits:

- Reduces network requests.
- Improves loading speed.

Examples:
```

Browser

↓

Cached Assets

↓

Application

```

---

## CDN Cache

Used for:

- Static pages.
- Images.
- Public API responses.
- Global content delivery.

Benefits:

- Lower latency.
- Reduced server load.
- Better global performance.

---

## Server-Side Cache

Used for:

- Expensive computations.
- Database results.
- External API responses.

Examples:

- Redis.
- In-memory cache.

---

## Database Cache

Used for:

- Frequently accessed queries.
- Expensive aggregations.

Should not replace:

- Proper indexing.
- Query optimization.
- Good schema design.

---

# 4. Cache Layers Architecture

A scalable system usually uses multiple layers:

```

User

↓

Browser Cache

↓

CDN Cache

↓

Application Cache

↓

Database Cache

↓

Database

```

Each layer reduces unnecessary work.

---

# 5. Cache-Control Strategy

HTTP caching should be intentional.

Important headers:

```

Cache-Control
ETag
Last-Modified
Expires

```

Examples:

Static assets:

```

Cache-Control:
public, max-age=31536000, immutable

```

Dynamic content:

```

Cache-Control:
private, no-cache

```

Never cache sensitive data publicly.

---

# 6. Server Component Caching

For frameworks like Next.js:

Prefer:

- Static generation when possible.
- Server-side caching.
- Revalidation strategies.

Example:

```

Request

↓

Cached Server Result

↓

Render Response

```

Avoid:

- Fetching identical data repeatedly.
- Client-side fetching for static content.

---

# 7. Data Freshness Strategies

Different data requires different strategies.

## Cache First

Use when:

- Data changes rarely.

Example:

- Documentation.
- Public content.

Flow:

```

Cache

↓

Return Data

↓

Update Later

```

---

## Network First

Use when:

- Freshness is important.

Example:

- User dashboards.

Flow:

```

Request

↓

Server

↓

Fallback Cache

```

---

## Stale While Revalidate

Use when:

- Speed and freshness are both important.

Flow:

```

Return Cached Data

↓

Refresh Background Data

↓

Update Cache

```

---

# 8. Cache Invalidation

Cache invalidation is one of the hardest problems.

Every cache needs a clear invalidation strategy.

Common methods:

## Time Based

Example:

```

Expire after 60 seconds

```

Good for:

- Content pages.
- Analytics.

---

## Event Based

Invalidate when data changes.

Example:

```

User updates profile

↓

Remove user cache

↓

Generate fresh data

```

---

## Manual Invalidation

Used for:

- Admin actions.
- Deployment changes.

---

# 9. Cache Keys Design

Cache keys must be:

- Predictable.
- Unique.
- Versionable.

Example:

Good:

```

user:123:profile:v1

```

Bad:

```

data123

```

Include:

- Entity.
- Identifier.
- Version when needed.

---

# 10. Redis Caching Patterns

Redis is commonly used for:

- Session storage.
- API caching.
- Rate limiting.
- Background jobs.

Example:

```

Application

↓

Redis

↓

Database

```

Rules:

- Define expiration times.
- Monitor memory usage.
- Avoid unlimited growth.
- Handle cache failures.

---

# 11. Database Query Caching

Before caching database queries:

Optimize first:

- Indexes.
- Query structure.
- Relationships.
- Pagination.

Avoid:

```

Slow Query

↓

Cache

↓

Ignore Database Problem

```

Caching hides problems temporarily.

---

# 12. API Caching

API caching should define:

- Cacheable endpoints.
- Cache duration.
- Invalidations.
- Authentication rules.

Public data:

```

GET /products

```

may be cached.

Private data:

```

GET /account

```

should not be publicly cached.

---

# 13. Authentication and Cache Security

Never expose private cached data.

Avoid:

- User data shared between sessions.
- Cached authentication responses.
- Sensitive information in CDN caches.

Always separate:

```

Public Cache

-

Private User Data

```

---

# 14. Image and Asset Caching

Optimize:

- Images.
- Fonts.
- Static resources.

Use:

- CDN delivery.
- Compression.
- Proper cache headers.

Prefer immutable assets:

```

logo.a82d91.png

```

instead of:

```

logo.png

```

---

# 15. Cache Failure Handling

Caches can fail.

The application should continue working.

Example:

```

Try Cache

↓

Cache unavailable

↓

Use Database

↓

Return Response

```

Never make the cache a single point of failure.

---

# 16. Cache Monitoring

Monitor:

- Hit rate.
- Miss rate.
- Memory usage.
- Evictions.
- Response time.

Important metrics:

```

Cache Hit Ratio

=

Successful Cache Requests

/

Total Cache Requests

```

Low hit rates may indicate:

- Wrong cache strategy.
- Poor cache keys.
- Incorrect expiration.

---

# 17. Common Cache Mistakes

Avoid:

- Caching everything.
- No expiration strategy.
- No invalidation plan.
- Caching sensitive data.
- Using cache before optimizing queries.
- Making application depend completely on cache.
- Ignoring stale data problems.

---

# 18. Production Cache Checklist

Before release:

## Strategy

- What data is cached?
- Why is it cached?
- How long is it valid?

## Security

- Is private data protected?
- Are permissions respected?

## Reliability

- What happens if cache fails?
- Is fallback available?

## Performance

- Are cache hits improving speed?
- Is memory usage controlled?

## Maintenance

- Is invalidation documented?
- Are cache keys understandable?

---

# Caching Engineering Rule

Cache intentionally.

The goal is not maximum caching.

The goal is:

- Faster systems.
- Correct data.
- Lower infrastructure cost.
- Better user experience.

A good cache makes the system faster without making it harder to trust.
```
