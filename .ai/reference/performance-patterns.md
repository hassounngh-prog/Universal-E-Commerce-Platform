# Performance Patterns

## Purpose

Performance is a product feature.

A fast application improves:

- User experience
- Conversion rates
- Accessibility
- SEO ranking
- Developer confidence
- Infrastructure cost

Performance decisions must be considered from architecture design to deployment.

The goal is not premature optimization.

The goal is building systems that are efficient by default.

---

# 1. Performance Philosophy

Always prioritize:

- Measure before optimizing.
- Optimize real bottlenecks.
- Keep solutions simple.
- Protect maintainability.
- Avoid unnecessary complexity.

Never optimize blindly.

Bad approach:

```
Optimize everything before knowing the problem.
```

Better approach:

```
Measure
↓
Identify bottleneck
↓
Understand cause
↓
Optimize
↓
Measure again
```

---

# 2. Frontend Performance

## Component Rendering

Avoid unnecessary renders.

Prefer:

- Small focused components
- Stable props
- Proper component boundaries
- Memoization only when valuable

Avoid:

- Large components re-rendering everything
- Passing unnecessary props
- Storing derived data in state

---

## React Component Rules

Prefer:

```text
Page

↓

Feature Component

↓

Reusable Components

↓

Primitive Components
```

Avoid:

```
Huge Page Component
    |
    ├── Business Logic
    ├── API Calls
    ├── State Management
    └── UI Rendering
```

---

# 3. State Management Performance

Use the smallest state scope possible.

Priority:

1. Local state
2. Server state
3. Context
4. Global state

Avoid:

- Duplicated state
- Storing computed values
- Global state for local problems

Example:

Bad:

```ts
const [fullName, setFullName] = useState("");
```

Better:

```ts
const fullName = `${firstName} ${lastName}`;
```

Derived data should be calculated, not duplicated.

---

# 4. Data Fetching Patterns

Optimize:

- Request count
- Payload size
- Caching
- Loading strategy

Prefer:

- Server-side fetching when appropriate
- Request deduplication
- Pagination
- Incremental loading

Avoid:

- Fetching unused data
- Duplicate API requests
- Large unnecessary payloads

---

# 5. Image Optimization

Images are often the largest frontend assets.

Always consider:

- Correct format
- Compression
- Responsive sizes
- Lazy loading
- Proper dimensions

Prefer:

- WebP
- AVIF
- Framework image optimization tools

Avoid:

- Large uncompressed images
- Loading hidden images immediately
- Missing width and height

---

# 6. Bundle Size Optimization

Reduce unnecessary JavaScript.

Consider:

- Code splitting
- Dynamic imports
- Tree shaking
- Removing unused dependencies

Avoid:

- Heavy libraries for simple tasks
- Importing entire packages unnecessarily

Example:

Bad:

```ts
import everything from "large-library";
```

Better:

```ts
import specificFunction from "library/function";
```

---

# 7. CSS Performance

Prefer:

- Utility systems
- Design tokens
- Reusable styles

Avoid:

- Massive duplicated CSS
- Unused styles
- Excessive specificity

Keep styling predictable.

---

# 8. Backend Performance

Backend performance depends on:

- Architecture
- Database design
- API efficiency
- Resource usage

Always consider:

- Response time
- Throughput
- Memory usage
- Scalability

---

# 9. Database Performance

Database performance is usually the biggest backend factor.

Always evaluate:

- Indexes
- Query structure
- Relationships
- Data volume
- Pagination

Avoid:

## N+1 Queries

Bad:

```
Get users

↓

For every user:
    Get orders
```

Better:

```
Get users with required relations
```

---

# 10. API Performance

APIs should:

- Return only required data.
- Use pagination for large collections.
- Cache expensive operations.
- Avoid unnecessary processing.

Prefer:

```
Client

↓

API

↓

Optimized Query

↓

Database
```

---

# 11. Caching Strategy

Caching should be intentional.

Possible layers:

```
Browser Cache

↓

CDN Cache

↓

Application Cache

↓

Database Cache
```

Consider caching:

- Static assets
- Expensive calculations
- Frequently requested data

Avoid caching:

- Sensitive information without proper controls
- Data that changes frequently without strategy

---

# 12. Loading Experience

Users should always understand system state.

Every async operation needs:

- Loading state
- Success state
- Error state
- Empty state

Avoid:

- Blank screens
- Frozen interfaces
- Unknown waiting states

---

# 13. Mobile Performance

Mobile-first means performance-first.

Consider:

- Limited bandwidth
- Lower CPU power
- Battery usage
- Smaller screens

Optimize:

- JavaScript execution
- Images
- Network requests
- Rendering

---

# 14. SEO Performance

Performance impacts SEO.

Consider:

- Core Web Vitals
- Fast initial loading
- Server rendering
- Semantic HTML
- Optimized images

Important metrics:

- Largest Contentful Paint (LCP)
- Interaction to Next Paint (INP)
- Cumulative Layout Shift (CLS)

---

# 15. Monitoring

Performance must be measured continuously.

Monitor:

- Page load time
- API latency
- Database queries
- Errors
- Resource usage

Use real user data when possible.

---

# 16. Performance Review Checklist

Before releasing a feature:

## Frontend

- Are unnecessary renders avoided?
- Are images optimized?
- Is bundle size reasonable?
- Are loading states implemented?

## Backend

- Are queries optimized?
- Are responses efficient?
- Are expensive operations handled correctly?

## Database

- Are indexes required?
- Are relationships efficient?
- Is pagination needed?

## User Experience

- Does the feature feel fast?
- Are users informed during loading?
- Does it work well on mobile?

---

# Performance Principle

The best performance optimization is good architecture.

Build systems that are:

- Efficient by design
- Easy to scale
- Measurable
- Maintainable

Performance is not a final step.

Performance is an engineering habit.
