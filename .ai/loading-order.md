# AI Context Loading Order

## Purpose

This document defines the exact order in which OpenCode should load `.ai` context before starting any task.

The goal is to ensure the AI understands:

- Its role and responsibilities
- Engineering standards
- Project requirements
- Existing architecture
- Current development state
- Previous decisions
- Required workflow
- Relevant engineering patterns

The AI must never start implementation without loading the required context.

---

# Core Principle

The AI follows:

```
Restore Context

↓

Understand Rules

↓

Understand Project

↓

Restore Memory

↓

Select Workflow

↓

Execute Task

↓

Review Result

↓

Save Knowledge
```

The purpose is not to load everything blindly.

The purpose is to load the correct information at the correct time.

---

# Level 1 — AI Identity

## Always load first

```
.ai/AGENT.md
```

## Purpose

Defines:

- AI role
- AI behavior
- Engineering philosophy
- Communication rules
- Quality expectations
- Decision-making approach

`AGENT.md` is the highest priority instruction file.

---

# Level 2 — Core Engineering Rules

## Load:

```
.ai/core/
```

Files:

```
principles.md
architecture.md
coding-standards.md
security.md
decision-making.md
```

## Purpose

Defines permanent engineering standards.

Includes:

- Architecture rules
- Coding conventions
- Security requirements
- Engineering philosophy
- Decision frameworks

These rules apply to all projects.

---

# Level 3 — Engineering References

## Load when relevant:

```
.ai/reference/
```

Examples:

```
frontend-patterns.md
backend-patterns.md
database-patterns.md
security-patterns.md
performance-patterns.md
testing-patterns.md
ui-design-system.md
```

## Purpose

Provide reusable engineering knowledge.

References help the AI:

- Choose proven patterns
- Avoid reinventing solutions
- Maintain consistency

References support core rules but never override them.

---

# Level 4 — Project Understanding

## Load:

```
.ai/project/
```

Files:

```
overview.md
stack.md
architecture.md
decisions.md
```

## Purpose

Understand the current project.

The AI must know:

- Product purpose
- Users
- Technology stack
- Architecture
- Existing decisions
- Current constraints

Never introduce new architecture without checking project context.

---

# Level 5 — Memory Restoration

## Load:

```
.ai/memory/
```

Files:

```
context.md
current-state.md
progress.md
known-issues.md
```

## Purpose

Restore previous development knowledge.

The AI should understand:

- Completed work
- Current tasks
- Known problems
- Previous decisions
- Next actions

Avoid:

- Repeating solved problems
- Breaking previous decisions
- Losing project history

---

# Level 6 — Task Classification

Before execution, identify the task type.

---

## Feature Development

Load:

```
.ai/workflows/feature-development.md
```

---

## Bug Fixing

Load:

```
.ai/workflows/bug-fixing.md
```

---

## Code Review

Load:

```
.ai/workflows/code-review.md
```

---

## Refactoring

Load:

```
.ai/workflows/refactoring.md
```

---

# Level 7 — Task Specific Prompts

Load only required prompts.

Location:

```
.ai/prompts/
```

Available examples:

```
architecture-review.md
bug-fixing.md
code-review.md
documentation-update.md
feature-implementation.md
project-discovery.md
project-kickoff.md
project-planning.md
refactoring.md
release-preparation.md
session-end.md
task-execution.md
```

Do not load unrelated prompts.

Focused context produces better decisions.

---

# Before Writing Code

The AI must verify:

## Understanding

- Do I understand the requirement?
- Do I understand the business goal?
- Do I understand constraints?

## Architecture

- Where should this change exist?
- Does it respect boundaries?
- Does it scale?

## Existing System

- Does a solution already exist?
- Am I duplicating logic?
- Am I breaking conventions?

## Quality

Check:

- Security
- Performance
- Accessibility
- Testing
- Maintainability
- User experience

---

# Context Rules

Never:

- Start coding without context
- Ignore existing architecture
- Create unnecessary abstractions
- Duplicate existing solutions
- Store secrets
- Modify standards without reason

Always:

- Read before changing
- Analyze before designing
- Design before implementing
- Review before completing
- Document important decisions

---

# Session Lifecycle

Every session follows:

```
Restore Context

↓

Understand Task

↓

Architect Solution

↓

Plan

↓

Implement

↓

Review

↓

Update Memory
```

---

# Session End Requirements

After every session update:

```
.ai/memory/current-state.md

.ai/memory/progress.md

.ai/memory/known-issues.md
```

Update when required:

```
.ai/project/decisions.md
```

For major framework/project changes:

```
.ai/CHANGELOG.md
```

---

# Project Context Ownership

The AI working inside the repository is responsible for maintaining:

```
.ai/project/
```

and:

```
.ai/memory/
```

They are the source of truth for project knowledge.

---

# Final Rule

The AI must never behave like a stateless code generator.

It must behave like a senior engineer who:

- Understands the past
- Analyzes the present
- Plans the future
- Protects architecture
- Improves the system continuously
