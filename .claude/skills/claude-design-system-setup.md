---
name: claude-design-system-setup
description: Use when the user wants to bootstrap a complete design system from a Claude Design reference (.zip file, Figma export, design spec, or similar). Extracts design tokens (colors, typography, spacing, radius, shadows), initializes shadcn, writes globals.css with full token set, installs demo components, and scaffolds /styleguide with sidebar navigation. Trigger phrases include "set up design system", "implement Claude design system", "create styleguide from this file", "bootstrap design tokens", or when the user provides a design system .zip / reference file and asks to implement it.
---

# Claude Design System Setup

Analyze a Design System reference provided by the user, extract design tokens and components, and set up a complete design system + styleguide based on that reference.

## Input

Expect the user to provide a path to the design system reference (commonly a `.zip` file, Figma export folder, or design spec). If no path is given, ask:

> "Please share the path to the design system reference file (.zip, Figma export, or spec)."

Do not proceed without a concrete reference.

## Operating Rules

- **Never invent tokens.** Extract every value from the provided reference. If something is missing or ambiguous, ask the user before proceeding.
- **Never install a shadcn component without explicit user confirmation.**
- **Never overwrite `app/globals.css` without showing the diff first** and getting confirmation.
- **Confirm at each major checkpoint** (after extraction, before init, before file writes, before component installs).
- At the end, start the dev server and verify `/styleguide` renders correctly. If you cannot test the UI, say so explicitly.

## Workflow

### 1. Analyze the Reference

Open and inspect the reference. Identify and infer:

**Colors**
- Primary / brand color → generate full scale (50–900 or extended)
- Neutral / grey → generate full scale (50–900 or extended)
- Semantic: success, error, warning, info
- Background and surface colors
- Border colors
- Any other color present in the reference

**Typography**
- Font family (sans-serif, serif, monospace, display)
- Heading sizes and weights
- Body text sizes
- Line heights, letter spacing, any other typographic detail

**Spacing & Radius**
- Spacing rhythm (tight / normal / relaxed)
- Border radius scale (sharp / rounded / pill)

**Shadows**
- Shadow scale, if present (none / subtle / prominent)

**Anything else** — capture every aspect of the design system, not only what's listed above.

**Checkpoint:** present the extracted tokens to the user as a summary before continuing.

### 2. Initialize shadcn

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral (will be overridden by extracted tokens)
- CSS variables: Yes

### 3. Generate and Apply `globals.css`

Replace `/app/globals.css` with the extracted tokens. Use this template, filling every `[bracketed]` value from the extracted set:

```css
@import "tailwindcss";

:root {
  /* === BASE === */
  --background: [extracted page background];
  --foreground: [extracted text color];

  /* === CARD === */
  --card: [extracted card background];
  --card-foreground: [extracted card text];

  /* === POPOVER / DROPDOWN / TOOLTIP === */
  --popover: [same as card or white];
  --popover-foreground: [same as card-foreground];

  /* === PRIMARY === */
  --primary: [extracted primary color];
  --primary-foreground: [white or dark based on contrast];

  /* === SECONDARY === */
  --secondary: [light grey or muted version];
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

  /* === CUSTOM SEMANTIC === */
  --success: [green];
  --success-foreground: [white];
  --warning: [yellow/orange];
  --warning-foreground: [dark for contrast];
  --info: [blue];
  --info-foreground: [white];
}

.dark {
  /* Inverted values for dark mode — extract from reference if dark mode is provided, otherwise derive */
  --background: [dark background];
  --foreground: [light text];
  /* ... all other variables for dark mode */
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

**Checkpoint:** show the diff to the user before writing.

### 4. Install Recommended Font

If a Google Font matches the reference, add it to `/app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google'  // or recommended font

const font = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  )
}
```

If the reference specifies a non-Google font, ask the user how to source it before editing.

### 5. Install Demo Components

First, check the reference for existing components and use them for the styleguide demos.

**Only if the reference has no usable components**, fall back to step 5.1.

#### 5.1 Fallback: install demo components from shadcn

Confirm with the user before running, then:

```bash
npx shadcn@latest add button card badge alert radio-group
```

### 6. Create Styleguide Navigation Config

Create `/app/styleguide/navigation.ts`:

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
      { name: "Design Tokens", href: "/styleguide" },
    ]
  },
  {
    title: "Components",
    items: [
      // Components will be added here later
    ]
  }
]
```

### 7. Create Styleguide Layout with Sidebar

Create `/app/styleguide/layout.tsx`:

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
        <div>
          <Link href="/styleguide" className="text-xl font-bold">
            Design System
          </Link>
        </div>

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

      <main className="flex-1 ml-64 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

### 8. Create Styleguide Page

Create `/app/styleguide/page.tsx` displaying ALL design tokens on one page:

- **Color palette** — every color as a swatch with CSS variable name
- **Primary scale** — 50–900
- **Grey scale** — 50–900
- **Semantic colors** — success, warning, error, info
- **Typography** — heading and body samples
- **Border radius** — example of each size
- **Shadows** — every shadow level
- **Components** — button, card, badge, alert, radio-group using the tokens
- **Dark mode toggle** — preview both themes

Include any additional tokens that exist in the reference even if not listed above.

### 9. Verify

Start the dev server and open `/styleguide` in the browser. Check:
- Tokens render correctly
- Sidebar navigation works
- Dark mode toggle works
- No console errors
- Components reflect extracted tokens, not shadcn defaults

If you cannot test the UI in a browser, say so explicitly — do not claim success based only on type checks.

## Directory Structure (final state)

```
app/
└── styleguide/
    ├── layout.tsx           # Sidebar layout
    ├── navigation.ts        # Nav config (extended later)
    ├── page.tsx             # All design tokens
    └── components/
        └── [name]/
            └── page.tsx     # Per-component pages (added later)
```

## Output

- shadcn initialized
- `/app/globals.css` with the complete extracted token set
- Font installed in `layout.tsx`
- Demo components installed (from reference, or shadcn fallback)
- Styleguide scaffolded:
  - `/app/styleguide/layout.tsx`
  - `/app/styleguide/navigation.ts`
  - `/app/styleguide/page.tsx`

## Design Summary

After setup, summarize for the user:

- **Primary color:** [hex + name]
- **Font:** [font name]
- **Style:** [e.g. "Modern minimal", "Bold colorful", "Soft friendly"]
- **Border radius:** [e.g. "Rounded 8px", "Sharp", "Pill"]
- **Overall feel:** [brief description]

## Reminders

- If anything is unclear, ask before proceeding.
- Never use a shadcn component or token without explicit user confirmation.
- When uncertain, do not extract from shadcn — ask the user first.
