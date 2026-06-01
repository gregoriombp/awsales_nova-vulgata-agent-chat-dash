# AwSales — Project Context

> **Leia este arquivo pra entender o produto AwSales (sobre o quê estamos desenhando).**
> Para regras técnicas do repo (convenções, tokens, cascata shadcn, skills disponíveis), **leia [AGENTS.md](./AGENTS.md) primeiro** e [CLAUDE.md](./CLAUDE.md).
> Para o toolkit visual: [BOMBARDIER.md](./BOMBARDIER.md). Para o método: [README.md](./README.md). (Histórico de decisões: `git log` — não há CHANGELOG.md neste repo.)

---

## O que este repo é (com nuance)

**É um Product Builder construído com o método Bombardier (design-as-product)** para a plataforma AwSales 2.0.

- O design system real (`components/ui/Aw*` + tokens em `app/globals.css`) é a **fonte da verdade** consumida por devs que implementam a plataforma de produção
- As rotas em `app/` são **mockups funcionais** da plataforma — devem rodar como live-preview com comportamento, não esboço
- O usuário é **product builder/designer**, não dev
- Bombardier é o ambiente: app in-repo + skills (locais e globais) + bridges + MCPs

**Importante: protótipo NÃO significa "pode ser falso".**
- Não inserir `// TODO`, `// would call API here` em live-preview
- Não colocar texto placeholder na UI ("Imagine que aqui tem X")
- Não deixar botão sem feedback quando deveria responder visualmente
- Dados mock plausíveis, estados, transições, comportamento visível
- Live-preview = "como vai parecer e se comportar pro usuário"

**A plataforma AwSales de produção** (com GCP, vector DBs, 28k conversas simultâneas, WhatsApp Official API, 100+ integrações) é construída separadamente. Este repo é a fonte de verdade visual + comportamental que devs consomem.

### Workflow de design oficial (definido em 2026-02-25)

Confirmado em #team-awsales-product-design (mensagem do Greg, 25/02):

- **Agent Studio + Memory Base**: únicos módulos com todos os estados e telas desenhados no Figma (Flow library AW). Esses dois precisam estar completamente claros pra qualquer pessoa que visualize o projeto.
- **Resto da plataforma**: workflow misto — Figma é direção visual (fluxos principais e decisões), mas a validação acontece nos **protótipos altamente realistas rodando no navegador** (este repo).
- **FigJam dedicado por feature**: navegação, branches e decisões de fluxo vão pra FigJam separado por feature. Cada `page.tsx` com flow desenhado carrega `// Flow: <url>` como primeira linha não-import.

Inspirações citadas pelo Greg pra esse modelo:
- "Design with Claude Code: The Designer's Guide" — Kirk Mark
- "How I Vibe Code as a Designer at Intercom" — Jay (Intercom Finn, concorrente)

### Time de design (AWSD no Linear)

- **Greg** — pente-fino Agent Studio + Memory Base, validar entregas
- **Denise Costa de Almeida** — Login, Integrações, Financeiro (redesign), protótipo interativo Agent Studio + Memory Base
- **PG (Paulo Guilherme Graham)** — review (fluxo de Time, Memory Base, Agent Studio)
- **José Junior (CPTO)** — site Framer, animações, ideação de produto

### Bridges locais (3 servidores Node rodando paralelos)

| Bridge | Porta | Script | O que faz |
|---|---|---|---|
| `bridge/` | 9876 | `npm run bridge:dev` | Page Builder do Bombardier — AI Copilot in-canvas que gera `BuilderNode[]` |
| `bridge-edit/` | 9877 | `npm run edit-bridge:dev` | **Claude Code edit overlay** — copilot flutuante que aparece sobre qualquer tela, com cursor seletor estilo Cursor (clica num elemento, vira referência no chat, Claude edita o arquivo). Atalho `⌘⇧L`. Gated por `NEXT_PUBLIC_CLAUDE_EDIT_ENABLED=true`. |
| `review-bridge/` | (LAN) | `npm run review-bridge` | Sincroniza comentários do Bombardier Review Mode entre revisores na mesma rede local (SSE + POST, lowdb, auth por token) |

Cada designer usa **sua própria conta Claude** via `claude login` — zero chaves no servidor do produto.

---

## Sobre a AwSales (o produto que estamos desenhando)

### Posicionamento oficial (site)

**Tagline**: "Infraestrutura autônoma de vendas e atendimento."

**One-liner**: "Agentes de IA que constroem conhecimento, executam transações e se otimizam por receita. Sem supervisão contínua. Sem escalar headcount."

**Categoria interna**: Autonomous Service Builder (ASB) — infraestrutura de IA de próxima geração para agentes autônomos de vendas e serviços.

**Posicionamento de mercado**: "Maior infraestrutura de agentes autônomos de IA da América Latina."

**NÃO é** chatbot, **NÃO é** workflow tool, **NÃO é** dashboard de vendas.

### Categoria de Mercado

**Service-as-a-Software** — vende trabalho executado, não licenças. Wave 3 (Agent-Native), ao lado de Sierra e Decagon.

### Distinção crítica

- **Outros produtos**: focam em qualidade de conversa
- **AwSales**: foca em **qualidade de resultado** (outcome quality)

Sucesso = move um lead pra frente, resolve um ticket, dispara a próxima ação. **Não** = "soa inteligente".

### Histórico

Nasce da **Mamba Culture** (junho/2020), que também criou:
- **AwFunnels** — 580k alunos
- **Assiny** — gateway de pagamento

Marca-mãe: **Mamba** (workspace Slack: awsalesmamba).

---

## Voz: site ≠ produto

**Site vende. Produto resolve.** São duas vozes diferentes — não confundir.

### Site / marketing (awsales.io) — vende
Tom curto, afirmativo, posicionamento de categoria. Frases-âncora pra hero, copy de venda, redes:
- "Sem fluxogramas."
- "Sem supervisão contínua. Sem escalar headcount."
- "Uma operação que roda sozinha."
- "Você dá o objetivo. Nós construímos."
- "Crie. Teste. Coloque no ar."

Usar **somente** em landing pages, materiais comerciais, redes. **Nunca dentro do produto.**

### Produto (Agent Studio, Memory base, etc.) — resolve

Tom **instrucional, descritivo, prestativo**. Cada texto ajuda o usuário a entender o que algo faz, por que existe, e o que vai acontecer ao clicar. Sem hype, sem slogan, sem "transformamos seu negócio".

**Características da voz no produto:**

- **Imperativo amigável + objetivo claro**:
  - "Configure como o áudio recebido é processado e tratado."
  - "Selecione Integrações que seu Agente utilizará como habilidades."
  - "Defina o objetivo principal para começar a configurar o comportamento do agente."

- **Mecânica explícita** (o produto sempre diz como funciona por baixo):
  - "A cada 5 minutos, o sistema verifica todas as conversas ativas da campanha, identificando leads que não responderam dentro do período configurado."
  - "Sempre que o lead responde, o contador de inatividade é zerado e a contagem recomeça."
  - "Se um lembrete cair fora da janela, ele é ajustado automaticamente para o horário permitido mais próximo."

- **Empty state que ensina (não vende)**:
  - "Crie sua primeira conversa para testar o seu agente."
  - "Bem vindo ao Agent Studio — Crie seu primeiro agente em menos de 90 minutos."
  - "Crie seu primeiro follow-up — Automatize o reengajamento de leads com inteligência artificial."

- **Mensagens de status calmas**:
  - "Alterações salvas há 0 segundos"
  - "Salvo como rascunho às 13:48"
  - "Online" · "Ativo"

- **Erros que orientam, não julgam**:
  - "Prompt de comando vazio. O prompt de comando é obrigatório para publicar o agente."
  - "Nenhuma variável foi encontrada. Adicione pelo menos uma para garantir o funcionamento do agente."
  - "Não configurado"

- **Recomendações ancoradas em razão**:
  - "Tudo pronto para execução. O agente já pode operar com base nas configurações definidas."
  - "As configurações de checkpoint, integrações e base de conhecimento não estão otimizadas para o objetivo do agente."

- **Help text contextual e técnico mas digestível**:
  - "Define a janela de horário para envio de mensagens (ex: 08:00 às 22:00). Mensagens agendadas fora deste horário são automaticamente reagendadas para o próximo horário permitido."
  - "Verifica se a conversa está dentro da janela de horário permitido, não atingiu o limite de follow-ups e não possui agendamentos conflitantes."

### Anti-padrões no produto
- Slogans / âncoras de marketing dentro de UI ("Você dá o objetivo, nós construímos" não vai em label/help)
- "Transformamos", "revolucionamos", "potencializamos"
- "Inteligência artificial de ponta", "tecnologia de última geração"
- Adjetivos sem dado por trás
- "Imagine que aqui tem X" — placeholder textual
- "Em breve" como conteúdo de feature (Coming Soon é página, não copy de label)

### Anti-padrões no site também
"fluxograma", "chatbot", "supervisão contínua", "assistente AI genérico" — rejeitados em qualquer contexto.

---

## Filosofia que guia o design

### Agentes não conversam — eles executam

- **Goal-driven**, não free-form
- **Context-scoped**, não knowledge-dumped
- **Operational**, não experimental

Devem parecer "um operador júnior executando um playbook" — não "assistente AI genérico".

### Knowledge as an Operating System

Conhecimento não é só "docs upados", é um sistema operacional.

Fluxo:
1. **Memory Base / Knowledge OS** → workspace onde conhecimento vive
2. **Knowledge Base** → container de sources (docs, páginas, integrações)
3. **Knowledge Layers** → "pílulas" extraídas das fontes (Q&A, definições), não arquivos brutos
4. **Objective-Bound Knowledge Layers** → layers para um objetivo customizado

**5 tipos de Knowledge Layers por agente:**
1. **Base Knowledge** — de docs uploaded
2. **Human Knowledge** — melhorias de admins
3. **User Knowledge** — de interações com end users
4. **Auto Knowledge** — dedução/inferência autônoma
5. **Agent Interaction Knowledge** — aprendizado entre agentes

---

## Arquitetura do Produto AwSales (referência pra design)

### 3 Blocos Estruturais do ASB

1. **Agent Builder (Ingestão Autônoma)** — Ingere PDFs/CRM/scripts → gera base de conhecimento, tom, políticas. *14 dias* até operação em produção (site) / *90 min* para agente criado (interno).
2. **Execution Engine (Orquestração Multi-Agente)** — Ações transacionais reais, multi-canal, "Team-Swarm" paralelo, transições entre funções na mesma conversa. *28k conversas simultâneas*.
3. **Optimization Brain (Auto-Melhoria)** — Auto-otimiza por receita/conversão, Human Handoff Learning Loop (CERN), testes paralelos, herança de aprendizado. *9.95x ROI* (G4 Educação).

### Módulos públicos (vocabulário oficial do site)

- **Agent Studio** — criação, configuração e publicação de agentes
- **AgentsCore™** — framework/arquitetura base do agente
- **Natural Logic Board** — lógica conversacional em texto estruturado (sem flowcharts)
- **Playground e Simulações** — testes antes da publicação
- **AOPs — Agentic Operational Procedures** — instruções operacionais em linguagem natural
- **Memory Base** — gestão de conhecimento ("cérebro" dos agentes)
- **Cortex** — monitoramento real-time e auto-otimização

### Tecnologia Proprietária (mencionar em UI quando relevante)

- **Cortex** — monitora, identifica barreiras, auto-otimiza
- **Conversational Flywheel** — 5 etapas (entender → conectar → assistir → executar → otimizar)
- **Constellations** — multi-modelo (OpenAI, Anthropic, Meta) com escolha inteligente

### Agentes — naming por contexto

**No produto (UI, Agent Studio, dashboards): "Agente"**
Confirmado no Figma — em todo lugar do produto se fala "Agente":
- "Agent Studio"
- "Crie seu primeiro agente"
- "Agente de Recuperação de Vendas"
- "Qualidade do agente"
- "Bem vindo ao Agent Studio"

**No site / marketing: "Specialist"** (Closer Specialist, Onboarding Specialist, Support Specialist) — é o termo de categorização comercial, não o naming interno do produto.

**Em métricas/casos internos**: Onboarding Agent (3.21x uplift), Launch Agent (4x conversão), ShowUp Agent (presença), Sales Agent (até 35x ROI) — também "Agent".

> **Regra**: dentro do produto, sempre "Agente". "Specialist" só em copy de site/marketing.

### Vocabulário operacional do produto (confirmado no Figma)

Termos canônicos pra usar em UI:

- **Agente** — entidade que executa
- **Agente Core™** — arquetipo base (ex: "Meeting Recovery"), seleciona via Wizard
- **Objetivo** — o que o agente faz (ex: "Recuperação de leads")
- **Checkpoint** — etapa estruturada da conversa com:
  - **Objetivo** (do checkpoint, ex: "Estabelecer conexão calorosa")
  - **Ações** / **Diretrizes** / **Classificação** das respostas possíveis
  - **Personalização com variáveis** `{{lead_name}}`, `{{customer.name}}`
- **Prompt do agente** — system prompt em texto livre
- **AOPs** — procedimentos invocáveis com `@aop.NomeDoAOP` (ex: `@aop.ProcedimentosReembolso`, `@aop.CasesDeSucesso`)
- **Habilidades / Tools** — integrações invocáveis com `@` (ex: `@company.case`, `@agent.responseGuardrails`)
- **Variáveis** — sistema (`@agent.*`) vs usuário (`{{custom}}`), inseridas via `{{ }}` no checkpoint
- **Knowledge layers / Base de conhecimento** — fontes consultadas pelo agente
- **Memory base** — repositório de bases de conhecimento
- **Templates** — mensagens pré-formatadas (ex: `abertura_padrao_fyntra`, `pagamento_falhou`)
- **Triggers / Eventos acionadores** — disparam o agente (ex: "Assinatura criada", "Carrinho abandonado")
- **Origens e Conversões** — de onde vem o lead, eventos de conversão (Stripe, etc.)
- **Canais** — WhatsApp, web, email (selecionados por agente)
- **Follow-up** com três blocos:
  - **Sequência de inatividade** — cadência fixa após silêncio
  - **Análise inteligente** — IA decide quando reengajar (Smart follow-up)
  - **Lembretes** — antes de eventos agendados
- **Playground** — testar conversa com lead mockado
- **Handoff / Transferência para humano** — quando IA escalona pra operador humano
- **Insights** — analytics e recomendações por agente
- **Versão do checkpoint** — comparar versão anterior x atual
- **Qualidade do agente** — score (Excelente / Média / Ruim) com explicação ancorada
- **Compatibilidade** — score entre objetivo e base de conhecimento

### Quando desenhar Agent Studio, manter separação clara:

- **Identity/personality** (estático: nome, tom)
- **Operational flow/checkpoints** (Natural Logic Board — texto estruturado, não flowchart)
- **Tools/actions** (Habilidades, AOPs, Integrações invocadas com `@`)
- **Variables/data** (Knowledge layers + variáveis `{{ }}`)

---

## Stack visual (fontes, tokens, libs)

**Fontes** (carregadas em `app/layout.tsx`):
- **Geist** — texto/UI
- **Geist Mono** — código/monoespaçado
- **Material Symbols Rounded** — ícones

(Histórico: até 04/05/2026, comentários e docs ainda mencionavam Mona Sans / JetBrains Mono — drift corrigido.)

**Tokens** (10 paletas + semantic + dark shell + radius/spacing/motion) em `app/globals.css` + mapeamento Tailwind em `tailwind.config.ts`. Hard rule: **só `bombardier-design-system-foundation` cria tokens novos** — qualquer outro skill ou agente que precisar de um token inexistente reporta o gap em vez de criar. Ver AGENTS.md regra #2.

**Libs principais**:
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v3.4
- Zustand (estado)
- React Hook Form + Zod (forms)
- Recharts (charts)
- @xyflow/react (graphs/flow)
- dnd-kit (drag and drop)
- @anthropic-ai/sdk + @google/genai (AI SDKs)

> A stack da plataforma AwSales de produção é outra (GCP, vector DBs Pinecone/Weaviate/Qdrant, WhatsApp Official API). Veja `/Users/gregoriopinheiro/Desktop/Projects/Working/AwSales/Docs/07-technology-infrastructure.md`.

---

## Mockups neste repo

Rotas existentes em `app/` (confirmadas em maio/2026) — cada uma em estado próprio. **Conferir visualmente antes de assumir** se está pronta, parcial ou stub:

`agent-studio`, `agent-studio-v2`, `aops`, `approvals`, `canais`, `conversations`, `dashboard`, `history`, `inicio` (home logada), `insights`, `integrations`, `knowledge-os`, `library`, `memory-base`, `playground`, `primeiro-acesso`, `settings`, `setup`, `tools`, `triggers`

**Onde focar dependendo do contexto**:
- **Agent Studio e Memory Base** — também detalhados completamente no Figma (Flow library AW). Toda iteração deve cruzar com o Figma desse fluxo.
- **Outras telas** — Figma é direção; protótipo no browser é validação. Pode iterar direto no código.

A rota `bombardier/*` é o toolkit:
- **`/bombardier/styleguide`** — styleguide canônico (URL pública `/styleguide` redireciona pra cá). Fonte da verdade do DS.
- **`/bombardier/page-builder`** — subproduto Bombardier, em desenvolvimento.
- **`/bombardier/ux-flow`** — subproduto Bombardier, em desenvolvimento.
- **`/bombardier/projects`** — gestão de projetos do Page Builder.

### Topic ativo (12/05/2026): fluxo de handoff humano

José teve ideia importante (DM com PG): hoje, quando IA escalona pra humano, o cliente entra na fila e recebe "aguardando atendimento" — mas quando atendente assume, muitas vezes não chega mensagem confirmando, gerando "limbo". Proposta:

1. **Mensagem automática de apresentação** quando atendente assume o ticket: "Olá! Aqui é a {{attendant_name}}, estou pronta para te atender :)"
2. **Mensagem contextual gerada por IA** com resumo do que o cliente parece precisar resolver: "Você está buscando resolver o problema de reembolso do pedido X, correto?"

Benefícios: evitar abandono percebido, dar contexto pro atendente, possibilitar SLA a partir do momento do assume.

---

## Princípios de UX/Produto

### Otimizamos para:
- **Clareza** > cleverness
- **Controle** sem complexidade
- **Onboarding** que ensina o mental model
- **Criação rápida** de agentes
- **Separação limpa** entre identity, flow, tools, data

### O que NÃO fazer:
- Tratar como "só um chatbot com documentos"
- Forçar usuário a um único objetivo fixo pro conhecimento todo
- Otimizar pra pureza técnica — otimize pro **mental model do usuário**
- Usar "fluxograma" como mental model — marca explicitamente rejeita

### Regra de ouro

Quando indeciso, escolha a opção que melhora o entendimento do usuário sobre:
1. **O que o agente sabe**
2. **Por que ele sabe isso**
3. **Como esse conhecimento vira ação**

---

## Dados mock realistas (pra usar em mockups)

> Pense em **dados operacionais plausíveis pra um agente real rodando**, não em metrics-de-pitch. Os números abaixo são pra ter à mão se uma tela precisar de "valores de exemplo" — mas o produto não fica martelando essas métricas na cara do usuário.

### Métricas que aparecem na UI (Figma)
- **Qualidade do agente**: 94% (Excelente) / 64% (Média) / 10% (Ruim) — sempre com texto explicando o porquê
- **Custo total de tokens**: `$1.9776` (696.115 tokens) com breakdown por modelo (gemini-3-flash-preview: $4.9426 / 976.462 tokens)
- **Latências de raciocínio**: `1720ms` (Raciocínio), `680ms` (Atualizações de checkpoint), `1420ms` (Ações), `1820ms` (Decisão)
- **Compatibilidade**: "Alta Compatibilidade" / score qualitativo
- **Status de gatilhos**: "8 de 9 gatilhos ativos"
- **Uso de Knowledge layer**: "Utilizado por 2 agentes"

### Exemplos de agentes reais (do Figma — usar como mock)
- **Agente de recuperação de leads aquecidos** — Objetivo: Recuperação de leads · Agente Core: Meeting Recovery · Programação: 09/04/2026 17:00
- **Agente de Recuperação de Vendas** — empresa Fyntra
- **Andrea Faccio** — nome social do agente (SDR especializado)

### Empresas/contextos de exemplo (do Figma)
- **Fyntra** — financiamento pré-acordo, B2C
- Eventos: assinatura_criada, carrinho_abandonado, pagamento_falhou, reembolso_iniciado, etc.

### Clientes reais (pra usar quando faz sentido)
- **Uniasselvi** (500k alunos) — +690% no 1º tri
- **G4 Educação** — 35k leads Black Friday, 9.95x ROI
- **Emive** — segurança residencial
- **Maíra Cardi** — case "Seca Você" (2025): +R$344k recuperados, ROI 8.75x, +5.000 conversas simultâneas
- Outros: Grupo Vitru, Tambasa, Conta Simples, StartSe, Unicesumar

### Métricas agregadas (referência — não martelar no produto)
- 6.8M conversas iniciadas em 2025
- 200+ empresas clientes
- +100 integrações
- 90 min até agente criado (uso interno no produto, ex: "Crie seu primeiro agente em menos de 90 minutos")
- 14 dias até operação completa em produção (uso externo, site)

---

## Missão, Visão, Valores

### Missão
**Pública**: Escalar vendas sem escalar custos através de agentes autônomos de IA.
**Interna**: Substituir lógica de ferramenta por lógica de trabalho executado.

### Visão
"Departamentos comerciais que pensam, agem e evoluem sozinhos."

### Valores
1. **Resultados acima de vaidade**
2. **Autonomia com responsabilidade**
3. **Velocidade com profundidade**
4. **Design como infraestrutura**
5. **Obsessão pelo cliente do cliente**

---

## Fundadores e estrutura

- **José Júnior** — Co-fundador e CPTO (Chief Product & Technology Officer, BH)
- **Gabriel Lima** — Co-fundador e CEO
- **Sede**: Vila da Serra, Nova Lima/MG
- **Operação**: Juiz de Fora/MG

### Parcerias estratégicas
- **Meta Business Partner** (WhatsApp Official API)
- **AWS Partner**, **Oracle Partner**
- Parceiro estratégico do **iFood** (iFood Lab Techbites)

---

## Como usar este contexto

1. **Antes de mexer em código**: ler [AGENTS.md](./AGENTS.md) (hard rules: convenção `Aw`, tokens, shadcn flow) e [CLAUDE.md](./CLAUDE.md) (detalhe da convenção `Aw`).
2. **Antes de mexer em styleguide**: ler [docs/styleguide-page-structure.md](./docs/styleguide-page-structure.md) (14-15 seções canônicas).
3. **Sobre o método Bombardier (design-as-product)**: manual canônico em `~/Desktop/Projects/Working/Bombardier Skills/Bombardier — Manual.md`. Toolkit in-repo: [BOMBARDIER.md](./BOMBARDIER.md).
4. **Histórico de decisões do repo**: `git log` (não há CHANGELOG.md neste repo).
5. **Sobre o produto AwSales (marca, voz, copy)**:
   - https://awsales.io — fonte de verdade pública (lembrando: site vende, produto resolve).
   - **Figma "Flow library AW"** (file `PF6nVIX0dn5zlcxL1CoyLh`) — Agent Studio + Memory Base detalhados, fonte da verdade visual + textual do produto. Não é só layout — tem o texto canônico de UI (help text, labels, empty states).
   - `/Users/gregoriopinheiro/Desktop/Projects/Working/AwSales/Docs/` — base de conhecimento completa da empresa.
6. **Dúvida de UX?** Pergunte: "isso ajuda o usuário a entender o que o agente sabe e como isso vira ação?".
7. **Decisões já tomadas?** Pergunte ao Greg (não há `docs/decisions.md` neste repo).

### Base de conhecimento expandida (`/Docs/` na raiz do AwSales)

13 docs internos + pasta `brand/`:
- `01-company-overview.md` → identidade, números, fundadores
- `02-product-architecture.md` → 3 blocos ASB, tech proprietária
- `03-platform-modules.md` → Memory Base, Agent Studio, AOPs, NEO
- `04-competitive-positioning.md` → Waves, benchmarks
- `05-strategic-roadmap.md` → Horizontes 1-3
- `06-team-and-organization.md` → equipe, papéis
- `07-technology-infrastructure.md` → stack da plataforma real
- `08-clients-and-results.md` → cases, métricas
- `09-business-model-pricing.md` → modelo financeiro
- `10-marketing-and-presence.md` → presença, redes
- `11-active-projects.md` → projetos em andamento
- `12-finops-and-operations.md` → FinOps GCP
- `13-values-and-culture.md` → cultura, rituais
- `brand/` → posicionamento, voz, tom, linguagem, messaging

---

**Última atualização**: 2026-05-12 (sincronizado com site, Figma Flow library AW, AGENTS.md/CLAUDE.md/README.md desta versão do repo, e canal #team-awsales-product-design no Slack).
