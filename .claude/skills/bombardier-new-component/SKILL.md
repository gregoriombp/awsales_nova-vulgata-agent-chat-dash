---
name: bombardier-new-component
description: >
  Add or update an AwSales Bombardier design system component using existing
  tokens, shadcn primitives where appropriate, a showcase page, and navigation.
---

# Bombardier — New Component

Use this skill when adding a design system component or touching an existing
`Aw*` component.

`AGENTS.md` is the source of truth. If anything here conflicts with it, follow
`AGENTS.md`.

## Hard Rules

- New design system components are `Aw*` in `components/ui/Aw[Name].tsx`.
- New showcases live at `app/bombardier/styleguide/components/aw-[name]/page.tsx`.
- Existing legacy showcase folders must not be renamed.
- Do not create `components/playground`, styleguide Playground routes, or
  unprefixed DS components.
- Do not add tokens. Only `bombardier-design-system-foundation` can do that.
- Do not use arbitrary Tailwind values for color, spacing, radius, shadow, or
  typography.
- Use Material Symbols via `components/ui/Icon.tsx` for product icons.

## Workflow

1. Read `AGENTS.md`.
2. Check existing options before writing:
   - `components/ui/Aw*`
   - legacy `components/*`
   - lowercase shadcn primitives in `components/ui/*.tsx`
3. If a shadcn primitive is appropriate and missing, install it with
   `npx shadcn@latest add <name>`.
4. Create or update `components/ui/Aw[Name].tsx` as the brand wrapper.
   Preserve existing props when touching old components.
5. Add or update the showcase:
   - New component: `app/bombardier/styleguide/components/aw-[name]/page.tsx`
   - Family component: add it under the existing family hub and show it inline.
6. Update `app/bombardier/styleguide/navigation.ts`.
7. Migrate imports only where needed for the requested change.
8. Validate with focused lint and `npm run typecheck`.

## Output

Report:

- files changed
- primitive installed or reused
- showcase/nav status
- validations run
- any token that was needed but not created
