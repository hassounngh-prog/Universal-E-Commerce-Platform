# Database Patterns Reference

## Purpose

This document defines database engineering patterns for building reliable, scalable, secure, and maintainable data systems.

A database is not only a storage layer.

It is a critical part of the application's architecture responsible for:

- Data integrity
- Performance
- Scalability
- Consistency
- Reliability
- Long-term maintainability

Database decisions should consider the future growth of the product.

---

# 1. Database Philosophy

A good database design should optimize for:

- Correctness before optimization
- Clear data ownership
- Strong relationships
- Predictable queries
- Data consistency
- Future scalability

Avoid designing only for today's requirements.

Every database decision should consider:

- More users
- More features
- More data
- More developers
- More complex business rules

---

# 2. Data Modeling Principles

Before creating tables, understand:

- Business entities
- Relationships
- Data lifecycle
- Ownership
- Access patterns

The database schema should represent the business domain.

Example:

```
User

↓

Orders

↓

Order Items

↓

Products
```

The schema should be understandable by developers and stakeholders.

---

# 3. Entity Design Pattern

Entities represent important business concepts.

Good entities have:

- Clear responsibility
- Meaningful attributes
- Defined relationships
- Business purpose

Example:

```text
User

id
email
name
createdAt
updatedAt
```

Avoid creating tables without clear ownership.

Bad:

```
misc_data
random_table
temporary_storage
```

---

# 4. Normalization Principles

Normalize data to prevent unnecessary duplication.

Benefits:

- Data consistency
- Easier updates
- Reduced storage duplication

Example:

Avoid:

```
Orders

customerName
customerEmail
customerPhone
```

Prefer:

```
Users

id
name
email
phone


Orders

id
userId
```

---

# 5. When to Denormalize

Denormalization can be acceptable when it solves a real problem.

Examples:

- Performance optimization
- Reporting needs
- High-frequency reads

Before denormalizing ask:

1. Is there a measured performance issue?
2. Does duplication have a clear benefit?
3. Can consistency be maintained?

Do not optimize prematurely.

---

# 6. Relationship Design

Common relationships:

## One-to-One

Example:

```
User

↓

Profile
```

Use when data has separate ownership.

---

## One-to-Many

Example:

```
User

↓

Orders
```

Most common relationship.

---

## Many-to-Many

Example:

```
Users

↓

Roles

↓

Permissions
```

Usually requires a junction table.

---

# 7. Primary Keys

Every important table should have a stable identifier.

Requirements:

- Unique
- Immutable
- Reliable

Examples:

```text
UUID
Auto Increment ID
```

Choose based on:

- Scale
- Distributed systems needs
- Security requirements

---

# 8. Foreign Keys and Integrity

Relationships must be protected.

Use:

- Foreign keys
- Constraints
- Proper cascading rules

Example:

```
Order.userId

references

User.id
```

Never rely only on application code for data integrity.

---

# 9. Indexing Strategy

Indexes improve query performance.

Consider indexing:

- Frequently searched fields
- Foreign keys
- Sorting fields
- Filtering fields

Example:

```sql
users(email)
orders(user_id)
products(category)
```

Avoid adding indexes everywhere.

Indexes have costs:

- Storage
- Write performance
- Maintenance

---

# 10. Query Performance

Always consider:

- Query complexity
- Returned data size
- Execution plans
- Database load

Avoid:

## N+1 Queries

Bad:

```
Get users

↓

For each user:
Get orders
```

Better:

```
Get users with required relations
```

---

# 11. Data Access Pattern

Database access should be isolated.

Preferred:

```
Controller

↓

Service

↓

Repository

↓

Database
```

Repositories should handle:

- Queries
- Persistence
- Data retrieval

Services should handle:

- Business decisions

---

# 12. Migration Strategy

Database changes must be controlled.

Every schema change should include:

- Migration file
- Review
- Rollback consideration

Avoid manually changing production databases.

Preferred:

```
Migration

↓

Testing

↓

Deployment

↓

Production
```

---

# 13. Transaction Pattern

Use transactions when multiple operations must succeed together.

Example:

Creating an order:

```
Create Order

+

Reduce Inventory

+

Create Payment Record
```

Either everything succeeds or everything fails.

---

# 14. Soft Delete Pattern

Sometimes data should not be permanently removed.

Example:

```
deletedAt
```

Advantages:

- Recovery
- Auditing
- Historical data

Consider carefully because it increases query complexity.

---

# 15. Audit Data Pattern

Important business systems should track changes.

Examples:

```
createdAt
updatedAt
createdBy
updatedBy
```

For sensitive systems:

```
AuditLog

action
user
timestamp
changes
```

---

# 16. Pagination Pattern

Never load unlimited data.

Avoid:

```text
GET /users
```

returning millions of records.

Prefer:

```
GET /users?page=1&limit=20
```

Consider:

- Offset pagination
- Cursor pagination

depending on scale.

---

# 17. Caching Strategy

Cache only when needed.

Possible cached data:

- Frequently accessed queries
- Expensive calculations
- Public information

Always define:

- Cache lifetime
- Invalidation strategy
- Source of truth

---

# 18. Database Security

Protect databases using:

- Least privilege access
- Strong authentication
- Secure connections
- Network restrictions

Never expose databases directly to clients.

---

# 19. Backup and Recovery

Production databases require:

- Regular backups
- Restore testing
- Disaster recovery plan

A backup that cannot be restored is not a backup.

---

# 20. Database Testing

Test:

## Schema

- Constraints
- Relationships
- Migrations

## Queries

- Correct results
- Performance

## Integration

- Application behavior with real database

---

# 21. Database Review Checklist

Before releasing database changes:

## Design

- Are entities clear?
- Are relationships correct?
- Is duplication controlled?

## Performance

- Are indexes needed?
- Are queries optimized?

## Security

- Are permissions correct?
- Is sensitive data protected?

## Scalability

- Can this handle growth?
- Will future features fit?

---

# Database Engineering Rule

A good database is not the one with the most tables.

A good database is one that:

- Represents the business correctly
- Protects data integrity
- Performs reliably
- Scales with growth
- Remains understandable years later
