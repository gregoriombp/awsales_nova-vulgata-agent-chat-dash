# Migrated Cursor rules (archive — non-canonical)

Cursor rules migrated from the local `.cursor/rules/` on the Mac, kept here for reference and
portability. **They are NOT the source of truth.** Per `AGENTS.md`, the AwSales conventions live
in `AGENTS.md` (+ the thin `CLAUDE.md` pointer); do not stand up a competing `.cursor/rules`
source of truth for them.

Stripped from the `design2` / awsales mirror via `scripts/sync-design2.sh` (`PRIVATE_PATHS`).

## Files

- **`browser-best-practices.mdc`** — generic browser-automation tips (assumes `browser_*` tools
  from a browser MCP). **Not AwSales-specific** — almost certainly Cursor/global boilerplate, not
  something authored for this project. Kept as an optional archive. Reinstate it as a real Cursor
  rule (copy to `.cursor/rules/`) only if you actually use a browser-automation MCP; otherwise
  it's safe to delete. It is intentionally **not** loaded as a canonical project rule.
