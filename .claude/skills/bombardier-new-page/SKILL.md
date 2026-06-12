---
name: bombardier-new-page
description: >
  Build or rework a product page in this Next.js app using the AwSales design
  system, existing components, existing tokens, and desktop-only constraints.
---

# Bombardier — New Page

Use this skill for product pages, feature screens, and substantial page reworks.

`AGENTS.md` is the source of truth. If anything here conflicts with it, follow
`AGENTS.md`.

## Hard Rules

- Build the usable product screen, not a marketing/landing placeholder.
- Reuse `components/ui/Aw*` and feature modules before creating anything new.
- Do not create Playground/quarantine pages or `components/playground`.
- Do not create tokens or arbitrary Tailwind values.
- Desktop-only: do not add mobile/tablet variants unless explicitly requested.
- Product icons use `components/ui/Icon.tsx`.
- Feature modules under `components/{auth,memory-base,...}` consume `Aw*`; they
  are not DS components and should not be renamed to `Aw*`.

## Workflow

1. Read `AGENTS.md` and, for product voice, the relevant section of
   `AWSALES_CONTEXT.md`.
2. Locate the target route and adjacent `_components` or feature modules.
3. Inspect existing `Aw*` components and local patterns before adding code.
4. Implement the page with stable desktop layout, real states, and complete
   controls expected by the workflow.
5. If a reusable DS component is truly missing, stop and use
   `bombardier-new-component` for that component first.
6. Keep copy in product voice: direct, enterprise, resolving the user's job.
7. Validate with focused lint and `npm run typecheck`. Use Playwright only when
   visual verification is genuinely needed.

## Output

Report:

- route/page changed
- existing components reused
- new components created, if any
- validations run
- any deferred DS gap
