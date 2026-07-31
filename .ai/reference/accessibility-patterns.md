Create this file:

`/.ai/reference/accessibility-patterns.md`

````md
# Accessibility Engineering Patterns

## 1. Accessibility Philosophy

Accessibility is not a final checklist.

Accessibility is a fundamental part of product quality.

Every application should be designed for:

- People with disabilities
- Different devices
- Different input methods
- Different environments
- Different abilities

Accessible software is usually:

- Easier to use
- Better structured
- More maintainable
- More user friendly

Accessibility must be considered during:

- Architecture
- UI design
- Development
- Testing
- Release

---

# 2. Accessibility Standards

Follow:

- WCAG guidelines
- Semantic HTML standards
- Platform accessibility APIs
- Keyboard navigation principles

Target:

- Clear content structure
- Understandable interactions
- Reliable navigation
- Compatible assistive technologies

---

# 3. Semantic HTML First

HTML elements should communicate meaning.

Prefer:

```html
<header>
  <nav>
    <main>
      <section>
        <article>
          <footer>
            <button>
              <form>
                <label></label>
              </form>
            </button>
          </footer>
        </article>
      </section>
    </main>
  </nav>
</header>
```
````

Avoid replacing semantic elements with generic containers.

Bad:

```html
<div onclick="submit()">Submit</div>
```

Good:

```html
<button>Submit</button>
```

Benefits:

- Screen readers understand structure.
- Keyboard behavior works naturally.
- Browser accessibility features work correctly.

---

# 4. Keyboard Navigation

Every interactive element must work without a mouse.

Users should be able to:

- Navigate with Tab.
- Activate with Enter.
- Use controls with keyboard shortcuts when appropriate.
- Understand focus location.

Required:

- Visible focus states.
- Logical tab order.
- No keyboard traps.

Avoid:

- Removing focus outlines without replacement.
- Custom controls without keyboard support.

---

# 5. Focus Management

Focus should always communicate user position.

Important cases:

## Modal dialogs

When opening:

```
User action

↓

Modal opens

↓

Focus moves inside modal

↓

User completes action

↓

Focus returns
```

## Page navigation

After route changes:

- Announce changes when needed.
- Move focus appropriately.

---

# 6. Screen Reader Support

Applications should provide meaningful information.

Use:

- Semantic HTML.
- Accessible labels.
- Proper headings.
- ARIA only when necessary.

Avoid:

- Adding ARIA everywhere.
- Replacing HTML semantics with ARIA.

Rule:

```
Native HTML first

↓

ARIA enhancement second
```

---

# 7. ARIA Patterns

ARIA helps when native HTML is insufficient.

Common attributes:

```html
aria-label aria-labelledby aria-describedby aria-expanded aria-hidden aria-live
```

Example:

```html
<button aria-expanded="false">Menu</button>
```

Rules:

- Do not duplicate semantic meaning.
- Keep ARIA states synchronized.
- Test with screen readers.

Bad:

```html
<div role="button">Click me</div>
```

when a button element works.

---

# 8. Forms Accessibility

Forms must be understandable.

Every input needs:

- Label
- Clear purpose
- Error feedback
- Required indication

Good:

```html
<label>
  Email address
  <input type="email" />
</label>
```

Avoid:

```html
<input placeholder="Email" />
```

as the only label.

---

# 9. Error Handling Accessibility

Errors must be understandable.

Good error messages:

- Explain the problem.
- Explain how to fix it.
- Are associated with the correct field.

Example:

```
Password must contain at least 8 characters.
```

Avoid:

```
Invalid input.
```

For dynamic errors:

Use:

```html
aria-live="polite"
```

when appropriate.

---

# 10. Color and Contrast

Never communicate information using color alone.

Bad:

```
Red = error
Green = success
```

without additional indicators.

Provide:

- Text labels.
- Icons.
- Patterns.
- Clear states.

Consider:

- Text contrast.
- Button contrast.
- Disabled states.
- Focus visibility.

---

# 11. Typography Accessibility

Text must remain readable.

Consider:

- Font size.
- Line height.
- Letter spacing.
- Content width.
- Text scaling.

Avoid:

- Tiny text.
- Fixed layouts that break zoom.
- Important information inside images.

---

# 12. Responsive Accessibility

Accessibility includes different devices.

Support:

- Mobile users.
- Tablet users.
- Desktop users.
- Touch users.
- Keyboard users.

Ensure:

- Touch targets are large enough.
- Content does not overflow.
- Navigation remains usable.

---

# 13. Component Accessibility Patterns

Reusable components must include accessibility behavior.

Every component should define:

- Keyboard behavior.
- Focus behavior.
- Screen reader behavior.
- Error states.
- Loading states.

Examples:

Button:

```
States:

Default
Hover
Focus
Active
Disabled
Loading
```

Input:

```
States:

Empty
Filled
Focused
Error
Disabled
Success
```

---

# 14. Accessible UI States

Every interactive component should handle:

## Loading

Provide:

- Visual indicator.
- Screen reader announcement when needed.

## Empty State

Explain:

- What happened.
- What user can do next.

## Error State

Explain:

- Problem.
- Solution.

## Success State

Confirm:

- Action completed.

---

# 15. Images Accessibility

Images need correct handling.

## Informative images

Require:

```html
alt="Description of image"
```

## Decorative images

Use:

```html
alt=""
```

Avoid:

- Filename as alt text.
- Keyword stuffing.
- Missing context.

---

# 16. Motion and Animation

Animations should respect user preferences.

Support:

```css
prefers-reduced-motion
```

Avoid:

- Excessive movement.
- Flashing content.
- Animations that block interaction.

Animations should:

- Support understanding.
- Improve feedback.
- Never create barriers.

---

# 17. Authentication Accessibility

Authentication flows should support everyone.

Consider:

- Clear error messages.
- Password visibility toggle.
- Keyboard navigation.
- Accessible forms.
- Account recovery.

Avoid:

- CAPTCHA-only solutions without alternatives.
- Unclear security messages.

---

# 18. Accessibility Testing

Accessibility testing should include:

## Automated Testing

Use:

- Lighthouse
- axe
- Accessibility linters

Automated tools detect only part of problems.

---

## Manual Testing

Test:

- Keyboard only.
- Screen readers.
- Different zoom levels.
- Mobile devices.

---

## Component Testing

Verify:

- Focus behavior.
- ARIA states.
- User feedback.
- Error handling.

---

# 19. Accessibility Checklist

Before release:

## Structure

- Semantic HTML used.
- Heading hierarchy correct.
- Landmarks defined.

## Keyboard

- All actions possible.
- Focus visible.
- No keyboard traps.

## Forms

- Labels exist.
- Errors are clear.
- Required fields explained.

## Visual

- Contrast is sufficient.
- Color is not the only indicator.
- Text is readable.

## Components

- States are accessible.
- ARIA is correct.
- Screen readers understand behavior.

---

# 20. Accessibility Anti-Patterns

Avoid:

- Divs used instead of buttons.
- Missing labels.
- Removing focus outlines.
- Color-only communication.
- Auto-playing media.
- Tiny click targets.
- Unnecessary ARIA.
- Ignoring keyboard users.

---

# Accessibility Engineering Rule

Accessibility is not about supporting a smaller group of users.

It is about building software that works correctly for humans.

The goal:

- Clear interfaces.
- Inclusive experiences.
- Strong semantics.
- Reliable interactions.
- Better products.
