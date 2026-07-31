# Security Patterns

## Purpose

Security is not a feature added at the end.

Security is an engineering discipline that must influence:

- Architecture decisions
- Application design
- Database structure
- API design
- User experience
- Deployment strategy

The goal is to build systems that protect:

- Users
- Data
- Business logic
- Infrastructure

Secure by design is always better than fixing vulnerabilities later.

---

# 1. Security Philosophy

Follow these principles:

## Never Trust External Input

Everything coming from outside the system is untrusted.

Examples:

- User input
- API requests
- Query parameters
- Uploaded files
- Third-party responses
- Client-side data

Always validate and sanitize.

---

## Principle of Least Privilege

Every user, service, and system component should have only the permissions it needs.

Avoid:

- Excessive database permissions
- Overpowered API keys
- Admin access by default

---

## Secure Defaults

The default behavior should be safe.

Prefer:

- Disabled access unless granted
- Protected routes
- Encrypted communication
- Validated input

---

# 2. Authentication Patterns

Authentication answers:

> Who is this user?

Authentication systems should provide:

- Identity verification
- Secure sessions
- Account protection
- Recovery mechanisms

---

## Password Security

Never store passwords directly.

Always:

- Hash passwords
- Use strong algorithms
- Use unique salts

Never:

```text
Plain password storage
```

Prefer:

```text
Password

↓

Hash algorithm

↓

Stored hash
```

---

## Session Management

Sessions must be:

- Secure
- Expirable
- Revocable

Consider:

- Secure cookies
- HttpOnly cookies
- SameSite policies
- Session expiration
- Device management

Never expose sensitive authentication tokens.

---

## Multi-Factor Authentication

Use MFA when security requirements justify it.

Common cases:

- Admin accounts
- Financial systems
- Sensitive data access

---

# 3. Authorization Patterns

Authorization answers:

> What is this user allowed to do?

Never rely only on frontend restrictions.

Bad:

```text
Hide button = security
```

Good:

```text
Backend permission verification = security
```

---

## Role-Based Access Control (RBAC)

Use roles when permissions follow user groups.

Example:

```text
Admin

↓

Manage everything


Editor

↓

Create and update content


User

↓

Access own resources
```

---

## Resource Ownership

Always verify ownership.

Example:

Bad:

```text
User requests /orders/123

↓

Return order 123
```

Good:

```text
User requests /orders/123

↓

Check ownership

↓

Return only if authorized
```

---

# 4. Input Validation Patterns

Every external input must be validated.

Validate:

- Type
- Format
- Length
- Range
- Business rules

Validation layers:

```text
Frontend validation

↓

API validation

↓

Business validation

↓

Database constraints
```

Frontend validation improves UX.

Backend validation provides security.

---

# 5. API Security Patterns

APIs should always consider:

- Authentication
- Authorization
- Validation
- Rate limiting
- Logging
- Error handling

---

## Secure API Responses

Return only required data.

Avoid exposing:

- Internal IDs
- Database structures
- Sensitive fields
- Debug information

---

## Rate Limiting

Protect against:

- Abuse
- Brute force attacks
- Resource exhaustion

Apply limits to:

- Login endpoints
- Public APIs
- Expensive operations

---

# 6. Common Attack Prevention

## XSS Protection

Prevent:

- Unsafe HTML rendering
- Unescaped user content
- Script injection

Use:

- Framework protections
- Output escaping
- Content Security Policy

---

## SQL Injection Protection

Never build SQL using string concatenation.

Bad:

```ts
`SELECT * FROM users WHERE id=${id}`;
```

Good:

```text
Parameterized queries

↓

Database
```

Use:

- ORM safely
- Prepared statements
- Input validation

---

## CSRF Protection

Protect state-changing requests.

Use:

- SameSite cookies
- CSRF tokens when needed
- Proper authentication design

---

## SSRF Protection

Validate external requests.

Protect against:

- Internal network access
- Unauthorized service calls
- Malicious URLs

---

# 7. Database Security Patterns

Database access should follow:

- Least privilege
- Strong authentication
- Secure connections

Always consider:

- Encryption
- Backups
- Access control
- Audit logs

Never expose databases directly to clients.

---

# 8. File Upload Security

Never trust uploaded files.

Validate:

- File type
- File size
- File content
- File name

Protect against:

- Malware uploads
- Storage abuse
- Executable files

---

# 9. Secret Management

Never store secrets in:

- Source code
- Git repositories
- Public files
- Frontend bundles

Use:

- Environment variables
- Secret managers
- Secure deployment configuration

Examples:

Secrets:

```text
API keys
Database passwords
Private tokens
Certificates
```

---

# 10. Error Handling Security

Errors should help developers without exposing internal information.

Never expose:

- Stack traces
- Database errors
- Server details
- Internal paths

Use:

```text
User

↓

Safe error message


Developer

↓

Detailed secure logs
```

---

# 11. Dependency Security

Third-party packages are part of your attack surface.

Regularly:

- Update dependencies
- Check vulnerabilities
- Remove unused packages

Avoid unnecessary dependencies.

---

# 12. Logging and Monitoring

Logs should support security investigation.

Log:

- Authentication events
- Permission failures
- Important actions
- System errors

Never log:

- Passwords
- Tokens
- Secrets
- Sensitive personal data

---

# 13. Frontend Security Patterns

Frontend applications must:

- Protect sessions
- Validate input
- Handle permissions correctly
- Avoid unsafe rendering

Remember:

Frontend code is public.

Never place sensitive logic only in the frontend.

---

# 14. Backend Security Patterns

Backend systems are responsible for enforcing security.

Must implement:

- Authentication
- Authorization
- Validation
- Rate limiting
- Secure headers
- Monitoring

Business rules must protect data.

---

# 15. Security Review Checklist

Before releasing any feature:

## Authentication

- Are users authenticated correctly?
- Are sessions secure?

## Authorization

- Are permissions verified?
- Is ownership checked?

## Input

- Is all external data validated?
- Are malicious inputs handled?

## Data

- Are secrets protected?
- Is sensitive data minimized?

## Infrastructure

- Are dependencies secure?
- Are configurations protected?

---

# Security Principle

Secure software is not created by adding security later.

It is created by making secure decisions from the beginning.

The goal:

- Protect users
- Protect data
- Reduce risk
- Build trustworthy systems
- Maintain security as the system grows
