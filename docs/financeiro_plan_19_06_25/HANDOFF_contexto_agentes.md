# Handoff — Refatoração do Financeiro (contexto pros próximos agentes)

> **Leia isto primeiro.** Este é o ponto de entrada do trabalho de refatoração do Financeiro.
> **⚠️ Status (22/06/2026): a construção foi feita e MERGEADA na `main`.** P1 e P2 estão
> essencialmente prontos; P3 ~80%. **Não recomece do zero** — pule pra **§7 (Estado atual)** pra a
> lista exata do que falta. As seções 1–6 abaixo são o contexto/decisões originais (continuam válidos
> como referência, mas o "ainda não começou" já não vale).

Branch: o trabalho saiu de **`feat/financeiro-analytics-split`** → **`feat/financeiro-v2`** e foi
**absorvido na `main`** (em 22/06/2026 ambas as branches estão idênticas/atrás da `main`; nada ficou
preso fora dela).

---

## 0. TL;DR
- A área `/settings/financeiro` vai ser **dividida em duas páginas**: **Financeiro** (limpa/executiva)
  e **Detalhamento de custos** (Analytics pesado), conforme `PLANO_financeiro_split.md`.
- Execução **faseada** (P1 → P2 → P3). Nada de big bang.
- **Fonte de dados canônica:** o wireframe do PG (repo de referência, **só leitura**). As **decisões da
  reunião sobrescrevem** o wireframe quando divergem.
- Tudo é **fixture** (`_components/data.ts`) até existir backend.

---

## 1. O que o Greg pediu / o cenário
Houve uma **group review** (19/06) de todas as telas de `/settings`. O Greg gravou a tela com o
**wireframe do PG ao lado da hi-fi dele** e o time comentou ao vivo. O Financeiro é a área mais densa
e a que mais precisa de retrabalho. Ideia central: **uma página de Financeiro + outra dedicada a Analytics**.

O Gemini foi usado pra resumir a reunião (não precisa assistir o vídeo). **Atenção:** o Greg disse
explicitamente que o Gemini "inventa regras" — usar os notes do Gemini só como contexto, **a decisão é nossa**.

### Insumos (todos neste diretório, salvo indicação)
| Arquivo / caminho | O que é |
|---|---|
| `PLANO_financeiro_split.md` | **O plano aprovado.** Arquitetura, modelo de dados, componentes, regras, fases. |
| `review_comments_financeiro_digest.md` | Comentários do review filtrados só pra financeiro (acionáveis + resolvidos). Use isto em vez de reparsear os JSONs. |
| `group_review_meeting_Gemini_Notes.md` | Notas do Gemini sobre a reunião (contexto, **não** lei). |
| `group_review_meeting_Gemini_Resumo_doido_do_Gemini.md` | Prompts/resumos extras do Gemini (contexto). |
| `DIAGNOSTICO_review_bridge.md` | Diagnóstico do "sumiço" dos comentários na Vercel do PG (ver §5). |
| `/Users/gregoriopinheiro/Documents/PG_awsales-nova-vulgata-design-main-2` | **Repo do PG — SÓ REFERÊNCIA/leitura.** Nunca escrever lá. É a fonte do esquema de dados. |
| `~/Downloads/bombardier-review-2026-06-19.json` | Export A (304 cmts) — tem comentários do **Paulo Guilherme** no protótipo do PG. |
| `~/Downloads/bombardier-review-2026-06-19-2.json` | Export B (814 cmts) — é o **export do bridge local do Greg** (= `review-bridge/data/`). 20MB por causa de screenshots base64 no campo `images`. |
| `~/Downloads/Wireframe reorganization request.zip` | **NÃO é de financeiro** — é a tela "Segurança & acesso". Ignorar pra este escopo. |

---

## 2. Decisões travadas (com o Greg, nesta sessão)
1. **Split em 2 páginas.** Financeiro (executiva) + Detalhamento (Analytics).
2. **Detalhamento mora em** `/settings/financeiro/detalhamento`, acessado por botão **"Ver detalhamento →"**
   na Visão geral / Consumo. **Não** é item de sidebar nem aba. (é o padrão "Detalhar →" do PG)
3. **Abas do Financeiro:** `Visão geral · Consumo · Faturas · Métodos de pagamento · Atividade`.
4. **A aba Consumo absorve os créditos.** O propósito do Consumo é mostrar consumo variável **+ limite +
   os vouchers/cupons** que incidem sobre o variável. Por isso a página standalone **`saldo-creditos` é
   removida** (PG: "pode tirar") e o conteúdo migra pro Consumo.
5. **Vouchers e Cupons = duas tabelas separadas** (vouchers → variável; cupons → plano fixo).
6. **Faseado por prioridade** (P1/P2/P3, ver plano).

### Contradições da reunião e como foram resolvidas
A reunião foi caótica e tem contradições. Resoluções aplicadas (decisão do Greg manda):
- "Consumo duplica a Visão geral" (PG) → Consumo **fica**, mas com propósito redefinido (consumo+limite+créditos);
  o detalhe pesado vai pro Detalhamento.
- "Remover saldo-creditos" vs "manter 2 tabelas" → **remover a página**, **manter 2 tabelas** dentro do Consumo.
- "Unificar vouchers e cupons" vs "separar" → **separar** (impactos diferentes: variável vs fixo).
- Tokens "input/output" (wireframe do PG) vs "só Knowledge/Brain/Skill" (comentário do PG/Greg na reunião)
  → **sem input/output** (decisão da reunião vence o wireframe).

---

## 3. Esquema de dados do PG (canônico) — resumo
Extraído de `PG_.../app/bombardier/prototype/_specs/financeiro.ts`, `_screens/financeiro.tsx`,
`_lib/gastos-taxonomy.ts`. **Preservar o esquema; reinterpretar o layout.**

- **Faturas:** `Mês ref · Descrição · Venc · Pago em · Bruto · Desconto · Líquido · Forma pgto · Status`
  + linha de **Totais**. Status: Paga / Aberta / Pagamento falhou / Disputa resolvida / Reembolsada / Anulada.
- **Detalhamento por taxa efetiva:** `Item · Categoria · Taxa efetiva · Quantidade · Valor BRL · USD`.
  Categorias: `Meta / WhatsApp`, `IA / Tokens`, `Leads`, `Operacional`.
- **Cobrado × Usado:** dois gráficos de barra por dia, empilhados verticalmente; faixa "Diferença do período"
  sempre visível + disclaimer laranja ("funciona como fatura de cartão… nada se perde, nada é cobrado 2x").
- **DRE / Resumo:** 5 cards — Subtotal de uso · Descontos/créditos · Ajustes · Tributos · Total no período.
- **Consumo por agente:** `Nome · Tipo · Status · BRL · USD · Ver detalhes →` (modal com breakdown por macro-fee:
  disparos, leads, mensagens, tokens Knowledge/Brain/Skill).
- **Vouchers:** `kind: FIXED|PCT`, `status: ACTIVE|PENDING|INACTIVE|DEPLETED|EXPIRED`, `fees[]` (taxas elegíveis),
  `total/consumido/restante`, `vigência`, flag `acceleratedConsumption`. Tabela: `Descrição · Status · Valor/Desconto · Progresso · Restante · Vigência · Ações`.
- **Cupons (tabela separada):** `Código · Descrição · Valor descontado · Aplicação · Fatura · Data`.
- **Audit trail:** `Timestamp · Ação(PT-BR) · Executor · Recurso · Metadata`. Ator pode ser usuário/AwSales/webhook.
- **Taxonomia AI** (`gastos-taxonomy.ts`): `ai.knowledge_input/output`, `ai.brain`, `ai.skills`,
  `meta.marketing`, `meta.utility`, `mensagem`, `leads`, `telefone`.
  → **Na nossa hi-fi:** colapsar para **Knowledge / Brain / Skill** (sem input/output).

> Mapeamento de status de voucher pra **nossa** linguagem (decisão Greg):
> 100% consumido → **"Usado"** (azul) · venceu sem uso total → **"Parcialmente usado"** (cinza) · + Ativo/Pendente/Pausado.

---

## 4. Onde mexer (mapa do código da hi-fi)
Base: `app/settings/(sections)/financeiro/`
- `layout.tsx` — corrigir largura `max-w-[1120px]` → **`max-w-[1440px]`** (igual ao resto de Settings).
- `_components/data.ts` — fixtures; **estender** (USD, séries cobrado/usado, DRE, splits WC/Meta, status de voucher).
- `_components/VariableSpendingBlock.tsx` — vira a base da página **Detalhamento**.
- `_components/InvoiceDetailsSheet.tsx` — drawer de fatura (reuso).
- `visao-geral/ · consumo/ · historico-faturas/ · metodos-pagamento/ · auditoria/` — páginas.
- `detalhamento/page.tsx` — **NOVO** (Analytics).
- `saldo-creditos/` — **REMOVER** (migrar conteúdo pro `consumo/`).
- `_components/FinanceiroTabs.tsx` e `app/settings/(sections)/_components/SettingsNav.tsx` —
  remover `saldo-creditos` do `subRoutes`; `detalhamento` **não** entra em tabs/sidebar.

**Componentes a CRIAR** (via skill `bombardier-new-component`, sempre Aw* + tokens existentes + showcase + `navigation.ts`):
`AwDateRangePicker`, `AwUsedVsChargedChart`, `AwFinancialSummary` (DRE), stacked bar com agulha de limite
(estender `AwChart`), `AwExportMenu` (PDF/CSV + LGPD + email), `AwAddBalanceModal` (Boleto/Pix/Cartão),
card de método de pagamento redesenhado (cartão padrão dark, "+" como card, CVV 3 díg / validade 4 díg).
Reuso confirmado no plano (AwTabs, AwTable/DataTable, AwAlert, AwPill, AwConsumptionBar, AwSheet, AwModal,
AwCostBreakdown, AwInvoiceRow, etc.).

> **Regras do repo (AGENTS.md):** prefixo `Aw`, "tokens são sagrados" (nada de hex/arbitrário),
> ícones Material Symbols via `Icon` (nunca `<svg>`), desktop-only. Repo do PG é **só leitura**.

---

## 5. Sobre o "sumiço" dos comentários na Vercel do PG
Resumo (detalhe em `DIAGNOSTICO_review_bridge.md`): **os comentários NÃO se perderam.** O time comentou
através do **bridge local do Greg** (o review-bridge foi pensado pra rodar local; o `.env.local` aponta pro
`127.0.0.1:9878`). Os dados estão salvos em `review-bridge/data/comments.json` (65) + `comments.archive.json`
(749) = exatamente os 814 do Export B. A Vercel do PG não recebeu porque o deploy dele não está plugado num
backend durável (sem URL do bridge no build; Supabase não configurado) e o FS da Vercel é efêmero. **Ação:**
o export que o Greg já tem **é** a cópia canônica — mandar pro PG.

---

## 6. Próximos passos (quando retomar)
> ⚠️ **Desatualizado** — as fases abaixo já foram construídas e mergeadas na `main`. Para o que
> **realmente falta hoje**, vá pra **§7**. Mantido como registro do plano original.

Seguir as fases do `PLANO_financeiro_split.md`:
- **P1:** largura 1440 + nav/tabs + criar `detalhamento` + tríade nas Faturas + cobrado×usado + DRE + tabela BRL/USD + corrigir barra por agente + tokens K/B/S + serviços dinâmicos + estender `data.ts`.
- **P2:** Consumo (limite + 2 tabelas vouchers/cupons) + `AwExportMenu` + `AwDateRangePicker` + Métodos + `AwAddBalanceModal` + tooltips/microcopy.
- **P3:** Auditoria V2 + polish de gráficos + passada de UX writing + "sem card-in-card".

Validar contra `review_comments_financeiro_digest.md` (cobrir os `open`/`in_review`) e rodar em `localhost:3000`.

---

## 7. Estado atual (22/06/2026) — o que já foi feito e o que falta

> Consolidado a partir do código na `main` + `git log` + cruzamento com `review_comments_financeiro_digest.md`.
> **Substitui** o "ainda não começou" do topo. Percentuais = comentários do review atendidos por rota.

### Progresso por fase
| Fase | Estado | Resumo |
|---|---|---|
| **P1** — reestruturação | ✅ feito | largura 1440, rota `detalhamento` criada, `saldo-creditos` removida, tríade nas faturas, gráfico cobrado×usado, DRE, tabela BRL/USD, tokens K/B/S, `data.ts` estendido |
| **P2** — média prioridade | ✅ ~95% | Consumo (2 tabelas vouchers/cupons + agulha de limite), ExportMenu, métodos redesenhados, AddBalanceModal, microcopy, tooltips |
| **P3** — audit + polish | 🟡 ~80% | degradê dos gráficos ✅; Auditoria V2 quase toda ✅ (avatares na 1ª coluna, sem "Sistema"/"Cortex", filtro de executor com fotos, export PDF/CSV + LGPD + email); faltam itens pontuais (abaixo) |

Cobertura do review por rota: visão-geral ~83% · consumo ~83% · faturas ~80% · métodos ~85% · auditoria ~80%.

### 🔴 Bug aberto (prioridade — Greg reabriu 2× via Germano)
- **Calendário range** — `_components/VariableSpendingBlock.tsx:500-508` (`RangeDayButton`). A data final
  (`range_end`) não fecha o background até a célula anterior: sobra um "recorte branco" entre `range_middle`
  e `range_end`. **Root cause:** o gap entre células no `components/ui/calendar.tsx` (flex com `w-full`
  distribuindo espaço livre) **não é 1px**, então os `-ml-px`/`-mr-px`/`-mx-px` do botão não cobrem o vão.
  O comentário no código (linhas 497-499) assume "1px de gap natural" — premissa errada. **Fix:** matar o
  gap na raiz (largura fixa por célula, `w-(--cell-size)` em vez de `w-full`) **ou** pintar a banda no
  wrapper `<td>` via `data-[range-*]`, não no `<button>`. Hoje esse calendário é renderizado pela rota
  `detalhamento` (o bloco migrou pra lá).

### Gaps acionáveis por rota
**Auditoria (`/auditoria`):**
- Remover a coluna "tipo" da tabela (deixar 2 colunas) — `auditoria/page.tsx:608-610`; o tipo já existe como filtro.
- Converter o filtro de tipo de dropdown → **chips selecionáveis** — `auditoria/page.tsx:482-522`.
- Link `INV-2026-05-0042` não abre o drawer (é `CURRENT_INVOICE`, fora de `INVOICE_HISTORY`) — `auditoria/page.tsx:639` + `data.ts:13`.

**Consumo (`/consumo`):**
- Export CSV na própria rota (hoje só existe no `detalhamento`) — pedido "export aqui, por dia, estilo Stripe".
- Toggle "visualização agregada por dia" nas tabelas (não existe em nenhuma rota).
- Confirmar cor do status de voucher: "Usado" = azul / "Parcialmente usado" = cinza (`data.ts:766-776`).

**Faturas (`/historico-faturas`):**
- Bandeira do cartão na **linha** da tabela (hoje só no drawer) — `historico-faturas/page.tsx:354`.
- Cores de status: "Em aberto" = amarelo e "Em atraso" = vermelho (hoje `draft`/`warning`) — decisão de design.
- Nota LGPD no export (migrar o export inline pro `ExportMenu`, que já aceita `note`).

**Métodos (`/metodos-pagamento`):**
- Header com logo + nome da organização ampliados (não existe).
- Reavaliar layout full-width "cartão à esquerda / endereço à direita" (hoje o billing é seção separada abaixo dos cartões).

### Divergência do plano (dívida de Design System)
Os componentes novos foram entregues como **locais** do financeiro (`_components/ExportMenu.tsx`,
`AddBalanceModal.tsx`, `AddPaymentMethodModal.tsx`), **não** como `Aw*` globais com showcase +
`navigation.ts` (o plano §"Componentes" e o `AGENTS.md` pediam via `bombardier-new-component`).
`AwDateRangePicker` / `AwUsedVsChargedChart` / `AwFinancialSummary` não viraram componentes nomeados do
DS — ficaram inline. Para seguir o plano à risca, falta promovê-los ao styleguide (ou registrar a decisão
de mantê-los locais).
