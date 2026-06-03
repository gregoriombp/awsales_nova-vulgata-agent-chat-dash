---
name: bombardier-design-system-foundation
description: >
  Bootstraps a Bombardier design system from a visual reference (screenshot,
  Dribbble shot, Behance post, Mobbin capture, Figma URL) or a design source
  document (Claude Design export, zip, markdown, JSON). Inspects the target
  repo, extracts or parses tokens (colors, typography, spacing, radius,
  shadows), initializes shadcn/ui, writes tokens into globals.css with a
  shadcn-compatible @theme inline block, installs foundation components, and
  scaffolds the canonical /bombardier/styleguide route with foundation pages,
  navigation config, and a Playground area. This is the ONLY skill in the
  Bombardier system that creates tokens — the component, page, and audit
  skills consume them. Use when the user asks to "set up a design system",
  "bootstrap styleguide", "extract tokens from this image/Figma/zip",
  "initialize Bombardier", "create design system from Dribbble/Behance/Mobbin",
  "build a styleguide from this design", or hands over a visual or design
  source to translate into a token system.
---

# Bombardier — Prompt 1: Design System Foundation

> **Repo override (AwSales): do not scaffold a "Playground" area.** This repo's `/bombardier/styleguide` has no Playground/quarantine route — it was removed deliberately. Skip any step below that creates a `playground/` folder or "Playground" nav section. Components live in `components/ui/Aw*` with showcases at `app/bombardier/styleguide/components/aw-[name]/`. Source of truth: `AGENTS.md`.

Translate a design reference into a working Bombardier design system: shadcn/ui
under the hood, tokens in `globals.css`, and a navigable
`/bombardier/styleguide` route documenting everything.

This is the **first** skill. The component, page, and audit skills assume the
foundation is already in place.

## Input

```txt
Reference: [screenshot from Dribbble, Behance, Mobbin, Figma URL, or any visual inspiration]
Design source: [optional — fetch URL, file path, zip path, markdown, HTML, or JSON from a design system export]
Target project: [project path or current repository]
```

> **How references work:** A visual reference (screenshot/image) is analyzed to
> extract real token values — colors, typography, spacing, radius, shadows. A
> design source document (Claude Design export, zip, etc.) is parsed for
> structured token definitions. When both are provided, the design source takes
> precedence for exact values; the image fills gaps. When only an image is
> provided, tokens are inferred from the visual. **This is the only skill where
> new tokens are created** — the component and page skills consume these tokens
> without modifying them.

If neither a reference nor a design source is provided, ask before proceeding.

## Goal

Create a usable design system inside the product repository so that new
components and pages can be built on a consistent set of foundation tokens.

The design system should include:

- Foundation tokens (colors, typography, spacing, radius, shadows)
- shadcn/ui initialized and configured
- Styleguide pages documenting every token
- Navigation structure
- Playground area for experimental components and pages
- Clear rules for future component and page generation

## Non-negotiables

- The canonical namespace is **`bombardier/styleguide`**.
- For Next.js App Router projects, the route lives at
  `/app/bombardier/styleguide`.
- Do **not** create `/app/styleguide`, `/styleguide`, or any competing root
  styleguide.
- shadcn/ui is the foundation. CSS variables and Tailwind utility classes are
  the implementation layer.
- Every official component eventually gets an entry under
  `/bombardier/styleguide/components`.

## Workflow

### 1. Inspect the target project

Before changing files, inspect the repository.

Identify:

- Framework and router (Next.js App Router, Pages Router, Vite, Remix, Astro)
- Styling system (Tailwind v3, v4, CSS Modules, etc.)
- Existing `app`, `src`, `components`, `styleguide`, or `bombardier` folders
- Existing token files or CSS variables
- Existing Tailwind setup and version
- Existing shadcn setup, if any (`components.json`, `components/ui/`)
- Existing component conventions
- Existing styleguide conventions
- The local `cn` utility / class merge helper

Reuse local conventions. **If a Bombardier styleguide already exists, update it
instead of creating a second one.** Do not introduce a second architecture
when the project already has one.

### 2. Analyze the design reference

#### When a visual reference (image) is provided

Study the image and extract or infer:

**Colors**
- Primary/brand color → generate a full scale (50–900) using color theory
- Neutral/grey colors → generate full scale (50–900)
- Semantic colors (success, error/destructive, warning, info)
- Background and surface colors (page, card, popover)
- Border colors
- Focus ring color

**Typography**
- Font family (identify or infer the closest Google Font)
- Heading sizes and weights (h1–h4)
- Body text sizes (sm, base, lg)
- Caption / label sizes
- Line heights

**Spacing & radius**
- Spacing rhythm (tight 4px, normal 8px, relaxed 12–16px)
- Border radius style (sharp 0, rounded 0.5rem, pill 9999px)

**Shadows**
- Shadow style (none, subtle, prominent)
- Shadow scale (sm, md, lg)

> Whenever you're inferring rather than measuring, mark the token as
> **(inferred)** in the final summary so the user can validate.

#### When a design source document is provided

Fetch and parse the source. Extract all structured token definitions:

- Brand principles
- Color tokens (exact values)
- Typography tokens (families, sizes, weights, line-heights)
- Spacing tokens
- Radius tokens
- Shadow tokens
- Border tokens
- Motion / animation rules, if present
- Layout and grid rules
- Component list and specifications
- Dark mode values, if present

If the source is a zip or exported folder, inspect all relevant files before
deciding the token model.

#### When both are provided

Use the design source for exact token values. Use the image to fill gaps and
validate visual intent.

### 3. Initialize shadcn/ui

Use the shadcn MCP to understand available components when accessible:

- `search_items_in_registries` to verify component availability
- `get_add_command_for_items` to get install commands

Run initialization if shadcn isn't set up yet:

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral** (will be overridden with extracted tokens)
- CSS variables: **Yes**

If shadcn is already initialized, keep the existing aliases and config.

### 4. Generate and apply globals.css

Replace `/app/globals.css` with the extracted design tokens. For Tailwind v4
projects, use CSS variables with `@theme inline`:

```css
@import "tailwindcss";

:root {
  /* === BASE === */
  --background: [extracted page background];
  --foreground: [extracted text color];

  /* === CARD === */
  --card: [extracted card/surface background];
  --card-foreground: [extracted card text];

  /* === POPOVER / DROPDOWN / TOOLTIP === */
  --popover: [same as card or white];
  --popover-foreground: [same as card-foreground];

  /* === PRIMARY === */
  --primary: [extracted primary color];
  --primary-foreground: [white or dark based on contrast];

  /* === SECONDARY === */
  --secondary: [light grey or muted version of primary];
  --secondary-foreground: [dark text];

  /* === MUTED === */
  --muted: [light grey background];
  --muted-foreground: [medium grey text];

  /* === ACCENT === */
  --accent: [same as secondary or slight tint];
  --accent-foreground: [dark text];

  /* === DESTRUCTIVE === */
  --destructive: [red/error color];
  --destructive-foreground: [white];

  /* === BORDERS & INPUTS === */
  --border: [extracted border color];
  --input: [slightly darker border for inputs];
  --ring: [primary color for focus rings];

  /* === BORDER RADIUS === */
  --radius: [extracted radius, e.g., 0.5rem];

  /* === CHART COLORS === */
  --chart-1: [primary];
  --chart-2: [complementary color];
  --chart-3: [variation];
  --chart-4: [variation];
  --chart-5: [variation];

  /* === SIDEBAR === */
  --sidebar: [sidebar background];
  --sidebar-foreground: [sidebar text];
  --sidebar-primary: [primary];
  --sidebar-primary-foreground: [white];
  --sidebar-accent: [accent];
  --sidebar-accent-foreground: [dark text];
  --sidebar-border: [border color];
  --sidebar-ring: [primary];

  /* === SEMANTIC === */
  --success: [green];
  --success-foreground: [white];
  --warning: [yellow/orange];
  --warning-foreground: [dark for contrast];
  --info: [blue];
  --info-foreground: [white];
}

.dark {
  --background: [dark background];
  --foreground: [light text];
  /* ...all other variables with dark mode values... */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: [extracted font], sans-serif;
}
```

For Tailwind v3 projects, update `tailwind.config.*` and CSS variables
accordingly. For non-Tailwind projects, create or update the local token format
already used by the repo.

> **Important:** Ensure sufficient contrast for accessibility (4.5:1 for text,
> 3:1 for large text and UI elements). If extracted colors don't meet contrast
> requirements, adjust them while preserving the visual intent.

### 5. Install the recommended font

If a Google Font matches the design, add it to `/app/layout.tsx`:

```tsx
import { Inter } from "next/font/google"

const font = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  )
}
```

### 6. Install demo components

Use shadcn MCP to search and install the foundation set used by the styleguide:

```bash
npx shadcn@latest add button card badge alert radio-group
```

Add more (tabs, input, label, select, separator, switch, tooltip, dialog,
dropdown-menu, drawer, popover, table, accordion, etc.) when the reference
clearly calls for them.

### 7. Create the styleguide structure

Create the following structure under `/app/bombardier/styleguide/`:

```txt
app/
  bombardier/
    styleguide/
      layout.tsx                    # Shared layout with sidebar navigation
      navigation.ts                 # Navigation config (used by component & page skills)
      page.tsx                      # Overview / index page
      foundation/
        colors/page.tsx             # Color token swatches
        typography/page.tsx         # Typography samples
        spacing/page.tsx            # Spacing scale
        radius/page.tsx             # Radius examples
        shadows/page.tsx            # Shadow examples
      components/                   # Component showcases (added by component skill)
      playground/
        components/                 # Experimental component showcases
        pages/                      # Experimental page prototypes
```

### 8. Create the navigation config

Create `/app/bombardier/styleguide/navigation.ts`:

```ts
export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "Foundation",
    items: [
      { name: "Overview", href: "/bombardier/styleguide" },
      { name: "Colors", href: "/bombardier/styleguide/foundation/colors" },
      { name: "Typography", href: "/bombardier/styleguide/foundation/typography" },
      { name: "Spacing", href: "/bombardier/styleguide/foundation/spacing" },
      { name: "Radius", href: "/bombardier/styleguide/foundation/radius" },
      { name: "Shadows", href: "/bombardier/styleguide/foundation/shadows" },
    ],
  },
  {
    title: "Components",
    items: [
      // Components added by the component skill
    ],
  },
  {
    title: "Playground",
    items: [
      // Experimental components and pages
    ],
  },
]
```

### 9. Create the styleguide layout with sidebar

Create `/app/bombardier/styleguide/layout.tsx` with a sidebar that reads from
the navigation config:

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navigation } from "./navigation"

export default function StyleguideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card p-6 flex flex-col gap-6 fixed top-0 left-0 h-screen overflow-y-auto">
        <Link href="/bombardier/styleguide" className="text-xl font-bold">
          Design System
        </Link>

        <nav className="flex flex-col gap-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64 overflow-auto">{children}</main>
    </div>
  )
}
```

### 10. Create foundation documentation pages

Create styleguide pages that document every token group:

**`/app/bombardier/styleguide/page.tsx`** — Overview
- Design system summary (primary color, font, style, feel)
- Quick links to all foundation pages
- Component inventory status

**`/app/bombardier/styleguide/foundation/colors/page.tsx`**
- All colors as swatches with CSS variable names
- Primary scale (50–900), neutral scale (50–900)
- Semantic colors (success, warning, error, info)
- Background and surface colors
- Dark mode comparison when applicable

**`/app/bombardier/styleguide/foundation/typography/page.tsx`**
- Font family display, heading samples (h1–h4), body samples, captions / labels

**`/app/bombardier/styleguide/foundation/spacing/page.tsx`**
- Spacing scale visualization, common usage patterns

**`/app/bombardier/styleguide/foundation/radius/page.tsx`**
- Radius scale with visual examples on card / button / input

**`/app/bombardier/styleguide/foundation/shadows/page.tsx`**
- Shadow scale (sm, md, lg) with examples

Each page must show the CSS variable name, the resolved value, and a visual
sample. Use the demo components (Button, Card, Badge, Alert) to demonstrate
tokens in context.

### 11. Establish Playground rules

Set up the Playground area with explicit rules:

- New components from the component skill that are experimental land in
  `/app/bombardier/styleguide/playground/components/`
- New page prototypes from the page skill go to
  `/app/bombardier/styleguide/playground/pages/`
- Playground items are not part of the official design system
- Promotion to official requires review against tokens, accessibility, naming,
  and reuse
- Playground items use the same tokens — they are not exempt

### 12. Validate

Run only the commands the project actually has:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If a dev server is useful, start it and inspect the styleguide at
`/bombardier/styleguide`.

## Directory structure

```
app/
├── globals.css                         # All design tokens (CSS variables)
├── layout.tsx                          # Root layout with font
└── bombardier/
    └── styleguide/
        ├── layout.tsx                  # Sidebar navigation layout
        ├── navigation.ts               # Navigation config
        ├── page.tsx                    # Overview page
        ├── foundation/
        │   ├── colors/page.tsx
        │   ├── typography/page.tsx
        │   ├── spacing/page.tsx
        │   ├── radius/page.tsx
        │   └── shadows/page.tsx
        ├── components/                 # Added by the component skill
        └── playground/
            ├── components/             # Experimental components
            └── pages/                  # Experimental pages

components/
└── ui/                                 # shadcn components (auto-generated)
    ├── button.tsx
    ├── card.tsx
    ├── badge.tsx
    ├── alert.tsx
    └── radio-group.tsx
```

## Output to return

```md
Design system setup complete.

Changed:
- [file path] — what changed

Source:
- Reference: [image / design source / both]
- Fetched from: [source]
- shadcn/ui initialized: yes / already existed
- Tailwind version: [v3 / v4]

Extracted:
- Primary color: [hex and color name]
- Font: [font name]
- Radius style: [e.g., "Rounded 0.5rem", "Sharp", "Pill"]
- Shadow style: [e.g., "Subtle", "Prominent", "None"]
- Dark mode: [yes / no / inferred]
- Overall feel: [e.g., "Modern minimal", "Bold colorful", "Soft friendly"]
- Tokens marked (inferred): [list — for the user to validate]

Styleguide:
- Foundation pages: [count]
- Demo components installed: [list]
- Navigation sections: Foundation, Components, Playground

Validation:
- [command] — passed / failed / not available
```

## Notes

- If colors aren't clearly visible in the image, make reasonable inferences
  using color theory and **flag them as inferred**.
- Generate harmonious color scales (50–900) based on the primary and neutral
  anchors.
- Ensure sufficient contrast for accessibility (4.5:1 for text).
- Chart colors should be visually distinct from each other.
- When in doubt, use shadcn defaults as fallback.
- **Use shadcn MCP** when available to search and install components.
- This is the **only skill that creates tokens** — the component, page, and
  audit skills must use these tokens without adding new ones.
- Prefer semantic tokens (`--primary`, `--muted`) over one-off values.
- Dark mode values should be provided when the reference supports it or the
  project already has dark mode.
