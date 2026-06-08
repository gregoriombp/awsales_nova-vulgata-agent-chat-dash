---
description:
alwaysApply: true
---

# AwSales — agent conventions

> **Single source of truth: [`AGENTS.md`](./AGENTS.md). Read it before doing anything in this repo.**

Every rule lives in `AGENTS.md` (universal — Claude Code, Codex, Cursor, any agent):
the `Aw` prefix convention + shadcn-wrapper flow, the "tokens are sacred" rule, the
component-lookup order, the stack & scope gotchas (Tailwind **v4**, icons, desktop-only,
feature-modules out of DS scope), and the skills catalog + routing table.

**Do not add rules to this file.** It is intentionally a thin pointer so it can never drift
from `AGENTS.md`. If a convention needs to change, edit `AGENTS.md`. For product context
(what AwSales is, voice, vocabulary) see `AWSALES_CONTEXT.md`.
