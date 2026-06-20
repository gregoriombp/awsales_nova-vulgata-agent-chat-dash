# Refatoração do Financeiro — split Financeiro + Detalhamento (Analytics)

## Context

A review de todas as páginas de `/settings` apontou que o **Financeiro** é a área mais densa e
precisa ser refatorada. Hoje a hi-fi tem 6 sub-rotas (`visao-geral`, `consumo`,
`historico-faturas`, `saldo-creditos`, `metodos-pagamento`, `auditoria`) em
`app/settings/(sections)/financeiro/`, mas:

- A página está mais estreita que o resto de Settings (`max-w-[1120px]` vs `1440px`).
- O wireframe do PG (modelo "Google Cloud Billing") trouxe um esquema de dados muito mais
  profundo (cobrado×usado, DRE, breakdown por taxa efetiva BRL/USD, vouchers vs cupons,
  audit trail) que a hi-fi simplificou demais e perdeu profundidade.
- Há sobreposição: o PG marcou `consumo` como "duplicado com visão geral" e `saldo-creditos`
  como removível; os gráficos/tabelas pesados se misturam com o resumo executivo.

**Decisão de produto (confirmada com o Greg):** dividir em duas páginas —
1. **Financeiro** (limpa/executiva): resumo, consumo+créditos, faturas, métodos, atividade.
2. **Detalhamento de custos** (Analytics, pesada): toda a carga de auditoria/conciliação
   cobrado×usado, DRE, gráfico por dia, tabela BRL/USD, breakdown por agente, export estilo Stripe.

Fonte de dados canônica = o esquema do wireframe do PG
(`/Users/gregoriopinheiro/Documents/PG_awsales-nova-vulgata-design-main-2`, **só leitura**),
adaptado às decisões da reunião (que sobrescrevem o wireframe quando divergem).

### Decisões travadas com o Greg
- **Analytics mora em** `/settings/financeiro/detalhamento`, acessada por um botão
  **"Ver detalhamento →"** na Visão geral / Consumo. Não vira item de sidebar. (padrão "Detalhar →" do PG)
- **Execução faseada por prioridade** (P1 → P2 → P3, abaixo).
- **Abas do Financeiro:** `Visão geral · Consumo · Faturas · Métodos de pagamento · Atividade`.
  A aba **Consumo** absorve consumo variável + limite **+ os créditos** (vouchers e cupons),
  porque créditos incidem sobre o variável — esse era o propósito do Consumo. A página
  standalone `saldo-creditos` é **removida** (PG: "pode tirar"); conteúdo migra pro Consumo.
- **Vouchers e Cupons = duas tabelas separadas** (vouchers → gasto variável; cupons → plano fixo).

## Branch
Primeiro passo de execução (não feito ainda — estamos em plan mode):
`git checkout -b feat/financeiro-analytics-split`

---

## Arquitetura de rotas (depois)

```
app/settings/(sections)/financeiro/
  layout.tsx                 → max-w-[1440px] (corrige largura) + FinanceiroTabs
  _components/
    data.ts                  → modelo de dados estendido (ver abaixo)
    VariableSpendingBlock.tsx → vira a base do Detalhamento (heavy)
    InvoiceDetailsSheet.tsx  → drawer de fatura (reuso)
    + novos componentes de seção
  visao-geral/page.tsx       → resumo executivo + mini-consumo + "Ver detalhamento →"
  consumo/page.tsx           → consumo variável + limite + Vouchers + Cupons (2 tabelas)
  detalhamento/page.tsx      → NOVO: Analytics pesado (cobrado×usado, DRE, gráfico/dia, BRL/USD)
  historico-faturas/page.tsx → tabela tríade Bruto/Desconto/Líquido + drawer + export
  metodos-pagamento/page.tsx → cartões redesenhados + dados fiscais
  auditoria/page.tsx         → audit trail (ator 1ª coluna, filtros chips, links clicáveis)
  (saldo-creditos/ → REMOVIDA)
```

Nav config: `app/settings/(sections)/_components/SettingsNav.tsx` — remover `saldo-creditos` do
`subRoutes` do Financeiro; manter `visao-geral/consumo/metodos-pagamento/historico-faturas/auditoria`.
`detalhamento` é rota navegável por botão, **não** entra no `subRoutes`/tabs.

Tabs: `app/settings/(sections)/financeiro/_components/FinanceiroTabs.tsx` — remover aba "Consumo"? **Não** — manter Consumo; remover só a referência a `saldo-creditos`.

---

## Modelo de dados — `_components/data.ts`

Estender as fixtures (preservar shape do PG, aplicar decisões da reunião):

- **Service breakdown:** adicionar coluna **USD** + `taxaEfetiva` + `categoria`. Renomear linhas:
  - "Disparos WhatsApp" → **"Disparos WhatsApp marketing"** + **"Disparos WhatsApp utilidade"** (separar).
  - "Mensagens transacionadas" mantém; "Conversas utility" não usar esse rótulo.
  - Tokens: quebrar em **Knowledge / Brain / Skill** (uma linha/agrupamento cada) — **sem input/output**
    (decisão da reunião sobrescreve o wireframe que tinha input/output).
  - "Leads convertidos" → **"Leads ativos"**.
  - Serviços renderizados **dinamicamente** (array), nunca hardcoded — "agente de disparo" vai deixar de existir (JJ).
- **Agent breakdown:** adicionar `valorUSD`; `consumption` (0–100) só usado p/ progress bar **se houver cap**;
  senão exibir valor absoluto R$ (regra Daniel "92% em relação a quê?"). Status `Ativa/Pausada/Encerrada`.
- **Cobrado × Usado (Detalhamento):** duas séries por dia (`usadoPorDia[]`, `cobradoPorDia[]`),
  split do usado em **WC fees** vs **Meta aproximado**, `diferencaPeriodo` + `motivoTexto`.
- **DRE / Resumo financeiro:** `subtotal`, `descontosCreditos`, `ajustes`, `tributos`, `totalPeriodo`,
  cada um com `tooltip`. Referem-se ao gráfico "Usado no período".
- **Vouchers:** `status: "Ativo" | "Usado" | "Parcialmente usado" | "Pendente" | "Pausado"`
  (mapa: 100% consumido → **Usado** azul; venceu sem uso total → **Parcialmente usado** cinza),
  `total`, `consumido`, `restante`, `vigencia`, `fees[]` (taxas elegíveis), `acceleratedConsumption?`.
- **Cupons (tabela separada):** `codigo`, `descricao`, `valorDescontado`, `aplicacao`, `faturaId`, `data`.
- **Invoices:** já tem `gross/discount/net` — garantir desconto exibido **abaixo do total** (número menor);
  status com cores: Em aberto = amarelo, Em atraso/Falhou = vermelho, Paga = verde, Disputa = neutro/roxo.
- **Audit:** trocar todo `"Sistema"` por usuário real; `executor` lista o **account manager + membros da equipe**
  com avatares; ação como label PT-BR.

---

## Componentes — reuso vs novos

**Reusar (catálogo confirmado):** `AwTabs` (underline), `AwTable` + `DataTable`
(`components/tool-ui/data-table`), `AwAlert` (variant warning = laranja), `AwPill`,
`AwConsumptionBar` (gross/credits/limit + agulha), `AwProgress`, `Tooltip` (shadcn),
`AwSheet` (drawer de fatura), `AwModal`, `AwCard`, `AwInvoiceRow`, `AwCostBreakdown`,
`AwChart` (`AwChartContainer`/`awChartConfig`/recharts), `AwDropdownMenu`, `AwShortcutTile`,
`CardBrandLogo`/`AwCardBrand`, `AwFileIcon`. Ícones via `Icon` (Material Symbols), nunca `<svg>`.

**Novos (via skill `bombardier-new-component` — Aw* + token sagrado + showcase + nav):**
1. **AwDateRangePicker** — presets (hoje/ontem/últimos 7/30 dias) + período personalizado com `Calendar`;
   popover bg branco 100%. (não existe hoje)
2. **AwUsedVsChargedChart** — gráfico protagonista "Usado no período" com barra dividida em
   **WC fees + Meta aproximado** (2 cores + tooltip "Meta não é cobrado pela WC, é aproximado");
   abaixo, com menos destaque, "Valor atribuído ao provedor de pagamento no período" (laranja);
   faixa laranja "Diferença do período".
3. **AwFinancialSummary (DRE)** — as bolinhas subtotal/descontos/ajustes/tributos/total, cada uma com tooltip.
4. **Stacked bar por dia com agulha de limite** — estender `AwChart` com uma reference line de limite;
   hover destaca a pilha, tooltip com total do dia, fills com leve degradê (por token).
5. **AwExportMenu** — dropdown PDF/CSV com brand logos dos formatos → confirma → aviso LGPD +
   "relatório gerado, recebimento por email". No Detalhamento: export por dia, escolher colunas,
   só valores WC + valor Meta aproximado destacado (modelar processo da Stripe).
6. **AwAddBalanceModal** — modal sequencial "Adicionar saldo" (etapa 1: Boleto/Pix/Cartão; etapa 2: conteúdo).
7. **Card de método de pagamento** redesenhado — cartão padrão dark/white maior; secundários menores abaixo;
   "adicionar" como card com `+`; CVV 3 díg. e validade 4 díg. corrigidos na raiz do componente.

---

## Regras de negócio / decisões da reunião (encodar em todas as telas)

1. **Usado × Cobrado** (Detalhamento): protagonista = "Usado no período" (split WC/Meta, tooltip);
   secundário laranja = "Valor atribuído ao provedor de pagamento no período" (renomeado de "Cobrado");
   disclaimer laranja "Diferença do período" cobrindo (a) gap usado-WC × cobrado e (b) valores Meta
   cobrados direto pela Meta (cliente põe cartão lá) — "nada se perde, nada é cobrado duas vezes".
2. **Tríade da fatura** Bruto/Desconto/Líquido obrigatória; desconto abaixo do total, número menor.
3. **Progress bar por agente** só percentual se houver **cap** configurado; senão valor absoluto R$.
4. **Tokens** = Knowledge / Brain / Skill, **sem input/output**.
5. **Serviços dinâmicos**, não hardcoded ("agente de disparo" será descontinuado).
6. **DRE** subtotal/descontos/ajustes/tributos/total, todas com tooltip, referentes ao "usado no período".
7. **Vouchers (variável) × Cupons (fixo)** = 2 tabelas; status do voucher ao lado do título (direita),
   validade abaixo do chip "Ativo"; barra verde com agulha de limite + marca de "cupom estendido";
   tooltips explicando Crédito vs Cupom.
8. **Export** PDF/CSV com brand logos → LGPD + email; no Detalhamento, por dia + escolher colunas + Meta destacado.
9. **Tooltips** em termos técnicos (Tokens, Crédito vs Cupom, Consumo, threshold de limite).
10. **Ciclo:** próxima cobrança = data + bandeira do cartão; remover "Estimado"/equação %, usar ícone +
    valor estimado (estilo IOF); deixar claro que o ciclo vira ao bater o limite variável **e** no fim do mês;
    remover card "Previsão da próxima fatura" redundante.
11. **Métodos:** dados fiscais (CNPJ/IE/endereço); emails de faturamento (máx 5 + ver mais, removível);
    só email editável; bandeira ao digitar; modal de confirmação ao remover; cartão esq / endereço dir full-width.
12. **Auditoria:** 1ª coluna = ator (com foto); "tipo" vira chips/dropdown de filtro; "de quem"→"usuário";
    sem "Sistema"; links INV-… clicáveis abrindo o drawer; export PDF/CSV + LGPD + email.
13. **Largura** financeiro = `max-w-[1440px]` (igual ao resto de Settings).
14. **Sem card dentro de card** — seções flat (divisória/linha, não caixa aninhada); remover stroke/padding
    onde apontado, conteúdo "pra fora do card".

---

## Fases de execução

### P1 — Reestruturação + alta prioridade
- Branch + ajustar `layout.tsx` (largura 1440) e `SettingsNav`/`FinanceiroTabs` (remover saldo-creditos).
- Criar rota `detalhamento/page.tsx`; mover o conteúdo pesado (gráfico por dia + tabelas serviço/agente)
  de `visao-geral`/`consumo` pra lá; adicionar botão "Ver detalhamento →".
- **Faturas:** tabela com tríade Bruto/Desconto/Líquido (desconto abaixo do total), cores de status,
  alerta laranja de vencidas/em atraso, totais no rodapé, linha clicável → drawer.
- **Detalhamento:** gráfico "Usado no período" (split WC/Meta) + "Valor atribuído ao provedor" (laranja) +
  disclaimer laranja da diferença; DRE (bolinhas com tooltip); tabela por taxa efetiva BRL/USD.
- **Por agente:** corrigir barra de consumo (cap → % ; sem cap → R$).
- **Tokens** Knowledge/Brain/Skill (sem input/output) + serviços dinâmicos.
- Estender `data.ts` com USD, séries cobrado/usado, DRE, splits.

### P2 — Média prioridade
- **Consumo:** consumo variável + limite (AwConsumptionBar) + **Vouchers** e **Cupons** (2 tabelas)
  com status corretos, barra com agulha, ícone grayscale, "Ver detalhes" → modal voucher.
- **AwExportMenu** (PDF/CSV + LGPD + email; Stripe-style no detalhamento).
- **AwDateRangePicker** (presets + custom).
- **Métodos:** redesign dos cartões + dados fiscais + emails de faturamento + correções CVV/validade + modal confirmação.
- **AwAddBalanceModal** (Boleto/Pix/Cartão).
- Tooltips em termos técnicos; microcopy (Leads ativos, remover "Estimado", próxima cobrança c/ bandeira).

### P3 — Audit V2 + polish
- **Auditoria:** ator na 1ª coluna com foto, filtros em chips, sem "Sistema", links clicáveis, export+LGPD.
- Degradês/animações dos gráficos, hover por pilha, marcadores de data dd/mm.
- Passada de UX writing (skill `bombardier-ux-writing`) e limpeza "sem card-in-card".

---

## Verificação
- `npm run dev` (localhost:3000) e navegar:
  - `/settings/financeiro/visao-geral` → resumo limpo, mini-consumo, botão "Ver detalhamento →".
  - `/settings/financeiro/consumo` → consumo+limite, 2 tabelas (vouchers/cupons), status corretos.
  - `/settings/financeiro/detalhamento` → cobrado×usado, DRE, gráfico/dia, tabela BRL/USD, export.
  - `/settings/financeiro/historico-faturas` → tríade, cores de status, alerta, drawer.
  - `/settings/financeiro/metodos-pagamento` → cartões redesenhados, dados fiscais.
  - `/settings/financeiro/auditoria` → ator 1ª coluna, filtros chips, links.
- Conferir largura igual às outras telas de Settings (1440), responsivo desktop-only.
- Checar tokens sagrados (sem hex/arbitrários), Aw* prefix, ícones Material via `Icon`.
- Validar contra os comentários do review bridge (rotas financeiro) — os "open"/"in_review" cobertos.
- Showcases dos componentes novos registrados em `navigation.ts` (`bombardier-new-component`).

## Fora de escopo / notas
- Não escrever nada no repo do PG (`PG_awsales-…`) — só referência.
- Audit trail completo (paginação/virtual scroll/hash de integridade) fica em P3/V2.
- NF-e, multa de fidelidade, disputa/chargeback detalhados: portar do PG só se sobrar tempo (V2).
- Backend real: tudo segue como fixture em `data.ts` até os endpoints existirem.
