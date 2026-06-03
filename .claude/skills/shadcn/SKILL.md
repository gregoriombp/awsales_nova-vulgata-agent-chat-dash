---
name: shadcn
description: Support skill for consulting the shadcn/ui registry, docs, and CLI when adding or wrapping primitives. Use when looking up a shadcn component, its API, variants, or install command before building an Aw* wrapper. This skill only SOURCES primitives — the AwSales repo conventions (Aw* prefix + wrapper, existing tokens, Material Symbols icons) always override generic shadcn guidance.
---

# shadcn (support skill)

You were invoked to consult shadcn/ui — its registry, component docs, examples, or CLI — usually as step 1 of adding or wrapping a primitive. This is a **support skill**: it sources primitives and guidance, but **every AwSales rule in `AGENTS.md` wins** when they conflict.

## Non-negotiable overrides (from AGENTS.md)

- **Wrap, don't expose.** A shadcn primitive lands at `components/ui/[name].tsx` (lowercase, CLI-generated). The DS component is `components/ui/Aw[Name].tsx`, which imports it. Pages/features import **only `Aw[Name]`**, never the raw primitive.
- **Tokens are sacred.** Never add new tokens. Use existing token classes/vars (`bg-primary`, `var(--accent-brand)`, …). No arbitrary `bg-[#hex]` / `p-[Npx]`. If a token is missing, report it — don't invent it.
- **Tailwind v3.** Ignore any shadcn/v4 instruction to emit `@theme inline` or `@import "tailwindcss"`. Tokens live in `tailwind.config.ts theme.extend` + `:root` CSS vars.
- **Icons.** Material Symbols Rounded via `components/ui/Icon.tsx` is the default. Don't pull `lucide-react` into product code (it only ships inside CLI-generated primitives).

## Flow

1. **Look up** the primitive via the shadcn MCP (`search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`) — server `shadcn` in `.mcp.json`.
2. **Install** with `npx shadcn@latest add [name]` → primitive at `components/ui/[name].tsx`.
3. **Wrap** in `components/ui/Aw[Name].tsx` (tokens + brand variants + `Icon` slot).
4. **Showcase** at `app/bombardier/styleguide/components/aw-[name]/page.tsx` + register in `navigation.ts`.

## Routing

For DS work prefer the local `bombardier-*` skills (`bombardier-new-component`, `bombardier-new-page`). Use this `shadcn` skill only to consult the registry/CLI — it does not place files for you.

> **Note — consolidated minimal version.** The fuller upstream shadcn skill (deep rules: base-vs-radix, composition, forms, icons, styling) lives in the local `.agents/skills/shadcn/` cache (gitignored). Copy those rule files in here if you want the expanded guidance versioned in the repo.
