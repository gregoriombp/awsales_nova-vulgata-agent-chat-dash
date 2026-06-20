# Handoff — Refatoração do Financeiro (contexto pros próximos agentes)

> **Leia isto primeiro.** Este é o ponto de entrada do trabalho de refatoração do Financeiro.
> A construção ainda **não** começou (só a branch foi criada). Outros agentes vão tocar isso —
> aqui está todo o contexto que o Greg passou, as decisões travadas e onde cada coisa mora.

Branch: **`feat/financeiro-analytics-split`** (criada a partir da `main` em 19/06/2026).

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
Seguir as fases do `PLANO_financeiro_split.md`:
- **P1:** largura 1440 + nav/tabs + criar `detalhamento` + tríade nas Faturas + cobrado×usado + DRE + tabela BRL/USD + corrigir barra por agente + tokens K/B/S + serviços dinâmicos + estender `data.ts`.
- **P2:** Consumo (limite + 2 tabelas vouchers/cupons) + `AwExportMenu` + `AwDateRangePicker` + Métodos + `AwAddBalanceModal` + tooltips/microcopy.
- **P3:** Auditoria V2 + polish de gráficos + passada de UX writing + "sem card-in-card".

Validar contra `review_comments_financeiro_digest.md` (cobrir os `open`/`in_review`) e rodar em `localhost:3000`.
