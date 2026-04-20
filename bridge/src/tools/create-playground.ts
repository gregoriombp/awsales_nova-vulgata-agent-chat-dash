import fs from "node:fs"
import path from "node:path"
import { tool } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"

const repoRoot = () => path.resolve(process.cwd(), "..")
const playgroundDir = () => path.join(repoRoot(), "components", "playground")

const NAME_RE = /^[A-Z][A-Za-z0-9]{1,48}$/

export const createPlaygroundTool = tool(
  "create_playground_component",
  "Create a NEW React component file under components/playground/ when neither match_aw nor search_shadcn surfaces a fitting option. The component goes into the Playground, requires manual approval before entering the main design system. The file must be self-contained TSX using Tailwind + CSS variables (--fg-*, --bg-*, --aw-*, etc).",
  {
    name: z
      .string()
      .describe(
        "PascalCase component name (2-48 chars, alphanumeric). Do NOT prefix with Aw — reserved for approved DS components."
      ),
    description: z
      .string()
      .describe("One-line description of what the component does."),
    tsx: z
      .string()
      .describe(
        "Full .tsx file content. Must `export function <Name>(...)` and optionally `export type <Name>Props = ...`. Use design system tokens (var(--*)). No external deps beyond react, @/components/ui/* and Tailwind classes."
      ),
    sourcePrompt: z
      .string()
      .optional()
      .describe(
        "Snippet of the user's original request that led to this component (for audit trail)."
      ),
  },
  async ({ name, description, tsx, sourcePrompt }) => {
    if (!NAME_RE.test(name)) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Nome inválido: "${name}". Deve ser PascalCase alfanumérico 2-48 chars, sem prefixo Aw.`,
          },
        ],
        isError: true,
      }
    }

    if (name.startsWith("Aw")) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Não use o prefixo "Aw" — ele é reservado para componentes já aprovados no DS. Use um nome descritivo (ex: "HeroSplit", "PricingTable").`,
          },
        ],
        isError: true,
      }
    }

    if (tsx.length > 16_000) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Arquivo muito grande (> 16KB). Divida em componentes menores.",
          },
        ],
        isError: true,
      }
    }

    const dir = playgroundDir()
    const filePath = path.join(dir, `${name}.tsx`)
    const metaPath = path.join(dir, `${name}.meta.json`)

    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(dir + path.sep)) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Tentativa de escrever fora de components/playground/ — bloqueado.",
          },
        ],
        isError: true,
      }
    }

    const exists = fs.existsSync(filePath)

    try {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(filePath, tsx, "utf8")
      fs.writeFileSync(
        metaPath,
        JSON.stringify(
          {
            name,
            description,
            sourcePrompt: sourcePrompt ?? null,
            createdAt: new Date().toISOString(),
            approval: "pending",
            overwrote: exists,
          },
          null,
          2
        ),
        "utf8"
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        content: [
          { type: "text" as const, text: `Erro ao salvar: ${msg}` },
        ],
        isError: true,
      }
    }

    const relFile = path.relative(repoRoot(), filePath)

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              ok: true,
              path: relFile,
              overwrote: exists,
              approval: "pending",
              hint: "Componente criado. NÃO use o tipo no JSON ainda — ele ficará no Playground até aprovação manual. Informe o usuário no texto da resposta que esse novo componente foi proposto.",
            },
            null,
            2
          ),
        },
      ],
    }
  }
)
