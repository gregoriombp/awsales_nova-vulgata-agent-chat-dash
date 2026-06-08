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
npm run dev          # localhost:3000 + acessível na rede local (host 0.0.0.0)
```

## Design system

Toda a documentação de tokens, foundations, patterns e componentes vive em `/bombardier/styleguide`. Sobe o servidor e abre [http://localhost:3000/bombardier/styleguide](http://localhost:3000/bombardier/styleguide).

Foundations: Design Tokens, Iconografia, Logos, Animação, Acessibilidade, Escrita, Padrões de UI.
Componentes: 23 registrados oficialmente — entre eles `integration-catalog`, `integration-card`, `connect-modal`, `whatsapp-panel`, `chrome`, `nav-rail`, `nav-list`, `template-builder-sheet`, `chat`, `pills`, `toast`.

## Review Mode (anotação colaborativa)

Overlay de comentários (free-draw + pin) **sempre montado**. Ligue/desligue o modo de
comentar pela **bolota do Bombardier** (canto inferior direito) ou `Cmd+Shift+Y` — não
precisa de env flag. Sincroniza entre revisores na LAN via `review-bridge` quando
`NEXT_PUBLIC_BOMBARDIER_REVIEW_BRIDGE_URL` + `NEXT_PUBLIC_BOMBARDIER_REVIEW_TOKEN` estão
setados no `.env.local` (senão grava no `localStorage`). Servidor: `npm run review-bridge`
(porta 9878). Skills: `/bombardier-review-bridge` e `/bombardier-review-bridge-solve`.

## Estrutura

```
app/
├── bombardier/styleguide/    # Design system: foundations + 23 componentes registrados
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
├── ui/                       # Componentes Aw* do design system (58+) + primitivos shadcn lowercase
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
review-bridge/                # Servidor LAN de comentários (porta 9878)
flow-bridge/                  # Servidor LAN de sugestões de UX flow (porta 9879)
```

## Como agentes de IA trabalham nesse repo

Ver [`CLAUDE.md`](./CLAUDE.md).

## Histórico de decisões

Use `git log` para o histórico — não há `CHANGELOG.md` neste repo. Os porquês das decisões maiores de produto/UX ficam em [`AWSALES_CONTEXT.md`](./AWSALES_CONTEXT.md).

## Método de design

Esse projeto usa o método **Bombardier** (design-as-product). Manual canônico em `~/Desktop/Projects/Working/Bombardier Skills/Bombardier — Manual.md`.

## Scripts

```bash
npm run dev              # dev server localhost:3000 + acessível na LAN (0.0.0.0)
npm run build            # build de produção
npm start                # production server
npm run lint             # ESLint
npm run review-bridge    # servidor LAN de comentários (porta 9878)
```
