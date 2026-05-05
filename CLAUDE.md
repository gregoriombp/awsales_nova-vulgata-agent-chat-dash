---
description:
alwaysApply: false
---

# CLAUDE.md

Contexto persistente pra agentes de IA (Claude, Cursor, etc) trabalhando nesse repo. Ler antes de começar.

## O que é esse projeto

AwSales — plataforma de agentes de IA para vendas. Construída com o método **Bombardier** (design-as-product). O design system inteiro — tokens, componentes, documentação — vive dentro do repo em `/bombardier/styleguide`. Toda página ou fluxo novo é construído usando essas fundações, garantindo consistência visual e estrutural no produto inteiro.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v3.4 (não v4) — tokens via `tailwind.config.ts` + CSS variables em `globals.css`
- Geist + Geist Mono + Material Symbols Rounded
- Zustand, react-hook-form + zod, recharts, @xyflow/react, dnd-kit, @anthropic-ai/sdk, @google/genai

## Princípios não-negociáveis

1. **Código é o material de design.** Mockup estático só onde código não dá conta. O design rola direto no Cursor.
2. **`/bombardier/styleguide` é a fonte de verdade.** Todo componente que aparece numa página existe primeiro lá.
3. **Tokens são sagrados.** Só o skill de Foundation cria tokens. Todo o resto — componentes, páginas, auditorias — consome o que já existe sem modificar.
4. **Referência = estrutura, tokens = estilo.** Se a referência mostra um botão roxo mas o primary do projeto é azul, o botão é azul. A referência informa anatomia; os tokens informam o visual.
5. **Página reusa, não inventa.** Se precisa de algo novo, vai pro styleguide antes.
6. **Playground primeiro.** Componente gerado por IA ou criado durante construção de página cai no Playground. Promoção pra oficial exige revisão (tokens, acessibilidade, naming, reuso).
7. **Tokens em `globals.css`.** Hex hardcoded em componente é violação. Nunca usar `bg-[#hex]`, `text-[#hex]`, `p-[Npx]` ou valores arbitrários no Tailwind.
8. **shadcn/ui é ferramenta, não autoridade.** Fornece primitivos acessíveis (via Radix), mas os foundations do projeto têm precedência sobre defaults do shadcn.

## Onde está o quê

| Caminho                                             | O que é                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/app/bombardier/styleguide/*`                      | Design system: foundations + componentes registrados                                    |
| `/app/bombardier/styleguide/navigation.ts`          | **Registro oficial** dos componentes do DS. Componente em uso que não tá aqui é dívida. |
| `/app/bombardier/styleguide/foundation/`            | Páginas de tokens: colors, typography, spacing, radius, shadows                         |
| `/app/bombardier/styleguide/components/`            | Showcases de componentes oficiais (revisados)                                           |
| `/app/bombardier/styleguide/playground/components/` | Componentes experimentais / não revisados                                               |
| `/app/bombardier/styleguide/playground/pages/`      | Protótipos de páginas experimentais                                                     |
| `/components/ui/*`                                  | Primitivos shadcn (auto-gerados)                                                        |
| `/components/*`                                     | Componentes legados raiz (Button, Input, etc) — migram pra `ui/` aos poucos             |
| `/app/[feature]/page.tsx`                           | Telas de produto                                                                        |
| `/app/api/*`                                        | Endpoints                                                                               |
| `/app/globals.css`                                  | 10 paletas primitivas + semantic tokens + dark shell tokens + radius/spacing/motion     |
| `/tailwind.config.ts`                               | Bindings dos tokens                                                                     |
| `/public/assets/integrations/Logotipo/*`            | Logos das integrações, categorizadas (Agenda, Ações, Checkout, etc)                     |

## Convenções

- **Tokens semânticos via CSS variables:** `var(--bg-canvas)`, `var(--fg-primary)`, `var(--accent-brand)`, etc. Lista completa no styleguide.
- **Dark shell ≠ dark mode.** `--dark-*` descrevem o chrome permanente da sidebar; não flipam com o tema.
- **AI gradient:** blue → purple → teal, azul sempre na origem.
- **Comentário de fluxo:** cada `page.tsx` que tem flow desenhado em FigJam carrega `// Flow: <url>` como primeira linha não-import.
- **Tipografia:** Geist (uma voz só) + Geist Mono (apenas pra código, tokens, IDs). Material Symbols Rounded é o icon system.
- **`cn()` pra merge de classes.** Todo componente aceita `className` prop e usa `cn()` do `@/lib/utils`.
- **Prefixo `Aw` é obrigatório para todo componente novo do DS.** Toda criação de componente usado no produto OU no styleguide segue:
  - **Nome do arquivo:** `Aw[Nome].tsx` (PascalCase). Exemplo: `AwButton.tsx`, `AwCard.tsx`, `AwIntegrationCard.tsx`.
  - **Nome do export:** `export function Aw[Nome](...)` ou `export const Aw[Nome] = React.forwardRef(...)`. Sem default exports.
  - **Localização:** `/components/ui/Aw[Nome].tsx`. Não criar componente novo na raiz `/components/` (zona legada em migração).
  - **Showcase:** `/app/bombardier/styleguide/components/aw-[nome]/page.tsx` (kebab-case na URL) e entrada correspondente em `navigation.ts`.
  - **Componente experimental:** mesmo nome `Aw[Nome].tsx`, mas em `/app/bombardier/styleguide/playground/components/aw-[nome]/` até promoção.
  - **Único caso sem prefixo:** componentes do Canvas Builder gerados via `bombardier-generate` em `/components/playground/` que NÃO viram parte do DS oficial — esses são quarentena pura, nome PascalCase sem `Aw`.

- **`Aw[Nome]` é wrapper de shadcn primitive — não construir do zero.** Toda criação de componente novo do DS segue:
  1. **Verifica shadcn primitive correspondente** via MCP (`search_items_in_registries`, `view_items_in_registries`).
  2. **Instala** o primitivo: `npx shadcn@latest add [nome]`. Vai parar em `components/ui/[nome].tsx` (lowercase, gerado pelo CLI).
  3. **Cria `components/ui/Aw[Nome].tsx`** — wrapper que importa o primitivo, aplica tokens do DS, adiciona variantes da marca AwSales (cores, sizes, intents, ai-gradient, ícone via Icon, etc.).
  4. Páginas e features importam **apenas o `Aw[Nome]`**. Nunca o primitivo direto, exceto enquanto o `Aw*` ainda não existe.
  5. Showcase em `app/bombardier/styleguide/components/aw-[nome]/page.tsx` + entrada em `navigation.ts`.

- **Estado atual: shadcn ainda não está instalado.** O repo está em débito. `components/ui/Aw*` foi construído antes da decisão de adotar shadcn, então cada `AwButton`/`AwCard`/etc. é hoje hand-rolled sobre Tailwind direto. **Plano de correção:** instalar shadcn (`npx shadcn@latest init`), instalar primitivos faltantes, e migrar cada `Aw*` existente para virar wrapper do primitivo correspondente. Componentes novos a partir de agora **já entram no padrão correto** (primitivo + wrapper Aw).

- **Migrando componente legado da raiz.** `components/Button.tsx`, `components/Input.tsx`, `components/KPICard.tsx`, etc. são **pré-Bombardier**, hardcoded, sem prefixo. Quando precisar evoluir um deles:
  1. Garante que o shadcn primitive correspondente está instalado em `components/ui/[nome].tsx`.
  2. Cria `components/ui/Aw[Nome].tsx` como wrapper desse primitivo, replicando funcionalidade do legado + tokens atuais + ícones via `Icon`.
  3. Migra imports nas páginas progressivamente (`components/Button` → `components/ui/AwButton`).
  4. Quando ninguém mais importa do legado, deleta o arquivo da raiz.
  5. Cria showcase + registra em `navigation.ts`.
- **TypeScript sempre tipado:** props com interface, variantes explícitas (sem magic strings), `ref` forwarding quando wrapa nativo ou Radix.

## Sistema de Prompts / Skills Bombardier

O Bombardier é alimentado por 4 prompts que funcionam como skills de agente:

| Prompt               | Propósito                                                                                | Cria tokens?                |
| -------------------- | ---------------------------------------------------------------------------------------- | --------------------------- |
| **1 — Foundation**   | Extrai tokens de referência visual, inicializa shadcn/ui, cria a estrutura do styleguide | Sim (único que faz)         |
| **2 — Component**    | Adiciona componente ao DS com showcase e registro no navigation                          | Não — usa tokens existentes |
| **3 — Page**         | Constrói página a partir de referência usando componentes e tokens existentes            | Não — usa tokens existentes |
| **4 — Audit & Sync** | Verifica consistência entre tokens, componentes, showcases, navigation e páginas         | Não — reporta gaps          |

### Fluxo
