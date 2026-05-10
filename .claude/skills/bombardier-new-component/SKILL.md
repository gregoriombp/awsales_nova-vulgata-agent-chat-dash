---
name: bombardier-new-component
description: >
  Adds a new component to a Bombardier design system project (Next.js +
  shadcn/ui) using EXISTING foundation tokens — never creates new tokens.
  Inspects the project, analyzes the reference image or design source for
  structure (anatomy, variants, states), checks the shadcn registry via MCP,
  picks the right strategy (extend existing, install shadcn, port from source,
  or build custom), implements with TypeScript and `cn`, registers the
  component under /app/bombardier/styleguide/components/[name] (or
  /playground/components/[name] when experimental), and updates navigation.ts.
  The reference informs structure; project tokens dictate styling. Use when
  the user asks to "add a Button/Card/Dialog/Input/...", "install component",
  "wrap shadcn", "extend a primitive", "create a custom component for the
  design system", "register component in the styleguide", or names any
  component to include in the system.
---

# Bombardier — Prompt 2: Component Development

Add a `[COMPONENT NAME]` to the project using shadcn/ui as a foundation and
**only existing project tokens** for styling.

This skill assumes the foundation skill has already run (or that the project
already has tokens in `globals.css` and a styleguide route at
`/app/bombardier/styleguide/`).

## Input

```txt
Component name: [COMPONENT NAME]
Reference image: [optional — screenshot, mockup, Figma URL, Dribbble/Behance shot, or any visual reference]
Design source: [optional — fetch URL, file path, zip path, markdown, HTML, or JSON from a design system]
Target project: [project path or current repository]
```

> **Image mode:** When a reference image is provided, use it to understand the
> component's **structure, anatomy, variants, states, and layout**. The image
> is a structural reference only — all visual values (colors, spacing, radius,
> typography, shadows) must come from the project's existing foundation
> tokens. Never extract literal colors or values from the image to create new
> tokens. When no image is provided, rely on the design source, shadcn
> defaults, or project conventions.

## Goal

Implement a production-ready component that follows the project's existing
design foundations:

- Visual design (structure / anatomy from the reference, tokens from the project)
- Tokens (exclusively from existing project CSS variables — never create new)
- Variants
- States
- Interaction behavior
- Accessibility behavior
- Responsive behavior
- Existing project conventions

## Workflow

### 1. Inspect the target project

Before fetching or implementing anything, inspect:

- Framework and router (Next.js App Router, Pages Router, Vite, etc.)
- Styling system (Tailwind, CSS Modules, styled-components, etc.)
- Existing component folders and naming conventions
- Existing token setup (`globals.css`, theme files, design token files)
- Existing styleguide / Bombardier setup — **read the foundation pages** under
  `/app/bombardier/styleguide/` to learn the available tokens (colors,
  typography, spacing, radius, shadows)
- Existing `cn` utility or class merge helper
- Existing shadcn/ui setup — check for `components.json`, `components/ui/`
- Similar existing components (avoid duplicating what's already there)

Do not create a new component convention if the project already has one.

> **Critical:** The foundation tokens discovered in this step are the **only**
> tokens you are allowed to use. Do not invent, add, or extend the token set.
> Every color, spacing value, radius, shadow, and typographic style in the new
> component must map to an existing project token.

### 2. Analyze the reference (image or design source)

#### When a reference image is provided

Study the image and extract a **structural spec** (what the component is made
of, how it behaves):

```txt
Component:
- Name:
- Purpose:
- Anatomy: [list every visible element — container, label, icon, divider, badge, etc.]
- Structural roles:
  - Which element is the primary surface? (→ map to card / background / primary token)
  - Which text is heading vs body vs caption? (→ map to existing typography scale)
  - Which elements are interactive? (→ map to interactive token pairs)
  - Which elements are decorative? (→ map to muted / accent tokens)
- Variants: [inferred from visible states in the image]
- Sizes: [if multiple sizes are shown]
- States: [default, hover, focus, disabled, active, selected — whatever is visible]
- Layout: [flex/grid direction, alignment, responsive hints]
- Icons: [icon names or descriptions if visible]
```

Map every structural role to the **closest existing project token**. Do not
extract literal hex colors, pixel values, or font sizes from the image. The
image tells you *what* the component looks like structurally; the project
tokens tell you *how* to style it.

> Example: if the image shows a purple card with rounded corners, and the
> project's primary token is blue, build a `bg-primary` card — not a purple
> one. The image informed the anatomy (card with icon + title + description);
> the project tokens informed the styling.

#### When a design source document is provided

Fetch and extract the component specification:

```txt
Component:
- Name:
- Purpose:
- Anatomy:
- Required children:
- Optional children:
- Variants:
- Sizes:
- States:
- Props:
- Tokens:
- Accessibility:
- Responsive behavior:
- Usage examples:
- Dependencies:
- Source reference:
```

If the component is not directly documented, infer from nearby components and
existing design system patterns. Keep inference conservative.

#### When neither image nor design source is provided

Use shadcn defaults and project conventions. Rely on shadcn MCP examples and
existing project components as reference.

### 3. Check if the component exists in shadcn

Use shadcn MCP to search the registry:

- **Search:** `search_items_in_registries` with query "[component name]"
- **Found → details:** `view_items_in_registries` to see structure,
  dependencies, and available variants
- **Examples:** `get_item_examples_from_registries` with query
  "[component]-demo"

**Decision tree**

| Scenario | Action |
|---|---|
| Project already has a matching component | → Step 4A (Extend existing) |
| shadcn has the component and it fits | → Step 4B (Install shadcn) |
| Design source provides code or structure | → Step 4C (Port from source) |
| None of the above | → Step 4D (Build custom) |

**Common shadcn components for reference**

- **Layout:** Card, Separator, Tabs, Accordion, Collapsible, Aspect Ratio, Scroll Area, Resizable
- **Forms:** Button, Input, Select, Checkbox, Radio Group, Switch, Textarea, Label, Form, Slider, Toggle, Toggle Group, Date Picker, Combobox, Input OTP
- **Feedback:** Alert, Toast / Sonner, Progress, Skeleton, Badge, Alert Dialog
- **Overlay:** Dialog, Drawer, Popover, Tooltip, Dropdown Menu, Context Menu, Sheet, Hover Card
- **Navigation:** Navigation Menu, Breadcrumb, Pagination, Command, Menubar, Sidebar
- **Data:** Table, Data Table, Calendar, Chart, Carousel, Avatar

### 4. Choose the implementation strategy

#### A. Existing project component exists

If the project already has a matching or near-matching component:

- Extend it if compatible with the design reference
- Wrap it if the design needs a different API surface
- Avoid duplicating it under a new name unless the semantics are fundamentally
  different

#### B. Install shadcn component

Get the install command using shadcn MCP (`get_add_command_for_items`) and run
it:

```bash
npx shadcn@latest add [component-name]
```

This adds the component to `/components/ui/`. It automatically uses CSS
variables from `globals.css`.

Review the installed component to understand:

- Available variants (size, style, etc.)
- Props interface and TypeScript types
- How it uses CSS variables
- Radix primitives it wraps (for accessibility)

If the reference image or design source shows differences from the shadcn
default → proceed to customize (Step 5).

#### C. Port from design source

If the fetched source provides component code or a clear structure:

- Port it into the project
- Adapt imports, tokens, naming, and styling to match project conventions
- Preserve the documented variants and states
- Remove generated code that conflicts with local conventions
- Replace hardcoded values with existing project tokens (never create new ones)

#### D. Build custom component

Build custom when:

- shadcn has no equivalent
- shadcn's structure conflicts with the design reference
- The component is branded or product-specific
- The interaction model is custom

Use existing project primitives first. Use Radix primitives for complex
accessible behavior (focus traps, dismissing, arrow-key navigation, etc.).

```tsx
import { cn } from "@/lib/utils"

interface CustomWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "muted"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function CustomWidget({
  variant = "default",
  size = "md",
  children,
  className,
  ...props
}: CustomWidgetProps) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        size === "sm" && "p-2 text-sm",
        size === "md" && "p-4 text-base",
        size === "lg" && "p-6 text-lg",
        variant === "default" && "bg-card text-card-foreground border-border",
        variant === "primary" && "bg-primary text-primary-foreground border-primary",
        variant === "muted" && "bg-muted text-muted-foreground border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### 5. Customize the component (if needed)

If the base shadcn component needs modifications to match the design reference,
create a wrapped version in `/components/[ComponentName].tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AppButtonProps extends React.ComponentProps<typeof Button> {
  intent?: "default" | "success" | "warning" | "info"
  loading?: boolean
}

export function AppButton({
  intent = "default",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: AppButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(
        intent === "success" && "bg-success text-success-foreground hover:bg-success/90",
        intent === "warning" && "bg-warning text-warning-foreground hover:bg-warning/90",
        intent === "info" && "bg-info text-info-foreground hover:bg-info/90",
        className
      )}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </Button>
  )
}
```

**Customization patterns**

- Map color variants to existing project CSS variables only (`bg-primary`,
  `bg-destructive`, `bg-muted`, etc.)
- Map size variants to the project's existing spacing scale
- Compose multiple shadcn components together (e.g., Button + Tooltip)
- Add loading states, icons, or other interaction features
- Adjust animations and transitions using existing design tokens
- Override default Radix styles when the project's foundations differ

### 6. Map tokens (existing only)

Map every visual property to an **existing** project token. Never create new
tokens.

Resolution order:

1. Existing project CSS variables (`--primary`, `--card`, `--muted`, etc. from
   `globals.css`)
2. Existing Tailwind theme classes that reference those CSS variables
3. Existing design token files or theme configuration

**Rules**

- If the design reference shows a value that has no exact token match, use the
  **semantically closest** existing token. A purple accent in the reference
  becomes `primary` or `accent` — whichever the project already defines.
- Never add new CSS variables to `globals.css`.
- Never add new colors, spacing values, radii, or shadows to the Tailwind
  config.
- Never use hardcoded hex colors, pixel values, or arbitrary Tailwind values
  (`bg-[#7c3aed]`, `p-[13px]`).
- If a design reference demands a token that genuinely doesn't exist (e.g., the
  component needs a "success" semantic but the project has no success token),
  **flag it in the output report** and use the closest alternative. Do not
  create the token yourself.

### 7. Preserve variants and states

Implement every meaningful variant from the design reference:

- Visual variants (solid, outline, ghost, link, etc.)
- Size variants (xs, sm, md, lg, xl)
- Density variants (compact, comfortable, spacious)
- Color / intent variants (default, primary, secondary, destructive, success,
  warning, info)
- Icon positions (leading, trailing, icon-only)
- Loading state
- Disabled state
- Empty state
- Error state
- Focus-visible state
- Hover state
- Active / pressed state
- Selected or active state
- Responsive behavior (stacking, hiding, resizing)

Do not add new variants unless they are visible in the reference or required by
existing project usage.

### 8. Implementation requirements

Every component must follow:

- TypeScript with fully typed props
- `className` prop support with `cn()` merge
- `ref` forwarding when the component wraps a native or Radix element
- Semantic HTML elements (not just `div` soup)
- Accessible labels and ARIA attributes where needed
- Keyboard interaction for interactive components (Enter, Space, Escape, Arrow
  keys)
- Explicit typed variants (no magic strings)
- Layout-stable states (no layout shift on state changes)
- No unnecessary abstraction layers

### 9. Create the component showcase

Add a showcase page at
`/app/bombardier/styleguide/components/[component-name]/page.tsx`. Use examples
from shadcn MCP (`get_item_examples_from_registries`) as reference.

The showcase must include:

- **Basic usage** — simplest working example
- **All variants** — every visual variant side by side
- **All sizes** — size comparison
- **Important states** — default, hover preview, focus, disabled, loading,
  error
- **Light and dark mode** — toggle or side-by-side preview
- **Composition** — common combinations with other components
- **Interactive demo** — prop controls when useful
- **Code snippets** — copyable examples for each variant
- **Props table** — all available props with types and defaults
- **Accessibility notes** — keyboard navigation, ARIA attributes, screen reader
  behavior

If the component is experimental or unreviewed, place it under Playground
first:

```txt
app/bombardier/styleguide/playground/components/[component-name]/page.tsx
```

### 10. Update styleguide navigation

Add the new component to `/app/bombardier/styleguide/navigation.ts`. In the
"Components" section:

```ts
{
  title: "Components",
  items: [
    // ...existing components
    { name: "[Component Name]", href: "/bombardier/styleguide/components/[component-name]" },
  ],
}
```

For experimental / playground components, use the Playground section:

```ts
{
  title: "Playground",
  items: [
    { name: "[Component Name]", href: "/bombardier/styleguide/playground/components/[component-name]" },
  ],
}
```

This makes the component appear in the styleguide sidebar.

### 11. Validate

Run available checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If visual verification is useful, start the dev server and inspect the
showcase.

## Directory structure

```
components/
├── ui/                    # Base shadcn components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── [ComponentName].tsx    # Wrapped / customized / new design-system components

app/
└── bombardier/
    └── styleguide/
        ├── components/
        │   └── [component-name]/
        │       └── page.tsx       # Component showcase (reviewed)
        └── playground/
            └── components/
                └── [component-name]/
                    └── page.tsx   # Component showcase (experimental)
```

## Output to return

```md
Implemented [COMPONENT NAME].

Changed:
- [file path] — what changed

Reference:
- Image provided: yes / no
- Design source: [source or "none"]
- shadcn/ui used: yes / no
- Strategy: [extended existing / installed shadcn / ported from source / built custom]
- Reason: [brief explanation]

Validation:
- [command] — passed / failed / not available
```

## Notes

- **Use shadcn MCP** to search, view, and get examples before building
  anything.
- **Existing tokens only** — the project's `globals.css` and foundation pages
  define the complete token set; never add to it.
- **CSS variables** are the source of truth (defined in `globals.css`).
- **Tailwind classes** reference CSS variables (`bg-primary`,
  `text-muted-foreground`).
- **Extend, don't rebuild** — customize shadcn components rather than building
  from scratch.
- **Image = structure, tokens = style** — when an image is provided, it
  informs anatomy, layout, variants, and states; the project's existing tokens
  dictate all visual values (colors, spacing, radius, etc.).
- **shadcn is a tool, not the authority** — the project's foundations take
  precedence over shadcn defaults when they conflict.
- **Import existing before creating** — check project components before writing
  new code.
- **Playground first** — new generated components should start in Playground
  when they are not yet reviewed.
- **Keep API aligned** — match the project's design system conventions, not
  generic shadcn examples.
- **Flag missing tokens** — if a component genuinely needs a token the project
  doesn't have, report it in the output instead of creating it.
