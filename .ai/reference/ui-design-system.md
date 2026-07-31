# UI Design System Reference

## Purpose

This document defines the principles and patterns for building a consistent, scalable, and premium user interface system.

A design system is not only a collection of colors and components.

It is a shared language that ensures every interface:

- Looks consistent
- Feels intentional
- Is easy to use
- Scales across products
- Can be maintained by multiple developers

The goal is to prevent UI inconsistency and design drift.

---

# 1. Design System Philosophy

Every UI decision should optimize for:

- Clarity
- Consistency
- Accessibility
- Usability
- Performance
- Brand identity

Avoid creating interfaces where every component has its own style.

The system should feel like it was designed by one experienced team.

---

# 2. Design Tokens

All visual decisions should use design tokens.

Tokens include:

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Motion
- Breakpoints

Avoid:

```css
color: #3b82f6;
```

directly inside components.

Prefer:

```css
color: var(--color-primary);
```

or framework equivalent.

Benefits:

- Easier rebranding
- Better consistency
- Faster maintenance

---

# 3. Color System

Colors should have clear roles.

Recommended categories:

## Brand Colors

Used for:

- Primary actions
- Brand identity
- Important highlights

---

## Neutral Colors

Used for:

- Backgrounds
- Text
- Borders
- Containers

---

## Semantic Colors

Used for communication:

Success:

- Completed actions
- Positive states

Warning:

- Attention required

Error:

- Failed actions

Information:

- Helpful messages

---

Never use colors only because they look good.

Every color should have a purpose.

---

# 4. Typography System

Typography creates hierarchy.

Define:

- Font family
- Font sizes
- Font weights
- Line heights
- Letter spacing

Example hierarchy:

```text
Heading 1

↓

Heading 2

↓

Heading 3

↓

Body

↓

Caption
```

Avoid random font sizes.

---

# 5. Spacing System

Use consistent spacing values.

Example:

```text
4px
8px
12px
16px
24px
32px
48px
64px
```

Avoid:

```text
margin: 13px
padding: 27px
gap: 19px
```

unless there is a strong design reason.

Consistency creates visual quality.

---

# 6. Layout System

Layouts should follow predictable rules.

Consider:

- Containers
- Grid systems
- Responsive behavior
- Content width

Example:

```text
Page

↓

Container

↓

Section

↓

Component
```

Avoid every page inventing its own layout.

---

# 7. Component Library Principles

Components should be:

- Reusable
- Predictable
- Accessible
- Customizable
- Documented

Common components:

```text
Button
Input
Card
Modal
Dropdown
Table
Toast
Navigation
```

Before creating a new component:

Ask:

1. Does it already exist?
2. Can an existing component be extended?
3. Is this pattern repeated?

---

# 8. Button System

Buttons should have consistent:

- Size
- Radius
- Typography
- States
- Icons
- Spacing

Common variants:

## Primary

Main action.

Example:

```text
Save
Create Account
Checkout
```

---

## Secondary

Alternative action.

---

## Destructive

Dangerous actions.

Example:

```text
Delete Account
Remove Item
```

---

Every button requires:

- Default state
- Hover state
- Active state
- Disabled state
- Loading state
- Focus state

---

# 9. Form Design Pattern

Forms should prioritize:

- Clarity
- Error prevention
- Feedback

Every field should support:

- Label
- Description
- Input
- Error message
- Success state

Avoid:

- Unclear placeholders as labels
- Hidden validation errors
- Generic error messages

---

# 10. Card Design Pattern

Cards should have consistent:

- Background
- Border
- Radius
- Shadow
- Padding

A card should communicate:

"This content belongs together."

Avoid excessive card usage.

Not every section needs a container.

---

# 11. Navigation Patterns

Navigation should adapt to device.

Desktop:

```text
Logo

Navigation

Actions
```

Mobile:

```text
Logo

Menu Button
```

Consider:

- Current location
- Clear labels
- Accessibility
- Touch targets

---

# 12. Icon System

Use consistent icon libraries.

Priority:

1. Untitled UI Icons
2. Lucide
3. Heroicons

Rules:

- Same icon style across application
- Consistent sizes
- Meaningful usage

Avoid mixing:

- Different visual styles
- Random SVG icons
- Decorative icons without purpose

---

# 13. Responsive Design Rules

Mobile-first approach.

Design order:

```text
Mobile

↓

Tablet

↓

Desktop

↓

Large Screens
```

Consider:

- Touch areas
- Content priority
- Navigation changes
- Layout transformation

Minimum touch target:

Approximately:

```text
44px × 44px
```

---

# 14. Accessibility Standards

Every component should support:

- Keyboard navigation
- Screen readers
- Focus indicators
- Proper contrast
- Semantic structure

Examples:

Use:

```html
<button></button>
```

instead of:

```html
<div onclick=""></div>
```

Accessibility is part of design quality.

---

# 15. Motion and Animation

Animations should improve understanding.

Use motion for:

- Feedback
- State changes
- Transitions
- Guidance

Avoid:

- Excessive animations
- Slow interactions
- Decorative movement without purpose

Animations should feel:

- Fast
- Natural
- Consistent

---

# 16. Empty States

Empty states should explain:

- What happened
- Why it matters
- What user can do next

Example:

Bad:

```text
No data
```

Better:

```text
No projects yet.
Create your first project to get started.
```

---

# 17. Loading States

Avoid blank screens.

Use:

- Skeleton loaders
- Progress indicators
- Disabled actions

Users should understand the system is working.

---

# 18. Error States

Errors should:

- Explain the problem
- Suggest recovery
- Avoid technical details

Example:

Bad:

```text
500 database exception
```

Better:

```text
Something went wrong.
Please try again.
```

---

# 19. UI Consistency Workflow

After creating a UI component:

Run:

```text
/imprint
```

Capture:

- Colors
- Spacing
- Typography
- Borders
- States
- Patterns

Update:

```text
ui-registry.md
```

The registry becomes the source of truth.

---

# 20. UI Review Checklist

Before shipping:

## Visual

- Is spacing consistent?
- Are colors from tokens?
- Are components aligned?

## UX

- Is interaction obvious?
- Are states handled?

## Responsive

- Mobile works?
- Desktop works?

## Accessibility

- Keyboard support?
- Proper labels?
- Focus states?

## Consistency

- Matches existing patterns?
- Uses design system components?

---

# Design System Rule

A premium interface is not created by adding more styles.

It is created by:

- Clear rules
- Consistent patterns
- Thoughtful interactions
- Strong accessibility
- Continuous refinement

Design systems create products that can grow without losing quality.
