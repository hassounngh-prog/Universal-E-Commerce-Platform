# AI Reference Knowledge Base

## Purpose

The `.ai/reference` folder contains external engineering knowledge, methodologies, patterns, and practices that improve AI-assisted software development.

This folder exists to provide additional context beyond the project's core rules.

The AI should use these references to make better technical decisions while still respecting:

- `.ai/AGENT.md`
- `.ai/core/*`
- `.ai/project/*`

---

# How References Are Used

References are not strict rules.

They are supporting knowledge.

Decision priority:

```
1. Project requirements
        ↓
2. Project architecture decisions
        ↓
3. Core engineering principles
        ↓
4. Reference knowledge
        ↓
5. Personal preference
```

The project context always has priority.

---

# What Belongs Here

Good examples:

- Architecture patterns
- Industry best practices
- AI workflow methodologies
- Frontend engineering patterns
- Backend engineering patterns
- Security practices
- Performance optimization techniques
- UI/UX principles

---

# What Does Not Belong Here

Do not store:

- Project-specific decisions
- Temporary solutions
- Personal notes
- Secrets
- API keys
- Credentials
- Generated code

Project decisions belong in:

```
.ai/project/decisions.md
```

Current work state belongs in:

```
.ai/memory/
```

Engineering rules belong in:

```
.ai/core/
```

---

# Reference Format

Every reference document should contain:

```md
# Topic

## Source

Where this knowledge comes from.

## Principle

The main idea.

## When To Apply

Situations where this is useful.

## How We Apply It

How it affects our engineering workflow.

## Examples

Practical examples.
```

---

# Quality Rule

A reference should improve decision quality.

Do not add references because they are popular.

Add them because they help build:

- Better architecture
- Better code
- Better products
- Better developer experience

The goal is not more knowledge.

The goal is better engineering decisions.
