# Security Standards

## 1. Security Philosophy

Security is a fundamental requirement, not an optional feature.

Every system must be designed with security in mind from the beginning.

Security principles:

- Never trust external input.
- Minimize attack surface.
- Protect user data.
- Fail securely.
- Apply the principle of least privilege.
- Prefer secure defaults.

Security should be built into architecture, not added later.

---

# 2. Authentication Standards

Authentication must be:

- Secure
- Explicit
- Auditable
- Scalable

Consider:

- Strong password policies
- Secure session management
- Multi-factor authentication when needed
- Account recovery security
- Login attempt protection

Never:

- Store passwords in plain text.
- Expose authentication tokens.
- Trust client-side authentication checks.

Passwords must always be:

- Hashed using strong algorithms.
- Salted.
- Protected from unauthorized access.

---

# 3. Authorization Standards

Authentication answers:

"Who is the user?"

Authorization answers:

"What can the user do?"

Always separate them.

Every protected action must verify:

- User identity
- User permissions
- Resource ownership

Never rely only on frontend restrictions.

Bad:

```text
Hide button = security
```

Good:

```text
Backend permission check = security
```

---

# 4. Input Validation

Never trust user input.

Validate all external data:

- Forms
- API requests
- Query parameters
- Files
- URLs
- Headers

Validation must happen:

- Client side for user experience.
- Server side for security.

Never assume frontend validation is enough.

---

# 5. Protection Against Common Attacks

## XSS (Cross-Site Scripting)

Prevent by:

- Escaping user-generated content.
- Sanitizing HTML.
- Avoiding unsafe rendering.
- Using secure framework defaults.

Never inject uncontrolled user content into the DOM.

---

## SQL Injection

Prevent by:

- Using parameterized queries.
- Using ORM protections correctly.
- Validating input.

Never build SQL queries with string concatenation.

Bad:

```ts
`SELECT * FROM users WHERE id=${id}`;
```

Good:

```ts
parameterizedQuery(id);
```

---

## CSRF

Protect using:

- Secure cookies.
- CSRF tokens when required.
- SameSite cookie policies.
- Proper authentication design.

---

## SSRF

Protect by:

- Validating external URLs.
- Restricting allowed destinations.
- Blocking internal network access when unnecessary.

---

## Clickjacking

Protect using:

- Content Security Policy.
- Frame restrictions.
- Security headers.

---

# 6. API Security

APIs must include:

- Authentication
- Authorization
- Validation
- Rate limiting
- Logging
- Error handling

Never expose:

- Internal errors
- Database details
- Sensitive information

API responses should contain only required data.

---

# 7. Data Protection

Sensitive data must be protected.

Rules:

- Encrypt sensitive information when required.
- Do not store unnecessary personal data.
- Remove sensitive data from logs.
- Protect backups.
- Use secure communication.

Never expose:

- Passwords
- Private tokens
- API keys
- Internal credentials

---

# 8. Environment Variables and Secrets

Secrets must never exist in:

- Source code
- Git repositories
- Public files
- Client-side bundles

Use:

- Environment variables
- Secret managers
- Secure deployment configuration

Example:

Bad:

```ts
const API_KEY = "secret-key";
```

Good:

```ts
process.env.API_KEY;
```

---

# 9. Database Security

Database access must follow:

- Least privilege
- Strong authentication
- Secure connections
- Access control

Consider:

- Query optimization
- Index security impact
- Migration safety
- Backup protection

Never expose direct database access to clients.

---

# 10. File Upload Security

File uploads must validate:

- File type
- File size
- File name
- File content

Prevent:

- Malicious uploads
- Executable files
- Storage abuse

Never trust file extensions alone.

---

# 11. Dependency Security

Third-party dependencies must be:

- Reviewed
- Updated
- Monitored

Regularly check:

- Vulnerabilities
- Outdated packages
- Supply chain risks

Avoid unnecessary dependencies.

---

# 12. Logging and Monitoring

Logs should help detect problems without leaking information.

Log:

- Security events
- Authentication attempts
- Important system actions
- Errors

Do not log:

- Passwords
- Tokens
- Personal secrets
- Sensitive user data

---

# 13. Error Handling Security

Errors must not reveal internal details.

Avoid exposing:

- Database errors
- Stack traces
- Server information
- Internal paths

Provide:

- User-friendly messages
- Detailed internal logs

---

# 14. Frontend Security

Frontend applications must:

- Protect user sessions.
- Avoid unsafe HTML rendering.
- Validate user input.
- Handle permissions correctly.
- Protect sensitive routes.

Never assume frontend code is trusted.

All important security rules belong on the server.

---

# 15. Backend Security

Backend systems must implement:

- Authentication
- Authorization
- Validation
- Rate limiting
- Secure headers
- Monitoring

Business logic must enforce security rules.

---

# 16. Security Review Checklist

Before releasing a feature:

## Authentication

- Are users properly authenticated?
- Are sessions secure?

## Authorization

- Are permissions checked?
- Can users access unauthorized resources?

## Input

- Is all input validated?
- Is malicious input handled safely?

## Data

- Are secrets protected?
- Is sensitive data minimized?

## Infrastructure

- Are configurations secure?
- Are dependencies safe?

---

# Security Principle

Secure software is software designed with security from the beginning.

The goal is:

- Protect users.
- Protect data.
- Protect the business.
- Reduce risk through good engineering decisions.
