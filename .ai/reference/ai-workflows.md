# AI Engineering Workflows Reference

## Purpose

This document contains AI-assisted software engineering workflow patterns that improve development quality, consistency, and decision-making.

The goal is not to make AI write code faster.

The goal is to make AI behave like a senior engineering partner.

---

# Core Philosophy

AI is powerful but naturally:

- Stateless between sessions
- Fast at generating solutions
- Capable of confidently making wrong assumptions

A professional workflow must force:

- Understanding before implementation
- Planning before coding
- Validation after implementation
- Memory preservation between sessions

---

# Engineering Loop

The recommended development cycle:

```
Understand
    ↓
Architect
    ↓
Plan
    ↓
Implement
    ↓
Review
    ↓
Improve
    ↓
Remember
```

Every feature should pass through this loop.

---

# Architecture Before Implementation

Before writing code:

1. Understand the requirement.
2. Analyze constraints.
3. Identify risks.
4. Define architecture.
5. Evaluate trade-offs.
6. Create implementation plan.

Avoid immediately generating code.

Good engineers solve the right problem before solving the technical problem.

---

# Session Memory Workflow

AI sessions should maintain continuity.

At the beginning:

```
Restore Context
        ↓
Understand Current State
        ↓
Continue Work
```

At the end:

```
Review Session
        ↓
Save Important Decisions
        ↓
Update Current State
```

Memory should contain:

- Completed work
- Important decisions
- Current state
- Remaining tasks
- Known problems

Never store:

- Secrets
- Credentials
- Sensitive information

---

# Review Workflow

A feature is not complete because it works.

Review:

## Plan Alignment

Check:

- Was the requested feature implemented?
- Were decisions respected?
- Was unnecessary scope added?

---

## Architecture Integrity

Check:

- Correct responsibilities
- Correct dependencies
- Consistent structure
- No technical debt introduced

---

## Production Readiness

Check:

- Error handling
- Edge cases
- Security
- Performance
- Accessibility
- User experience

---

# Recovery Workflow

When something goes wrong, diagnose first.

Possible situations:

## Targeted Problem

A specific bug exists.

Action:

- Find root cause
- Apply precise fix

---

## Polluted Session

Multiple fixes created more problems.

Action:

- Stop patching
- Save useful information
- Restart with clean context

---

## Wrong Foundation

The approach itself is incorrect.

Action:

- Reconsider architecture
- Redesign before coding

---

# UI Consistency Workflow

User interfaces should evolve as a system.

After creating important UI components:

Capture:

- Spacing patterns
- Typography
- Colors
- Component behavior
- Interaction states

Store these patterns in:

```
.ai/design/ui-registry.md
```

Future components should follow existing patterns.

---

# Decision Quality Rules

When choosing between solutions:

Prefer:

1. Simpler solution
2. Maintainable solution
3. Scalable solution
4. Consistent solution
5. Secure solution

Avoid choosing based only on:

- Speed of implementation
- New technology trends
- Personal preference

---

# Reference Principle

AI workflows exist to improve engineering judgment.

The objective is:

Better decisions → Better architecture → Better software
