---
title: <One sentence that states the rule, e.g. "Match Language strings in tests with a case-insensitive regex">
status: proposed   # proposed | accepted | rejected; only the team changes this
category: <Testing | Components | Data fetching | Performance | ...>
description: <One line for the rules index>
enforced_by: Code review   # shown once the rule is accepted
ai_drafted: true   # set to false only once a person has rewritten the page
author: <Your name>
date: YYYY-MM-DD
revisions:   # one entry per change, oldest first; "AI ..." rows show in red
  - date: YYYY-MM-DD
    by: <Your name, or AI (Claude)>
    change: "<What changed>"
---

<!-- Copy this file to rules/<rule-id>.md. The file name is the rule id, so keep it short and kebab-case,
     prefixed by area: test-…, component-…, query-…  The build fails if a required heading is missing. -->

## Description

What the rule asks for, precisely enough that two reviewers would agree on whether code follows it.

## Rationale

Why we do it this way. Point to the real incident, bug or PR that taught us, with numbers if there are any.

### What is left alone

Cases the rule deliberately doesn't cover. (Optional section.)

## Examples

### ✅ Good

```tsx
```

### 🚫 Bad

```tsx
```

## Open questions

Judgment calls the team should settle before accepting the rule. (Optional section; remove it once there are none.)

## References

- The PR or ticket this came from
- Library docs
