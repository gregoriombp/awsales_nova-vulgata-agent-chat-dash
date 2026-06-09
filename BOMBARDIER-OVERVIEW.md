# Bombardier — Design-as-Product

> O ambiente onde o design system vive no código, os designers editam no browser, e um agente de IA trabalha junto.

---

## O problema que o Bombardier resolve

Times de produto vivem num ciclo caro: designer cria no Figma, dev implementa, tradução perde nuance, designer revisa, ciclo recomeça. A cada volta, componentes viram sombras de si mesmos, tokens se transformam em valores arbitrários hardcoded, e o design system — aquele documento nobre — vai ficando pra trás da realidade do produto.

O Bombardier interrompe esse ciclo colocando o design system dentro do próprio repositório e dando ao designer um ambiente completo para criar, revisar, iterar e publicar mudanças sem depender de intermediários.

**Design-as-product.** Não é metáfora — é a arquitetura.

---

## O que é o Bombardier (visão geral)

O Bombardier é um toolkit de design-as-product construído sobre Next.js + React + Tailwind v4. Ele vive no namespace `/bombardier` dentro do próprio repositório do produto e é composto por cinco superfícies principais, três bridges locais, e um sistema de skills que faz agentes de IA produzirem output consistente com o design system.

```
Bombardier
├── Styleguide          — fonte da verdade do DS
├── Page Builder        — editor visual com IA embutida
├── UX Flows            — fluxos navegáveis linkados ao código
├── Bridges             — colaboração em rede local (Review, Flow, Edit)
└── Skills              — instruções para agentes (Claude Code, Cursor, Codex)
```

Cada parte resolve um problema diferente, mas todas compartilham o mesmo sistema de tokens, os mesmos componentes `Aw*`, e a mesma fonte da verdade.

---

## Styleguide — a fonte da verdade viva

`/bombardier/styleguide`

O Styleguide não é um Notion, não é um Storybook separado, não é um PDF que ninguém atualiza. É uma rota do próprio produto, renderizada com os mesmos componentes que aparecem em produção.

**O que o Styleguide documenta:**

- **Design Tokens** — todas as paletas (10 escalas cromáticas + semantic + dark shell), espaçamento, raio de borda, sombras e motion. Tokens definidos uma vez no `@theme` do Tailwind v4, consumidos em toda a UI via classes semânticas (`bg-primary`, `text-fg-secondary`, `border-border`).
- **Foundation** — Iconografia (Material Symbols Rounded), Logos, Animação, Acessibilidade, Escrita e Padrões de UI.
- **Componentes `Aw*`** — cada componente do design system tem uma página de showcase própria documentando variantes, estados, props, e exemplos de uso. Hoje são 15+ categorias: Alertas, Botões, Cards, Chat Bubbles, Chrome, Controles, Inputs, Modais, Nav List, Nav Rail, Pills, Sheet, Skeleton, Tabela, Toast — e a lista cresce toda sprint.
- **Playground** — zona de quarentena para componentes propostos pela IA. Um componente gerado pelo agente aterra aqui antes de ser promovido ao DS oficial, garantindo que nada não-revisado chegue à produção.

**A regra de ouro:** toda a UI do produto importa apenas componentes `Aw*`. Nunca o primitivo shadcn diretamente, nunca valores arbitrários de cor ou espaçamento. O Styleguide é o contrato — qualquer desvio é dívida rastreável.

---

## Page Builder — protótipos que são código

`/bombardier/page-builder`

O Page Builder é um editor visual de canvas infinito onde o designer monta páginas arrastando componentes do design system — e um agente de IA (Claude) observa e gera ao vivo.

**O canvas:**
- Pan e zoom nativos (Space + arrasto, Ctrl+scroll, Fit automático)
- Múltiplos frames por projeto (Desktop, Tablet, Mobile, Quadrada)
- Inline editing com double-click (heading, parágrafos — edita direto no canvas sem sair do contexto)
- Inspector lateral com todas as props do componente selecionado

**A paleta:**
Todos os componentes `Aw*` do DS estão disponíveis como items draggable. Primitivos de layout (Stack, Row, Grid, Box), conteúdo (Título, Parágrafo, Imagem, Ícone) e componentes completos (AwButton, AwCard, AwInput, AwAlert, AwChatBubble, e mais). Arrastar para o frame, selecionar, inspecionar props, ajustar — tudo em milissegundos, sem uma linha de código.

**O AI Copilot:**
Um chat flutuante no rodapé do canvas. O designer descreve o que quer — em linguagem natural, com imagens de referência se precisar — e o Claude gera os nós diretamente no frame ativo. A IA segue uma cascata de prioridade rígida: primeiro busca no design system local (componentes `Aw*`), depois no registry do shadcn/ui, e só como último recurso cria um componente novo no Playground para aprovação manual. O output nunca bypassa o DS.

**Arquitetura sem chaves secretas:**
A IA do Page Builder roda via uma ponte local (`bridge/`, porta 9876) que usa o Claude Agent SDK conectado à sessão `claude login` do próprio designer. Nenhuma API key no servidor, nenhum segredo no repo. Cada designer paga pelo próprio uso, prompts não passam pelo servidor, e qualquer plano Anthropic funciona.

**Projetos:**
Cada projeto é salvo em disco como JSON (`bombardier/projects/<slug>/project.json`), versionável via git, com CRUD completo via API interna do Next. O store do Zustand mantém um rascunho no localStorage para iteração rápida.

---

## UX Flows — fluxos linkados ao código

`/bombardier/styleguide/ux-flows`

O UX Flow não é um diagrama no Figma que fica desatualizado. É uma representação estruturada dos fluxos do produto que vive dentro do repositório, junto ao código que implementa cada tela.

**O que um UX Flow registra:**
- Cada tela: nome, rota, caminho do arquivo, status (shipped / in-progress / planned)
- Cada transição: label descritivo, condição se houver
- Cada bifurcação: representada explicitamente
- Estados de UI por tela: o que aparece em cada variação

**A ligação código-fluxo:**
Cada `page.tsx` com um fluxo desenhado carrega `// Flow: <url>` como primeira linha não-import. O flow e o código permanecem cross-linked — quando a tela muda, a referência está ali.

**Skills de flow:**

| Skill | O que faz |
|---|---|
| `bombardier-create-ux-flow` | Cria um novo fluxo a partir de uma descrição ou lista de steps |
| `bombardier-update-ux-flow` | Registra uma atualização estrutural + entrada no changelog |
| `bombardier-pg-create-flow` | Cria um fluxo a partir de um `.awflow.json` (export do designer/PG) |
| `bombardier-pg-merge-flow` | Faz merge de um `.awflow.json` num fluxo existente |

O formato `.awflow.json` permite que um designer exporte uma proposta de fluxo e o agente a aplique no repositório de forma estruturada, sem conflito.

---

## Bridges — colaboração em rede local

Os bridges são três servidores Node que rodam em paralelo, cada um resolvendo um problema de colaboração diferente. Sem eles, o designer trabalha isolado; com eles, o time inteiro converge no mesmo artefato.

### Review Bridge (`review-bridge/`, LAN)

`npm run review-bridge`

O modo de revisão do Bombardier permite que qualquer membro do time deixe comentários diretamente sobre componentes no Styleguide — com threading, resolução de threads, e sincronização via SSE entre todos os revisores na mesma rede local.

O Review Bridge é o servidor que sustenta isso: Express + lowdb + autenticação por token, expostos via SSE (eventos em tempo real) e POST (novos comentários, resoluções). Sem ele, o modo de revisão não sincroniza entre máquinas.

**Skills complementares:**
- `bombardier-review-bridge` — inicia o servidor de comentários
- `bombardier-review-bridge-solve` — batch-resolve comentários via agente (lê comentários abertos, propõe soluções, aplica com aprovação)

### Flow Bridge (`flow-bridge/`)

O Flow Bridge conecta o editor de UX Flows ao agente: quando um designer propõe sugestões de fluxo via interface, essas sugestões são gravadas em `flow-bridge/data/suggestions.json` e expostas via `/api/flow-suggestions`. O agente as lê e as aplica ao repositório via `bombardier-flow-bridge-solve`.

**Nota:** o editor de UX Flows migrou para serverless — o bridge original (`bombardier-flow-bridge`) é considerado obsoleto e serve hoje apenas como documentação da cutover.

### Edit Bridge (`bridge-edit/`, porta 9877)

`npm run edit-bridge:dev` | Atalho `⌘⇧L` | Gate: `NEXT_PUBLIC_CLAUDE_EDIT_ENABLED=true`

O Edit Bridge é o bridge mais poderoso e o mais próximo do futuro do design tooling: um copilot flutuante que aparece sobreposto a qualquer tela do produto. O designer clica num elemento com um cursor seletor (estilo Cursor IDE), o elemento vira referência no chat, e o Claude edita o arquivo correspondente diretamente.

É o "cliquei, descrevi, virou código" — sem ter que abrir o editor, sem procurar o arquivo, sem contexto perdido.

---

## Skills — instruções para agentes

`.claude/skills/` e `.agents/`

O Bombardier não é só UI — é também um conjunto de skills que instruem agentes de IA (Claude Code, Cursor, Codex) a produzir output consistente com o design system.

**Skills do Design System:**

| Skill | Quando usar |
|---|---|
| `bombardier-design-system-foundation` | Bootstrap do DS a partir de referência visual. **Única skill autorizada a criar tokens.** |
| `bombardier-new-component` | Adicionar componente ao DS (shadcn wrapper + showcase + nav). Sempre `Aw*` em `components/ui/`. |
| `bombardier-new-page` | Construir página completa a partir de screenshot/Figma/brief, reutilizando componentes do DS. |
| `bombardier-design-system-audit` | Auditar consistência (tokens/componentes/showcases/nav); sincronizar com referência. |

**Por que skills importam:**
Sem skills, um agente genérico cria `Button.tsx` na raiz do projeto, usa `#FF5733` hardcoded, e ignora que existe um `AwButton` com variantes de intent já documentado. Com skills, o agente sabe a convenção `Aw*`, sabe que tokens são sagrados, sabe a cascata shadcn, sabe onde criar o showcase. A skill é a diferença entre output que acumula dívida e output que fortalece o sistema.

**Roteamento explícito:**
O Bombardier define uma tabela de roteamento que proíbe o uso de skills genéricas quando existe uma skill local equivalente:

| Intenção | Use | Evite |
|---|---|---|
| Adicionar componente | `bombardier-new-component` | `design-system-new-component` (genérica, sem prefixo `Aw`) |
| Construir página | `bombardier-new-page` | `design-system-new-page` |
| Bootstrap DS/tokens | `bombardier-design-system-foundation` | `setup-design-system-from-*` |
| UX Writing no produto | `bombardier-ux-writing` | `ux-copy` (EN) ou `awsales-brand-voice` (voz de marketing) |

---

## O modelo mental

O Bombardier parte de uma premissa simples: **o design system real é código**.

Não é Figma. Figma é direção visual, referência, exploração. Mas a fonte da verdade que devs consomem, que o produto renderiza, que agentes de IA seguem — essa vive no repositório. O Styleguide documenta ela. O Page Builder deixa o designer criar diretamente sobre ela. Os UX Flows ligam cada tela ao código que a implementa. Os bridges permitem que o time inteiro colabore sobre ela. As skills garantem que agentes respeitem ela.

Cada camada do Bombardier existe para reduzir a distância entre a intenção do designer e o que aparece em produção.

---

## Stack técnica

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (`@theme` block, sem `tailwind.config.ts`) + CSS Variables
- **State**: Zustand 5 com persist middleware
- **Drag-and-drop**: `@dnd-kit/core`
- **IA**: `@anthropic-ai/claude-agent-sdk` + Claude Code CLI (auth via `claude login`)
- **Node editor** (UX Flow): `@xyflow/react`
- **Validação**: Zod
- **Fontes**: Geist (UI), Geist Mono (código), Material Symbols Rounded (ícones)
- **Primitivos de componente**: shadcn/ui (gerados por CLI, encapsulados por wrappers `Aw*`)

---

*Bombardier é um produto interno da AwSales. Construído por Gregório Pinheiro.*
