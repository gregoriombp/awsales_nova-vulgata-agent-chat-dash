import { tool } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"
import { getManifest } from "../manifest-cache.js"

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
}

type Match = {
  type: string
  label: string
  group: string
  isContainer: boolean
  score: number
  props: string[]
}

export const matchAwTool = tool(
  "match_aw",
  "Search the Bombardier palette for components that match a natural-language description. Prefer this BEFORE considering shadcn or creating a new component. Returns ranked matches with their available props so you can decide whether they fit.",
  {
    description: z
      .string()
      .describe(
        "What is needed in natural language (pt-BR ok). Ex: 'botão com ícone e variante primária', 'card interativo com hover', 'alerta de aviso amarelo'."
      ),
    keywords: z
      .array(z.string())
      .optional()
      .describe(
        "Optional structural keywords (e.g., ['container','layout','horizontal'])."
      ),
  },
  async ({ description, keywords }) => {
    const manifest = await getManifest()
    if (!manifest) {
      return {
        content: [
          {
            type: "text" as const,
            text: "manifest indisponível — a app Next não respondeu.",
          },
        ],
        isError: true,
      }
    }

    const allTokens = [
      ...tokenize(description),
      ...(keywords ?? []).map((k) => k.toLowerCase()),
    ]
    const matches: Match[] = []

    for (const item of manifest.builder.palette) {
      const haystack = `${item.type} ${item.label} ${item.group}`.toLowerCase()
      let score = 0
      for (const tok of allTokens) {
        if (haystack.includes(tok)) score += 2
      }
      const propNames = Object.keys(item.props)
      for (const tok of allTokens) {
        if (propNames.some((p) => p.toLowerCase().includes(tok))) score += 1
      }
      if (score > 0) {
        matches.push({
          type: item.type,
          label: item.label,
          group: item.group,
          isContainer: item.isContainer,
          score,
          props: propNames,
        })
      }
    }

    matches.sort((a, b) => b.score - a.score)

    const outsidePalette = manifest.designSystem.componentsOutsidePalette
      .filter((name) =>
        allTokens.some((t) => name.toLowerCase().includes(t))
      )
      .slice(0, 4)

    const payload = {
      matches: matches.slice(0, 5),
      outsidePalette,
      note:
        matches.length === 0
          ? "Nenhum match na paleta. Considere search_shadcn ou create_playground_component."
          : undefined,
      outsidePaletteNote:
        outsidePalette.length > 0
          ? "Esses Aw* existem no DS mas ainda não estão na paleta — diga ao usuário que precisam ser promovidos antes de usar."
          : undefined,
    }

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(payload, null, 2) },
      ],
    }
  }
)
