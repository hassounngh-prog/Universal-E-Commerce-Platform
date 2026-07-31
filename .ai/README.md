# .ai — AI Engineering Framework

## Overview

`.ai` is a structured AI engineering framework designed to help build, maintain, and evolve production-grade software systems.

It acts as the operational brain for AI-assisted development.

The goal is not only to generate code.

The goal is to create software that is:

- Scalable
- Maintainable
- Secure
- Performant
- Well documented
- Easy for teams to understand

---

# Purpose

The `.ai` framework provides:

- AI identity and behavior rules
- Engineering standards
- Architecture guidance
- Development workflows
- Project context
- Long-term memory
- Reusable engineering patterns

It allows AI agents to work as senior engineering partners instead of simple code generators.

---

# Framework Structure

```text
.ai

├── AGENT.md
│   AI behavior and global instructions
│
├── core/
│   Permanent engineering principles
│
├── reference/
│   Engineering knowledge and patterns
│
├── project/
│   Project-specific information
│
├── memory/
│   Current project state and history
│
├── prompts/
│   Reusable AI instructions
│
├── workflows/
│   Standard development processes
│
├── specs/
│   Feature specifications
│
└── reviews/
    Quality review documents
```

---

# Context Separation

The framework separates information into three levels.

## 1. Global AI Knowledge

Changes rarely.

Location:

```text
.ai/core/
.ai/reference/
```

Contains:

- Engineering philosophy
- Architecture rules
- Coding standards
- Security rules
- Development patterns

These files are reusable across projects.

---

## 2. Project Knowledge

Changes per project.

Location:

```text
.ai/project/
```

Contains:

```text
overview.md
stack.md
architecture.md
decisions.md
```

Used to describe:

- Product goals
- Technology choices
- Architecture
- Important decisions

---

## 3. Current Memory

Changes continuously.

Location:

```text
.ai/memory/
```

Contains:

- Current progress
- Current state
- Known issues
- Context

Updated during development.

---

# AI Loading Order

Before starting work, the AI should load context in this order:

```text
AGENT.md

↓

core/

↓

reference/

↓

project/

↓

memory/

↓

workflow
```

This ensures the AI understands:

- Its role
- Engineering standards
- Existing knowledge
- Project requirements
- Current situation

---

# Development Philosophy

Every task follows:

```text
Understand

↓

Architect

↓

Plan

↓

Implement

↓

Test

↓

Review

↓

Document

↓

Remember
```

Do not rush into implementation.

Good architecture prevents future complexity.

---

# Project Lifecycle

The recommended development lifecycle:

```text
Planning

↓

Architecture

↓

UI/UX

↓

Development

↓

Testing

↓

Deployment

↓

Monitoring

↓

Maintenance
```

---

# Using `.ai` With AI Agents

The AI agent working inside the repository is responsible for maintaining project context.

During development it should update:

```text
.ai/project/
```

when:

- Architecture changes
- Technology changes
- Major features are added
- Important decisions are made

It should update:

```text
.ai/memory/
```

after sessions with:

- Completed work
- Current progress
- Problems
- Next actions

---

# Reference Library

The reference folder contains reusable engineering knowledge.

Examples:

```text
reference/

frontend-patterns.md

backend-patterns.md

database-patterns.md

security-patterns.md

performance-patterns.md

testing-patterns.md

ui-design-system.md
```

Before creating solutions, check existing patterns.

Consistency is preferred over personal preference.

---

# Design Principles

The framework follows:

- Clean Architecture
- SOLID principles
- Feature-driven architecture
- Separation of concerns
- Mobile-first development
- Security by default
- Performance awareness
- User-centered design

---

# Documentation Rules

Documentation is part of engineering.

Maintain:

- Architecture documentation
- Decision records
- Feature specifications
- Progress tracking
- Changelog

Important decisions must never exist only in memory.

---

# Versioning

The framework version is tracked in:

```text
.ai/VERSION.md
```

Changes should be documented in:

```text
.ai/CHANGELOG.md
```

---

# Final Goal

`.ai` exists to create a development environment where AI and developers work together to build software that can survive years of growth.

The objective:

```text
Better Decisions

↓

Better Architecture

↓

Better Code

↓

Better Products
```
