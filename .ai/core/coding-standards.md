# Coding Standards

## Purpose

This document defines the coding standards that every implementation must follow.

Code is not written only for computers.

Code is written for:

- Future developers
- Team collaboration
- Long-term maintenance
- System evolution

The goal is not the shortest code.

The goal is the clearest, safest, and most maintainable solution.

---

# 1. Code Quality Philosophy

Every piece of code must be:

- Readable
- Predictable
- Maintainable
- Testable
- Secure
- Performant

Good code should make the next change easier.

Avoid solutions that work today but create problems tomorrow.

---

# 2. Naming Standards

Names must communicate intent.

Avoid:

```ts
const x = getData();

const temp = process();

const result = handle();
```

Prefer:

```ts
const userProfile = getUserProfile();

const formattedInvoice = formatInvoice();

const paymentResult = processPayment();
```

---

## Variables

Variables should describe their purpose.

Bad:

```ts
const d = new Date();

const data = response;

const value = calculate();
```

Good:

```ts
const createdAt = new Date();

const userProfile = response;

const totalPrice = calculateTotal();
```

---

## Functions

Functions should describe actions.

Good:

```ts
createUser();

validatePayment();

calculateShippingCost();
```

Avoid:

```ts
handle();

process();

manage();

execute();
```

---

## Boolean Values

Boolean names should describe state.

Good:

```ts
isAuthenticated;

hasPermission;

canEditProfile;

shouldRefresh;
```

Avoid:

```ts
status;

flag;

check;
```

---

# 3. Function Standards

Functions should:

- Do one thing
- Have a clear purpose
- Be easy to test
- Avoid hidden side effects

Prefer:

```ts
calculateOrderTotal();

validateUserInput();

sendEmailNotification();
```

Avoid:

```ts
processEverything();

handleData();
```

---

Rules:

- Keep functions small
- Avoid deep nesting
- Prefer early returns
- Avoid excessive parameters
- Avoid hidden dependencies

---

# 4. Variables and Constants

Avoid magic values.

Bad:

```ts
if (user.age > 18) {
}
```

Better:

```ts
const MINIMUM_ADULT_AGE = 18;

if (user.age > MINIMUM_ADULT_AGE) {
}
```

---

Rules:

- Use constants for repeated values
- Use meaningful names
- Avoid unnecessary mutation

Prefer:

```ts
const
```

over:

```ts
let;
```

when reassignment is not required.

---

# 5. TypeScript Standards

Use strict TypeScript.

Rules:

- Avoid `any`
- Define clear contracts
- Use meaningful types
- Keep types close to their domain
- Prefer inference when obvious

Avoid:

```ts
const data: any = response;
```

Prefer:

```ts
const user: User = response;
```

---

Use:

- Interfaces for contracts
- Types for compositions
- Enums carefully
- Discriminated unions when useful

Avoid weak typing.

---

# 6. Error Handling

Errors are expected system states.

Every operation should consider:

- Loading
- Success
- Failure
- Retry behavior
- User feedback

Avoid:

```ts
try {
} catch {}
```

without handling.

---

Errors should:

- Have meaningful messages
- Be logged appropriately
- Not expose sensitive information
- Help debugging

Never expose:

- Passwords
- Tokens
- Internal database details
- Private information

---

# 7. Async Code Standards

Prefer readable asynchronous code.

Avoid unnecessary nesting.

Bad:

```ts
fetchUser().then((user) => {
  fetchOrders(user.id);
});
```

Prefer:

```ts
const user = await fetchUser();

const orders = await fetchOrders(user.id);
```

---

Rules:

- Handle failures
- Avoid unnecessary requests
- Avoid race conditions
- Cancel unnecessary operations when needed

---

# 8. React Component Standards

Components must be:

- Small
- Reusable
- Composable
- Focused

Avoid:

- Giant components
- Business logic inside JSX
- Duplicate UI
- Mixed responsibilities

Preferred:

```text
Component

├── UI
├── Hooks
├── Types
├── Helpers
└── Constants
```

---

A component should not:

- Fetch unrelated data
- Manage complex business rules
- Control unrelated features

---

# 9. Hooks Standards

Hooks should:

- Have one responsibility
- Hide complexity
- Be reusable
- Have predictable behavior

Good:

```ts
useUserPermissions();

useProductsQuery();

useDebounce();
```

Avoid:

```ts
useEverything();
```

---

# 10. State Management Rules

Use the simplest solution.

Priority:

```text
1. Local component state

2. Server state tools

3. Context

4. Zustand

5. Redux Toolkit when justified
```

---

Avoid:

- Global state without need
- Duplicated data
- Storing derived values
- Complex state machines without reason

---

# 11. API Code Standards

Separate responsibilities.

Preferred flow:

```text
Component

↓

Hook

↓

Service

↓

API Client

↓

Backend
```

Components should not:

- Directly manage complex API calls
- Handle business rules
- Duplicate API logic

---

# 12. Backend Code Standards

Backend code must separate:

```text
Controller

↓

Service

↓

Repository

↓

Database
```

Rules:

Controller:

- Handles requests
- Validates input
- Returns responses

Service:

- Contains business logic

Repository:

- Handles persistence

---

Never:

- Put business logic in controllers
- Mix database logic with business rules
- Return raw database models everywhere

---

# 13. Validation Standards

Validation must be consistent.

Prefer:

- Schema validation
- Reusable validators
- Shared contracts

Avoid:

Frontend:

```ts
email validation
```

Backend:

```ts
different email validation
```

when the rule should be identical.

Business rules should have one source of truth whenever possible.

---

# 14. File Organization Standards

Every file must have a clear purpose.

Avoid:

```text
utils/

helpers/

common/

misc/
```

with unrelated code.

Prefer:

```text
features/

users/

products/

payments/
```

with clear ownership.

---

# 15. Comments Standards

Comments should explain:

- Why something exists
- Important decisions
- Complex reasoning

Avoid explaining obvious code.

Bad:

```ts
// Loop through users
users.map();
```

Good:

```ts
// Cache results because this endpoint is accessed frequently
```

---

# 16. AI Generated Code Rules

AI-generated code must be reviewed.

Never blindly accept:

- Generated abstractions
- Duplicate logic
- Large components
- Unnecessary dependencies
- Unclear naming

Before accepting generated code:

Check:

- Does it follow project architecture?
- Does it follow existing patterns?
- Is it maintainable?
- Is it secure?
- Is it necessary?

---

# 17. Code Review Checklist

Before completing work:

## Quality

- Is the code readable?
- Are responsibilities clear?
- Is duplication avoided?

## Security

- Are inputs validated?
- Are secrets protected?
- Are permissions checked?

## Performance

- Are unnecessary renders avoided?
- Are queries optimized?
- Are assets optimized?

## Maintainability

- Can another developer understand this quickly?
- Does it follow project conventions?

---

# Engineering Rule

Prefer:

```text
Clean code today
```

over:

```text
Fast code today that creates problems tomorrow
```

Every contribution should improve the system.

Code quality is not a final step.

Code quality is the standard from the first line.
