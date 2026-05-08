# AwSales

Plataforma de agentes de IA para vendas. Construída com o método **Bombardier** (design-as-product) — design system, telas e fluxos compõem um produto único, prototipado direto em código.

## Stack

- **Next.js 16 + React 19 + TypeScript**
- **Tailwind CSS v3.4** — tokens via `tailwind.config.ts` + CSS variables em `app/globals.css`
- **Geist + Geist Mono + Material Symbols Rounded**
- **Estado:** Zustand
- **Forms:** react-hook-form + zod
- **Charts:** recharts
- **Graphs / Flow:** @xyflow/react
- **Drag & drop:** dnd-kit
- **AI SDKs:** @anthropic-ai/sdk, @google/genai

## Como rodar

```bash
npm install
npm run dev          # localhost:3000 + acessível na rede local (host 0.0.0.0)
```

## Design system

Toda a documentação de tokens, foundations, patterns e componentes vive em `/bombardier/styleguide`. Sobe o servidor e abre [http://localhost:3000/bombardier/styleguide](http://localhost:3000/bombardier/styleguide).

Foundations: Design Tokens, Iconografia, Logos, Animação, Acessibilidade, Escrita, Padrões de UI.
Componentes: 23 registrados oficialmente — entre eles `integration-catalog`, `integration-card`, `connect-modal`, `whatsapp-panel`, `chrome`, `nav-rail`, `nav-list`, `template-builder-sheet`, `chat`, `pills`, `toast`.
Playground: componentes propostos em `/bombardier/styleguide/components/playground`.

## Claude Code edit overlay (dev-only)

Um copilot flutuante que aparece sobre qualquer tela do app, conversa com Claude Code via bridge local e suporta um "cursor seletor" estilo Cursor — clica num elemento da UI, ele vira referência no chat e o Claude pode editar o arquivo correspondente diretamente no repo.

```bash
# Em outro terminal — sobe o bridge local que executa Claude Code:
npm run edit-bridge:install   # primeira vez
npm run edit-bridge:dev
```

Ative o overlay no `.env.local`:

```
NEXT_PUBLIC_CLAUDE_EDIT_ENABLED=true
NEXT_PUBLIC_CLAUDE_EDIT_BRIDGE_URL=http://localhost:9877
```

Atalhos:
- `⌘⇧L` abre/fecha o overlay
- Botão de alvo (ou `Esc`) ativa/desativa o seletor de elementos

O overlay é gated por env flag — em build de produção sem a var, ele não renderiza nem faz nenhuma chamada ao bridge. O bridge ouve apenas em `127.0.0.1` e usa as tools built-in do Claude Agent SDK (Read, Edit, Write, Glob, Grep, Bash) com `cwd` apontando pro root do repo.

> Já existia um bridge irmão em `bridge/` dedicado ao page-builder do Bombardier (`npm run bridge:dev`, porta 9876). O `bridge-edit/` é separado para não misturar a lógica de "gerar nodes pro canvas" com "editar arquivos do repo".

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
├── ui/                       # Primitivos novos (em construção, ex: AwLogo, AwToast)
├── forms/                    # DatePicker, FileUpload, Checkbox, Select, Textarea
├── modals/                   # BaseModal, FormModal
├── notifications/            # Toast, ToastContainer
├── claude-edit/              # Overlay do Claude Code (ver acima)
└── *.tsx                     # Componentes legados (Button, Input, KPICard, etc.) — migram pra ui/

lib/
├── contexts/                 # ToastContext
└── hooks/                    # useToast

public/assets/integrations/   # Logos das integrações, categorizadas (Agenda, Ações, Checkout, etc.)
bridge/                       # Bridge do page-builder (porta 9876)
bridge-edit/                  # Bridge do edit overlay (porta 9877)
```

## Como agentes de IA trabalham nesse repo

Ver [`CLAUDE.md`](./CLAUDE.md).

## Histórico de decisões

Ver [`CHANGELOG.md`](./CHANGELOG.md). Não é release notes — é registro pra quem entrar no projeto entender por que as coisas estão como estão.

## Método de design

Esse projeto usa o método **Bombardier** (design-as-product). Manual canônico em `~/Desktop/Projects/Working/Bombardier Skills/Bombardier — Manual.md`.

## Scripts

```bash
npm run dev              # dev server localhost:3000 + acessível na LAN (0.0.0.0)
npm run build            # build de produção
npm start                # production server
npm run lint             # ESLint
npm run bridge:dev       # page-builder bridge (porta 9876)
npm run edit-bridge:dev  # edit overlay bridge (porta 9877)
```
