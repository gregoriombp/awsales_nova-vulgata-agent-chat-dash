# CLAUDE.md

Contexto persistente pra agentes de IA (Claude, Cursor, etc) trabalhando nesse repo. Ler antes de começar.

## O que é esse projeto

AwSales — plataforma de agentes de IA para vendas. Construída com o método **Bombardier** (design-as-product). Manual canônico em `~/Desktop/Projects/Working/Bombardier Skills/Bombardier — Manual.md`. Quando você precisar de contexto sobre o método em si, lê esse arquivo.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v3.4 (não v4) — tokens via `tailwind.config.ts` + CSS variables em `globals.css`
- Geist + Geist Mono + Material Symbols Rounded
- Zustand, react-hook-form + zod, recharts, @xyflow/react, dnd-kit, @anthropic-ai/sdk, @google/genai

## Princípios não-negociáveis

1. **Código é o material de design.** Mockup estático só onde código não dá conta. O design rola direto no Cursor.
2. **`/bombardier/styleguide` é a fonte de verdade.** Todo componente que aparece numa página existe primeiro lá.
3. **Página reusa, não inventa.** Se precisa de algo novo, vai pro styleguide antes.
4. **Tokens em `globals.css`.** Hex hardcoded em componente é violação.
5. **Fluxo vai pra FigJam, não pra código.** Navegação, branches, decisões ficam em FigJam dedicado por feature. O código só executa.

## Onde está o quê

- `/app/bombardier/styleguide/*` — design system: foundations + componentes registrados
- `/app/bombardier/styleguide/navigation.ts` — **registro oficial** dos componentes do DS. Componente que tá em uso e não tá aqui é dívida.
- `/app/bombardier/styleguide/components/playground` — componentes propostos / experimentais
- `/components/ui/*` — primitivos novos (em construção)
- `/components/*` — componentes legados raiz (Button, Input, etc) — migram pra `ui/` aos poucos
- `/app/[feature]/page.tsx` — telas de produto
- `/app/api/*` — endpoints
- `/app/globals.css` — 10 paletas primitivas + semantic tokens + dark shell tokens + radius/spacing/motion
- `/tailwind.config.ts` — bindings dos tokens
- `/public/assets/integrations/Logotipo/*` — logos das integrações, já categorizadas (Agenda, Ações, Checkout, etc)

## Convenções

- **Tokens semânticos via CSS variables:** `var(--bg-canvas)`, `var(--fg-primary)`, `var(--accent-brand)`, etc. Lista completa no styleguide.
- **Dark shell ≠ dark mode.** `--dark-*` descrevem o chrome permanente da sidebar; não flipam com o tema.
- **AI gradient:** blue → purple → teal, azul sempre na origem.
- **Comentário de fluxo:** cada `page.tsx` que tem flow desenhado em FigJam carrega `// Flow: <url>` como primeira linha não-import.
- **Tipografia:** Geist (uma voz só) + Geist Mono (apenas pra código, tokens, IDs). Material Symbols Rounded é o icon system.

## Workflow Bombardier

| Quero... | Skill |
|---|---|
| Implementar uma tela | `bombardier-page` |
| Adicionar componente | `bombardier-component` |
| Desenhar fluxo de uma feature | `bombardier-flow` |
| Auditar gaps código vs styleguide | `bombardier-audit` |
| Importar handoff Claude Design | `bombardier-handoff` |

## O que NÃO fazer

- Não criar `/styleguide` ou `/app/styleguide` paralelo. A rota canônica é `/bombardier/styleguide`.
- Não duplicar telas em mockup pra mostrar estados. Estados vivem no playground do componente.
- Não inventar componente novo direto numa `page.tsx`. Passa pelo styleguide primeiro.
- Não usar hex hardcoded em componente. Sempre via token.
- Não importar `Button.tsx` da raiz se já existir o equivalente em `components/ui/`. (Migração em curso.)
- Não rodar `npm run build` ou `npm run dev` em background sem autorização explícita do Greg.

## Servidor local

- `npm run dev` — localhost:3000
- `npm run dev:lan` — acessível na rede local (DEV_LAN=1, host 0.0.0.0). É como os devs acompanham o que tá sendo construído ao vivo.

## Histórico de decisões

Antes de começar uma sessão de trabalho, da uma olhada no [`CHANGELOG.md`](./CHANGELOG.md). Ele registra mudanças de arquitetura, drift corrigido e decisões não-óbvias. Não é release notes — é a memória do repo.
