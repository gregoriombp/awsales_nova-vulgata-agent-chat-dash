# Memory Base — rework do index (cards/lista) + visão de produto

> Documento de plano. Escrito em **2026-06-07**. Repo é **preview de UX/UI**, não
> fonte de verdade — toda persistência é `localStorage`, sem backend. O Figma
> ([Flow library AW, node `1241-83691`](https://www.figma.com/design/PF6nVIX0dn5zlcxL1CoyLh/Flow-library--AW-?node-id=1241-83691))
> é **referência, não design final** — não precisa ser 100% fiel.

---

## 1. Visão de produto — as 3 camadas

O produto tem uma hierarquia de 3 níveis. Acertar a linguagem e os ícones disso
é o que mantém a UI coerente:

| Camada | O que é | Ícone no repo |
|---|---|---|
| **Memory Base** | O **produto** dentro da AwSales (a base de conhecimento). O usuário cria quantas *bases de conhecimento* quiser aqui dentro. | `AwMemoryBaseLogo` / `MemoryBaseIcon` (grade pontilhada) |
| **Base de conhecimento** | Cada item da lista. Reúne **fontes** (arquivos, integrações, sites). As fontes são analisadas por uma IA em background. | ícone de instituição/biblioteca (`account_balance`) |
| **Knowledge Layers** | Resultado da análise da IA sobre **uma fonte**. Ex.: um PDF vira 17 knowledge layers. A **soma** dos layers de todas as fontes = total de knowledge layers da base. | 3 camadas verticais (`layers`) |

**Implicações de UX que decorrem disso:**
- "Criar base" cria uma **base de conhecimento**, não uma "memory base" (a Memory Base já existe, é o produto).
- A contagem de Knowledge Layers de uma base é **derivada** (soma das fontes) — read-only, nunca editável direto na base.
- Fonte → (IA) → Knowledge Layers é um processo **assíncrono**: a fonte tem estados (Analisando → Ativo / Erro). É isso que o detalhe da base já modela em `SourceRow.status`.

---

## 2. O que o Figma propunha vs. a direção enxuta adotada

O Figma trazia o index como um **dashboard denso**: tabela de **11 colunas** +
**5 dropdowns de filtro** + date picker + toggle Cards/Lista.

Referências do mesmo padrão no Mobbin (Slite, HubSpot, Front) param em **3-6
colunas + 2-3 filtros + busca**. Densidade de 11/5 é mais pesada que o que
OpenAI/ElevenLabs-class shippa. Então a direção é **enxuta**:

| Área | Figma (fiel) | Adotado (enxuto) |
|---|---|---|
| Colunas da tabela | 11 + scroll horizontal | **6**, cabe no painel |
| Filtros | 5 dropdowns + data | **2** (Status, Objetivo) + busca |
| Card | 2 pills + 3 stats | 2 pills (objetivo/segmento) + 2 stats (fontes/layers) |

Dados cortados da **tabela** (Tipo de dados, Produtos) e da subtítulo
(Objetivo·Segmento foi dobrado no nome): vivem na **tela de detalhe**, não na
visão de lista.

---

## 3. Arquitetura atual no repo

```
app/memory-base/
  page.tsx              # index — 3 estados (welcome / empty / populated)
  [id]/page.tsx         # detalhe da base (~2k linhas): header, fontes, drawer, tour

components/memory-base/
  knowledgeBases.ts     # modelo KnowledgeBase + MOCK_KNOWLEDGE_BASES (6) + helpers
  KnowledgeBaseExplorer.tsx  # toolbar (busca + filtros + toggle) + grid/tabela
  KnowledgeBaseCard.tsx      # card da base (view "cards")
  KnowledgeBaseTable.tsx     # linha da base (view "lista")
  MemoryBaseIcon.tsx         # ícone do produto (grade pontilhada)
  MemoryBaseSidebar.tsx      # sidebar dentro de uma base
```

**Modelo de dados** (`KnowledgeBase`): `id, name, status, objetivo, segmento,
tipoDados, produtos, fontes, knowledgeLayers, agents[], updatedAt`.

**Estados do index** (fixos no protótipo, viriam do backend):
- `welcome` → primeiro acesso de todos (cena cheia do shader Synthesis).
- `empty` → recorrente sem nenhuma base (card vazio + CTA).
- `populated` → ≥1 base (busca + filtros + cards/lista). **← estado atual fixo.**

**Fluxo de criação (round-trip — corrigido nesta sessão):**
1. `Criar base` → `createMemoryBase()` grava em `localStorage` (`memory-bases-list`
   + `memory-base-name-<id>` + `memory-base-empty-<id>`) e navega pra
   `/memory-base/<id>?new=1`.
2. O detalhe lê `?new=1` → base vazia + tour de onboarding.
3. O index agora **mescla** as bases do `localStorage` com as mock
   (`loadCreatedBases()`), então a base recém-criada **aparece na lista** com um
   selo "Nova" até ser configurada.

---

## 4. Feito nesta sessão (2026-06-07)

- [x] Index ligado ao `KnowledgeBaseExplorer` (já estava — outro agente, commit `b80053f`).
- [x] **Passo de simplificação** (working tree, gate visual do user):
  - Tabela 11→6 colunas, sem scroll horizontal (`KnowledgeBaseTable.tsx`).
  - Filtros 5→2 (Status + Objetivo); removidos Segmento, Tipo de dados, DateFilter (`KnowledgeBaseExplorer.tsx`).
  - Card aliviado (`KnowledgeBaseCard.tsx`).
- [x] **Round-trip de criação** funcionando: index mescla bases do `localStorage`
  e mostra selo "Nova" pras não-configuradas (`page.tsx`, card, tabela).
- [x] Typecheck limpo nos arquivos de memory-base.

---

## 4b. Round 2 — comentários do Review Bridge (2026-06-07)

Resolvidos (6/8) — código no working tree:

- [x] **Criar base** (`/memory-base`): botão agora abre `CreateBaseModal` (nomear → criar → abrir a base nova). Antes caía numa base vazia sem feedback.
- [x] **Avatares dos agentes** (detalhe): "Utilizado por N agentes" mostra os orbs reais (`getOrbForAgent`), não o ícone genérico.
- [x] **Grayscale** (detalhe): chips de tipo de arquivo viraram tokens grayscale; links `#0066cc` (Agent Studio / Semantic Search) ficaram neutros. Sem slate/azul.
- [x] **Ícone da base** (detalhe): `FolderIconBase` → `account_balance` (biblioteca/instituição), consistente com a lista.
- [x] **Breadcrumb duplicado** (detalhe): removido o breadcrumb interno do header — sobra só o do dashboard.
- [x] **Menu ⋯ por item** (`/memory-base`): cards e tabela ganharam menu de ações (Ver / Excluir). Excluir remove da lista + do localStorage.

Pendentes (2/8) — precisam de mais escopo / input:

- [ ] **Ícones de integração canônicos** (cmt bridge): trocar `getIntegrationIconUrl(DEFAULT_INTEGRATIONS)` + `ActivateIntegrationsModal` por `AwBrandLogo` / `integrationsCatalog` (fonte que o styleguide usa em `/bombardier/styleguide/components/integration-catalog`). Mapear `name` → brand key.
- [ ] **Elemento "legacy"** (cmt bridge): o usuário pediu pra avaliar se um elemento da tela de detalhe faz sentido — precisa do ponteiro exato (anchor do review drifta).

> ⚠️ Não consegui marcar os comentários como `in_review` no bridge: o servidor
> em execução está com um token defasado (foi iniciado antes do token ser
> regenerado; `.env.local` e `review-bridge/.env` não batem com o processo vivo).
> Reiniciar o bridge sincroniza — aí dá pra postar os replies/transições.

## 4c. Round 3 — fluxo de criação + styleguide (2026-06-07)

Feito:

- [x] **Fluxo de criação completo** (`CreateBaseModal`): além do nome, classifica a
  base — **Objetivo · Segmento · Tipo de dados** (Catálogo, Produto físico…),
  opções vindas do catálogo + valor livre. Era o gap apontado: "cadê as opções
  de seleção de tipo que estavam no Figma?". A base nasce com metadado real
  (objetivo/segmento persistidos no localStorage; não cai mais como "Nova").
- [x] **Ícone do header da base**: 52px → 26px num chip `bg-white/10` (estava
  grande demais; Material Symbols `account_balance`).
- [x] **Ícone "+" dos cards "Adicione Fontes"**: SVG 24px bold → `Icon "add"` 20px
  (Material Symbols / styleguide).
- [x] **Ícone do nav "Memory base"** (`AwSidebar`): `hub` → glifo real da Memory
  Base (grade pontilhada). Registrado como `memory_base` no `Icon` (mesmo padrão
  do `agent_studio`), via `MemoryBaseIcon` com currentColor.

- [x] **Sidebar contextual legacy → tabs no header** (decisão do Greg): removi
  `<MemoryBaseSidebar/>` do `AwDashboardLayout` e movi Documentos / Busca
  semântica / Configurações pra tabs no header escuro da base. Não orfanou nada
  (`/semantic-search` e `/settings` já não existiam como página). `MemoryBaseSidebar.tsx`
  ficou órfão — pode ser deletado.

## 4d. Round 4 — modais legacy → styleguide (2026-06-07)

- [x] **`BaseModal`** (casca compartilhada dos 4 modais de fonte + pastas) herda a
  casca visual do `AwModal`: scrim com blur + `--bg-raised` + `--radius-xl` +
  `--shadow-overlay` + animação `aw-modal-in`. API legada mantida, então todos os
  modais ganham o visual do styleguide de uma vez.
- [x] **`AddSnippetModal`**: tokens + `AwInput`/`AwField`.
- [x] **`SendFileModal`**: tokens + `AwButton` + `Icon` (Material Symbols); removeu
  o azul `#1a73e8` do upload; barra de progresso e chips de arquivo em grayscale.
- [x] **`ActivateIntegrationsModal`**: tokens + logos via **`AwBrandLogo`** (registry
  canônico — resolve também o comentário dos ícones de integração); checkbox
  tokenizado.
- [x] **`AddUrlFlow`**: títulos normalizados pro padrão do styleguide (já era
  grayscale; sweep leve pra não arriscar as 697 linhas do multi-step).

Commits: `a494a6e` (casca) + `3b1b47d` (conteúdo). **Ainda não pushado.**

## 5. Próximos passos (priorizados)

### P0 — coerência do fluxo de criação
- [ ] **Prompt de nome ao criar** (opcional): hoje cria com nome genérico "Base de
  conhecimento" e o usuário renomeia no detalhe. Avaliar um modal enxuto
  (nome + objetivo) antes de navegar — padrão Notion/Linear "create then configure".
- [ ] **Estado vazio real da base nova**: confirmar que `/memory-base/<id>?new=1`
  mostra bem o tour + a área de "adicionar fontes" (já existe, revisar copy à luz
  das 3 camadas: "Adicione fontes → a IA gera Knowledge Layers").

### P1 — coerência com o modelo de 3 camadas (tela de detalhe)
- [ ] Revisar a tela `[id]/page.tsx` pra deixar explícita a relação
  **fonte → (IA) → knowledge layers**: cada fonte mostra sua contagem de layers e
  o estado de análise; o header da base mostra a **soma**.
- [ ] Garantir os 3 ícones certos e consistentes: produto (grade), base
  (instituição), knowledge layers (3 camadas).

### P2 — design system
- [ ] Promover `KnowledgeBaseCard` / `KnowledgeBaseTable` a componentes do DS com
  showcase em `/bombardier/styleguide` se estabilizarem (hoje são feature-modules).
- [ ] Avaliar um `AwSegmentedControl` dedicado (hoje usa `AwTabs variant="segmented"`).

### P3 — quando a contagem de bases crescer
- [ ] Reintroduzir filtros cortados (Segmento, Tipo de dados, Data) — só quando o
  volume justificar. Hoje seria overspec.
- [ ] Ordenação por coluna na tabela (`AwMembersTable` já tem o padrão `sort`/`onSort`).

### Backend (fora do escopo do repo de preview)
- [ ] Trocar `localStorage` por API: lista de bases, criação, fontes, análise de IA
  (geração de knowledge layers), agentes que consomem a base.
- [ ] Estado do index (`welcome`/`empty`/`populated`) vem do backend (tem base?
  já passou da welcome?).

---

## 6. Decisões em aberto (pro Greg)

1. **Default do toggle**: hoje abre em **Cards**. Manter, ou abrir em **Lista**
   (como o Figma marcava)?
2. **Prompt de nome ao criar** vs. **criar-e-configurar** (atual)? 
3. Trazer de volta algum filtro/coluna cortado, ou manter enxuto?

> Atalho pra retomar: tudo de memory-base está em `app/memory-base/` +
> `components/memory-base/`. O modelo é `knowledgeBases.ts`. O round-trip de
> criação passa por `localStorage` (`memory-bases-list`).
