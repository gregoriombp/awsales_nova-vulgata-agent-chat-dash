---
name: bombardier-new-page
description: >
  Builds a full page in a Bombardier design system project (Next.js +
  shadcn/ui) from a screenshot, Figma URL, wireframe, or written brief. Reads
  the foundation tokens and the existing styleguide, maps every visual element
  to existing project components first, falls back to shadcn primitives or new
  Playground components only when needed, scaffolds the page in the app
  router, and registers any new components/page prototypes in the Playground
  section of navigation.ts. Reference informs structure; project tokens
  dictate styling — never invents new tokens. Use when the user asks to
  "build a page", "implement screen", "create dashboard/landing/profile/
  settings page", "scaffold page from Figma", "translate mockup to code",
  "implement this screenshot", or hands over a reference and asks for a
  working page.
---

# Bombardier — Prompt 3: Page Development

> **Repo override (AwSales): there is no "Playground"/quarantine area.** Ignore any step below that puts a new component or page prototype under a `playground/` path or in a "Playground" nav section — it was removed. New components go to `components/ui/Aw[Name].tsx` + showcase at `app/bombardier/styleguide/components/aw-[name]/`. Source of truth: `AGENTS.md`.

Build a `[PAGE NAME]` page using the project's existing design system
components and foundation tokens.

The page should use existing design system components first. Create new
components only when the page requires them and no suitable component exists.
New unreviewed components go to Playground.

This skill assumes the foundation skill has run (or that the project already
has tokens in `globals.css` and a styleguide route at
`/app/bombardier/styleguide/`).

## Input

```txt
Page name: [PAGE NAME]
Reference: [screenshot, Figma URL, wireframe, written brief, or any visual reference]
Target project: [project path or current repository]
```

> **How references work:** The reference (screenshot, Figma, wireframe) informs
> the page's **structure, layout, sections, and content hierarchy**. All
> visual styling (colors, spacing, radius, typography, shadows) comes from the
> project's existing foundation tokens. Never extract literal visual values
> from the reference to use as hardcoded styles. The reference tells you
> *what* to build; the project tokens tell you *how* to style it.

## Goal

Create a page that is consistent with the project's existing design system:

- Reuse existing design system components (from `/app/bombardier/styleguide/`
  and `/components/`)
- Follow foundation tokens exclusively (from `globals.css`)
- Match the requested page structure and layout from the reference
- Support responsive behavior
- Keep generated components separate in Playground when not reviewed

## Workflow

### 1. Inspect the target project and styleguide

Before building, inspect:

- Router structure and page conventions
- **Foundation tokens** — read `/app/bombardier/styleguide/foundation/` pages
  to learn the available colors, typography, spacing, radius, and shadows
- **Existing components** — read `/app/bombardier/styleguide/navigation.ts`
  and browse the components section to know what's already built
- Existing layouts and shared UI patterns
- Playground structure
- Existing pages (naming, structure, metadata conventions)

> **Critical:** The foundation tokens and existing components discovered in
> this step define everything you can use. Do not create new tokens. Do not
> use hardcoded hex colors, pixel values, or arbitrary Tailwind values
> (`bg-[#7c3aed]`, `p-[13px]`). Every visual property must map to an existing
> project token.

### 2. Analyze the page reference

#### When a visual reference (screenshot / Figma / wireframe) is provided

Study the image and identify **structure**, not styling:

**Layout structure**

- How many main sections / columns?
- Is there a sidebar? Header? Footer?
- What's the grid structure? (1-column, 2-column, 3-column)
- Container widths and spacing patterns

**UI sections**

- Break down the page into logical sections (top to bottom, left to right)
- Name each section by its purpose (e.g., "Sidebar Navigation", "Task List",
  "Stats Overview")

**Content hierarchy**

- What are the primary headings?
- What's the main content vs. supporting content?
- What are the call-to-action elements?
- What are the repeated patterns / items?

**Data states**

- What does the page look like with data?
- What are the empty, loading, and error states?

#### When a written brief is provided

Break down the requested page:

```txt
Page: [PAGE NAME]
- Purpose:
- Primary user:
- Main task:
- Route:
- Required sections:
- Required interactions:
- Required data states:
- Responsive needs:
```

### 3. Map visual elements to existing components

For each UI element identified, first check if an existing design system
component covers it. Use shadcn MCP to verify available primitives:

- `search_items_in_registries` for each component type needed
- `get_add_command_for_items` to get install commands for missing shadcn
  primitives

**Component resolution priority**

| Priority | Source | Example |
|---|---|---|
| 1 | Existing project components (from `/components/`) | `AppButton`, `StatusBadge`, `AppHeader` |
| 2 | Existing styleguide components (from `/app/bombardier/styleguide/components/`) | Components already showcased |
| 3 | Installed shadcn primitives (from `/components/ui/`) | `Button`, `Card`, `Tabs` |
| 4 | New shadcn primitive (install via MCP) | `npx shadcn@latest add [name]` |
| 5 | New custom component → Playground | Last resort, document why |

**Common shadcn component mapping**

| Visual element | shadcn component |
|---|---|
| Navigation sidebar | Sidebar |
| Tabs / segmented control | Tabs |
| Cards with content | Card (CardHeader, CardContent, CardFooter) |
| List of items | Card or Table |
| Buttons | Button (variant: default, outline, ghost) |
| Form inputs | Input, Textarea (with Label) |
| Dropdowns | Select or DropdownMenu |
| Badges / tags | Badge |
| Icons | Material Symbols via `Icon` (components/ui/Icon.tsx) |
| Modal / dialog | Dialog |
| Toast / notification | Toast / Sonner |
| Avatar / profile image | Avatar |
| Progress indicator | Progress |
| Checkbox / toggle | Checkbox or Switch |
| Data grid | Table / Data Table |
| Date selection | Calendar / Date Picker |
| Search / command | Command |
| Side panel | Sheet / Drawer |
| Tooltips | Tooltip |
| Accordion / collapsible | Accordion / Collapsible |

### 4. Create a section-to-component map

Document what each section uses:

```txt
Page: [PAGE NAME]
├── Header
│   ├── Uses: [existing component or shadcn primitive]
│   └── Uses: [...]
├── Sidebar (if present)
│   ├── Uses: [...]
│   └── Uses: [...]
├── Main content
│   ├── Section 1: [name]
│   │   └── Uses: [...]
│   ├── Section 2: [name]
│   │   └── Uses: [...]
│   └── ...
└── Footer (if present)
    └── Uses: [...]

Missing (need to create):
- [ComponentName] — reason: [why no existing component fits] → Playground
```

### 5. Decide whether new components are needed

Create a new component **only** when:

- No existing component fits the need
- Reusing an existing component would distort its purpose
- The pattern repeats on the page (not a one-off element)
- The pattern is likely reusable on other pages

If a new component is needed:

- Follow the `bombardier-new-component` skill rules
- Use only existing project tokens (no new tokens)
- Place it in Playground:
  `/app/bombardier/styleguide/playground/components/[name]/page.tsx`
- Add it to the Playground section of `navigation.ts`
- Document why it was created in the output report

### 6. Install required shadcn components

Based on the mapping, install any shadcn primitives not yet in the project:

```bash
npx shadcn@latest add [component1] [component2] [component3] ...
```

Use shadcn MCP (`get_add_command_for_items`) to get the correct install
commands.

### 7. Build the page

Create the page in the existing router structure:

```txt
app/[page-name]/page.tsx
```

**Implementation requirements**

- Use existing layout components when available
- Use design tokens exclusively through Tailwind classes (`bg-primary`,
  `text-muted-foreground`, `border-border`)
- Use semantic HTML elements
- No hardcoded hex colors, pixel values, or arbitrary Tailwind values
- Keep sections layout-stable (no layout shift between states)
- Add page metadata when the framework supports it

```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const metadata = {
  title: "Page Title",
  description: "Page description",
}

export default function PageName() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar if present */}
      <aside className="w-64 border-r bg-sidebar">
        {/* Sidebar content using existing components */}
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="border-b p-4">
          {/* Header using existing components */}
        </header>

        <div className="p-6">
          {/* Page sections using existing components and tokens */}
        </div>
      </main>
    </div>
  )
}
```

### 8. Apply styling (existing tokens only)

Use Tailwind classes that reference project CSS variables:

- **Backgrounds:** `bg-background`, `bg-card`, `bg-muted`, `bg-sidebar`,
  `bg-primary`, `bg-secondary`
- **Text:** `text-foreground`, `text-muted-foreground`,
  `text-primary-foreground`
- **Borders:** `border-border`, `border-input`
- **Spacing:** Tailwind's spacing scale (`p-4`, `gap-6`, `space-y-4`)
- **Radius:** `rounded-lg`, `rounded-md` (mapped to `--radius`)
- **Shadows:** `shadow-sm`, `shadow-md`

> Never use `bg-[#hex]`, `text-[#hex]`, `p-[Npx]`, or any arbitrary value. If
> the reference shows a visual that doesn't match any existing token, use the
> **semantically closest** token. Flag the gap in the output report.

### 9. Layout (desktop-only)

This product is **desktop-only** — there are no mobile/tablet breakpoints. Don't
add `md:` / `lg:` reflows or hide elements per breakpoint.

Do not let text overflow its parent. Use stable dimensions for cards, lists,
controls, grids, and repeated items.

### 10. Add interactivity

Implement only the interactions required by the page:

- Navigation / routing between pages
- Tab switching
- Filters and search
- Selection states
- Form handling
- Dialog / drawer triggers
- Loading states (Skeleton components)
- Empty states (meaningful messages with CTAs)
- Error states (Alert components with recovery actions)

Use accessible primitives (Radix via shadcn) for complex interactions.

### 11. Register the page

If the page is a prototype or experimental, register it in the Playground
section of `/app/bombardier/styleguide/navigation.ts`:

```ts
{
  title: "Playground",
  items: [
    { name: "[Page Name]", href: "/bombardier/styleguide/playground/pages/[page-name]" },
  ],
}
```

For production pages at `/app/[page-name]/`, no styleguide registration is
needed — the page lives in the app router directly.

### 12. Validate

Run available checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If a browser check is useful, start the dev server and inspect the page at
desktop and mobile sizes.

## Directory structure

```
app/
├── [page-name]/
│   └── page.tsx                    # Production page
└── bombardier/
    └── styleguide/
        ├── navigation.ts           # Updated with new playground entries
        ├── components/             # Existing component showcases
        └── playground/
            ├── components/         # New components created for this page
            │   └── [name]/
            │       └── page.tsx
            └── pages/              # Experimental page prototypes
                └── [page-name]/
                    └── page.tsx

components/
├── ui/                             # shadcn primitives (may be expanded)
└── [ComponentName].tsx             # Existing project components
```

## Output to return

```md
Built [PAGE NAME].

Changed:
- [file path] — what changed

Reference:
- Image / wireframe provided: yes / no
- Existing components reused: [list]
- New shadcn primitives installed: [list or "none"]
- New Playground components created: [list or "none"]

Sections:
- [section name] — [components used]

Token gaps:
- [any visual from the reference that couldn't be mapped to an existing token]

Validation:
- [command] — passed / failed / not available
```

## Notes

- **Existing components first** — always check the styleguide before creating
  anything new.
- **Existing tokens only** — the project's `globals.css` and foundation pages
  define the complete token set; never add to it.
- **Use shadcn MCP** to verify component availability and get install
  commands.
- **Reference = structure, tokens = style** — the reference informs layout,
  sections, and hierarchy; project tokens dictate all visual values.
- **Playground for new components** — any component created during page
  building goes to Playground, not the official design system.
- **Flag gaps** — if the page genuinely needs a token or component that
  doesn't exist, report it in the output instead of creating workarounds.
- **Keep API aligned** — match the project's conventions for routing, layouts,
  and metadata.
