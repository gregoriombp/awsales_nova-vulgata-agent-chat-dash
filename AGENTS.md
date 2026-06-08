# AGENTS.md

Conventions for any AI agent (Claude Code, Codex, Cursor, etc.) working in this repository. **This is the single source of truth — read it before starting.** It holds the complete rules; `CLAUDE.md` is a thin pointer back here (Claude Code auto-loads `CLAUDE.md` and lands on these same rules). **Keep every rule HERE — never add rules to `CLAUDE.md`**, so the two can never diverge.

> For product context (what AwSales is, voice, vocabulary) see `AWSALES_CONTEXT.md`. For styleguide page structure see `docs/`. The conventions, tokens, stack rules and skills below are authoritative.

## Hard rules

### 1. `Aw` prefix on every new design system component

Every design system component **must** start with `Aw`. No exceptions within the DS scope.

**Required pattern:**

| Item | Convention |
|---|---|
| File name | `Aw[Name].tsx` (PascalCase) |
| Export name | `export function Aw[Name](...)` or `export const Aw[Name] = ...` |
| Official destination | `/components/ui/Aw[Name].tsx` |
| Official showcase | `/app/bombardier/styleguide/components/aw-[name]/page.tsx` |
| Navigation entry | `navigation.ts` with descriptive `name` (e.g. `"Dropdown Menu"`) and `href: "/bombardier/styleguide/components/aw-[name]"` |

> **Showcase href convention:** Legacy components (built before this rule) live at
> `/bombardier/styleguide/components/[name]/` (e.g. `buttons/`, `cards/`). New components
> go to `/bombardier/styleguide/components/aw-[name]/`. **Never rename existing showcase
> folders** — doing so breaks live routes. The `name` field in `navigation.ts` uses
> descriptive labels (in PT-BR or EN), not the raw `Aw[Name]` identifier.

**Correct examples:**

```
components/ui/AwButton.tsx
components/ui/AwCard.tsx
components/ui/AwIntegrationCard.tsx
app/bombardier/styleguide/components/aw-dropdown-menu/page.tsx
```

**Wrong examples (do not do this):**

```
components/Button.tsx                    ← root is a legacy zone being migrated
components/ui/button.tsx                 ← this is the shadcn primitive, not the DS wrapper
components/ui/MyButton.tsx               ← no prefix
components/ui/aw-button.tsx              ← file must be PascalCase
```

**`Aw[Name]` wraps a shadcn primitive — going forward.** (Reality today: only ~1 of 58
`Aw*` actually wraps a lowercase primitive; ~11 use `@radix-ui/*` directly, the rest are
hand-rolled. Treat "wraps a primitive" as the target for NEW components and as on-touch
debt for existing ones — open any `Aw*` before assuming it's a thin wrapper.)

The flow for new components:

1. **Look up the shadcn primitive** via MCP (`search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`).
2. **Install** with `npx shadcn@latest add [name]`. The primitive lands in `components/ui/[name].tsx` (lowercase, CLI-generated).
3. **Create `components/ui/Aw[Name].tsx`** next to it, importing the primitive. Apply AwSales tokens, add brand variants (intents, sizes, ai-gradient, `Icon` slot, etc.).
4. Pages and features import **only `Aw[Name]`**, never the raw primitive directly.
5. Showcase at `app/bombardier/styleguide/components/aw-[name]/page.tsx` + entry in `navigation.ts`.

**Current repo state (known debt):**

shadcn is already initialized (`components.json` exists, `@radix-ui/*` packages are installed). Installed shadcn primitives live in `components/ui/[name].tsx` (lowercase). The existing `Aw*` components in `components/ui/` were built before the decision to adopt shadcn — they use Radix directly or are hand-rolled in Tailwind. **This is known debt.** When you touch one of them:

1. Install the corresponding shadcn primitive (`npx shadcn@latest add [name]`).
2. Refactor the `Aw[Name].tsx` to import and wrap the primitive.
3. Preserve the existing props API to avoid breaking pages that already use it.

New components from now on follow the correct flow from day one (primitive + wrapper).

**Legacy components at the `/components/` root:**

`components/Input.tsx`, `components/ComingSoon.tsx`, `components/OnboardingTour.tsx`, etc. are **pre-Bombardier**, hardcoded, unprefixed, and still being migrated. (The shell — DashboardLayout/Sidebar/Header/CopilotDrawer/NotificationsPopover/Breadcrumbs — has already moved to `components/ui/Aw*`.) When you need to evolve one of them:

1. Ensure the shadcn primitive is in `components/ui/[name].tsx`.
2. Create `components/ui/Aw[Name].tsx` as a wrapper, replicating the legacy behavior + current tokens + `Icon` slot.
3. Migrate imports in pages progressively.
4. When nothing imports the legacy file anymore, delete it from the root.
5. Create a showcase in the styleguide and register it in `navigation.ts`.

### 2. Tokens are sacred

- Only the `bombardier-design-system-foundation` skill creates tokens. Any other skill, prompt, or manual edit **must not** add new tokens to `globals.css` (the `@theme` block or `:root`).
- Forbidden: `bg-[#hex]`, `text-[#hex]`, `p-[Npx]`, `border-[#hex]`, `rounded-[Npx]`, or any Tailwind arbitrary value for color / spacing / radius / shadow / typography.
- Allowed: Tailwind classes that reference existing tokens (`bg-primary`, `text-fg-primary`, `border-border`, `rounded-lg`, `shadow-sm`, etc.) and CSS variables (`var(--bg-canvas)`, `var(--accent-brand)`).
- If a token genuinely does not exist and the work requires it, **report it in the output** instead of creating it — the foundation skill is the only one authorized to extend the token set.

### 3. Components before code

- Before writing a new component, check:
  1. `/components/ui/Aw*` (official)
  2. `/components/*` root (legacy — prefer migrating to `Aw*` instead of duplicating)
  3. `/components/ui/*.tsx` lowercase (shadcn primitives — check if an `Aw` wrapper exists)
- Reuse and extend > recreate.

### 4. Stack & scope gotchas

- **Tailwind v4.** This repo is Tailwind **v4** (`@import "tailwindcss"` + `@theme` in `app/globals.css`; there is **no `tailwind.config.ts`**). Tokens live in the `@theme` block + `:root` CSS vars in `globals.css`. Enter/exit animations come from `tw-animate-css` (not `tailwindcss-animate`); container queries are core (no plugin). Dark mode is `@custom-variant dark` + the `.dark` class. PostCSS uses `@tailwindcss/postcss` (no autoprefixer — Lightning CSS handles prefixing). The `.claude/` dir is excluded from content-scan via `@source not`.
- **Icons.** Material Symbols Rounded via `components/ui/Icon.tsx` is the product/DS default. `react-icons` is allowed **only** for brand marks Material Symbols lacks (Visa/Mastercard/Amex/Slack/WhatsApp). `lucide-react` only leaks in via CLI-generated shadcn primitives — don't reach for it in product code.
- **No emoji.** Do not add emoji to product UI, styleguide documentation, generated diagrams, or agent-facing docs unless the user explicitly asks for one or a source asset already contains it.
- **Feature modules are out of DS scope.** `components/{auth,memory-base}` (and similar app-feature folders) are NOT DS components — they *consume* `Aw*` but are not themselves prefixed/wrapped/showcased. Don't rename them to `Aw*` or migrate them.
- **Desktop-only.** The product has no mobile. Don't add mobile/tablet breakpoints or flag "missing responsiveness" — `components/DesktopOnlyBlocker.tsx` gates small screens by design.
- **Screen verification → Playwright MCP.** When you genuinely need to verify a rendered screen (visual check, "does this look right", regression after a UI change), drive the running app with the **Playwright MCP** (`playwright` server in `.mcp.json`): snapshot before acting, re-snapshot after the page changes, and screenshot to confirm the result. Only when a check is actually needed — not by default.

## Available skills in `.claude/skills/`

Each lives in `.claude/skills/<name>/SKILL.md` (except `bombardier-generate.md`, which is flat). Invoke via `/<name>`; some trigger by context. These skills are tracked in the private `origin` repo for local/cloud agents and stripped from the company `design2` mirror by `scripts/sync-design2.sh`. The `.agents/` cache remains local/gitignored.

**Design System**
| Skill | When to use |
|---|---|
| `bombardier-design-system-foundation` | Bootstrap the DS from a visual reference / design source. **The only skill that creates tokens.** |
| `bombardier-new-component` | Add a new component to the DS using existing tokens (shadcn wrapper + showcase + nav). Always `Aw*` in `components/ui/`. |
| `bombardier-new-page` | Build a full page from a screenshot/Figma/brief, reusing DS components. |
| `bombardier-design-system-audit` | Audit consistency (tokens/components/showcases/nav); optionally sync against a reference. |
| `shadcn` | Consult shadcn docs/registry/CLI for primitives. It is a support skill only: all repo rules above still win (`Aw*` wrapper, existing tokens, Material Symbols by default). |

**UX Flows** (`/bombardier/styleguide/ux-flows`)
| Skill | When to use |
|---|---|
| `bombardier-create-ux-flow` | Create a NEW flow from a description / step list. |
| `bombardier-update-ux-flow` | Register a structural update to an existing flow (+ changelog entry). |
| `bombardier-pg-create-flow` | Create a NEW flow from a `.awflow.json` (designer/PG export). |
| `bombardier-pg-merge-flow` | Merge a `.awflow.json` into a flow that already exists. |

**Content / UX Writing**
| Skill | When to use |
|---|---|
| `bombardier-ux-writing` | In-product UX-writing pass on a route / several routes / pasted links: reads the page's real strings, audits them against the AwSales **product** voice (resolve, não vende — inspired by ElevenLabs + OpenAI), proposes rewrites with rationale, applies **text-only** edits after approval. NOT marketing voice (that's the global `awsales-brand-voice`), NOT layout/structure (that's `ux-page-rework`). |

**Bridges (LAN collaboration)**
| Skill | When to use |
|---|---|
| `bombardier-review-bridge` / `bombardier-review-bridge-solve` | Start the Review Mode comment server / batch-resolve comments. |
| `bombardier-flow-bridge-solve` | Apply UX-flow suggestions (read from `flow-bridge/data/suggestions.json` via the same-origin `/api/flow-suggestions` route). |
| `bombardier-flow-bridge` | **Obsolete** — the flow editor is serverless now (no server to start); the skill just explains the cutover. |

The DS skills are **generic and Aw-prefix-blind** — they emit `components/CustomWidget.tsx`-style output (root zone, no prefix, showcase at `components/[name]/`). So you MUST apply this file's convention on top of their output: rename → `Aw[Name]`, move to `components/ui/`, showcase at `aw-[name]/`, import only `Aw*`.

**Routing — always use the local `bombardier-*` skill, NEVER the generic global homonym.** The session also exposes generic globals whose scope overlaps but which produce non-`Aw` output in the wrong place:

| Intent | Use this | Avoid |
|---|---|---|
| Add a component | `bombardier-new-component` | `design-system-new-component` |
| Build a page | `bombardier-new-page` | `design-system-new-page` |
| Bootstrap DS / tokens | `bombardier-design-system-foundation` | `setup-design-system-from-*` |
| Audit consistency | `bombardier-design-system-audit` | — |
| Revise in-product copy / microcopy | `bombardier-ux-writing` | `ux-copy` (generic, EN), `awsales-brand-voice` (marketing voice) |

## How the agent should combine skill + convention

When any skill suggests creating `MyComponent.tsx` in `components/`:

1. **Rename** to `AwMyComponent.tsx`
2. **Move** to `components/ui/`
3. **Update imports** across the codebase
4. **Create showcase** at `app/bombardier/styleguide/components/aw-my-component/page.tsx`
5. **Register** in `navigation.ts`

The skill produces the skeleton; this AGENTS.md adjusts naming and destination.

## Common questions

**"Can I create a component without the Aw prefix?"**
No. Every design system component is `Aw*` in `components/ui/`. (The old `components/playground/` AI-component quarantine was removed — there's no unprefixed staging area anymore.)

**"The component wraps a shadcn primitive — what's the file name?"**
The shadcn primitive lives at `components/ui/button.tsx` (generated by `npx shadcn add`). Your wrapper lives at `components/ui/AwButton.tsx` and imports the primitive. Pages import `AwButton`.

**"There's already a `Button.tsx` at the `components/` root. Do I update it or create `AwButton`?"**
Create `components/ui/AwButton.tsx` as a wrapper around the shadcn primitive `Button`. Replicate the legacy behavior + current tokens + icons via `Icon`. Migrate usages page by page. The legacy file dies when nothing imports it anymore.

**"A skill runs `npx shadcn@latest add button` — should I run it?"**
**Yes.** That's this repo's official path. The primitive goes to `components/ui/button.tsx` (lowercase). Then create/update `components/ui/AwButton.tsx` which imports that primitive and adds the brand layer (variants, sizes, intents, icon). Pages import only `AwButton`.

**"There's already an `AwButton.tsx` in the repo, but no shadcn primitive behind it. What do I do?"**
That's the current debt. When you need to touch that component, install the shadcn primitive (`npx shadcn add button`) and refactor `AwButton.tsx` to wrap it, preserving the same props contract so existing pages don't break.

## Imported Claude Cowork project instructions

Imported/consolidated from the local Cursor + Claude Coworking setup on 2026-06-02.

- Cursor project rules are represented by this `AGENTS.md` + thin `CLAUDE.md` pointer. Do not create a separate `.cursor/rules` source of truth.
- Product/voice/memory from `~/Skills/AwSales - Claude Coworking` is consolidated in `AWSALES_CONTEXT.md`. Read that file for AwSales positioning, vocabulary, modules, voice, and design workflow; do not duplicate the full Coworking knowledge base into code files.
- MCPs imported from Cursor: `Figma` remote MCP (`https://mcp.figma.com/mcp`) and `shadcn` (`npx shadcn@latest mcp`). The `playwright` MCP (`@playwright/mcp`) is also configured for on-demand screen verification (see Stack & scope gotchas). The project-level config lives in `.mcp.json`; OAuth tokens stay in the user's local app storage and must never be copied into this repo.
- The `shadcn` skill was copied into `.claude/skills/shadcn` so Claude Code and Cursor share the same component-registry guidance. The repo-specific `Aw*` and token rules in this file override generic shadcn guidance whenever they conflict.
- Cursor/Claude raw histories, workspaceStorage DBs, OAuth attempts, and extension state are not project instructions. Mine them for context when explicitly requested, but do not commit them or mirror them into design2.
