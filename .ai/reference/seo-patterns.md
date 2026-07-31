Create this file:

`/.ai/reference/seo-patterns.md`

```md
# SEO Engineering Patterns

## 1. SEO Philosophy

SEO is not a marketing layer added after development.

SEO is a product engineering responsibility.

Every application must consider:

- Search engine discoverability
- User experience
- Performance
- Content structure
- Accessibility
- Technical correctness

Good SEO is the result of:

- Clean architecture
- Fast performance
- Quality content
- Correct HTML structure
- Search engine understanding

SEO decisions should be considered during architecture, not after launch.

---

# 2. SEO-First Architecture

Before building pages, define:

- URL structure
- Content hierarchy
- Rendering strategy
- Metadata strategy
- Internal linking strategy
- Structured data requirements

A page should answer:

1. Why does this page exist?
2. Who is searching for it?
3. What intent does it satisfy?
4. How should search engines understand it?

---

# 3. URL Architecture

URLs must be:

- Human readable
- Predictable
- Stable
- SEO friendly

Prefer:
```

/products/macbook-pro
/blog/react-performance-guide
/services/web-development

```

Avoid:

```

/page?id=123
/product?id=456&type=2

```

Rules:

- Use lowercase.
- Use hyphens instead of underscores.
- Avoid unnecessary words.
- Keep URLs short.
- Avoid changing URLs after indexing.

---

# 4. Next.js SEO Patterns

For Next.js applications:

Prefer:

- Server Components by default.
- Static generation when possible.
- Server-side rendering for dynamic content.
- Metadata API.
- Optimized images.

Avoid:

- Client-only pages for SEO-critical content.
- Loading important content after hydration.
- Blocking rendering with unnecessary JavaScript.

Preferred flow:

```

Search Engine

↓

Server Rendered HTML

↓

Content Discovery

↓

User Interaction

````

---

# 5. Metadata Management

Every indexable page should define:

- Title
- Description
- Keywords when relevant
- Canonical URL
- Open Graph metadata
- Twitter metadata

Example:

```ts
export const metadata = {
  title: "Professional Web Development Services",
  description:
    "Build scalable and modern web applications.",
};
````

Rules:

Title:

- Unique per page.
- Clear user intent.
- Around 50-60 characters when possible.

Description:

- Unique.
- Explains page value.
- Encourages clicks.

Avoid:

- Duplicate metadata.
- Generic titles.
- Missing descriptions.

---

# 6. Open Graph and Social Sharing

Every important page should support sharing.

Include:

- Title
- Description
- Image
- URL
- Type

Required for:

- Social previews.
- Professional sharing.
- Brand consistency.

Example:

```
User shares URL

↓

Platform reads metadata

↓

Displays preview card
```

---

# 7. Structured Data (JSON-LD)

Structured data helps search engines understand content.

Use when applicable:

- Organization
- Person
- Product
- Article
- FAQ
- Breadcrumb
- Review
- Local Business
- Event

Example:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name"
}
```

Rules:

- Only add truthful structured data.
- Match visible page content.
- Validate schemas.

Never manipulate structured data.

---

# 8. Semantic HTML

HTML structure communicates meaning.

Prefer:

```html
<header>
  <nav>
    <main>
      <section>
        <article>
          <footer></footer>
        </article>
      </section>
    </main>
  </nav>
</header>
```

Use headings correctly:

```
H1
 |
 ├── H2
 │     └── H3
 |
 └── H2
```

Rules:

- One main H1 per page.
- Logical heading hierarchy.
- Use landmarks correctly.

Avoid:

- Using div everywhere.
- Styling headings without semantic meaning.

---

# 9. Content Architecture

Content should be organized around user intent.

Structure:

```
Main Topic

↓

Supporting Pages

↓

Detailed Content

↓

Internal Links
```

Example:

```
Web Development

├── Frontend Development
├── Backend Development
├── React Development
└── Performance Optimization
```

Avoid:

- Thin pages.
- Duplicate content.
- Pages without purpose.

---

# 10. Internal Linking Strategy

Internal links help:

- Navigation.
- SEO discovery.
- Authority distribution.

Rules:

- Link related content.
- Use descriptive anchor text.
- Avoid excessive links.
- Maintain important page accessibility.

Good:

```
Learn more about React performance optimization
```

Bad:

```
Click here
```

---

# 11. Image SEO

Images must be optimized.

Rules:

Use:

- Proper file formats.
- Compression.
- Responsive images.
- Meaningful filenames.
- Alt text.

Example:

Good:

```
modern-kitchen-renovation.jpg
```

Bad:

```
IMG_29383.jpg
```

Alt text should:

- Describe the image.
- Help accessibility.
- Avoid keyword stuffing.

---

# 12. Performance and SEO

Performance directly affects SEO.

Always optimize:

- Core Web Vitals
- Largest Contentful Paint
- Interaction to Next Paint
- Cumulative Layout Shift

Patterns:

- Optimize images.
- Reduce JavaScript.
- Cache aggressively.
- Lazy load non-critical content.
- Minimize network requests.

Fast websites provide better user experience.

---

# 13. Mobile SEO

Mobile-first is mandatory.

Check:

- Responsive layouts.
- Touch targets.
- Font sizes.
- Navigation usability.
- Mobile performance.

The mobile experience should be the primary design target.

---

# 14. Technical SEO Checklist

Every project should include:

## Indexing

- robots.txt
- sitemap.xml
- canonical URLs
- proper status codes

## Crawling

- No broken links.
- No unnecessary blocked pages.
- Correct redirects.

## Pages

- Unique metadata.
- Proper headings.
- Structured data.
- Quality content.

---

# 15. Rendering Strategy

Choose rendering based on content.

## Static Generation

Use for:

- Marketing pages.
- Documentation.
- Blogs.

Benefits:

- Fast.
- Reliable.
- SEO friendly.

---

## Server Rendering

Use for:

- Personalized pages.
- Frequently changing content.

---

## Client Rendering

Avoid for:

- Important SEO content.

Use only when:

- Interactivity requires it.

---

# 16. International SEO

For multilingual applications:

Consider:

- Language URLs.
- hreflang tags.
- Translated metadata.
- Localized content.

Example:

```
example.com/en/product

example.com/fr/product
```

Avoid:

- Automatic translation without review.
- Duplicate language pages.

---

# 17. SEO Testing

Before release verify:

## Technical

- Pages are indexable.
- Metadata exists.
- Sitemap works.
- Robots configuration is correct.

## Performance

- Good Core Web Vitals.
- Images optimized.
- Fast loading.

## Content

- Correct headings.
- Internal links exist.
- No duplicate content.

## Accessibility

- Semantic HTML.
- Alt text.
- Keyboard navigation.

---

# 18. SEO Anti-Patterns

Avoid:

- Keyword stuffing.
- Hidden text.
- Duplicate pages.
- Fake structured data.
- Slow websites.
- Client-only important content.
- Changing URLs unnecessarily.
- Ignoring mobile users.

---

# SEO Engineering Rule

SEO is the result of building a technically excellent product.

The goal:

- Search engines understand the product.
- Users find valuable content.
- Pages load quickly.
- Information architecture remains scalable.

Great SEO starts with great engineering.
