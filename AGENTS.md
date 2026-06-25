# AGENTS.md

Conventions for any AI Agent (Claude Code, Codex, Cursor, etc.) working in this repository. **This is the single source of truth — read it before starting.** It holds the complete rules; `CLAUDE.md` is a thin pointer back here (Claude Code auto-loads `CLAUDE.md` and lands on these same rules). **Keep every rule HERE — never add rules to `CLAUDE.md`**, so the two can never diverge.

> For product context (what AwSales is, voice, vocabulary) see `AWSALES_CONTEXT.md`. For styleguide page structure see `docs/`. The conventions, tokens, stack rules and skills below are authoritative.
>
> **Before building anything, open [`docs/component-map.md`](docs/component-map.md)** — the index of "I need X → use Y → import path → when not to". It is the fastest way to find the right `Aw*` component and avoid recreating one that already exists.
>
> Continuing the design-system cleanup? Read [`docs/ds-cleanup-plan.md`](docs/ds-cleanup-plan.md) (what's done, what's left, how to resume) and run `npm run ds:check` for the live debt count.

## Context hygiene for agents

- Treat this file as the highest-priority repo instruction. `CLAUDE.md` only
  redirects here.
- External memories (`~/.claude/.../memory/MEMORY.md`, Cursor memories, chat
  summaries) are advisory only. If they conflict with this repo, this file wins.
- Use current repo docs over external memories. Current local development is
  loopback-only, and the active Bombardier surfaces are listed in `BOMBARDIER.md`.
- Do not scan ignored/generated folders for product context: `.next/`,
  `.agents/`, `.claude/worktrees/`, `node_modules/`,
  `review-bridge/data/`, and `flow-bridge/data/`.
- Keep new instructions short and canonical. Prefer updating this file or
  `AWSALES_CONTEXT.md` over creating new memory/docs files.

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

> **Styleguide family hubs:** when a component family has more than one concrete
> implementation or variant page (for example `Tabelas` → `AwTable`, `Data table`,
> `Members table`; `Modais e dialogs` → `AwModal`, `Connect modal`, `Welcome modal`),
> keep one parent entry in the sidebar and list the concrete items as
> `children` in `navigation.ts`. The parent page must show all concrete items
> inline before long API guidance. Put "quando usar / quando não usar" guidance
> near the end as a table, not as top-of-page cards. Do not create duplicate
> top-level sidebar entries for family members.

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

**`Aw[Name]` wraps a shadcn primitive — going forward.** (Reality today: of the ~91
`Aw*`, only ~10 actually wrap a lowercase primitive; ~11 use `@radix-ui/*` directly, the rest are
hand-rolled. Counts drift on every component addition — `navigation.ts` is the live inventory.
Treat "wraps a primitive" as the target for NEW components and as on-touch
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

- Token authority: only `bombardier-design-system-foundation` (bootstrap from a reference) and `bombardier-foundation-update` (incremental, additive, reviewed) may create or change tokens. Any other skill, prompt, or manual edit **must not** add new tokens to `globals.css` (the `@theme` block or `:root`).
- Forbidden: `bg-[#hex]`, `text-[#hex]`, `p-[Npx]`, `border-[#hex]`, `rounded-[Npx]`, or any Tailwind arbitrary value for color / spacing / radius / shadow / typography.
- Allowed: Tailwind classes that reference existing tokens (`bg-primary`, `text-fg-primary`, `border-border`, `rounded-lg`, `shadow-sm`, etc.) and CSS variables (`var(--bg-canvas)`, `var(--accent-brand)`).
- If a token genuinely does not exist and the work requires it, **report it in the output** instead of creating it — the foundation skill is the only one authorized to extend the token set.

### 3. Components before code — compose, don't recreate

- **Step 0: open [`docs/component-map.md`](docs/component-map.md)** — the "I need X →
  use Y → import" index. It names the canonical component and the near-duplicates to
  avoid (which card, which table, the Fluid caveat). This is the single biggest lever
  against agents rebuilding what already exists.
- Then check, in order:
  1. `/components/ui/Aw*` (official)
  2. `/components/*` root (legacy — prefer migrating to `Aw*` instead of duplicating)
  3. `/components/ui/*.tsx` lowercase (shadcn primitives — check if an `Aw` wrapper exists)
- **Reuse > extend > create.** Extend or wrap an existing component when it's close;
  build from scratch *only* when nothing fits and the semantics are genuinely new.
  Never duplicate an existing component under a new name.
- **Compose from primitives (the recipe rule).** A bigger piece is a *recipe* of `Aw*`
  primitives: a card / modal / page uses `AwButton` + `Icon` + `AwInput` — it does
  **not** re-implement a button, icon, or input inline, and never drops a raw `<svg>`
  or hardcoded glyph where `Icon` belongs. Dependency direction is one-way (see
  `docs/component-layers.md`): higher layers consume lower ones, never the reverse.

### 4. Stack & scope gotchas

- **Tailwind v4.** This repo is Tailwind **v4** (`@import "tailwindcss"` + `@theme` in `app/globals.css`; there is **no `tailwind.config.ts`**). Tokens live in the `@theme` block + `:root` CSS vars in `globals.css`. Enter/exit animations come from `tw-animate-css` (not `tailwindcss-animate`); container queries are core (no plugin). Dark mode is `@custom-variant dark` + the `.dark` class. PostCSS uses `@tailwindcss/postcss` (no autoprefixer — Lightning CSS handles prefixing). The `.claude/` dir is excluded from content-scan via `@source not`.
- **Icons.** Material Symbols Rounded via `components/ui/Icon.tsx` is the product/DS default. `Icon` uses optical defaults: visual `size` stays on the 12/16/20/24/28/32 scale, `opsz` clamps to 20..48, and small glyphs get firmer automatic `weight`/`grade` so they stay legible. Pass explicit `weight`, `grade`, `opticalSize` or `fill` only for a deliberate semantic/visual reason; `fill={1}` means active/selected, not "make it visible". `react-icons` is allowed **only** for brand marks Material Symbols lacks (Visa/Mastercard/Amex/Slack/WhatsApp). `lucide-react` only leaks in via CLI-generated shadcn primitives — don't reach for it in product code. **Never hand-roll a raw `<svg>` or hardcode a glyph for an icon — go through `Icon`** (raw `<svg>` is reserved for brand illustrations / agent visuals like `AwBrandIllustration`, `AwAgentCore`).
- **Brand / integration logos** (Google, Chrome, Microsoft, Pipedrive — any 3rd-party app) are **not** `Icon`/Material Symbols and **not** `react-icons`. They live in the `AwBrandLogo` registry (`components/ui/AwBrandLogo.tsx`), which feeds `AwIntegrationCard`, source pickers and settings. To add one: curate the official mark from the **Iconify `logos`** collection — `curl https://api.iconify.design/logos/<name>.svg` (pick the **square / icon-only** variant, not the wordmark) — save it to `/public/assets/integrations/iconify/<name>.svg`, and register a `{ bg, bordered, markSrc }` entry in `BRANDS`. White tile + `bordered` is the default for colorful marks. **Curate one mark at a time — never add `@iconify/react` / `@iconify-json/*` and never bundle the whole library at runtime.** Hand-drawn marks and full-bleed brand tiles keep the existing `mark` / `iconSrc` lanes. When Iconify only ships a wordmark (e.g. `logos:pipedrive`, `logos:hubspot`), keep/refine the existing inline `mark` instead of forcing a wide logo into a square tile.
- **Motion is on by default — don't hand-roll it per element.** Interactive elements (`a, button, input, select, textarea, summary, label, [role=button|tab|menuitem|option|switch|checkbox|radio]`) get a smooth paint transition for free via a `@layer base` rule in `globals.css` (color/background/border/shadow/outline/decoration/fill/stroke at `--dur-fast`/`--ease-out`, with a `prefers-reduced-motion` guard). So a plain hover never needs `transition-colors` added by hand. Because it's in `@layer base`, component classes (`.aw-btn`, `.aw-card`…) and Tailwind `transition-*`/`duration-*` utilities both still override it — reach for those (or `var(--dur-*)`/`var(--ease-*)`) only for a *custom* motion (transform, opacity, a different curve/duration). Never blanket-animate `transform`/`opacity` globally — they're reserved for enter animations.
- **Overlays / suspended UI = always the `Aw*` primitive, never hand-rolled.** Modal/dialog → `AwModal`; drawer / painel lateral → `AwSheet`; dropdown → `AwDropdownMenu`; menção → `AwMentionMenu`; toast → `AwToast`; accordion / disclosure → `AwAccordion`; popover/tooltip → the sanctioned `popover`/`tooltip` primitives. These carry **both enter AND exit** motion for free via Radix `data-state` + the motion tokens (`--dur-*`/`--ease-*`), with a `prefers-reduced-motion` guard. **Never hand-roll an overlay** (`fixed inset-0` + `{open && …}` or `if (!open) return null`): a raw conditional mount **unmounts instantly**, which kills the close transition — that's exactly why hand-made modals "open but don't close smoothly". For a **sequential modal** (wizard), pass `AwModal`'s `stepKey` prop (the body re-animates per step) instead of swapping content silently. `BaseModal` (`components/modals/BaseModal.tsx`) is **deprecated** → use `AwModal`. `ds:check` flags hand-rolled overlays and `BaseModal` imports.
- **Fluid kit is a contained motion layer (preview).** `components/ui/fluid/*` ports spring-physics interactions (framer-motion) mapped to AwSales tokens. The `fluid/*` *primitives* (`switch`, `slider`, `checkbox-group`, `dialog`, `dropdown`, `accordion`, `badge`, `tooltip`) **duplicate** the `Aw*` ones and are preview — **don't import them directly; use the `Aw*` equivalent.** Its sanctioned, promoted surface is the three components built on it: `AwInputMessage`, `AwThinkingSteps`, `AwAskUserQuestions`. Folding the motors into the `Aw*` primitives ("leva 2") is future work. See `docs/component-map.md` → Motion.
- **No emoji.** Do not add emoji to product UI, styleguide documentation, generated diagrams, or agent-facing docs unless the user explicitly asks for one or a source asset already contains it.
- **Feature modules are out of DS scope.** `components/{auth,memory-base}` (and similar app-feature folders) are NOT DS components — they *consume* `Aw*` but are not themselves prefixed/wrapped/showcased. Don't rename them to `Aw*` or migrate them.
- **Desktop-only.** The product has no mobile. Don't add mobile/tablet breakpoints or flag "missing responsiveness" — `components/DesktopOnlyBlocker.tsx` gates small screens by design.
- **Screen verification → Playwright MCP.** When you genuinely need to verify a rendered screen (visual check, "does this look right", regression after a UI change), drive the running app with the **Playwright MCP** (`playwright` server in `.mcp.json`): snapshot before acting, re-snapshot after the page changes, and screenshot to confirm the result. Only when a check is actually needed — not by default.

## Available skills in `.claude/skills/`

Each active skill lives in `.claude/skills/<name>/SKILL.md`. The flat
`bombardier-generate.md` file is a compatibility stub, not an active workflow.
Invoke active skills via `/<name>`; some trigger by context. These skills
are tracked in the private `origin` repo for local/cloud agents and stripped
from the company `design2` mirror by `scripts/sync-design2.sh`. The `.agents/`
cache remains local/gitignored.

**Design System**
| Skill | When to use |
|---|---|
| `bombardier-design-system-foundation` | Bootstrap the DS from a visual reference / design source (may rewrite `globals.css`). One of two skills allowed to touch tokens. |
| `bombardier-foundation-update` | **Incremental, additive token updates** to the existing foundation (add/extend a scale, fill ramp gaps). No rebootstrap, no clobber; keeps `@theme`+`:root`+dark in sync. The other token-authorized skill. |
| `bombardier-new-component` | Add a new component to the DS using existing tokens (shadcn wrapper + showcase + nav). Always `Aw*` in `components/ui/`. |
| `bombardier-new-page` | Build a full page from a screenshot/Figma/brief, reusing DS components. |
| `bombardier-design-system-audit` | Audit consistency (tokens/components/showcases/nav); optionally sync against a reference. |
| `shadcn` | Consult shadcn docs/registry/CLI for primitives. It is a support skill only: all repo rules above still win (`Aw*` wrapper, existing tokens, Material Symbols by default). |

**UX Flows** (`/bombardier/styleguide/ux-flows`)
| Skill | When to use |
|---|---|
| `bombardier-create-ux-flow` | Create a NEW single-journey flow from a description / step list. |
| `bombardier-create-ux-flow-golden-eye` | Create a COMPILED, multi-scenario "golden eye" view — several journeys merged into one deduped graph with per-scenario focus lenses (raw ReactFlow, à la `poc-visao-global`). Use when the value is overlaying scenarios + toggling between them, not one linear path. |
| `bombardier-update-ux-flow` | Register a structural update to an existing flow (+ changelog entry). |
| `bombardier-pg-create-flow` | Create a NEW flow from a `.awflow.json` (designer/PG export). |
| `bombardier-pg-merge-flow` | Merge a `.awflow.json` into a flow that already exists. |

**Content / UX Writing**
| Skill | When to use |
|---|---|
| `bombardier-ux-writing` | In-product UX-writing pass on a route / several routes / pasted links: reads the page's real strings, audits them against the AwSales **product** voice (resolve, não vende — inspired by ElevenLabs + OpenAI), proposes rewrites with rationale, applies **text-only** edits after approval. NOT marketing voice (that's the global `awsales-brand-voice`), NOT layout/structure (that's `ux-page-rework`). |

**Bridges locais**
| Skill | When to use |
|---|---|
| `bombardier-review-bridge-solve` | Batch-resolve comments from the local Review Bridge queue. `npm run dev` already starts/prepares the bridge; do not use a skill just to turn it on. |
| `bombardier-review-bridge-dispatch` | **The `/loop` motor** — turns `@agent /skill #now` mentions into live action. One pass reads `/api/review-bridge/dispatch-queue` (gated by the per-agent toggles in the Bombardier dot + the `#now` double-lock) and routes each item: Live Response → reply; Auto Construct + `#now` → run the skill, mark `in_review`, reply a summary. Run under `/loop`. The runtime side of the agent-mentions feature. |
| `bombardier-review-bridge-germano-audit` | **Germano Faccio** — critical second-opinion auditor on the `in_review` queue (what `solve` sent for review). Compares pedido vs. delivery and posts ONE reply per item ("pode seguir" / "ainda não — pede melhoria" + correction prompt). Comment-only: never transitions status, never edits code. Greg still approves/rejects in the inbox. |
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

**Setup-only / neutralized skills (kept as a record, do NOT trigger).** Four generic
Aw-blind skills survive on disk from the Bombardier initial setup, but their
`description` is neutralized so they no longer trigger: `setup-design-system-from-cla-design`
and `setup-design-system-from-reference` (one-time DS bootstrap — this repo is already
set up, don't re-bootstrap) and `design-system-new-component` / `design-system-new-page`
(superseded by the `bombardier-*` equivalents above). Always use the `bombardier-*`
skills for day-to-day work; these four are history, not active workflows.

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
No. Every design system component is `Aw*` in `components/ui/`. There is no
unprefixed staging area for design system components.

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
- MCP servers (all in `.mcp.json`): `figma` remote MCP (`https://mcp.figma.com/mcp`), `shadcn` (`npx shadcn@latest mcp`), `playwright` (`@playwright/mcp`, on-demand screen verification — see Stack & scope gotchas), and `mobbin` remote MCP (`https://mcp.mobbin.com/mcp`, UI-pattern reference). OAuth tokens stay in the user's local app storage and must never be copied into this repo.
- The `shadcn` skill was copied into `.claude/skills/shadcn` so Claude Code and Cursor share the same component-registry guidance. The repo-specific `Aw*` and token rules in this file override generic shadcn guidance whenever they conflict.
- Cursor/Claude raw histories, workspaceStorage DBs, OAuth attempts, and extension state are not project instructions. Mine them for context when explicitly requested, but do not commit them or mirror them into design2.
