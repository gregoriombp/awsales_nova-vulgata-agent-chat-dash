# Story — Financeiro: Visão Geral + Saldo de Créditos + Audit Trail Financeiro

**Data:** 2026-05-11
**Versão:** v2.2 (Onda 1 + Onda 2 do fix-backlog aplicadas)
**PO:** Guilherme Graham (PG)
**Status:** Pronta pra refinamento técnico
**Story relacionada:** [stories/team-funcoes-config.md](stories/team-funcoes-config.md) — esta substitui o placeholder da aba "Billing"
**Doc técnico de referência:** [`apps/awsales-backend/docs/content/docs/domain/billing/`](../../apps/awsales-backend/docs/content/docs/domain/billing/) (fonte de verdade pra status de invoice/subscription/cupom/voucher)

---

## 1. Cabeçalho

**Nome Sugerido:** Implementar Aba "Financeiro" da Organização — Visão Geral, Saldo de Créditos e Audit Trail Financeiro

**Prioridade Sugerida:** 🟠 **Alta (P1)** — visibilidade de cobrança é demanda contratual de cliente enterprise + endereça feedbacks dos clientes atuais (redundâncias, filtros, breakdown por campanha).

**Estimativa de Complexidade:** **13 SP** (∼1 semana) — duas sub-abas (Visão Geral / Saldo de Créditos) + audit trail + 2 modais de detalhes (campanha e fatura) + sub-tela de trocar cartão + aplicação de cupom.

**Sugestão de Split:**
- **S1** — Visão Geral (cards + filtros + gráfico + tabela campanhas + histórico faturas) = **5 SP**
- **S2** — Saldo de Créditos (vouchers + cupons + aplicar código) = **3 SP**
- **S3** — Audit Trail Financeiro (no rodapé) + integração com backend da Story 2 = **3 SP**
- **S4** — Modais de detalhes (campanha + fatura) + sub-tela trocar cartão = **2 SP**

Confirmar split com Reviewer (Gustavo).

**Dependências:**
- Story 2 (Configurações da Org) — permissões `Financeiro · Visualizar` e `Financeiro · Gerenciar` no catálogo.
- Story 2 S4 — backend de audit trail reusado (escopo `domain = "financeiro"`).
- Backend de Billing (`apps/awsales-backend/.../billing/`) — APIs já mapeadas (invoice lifecycle, subscription lifecycle, coupons, vouchers, costs, dunning).

---

## 2. Narrativa do Usuário

> Como **Administrador (ou usuário com permissão Financeiro)** da organização,
> eu quero **visualizar tudo que está sendo cobrado, gastos por campanha, faturas pagas e em aberto, saldo de créditos (vouchers e cupons) e ter rastreabilidade de todas as ações financeiras**,
> para que eu **acompanhe a operação financeira com autonomia, sem depender do time AwSales pra entender cobranças, e tenha base pra contestar/auditar qualquer divergência**.

E como **usuário com permissão Financeiro · Gerenciar**,
> eu quero **trocar o cartão de pagamento padrão, aplicar códigos de cupom e ver detalhes granulares de cada cobrança**,
> para que **mantenha o método de pagamento atualizado sem fricção operacional**.

---

## 3. Contexto e Valor

**Cenário Atual (legacy):** tela financeira existe mas tem redundâncias (tabela de meio de pagamento duplica info da fatura atual; status aparece 2x), não permite filtrar período por intervalo customizado, não mostra breakdown por campanha, não conta o que foi economizado com voucher/cupom, e não tem audit trail (cliente não sabe quem trocou cartão, quem aplicou cupom, quando o plano foi atualizado).

**Cenário Desejado:** aba "Financeiro" com 2 sub-abas (Visão Geral + Saldo de Créditos) que:
- **Removem redundâncias** apontadas pelos clientes (tabela Meio de Pagamento isolada → some; status duplicado → único).
- **Filtro de data flexível** (presets estilo Google: Esse mês, Mês passado, Essa semana, Últimos 30 dias, Período customizado).
- **Tabela de campanhas** com colunas Nome / Tipo / Status / Valor gasto no período / botão "Ver detalhes" → modal com breakdown por macro-fee (Disparos, Lead, Mensagens, Tokens em vários tipos).
- **Voucher/cupom aplicado** explícito na fatura e no gráfico (sobreposição do valor economizado).
- **Audit Trail Financeiro** no rodapé da aba — eventos críticos com filtros e export CSV (reusa backend da Story 2 S4).
- **Plano readonly no MVP** — cliente vê detalhes do plano + contato do Gerente da Conta pra solicitar mudança. Tudo via admin AwSales.
- **Trocar cartão** disponível inline + sub-tela "Métodos de pagamento" se múltiplos cartões.

**Impacto:**
- **Operacional:** elimina tickets recorrentes do tipo "o que é essa cobrança?", "por que esse valor?", "qual cartão está cadastrado?".
- **Compliance/auditoria:** audit trail dá prova legal pra contestação de cobrança e fechamento contábil.
- **Confiança:** cliente enterprise espera transparência total — UI atual perde negócios pra concorrentes que entregam melhor.
- **Receita:** voucher/cupom visíveis = clientes engajam mais com programas de fidelidade.

---

## 4. Critérios de Aceite (Gherkin BDD)

### 4.1 Aba Financeiro · Visão Geral

#### Cenário 1 — Layout geral da Visão Geral

**Dado** que o usuário com permissão `Financeiro · Visualizar` acessa `Configurações → Financeiro`,
**Quando** a aba carrega na sub-aba default **Visão Geral**,
**Então** exibe (top-down):
- **Card "Plano [Nome]"** com status, valor mensal e botão `Detalhes do plano` (não mais `Gerenciar plano`),
- **Card "Fatura atual"** sem status duplicado (apenas 1x em coluna `Status`),
- **Card "Cobrança parcial quando atingir R$ X"** (readonly — apenas admin AwSales muda) — **NÃO é teto de uso**, é threshold de billing: ao atingir, emite cobrança parcial e o contador reinicia. Cliente nunca é limitado no uso.
- **Card "Gastos variáveis utilizados"** com valor agregado do período filtrado,
- **Card "Data de cobrança prevista"** (último dia do mês),
- **Filtro de data** com presets (estilo Google) + período customizado,
- **Seção unificada "Gastos variáveis"** com toggle `Por serviço | Por campanha` (estilo GCP Billing) — gráfico + tabela respondem ao mesmo agrupamento,
- **Tabela "Histórico de faturas"** (com coluna `Cupom/Voucher aplicado`),
- **Seção "Audit Trail Financeiro"** no rodapé (filtros + export CSV).

#### Cenário 2 — Remoção de redundâncias (feedback dos clientes)

**Dado** que a tela atual tinha redundâncias,
**Quando** a nova versão é renderizada,
**Então:**
- **Não existe mais** uma tabela isolada "Meio de pagamentos" na lateral direita (espaço liberado pra outras informações).
- **Status da fatura aparece UMA ÚNICA VEZ** na linha do card (coluna `Status` removida da grid de dados acima — fica apenas o badge ao lado de "Fatura atual").
- Botão **"Trocar cartão"** fica **inline** no card da fatura, ao lado do método mostrado (ex: `•••• 3012 [✎ Trocar]`).

#### Cenário 3 — Card "Plano" (readonly no MVP)

**Dado** que o cliente clica em **"Detalhes do plano"**,
**Quando** o modal/sub-tela abre,
**Então** exibe:
- Nome do plano (ex: Pro, Enterprise),
- Status da subscription (`ACTIVE` / `PAST_DUE` / `CANCELLATION_PENDING` / `CANCELLED` — conforme doc backend `subscriptions/lifecycle.mdx`),
- Valor mensal,
- Intervalo de cobrança (Mensal / Trimestral / Anual),
- Threshold de cobrança parcial atual (R$ X — quando atingir, cobra e reseta; **não limita uso**),
- Fidelidade (se houver) — meses restantes + multa de quebra,
- Próximas faturas previstas,
- Past-due reasons (se status = PAST_DUE) — ex: `PLAN`, `FEE`, `IMPLEMENTATION`, `PHONE_LINE`, `SUBSCRIPTION_ADDON`,
- **Contato do Gerente da Conta** (Bruno Costa · bruno.costa@awsales.io) — pra solicitar alteração ou cancelamento,
- **NÃO existe botão de mudar plano ou cancelar no MVP** — futuro: botão "Solicitar alteração" e "Solicitar cancelamento" (placeholder).

#### Cenário 4 — Filtro de data (presets estilo Google)

**Dado** que o usuário quer ver gastos de período específico,
**Quando** clica no seletor de período,
**Então** exibe presets:
- **Hoje**
- **Ontem**
- **Esta semana** (default segunda → hoje)
- **Última semana**
- **Este mês** (default 1º → hoje) — **default da tela**
- **Mês passado**
- **Últimos 7 dias**
- **Últimos 30 dias**
- **Últimos 90 dias**
- **Período customizado** (calendário com data inicial + final)
**E** o tipo de filtro padrão é **período de uso/consumo** (data em que o evento de billing aconteceu, não data de cobrança nem vencimento),
**E** filtrar atualiza **simultaneamente**: gráfico, tabela de gastos por serviço, tabela de campanhas (mesmo período sincronizado).

#### Cenário 5 — Visualização unificada (gráfico + tabela) com toggle de agrupamento (estilo GCP Billing)

> 📌 **Atualizado:** gráfico e tabela são **um único componente unificado** com toggle de agrupamento no topo (estilo GCP Billing). Mudar o agrupamento atualiza **simultaneamente** o gráfico e a tabela detalhada abaixo.

**Dado** que o cliente está na seção "Gastos variáveis",
**Quando** a tela carrega,
**Então** exibe:
- **Toggle "Agrupar por:"** no topo da seção com opções `Por serviço` (default) | `Por campanha`,
- **Gráfico de barras empilhadas por dia** abaixo do toggle,
- **Tabela detalhada** abaixo do gráfico, sincronizada com o agrupamento,
- **Overlay de economia** (linha tracejada) no gráfico mostrando valor descontado com cupom/voucher por dia,
- Legenda do gráfico inclui badge "Economia com créditos" com cor distintiva.

#### Cenário 5.1 — Modo "Por serviço" (default)

**Dado** que o toggle está em **Por serviço**,
**Quando** a seção renderiza,
**Então:**
- **Gráfico** exibe barras empilhadas onde cada **cor = um serviço** (Disparos, Leads, Mensagens, Tokens),
- **Tabela** exibe colunas:
  - **Serviço** (Disparos WhatsApp, Leads convertidos, Mensagens, Aw Tokens · Knowledge Input, etc.)
  - **Quantidade** (unidades consumidas no período)
  - **Valor unitário** (preço por unidade)
  - **Total** (Q × V = R$)
- **Soma da coluna Total** = valor do card "Gastos variáveis utilizados".

#### Cenário 5.2 — Modo "Por campanha"

**Dado** que o cliente clica em **Por campanha**,
**Quando** o componente re-renderiza,
**Então:**
- **Gráfico** muda — barras empilhadas onde cada **cor = uma campanha** (Black Friday, Recuperação CRM, SDR Outbound, Onboarding, etc.) com gradiente próprio,
- **Tabela** muda pra exibir colunas:
  - **Nome da campanha**
  - **Tipo** (Venda / Onboarding / SDR / Recuperação / Lead Magnet / etc. — tipos definidos pelo produto)
  - **Status** (Ativa / Pausada / Encerrada)
  - **Valor gasto no período**
  - **Ações**: botão **"Ver detalhes →"** abre modal com breakdown por macro-fee (ver Cenário 7)
- **Ordenação default**: valor gasto descendente,
- **Filtros**: busca por nome + multi-select de tipo e status,
- **Soma da coluna Valor gasto** = valor do card "Gastos variáveis utilizados" (mesmo total dos 2 modos — só muda agrupamento, valor agregado bate).

#### Cenário 5.3 — Transição entre modos preserva filtros

**Dado** que o cliente está em **Por serviço** com filtro de data "Últimos 30 dias",
**Quando** muda pra **Por campanha**,
**Então** o filtro de data **permanece** ("Últimos 30 dias"),
**E** apenas o agrupamento muda — não recarrega filtros, não perde busca aplicada,
**E** o evento `gastos.agrupamento_mudou` (opcional) é registrado pra analytics de uso.

#### Cenário 7 — Modal "Ver detalhes da campanha" (acessível só no modo Por campanha)

**Dado** que o cliente clica em "Ver detalhes" numa campanha,
**Quando** o modal abre,
**Então** exibe header com Nome + Tipo + Status + Valor total no período,
**E** uma tabela com breakdown por **macro-fee**:
- **Disparos** (quantidade × valor unitário = total)
- **Leads** (quantidade × valor unitário = total)
- **Mensagens** (quantidade × valor unitário = total)
- **Tokens** (vários tipos — Knowledge Input/Output, Brain Input/Output, Skills Input/Output — cada um com quantidade × unit)
- **(Macro-fees futuros podem aparecer conforme produto evoluir — Conversa, Pesquisa, Storage, etc.)**
**E** total no rodapé do modal deve bater com o valor da linha na tabela (auditoria visual).

#### Cenário 8 — Tabela "Histórico de faturas" com cupom/voucher visível

**Dado** que existem faturas anteriores,
**Quando** a tabela carrega,
**Então** exibe colunas:
- **Mês de referência**
- **Descrição** (ex: "Plano · Pro · Mensal", "Custos variáveis", "Implementação 1/4")
- **Data de vencimento**
- **Data de pagamento**
- **Valor cobrado**
- **Cupom/Voucher aplicado** (NOVO — código + valor descontado, ou "—" se nenhum)
- **Forma de pagamento** (ex: Cartão Visa •••• 3012)
- **Status** (conforme Stripe — ver Cenário 8.1)
- **Ações**: menu kebab com `Ver detalhes` (modal) e `Baixar fatura` (PDF).

#### Cenário 8.1 — Status da fatura em PT-BR + magnitude visual (sincronizado com Stripe)

> 📌 **Atualizado v2 (pós stress-test):** status técnicos do Stripe traduzidos pra PT-BR coloquial mantendo correspondência com schema. Adicionados 2 novos status: `PAGAMENTO_PARCIAL` (voucher cobre parte) e `DUPLICADO_A_ESTORNAR` (race condition detectada).

**Dado** que o status é refletido do Stripe,
**Então** os estados possíveis são (PT-BR coloquial · enum técnico no backend):

| PT-BR (UI) | Enum técnico (Stripe) | Cor | Ícone | Tooltip ⓘ |
|---|---|---|---|---|
| Rascunho | `DRAFT` | cinza | 📝 | Fatura criada mas ainda não finalizada |
| Em aberto | `OPEN` | amarelo | ⏱ | Aguardando pagamento — clique pra ver opções |
| Aguardando confirmação | `PENDING` | amarelo | ⏳ | PIX/Boleto em processamento — leva até 30s. Não pague novamente. |
| Paga | `PAID` | verde | ✓ | Pagamento confirmado |
| Pagamento parcial | `PAGAMENTO_PARCIAL` ⭐ | laranja | ½ | Voucher cobriu parte — restante a pagar |
| Duplicado (a estornar) | `DUPLICADO_A_ESTORNAR` ⭐ | vermelho | ⚠ | Cobrança duplicada detectada — estornaremos em até 7 dias |
| Pagamento falhou | `PAYMENT_FAILED` | vermelho | ✕ | Tentaremos novamente automaticamente em <data> |
| Vencida | `EXPIRED` | laranja | ⌛ | Boleto/PIX expirou — solicite nova emissão |
| Em contestação | `DISPUTED` | vermelho | ⚖ | Chargeback aberto no seu banco — em análise |
| Estornada (banco do cliente) | `CHARGEBACK` | vermelho | ⚖ | Banco devolveu o valor (chargeback ganho pelo cliente) |
| Disputa resolvida | `CHARGEBACK_RESOLVED` | verde | ✓ | Disputa resolvida favorável à AwSales |
| Reembolsada | `REFUNDED` / `PARTIALLY_REFUNDED` | cinza | ↩ | Valor devolvido ao cartão original |
| Incobrável | `UNCOLLECTIBLE` | cinza | — | Marcada como não-recuperável |
| Anulada | `VOID` | cinza | ⊘ | Cancelada antes de cobrança |

**E magnitude visual:** badges de fatura com valor **≥ R$ 100k** ganham **borda mais grossa (3px) + ícone destacado + animação sutil** quando em status crítico (Em aberto próxima do vencimento, Pagamento falhou, Em contestação),
**E** filtro por status disponível no topo da tabela com labels em PT-BR.

⭐ **Novos status (Cenário 8.1 v2):**
- `PAGAMENTO_PARCIAL` cobre o caso voucher consumiu parte da fatura (Cluster RC3 do stress test)
- `DUPLICADO_A_ESTORNAR` cobre race condition de duplo charge — sistema detecta automaticamente e estorna (Cluster RC3 do stress test)

#### Cenário 9 — Modal "Ver detalhes da fatura"

**Dado** que o cliente clica em "Ver detalhes" no menu kebab de uma fatura,
**Quando** o modal abre,
**Então** exibe:
- Cabeçalho: número da fatura + status + data emissão + data vencimento + data pagamento (se paga),
- **Line items**: cada linha do que foi cobrado (plano fixo, gastos variáveis itemizados por serviço, addons como linha telefônica, etc.),
- **Cupom/Voucher aplicado**: se houver, exibe linha negativa com código + nome do cupom + valor descontado,
- **Subtotal**, **Total**,
- **Hash de integridade** do PDF (se gerado),
- Botão **"Baixar PDF da fatura"**.

#### Cenário 10 — Sub-tela "Trocar/Gerenciar métodos de pagamento"

**Dado** que o usuário com permissão `Financeiro · Gerenciar` clica em **"✎ Trocar"** no card da fatura ou em **"Gerenciar métodos →"** no header,
**Quando** a sub-tela carrega,
**Então** exibe:
- Lista de cartões cadastrados (com marca, últimos 4 dígitos, expira em MM/AAAA, badge "Padrão" no atual),
- Botão **"Tornar padrão"** em cada cartão não-padrão,
- Botão **"Remover cartão"** em cada cartão (com confirmação),
- Botão **"+ Adicionar novo cartão"** (abre modal/iframe Stripe Elements),
**E** PII Filtering: número do cartão SEMPRE mascarado (regra PCI-DSS, independente de permissão de PII).

### 4.2 Aba Financeiro · Saldo de Créditos

#### Cenário 11 — Layout da Saldo de Créditos

**Dado** que o usuário clica na sub-aba **Saldo de Créditos**,
**Quando** a tela carrega,
**Então** exibe (top-down):
- **3 cards de resumo:**
  - **Total economizado** (lifetime — soma de cupons + vouchers consumidos)
  - **Total de desconto disponível** (saldo de vouchers ATIVOS não consumidos)
  - **Vouchers ativos** (count)
- **Tabela "Vouchers"** com colunas: Descrição, Status, Situação (PENDING/ACTIVE/INACTIVE/DEPLETED/EXPIRED), Valor total, Valor utilizado, Valor restante, Data de término, Ações,
- **Tabela "Cupons aplicados"** com colunas: Código, Descrição, Valor descontado, Aplicação (Uma vez / Em N ciclos / Permanente), Fatura aplicada, ID da fatura, Data,
- **Campo "Aplicar código de cupom"** (input + botão "Aplicar") — feedback dos clientes,
- Estado vazio educado quando não há vouchers/cupons ("Você não possui créditos disponíveis no momento" + ilustração).

#### Cenário 12 — Status de Vouchers (sincronizado com Stripe billing credit grant)

**Dado** que vouchers refletem o estado no Stripe,
**Então** os estados possíveis são (conforme doc `credits/vouchers.mdx`):
- `PENDING` — Criado com data efetiva futura, ainda não vigente
- `ACTIVE` — Redemption aberta, está consumindo
- `INACTIVE` — Pausado manualmente
- `DEPLETED` — Saldo zerado
- `EXPIRED` — Expirou sem ser consumido
**E** cada status tem cor distintiva e tooltip explicativo.

#### Cenário 13 — Voucher aplicável a fees específicos

**Dado** que o voucher pode ter restrição de fees (conforme modelo backend),
**Quando** o cliente abre detalhes,
**Então** exibe **lista de "Taxas elegíveis"** do voucher (ex: "Aplica em: Disparos WhatsApp + Aw Tokens Knowledge Input"),
**E** se a lista for vazia, badge "Aplica em todas as taxas".

#### Cenário 14 — Status de Cupom

**Dado** que cupons refletem o estado no Stripe,
**Então** os estados possíveis são (conforme doc `credits/coupons.mdx`):
- `ACTIVE` — Ainda redimível
- `DEPLETED` — Limite de resgates atingido
- `EXPIRED` — Data de validade passou
**E** cada cupom mostra: tipo (`ONCE` ou `REPEATING`), duração em meses (se REPEATING), max redemptions, times redeemed, valor descontado total.

#### Cenário 15 — Aplicar código de cupom (UI cliente)

**Dado** que o cliente recebeu um código de cupom por canal externo (e-mail comercial, evento, etc.),
**Quando** digita o código no campo "Aplicar código de cupom" e clica "Aplicar",
**Então** o sistema valida via Stripe:
- Cupom existe?
- Está `ACTIVE`?
- Currency compatível com a org?
- Não atingiu max_redemptions?
**E** se válido: aplica e exibe sucesso *"Cupom 'BF2025' aplicado — 20% de desconto na próxima fatura"*,
**E** se inválido: mensagem específica do erro (`Cupom expirado`, `Cupom não encontrado`, `Cupom já atingiu limite de uso`, `Cupom não é compatível com sua moeda`),
**E** evento registrado no Audit Trail Financeiro.

### 4.3 Audit Trail Financeiro (rodapé da aba)

#### Cenário 16 — Audit Trail no rodapé da aba (contextual por sub-aba)

> 📌 **Atualizado:** o audit trail é **pré-filtrado por contexto** — quando o cliente está na sub-aba `Visão Geral`, mostra eventos de plano + cartão + fatura + compliance; quando está em `Saldo de Créditos`, mostra apenas eventos de cupom + voucher. O filtro `Tipo` vem pré-aplicado mas o cliente pode mudar pra ver todos os eventos.

**Dado** que o usuário rola até o final de qualquer sub-aba,
**Quando** chega no rodapé,
**Então** exibe seção **"Audit Trail"** (não é aba separada — fica no rodapé da mesma página),
**E** o filtro `Tipo` vem **pré-aplicado por contexto**:
- Sub-aba **Visão Geral**: tipos = `Plano, Cartão, Fatura, Compliance` (exclui Cupom/Voucher por default)
- Sub-aba **Saldo de Créditos**: tipos = `Cupom, Voucher` apenas
**E** banner informativo explica o filtro aplicado: *"Filtrado pra eventos de cupom/voucher (contexto desta sub-aba). Pra ver todos, acesse o audit completo."*,
**E** cliente pode **remover/mudar o filtro** se quiser ver eventos fora do contexto,
**E** botão **"Ver completo →"** leva pra tela dedicada de Audit Trail (sem filtro contextual aplicado),
**E** botão **"Exportar CSV"** segue o **mesmo padrão LGPD da Story 2 S4** (modal de ciência + hash SHA-256 + meta-audit).

#### Cenário 17 — Eventos auditáveis (catálogo canônico)

**Dado** que cada ação financeira gera evento auditável,
**Então** os eventos canônicos são:

**Plano/Subscription:**
- `plano.mudou` (de Pro pra Enterprise, por exemplo — feito pelo admin AwSales)
- `plano.status_mudou` (ACTIVE → PAST_DUE → ACTIVE → CANCELLATION_PENDING → CANCELLED — Stripe webhook)
- `plano.past_due_reason_adicionado` (PLAN, FEE, IMPLEMENTATION, etc.)
- `threshold_cobranca_parcial.mudou` (admin AwSales alterou o valor de threshold do variável — não é limite de uso, é frequência de billing)

**Métodos de pagamento:**
- `cartao.adicionado`
- `cartao.removido`
- `cartao.padrao_mudou`

**Faturas:**
- `fatura.gerada` (DRAFT → OPEN)
- `fatura.paga` (→ PAID)
- `fatura.falhou` (→ PAYMENT_FAILED)
- `fatura.expirou` (→ EXPIRED, boleto/PIX)
- `fatura.tentativa_retry` (Stripe retentou e mudou de PAYMENT_FAILED → PAID)
- `fatura.reembolsada` (→ REFUNDED ou PARTIALLY_REFUNDED)
- `fatura.contestada` (→ DISPUTED)
- `fatura.chargeback` (→ CHARGEBACK)
- `fatura.anulada` (→ VOID)
- `fatura.uncollectible`

**Cupons/Vouchers:**
- `cupom.aplicado_pelo_cliente` (via campo "Aplicar código")
- `cupom.aplicado_pelo_admin` (AwSales atribuiu)
- `cupom.removido` (subscription_coupon ENDED)
- `voucher.emitido` (admin AwSales criou)
- `voucher.consumido` (X reais debitados de uma fatura específica)
- `voucher.desativado` / `voucher.reativado`
- `voucher.expirou`

**Compliance / Estado da org:**
- `org.suspensa_inadimplencia` (vinculado à régua D+N do doc v5)
- `org.reativada`
- `nf.emitida_pre_pagamento` / `nf.emitida_pos_pagamento`
- `nf.enviada_email_adicional` (cada e-mail extra recebeu)

**E** cada evento registra: timestamp, executor (`AwSales · admin Bruno Costa` ou `Cliente · Felipe Rezende` ou `Sistema · webhook Stripe`), recurso afetado (link clicável), metadata (valores, IDs internos, IDs Stripe).

#### Cenário 18 — Filtros do Audit Trail Financeiro

**Dado** que o usuário quer filtrar eventos,
**Então** dispõe de filtros:
- **Período** (mesmos presets do filtro de data da Visão Geral)
- **Tipo de evento** (multi-select agrupado por domínio: Plano, Cartão, Fatura, Cupom, Voucher, Compliance)
- **Executor** (Cliente · Admin AwSales · Sistema)
- **Usuário específico** (se executor = Cliente, multi-select com membros da org)

#### Cenário 19 — Backend reusa Story 2 S4

**Dado** que a Story 2 S4 definiu o backend canônico de audit trail,
**Então** os eventos financeiros usam o **mesmo backend** com:
- Campo `domain = "financeiro"` no schema canônico,
- Mesma retenção 5 anos (LGPD),
- Mesma estrutura de meta-audit pra export,
- Mesma regra de hash SHA-256 no CSV.

### 4.4 Permissões

#### Cenário 20 — Catálogo de permissões Financeiro (PII completo)

> 📌 **Atualizado v2 (pós stress-test):** catálogo de PII expandido pra cobrir `executor.nome` e `target.nome` do audit trail (gap raiz F3 fintech BACEN).

**Dado** que a Story 2 define o catálogo,
**Então** o domínio **Financeiro** ganha 4 sub-permissões:
- `Financeiro · Visualizar` — vê faturas, gastos, gráficos, plano, vouchers, cupons, audit trail.
- `Financeiro · Gerenciar` — troca cartão, aplica cupom (escrita).
- `Financeiro · Audit Trail · Visualizar` — vê audit trail completo (pode ser separado pra perfil DPO/CISO).
- `Financeiro · Audit Trail · Exportar` — pode exportar CSV.

**E** PII Filtering (Story 2 Cenário 38 + extensão v2) aplica em:
- **`executor.nome`** do audit trail — mascarado `F***e R*****` se função sem `Visualizar PII` ⭐
- **`executor.email`** do audit trail — mascarado `f***@empresa.com` se função sem PII ⭐
- **`target.nome`** (alvo do audit, ex: "Felipe inativou Maria") — mesmo tratamento ⭐
- **`target.email`** — mesmo tratamento ⭐
- `actor.ip`, `target.ip` do audit trail — mascarado `200.4.*.*`
- E-mails de invoice adicionais — mesmo tratamento
- **EXCEÇÃO PCI-DSS**: número do cartão SEMPRE mascarado pra TODOS (regra técnica, não opcional, mesmo com PII permitido).

#### Cenário 20.1 — Pseudonimização retroativa após DSR (LGPD Art. 18 VI) ⭐

> 📌 **Novo cenário v2 (pós stress-test):** endereça gap F1-4 — audit trail vazando PII de users que exerceram direito ao apagamento.

**Dado** que um titular de dados exerceu direito ao apagamento (LGPD Art. 18 VI) via DPO,
**Quando** o DPO da AwSales aprova a anonimização,
**Então** o sistema **substitui retroativamente** no audit trail:
- `executor.nome` real → `hash_pseudo_<user_id>` público
- `executor.email` real → `hash_pseudo_<user_id>@anonymized.local`
- Hash original preservado em **cofre privado** (acessível apenas via ordem judicial, conforme Art. 16 retenção legal)
**E** o **hash SHA-256 da linha do audit permanece imutável** (integridade probatória) — o que muda é o conteúdo dos campos PII, não a linha inteira,
**E** novo evento canônico é registrado: `audit_trail.dsr_anonimizacao_aplicada` com `metadata: { user_pseudo_hash, n_registros_afetados, autorizado_por_dpo }`,
**E** **banner obrigatório no export CSV**: *"Este export aplicou anonimização retroativa em N registros (titulares que exerceram direito ao apagamento sob LGPD Art. 18 VI). Hash original disponível mediante ordem judicial — fale com nosso DPO."*

---

## 4.5 Novos cenários pós stress-test (Onda 1 hardening)

#### Cenário 21 — Idempotência de pagamento Stripe (sem duplo charge) ⭐

> 📌 **Novo v2:** endereça Cluster RC3 do stress test — duplo charge garantido por race condition PIX/retry.

**Dado** que o cliente está pra pagar uma fatura,
**Quando** clica no botão de pagamento,
**Então** o sistema:
- **Gera `idempotency_key` por fatura** (UUID v7 persistido server-side) e envia pro Stripe em TODAS as tentativas
- **Lock client-side durante PIX PENDING**: botão "Pagar com cartão" fica **disabled** com tooltip *"PIX em andamento. Aguarde até 30s pra confirmação do banco. Não pague novamente."*
- **Lock client-side durante retry automático Stripe**: botão "Tentar de novo" fica **disabled** com tooltip *"Próxima tentativa automática em <HH:MM>. Não clique novamente."*
- **Se race condition ocorrer** (2 charges no mesmo `idempotency_key`), Stripe rejeita o 2º; sistema marca fatura como `DUPLICADO_A_ESTORNAR` e exibe modal *"Identificamos cobrança duplicada — estornaremos automaticamente em até 7 dias úteis"*
- **Audit event** `fatura.estorno_duplicidade` registrado

#### Cenário 22 — Card "Plano" variant PAST_DUE com razões individuais ⭐

> 📌 **Novo v2:** endereça gap F2-1 — card mostrava "● Ativo" mesmo PAST_DUE há 30 dias.

**Dado** que a subscription está em `PAST_DUE` com 1+ razões (PLAN/FEE/IMPLEMENTATION/PHONE_LINE/SUBSCRIPTION_ADDON),
**Quando** o cliente abre a aba Financeiro,
**Então** o card "Plano" exibe **variant PAST_DUE** com:
- Background levemente avermelhado (sinal visual imediato)
- Badge **`● Pendência de pagamento`** em vermelho com ícone ⚠
- Header: "Plano Enterprise · X dias em atraso"
- **Lista das razões individuais** (não agregadas em "1 fatura"):
  - `PLAN R$ 4.500 · venceu 16/05 · [Resolver →]`
  - `FEE R$ 412 · venceu 18/05 · [Resolver →]`
  - `IMPLEMENTATION R$ 4.000 · venceu 20/05 · [Resolver →]`
- **CTA principal "Resolver pendência →"** sticky até resolução
**E** o modal de detalhes do plano mostra **a mesma informação** (sincronização card ↔ modal — sem mismatch).

#### Cenário 23 — Forecast: card "Próxima cobrança" com breakdown fixo + variável ⭐

> 📌 **Novo v2:** endereça Cluster RC6 — founder solo (F4) e high-volume (F6) confundem-se com card só de plano fixo.

**Dado** que o cliente está visualizando a Visão Geral,
**Quando** o card "Próxima cobrança" renderiza,
**Então** exibe 3 linhas:
- **Plano fixo:** R$ 7.000 (cobrado 30/06)
- **Variável estimado:** R$ ~507.430 ⓘ (com base na média dos últimos 90 dias)
- **Total previsto:** R$ ~514.430
**E** tooltip ⓘ explica: *"Estimativa baseada no consumo médio dos últimos 90 dias. Valor real só será conhecido no fechamento do mês."*,
**E** se variável = R$ 0 nos últimos 90 dias, label muda pra **"Variável: R$ 0 — você paga somente pelo plano fixo enquanto não usar gastos variáveis"** (caso F4 founder solo),
**E** **gráfico ganha linha tracejada de forecast** projetando consumo restante do mês com confidence interval visual.

#### Cenário 24 — Placeholder "Falar com responsável comercial" (não mais "Solicitar") ⭐

> 📌 **Novo v2:** endereça Cluster RC4 — botão parecia funcional mas não dispara ação backend.

**Dado** que o cliente clica em `[✉ Falar com responsável comercial]` (renomeado, antes era "Solicitar alteração/cancelamento"),
**Quando** o modal abre,
**Então** declara **explicitamente**: *"Este pedido **não** é enviado automaticamente. Pra continuar:"*,
**E** oferece 3 opções acionáveis:
1. **`[✉ Enviar e-mail pré-preenchido]`** → abre cliente de e-mail com `mailto:` (assunto + corpo template)
2. **`[📋 Copiar e-mail]`** + **`[💬 WhatsApp]`** (se número disponível)
3. **`[📅 Marcar reunião]`** (link calendly do gerente, se houver)
**E** **se cliente está em PAST_DUE** e o pedido é cancelamento, modal exibe adicionalmente:
- Multa de fidelidade **com fórmula visível**: "Multa atual: **R$ 9.992,12** = (8 meses × R$ 2.497,98) × 50%"
- Base legal: *"Conforme cláusula X do contrato + CDC Art. 51 IV — desconto proporcional ao prazo restante (não valor cheio)"*
- Aviso: *"Sua próxima cobrança de R$ X está prevista pra DD/MM — não cancele automaticamente."*

#### Cenário 25 — Mensagem específica de erro de cupom (alinha story+W5.2) ⭐

> 📌 **Atualiza Cenário 15 + W5.2:** mensagens específicas retornadas pelo Stripe.

**Dado** que o cliente aplica código inválido,
**Quando** Stripe valida,
**Então** mensagem ESPECÍFICA é exibida conforme o motivo retornado:

| Motivo Stripe | Mensagem PT-BR |
|---|---|
| `coupon_not_found` | *"Cupom 'XXX' não encontrado. Verifique o código e tente novamente."* |
| `coupon_expired` | *"Cupom 'XXX' expirou em DD/MM/AAAA. Solicite novo código ao seu gerente comercial."* |
| `coupon_max_redemptions` | *"Cupom 'XXX' atingiu o limite de uso (N de N resgates)."* |
| `coupon_currency_mismatch` | *"Cupom 'XXX' é em <moeda>. Sua organização opera em BRL — solicite cupom compatível."* |
| `coupon_redeem_by_passed` | *"Cupom 'XXX' tinha validade até DD/MM/AAAA — não pode mais ser aplicado."* |

**E throttling:** após **3 tentativas inválidas em 5 min**, sistema bloqueia por 15 min com mensagem *"Muitas tentativas. Tente novamente em 15 minutos."* (anti-enumeration attack — protege catálogo de cupons),
**E** evento `cupom.aplicacao_falhou` com motivo específico no metadata.

#### Cenário 26 — Eventos financeiros que alimentam o sistema de Notificações ⭐

> 📌 **Atualizado v2 (revisão pós-feedback PG):** Story 3 **PRODUZ os eventos canônicos** financeiros. A renderização visual (banner global por criticidade, resumo de últimas notificações no header, página global de notificações) é **escopo da Story de Notificações** (já em desenvolvimento — feature paralela). Esta story só **emite os eventos** com payload + criticidade definidos.

**Dado** que eventos financeiros críticos ocorrem,
**Quando** atendem threshold definido,
**Então** o sistema **publica os eventos canônicos** no barramento de Notificações:

| Evento canônico | Threshold | Criticidade | Onde aparece (feature de Notificações) |
|---|---|---|---|
| `fatura.vencimento_proximo` | valor ≥ R$ 100k OU 5 dias antes | **Alta** | Banner global vermelho + e-mail + resumo + página global |
| `voucher.depleted_rapido` | consumido ≥ 80% em <50% do tempo previsto | **Média** | Resumo + e-mail + página global |
| `fatura.duplicado_detectado` | 2 charges com mesmo `idempotency_key` | **Crítica** | Banner global vermelho sticky + e-mail + modal in-app + página global |
| `plano.entrou_past_due` | transição ACTIVE → PAST_DUE | **Crítica** | Banner global vermelho + e-mail + página global + WhatsApp gerente comercial |
| `org.suspensa_inadimplencia` | régua D+3 disparou | **Crítica** | Banner global vermelho sticky + e-mail + página global |
| `fatura.paga` | qualquer | **Baixa** | Resumo + página global (sem banner) |
| `cupom.aplicado_pelo_cliente` | qualquer | **Baixa** | Resumo + página global |

**E** o módulo de Notificações (feature paralela já em desenvolvimento) decide:
- **Banner global** (no topo de qualquer página do Studio) — exibe se criticidade = Crítica ou Alta
- **Resumo de últimas notificações** (dropdown no header) — exibe todas
- **Página global de Notificações** — lista completa com filtros, marcar como lida, etc.
- **E-mail / WhatsApp** — disparado conforme template + canal configurado por criticidade
**E** os eventos seguem o **schema canônico do backend** (`event_id`, `org_id`, `user_id`, `criticality`, `payload`, `timestamp`) — fácil de serem consumidos pela feature de Notificações.

> 📌 **Escopo claro:** Story 3 termina ao emitir o evento. Toda a UI de notificação visual + canais (e-mail, WhatsApp) é da Story de Notificações já em curso. Esta nota garante que **a Story 3 lista quais eventos emite** pra a feature de Notificações se vincular corretamente.

#### Cenário 27 — Audit trail escalável (50k+ eventos) ⭐

> 📌 **Atualiza Cenários 17–19:** virtual scroll + paginação + export async resiliente.

**Dado** que o audit trail pode ter 50k+ eventos no período filtrado,
**Quando** a tela carrega,
**Então:**
- **Virtual scroll** na tabela (renderiza apenas viewport, recicla DOM)
- **Paginação numérica** alternativa (preset "Itens por página: 50/100/500")
- **Jump-to-date** (input de data salta scroll pra primeira linha do dia)
- **Export CSV totalmente async**: job persistido em fila durável (SQS) — **não morre se org suspensa por inadimplência** (LGPD Art. 18 II é incondicional)
- Notificação por e-mail ao concluir + tela "Meus exports" lista exports em andamento/concluídos
- Direito de acesso preservado mesmo em org suspensa.

---

## 4.6 Novos cenários pós stress-test (Onda 2 refino UX/Compliance)

#### Cenário 28 — Preservação de estado cross-navegação ⭐

> 📌 **Novo v2.2 (Onda 2 · F2.1):** sair de Visão Geral pra Métodos de Pagamento e voltar perde filtros, toggle, scroll, busca. Endereça Nielsen H3 (user control) + H7 (flexibility).

**Dado** que o cliente está em `Visão Geral` com filtro "Últimos 30 dias" + agrupamento "Por campanha" + busca "BF" + scroll na linha 47,
**Quando** clica em `[Gerenciar métodos →]` (Cenário 10) e depois `← Voltar pra Financeiro`,
**Então** o estado anterior é **completamente restaurado**:
- Filtro de data permanece "Últimos 30 dias"
- Toggle permanece "Por campanha"
- Busca "BF" preservada
- Scroll volta à linha 47 (scroll restoration via browser API)
**E** o estado é persistido na **URL como query params** (`?period=last_30d&group=campanha&search=BF`) — link compartilhável reproduz exata mesma view,
**E** mudança de sub-aba (Visão Geral ↔ Saldo de Créditos) preserva URL params relevantes ao contexto,
**E** atalho **`← Voltar pra Financeiro`** explícito no header da sub-tela (não depender apenas do back do browser).

#### Cenário 29 — Timeline visual de dispute/chargeback no modal de fatura ⭐

> 📌 **Novo v2.2 (Onda 2 · F2.2):** modal W4 mostrava apenas status final do dispute. Sem narrativa do que aconteceu. Endereça CDC Art. 6º III + Art. 42 §único + LGPD Art. 18 II (direito de acesso à narrativa).

**Dado** que o cliente abre detalhes de uma fatura com status `DISPUTED`, `CHARGEBACK` ou `CHARGEBACK_RESOLVED`,
**Quando** o modal renderiza,
**Então** exibe seção **"Histórico desta fatura"** (timeline vertical) com todos os eventos da vida da fatura:

```
● 28/04 10:30 · Fatura emitida          (DRAFT → OPEN)
● 28/04 10:35 · Pagamento confirmado    (OPEN → PAID) · Cartão Visa •••• 3012
● 15/05 14:20 · Contestação aberta      (PAID → DISPUTED) · Chargeback aberto pelo banco do cliente
● 18/05 09:15 · Evidência submetida     · Comprovante de uso enviado pra Stripe
● 22/05 16:40 · Disputa aceita          (DISPUTED → CHARGEBACK_RESOLVED) · Favor AwSales
```

**E** cada evento mostra: timestamp, ícone, descrição PT-BR, ator (sistema · admin AwSales · banco do cliente · cliente),
**E** **PDF da fatura inclui a timeline completa** (não só line items) — fechamento contábil regulado,
**E novos eventos canônicos** adicionados ao Cenário 17: `dispute.evidencia_submetida`, `dispute.aceita`, `dispute.rejeitada`, `chargeback_resolvido`.

#### Cenário 30 — Voucher: bruto vs líquido + alerta consumo rápido ⭐

> 📌 **Novo v2.2 (Onda 2 · F2.3):** coluna "Valor cobrado" ambígua (bruto ou líquido após voucher?). Voucher DEPLETED em <72h sem alerta. Endereça CDC Art. 6º III.

**Dado** que existem faturas com voucher/cupom aplicado,
**Quando** a tabela "Histórico de faturas" renderiza,
**Então** exibe colunas explícitas:

| Mês | Descrição | Valor (bruto) | Cupom/Voucher aplicado | Pago (líquido) | Status |
|---|---|---|---|---|---|
| 05/2026 | Plano Pro + variável | R$ 1.253,04 | BF2025 · −R$ 250,61 | R$ 1.002,43 | Paga |

**E** linha de **total no rodapé**: `Bruto · R$ X · Descontos · −R$ Y · Líquido · R$ Z`,
**E** **tabela "Vouchers"** (sub-aba Saldo de Créditos) ganha **barra de progresso visual**:

```
Voucher Black Friday Setup
├──────────────░░░░░░░░░░┤  62% consumido (R$ 1.860 de R$ 3.000)
⚠ Consumindo 2.3× mais rápido que o previsto
```

**E** se voucher consumiu **≥ 80% em <50% do tempo previsto**, sistema emite evento `voucher.depleted_rapido` (criticidade Média — feature de Notificações renderiza),
**E** badge **"⚠ Consumo acelerado"** com tooltip *"Voucher previsto pra durar X dias está sendo consumido em Y dias. Considere falar com seu gerente comercial."*

#### Cenário 31 — Gráfico empilhado escalável (toggle Linear/100%/Log) ⭐

> 📌 **Novo v2.2 (Onda 2 · F2.4):** quando uma categoria domina (95% disparos), as outras 3/4 viram invisíveis no gráfico. Endereça Nielsen H8 (aesthetic + minimalist design) + CDC Art. 6º III.

**Dado** que o cliente está visualizando o gráfico de "Gastos variáveis",
**Quando** quer mudar a forma de visualização,
**Então** **toggle "Escala"** no canto superior direito do gráfico oferece 3 modos:

| Modo | Quando usar | Comportamento |
|---|---|---|
| **Linear (R$)** ⭐ default | Magnitude absoluta | Y-axis em R$, barras na altura real |
| **100% empilhado (%)** | Proporção | Todas as barras vão até 100%, mostra **mix relativo** (resolve invisibilidade da menor categoria) |
| **Log (R$)** | Comparação multi-ordem | Escala logarítmica — categorias de R$ 100 e R$ 100k aparecem comparativamente |

**E tooltip rico** ao passar o mouse em uma barra do dia: cada categoria com R$ + % do total + tendência (▲ +12% / ▼ −5% vs dia anterior),
**E** **click numa barra** abre **drawer lateral** com breakdown completo daquele dia (todas as campanhas/serviços daquele dia + total),
**E** modo selecionado persiste no URL (`?scale=log`) para preservação cross-navegação (Cenário 28).

#### Cenário 32 — Clareza "nesta organização" nos cards (sem cross-org consolidado) ⭐

> 📌 **Novo v2.2 (Onda 2 · F2.5, revisado):** modelo confirmado pelo PG — tudo filtra pela org atual, sem visão consolidada cross-org. Story de holding/grupo econômico fica fora de escopo. Endereça CDC Art. 6º III + Art. 30 + LGPD Art. 6º II.

**Dado** que o usuário tem acesso a N organizações (troca via seletor de org da Story 2 W11.1),
**Quando** acessa a aba `Financeiro` de qualquer org,
**Então** **todos os cards qualificam escopo explicitamente**:
- "Total economizado **nesta organização**" (lifetime desta org)
- "Total de desconto disponível **nesta organização**"
- "Vouchers ativos **nesta organização**"
- Card "Plano" header: "Plano Enterprise · **Organização Fyntra Tecnologia**"

**E** o header da aba Financeiro mostra **breadcrumb persistente**: `Configurações > Organização Fyntra Tecnologia > Financeiro` (sem ambiguidade de qual org),
**E** **voucher emitido pra uma org específica** mostra badge **"Vínculo: Fyntra Tecnologia"** dentro do detalhe do voucher (claro que é desta org, não compartilhado),
**E** **não existe** botão "consolidar todas as orgs" — para ver outra org, usuário troca via seletor (acesso explícito via Story 2).

#### Cenário 33 — WCAG 2.1 AA — Acessibilidade base ⭐

> 📌 **Novo v2.2 (Onda 2 · F2.6):** badges dependiam só de cor pra distinguir status. Sem aria-labels em ícones. Sem semântica em tabelas. Aplica padrão WCAG 2.1 AA em toda a aba.

**Dado** que a tela deve atender WCAG 2.1 AA,
**Então:**
- **Cor + ícone + label texto** em TODOS os badges de status (não depender só de cor — WCAG 1.4.1 Use of Color),
- **`aria-label`** em todos os ícones com significado semântico; `aria-hidden="true"` em ícones puramente decorativos,
- **Tabelas** com `<th scope="col">` + `<caption>` (screen readers leem cabeçalhos corretamente),
- **Contraste mínimo 4.5:1** em texto normal · **3:1** em texto grande (validado via axe-core ou Lighthouse no CI),
- **Navegação por teclado completa**: Tab passa em todos os elementos interativos na ordem visual; modais com **focus trap** (Tab cicla dentro); Escape fecha modal; Enter ativa botão focado,
- **Loaders/empty states** com `role="status"` + `aria-live="polite"` (screen readers anunciam mudanças),
- **Focus visível** em todos elementos focáveis (outline mínimo 2px, contraste com background),
- **Labels associadas** a inputs via `for=` ou wrapping,
- **Charts** acompanhados de **tabela de dados acessível** (alternativa textual ao SVG).

**E** auditoria automatizada (axe-core via Lighthouse CI) é gate de PR — zero erros WCAG A/AA pra mergear.

#### Cenário 34 — Audit trail vocabulário PT-BR + tooltips ⭐

> 📌 **Novo v2.2 (Onda 2 · F2.7):** founder solo (F4) achava que audit trail era "log de erros" porque via snake_case e jargão. Schema técnico permanece no backend; UI mostra PT-BR coloquial. Endereça Nielsen H2 (match real world) + H10 (help/docs) + LGPD Art. 6º VI (clareza).

**Dado** que a UI do audit trail (Cenários 16-19) renderiza eventos canônicos,
**Quando** renderiza a coluna **"Ação"**,
**Então** **traduz cada enum técnico pra PT-BR coloquial** (mantendo o enum no backend e no `data-event-id` para auditoria/integração):

| Enum técnico | UI (PT-BR coloquial) |
|---|---|
| `plano.mudou` | Plano alterado |
| `plano.status_mudou` | Status do plano mudou |
| `plano.past_due_reason_adicionado` | Razão de inadimplência adicionada |
| `threshold_cobranca_parcial.mudou` | Cobrança parcial reconfigurada |
| `cartao.adicionado` | Cartão cadastrado |
| `cartao.removido` | Cartão removido |
| `cartao.padrao_mudou` | Cartão padrão trocado |
| `fatura.gerada` | Fatura emitida |
| `fatura.paga` | Fatura paga |
| `fatura.falhou` | Pagamento falhou |
| `fatura.tentativa_retry` | Nova tentativa de cobrança |
| `fatura.reembolsada` | Reembolso processado |
| `fatura.contestada` | Contestação aberta |
| `fatura.chargeback` | Banco devolveu o valor |
| `fatura.estorno_duplicidade` | Estorno por duplicidade |
| `cupom.aplicado_pelo_cliente` | Cupom aplicado (pelo cliente) |
| `cupom.aplicado_pelo_admin` | Cupom aplicado (pela AwSales) |
| `cupom.removido` | Cupom removido |
| `cupom.aplicacao_falhou` | Aplicação de cupom falhou |
| `voucher.emitido` | Voucher emitido |
| `voucher.consumido` | Voucher consumido |
| `voucher.depleted_rapido` | Voucher esgotando rápido |
| `voucher.desativado` | Voucher pausado |
| `voucher.reativado` | Voucher reativado |
| `voucher.expirou` | Voucher expirou |
| `audit_trail.dsr_anonimizacao_aplicada` | Anonimização LGPD aplicada |
| `org.suspensa_inadimplencia` | Organização suspensa por inadimplência |
| `org.reativada` | Organização reativada |

**E** tooltip ⓘ no header da seção: *"Audit trail é o registro de TODAS as ações no Financeiro desta organização — quem fez, quando, em qual recurso. Útil pra auditoria contábil, contestação de cobrança e LGPD."*,
**E** **hover em cada linha** revela tooltip secundário com o **enum técnico original** (`plano.mudou`) — útil pra DPO/dev que precisa correlacionar com schema/SIEM,
**E** export CSV traz **ambas colunas**: `acao_label_ptbr` + `acao_enum` (PT-BR pra leitura humana, enum pra parsing automático).

---

## 4.7 Anti-claims pós stress-test

> 📌 **Novos anti-claims v2** baseados em decisões de produto após stress test:

- **AC8.** Visão consolidada cross-org — **toda tela é filtrada pela organização atual** (modelo confirmado pelo PG). Se usuário tem acesso a N orgs, ele troca de contexto pelo seletor (Story 2 W11.1). **Não existe** card/relatório/audit "consolidado de todas as orgs do usuário" — cada org é visualizada isoladamente. Clareza visual nos cards garante que o cliente sempre saiba que está vendo dados **desta organização**.
- **AC9.** Past_due crônico em larga escala — fluxo de renegociação self-service não está no escopo da Story 3. Cliente em past_due usa o botão `[✉ Falar com responsável comercial]` (Cenário 24). Renegociação via UI é potencial Story futura (refino do doc v5 Cobrança & Cancelamento).

> 📌 **Nota sobre verticais reguladas (fintech BACEN, saúde HIPAA, etc.):**
> Não são ICP atual do AwSales. Story 3 cobre LGPD + CDC + PCI-DSS (universais pra qualquer cliente B2B brasileiro) sem se especializar em verticais reguladas específicas. Os fixes derivados desses cenários adversariais (PII filtering completo, dispute timeline, schema canônico de audit) **são incorporados** porque servem **a todos os clientes**, não apenas fintech.

---

## 5. Definição de Pronto (DoD) para QA

**Visão Geral:**
- [ ] Layout sem redundâncias: tabela "Meio de pagamentos" isolada removida; status duplicado eliminado.
- [ ] Card "Plano" exibe nome + status (lifecycle Stripe) + valor + intervalo; botão "Detalhes" abre modal readonly.
- [ ] Botão "Trocar cartão" inline no card da fatura funciona.
- [ ] Sub-tela "Métodos de pagamento" funcional (listar, tornar padrão, remover, adicionar).
- [ ] Filtro de data com 10 presets + período customizado, default "Este mês".
- [ ] Filtro atualiza gráfico + tabela gastos por serviço + tabela campanhas simultaneamente.
- [ ] Seção "Gastos variáveis" unificada (gráfico + tabela) com toggle `Por serviço | Por campanha`.
- [ ] Mudar agrupamento atualiza gráfico **e** tabela simultaneamente (sem recarregar filtros).
- [ ] Modo `Por serviço`: barras empilhadas por tipo de serviço + tabela com Serviço / Quantidade / Valor unitário / Total.
- [ ] Modo `Por campanha`: barras empilhadas por campanha (cor única por campanha) + tabela com Nome / Tipo / Status / Valor / Ver detalhes.
- [ ] Overlay de economia (cupom/voucher) presente em ambos os modos.
- [ ] Soma da tabela bate com card "Gastos variáveis utilizados" nos 2 modos.
- [ ] Modal "Ver detalhes da campanha" exibe breakdown por macro-fee (Disparos / Leads / Mensagens / Tokens em vários tipos).
- [ ] Histórico de faturas com 13 status Stripe + coluna Cupom/Voucher aplicado.
- [ ] Modal "Ver detalhes da fatura" com line items + cupom + total + download PDF.

**Saldo de Créditos:**
- [ ] 3 cards de resumo (Total economizado, Total desconto disponível, Vouchers ativos).
- [ ] Tabela Vouchers com 5 status Stripe + taxas elegíveis (fees aplicáveis).
- [ ] Tabela Cupons com 3 status Stripe + tipo (ONCE/REPEATING) + métricas de uso.
- [ ] Campo "Aplicar código de cupom" valida via Stripe (existe, ACTIVE, currency, max_redemptions).
- [ ] Mensagens de erro específicas pra cada motivo de falha de cupom.
- [ ] Estado vazio educado quando não há créditos.

**Audit Trail Financeiro:**
- [ ] Seção no rodapé da Visão Geral E da Saldo de Créditos.
- [ ] **Filtro contextual por sub-aba:** Visão Geral pré-filtra Plano/Cartão/Fatura/Compliance · Saldo de Créditos pré-filtra Cupom/Voucher.
- [ ] Banner explicativo do filtro aplicado, com opção de remover/ampliar.
- [ ] Botão "Ver completo →" abre tela dedicada sem filtro contextual.
- [ ] 20+ tipos de eventos canônicos cobertos (lista do Cenário 17).
- [ ] Filtros adicionais: período, tipo de evento, executor, usuário específico.
- [ ] Reusa backend da Story 2 S4 (mesmo schema, retenção 5 anos, meta-audit, hash CSV).
- [ ] Modal LGPD obrigatório antes de exportar.

**Permissões:**
- [ ] 4 sub-permissões `Financeiro` criadas no catálogo da Story 2.
- [ ] PII Filtering aplica em e-mails + IPs do audit trail.
- [ ] PCI-DSS: número do cartão SEMPRE mascarado (•••• 3012), mesmo pra usuários com permissão de PII.

**Observabilidade:**
- [ ] Cada ação relevante gera evento no audit trail financeiro com schema canônico (event_id, timestamp, org_id, user_id, action, target, metadata).

**Onda 2 — Refino UX/Compliance (Cenários 28–34):**
- [ ] Estado preservado cross-navegação (URL params + scroll restoration + atalho `← Voltar`).
- [ ] Timeline visual de dispute/chargeback no modal de fatura + PDF inclui timeline + 4 novos eventos canônicos (`evidencia_submetida`, `disputa_aceita`, `disputa_rejeitada`, `chargeback_resolvido`).
- [ ] Tabela faturas com colunas Bruto · Cupom/Voucher · Pago (líquido) + linha de total.
- [ ] Vouchers com barra de progresso + alerta "consumo acelerado" (evento `voucher.depleted_rapido`).
- [ ] Toggle de escala do gráfico (Linear · 100% · Log) + tooltip rico + drawer ao clicar numa barra.
- [ ] Todos os cards qualificam "**nesta organização**" + breadcrumb persistente.
- [ ] WCAG 2.1 AA: cor + ícone + label em todos os badges; aria-labels; tabelas com `<th scope>` + `<caption>`; contraste 4.5:1; focus trap nos modais; teclado completo; gate axe-core no CI.
- [ ] Audit trail com labels PT-BR coloquiais + tooltip explicativo no header + hover revela enum técnico + export CSV traz `acao_label_ptbr` + `acao_enum`.

---

## 6. Cenários de Teste Obrigatórios (QA — BDD de Quebra)

### Q1 — Filtro de data com período sem dados

**Dado** que cliente seleciona "Últimos 7 dias" mas não houve cobranças,
**Quando** filtra,
**Então** gráfico mostra estado vazio "Nenhum gasto no período" + tabela campanhas exibe 0 linhas,
**E** card "Gastos variáveis utilizados" mostra R$ 0,00.

### Q2 — Soma de campanhas não bate com card de gastos variáveis

**Dado** que houve gasto fora de campanha (ex: phone line, addon),
**Quando** cliente compara,
**Então** sistema exibe note explicativo "Inclui R$ X em cobranças fora de campanha (linha telefônica, addons)".

### Q3 — Cupom aplicado por cliente mas Stripe rejeita

**Dado** que cliente aplica código válido na UI,
**Quando** Stripe retorna erro inesperado (não previsto),
**Então** UI exibe mensagem genérica "Não foi possível aplicar o cupom. Entre em contato com o suporte." com botão pra contato Gerente da Conta,
**E** evento `cupom.aplicacao_falhou` registrado no audit trail com erro completo do Stripe.

### Q4 — Cliente tenta trocar cartão mas cartão expirado é o atual padrão

**Dado** que o cartão padrão expirou,
**Quando** cliente adiciona novo cartão,
**Então** sistema sugere automaticamente "Tornar este o cartão padrão" (com checkbox marcado).

### Q5 — Cliente tenta exportar CSV de audit trail com 100k+ linhas

**Dado** que o filtro retorna 150k eventos,
**Quando** clica "Exportar",
**Então** sistema bloqueia com "Export muito grande. Aplique mais filtros." (mesma regra Q17 da Story 2).

### Q6 — Voucher consumido durante fluxo de pagamento da fatura

**Dado** que voucher ACTIVE tem saldo R$ 200 e fatura é de R$ 500,
**Quando** Stripe processa,
**Então** voucher debita os R$ 200, status passa pra `DEPLETED`, fatura mostra "R$ 200 economizados com voucher",
**E** evento `voucher.consumido` no audit trail com valor R$ 200.

### Q7 — Cliente sem permissão `Financeiro · Gerenciar` clica em "Trocar cartão"

**Dado** que usuário só tem `Financeiro · Visualizar`,
**Quando** tenta clicar em "✎ Trocar",
**Então** botão fica desabilitado com tooltip "Você não tem permissão pra alterar métodos de pagamento. Fale com o Admin.",
**E** sub-tela "Métodos de pagamento" mostra cartões em readonly (sem botões de ação).

### Q8 — Audit Trail de um evento que ocorreu antes da retenção 5 anos

**Dado** que cliente filtra período "Últimos 7 anos",
**Quando** export é solicitado,
**Então** sistema retorna apenas eventos dentro de 5 anos (limite LGPD),
**E** badge no header informa "Eventos com mais de 5 anos foram arquivados — solicite ao suporte".

### Q9 — PCI-DSS: tentar acessar número completo do cartão via DevTools

**Dado** que um usuário malicioso tenta ler `card.number` do response da API,
**Quando** inspeciona,
**Então** o backend retorna APENAS `last4` + `brand` + `exp_month` + `exp_year` (Stripe Elements pattern), nunca o PAN completo,
**E** mesmo com permissão `Visualizar PII`, o cartão completo nunca é exposto (regra técnica PCI).

### Q10 — Plano em PAST_DUE com múltiplos past_due_reasons

**Dado** que subscription tem `pastDueReasons = ['PLAN', 'FEE']`,
**Quando** cliente abre detalhes do plano,
**Então** exibe ambas as razões com data de primeira observação e CTA "Resolver pendência" linkando pra fatura específica que falhou.

### Q11 — Status `DISPUTED` na fatura

**Dado** que cliente abriu chargeback no cartão dele,
**Quando** vê a fatura na lista,
**Então** badge "DISPUTED" em vermelho + linha bloqueada (sem ação "Pagar de novo") + tooltip "Estamos contestando esta cobrança junto ao seu banco. Aguarde resolução.".

### Q12 — Cliente aplica cupom mas org está em CANCELLATION_PENDING

**Dado** que org está com status `CANCELLATION_PENDING`,
**Quando** tenta aplicar cupom,
**Então** sistema bloqueia: "Sua organização está em processo de cancelamento. Aplicações de cupom estão suspensas.".

---

## 7. Resultado Esperado e Métricas de Sucesso

**Métrica Principal:**
- **% de tickets de suporte sobre "o que é essa cobrança?" / "qual cartão tá cadastrado?" / "esse cupom foi aplicado?"** — redução esperada **≥70%** nos primeiros 60 dias.
- **Como medir:** comparar volume mensal de tickets categorizados como "dúvida de cobrança" antes vs depois do lançamento.

**Métricas Secundárias:**
- **Tempo médio na aba Financeiro** — aumento sinaliza engajamento (cliente conferindo, não fugindo).
- **Adoção do filtro de data customizado** — % de clientes que usam períodos diferentes do default em 30 dias.
- **Uso da tabela de campanhas** — clicks em "Ver detalhes" / org / mês.
- **Aplicação de cupom via UI** — # de cupons aplicados pelo cliente direto (vs via admin) em 90 dias.
- **Export CSV de audit trail** — # exports / org / mês (sinaliza valor pra compliance).
- **Taxa de cliques em "Solicitar alteração de plano"** (placeholder informativo) — sinaliza demanda pra futura feature de self-service.

**Critério de Rollback / Investigação Urgente:**
Se em 30 dias:
- Taxa de tickets aumentar em vez de reduzir **OU**
- Inconsistência: soma de campanhas ≠ card de gastos variáveis em mais de 1% dos casos **OU**
- Aplicação de cupom falhar em >10% das tentativas,
→ pausar a feature de aplicação self-service de cupom, voltar ao fluxo manual com AM, investigar.

---

## Anexos e Referências

- **Doc backend Billing:** [`apps/awsales-backend/docs/content/docs/domain/billing/`](../../apps/awsales-backend/docs/content/docs/domain/billing/) — fonte de verdade pra invoice lifecycle, subscription lifecycle, coupons, vouchers, costs, dunning.
- **Doc cobrança v5:** [fluxo_cobranca_cancelamento_awsales_v5.docx](../2026-04-08-novo-fluxo-cobranca-cancelamento/fluxo_cobranca_cancelamento_awsales_v5.docx) — regras de pro-rata, fechamento, NF, cancelamento.
- **Story 1:** [stories/primeiro-login.md](stories/primeiro-login.md) — fluxo de pagamento da implementação (cliente vê primeira fatura aqui).
- **Story 2:** [stories/team-funcoes-config.md](stories/team-funcoes-config.md) — catálogo de permissões + backend de audit trail (S4) reusado.
- **Wireframes da tela atual (legacy):** 3 prints fornecidos pelo PG (Visão geral + Saldo de créditos + menu de ações).
- **Wireframes do admin (criar cupom + emitir voucher):** 2 prints fornecidos pelo PG — confirma modelo de dados pra display no cliente.

---

## Pendências de Confirmação com PG

1. **Botão "Solicitar alteração de plano"** — entra como placeholder informativo no MVP (mostra contato Gerente da Conta) ou já dispara fluxo? Sugiro placeholder no MVP, fluxo em story futura.
2. **Botão "Solicitar cancelamento"** — escopo da Story de Cancelamento (doc v5) — confirma que apenas linka, não implementa aqui?
3. **Macro-fees futuras** — quando produto adicionar nova categoria (ex: Storage, Pesquisa), basta atualizar enum no backend? UI deve detectar automaticamente?
4. **Adicionar novo cartão** — usa Stripe Elements (iframe oficial Stripe) pra coletar cartão? Confirma compliance PCI mais simples (Stripe absorve, AwSales nunca toca PAN)?
5. **Filtro "Período de uso/consumo" vs "Período de cobrança"** — confirmado que default é uso/consumo. Tem cenário em que cliente quer ver por data de cobrança? Se sim, adicionar 2º seletor (eixo do filtro).

---

## Changelog

- **2026-05-11 (v1)** — Versão inicial da Story 3 após sessão de refinamento com PG, 3 prints da tela atual + 2 prints do admin (cupom + voucher), 20 perguntas respondidas, doc backend de billing consultado.
- **2026-05-11 (v2.1 — revisão pós-feedback PG)**:
  - **"Limite de gastos variáveis" renomeado pra "Cobrança parcial quando atingir"** — fix de clareza: NÃO é teto de uso, é threshold de billing. Atualizado em Cenário 1 + Cenário 3 + evento canônico `threshold_cobranca_parcial.mudou`.
  - **Anti-claims revistos:** AC8 (fintech BACEN) **removido** — não é ICP, fixes derivados foram incorporados como melhorias universais (PII completo, dispute timeline, schema canônico). AC9 (holding/Grupo Econômico) **substituído** por: "toda tela filtra pela org atual, sem visão consolidada cross-org" (modelo de produto confirmado). AC10 (past_due) renumerado pra AC9.
  - **Cenário 26 (Notificações) reescrito:** Story 3 PRODUZ os eventos canônicos; renderização visual (banner global, resumo, página global) é escopo da feature de Notificações já em desenvolvimento.

- **2026-05-11 (v2.2 — Onda 2 aplicada · refino UX/Compliance)** — Aplicados os 7 fixes P1 da Onda 2 do fix-backlog:
  - **Cenário 28** — Preservação de estado cross-navegação (URL params + scroll restoration + atalho voltar) — F2.1
  - **Cenário 29** — Timeline visual de dispute/chargeback no modal de fatura + 4 novos eventos canônicos — F2.2
  - **Cenário 30** — Voucher bruto vs líquido + barra de progresso + alerta consumo acelerado — F2.3
  - **Cenário 31** — Gráfico escalável (toggle Linear/100%/Log) + tooltip rico + drawer — F2.4
  - **Cenário 32** — Clareza "nesta organização" em todos os cards (sem cross-org consolidado) — F2.5 revisado
  - **Cenário 33** — WCAG 2.1 AA completo (cor+ícone+label, aria-labels, focus trap, contraste, teclado, axe-core CI gate) — F2.6
  - **Cenário 34** — Audit trail vocabulário PT-BR (tabela de tradução enum→label) + tooltip header + export CSV com ambas colunas — F2.7
  - DoD expandido com checklist Onda 2.

- **2026-05-11 (v2 — pós stress test triplo)** — Endereçados gaps P0 do stress test 2026-05-11 (lente tripla 🔧 Funcional + ⚖️ Compliance + 🎯 UX/Acessibilidade):
  - **Status PT-BR** + 2 novos status (`PAGAMENTO_PARCIAL`, `DUPLICADO_A_ESTORNAR`) — Cenário 8.1 reescrito (Cluster RC7 do stress)
  - **PII Filtering completo** — Cenário 20 expandido pra cobrir `executor.nome/email` e `target.nome/email` (Cluster RC2, gap raiz F3 fintech BACEN)
  - **DSR Pseudonimização retroativa** — novo Cenário 20.1 (LGPD Art. 18 VI + Art. 13 + Art. 38) — Cluster RC12
  - **Idempotência Stripe** — novo Cenário 21 (`idempotency_key` + locks + status `DUPLICADO_A_ESTORNAR` + estorno automático) — Cluster RC3 (CDC Art. 42 §único)
  - **Card variant PAST_DUE** com razões individuais — novo Cenário 22 (Cluster RC1 + RC7)
  - **Forecast / breakdown fixo+variável** — novo Cenário 23 (Cluster RC6) — endereça F4 SMB + F6 high-volume
  - **Placeholder "Falar com responsável comercial"** explícito — novo Cenário 24 (Cluster RC4, CDC Art. 51 IV)
  - **Mensagem específica de erro de cupom** + throttling — Cenário 25 atualiza Cenário 15 (Cluster RC10)
  - **Notificações proativas financeiras** — novo Cenário 26 com matriz eventos→canais→thresholds (Cluster RC13)
  - **Audit trail escalável** (virtual scroll + paginação + export async resiliente) — novo Cenário 27 (Cluster RC8, LGPD Art. 18 II incondicional)
  - **Anti-claims AC8, AC9, AC10** — Story 3 não atende fintech BACEN, holding multi-org, past_due crônico em larga escala. Story 4 / Story 5 endereçam.
