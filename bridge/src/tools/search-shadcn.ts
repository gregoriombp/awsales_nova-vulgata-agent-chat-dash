import { tool } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"

const SHADCN_INDEX_URL = "https://ui.shadcn.com/r/index.json"

type ShadcnItem = {
  name: string
  type?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
}

let cached: ShadcnItem[] | null = null
let cacheAt = 0
const TTL_MS = 5 * 60_000

async function loadIndex(): Promise<ShadcnItem[] | null> {
  if (cached && Date.now() - cacheAt < TTL_MS) return cached
  try {
    const res = await fetch(SHADCN_INDEX_URL, {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return cached
    const data: unknown = await res.json()
    const items = Array.isArray(data)
      ? (data as ShadcnItem[])
      : data &&
        typeof data === "object" &&
        "items" in data &&
        Array.isArray((data as { items: unknown }).items)
      ? ((data as { items: ShadcnItem[] }).items)
      : []
    cached = items
    cacheAt = Date.now()
    return items
  } catch {
    return cached
  }
}

export const searchShadcnTool = tool(
  "search_shadcn",
  "Search the public shadcn/ui component registry (https://ui.shadcn.com) when Bombardier's palette has no fitting component. Returns up to 8 matches with install commands. Only use this AFTER calling match_aw and confirming no local match.",
  {
    query: z.string().describe("Free-text query, e.g., 'data table sortable', 'date picker', 'command palette'."),
    limit: z.number().int().min(1).max(20).optional(),
  },
  async ({ query, limit = 8 }) => {
    const items = await loadIndex()
    if (!items || items.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "shadcn registry indisponível (offline ou formato inesperado). Considere create_playground_component.",
          },
        ],
      }
    }
    const q = query.toLowerCase()
    const matches = items
      .filter((it) => {
        const name = (it.name ?? "").toLowerCase()
        const desc = (it.description ?? "").toLowerCase()
        return name.includes(q) || desc.includes(q)
      })
      .slice(0, limit)
      .map((it) => ({
        name: it.name,
        type: it.type,
        description: it.description,
        install: `npx shadcn@latest add ${it.name}`,
      }))

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              query,
              count: matches.length,
              matches,
              note:
                matches.length === 0
                  ? "Nada encontrado na shadcn — considere criar no playground."
                  : "Se algum encaixar, mencione o install command ao usuário. Componentes shadcn NÃO entram automaticamente no projeto — o designer precisa rodar o comando.",
            },
            null,
            2
          ),
        },
      ],
    }
  }
)
