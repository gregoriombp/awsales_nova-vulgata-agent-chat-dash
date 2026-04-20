# Bombardier

**Product Builder Platform** — ferramenta visual para designers criarem páginas e flows direto no código do produto, reutilizando o design system, com um agente de IA (Claude) embutido que propõe componentes ao vivo.

Construído sobre Next.js 16 + React 19 + Tailwind + zustand + dnd-kit, com uma ponte Node local que fala com o Claude Code instalado na máquina do designer via Claude Agent SDK.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Setup inicial](#3-setup-inicial)
4. [Rotas e UX](#4-rotas-e-ux)
5. [IA do Bombardier](#5-ia-do-bombardier)
6. [Persistência no filesystem](#6-persistência-no-filesystem)
7. [API interna (Next)](#7-api-interna-next)
8. [API da ponte](#8-api-da-ponte-local)
9. [Atalhos de teclado](#9-atalhos-de-teclado)
10. [Estrutura do repo](#10-estrutura-do-repo)
11. [Extensibilidade](#11-extensibilidade)
12. [Variáveis de ambiente](#12-variáveis-de-ambiente)
13. [Troubleshooting](#13-troubleshooting)
14. [Limitações e roadmap](#14-limitações-conhecidas-e-roadmap)

---

## 1. Visão geral

O Bombardier resolve um atrito comum de times de produto: designer cria no Figma, dev implementa, e a tradução perde nuance. Com o Bombardier, **o próprio design system fica no repo** e o designer monta páginas diretamente em código — com ajuda de IA — sem sair de um editor visual.

**Três pilares:**

- **Styleguide** (`/bombardier/styleguide`) — documentação viva dos tokens, foundations e componentes `Aw*`. Fonte da verdade.
- **Page Builder** (`/bombardier/page-builder`) — canvas infinito com múltiplos frames, drag-and-drop de componentes, inline editing, Inspector para props, e um AI Copilot flutuante que gera páginas a partir de prompt + imagem.
- **UX Flow** (`/bombardier/ux-flow`) — **em breve** — conecta páginas criadas no Page Builder em fluxos navegáveis estilo Figma Prototype.

**Projetos** (`/bombardier/projects`) — listagem e gestão dos projetos salvos em disco.

**Playground** (`/bombardier/styleguide/components/playground`) — componentes novos propostos pela IA em quarentena até aprovação manual.

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Navegador (Bombardier UI)                │
│  • Palette (esquerda)  • Canvas (centro)  • Inspector (dir) │
│  • FloatingCopilot (bottom-center do canvas)                │
└───────────────┬─────────────────────────────────┬───────────┘
                │                                 │
                │ fetch /api/bombardier/...       │ fetch http://localhost:9876/...
                │ (Next.js API routes)            │ (Ponte local)
                ▼                                 ▼
┌─────────────────────────────┐   ┌────────────────────────────────┐
│  Next.js (localhost:3000)   │   │  bombardier-bridge (Node)       │
│  • /bombardier/*            │   │  • Express HTTP em :9876        │
│  • /api/bombardier/*        │   │  • Tools in-process via MCP SDK │
│  • Servidor do produto       │   │  • /health, /generate (SSE)    │
│  • Vê somente seus dados    │   │  • Roda na máquina do designer │
│    de projeto + arquivos DS │   └───────────────┬────────────────┘
└─────────────────────────────┘                   │
                                                  │ Claude Agent SDK
                                                  ▼
                                    ┌─────────────────────────────┐
                                    │  claude CLI (Claude Code)   │
                                    │  sessão já autenticada via  │
                                    │  `claude login` (OAuth      │
                                    │  Anthropic subscription)    │
                                    └───────────────┬─────────────┘
                                                    │
                                                    ▼
                                        ┌────────────────────────┐
                                        │  Anthropic API          │
                                        │  (conta/plano do user)  │
                                        └────────────────────────┘
```

**Por que a ponte local em vez de API key no servidor:**

- Cada designer usa **sua própria conta Claude** (Pro/Max/Team/API) — tokens são consumidos no plano individual.
- Nenhuma chave secreta é gerenciada pelo servidor do produto.
- Prompts e imagens **nunca passam pelo servidor** — viajam direto da máquina do designer para a Anthropic.
- Setup de uma linha (`claude login`) já resolve auth para todos os casos.

---

## 3. Setup inicial

### 3.1 Requisitos

- Node.js 22+ (recomendado 22 LTS)
- npm (outros gestores funcionam, mas os scripts assumem npm)
- Claude Code CLI instalado e autenticado
- macOS, Linux ou Windows com WSL

### 3.2 Instalar dependências do app

```bash
git clone <este-repo>
cd <repo>
npm install
```

### 3.3 Instalar o Claude Code CLI

Se ainda não estiver instalado:

```bash
npm install -g @anthropic-ai/claude-code
claude login
```

O `claude login` abre o navegador e faz OAuth com a sua conta Anthropic (Pro/Max/Team/API — qualquer plano funciona).

Verificar:

```bash
claude --version
# ex: 2.1.114 (Claude Code)
```

### 3.4 Instalar dependências da ponte

```bash
npm run bridge:install
```

Equivalente a `cd bridge && npm install`. A ponte tem seu próprio `package.json` e `node_modules/` isolados.

### 3.5 Subir a ponte local

Em um terminal:

```bash
npm run bridge
```

Saída esperada:

```
🚁  Bombardier bridge v0.3.0
    http://localhost:9876  (health + generate)
    Claude Code:  2.1.114 (Claude Code)
    Skill:        ok
```

A ponte escuta em **localhost:9876** (configurável via `BOMBARDIER_BRIDGE_PORT`).

### 3.6 Subir o Next.js

Em outro terminal:

```bash
npm run dev
```

### 3.7 Abrir o Bombardier

Abra [http://localhost:3000/bombardier](http://localhost:3000/bombardier). No Page Builder, o chat da IA deve mostrar **"Claude pronto"** na pill superior (se a ponte estiver ativa).

---

## 4. Rotas e UX

### 4.1 Hub (`/bombardier`)

Landing com 4 cards: Projetos, Page Builder, Styleguide, UX Flow. Entrada recomendada: **Projetos**.

### 4.2 Projetos (`/bombardier/projects`)

Grid de todos os projetos salvos em `bombardier/projects/<slug>/project.json`. Cada card mostra nome, contagem de páginas, última modificação e ações Abrir / Deletar.

- **Novo projeto** → abre o Page Builder com `?new=1` (reset do store).
- **Abrir** → abre `?load=<slug>` → o builder hidrata do filesystem e limpa o query param.
- **Deletar** → `DELETE /api/bombardier/projects/<slug>`, remove o diretório.

### 4.3 Page Builder (`/bombardier/page-builder`)

Layout em 3 colunas + barra flutuante central.

**ESQUERDA (260px) — Palette**

Catálogo de componentes agrupados em Layout / Conteúdo / Componentes. Cada item é draggable via dnd-kit para dentro dos frames do canvas.

- **Layout**: Coluna (Stack), Linha (Row), Grid, Box
- **Conteúdo**: Título, Parágrafo, Link, Imagem, Ícone, Divisor, Espaço
- **Componentes**: AwButton, AwCard, AwPill, AwInput, AwAlert, AwProgress, AwSkeleton, AwChatBubble, AwLogo, AwToggle

**CENTRO — Canvas infinito**

Espaço pan/zoom onde os frames das páginas vivem. Grid pontilhada que acompanha o zoom.

- **Pan**: `Space + arrasto`, ou botão do meio do mouse, ou scroll no trackpad
- **Zoom**: `Ctrl/Cmd + scroll` (zoom-at-cursor), botões `+/-`, ou **Fit** para resetar
- **Novo frame**: botão no canto superior esquerdo → dropdown com presets Desktop / Tablet / Mobile / Quadrada
- **Mover frame**: arrastar pelo header (rótulo com nome)
- **Redimensionar frame**: handle no canto inferior direito quando selecionado
- **Selecionar**: clicar no frame ou em um componente dentro dele
- **Inline edit**: **double-click** em título ou parágrafo → `contentEditable` com outline azul; Enter commita, Esc cancela

**DIREITA (320px) — Inspector**

Painel de estilo sensível ao que está selecionado.

- Nada selecionado → edita nome da página, preset de tamanho, largura/altura/x/y manuais
- Frame selecionado → mesma coisa + Duplicar / Deletar
- Componente selecionado → edita todas as props do `propSchema` do item (text, textarea, select, boolean, color, number) + nome do frame pai + botão remover

**BARRA FLUTUANTE CENTRAL — AI Copilot**

Input persistente no rodapé do canvas (estilo Claude.ai/ChatGPT). Anexa imagens (file picker + Ctrl+V do clipboard), mostra status da ponte (verde = Claude pronto, amarelo = sem Claude, vermelho = ponte offline). Histórico expandido quando tem mensagens, colapsável.

- Enviar: Enter
- Nova linha: Shift+Enter
- Anexar imagem: botão de ícone ou Ctrl+V (colar imagem do clipboard)
- Após resposta do Claude: botão **"Aplicar N no canvas"** injeta os nós gerados no frame ativo

**HEADER**

- Breadcrumb: Bombardier / Projetos / **Nome do projeto** (editável inline)
- Indicador de save: "Salvo agora" (verde por 2.5s após save bem-sucedido) / "Salvo há Xmin" / "Salvando…" / "Erro ao salvar"
- Botões: Projetos (atalho), Limpar (reseta tudo), **Salvar** (PUT em `/api/bombardier/projects/<slug>`)

### 4.4 Styleguide (`/bombardier/styleguide`)

Documentação viva do design system.

- **Foundation**: Design Tokens, Iconografia, Logos, Animação, Acessibilidade, Escrita, Padrões de UI
- **Components**: 15+ categorias (Alertas, Botões, Cards, Chat bubbles, Chrome, Controles, Inputs, Modais, Nav list, Nav rail, Pills, Sheet, Skeleton, Tabela, Toast)
- **Playground**: componentes propostos pela IA, pendentes de aprovação

### 4.5 Playground (`/bombardier/styleguide/components/playground`)

Lista componentes criados por `create_playground_component`. Cada card mostra nome, descrição, prompt original, tamanho do arquivo, timestamp.

- **Aprovar** → `POST /api/bombardier/playground/<Name>` com `{action:"approve"}` → move o `.tsx` para `components/ui/` e apaga o `.meta.json`
- **Descartar** → `DELETE /api/bombardier/playground/<Name>` → apaga arquivo e meta

Após aprovar, o componente entra no DS oficial mas ainda precisa ser **adicionado manualmente**:

1. Adicionar uma página em `app/bombardier/styleguide/components/<slug>/page.tsx` para documentar
2. (Opcional) Adicionar entrada em `lib/bombardier/palette.ts` para expor como drag-drop item
3. (Opcional) Adicionar item em `app/bombardier/styleguide/navigation.ts`

---

## 5. IA do Bombardier

### 5.1 Por que não é API key

A ponte **não guarda chaves**. O Claude Agent SDK reusa a sessão já autenticada do `claude` CLI. Isso significa:

- Você paga apenas pelo seu próprio uso (sua conta).
- Nenhum segredo no repo ou no servidor.
- Prompts privados por padrão.
- Qualquer plano Anthropic funciona (Pro, Max, Team, Enterprise, API).

### 5.2 A ponte local (`bridge/`)

Node + Express + Claude Agent SDK. Roda em `http://localhost:9876`.

Arquivos principais:

- `bridge/src/index.ts` — servidor HTTP, endpoints `/health` e `/generate`, CORS restrito a `localhost:3000` / `:3001`
- `bridge/src/claude.ts` — wrapper do SDK; detecção de status via `claude --version`; streaming SSE
- `bridge/src/skill.ts` — loader do arquivo `.claude/skills/bombardier-generate.md` com substituição de placeholders
- `bridge/src/manifest-cache.ts` — cache do manifest do DS (busca em `http://localhost:3000/api/bombardier/components/manifest`)
- `bridge/src/tools/` — as 3 tools (match_aw, search_shadcn, create_playground_component)

### 5.3 A skill `bombardier-generate.md`

Arquivo em [`.claude/skills/bombardier-generate.md`](.claude/skills/bombardier-generate.md). É o **system prompt** do agente. Contém:

- Definição do papel (gerador de páginas Bombardier)
- Regras da cascata Aw → shadcn → create_playground
- Schema do `BuilderNode` com exemplos
- Placeholders substituídos em runtime: `<PALETTE_JSON>`, `<TOKENS_JSON>`, `<AW_OUTSIDE_PALETTE>`, `<CURRENT_TREE>`
- Regras de imagem de referência (quando o user anexa screenshots/mockups)
- Princípios de design (hierarquia, containers antes de style bruto, componentes antes de primitivos)

**Edite livremente** — o bridge lê o arquivo a cada request (com cache por mtime). Zero deploy necessário.

### 5.4 Cascata: Aw* → shadcn → Playground

Quando o designer envia um prompt, a IA segue esta ordem:

1. **`match_aw(description, keywords?)`** — procura no manifest da paleta local (21 itens). Retorna top-5 matches com score e propSchema. Se achar (score ≥ 3), usa direto no JSON de saída.

2. **`search_shadcn(query)`** — se não achou nada, busca no registry público da shadcn/ui (`https://ui.shadcn.com/r/index.json`, cache de 5min). Retorna até 8 componentes com `install` command. Se couber, menciona no texto da resposta e modela um placeholder em Box.

3. **`create_playground_component(name, description, tsx, sourcePrompt?)`** — último recurso. Valida PascalCase sem prefixo `Aw`, escreve em `components/playground/<Name>.tsx` + `<Name>.meta.json` com `approval: "pending"`. **Não** inclui o tipo no JSON de saída — o componente fica em quarentena.

O SDK do Agent permite que o Claude chame qualquer dessas tools durante o turno (até 6 turns por request).

### 5.5 Tools in-process

As 3 tools rodam **no processo do bridge** (Node), expostas via `createSdkMcpServer()` do Agent SDK. Nomeadas como `mcp__bombardier__<tool_name>`.

Quando o Claude chama uma tool:
- `bridge/src/tools/<tool>.ts` executa no mesmo processo
- Tem acesso ao filesystem do repo, ao manifest cacheado, etc.
- Retorna `CallToolResult` com conteúdo JSON
- Os eventos `tool_use` e `tool_result` são propagados via SSE para a UI, que renderiza timeline no chat

### 5.6 Modelo e configurações

Default: **Claude Sonnet 4.6** (melhor custo-benefício).

Para mudar, defina a env var antes de subir a ponte:

```bash
BOMBARDIER_CLAUDE_MODEL=claude-opus-4-7 npm run bridge
# ou
BOMBARDIER_CLAUDE_MODEL=claude-haiku-4-5-20251001 npm run bridge
```

Outros:

- `BOMBARDIER_BRIDGE_PORT` — porta da ponte (default 9876)
- `BOMBARDIER_NEXT_URL` — URL do Next.js para o manifest fetch (default `http://localhost:3000`)
- `NEXT_PUBLIC_BOMBARDIER_BRIDGE_URL` — URL da ponte vista pelo browser (default `http://localhost:9876`)

---

## 6. Persistência no filesystem

### 6.1 Projetos

Cada projeto vira um diretório:

```
bombardier/
  projects/
    <slug>/
      project.json       # Snapshot completo do BuilderProject (pages, viewport, etc.)
```

- `slug` é gerado automaticamente a partir do nome (NFD + lowercase + hífens)
- Regex válida: `^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$` (ou um único char alfanumérico)
- Save via `PUT /api/bombardier/projects/<slug>` com body `{ project: BuilderProject }`
- Load via `GET /api/bombardier/projects/<slug>`
- Lista via `GET /api/bombardier/projects`
- Deleta via `DELETE /api/bombardier/projects/<slug>` (remove diretório inteiro)

O zustand store também guarda uma cópia no `localStorage` como rascunho (chave `bombardier-page-builder-draft`, version 2), então o usuário pode experimentar sem salvar.

### 6.2 Playground

```
components/
  playground/
    <Name>.tsx           # Componente React
    <Name>.meta.json     # { description, sourcePrompt, createdAt, approval }
```

- Componentes gerados pelo tool `create_playground_component`
- Sem prefixo `Aw` (reservado para DS aprovado)
- Aprovação move `<Name>.tsx` → `components/ui/<Name>.tsx` e apaga meta
- Rejeitar/Descartar apaga os dois arquivos

Considere adicionar `components/playground/*` ao `.gitignore` se os experimentos forem pessoais (já tem um `.gitkeep`).

---

## 7. API interna (Next)

Todas as rotas retornam JSON.

### Projetos

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| `GET` | `/api/bombardier/projects` | — | `{ projects: [{ slug, name, pageCount, updatedAt }] }` |
| `GET` | `/api/bombardier/projects/[slug]` | — | `{ slug, project }` |
| `PUT` | `/api/bombardier/projects/[slug]` | `{ project }` | `{ ok, slug, path }` |
| `DELETE` | `/api/bombardier/projects/[slug]` | — | `{ ok, removed }` |

Erros comuns:
- `400 invalid_slug` — slug fora do regex
- `400 missing_project` / `invalid_project_shape`
- `404 not_found`
- `500 fs_error` / `parse_failure`

### Manifest

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/api/bombardier/components/manifest` | Manifest completo do DS |

Retorna:

```json
{
  "version": 1,
  "generatedAt": "...",
  "builder": {
    "palette": [{ "type", "label", "group", "isContainer", "defaults", "props" }, ...]
  },
  "designSystem": {
    "componentsRoot": "components/ui",
    "componentsInPalette": ["AwButton", ...],
    "componentsOutsidePalette": ["AwTable", "AwTabs", ...],
    "tokens": { "bg": [...], "fg": [...], "border": [...], "accent": [...], "radius": [...], "scales": [...] }
  }
}
```

### Playground

| Método | Rota | Corpo | Ação |
|---|---|---|---|
| `POST` | `/api/bombardier/playground/[name]` | `{ action: "approve" }` | Move para `components/ui/` |
| `DELETE` | `/api/bombardier/playground/[name]` | — | Apaga do playground |

Valida PascalCase, bloqueia prefixo `Aw`, checa `already_exists_in_ui`, path traversal etc.

---

## 8. API da ponte local

### `GET /health`

Retorna status da ponte + Claude + skill + tools carregadas.

```json
{
  "ok": true,
  "version": "0.3.0",
  "phase": "phase-3",
  "claude": {
    "ready": true,
    "version": "2.1.114 (Claude Code)",
    "executable": "/usr/local/bin/claude"
  },
  "skill": { "path": "...", "exists": true },
  "tools": ["match_aw", "search_shadcn", "create_playground_component"],
  "port": 9876,
  "timestamp": "..."
}
```

### `POST /generate`

Gera uma página via Claude. Retorna stream SSE.

**Request body:**

```json
{
  "prompt": "string",
  "images": [{ "mediaType": "image/png", "base64": "..." }],
  "manifest": {
    "palette": [...],
    "tokens": {...},
    "awOutsidePalette": [...]
  },
  "currentTree": [BuilderNode, ...]
}
```

Limites:
- `prompt` obrigatório, `images` opcional
- Máximo 4 imagens
- Cada imagem ≤ 8MB (base64)
- Tipos aceitos: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**Eventos SSE:**

| Evento | Payload | Significado |
|---|---|---|
| `status` | `{ text }` | "Iniciando Claude Code…" |
| `chunk` | `{ text }` | Token incremental do streaming (concatenar) |
| `assistant` | `{ text }` | Turn completo (ignorado pela UI, chunks já cobrem) |
| `tool_use` | `{ id, name, input }` | Tool foi chamada pelo Claude |
| `tool_result` | `{ tool_use_id, content, isError }` | Resultado voltou pra Claude |
| `result` | `{ text, nodes, durationMs, costUsd }` | Resposta final, JSON extraído, custo |
| `error` | `{ message }` | Erro em qualquer ponto |
| `done` | `{ ok }` | Stream fechou |

O `nodes` final é `BuilderNode[]` parseado do último bloco ```` ```json ```` na resposta do Claude.

---

## 9. Atalhos de teclado

No Page Builder (desabilitados quando o foco está em input/textarea/contenteditable):

| Atalho | Ação |
|---|---|
| `Cmd/Ctrl + C` | Copia o nó selecionado para o clipboard como JSON Bombardier |
| `Cmd/Ctrl + V` | Cola do clipboard (JSON Bombardier vira componente; texto vira nó `text`) |
| `Cmd/Ctrl + D` | Duplica o nó selecionado (sibling após o original) |
| `Space + drag` | Pan no canvas |
| `Ctrl/Cmd + scroll` | Zoom (no cursor) |
| `Enter` (em inline edit) | Commit (heading) / quebra linha (paragraph com Shift) |
| `Esc` (em inline edit) | Cancela edição |

**Paste inteligente:**
- JSON com shape `{ kind: "bombardier.node", version: 1, node: {...} }` → recria componente
- Qualquer outro texto → cria parágrafo com esse conteúdo
- Destino: se um container está selecionado, cola dentro; senão, raiz do frame ativo

**Seleção via pointer:**
- Click simples em componente → seleciona (outline azul)
- Click em background do canvas → desseleciona
- Click no header do frame → seleciona o frame inteiro
- Double-click em heading/parágrafo → entra em inline edit

---

## 10. Estrutura do repo

```
<repo>/
├── app/                              # Next.js App Router
│   ├── bombardier/                   # Namespace do produto
│   │   ├── page.tsx                  # Hub (4 cards)
│   │   ├── layout.tsx                # Minimal pass-through
│   │   ├── projects/                 # Lista de projetos salvos
│   │   │   ├── page.tsx
│   │   │   └── _components/ProjectsGrid.tsx
│   │   ├── page-builder/             # Editor principal
│   │   │   ├── page.tsx              # Layout 3 colunas + keyboard shortcuts
│   │   │   └── _components/
│   │   │       ├── Palette.tsx
│   │   │       ├── Canvas.tsx         # Infinite canvas com pan/zoom
│   │   │       ├── PageFrame.tsx      # Frame individual (move + resize)
│   │   │       ├── NodeRenderer.tsx   # Renderização recursiva + inline edit
│   │   │       ├── Inspector.tsx      # Painel de propriedades
│   │   │       ├── FloatingCopilot.tsx # Chat flutuante
│   │   │       └── AIChat.tsx         # (legado — substituído por FloatingCopilot)
│   │   ├── styleguide/               # DS docs
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Home (tokens + colors)
│   │   │   ├── navigation.ts
│   │   │   ├── foundation/{iconography,logos,motion,accessibility,content,patterns}/
│   │   │   └── components/
│   │   │       ├── alerts/, buttons/, cards/, chat/, chrome/, controls/, inputs/
│   │   │       ├── modals/, nav-list/, nav-rail/, pills/, sheet/, skeleton/, table/, toast/
│   │   │       └── playground/       # Lista de componentes gerados por IA
│   │   └── (ux-flow)                 # TODO
│   └── api/bombardier/               # API routes internas
│       ├── components/manifest/route.ts
│       ├── projects/route.ts
│       ├── projects/[slug]/route.ts
│       └── playground/[name]/route.ts
│
├── components/
│   ├── ui/                           # Componentes Aw* aprovados (20+)
│   │   ├── AwButton.tsx, AwCard.tsx, AwPill.tsx, AwInput.tsx
│   │   ├── AwAlert.tsx, AwChatBubble.tsx, AwProgress.tsx, AwSkeleton.tsx
│   │   ├── AwToggle.tsx, AwLogo.tsx, AwNavRail.tsx, Icon.tsx, ...
│   └── playground/                   # Componentes gerados pela IA (quarentena)
│       ├── .gitkeep
│       ├── README.md
│       └── <Name>.tsx + <Name>.meta.json
│
├── lib/
│   └── bombardier/
│       ├── types.ts                  # BuilderNode, PageFrame, BuilderProject, etc.
│       ├── palette.ts                # Manifest dos 21 palette items (PropField schema)
│       └── store.ts                  # Zustand store + todas as actions + persist
│
├── bridge/                           # Ponte local (pacote próprio)
│   ├── package.json                  # Deps: express, cors, claude-agent-sdk, zod
│   ├── tsconfig.json
│   ├── README.md
│   └── src/
│       ├── index.ts                  # Servidor HTTP
│       ├── claude.ts                 # SDK wrapper + streaming
│       ├── skill.ts                  # Loader da skill
│       ├── manifest-cache.ts         # Cache do manifest
│       └── tools/
│           ├── index.ts              # createSdkMcpServer + allowedTools
│           ├── match-aw.ts
│           ├── search-shadcn.ts
│           └── create-playground.ts
│
├── bombardier/
│   └── projects/                     # Projetos salvos em disco
│       ├── .gitkeep
│       └── <slug>/project.json
│
├── .claude/
│   └── skills/
│       └── bombardier-generate.md    # System prompt editável
│
├── BOMBARDIER.md                     # Este arquivo
├── package.json                      # Scripts: dev, bridge, bridge:install, etc.
├── next.config.ts                    # Redirect /styleguide → /bombardier/styleguide
├── tailwind.config.ts                # Tokens aw-* + semantic
└── app/globals.css                   # Tokens CSS completos
```

---

## 11. Extensibilidade

### 11.1 Adicionar um novo componente `Aw*`

1. Crie `components/ui/AwNomeNovo.tsx` seguindo a convenção:
   - PascalCase com prefixo `Aw`
   - `export type AwNomeNovoProps = ...`
   - `export function AwNomeNovo(...)` ou `forwardRef`
   - Classes `aw-nome-novo` + variantes em `app/globals.css` (ou inline com CSS vars)
   - Use CSS variables do DS: `var(--fg-primary)`, `var(--aw-blue-500)`, etc.
2. Documente em `app/bombardier/styleguide/components/nome-novo/page.tsx`
3. Adicione entrada em `app/bombardier/styleguide/navigation.ts`

Pronto — o componente existe no DS. Para expô-lo como palette item drag-drop, siga 11.2.

### 11.2 Expor um componente na palette

Edite [`lib/bombardier/palette.ts`](lib/bombardier/palette.ts) e adicione uma entrada:

```ts
{
  type: "AwNomeNovo",
  label: "Nome Novo",
  icon: "star",            // Material Symbols name
  group: "component",      // "layout" | "content" | "component"
  isContainer: false,      // true se aceita children
  defaultProps: { variant: "primary", size: "md" },
  propSchema: {
    variant: { kind: "select", label: "Variante", options: ["primary", "secondary"] },
    size: { kind: "select", label: "Tamanho", options: ["sm", "md", "lg"] },
  },
},
```

Depois renderize no [`NodeRenderer.tsx`](app/bombardier/page-builder/_components/NodeRenderer.tsx), adicionando um case no switch da função `Leaf`:

```tsx
case "AwNomeNovo":
  return (
    <AwNomeNovo
      variant={node.props.variant as AwNomeNovoProps["variant"]}
      size={node.props.size as AwNomeNovoProps["size"]}
      tabIndex={-1}
    />
  )
```

### 11.3 Editar a skill

Abra [`.claude/skills/bombardier-generate.md`](.claude/skills/bombardier-generate.md) e mude o texto. Exemplos do que faz sentido ajustar:

- Regras de densidade/espaçamento específicas do produto
- Exemplos few-shot adicionais
- Regras de tom do conteúdo (pt-BR formal vs casual)
- Instruções de acessibilidade específicas

O bridge relê a cada request (cache por mtime). Sem deploy, sem reset.

### 11.4 Adicionar uma tool no bridge

1. Crie `bridge/src/tools/sua-tool.ts`:

```ts
import { tool } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"

export const suaTool = tool(
  "sua_tool",
  "Descrição clara do que faz e QUANDO usar.",
  {
    param: z.string().describe("..."),
  },
  async ({ param }) => {
    // lógica
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result) }],
    }
  }
)
```

2. Registre em `bridge/src/tools/index.ts`:

```ts
import { suaTool } from "./sua-tool.js"

export function createToolServer() {
  return createSdkMcpServer({
    name: SERVER_NAME,
    tools: [matchAwTool, searchShadcnTool, createPlaygroundTool, suaTool],
  })
}

export const allowedTools = [
  // ...
  `mcp__${SERVER_NAME}__sua_tool`,
]
```

3. Documente a tool na skill pra Claude saber quando usá-la.

4. Reinicie a ponte. `/health` vai mostrar a tool nova na lista.

---

## 12. Variáveis de ambiente

Todas opcionais, com defaults razoáveis.

### Ponte (servidor)

| Var | Default | Uso |
|---|---|---|
| `BOMBARDIER_BRIDGE_PORT` | `9876` | Porta HTTP da ponte |
| `BOMBARDIER_CLAUDE_MODEL` | `claude-sonnet-4-6` | Modelo do Claude |
| `BOMBARDIER_NEXT_URL` | `http://localhost:3000` | URL do app Next para buscar manifest |

### Next (cliente)

| Var | Default | Uso |
|---|---|---|
| `NEXT_PUBLIC_BOMBARDIER_BRIDGE_URL` | `http://localhost:9876` | URL da ponte usada pelo browser |

### Claude Code

Não usa env vars no Bombardier — a auth fica no `~/.claude/` gerido pelo próprio CLI após `claude login`.

---

## 13. Troubleshooting

### "Claude Code CLI não encontrado no PATH"

```bash
npm install -g @anthropic-ai/claude-code
claude login
```

Verifique:

```bash
which claude
claude --version
```

Se instalou mas o `which claude` não acha, adicione o diretório do npm global ao PATH (ex: `~/.npm-global/bin` ou `~/.local/bin` dependendo do setup).

### Ponte offline / pill vermelha

```bash
npm run bridge
```

Se der erro de porta em uso:

```bash
lsof -ti:9876 | xargs kill -9
BOMBARDIER_BRIDGE_PORT=12345 npm run bridge
```

E atualize a env do Next: `NEXT_PUBLIC_BOMBARDIER_BRIDGE_URL=http://localhost:12345 npm run dev`.

### Custo alto por prompt (~$0.30 por request)

O system prompt inclui o skill inteiro + manifest completo + tokens (~3k tokens por request). Mitigações:

- Use Sonnet (default) em vez de Opus (5x mais caro)
- Use Haiku para prompts simples: `BOMBARDIER_CLAUDE_MODEL=claude-haiku-4-5-20251001`
- Prompt caching explícito é um item de roadmap (quando o SDK expuser `cache_control`)

### localStorage corrompido / estados inconsistentes

No Page Builder, botão **Limpar** (topo direito) reseta o store. Ou no DevTools:

```js
localStorage.removeItem('bombardier-page-builder-draft')
location.reload()
```

### Projeto não carrega ao clicar "Abrir"

Verifique:

1. O arquivo existe: `cat bombardier/projects/<slug>/project.json`
2. É JSON válido: `jq . bombardier/projects/<slug>/project.json`
3. Tem o shape esperado: campo `pages` é array, `viewport` objeto

Se corrompido, você pode editar o JSON à mão ou deletar o diretório e recriar.

### Image upload dando 413

Cada imagem deve ser ≤ 5MB (raw) ou ~7MB (base64). Máximo 4 imagens por mensagem. Se bater no limite, comprima antes ou mande em batches.

### CORS bloqueado no browser

A ponte só aceita origem `http://localhost:3000` e `:3001`. Se você rodou o Next em outra porta, edite `bridge/src/index.ts` adicionando na lista `allowedOrigins`.

---

## 14. Limitações conhecidas e roadmap

### Limitações atuais

- **Prompt caching explícito** não implementado — cada request paga o custo de input completo
- **Undo/redo** não existe — um botão "Limpar" reseta tudo
- **Seleção múltipla** de componentes não suportada
- **Reordenar siblings** dentro do mesmo container só via arrastar entre dropzones; não há arrastar-dentro-do-mesmo-pai
- **Responsive** — cada frame tem um único breakpoint; sem variantes responsive
- **Export para código** — uma página vive como JSON; não gera arquivo `.tsx` standalone ainda
- **Approval flow** do Playground não adiciona automaticamente à paleta — requer edição manual de `palette.ts`
- **UX Flow Builder** não foi implementado (card "em breve" no hub)
- **Multi-usuário** / permissões — app é single-user local; nenhum state de "quem editou o quê"
- **Live collaboration** — não suportado

### Roadmap natural

- Prompt caching (quando SDK expuser)
- UX Flow Builder com `@xyflow/react` (já instalado)
- Auto-promote Playground → Palette via patch automático de `palette.ts`
- Export de página para `.tsx` standalone
- Preview responsive (breakpoints mobile/tablet/desktop no frame)
- Undo/redo com zustand + zundo middleware
- Thumbnails reais dos frames (`html-to-image` já instalado)
- Seleção múltipla + batch operations
- Marketplace de skills (diferentes tons/estilos de geração)

---

## Créditos e referências

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS 3 + CSS Variables
- **State**: zustand 5 com persist middleware
- **Drag-and-drop**: `@dnd-kit/core`
- **Node editor (UX Flow futuro)**: `@xyflow/react`
- **IA**: `@anthropic-ai/claude-agent-sdk` + Claude Code CLI
- **Validação**: `zod`
- **Fontes**: Inter, Neue Haas Grotesk Display, Geist Mono, Material Symbols Rounded

**Ponte**: `express`, `cors`, `tsx`, `@anthropic-ai/claude-agent-sdk`, `zod`.
