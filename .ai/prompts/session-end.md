# Session End Prompt

## Purpose

This prompt defines the mandatory workflow every AI agent must execute before ending any development session.

The objective is to ensure that no important context, decisions, or progress are lost between sessions.

Every session should leave the project cleaner, better documented, and easier to continue.

---

# AI Role

You are acting as the project's Technical Lead and Knowledge Steward.

Your responsibility is to ensure that the next developer or AI agent can immediately continue working without reconstructing context from previous conversations.

The project should always remain in a "ready to continue" state.

---

# Core Principles

Always:

- Preserve project knowledge.
- Synchronize documentation.
- Record completed work.
- Record unfinished work.
- Capture important decisions.
- Leave clear next steps.

Never finish a session with undocumented changes.

---

# Phase 1 — Review Session Work

Summarize:

- Features implemented
- Bugs fixed
- Refactors completed
- Documentation updated
- Decisions made

Separate completed work from planned work.

---

# Phase 2 — Verify Implementation

Confirm:

- Build passes
- Lint passes
- Type checking passes
- Tests pass
- No unfinished temporary code
- No debug code remains
- No accidental changes remain

Resolve obvious issues before ending the session.

---

# Phase 3 — Update Project Memory

Review and update when necessary:

```text
.ai/memory/current-state.md
.ai/memory/progress.md
.ai/memory/known-issues.md
.ai/memory/context.md
```

Choose the appropriate file for each type of information.

---

# Phase 4 — Update Documentation

Review whether changes require updates to:

- README
- Architecture
- ADRs
- Feature specifications
- API documentation
- Deployment documentation
- Release notes

Documentation should reflect reality.

---

# Phase 5 — Record Decisions

If important architectural or technical decisions were made:

- Update `decisions.md`
- Create or update ADRs
- Record reasoning
- Document trade-offs

Future developers should understand _why_ decisions were made.

---

# Phase 6 — Review Technical Debt

Identify:

- Deferred improvements
- Temporary workarounds
- Code smells
- Performance opportunities
- Architectural improvements

Classify each by priority.

---

# Phase 7 — Prepare Next Session

Create a clear handoff including:

## Completed

Everything finished.

## In Progress

Current work.

## Blockers

Anything preventing progress.

## Next Recommended Task

The highest-priority next step.

---

# Phase 8 — Risk Review

Document any remaining:

- Technical risks
- Security risks
- Performance concerns
- Known limitations
- Outstanding bugs

Update `known-issues.md` if needed.

---

# Phase 9 — Repository Health

Verify:

- Folder structure remains clean
- No duplicate implementations
- Naming remains consistent
- Dependencies remain intentional
- No obsolete files remain

Maintain long-term project quality.

---

# Session Report

Before ending the session produce:

## 1. Summary

What was accomplished.

---

## 2. Files Modified

List important files.

---

## 3. Documentation Updated

List updated documents.

---

## 4. Decisions Made

List architectural or technical decisions.

---

## 5. Remaining Work

List unfinished work.

---

## 6. Risks

Describe any unresolved concerns.

---

## 7. Recommended Next Task

Suggest the highest-value next activity.

---

# End-of-Session Checklist

Before ending the session:

- [ ] Work reviewed
- [ ] Tests verified
- [ ] Documentation updated
- [ ] Memory updated
- [ ] Decisions recorded
- [ ] Technical debt reviewed
- [ ] Risks documented
- [ ] Next steps prepared
- [ ] Repository remains clean

A session is complete only when another engineer can continue immediately without asking for missing context.

---

# Guiding Principle

Every session should end with the project in a better state than it began.

Code, documentation, architecture, and project memory should remain synchronized so that continuity is never dependent on conversation history.
