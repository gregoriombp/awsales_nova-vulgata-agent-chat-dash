# Bombardier

Bombardier is the visual builder layer for AwSales inside this repository. It
brings the design system, product screens, UX flows, visual review, and agent
workflows into one code-native environment for building product UI.

Its purpose is to shorten the distance between product intent and implementation:
the real design system lives in code, screens are navigable, flows are editable,
and visual comments become a local work queue that agents can resolve with user
approval.

## Current Surfaces

| Surface | Route | Role |
|---|---|---|
| Styleguide | `/bombardier/styleguide` | Live design system source: foundations, tokens, `Aw*` components, brand, patterns, and UX flows. |
| Projects | `/bombardier/projects` | Workbench for imported projects/screens, design-system update requests, and build requests. |
| UX Flow | `/bombardier/ux-flow` | Flow viewer/hub for presenting and navigating UX flows as prototypes. |
| Styleguide UX Flows | `/bombardier/styleguide/ux-flows` | Editable source for flow graphs, nodes, edges, comments, and changelog entries. |
| Review Inbox | `/bombardier/styleguide/review` | Inbox for comments created through Review Mode. |
| Review Bridge (server/data) | `review-bridge/` | Local comment-queue server + data dir for agents (a filesystem dir, not a route), with user approval after agent work. |
| Review Bridge (dashboard) | `/bombardier/review-bridge` | In-app view of the local review-bridge queue (comments + suggestions panels). |
| Login | `/bombardier/login` | Login screen for the Bombardier area. |
| Design System Tweaks | `/bombardier/design-system-tweaks` | Controlled foundation/token experiments and visual impact checks. |

## Mental Model

Bombardier is not separate documentation for the product. It is a product layer
that runs with the Next.js app.

- **Design system as source of truth:** official components live in
  `components/ui/Aw*`, use tokens from `app/globals.css`, and are documented in
  the styleguide.
- **Builder by composition:** new screens should start from existing `Aw*`
  components. When a missing piece is reusable, it becomes an official design
  system component.
- **Flows as code:** UX flows are React pages with structured nodes and edges,
  not static images.
- **Review as work queue:** visual comments carry route and target context, so
  local agents can resolve them before the user approves or rejects the result.
- **Skills as execution contracts:** agents use Bombardier skills to follow repo
  rules instead of inventing file structure.

## Creating New Work

### New Design System Component

Use `bombardier-new-component`.

Expected output:

- `components/ui/Aw[Name].tsx`
- showcase at `app/bombardier/styleguide/components/aw-[name]/page.tsx`
- entry in `app/bombardier/styleguide/navigation.ts`
- existing tokens only
- shadcn primitive installed and wrapped when appropriate

### New Screen or Screen Redesign

Use `bombardier-new-page`.

The agent should first compose the screen with existing `Aw*` components and
feature modules. If the screen exposes a reusable pattern that the design system
does not have, create that pattern with `bombardier-new-component`. If it is
feature-specific, keep it local in `_components` or in the feature module.

### New UX Flow

Use `bombardier-create-ux-flow` or the `bombardier-pg-*` skills, depending on
the flow source.

The editable file lives at:

```txt
app/bombardier/styleguide/ux-flows/[slug]/page.tsx
```

### Review Comments

`npm run dev` prepares and starts Review Bridge at `127.0.0.1:9878`. Review Mode
comments enter that local queue. Agents should use `bombardier-review-bridge-solve`
to move work to `in_review`; the user approves or rejects it afterward from the
inbox.

## Architecture Rules

- `AGENTS.md` is the source of truth for agent rules.
- `AWSALES_CONTEXT.md` is the product context, voice, and vocabulary source.
- Do not create tokens outside the foundation skill.
- Do not create official components without the `Aw` prefix.
- Do not use `components/playground` as AI staging.
- Do not expose Review Bridge on the LAN or bind it to `0.0.0.0`.
- Do not use `.next/`, `.agents/`, `.claude/worktrees/`, `node_modules/`, or
  runtime data as architecture sources.

## Relationship to the Product

Bombardier exists to accelerate AwSales/Aswork product building without breaking
the design system. The expected loop is:

1. build with real components;
2. register reusable patterns in the styleguide;
3. map relevant journeys as UX flows;
4. review with visual comments;
5. let agents apply scoped changes with enough context;
6. have the user approve the final result.
