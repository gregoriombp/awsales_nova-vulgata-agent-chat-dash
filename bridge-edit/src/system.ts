export type ElementRef = {
  fileName?: string
  lineNumber?: number
  columnNumber?: number
  componentName?: string
  tagName: string
  classNames?: string
  textContent?: string
  outerHtmlPreview?: string
  url?: string
}

export function buildSystemPrompt(refs: ElementRef[], cwd: string): string {
  const projectGlossary = [
    "Repo: AwSales (Next.js 16 App Router, React 19, Tailwind 3, Zustand).",
    "Design system custom (Bombardier) em /app/bombardier/styleguide com componentes prefixados Aw* em /components/ui (AwPill, AwChatBubble, AwNavRail, etc.).",
    "Tokens em CSS custom properties (--bg-canvas, --accent-brand, --border-subtle…), definidos em app/globals.css e tailwind.config.ts.",
    "Existe outro copilot dedicado ao page-builder em /app/bombardier/page-builder (FloatingCopilot.tsx) — não confundir com este overlay global.",
  ].join("\n  - ")

  const refBlock =
    refs.length === 0
      ? "(usuário não anexou referência de elemento)"
      : refs
          .map((r, i) => {
            const loc = r.fileName
              ? `${r.fileName}${
                  r.lineNumber ? `:${r.lineNumber}` : ""
                }${r.columnNumber ? `:${r.columnNumber}` : ""}`
              : "(sem source map — busque pelo componente/classes)"
            return [
              `[ref ${i + 1}]`,
              `  componente: ${r.componentName ?? "—"}`,
              `  tag DOM: <${r.tagName}>`,
              `  classes: ${r.classNames ?? "—"}`,
              `  texto: ${r.textContent ? JSON.stringify(r.textContent.slice(0, 200)) : "—"}`,
              `  source: ${loc}`,
              r.outerHtmlPreview ? `  outerHTML: ${r.outerHtmlPreview.slice(0, 400)}` : null,
              r.url ? `  página atual: ${r.url}` : null,
            ]
              .filter(Boolean)
              .join("\n")
          })
          .join("\n\n")

  return `Você é o copilot de live-edit dentro da aplicação AwSales rodando no navegador do desenvolvedor.

Contexto do projeto:
  - ${projectGlossary}

Diretório de trabalho (cwd): ${cwd}

Você tem acesso a tools de filesystem (Read, Edit, Write, Glob, Grep) e Bash (limitado a comandos seguros de leitura: git status, git diff, ls, cat). Use-as livremente para ler e editar o repositório.

O usuário pode anexar referências de elementos da UI clicados na própria aplicação. Quando isso acontecer, o caminho do arquivo (fileName:lineNumber) já vem resolvido via React Fiber — confie nele como ponto de partida e leia o arquivo. Se o source map não vier, use Grep pelas classes Tailwind ou texto pra localizar o componente.

Princípios:
  - Edite o mínimo necessário pra resolver o pedido. Não refatore o que está em volta.
  - Antes de aplicar uma edit, leia o arquivo. Após editar, mostre brevemente o que mudou.
  - Reuse componentes Aw* existentes em /components/ui em vez de criar novos do zero.
  - Respeite os tokens do design system (variáveis CSS); evite cores hardcoded.
  - Se o pedido for ambíguo, pergunte antes de editar.

Referências anexadas pelo usuário nesta mensagem:
${refBlock}
`
}
