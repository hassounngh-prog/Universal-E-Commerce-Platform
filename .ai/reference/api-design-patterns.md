# API Design Patterns

## Purpose

APIs are contracts between systems.

A well-designed API should be:

- Predictable
- Secure
- Scalable
- Maintainable
- Easy to consume
- Easy to evolve

API design decisions affect:

- Frontend development
- Backend architecture
- Mobile applications
- Third-party integrations
- Long-term maintenance

The goal is not only to make APIs work.

The goal is to create APIs that remain reliable as the product grows.

---

# 1. API Design Philosophy

Follow these principles:

## Consistency Over Preference

Every API should follow established patterns.

Keep consistent:

- Naming
- Response formats
- Error handling
- Authentication
- Pagination
- Validation

A predictable API reduces developer cognitive load.

---

## Design Around Resources

APIs should represent business resources.

Prefer:

```
/users
/products
/orders
/payments
```

Avoid:

```
/getUsers
/createNewProduct
/processOrderAction
```

Use HTTP methods to describe actions.

---

# 2. REST API Patterns

Default REST structure:

```
Client

↓

API Endpoint

↓

Controller

↓

Service

↓

Repository

↓

Database
```

Each layer has a clear responsibility.

---

# 3. HTTP Method Standards

Use HTTP methods correctly.

## GET

Used for retrieving data.

Example:

```
GET /users
GET /users/:id
```

Should:

- Not modify data
- Be cache-friendly

---

## POST

Used for creating resources.

Example:

```
POST /users
POST /orders
```

---

## PUT

Used for replacing resources.

Example:

```
PUT /users/:id
```

---

## PATCH

Used for partial updates.

Example:

```
PATCH /users/:id
```

---

## DELETE

Used for removing resources.

Example:

```
DELETE /users/:id
```

---

# 4. Resource Naming

Use:

- Nouns
- Plural resources
- Clear names

Prefer:

```
/users
/products
/orders
```

Avoid:

```
/userList
/getProducts
/createOrder
```

---

# 5. API Versioning

APIs evolve.

Plan for changes.

Common approach:

```
/api/v1/users
/api/v2/users
```

Version when:

- Breaking changes occur
- Response structures change
- Authentication changes

Avoid unnecessary versions for small changes.

---

# 6. Request Validation

Never trust incoming requests.

Validate:

- Body
- Query parameters
- URL parameters
- Headers
- Files

Validation should happen before business logic.

Flow:

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

# 7. Response Design

Responses should be predictable.

Example:

Success:

```json
{
  "data": {
    "id": "123",
    "name": "Product"
  }
}
```

---

Collection response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

Avoid:

- Different formats between endpoints
- Returning unnecessary fields
- Exposing database models directly

---

# 8. Error Handling Pattern

Errors are part of the API contract.

Use consistent error responses.

Example:

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User does not exist"
  }
}
```

Errors should include:

- Machine-readable code
- Human-readable message
- Appropriate HTTP status

---

Avoid exposing:

- Database errors
- Stack traces
- Internal details

---

# 9. HTTP Status Codes

Use meaningful status codes.

Common:

## Success

```
200 OK
```

Request succeeded.

```
201 Created
```

Resource created.

```
204 No Content
```

Successful action without response body.

---

## Client Errors

```
400 Bad Request
```

Invalid request.

```
401 Unauthorized
```

Missing authentication.

```
403 Forbidden
```

Not allowed.

```
404 Not Found
```

Resource does not exist.

```
409 Conflict
```

Resource conflict.

```
422 Unprocessable Entity
```

Validation failure.

---

## Server Errors

```
500 Internal Server Error
```

Unexpected server failure.

---

# 10. Authentication Patterns

APIs should clearly define authentication.

Common approaches:

- Session-based authentication
- JWT authentication
- OAuth providers
- API keys for services

Never:

- Trust client identity
- Store sensitive tokens insecurely
- Expose private credentials

---

# 11. Authorization Patterns

Every protected endpoint must verify:

1. User identity
2. User permissions
3. Resource ownership

Example:

```
DELETE /orders/123

↓

Is user authenticated?

↓

Does user have permission?

↓

Does order belong to user?

↓

Delete
```

---

# 12. Pagination Patterns

Never return unlimited collections.

Bad:

```
GET /products
```

returns:

```
1,000,000 products
```

Better:

```
GET /products?page=1&limit=20
```

Support:

- Page number
- Limit
- Total count when needed

---

# 13. Filtering and Sorting

Support predictable query parameters.

Example:

```
GET /products?
category=phones
&sort=price
&order=asc
```

Avoid custom endpoint explosion.

Bad:

```
/products/cheapPhones
/products/newPhones
```

---

# 14. API Performance Patterns

Consider:

- Response size
- Database queries
- Caching
- Compression
- Pagination

Avoid:

- Returning unused data
- N+1 queries
- Expensive calculations on every request

---

# 15. DTO Pattern

Do not expose database entities directly.

Use:

```
Database Entity

↓

DTO

↓

API Response
```

Benefits:

- Security
- Stability
- Clear contracts
- Easier evolution

---

# 16. Service Layer Pattern

Controllers should not contain business logic.

Bad:

```
Controller

├── Validate business rules
├── Calculate prices
├── Update database
```

Better:

```
Controller

↓

Service

↓

Repository
```

---

# 17. Repository Pattern

Repositories isolate database access.

Example:

```
UserService

↓

UserRepository

↓

Database
```

Benefits:

- Easier testing
- Database flexibility
- Cleaner business logic

---

# 18. Documentation Pattern

Every API should have documentation.

Include:

- Endpoints
- Request format
- Response format
- Authentication
- Errors
- Examples

Prefer:

- OpenAPI / Swagger
- Generated documentation

---

# 19. API Security Checklist

Before releasing an API:

## Authentication

- Is authentication required?
- Are sessions/tokens secure?

## Authorization

- Are permissions checked?
- Is ownership verified?

## Validation

- Is all input validated?
- Are malicious inputs handled?

## Data

- Are sensitive fields hidden?
- Are responses minimal?

## Performance

- Is pagination implemented?
- Are queries optimized?

---

# API Design Principle

A good API is not only functional.

A good API is:

- Predictable for developers
- Secure for users
- Stable over time
- Easy to evolve
- Designed for scale

The best APIs make the correct usage the easiest usage.
