# AwSales

Plataforma de agentes de IA para vendas, atendimento e CX para empresas Enterprise.. Construída com o método **Bombardier** (design-as-product) — design system, telas e fluxos compõem um produto único, prototipado direto em código.

## Stack

- **Next.js 16 + React 19 + TypeScript**
- **Tailwind CSS v4** — tokens em `@theme` + CSS variables em `app/globals.css` (sem `tailwind.config.ts`)
- **Geist + Geist Mono + Material Symbols Rounded**
- **Estado:** Zustand
- **Forms:** react-hook-form + zod
- **Charts:** recharts
- **Graphs / Flow:** @xyflow/react
- **AI SDK:** @google/genai

## Como rodar

```bash
npm install
npm run dev          # 127.0.0.1:3000 + review-bridge local em 127.0.0.1:9878
```

## Design system

Toda a documentação de tokens, foundations, patterns e componentes vive em `/bombardier/styleguide`. Sobe o servidor e abre [http://127.0.0.1:3000/bombardier/styleguide](http://127.0.0.1:3000/bombardier/styleguide).

Foundations: Design Tokens, Iconografia, Logos, Animação, Acessibilidade, Escrita, Padrões de UI.
Componentes: catálogo vivo em [`app/bombardier/styleguide/navigation.ts`](app/bombardier/styleguide/navigation.ts) — a contagem muda a cada componente novo, então não fixamos número aqui (abra a sidebar do styleguide para o inventário atual). Entre eles `integration-catalog`, `integration-card`, `connect-modal`, `whatsapp-panel`, `chrome`, `nav-rail`, `nav-list`, `template-builder-sheet`, `chat`, `pills`, `toast`.

## Review Mode

Overlay de comentários (free-draw + pin) **sempre montado**. Ligue/desligue o modo de
comentar pela **bolota do Bombardier** (canto inferior direito) ou `Cmd+Shift+Y` — não
precisa de env flag. `npm run dev` prepara `.env.local`, sobe o `review-bridge` local
em `127.0.0.1:9878` e faz o overlay usar essa fila para agentes locais. Sem bridge,
o fallback é `localStorage`.

## Estrutura

```
app/
├── bombardier/styleguide/    # Design system: foundations + componentes Aw* registrados (ver navigation.ts)
├── api/copilot/              # Endpoints do copilot
├── agent-studio/[id]/        # Studio de agentes
├── aops/                     # AOPs
├── conversations/[id]/       # Conversas
├── dashboard/                # Dashboard
├── triggers/                 # Triggers
├── tools/                    # Tools
├── insights/                 # Insights
├── history/                  # Histórico
├── approvals/                # Aprovações
├── inicio/                   # Home logada
├── playground/               # (Coming Soon — não confundir com /bombardier/styleguide)
├── globals.css               # Tokens (10 paletas + semantic + dark shell + radius/spacing/motion)
├── layout.tsx                # Root layout (carrega Geist + Geist Mono + Material Symbols)
└── page.tsx                  # AuthFlow (login)

components/
├── ui/                       # Componentes Aw* do design system + primitivos shadcn lowercase
├── modals/                   # Modais legados (BaseModal + família) — migram pra AwModal
├── integrations/             # Painéis de canal (Aw*Panel) + template builder
├── bombardier-review/        # Review Mode (overlay de comentários)
├── bombardier/               # BombardierDot (bolota de atalhos + toggle de review)
├── auth/  memory-base/       # Feature modules — fora do escopo do DS Aw*
└── *.tsx                     # Legados na raiz (ComingSoon, NotificationRow, etc.) — migram pra ui/

lib/
├── hooks/                    # useGlobalHotkey, useTableSort, use-toast
└── bombardier-review/        # Store + storage do Review Mode

public/assets/integrations/   # Logos das integrações, categorizadas (Agenda, Ações, Checkout, etc.)
review-bridge/                # Local comment queue for agents (port 9878)
flow-bridge/                  # Local data directory for UX Flow suggestions
```

## Como agentes de IA trabalham nesse repo

Ver [`CLAUDE.md`](./CLAUDE.md).

## Decision History

Use `git log` for change history. This repo has no `CHANGELOG.md`. Product and
UX rationale lives in [`AWSALES_CONTEXT.md`](./AWSALES_CONTEXT.md).

## Método de design

Esse projeto usa o método **Bombardier** (design-as-product). O mapa operacional
do Bombardier neste repo fica em [`BOMBARDIER.md`](./BOMBARDIER.md).

## Scripts

```bash
npm run dev              # dev server loopback-only + review-bridge local
npm run build            # build de produção
npm start                # production server
npm run lint             # ESLint
npm run review-bridge    # só o servidor local de comentários (porta 9878)
```
