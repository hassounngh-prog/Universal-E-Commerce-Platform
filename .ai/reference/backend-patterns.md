# Backend Patterns Reference

## Purpose

This document defines backend engineering patterns for building scalable, secure, maintainable production systems.

The backend is responsible for:

- Business logic
- Data integrity
- Security enforcement
- System reliability
- External integrations
- Application scalability

Backend code should be designed for long-term evolution.

---

# 1. Backend Architecture Philosophy

Backend systems should prioritize:

- Clear responsibilities
- Strong boundaries
- Testability
- Security
- Scalability
- Maintainability

Avoid building a backend as a collection of random endpoints.

A backend is a business system, not only an API.

---

# 2. Recommended Backend Architecture

Preferred architecture:

```
Request

↓

Controller Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

↓

Database / External Services
```

Each layer has a specific responsibility.

---

# 3. Controller Pattern

Controllers handle communication with external clients.

Responsibilities:

- Receive requests
- Validate input
- Call application services
- Return responses

Controllers should NOT contain:

- Business rules
- Database queries
- Complex calculations
- External service logic

Bad:

```ts
@Post()
createUser() {
  // validate
  // calculate business rules
  // query database
  // send email
}
```

Good:

```ts
@Post()
createUser(dto) {
  return userService.create(dto);
}
```

---

# 4. Service Layer Pattern

Services contain application logic.

Responsibilities:

- Execute use cases
- Coordinate operations
- Apply business workflows

Example:

```
CreateOrderService

↓

Validate customer

↓

Check inventory

↓

Create order

↓

Send notification
```

Services should be:

- Focused
- Testable
- Independent from frameworks

---

# 5. Domain Layer Pattern

The domain layer contains business rules.

Contains:

- Entities
- Value objects
- Domain validations
- Business rules

Example:

```ts
Order.canBeCancelled();
Payment.isRefundable();
User.canAccessResource();
```

Business rules should not live inside:

- Controllers
- Database models
- UI components

---

# 6. Repository Pattern

Repositories abstract data access.

Responsibilities:

- Database communication
- Query execution
- Data persistence

Example:

```
Service

↓

UserRepository

↓

Database
```

Benefits:

- Easier testing
- Database flexibility
- Cleaner business logic

Avoid:

```ts
service.userRepository.database.query();
```

Prefer:

```ts
userRepository.findByEmail(email);
```

---

# 7. DTO Pattern

DTOs define external data contracts.

Use DTOs for:

- API requests
- API responses
- Validation

Example:

```ts
CreateUserDto;

{
  name: string;
  email: string;
  password: string;
}
```

Never expose internal database models directly.

---

# 8. Validation Pattern

All external input must be validated.

Validate:

- Request body
- Query parameters
- URL parameters
- Uploaded files

Validation belongs at system boundaries.

Flow:

```
External Input

↓

Validation

↓

Business Logic

↓

Database
```

Never trust incoming data.

---

# 9. Error Handling Pattern

Errors should be predictable.

Create:

- Custom errors
- Error codes
- Proper HTTP responses

Example:

```
USER_NOT_FOUND

INVALID_PERMISSION

PAYMENT_FAILED
```

Avoid exposing:

- Database errors
- Stack traces
- Internal implementation details

---

# 10. Authentication Pattern

Authentication verifies identity.

Common flow:

```
Login Request

↓

Validate Credentials

↓

Generate Session / Token

↓

Return Authentication Result
```

Consider:

- Secure sessions
- Token expiration
- Refresh strategy
- Account protection
- Login monitoring

Never:

- Store plain passwords
- Trust client authentication
- Expose sensitive tokens

---

# 11. Authorization Pattern

Authorization controls permissions.

Always check:

- User identity
- Role
- Permission
- Resource ownership

Example:

```
Can User X edit Document Y?
```

must be checked server-side.

Frontend hiding buttons is not security.

---

# 12. API Design Pattern

APIs should be:

- Predictable
- Consistent
- Versionable
- Documented

Prefer:

```
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

Use:

- Clear naming
- Proper HTTP methods
- Meaningful status codes

---

# 13. Database Communication Rules

Database access should happen through:

```
Service

↓

Repository

↓

Database
```

Avoid:

- Direct database calls everywhere
- Duplicate queries
- Business logic in queries

---

# 14. Background Jobs Pattern

Long-running tasks should not block requests.

Examples:

- Emails
- Reports
- Image processing
- Notifications
- Data imports

Pattern:

```
API Request

↓

Queue

↓

Worker

↓

Process Task
```

Benefits:

- Better performance
- Better reliability
- Easier scaling

---

# 15. External Service Integration

Third-party services should be isolated.

Example:

```
Application Service

↓

Payment Provider Interface

↓

Stripe Implementation
```

Avoid coupling business logic directly to vendors.

Benefits:

- Easier replacement
- Better testing
- Cleaner architecture

---

# 16. Logging Pattern

Logs should provide visibility.

Log:

- Important actions
- Errors
- Security events
- Performance issues

Never log:

- Passwords
- Tokens
- Secrets
- Sensitive user data

---

# 17. Backend Performance Patterns

Consider:

- Database indexing
- Query optimization
- Caching
- Pagination
- Connection management
- Async processing

Avoid:

- N+1 queries
- Loading unnecessary data
- Blocking operations

---

# 18. Testing Pattern

Backend should test:

## Unit Tests

Business logic:

```
Service
Domain Rules
Utilities
```

## Integration Tests

System interaction:

```
API

↓

Database

↓

External Services
```

## End-to-End Tests

Complete user workflows.

---

# 19. Backend Security Checklist

Before releasing:

## Authentication

- Are sessions secure?
- Are passwords protected?

## Authorization

- Are permissions checked?
- Are resources protected?

## Validation

- Is every input validated?

## Database

- Are queries safe?
- Are permissions correct?

## API

- Are errors handled?
- Is sensitive data protected?

---

# Backend Engineering Rule

A strong backend is not measured by how many endpoints it has.

It is measured by:

- Clear architecture
- Reliable behavior
- Secure design
- Easy maintenance
- Ability to scale

Build backend systems that can evolve for years.
