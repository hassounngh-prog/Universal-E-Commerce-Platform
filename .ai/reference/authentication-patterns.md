Create this file:

`/.ai/reference/authentication-patterns.md`

```md
# Authentication Patterns

## 1. Authentication Philosophy

Authentication is the process of verifying who a user is.

A production authentication system must be:

- Secure
- Reliable
- Scalable
- User-friendly
- Auditable
- Maintainable

Authentication is not only a login form.

It is a complete identity lifecycle:
```

Registration
↓
Verification
↓
Authentication
↓
Session Management
↓
Authorization
↓
Account Recovery
↓
Account Removal

```

---

# 2. Authentication vs Authorization

These concepts must always be separated.

## Authentication

Answers:

> Who are you?

Examples:

- Email/password
- OAuth login
- Passkeys
- Biometrics

---

## Authorization

Answers:

> What are you allowed to do?

Examples:

- Admin permissions
- User roles
- Resource ownership

Flow:

```

User

↓

Authentication

↓

Identity Created

↓

Authorization Check

↓

Access Granted

````

Never use authentication as authorization.

---

# 3. User Identity Model

A user identity should have a clear structure.

Example:

```ts
User

{
 id,
 email,
 passwordHash,
 status,
 createdAt,
 updatedAt
}
````

Avoid storing unnecessary information.

Keep identity data separate from:

- Profile data
- Preferences
- Application data

---

# 4. Password Authentication

Password systems must follow strict security rules.

Never store:

```
Plain password
```

Always store:

```
Password

↓

Hash Algorithm

↓

Salt

↓

Password Hash
```

Use modern algorithms:

- Argon2
- bcrypt
- scrypt

Never create custom hashing systems.

---

# 5. Password Rules

A secure password system should include:

- Minimum length
- Common password blocking
- Secure reset flow
- Login attempt protection
- Password change history when needed

Avoid:

- Excessive complexity rules
- Forced frequent changes without reason

Security should improve usability, not harm it.

---

# 6. Session-Based Authentication

Session authentication stores user state on the server.

Flow:

```
Login

↓

Create Session

↓

Store Session Identifier

↓

Send Secure Cookie

↓

User Requests

↓

Validate Session
```

Advantages:

- Easy invalidation
- Good security control
- Suitable for web applications

---

# 7. Cookie Security

Authentication cookies must use:

## HttpOnly

Prevents JavaScript access.

Protects against:

- Token theft through XSS

---

## Secure

Cookie only sent over HTTPS.

---

## SameSite

Controls cross-site sending behavior.

Helps prevent:

- CSRF attacks

---

Example:

```text
HttpOnly
Secure
SameSite=Strict
```

---

# 8. Token-Based Authentication

Common for:

- APIs
- Mobile applications
- Distributed systems

Flow:

```
Login

↓

Generate Token

↓

Client Stores Token

↓

Send Token With Requests

↓

Backend Validates Token
```

---

# 9. JWT Patterns

JWT contains:

- Header
- Payload
- Signature

Example:

```json
{
  "userId": "123",
  "role": "user"
}
```

Rules:

Never store:

- Passwords
- Secrets
- Sensitive information

JWT payload is readable.

---

# 10. Access Token and Refresh Token

Use two-token strategy.

```
Access Token

Short lifetime

↓

API Access


Refresh Token

Long lifetime

↓

Generate New Access Token
```

Benefits:

- Better security
- Limited damage if access token leaks

---

# 11. OAuth Authentication

OAuth allows users to authenticate using external providers.

Examples:

- Google
- GitHub
- Apple

Flow:

```
User

↓

OAuth Provider

↓

Authorization Code

↓

Application

↓

User Account
```

Never handle provider passwords.

---

# 12. Multi-Factor Authentication (MFA)

MFA adds another verification layer.

Factors:

## Something you know

- Password

## Something you have

- Phone
- Security key

## Something you are

- Biometrics

Use MFA for:

- Admin accounts
- Sensitive operations
- High-value applications

---

# 13. Role-Based Access Control (RBAC)

RBAC assigns permissions through roles.

Example:

```
User

↓

Role

↓

Permissions
```

Example:

```text
Admin
 ├─ Create users
 ├─ Delete users
 └─ Manage settings


User
 ├─ View profile
 └─ Update profile
```

---

# 14. Permission-Based Authorization

For complex systems, use permissions.

Example:

```text
users.read
users.create
users.delete
orders.manage
```

Better for:

- Enterprise applications
- Large teams
- Complex products

---

# 15. Resource Ownership Checks

Never rely only on roles.

Example:

Bad:

```text
User is authenticated
↓
Allow update profile
```

Better:

```text
User authenticated

↓

Check resource ownership

↓

Allow update
```

---

# 16. Account Recovery

Password recovery is a security-sensitive operation.

Requirements:

- Short-lived reset tokens
- One-time usage
- Expiration
- Rate limiting
- Identity verification

Never:

- Reveal if an email exists
- Send passwords by email

---

# 17. Login Protection

Protect authentication endpoints.

Use:

- Rate limiting
- Failed attempt tracking
- Suspicious activity detection
- Device monitoring when needed

Avoid:

- Unlimited login attempts

---

# 18. Authentication Architecture

Recommended separation:

```
Controller

↓

Authentication Service

↓

User Service

↓

Repository

↓

Database
```

Responsibilities:

## Controller

Handles requests.

## Auth Service

Handles:

- Login
- Registration
- Token generation
- Verification

## User Service

Handles:

- User management
- Profile logic

## Repository

Handles:

- Data access

---

# 19. Security Checklist

Before releasing authentication:

## Passwords

- Are passwords hashed?
- Are reset flows secure?

## Sessions

- Are cookies protected?
- Are tokens handled safely?

## Authorization

- Are permissions checked server-side?
- Are ownership rules enforced?

## Attacks

- Is rate limiting enabled?
- Are CSRF/XSS risks handled?

## Monitoring

- Are authentication events logged?
- Are suspicious actions detected?

---

# Authentication Principle

Identity is the foundation of application security.

A secure authentication system:

- Protects users
- Protects data
- Scales with the product
- Makes authorization reliable

Never treat authentication as just a login page.
