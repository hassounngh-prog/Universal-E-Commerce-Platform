**Path:**

```text
.ai/reference/cloud-patterns.md
```

```md
# Cloud Patterns

## 1. Cloud Philosophy

Cloud architecture is not about moving servers to another location.

It is about building systems that are:

- Scalable
- Reliable
- Secure
- Observable
- Cost-efficient
- Easy to evolve

Cloud decisions should be driven by:

- Business requirements
- Expected growth
- Reliability needs
- Security requirements
- Operational complexity

Avoid adding cloud complexity without a real benefit.

---

# 2. Cloud Architecture Principles

Every cloud system should consider:

- Availability
- Scalability
- Security
- Performance
- Cost optimization
- Disaster recovery

The architecture should support:

- More users
- More traffic
- More features
- More environments
- More developers

---

# 3. Managed Services First

Prefer managed services when they reduce operational complexity.

Examples:

Use managed:

- Databases
- Storage
- Queues
- Monitoring
- Authentication services

Benefits:

- Less maintenance
- Automatic updates
- Better reliability
- Faster development

Do not manage infrastructure manually when a reliable managed option exists.

---

# 4. Cloud Environment Structure

Recommended environments:
```

Development

↓

Staging

↓

Production

```

Each environment should have:

- Separate resources
- Separate permissions
- Separate configurations
- Separate secrets

Never mix production and development resources.

---

# 5. Scalability Patterns

Applications should scale based on demand.

Common scaling methods:

## Vertical Scaling

Increase resources:

```

Small Server

↓

Large Server

```

Useful for:

- Simple applications
- Early growth stages

Limit:

- Has hardware limits

---

## Horizontal Scaling

Add more instances:

```

Server

↓

Server + Server + Server

```

Benefits:

- Better availability
- Handles traffic growth
- Easier failure recovery

Preferred for large systems.

---

# 6. Stateless Application Design

Cloud applications should avoid storing user state locally.

Prefer:

```

User Request

↓

Load Balancer

↓

Any Application Instance

```

Avoid:

```

User Session

↓

Single Server Dependency

```

Store shared state in:

- Databases
- Caches
- External storage

---

# 7. Load Balancing

Load balancers distribute traffic across services.

Benefits:

- Higher availability
- Better performance
- Health checking
- Automatic routing

Example:

```

Users

↓

Load Balancer

↓

Application Servers

↓

Database

```

Applications behind load balancers should handle:

- Multiple instances
- Failures
- Traffic spikes

---

# 8. Storage Patterns

Choose storage based on data type.

## Database Storage

For:

- Structured data
- Relationships
- Transactions

Examples:

- PostgreSQL
- MySQL

---

## Object Storage

For:

- Images
- Videos
- Documents
- Backups

Examples:

- AWS S3
- Cloud Storage

---

## Cache Storage

For:

- Frequently accessed data
- Temporary data
- Performance optimization

Examples:

- Redis
- Memcached

---

# 9. Database Cloud Patterns

Production databases should consider:

- Backups
- Replication
- Scaling
- Monitoring
- Security

Use:

- Automated backups
- Encryption
- Access control
- Migration systems

Avoid:

- Direct public database exposure
- Manual production changes

---

# 10. Caching Strategy

Caching improves:

- Response time
- Database performance
- User experience

Cache:

- Expensive queries
- Frequently used data
- External API responses

Consider:

- Cache expiration
- Cache invalidation
- Data consistency

Do not cache everything.

---

# 11. Message Queue Patterns

Use queues when work does not need immediate processing.

Examples:

- Emails
- Notifications
- Reports
- Background jobs

Pattern:

```

Application

↓

Message Queue

↓

Worker Service

```

Benefits:

- Better reliability
- Better scalability
- Reduced response time

---

# 12. CDN Usage

Content Delivery Networks improve delivery speed.

Use CDN for:

- Images
- Videos
- Static assets
- Public files

Benefits:

- Lower latency
- Reduced server load
- Better global performance

---

# 13. Cloud Security

Cloud security requires:

- Identity management
- Access control
- Encryption
- Network security
- Monitoring

Follow:

## Least Privilege

Give users and services only required permissions.

## Defense in Depth

Use multiple security layers.

---

# 14. Identity and Access Management

Access should be controlled through:

- Roles
- Permissions
- Policies

Avoid:

- Shared accounts
- Excessive permissions
- Permanent credentials

Prefer:

- Temporary credentials
- Role-based access
- Audited actions

---

# 15. Network Architecture

Separate resources logically.

Consider:

- Private networks
- Firewalls
- Security groups
- Internal services

Public access should be limited.

Example:

```

Internet

↓

Load Balancer

↓

Application Layer

↓

Private Database

```

---

# 16. High Availability Design

Critical systems should avoid single points of failure.

Consider:

- Multiple instances
- Multiple availability zones
- Database replication
- Automatic recovery

Failure should be expected.

---

# 17. Disaster Recovery

Every important system needs recovery planning.

Define:

## Backup Strategy

- What is backed up?
- How often?
- Where stored?

## Recovery Strategy

- How to restore?
- How long does recovery take?

Test recovery regularly.

A backup that was never tested is not guaranteed.

---

# 18. Cost Optimization

Cloud costs should be monitored.

Optimize:

- Unused resources
- Over-sized servers
- Storage usage
- Network costs

Use:

- Monitoring
- Budgets
- Alerts
- Resource reviews

The cheapest solution is not always the best solution.

Optimize for value.

---

# 19. Cloud Monitoring

Monitor:

## Infrastructure

- CPU
- Memory
- Storage
- Network

## Application

- Errors
- Latency
- Requests

## Business

- User activity
- Revenue impact
- Important workflows

---

# 20. Cloud Deployment Checklist

Before production:

## Architecture

- Is the system scalable?
- Are components separated?

## Security

- Are permissions correct?
- Are secrets protected?

## Reliability

- Are backups configured?
- Is recovery possible?

## Performance

- Is caching considered?
- Are resources optimized?

## Cost

- Are resources necessary?
- Are costs monitored?

---

# Cloud Principle

The best cloud architecture is not the most complex one.

It is the architecture that:

- Solves the business problem
- Scales when needed
- Protects users
- Controls cost
- Remains understandable

Good cloud engineering creates reliable foundations for long-term growth.
```
