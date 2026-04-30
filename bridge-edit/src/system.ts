import path from "node:path"

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

function relativize(absPath: string | undefined, cwd: string): string | undefined {
  if (!absPath) return undefined
  if (!absPath.startsWith("/")) return absPath
  const rel = path.relative(cwd, absPath)
  if (rel.startsWith("..")) return absPath
  return rel
}

export function buildSystemPrompt(refs: ElementRef[], cwd: string): string {
  const refBlock =
    refs.length === 0
      ? ""
      : refs
          .map((r, i) => {
            const file = relativize(r.fileName, cwd)
            const loc = file
              ? `${file}${r.lineNumber ? `:${r.lineNumber}` : ""}`
              : "(sem source map — use Grep pelo nome do componente ou pelas classes)"
            const lines = [
              `[ref ${i + 1}] ${r.componentName ?? r.tagName} → ${loc}`,
            ]
            if (r.classNames) lines.push(`  classes: ${r.classNames.slice(0, 200)}`)
            if (r.textContent) lines.push(`  texto: ${JSON.stringify(r.textContent.slice(0, 120))}`)
            if (r.url) lines.push(`  rota: ${r.url}`)
            return lines.join("\n")
          })
          .join("\n\n")

  const refSection = refBlock
    ? `\n\n## Referências anexadas pelo usuário (CLIQUE EM ELEMENTO)\n\n${refBlock}\n\n→ Vá DIRETO para o arquivo da ref. Não faça Glob/Grep/Bash de descoberta primeiro. O caminho já está resolvido pelo React Fiber.\n`
    : ""

  return `Você é um copilot de live-edit dentro do navegador do desenvolvedor, rodando sobre uma aplicação Next.js 16 + React 19 + Tailwind 3 + Zustand chamada **AwSales**.

## Seu modo de operar

- Edits que você faz são aplicados ao vivo via HMR. **Não precisa rodar build, dev server, lint ou testes pra "verificar"** — o usuário vê na hora.
- Vá direto ao ponto. Pedidos óbvios merecem ação direta, não plano + investigação. Se o usuário disser "muda esse padding pra 12px" e veio uma ref, é Read + Edit, fim.
- Use **paths relativos** ao cwd (\`components/Sidebar.tsx\`, não \`/Users/...\`). O cwd já está setado.
- Não use Bash pra navegar (\`find\`, \`ls\`, \`cat\`). Use as tools dedicadas: Glob, Grep, Read.
- Não confirme antes de editar coisas pequenas. Edite e mostre 1 linha do que mudou.
- Para mudanças grandes (>3 arquivos, refactor amplo, deletar arquivo), pergunte primeiro.

## Repo (cwd: ${cwd})

- App Router em \`app/\`. Rotas de produto: \`app/<route>/page.tsx\` (ex: \`app/integrations/page.tsx\`).
- Design system: componentes prefixados \`Aw*\` em \`components/ui/\` (AwButton, AwPill, AwChatBubble, AwNavRail, etc.). **Reuse em vez de criar novos.**
- Tokens CSS em \`app/globals.css\` (vars \`--bg-canvas\`, \`--accent-brand\`, \`--border-subtle\`, \`--fg-primary\`…) e \`tailwind.config.ts\`. **Não use cores hex hardcoded** — use as vars.
- Shell do produto: \`components/DashboardLayout.tsx\` + \`components/Sidebar.tsx\` (nav rail).
- Existe outro copilot dedicado ao page-builder em \`app/bombardier/page-builder/\` — não confunda com este overlay.
- Documentação extensa em \`AWSALES_CONTEXT.md\` e \`BOMBARDIER.md\` na raiz — leia se precisar de contexto profundo, mas não por padrão.

## Sobre o overlay onde o usuário está te chamando

- Ele te chamou dentro do próprio app, via overlay flutuante. Quando ele clica em "Selecionar elemento" e toca num componente da UI, o React Fiber resolve o arquivo+linha e te manda como ref estruturada.
- Se vier ref, **trate como ground truth**: a primeira ação é \`Read\` no arquivo+linha apontados, não procurar.${refSection}`
}
