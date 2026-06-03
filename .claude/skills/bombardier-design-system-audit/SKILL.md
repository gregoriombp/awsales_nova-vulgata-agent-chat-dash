---
name: bombardier-design-system-audit
description: >
  Audits an existing Bombardier design system for internal consistency
  (foundation tokens, components, showcases, navigation, pages, playground)
  and optionally syncs it against an updated reference (screenshot, Figma URL,
  design source). Reports unused tokens, missing tokens, hardcoded values,
  components without showcases, broken nav links, orphaned entries, pages
  using stale imports, inline components that belong in the design system,
  and Playground promotion candidates. Classifies any reference-driven token
  changes as safe / needs review / breaking, and applies safe ones without
  destroying local customizations. Use when the user asks to "audit
  styleguide", "check coverage", "find missing components", "find token
  violations", "what's not in the styleguide", "components not registered",
  "compare repo to design system", "styleguide gaps", "verify design system
  consistency", or hands over an updated reference and asks the design system
  to be re-synced.
---

# Bombardier — Prompt 4: Design System Audit & Sync

> **Repo override (AwSales): there is no "Playground"/quarantine area.** Skip any audit step below about scanning a `playground/` folder, counting "Playground items", or listing "Playground promotion candidates" — that area was removed from this repo. Source of truth: `AGENTS.md`.

Verify that the entire design system is consistent, linked, and working
correctly. Run after the foundation, component, or page skills — or any time
you want to validate that foundations, components, pages, and navigation are
all in sync.

## Input

```txt
Target project: [project path or current repository]
Updated reference: [optional — new screenshot, Figma URL, design source, or "none"]
Focus area: [tokens | components | pages | navigation | all]
```

> When an updated reference is provided, compare it against the current design
> system to identify what changed. When no reference is provided, audit the
> existing system for internal consistency.

## Goal

Audit the design system and fix any inconsistencies:

- Foundation tokens are complete and used correctly
- All components use only existing tokens (no hardcoded values)
- All component showcases exist and are accurate
- Navigation links are valid and complete
- Playground items are properly separated from official components
- Pages use existing components and tokens correctly
- No orphaned or broken references

## Workflow

### 1. Audit foundation tokens

Read `/app/globals.css` and all foundation pages under
`/app/bombardier/styleguide/foundation/`.

Verify:

- Every CSS variable in `globals.css` has a corresponding entry in the
  foundation pages
- Every foundation page accurately reflects the current token values
- Dark mode variables are in sync with light mode (if dark mode exists)
- `@theme inline` block (Tailwind v4) or `tailwind.config.*` (v3) maps every
  token correctly
- No orphaned tokens (defined but never used)
- No missing tokens (used in components but not defined)

Report any gaps.

### 2. Audit components

Scan all component files in `/components/` and `/components/ui/`.

For each component, verify:

- Uses only existing project CSS variables via Tailwind classes (`bg-primary`,
  `text-muted-foreground`, etc.)
- No hardcoded hex colors (`#7c3aed`), pixel values as arbitrary Tailwind
  (`p-[13px]`), or inline styles with literal values
- Has a corresponding showcase page in
  `/app/bombardier/styleguide/components/[name]/` or
  `/app/bombardier/styleguide/playground/components/[name]/`
- Showcase page demonstrates all variants, sizes, and states
- Props table is accurate and up to date
- TypeScript types are correct
- `className` prop support with `cn()` merge
- Accessibility attributes are present (ARIA, keyboard interaction)

Use shadcn MCP to cross-reference:

- `search_items_in_registries` to verify shadcn components are up to date
- `view_items_in_registries` to check if installed versions match the registry

### 3. Audit styleguide navigation

Read `/app/bombardier/styleguide/navigation.ts`.

Verify:

- Every component showcase page has a corresponding navigation entry
- Every navigation entry points to an existing page (no broken links)
- Foundation section links match existing foundation pages
- Components section is alphabetically ordered (or follows project convention)
- Playground section contains only experimental / unreviewed items
- No duplicates

Fix any missing or broken entries.

### 4. Audit pages

Scan all pages under `/app/` (excluding `/app/bombardier/`).

For each page, verify:

- Uses only existing components from `/components/` or `/components/ui/`
- Uses only existing project tokens (no hardcoded values)
- Imports are correct and resolved
- Layout is stable and desktop-only (no mobile/tablet breakpoints)
- Metadata is present when the framework supports it
- No inline components that should be extracted to Playground

### 5. Audit Playground

Scan `/app/bombardier/styleguide/playground/`.

Verify:

- Playground components use existing tokens (experimental doesn't mean exempt
  from tokens)
- Playground items are registered in the Playground section of navigation
- No Playground items are imported by production pages without being promoted
  first
- Playground showcases have basic documentation (at minimum: usage example,
  props)

### 6. Cross-reference check

Run a full cross-reference:

```txt
Tokens → Components:
- Every token used by at least one component? (flag unused tokens)
- Every component uses only defined tokens? (flag violations)

Components → Showcases:
- Every component has a showcase? (flag missing)
- Every showcase imports the correct component? (flag stale)

Showcases → Navigation:
- Every showcase has a nav entry? (flag missing)
- Every nav entry points to an existing showcase? (flag broken)

Components → Pages:
- Pages import from components/, not from showcase pages? (flag bad imports)
- Pages don't define inline components that belong in the design system? (flag candidates)
```

### 7. Apply updated reference (if provided)

When an updated reference (screenshot, Figma URL, design source) is provided:

#### For token changes

- Compare extracted / parsed values against current `globals.css`
- Classify each change:
  - **Safe:** adding new tokens, adjusting shades within the same hue
  - **Needs review:** changing primary color, typography scale, radius scale
  - **Breaking:** removing tokens still in use, renaming without aliases

#### For component changes

- Compare against current component implementations
- Add new variants or states from the reference
- Update showcase pages to reflect changes
- Put newly generated or uncertain components in Playground

#### For structural changes

- Update foundation documentation pages
- Update component inventory
- Update navigation

**Rules for applying updates**

- Preserve local customizations unless the reference clearly supersedes them
- Add aliases for renamed tokens when possible (don't delete the old name
  immediately)
- Verify usage before removing anything (`grep` for token / component
  references)
- Keep dark mode in sync if supported
- Document any skipped changes and why

### 8. Validate

Run available project checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If visual verification is useful, start the dev server and inspect:

- `/bombardier/styleguide` — overview page
- `/bombardier/styleguide/foundation/colors` — token accuracy
- Changed component showcases
- Existing pages that use changed components
- Mobile and desktop layouts

## Output to return

```md
Design system audit complete.

Tokens:
- Total defined: [count]
- Unused tokens: [list or "none"]
- Missing tokens (used but not defined): [list or "none"]
- Foundation pages up to date: yes / no — [details]

Components:
- Total components: [count] (ui: [count], custom: [count])
- Token violations: [list or "none"]
- Missing showcases: [list or "none"]
- Stale showcases: [list or "none"]

Navigation:
- Broken links: [list or "none"]
- Missing entries: [list or "none"]
- Orphaned entries: [list or "none"]

Pages:
- Total pages: [count]
- Token violations: [list or "none"]
- Missing component imports: [list or "none"]
- Inline components to extract: [list or "none"]

Playground:
- Total playground items: [count]
- Promotion candidates: [list or "none"]
- Token violations: [list or "none"]

Updated reference applied: yes / no
- Changes applied: [list]
- Changes skipped: [list with reasons]
- Breaking changes requiring migration: [list]

Validation:
- [command] — passed / failed / not available

Recommended next steps:
- [action items]
```

## Notes

- This skill does **not** create new tokens unless an updated reference
  explicitly requires it and the change is classified as safe.
- Do not overwrite local customizations blindly.
- Do not delete tokens or components without checking usage first.
- Do not promote Playground components automatically — promotion requires
  explicit review.
- shadcn/ui remains a primitive layer; audit that shadcn components are used
  through project wrappers when wrappers exist.
- When uncertain, document the issue and recommend manual review instead of
  forcing a risky edit.
- Run this skill periodically to keep the design system healthy.
