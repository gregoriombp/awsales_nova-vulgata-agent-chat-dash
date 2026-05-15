# Stress Test Financeiro — F2: Past_due crônico (Casa Bahia Filial)

**Agente:** adversarial Red Team com lente tripla (Funcional + Compliance + UX)
**Data:** 2026-05-11
**Cenários testados:** 5
**Perfil financeiro:** Aderbal, 60 anos, diretor financeiro de filial Casa Bahia. Plano Pro R$ 4.500/mês via boleto D+30. Past_due crônico há 30 dias com 3 razões cumulativas (PLAN + FEE + IMPLEMENTATION). Perfil enterprise burocrático — espera que sistema seja explícito sobre dinheiro e dê opções claras de resolução, não esconda nada.

## Sumário

- **Passaram:** 0 · **Com dor:** 1 · **Quebraram:** 4
- **Total de gaps:** 22 (P0: 9 · P1: 9 · P2: 4)
- **Por lente:** Funcional 8 · Compliance 7 · UX 7

**Top 3 críticos:**
1. **F2-1 G1 (P0/Compliance)** — Card "Plano Pro · ● Ativo" enquanto subscription está PAST_DUE há 30 dias com 3 razões pendentes. **Violação direta de CDC Art. 6º III** (cliente DEVE ter informação clara e adequada sobre o estado do serviço, especialmente quando há débito). Inadimplência precisa estar visível no nível de card, não escondida em modal de 2º clique.
2. **F2-2 G2 (P0/Funcional+Compliance)** — Botão "Tentar de novo" não bloqueia durante retry automático do Stripe (sem idempotency_key, sem disable). Race condition cria 2 charges simultâneos sobre mesma fatura. **PCI-DSS 6.5.5 + idempotência básica de pagamento** — duplo débito num cliente já em past_due cria reclamação Procon imediata.
3. **F2-4 G2 (P0/Compliance)** — Régua D+3 suspende org durante export CSV de audit trail em andamento. Cliente perde direito de acesso aos próprios dados financeiros no exato momento em que mais precisa pra contestar a suspensão. **Viola LGPD Art. 18 II** (direito de acesso é incondicional, não pode ser revogado por inadimplência).

## Cenários

### F2-1: Plano em PAST_DUE com 3 razões aparece como "Ativo" no card

**Seed original:** Aderbal entra no Financeiro. Card do plano mostra "Plano Pro · ● Ativo · R$ 4.500/mês". Mas no Modal Detalhes mostra "PAST_DUE desde 14/05" com 3 razões: PLAN + FEE + IMPLEMENTATION. Lentes: F (sincronização card vs modal), U (Nielsen H1 — status inconsistente), ⚖ CDC Art. 6º III.

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Aderbal navega `Studio → Configurações → Financeiro`. Vem do e-mail "régua D-2 antes da suspensão". Mental model: precisa entender O QUE deve, POR QUE, e COMO resolver — agora, sem ligar pra ninguém.
   - 🔧 Funcional: a tela carrega — OK.
   - ⚖ Compliance: nada visualmente sinaliza urgência antes do scroll. CDC Art. 6º III exige informação clara *adequada* — não basta existir, precisa ser *facilmente percebida*.
   - 🎯 UX: zero affordance de criticidade. Aderbal, 60 anos, com baixa familiaridade digital, pode passar batido pelos badges de fatura.

2. **Beat 1 — Card "Plano":** Renderiza `Plano Pro · ● Ativo · R$ 4.500/mês [Detalhes do plano]`. Verde dot, label "Ativo".
   - 🔧 **Funcional (P0):** estado do dado está errado. Subscription Stripe está `PAST_DUE` — UI cliente classifica como "Ativo". A spec do Cenário 3 lista `PAST_DUE` como status possível mas o W1 só prevê "● Ativo" como variant no card. **Renderização não-fiel ao backend.** Subscription lifecycle do Stripe usa `past_due` como estado próprio, não substato de active.
   - ⚖ **Compliance (P0):** **CDC Art. 6º III** — direito básico à informação adequada e clara. Esconder past_due no card primário é information asymmetry deliberada (ou negligente). **CDC Art. 31** — informação correta sobre o produto/serviço. Aderbal vê "Ativo", pode informar à matriz que está tudo OK, depois descobre que filial será suspensa em 3 dias.
   - 🎯 **UX (P0):** **Nielsen H1 (Visibilidade do estado)** violado — o estado mais crítico do sistema (subscription past_due, 30 dias, 3 razões, suspensão iminente) está mascarado como estado positivo. **Nielsen H2 (Match mental model)** — "Ativo" pra cliente brasileiro significa "tudo OK" (mental model fiscal: nota ativa = empresa OK). O wireframe W1 explicitamente desenha "● Ativo" verde no card mesmo quando subscription tem outro lifecycle.

3. **Beat 2 — Card "Fatura atual":** mostra "⚠ Em aberto · R$ 4.500,00 · venc 16/05" (já vencida há 30 dias, mas label apenas "Em aberto" amarelo).
   - 🔧 **Funcional (P1):** mistura `OPEN` (Stripe pré-vencimento) com `PAYMENT_FAILED` ou `past_due` real. Fatura vencida há 30 dias não é mais "Em aberto" — deveria ser `PAYMENT_FAILED` ou flag `OVERDUE_30D`. Story Cenário 8.1 lista os status mas não diferencia "aberto pré-vencimento" de "vencido e não pago". Esse é exatamente o status que dispara a régua D+N.
   - ⚖ **Compliance (P1):** **CDC Art. 42 §único** (cobrança indevida ou abusiva) — se a fatura está com múltiplas razões (PLAN + FEE + IMPLEMENTATION são 3 cobranças distintas), UI mostrar apenas 1 card de "Fatura atual" oculta as outras 2. Cliente não consegue diferenciar quais valores aceita pagar e quais quer contestar.
   - 🎯 **UX (P1):** **Nielsen H1** novamente — "Em aberto" amarelo subjuga a urgência. Fatura 30 dias vencida deveria ser vermelho com countdown "Suspensão em 3 dias".

4. **Beat 3 — Aderbal clica em "[Detalhes do plano]":** Modal W2.1 abre. AGORA mostra "⚠ PAST_DUE (desde 14/05)" + 3 razões + CTA "Resolver pendência →".
   - 🔧 **Funcional (P0):** inconsistência card vs modal. Mesma fonte de dado (subscription.status), 2 renderizações contraditórias na mesma tela. Quem auditasse via DevTools (Aderbal não, mas DPO de uma fintech sim) verificaria viés de UI.
   - ⚖ **Compliance (P0):** **CDC Art. 6º III + Art. 31** — informação correta tem que ser apresentada no primeiro nível, não em modal de 2º clique. Cliente enterprise pode usar essa inconsistência judicialmente: "AwSales sabia que eu estava past_due mas exibia 'Ativo' — induziu a erro." **LGPD Art. 6º I (finalidade)** — dado financeiro tem que ser tratado de forma transparente, com clareza.
   - 🎯 **UX (P0):** **Nielsen H1, H2, H4 (consistência)** — mesma entidade renderizada como 2 estados diferentes em UI viola a heurística de consistência mais básica.

5. **Beat 4 — Aderbal clica em "Resolver pendência →":** Link da spec aponta pra "fatura específica que falhou". Mas tem 3 razões = potencialmente 3 faturas distintas. Pra qual o link leva?
   - 🔧 **Funcional (P1):** ambiguidade no contrato do botão. Spec Q10 fala "linka pra fatura específica que falhou" no singular. Com 3 razões, qual? A mais antiga? A maior? Todas?
   - ⚖ **Compliance (P1):** **CDC Art. 42 §único** — cliente precisa poder pagar/contestar cada fatura individualmente, não em pacote.
   - 🎯 **UX (P2):** **Nielsen H10** (help & docs) — falta tooltip explicando que "Resolver pendência" pode envolver múltiplas faturas.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência |
|----|-------|-----------|------------|----------------|-----------|
| F2-1.G1 | Compliance+UX+Funcional | Card "Plano" mostra "● Ativo" enquanto subscription está PAST_DUE no Stripe | **P0** | CDC Art. 6º III, Art. 31; Nielsen H1, H2 | W1 linha 31 desenha "● Ativo" como variant único do card de plano |
| F2-1.G2 | Funcional | "Em aberto" amarelo não diferencia vencido-há-30-dias de vencido-há-1-dia | P1 | Nielsen H1 | Cenário 8.1 não tem status pra "OVERDUE com régua disparada" |
| F2-1.G3 | UX | Falta countdown visível "Suspensão em N dias" no card de fatura quando régua D-N está ativa | P1 | Nielsen H1, H10 | W1 não prevê variant de fatura com countdown de suspensão |
| F2-1.G4 | Compliance | Múltiplas razões de past_due aparecem agregadas como "1 fatura em aberto" no card primário | P0 | CDC Art. 6º III, Art. 42 §único | Beat 2 |
| F2-1.G5 | Funcional | "Resolver pendência →" no singular não funciona com 3 razões = 3 faturas | P1 | — | W2.1 + Q10 falam "fatura específica" |
| F2-1.G6 | UX | Modal W2.1 lista 2 razões (PLAN + FEE) mas seed tem 3 (+ IMPLEMENTATION) | P2 | Nielsen H4 | Wireframe W2.1 incompleto vs spec |

**Status:** ❌ **Quebrou.** Inconsistência card vs modal é a falha mais grave de toda a Story 3 nesta avaliação. Cliente em past_due é cliente em crise — UI que esconde estado real expõe AwSales a CDC + risco de reclamação no Procon.

---

### F2-2: Fatura PAYMENT_FAILED com botão "Tentar de novo" durante retry automático do Stripe

**Seed original:** Aderbal vê fatura em status `PAYMENT_FAILED`. Clica em "Tentar de novo" no menu kebab. Stripe estava no meio do retry automático (3ª tentativa). Resultado: race condition, 2 charges ao mesmo tempo. Lentes: F (idempotência), ⚖ PCI-DSS 11.5, U (Nielsen H5).

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Stripe configurado com smart retry (Dunning settings) — vai retentar D+3, D+5, D+7 após PAYMENT_FAILED. Aderbal está há 30 dias inadimplente, recebeu e-mail "última tentativa de cobrança". Abre Financeiro pra forçar retry manual achando que vai resolver.
   - 🔧 Funcional: Stripe está exatamente no meio da 3ª retry agendada — tem 1 charge `pending` no Stripe.
   - ⚖ Compliance: nenhuma sinalização ao cliente de que existe retry automático rodando.
   - 🎯 UX: cliente acha que está no controle.

2. **Beat 1 — Aderbal vê fatura "● PAYMENT_FAILED · R$ 4.500":** Clica no menu kebab "…". Aparece opções `Ver detalhes`, `Baixar fatura`. Seed adiciona "Tentar de novo" — Story 3 atual NÃO prevê esse botão.
   - 🔧 **Funcional (P0):** **gap de spec.** Story 3 Cenário 8 lista ações do kebab: `Ver detalhes` e `Baixar fatura` apenas. Não há "Tentar de novo" especificado. Se essa ação for adicionada sem design, vira ad-hoc e quebra. **AC2 (cancelamento self-service fora do escopo)** — se "Tentar de novo" também conta como ação self-service de pagamento, deveria estar fora do MVP ou ter spec dedicada.
   - ⚖ **Compliance (P0):** **PCI-DSS 6.5.5** (improper error handling) + **boas práticas de idempotência de pagamento**. Charge sem idempotency_key gera duplicação. **CDC Art. 39 V** (cobrança abusiva) — duplo débito em cliente já inadimplente é cobrança duplicada.
   - 🎯 **UX (P0):** **Nielsen H5 (prevenção de erros)** — botão "Tentar de novo" deveria estar disabled durante retry pendente E mostrar tooltip "Tentativa automática de cobrança em andamento. Próxima tentativa: hoje às 14h." **Nielsen H1** — falta de visibilidade do retry automático.

3. **Beat 2 — Aderbal clica "Tentar de novo":** UI envia POST a `/billing/invoices/{id}/retry` sem checar estado do Stripe. Stripe inicia 4ª charge enquanto 3ª está `pending`. Resultado: **2 cobranças simultâneas no cartão**.
   - 🔧 **Funcional (P0):** **race condition documentada.** Sem idempotency_key + sem optimistic locking no client → race garantida. Stripe pode debitar 2x ou rejeitar 2 cobranças. Cenário Q3 (Stripe rejeita cupom) cobre erro genérico mas não cobre duplo charge.
   - ⚖ **Compliance (P0):** **PCI-DSS 6.5.5 + 11.5 (monitoramento de integridade)** — duplo débito sem rastreio. **BACEN Circular 4.893** se cliente for fintech — gestão de risco operacional exige idempotência. **CDC Art. 42 §único** — cliente que paga duplicado tem direito a devolução em dobro (cobrança indevida).
   - 🎯 **UX (P1):** **Nielsen H9 (recuperação de erros)** — se duplo débito acontecer, qual a UX de remediation? Spec não cobre. Cliente vê 2 charges no extrato e liga no SAC.

4. **Beat 3 — Audit Trail:** evento `fatura.tentativa_retry` aparece 2x (uma do retry automático Stripe, uma do clique do cliente). Mas se cobrança duplicar, evento `fatura.paga` pode aparecer 2x também — sem distinção de "cobrança duplicada" como evento próprio.
   - 🔧 **Funcional (P1):** catálogo de eventos do Cenário 17 não inclui `fatura.cobranca_duplicada` ou `fatura.retry_concorrente_detectado` — perda de observabilidade.
   - ⚖ **Compliance (P1):** **LGPD Art. 38** (relatório de impacto / auditabilidade) — evento crítico sem registro próprio dificulta investigação de incidente.
   - 🎯 **UX (P2):** mesmo se o audit trail mostrar 2 fatura.paga, cliente Aderbal não vai conectar isso ao duplo débito.

5. **Beat 4 — Conciliação de cobrança duplicada:** Spec não define fluxo de reembolso automático. Status `REFUNDED` ou `PARTIALLY_REFUNDED` existem mas como ativá-los?
   - 🔧 **Funcional (P1):** gap de fluxo. Cliente precisa abrir ticket → AwSales → Stripe reembolso → UI eventualmente atualiza. Sem self-service.
   - ⚖ **Compliance (P0):** **CDC Art. 42 §único** — devolução de cobrança indevida em dobro é direito legal. Se UI dificulta, é violação.
   - 🎯 **UX (P1):** **Nielsen H9** — cliente fica perdido. Falta CTA "Solicitar reembolso" ou similar.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência |
|----|-------|-----------|------------|----------------|-----------|
| F2-2.G1 | Funcional | Botão "Tentar de novo" no kebab não está especificado na Story 3 mas é esperado no fluxo de PAYMENT_FAILED | P0 | — | Cenário 8 kebab tem só Ver detalhes/Baixar |
| F2-2.G2 | Funcional+Compliance | Sem idempotency_key + sem disable durante retry automático = double charge garantido | **P0** | PCI-DSS 6.5.5; CDC Art. 39 V, Art. 42 §único; Nielsen H5 | Beat 2 |
| F2-2.G3 | UX | Falta visibilidade do retry automático Stripe — cliente não sabe que sistema já está tentando | **P0** | Nielsen H1, H5 | Beat 1 |
| F2-2.G4 | Funcional | Catálogo de eventos do Cenário 17 não tem `fatura.cobranca_duplicada` nem `fatura.retry_concorrente_detectado` | P1 | LGPD Art. 38 | Beat 3 |
| F2-2.G5 | Compliance+UX | Sem fluxo self-service de reembolso de cobrança duplicada — cliente fica refém de ticket | P1 | CDC Art. 42 §único; Nielsen H9 | Beat 4 |
| F2-2.G6 | Funcional | Status `PARTIALLY_REFUNDED` listado em Cenário 8.1 mas sem trigger UI documentado | P2 | — | Cenário 8.1 |

**Status:** ❌ **Quebrou.** Duplo débito em cliente já past_due cria reclamação Procon imediata + risco de devolução em dobro. Gap de spec + gap de idempotência.

---

### F2-3: Voucher consumido cobre parte da fatura mas tela diz "PAYMENT_FAILED"

**Seed original:** Aderbal tem voucher ACTIVE com saldo R$ 200. Fatura de custos variáveis sai R$ 500. Voucher debita R$ 200 (DEPLETED), restam R$ 300 a pagar. Stripe envia 2 webhooks: `voucher.consumed` E `invoice.payment_failed`. UI mostra "PAYMENT_FAILED". Aderbal acha que voucher não foi usado.

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Voucher Q2 com R$ 200 saldo ACTIVE. Fatura de variáveis fecha R$ 500. Em past_due crônico, cartão recusa o restante R$ 300.
   - 🔧 Funcional: Stripe billing credit grant + payment_intent failed = estados parcialmente concluídos.
   - ⚖ Compliance: cliente tem direito de saber que voucher foi consumido mesmo com falha parcial.
   - 🎯 UX: mental model: "voucher cobre fatura inteira" é o default mas falso aqui.

2. **Beat 1 — Webhook `voucher.consumed` R$ 200:** chega primeiro. Backend debita voucher → DEPLETED. UI atualiza Saldo de Créditos card "Total economizado" +R$ 200.
   - 🔧 Funcional (P1): ordem de webhooks não é garantida no Stripe. Backend deve ser idempotente e processar fora de ordem.
   - ⚖ Compliance: ok aqui.
   - 🎯 UX (P1): card "Total economizado" subiu mas cliente está olhando Visão Geral, não Saldo de Créditos. Não percebe.

3. **Beat 2 — Webhook `invoice.payment_failed` R$ 300:** chega 30s depois. Fatura assume status `PAYMENT_FAILED` no Stripe.
   - 🔧 **Funcional (P0):** **lossy state mapping.** Stripe `payment_failed` em fatura parcialmente coberta por crédito ≠ Stripe `payment_failed` em fatura sem desconto. Cenário 8.1 não tem status "PARTIALLY_PAID_WITH_CREDIT_AWAITING_REMAINDER" ou similar. UI vai exibir só `PAYMENT_FAILED` vermelho.
   - ⚖ **Compliance (P0):** **CDC Art. 6º III** — cliente precisa saber EXATAMENTE o estado: "R$ 200 cobertos com voucher Crédito Q2, restam R$ 300 a pagar". Mostrar só `PAYMENT_FAILED` esconde o crédito aplicado.
   - 🎯 **UX (P0):** **Nielsen H1, H2** — Aderbal pensa "voucher não foi usado, vou ter que pagar R$ 500" quando na verdade são R$ 300. Pode pagar 2x ou contestar voucher.

4. **Beat 3 — Modal "Ver detalhes da fatura":** Aqui SIM, W4 mostra line items + cupom/voucher na linha de descontos. Mas Aderbal precisa clicar e chegar até lá.
   - 🔧 Funcional: modal funciona — desde que webhook de voucher tenha sido processado E linkado à fatura corretamente.
   - ⚖ Compliance (P1): info correta existe mas escondida em 2º clique. CDC Art. 6º III pede visibilidade *primária*.
   - 🎯 UX (P1): **Nielsen H1** — fatura na lista mostra "R$ 500,00 · ● PAYMENT_FAILED" mesmo após voucher debitar. Coluna "Cupom/Voucher aplicado" existe (Cenário 8) mas ela mostra cupom apenas? Voucher também aparece?

5. **Beat 4 — Coluna "Cupom/Voucher aplicado" na lista de faturas:** Spec Cenário 8 nomeia "Cupom/Voucher aplicado". W1 mostra "BF2025 -20%" para cupom. Como exibe voucher consumido parcialmente? "Voucher Q2 -R$ 200"? E o valor exibido na coluna "Valor cobrado": é R$ 500 (bruto) ou R$ 300 (líquido)?
   - 🔧 **Funcional (P0):** ambiguidade de spec. Valor cobrado bruto vs líquido não está definido. Pode levar a discrepância entre soma de Histórico de Faturas e Histórico de Faturas Pagas no relatório fiscal.
   - ⚖ **Compliance (P0):** **CDC Art. 6º III + Art. 31** — valores fiscais ambíguos. **NF-e (legislação fiscal)** se NF for emitida pelo bruto e voucher for "cortesia/desconto", precisa estar correto.
   - 🎯 **UX (P1):** soma da coluna não bate com soma agregada. **Cenário 5.1 DoD**: "Soma da coluna Total = valor do card Gastos variáveis utilizados" — mas se card é bruto e tabela mostra líquido (ou vice-versa), DoD falha.

6. **Beat 5 — Status badge novo necessário:** Stripe `payment_failed` num cenário parcial deveria virar UI `PAGAMENTO_PARCIAL` (cor laranja) com tooltip "R$ 200 cobertos com voucher, R$ 300 pendentes".
   - 🔧 Funcional (P1): backend precisa derivar status compostos a partir de Stripe + estado interno de voucher.
   - ⚖ Compliance (P1): cobre CDC Art. 6º III.
   - 🎯 UX (P1): novo estado precisa entrar no design system + spec do W1.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência |
|----|-------|-----------|------------|----------------|-----------|
| F2-3.G1 | Funcional+Compliance | Cenário 8.1 não tem status pra "fatura parcialmente coberta por voucher + restante falhado" | **P0** | CDC Art. 6º III; Nielsen H1, H2 | Beat 3 |
| F2-3.G2 | Funcional | Spec ambígua: coluna "Valor cobrado" mostra bruto ou líquido após voucher? | **P0** | CDC Art. 6º III; legislação fiscal NF-e | Beat 4 |
| F2-3.G3 | UX | "Cupom/Voucher aplicado" no W1 só mostra cupom — voucher consumido parcial precisa ser explícito | P1 | Nielsen H1 | W1 linha 111 |
| F2-3.G4 | Funcional | Ordem de webhooks Stripe não garantida — falta nota sobre idempotência no spec | P1 | — | Beat 2 |
| F2-3.G5 | UX | Não há novo status visual pra "PAGAMENTO_PARCIAL" — 14º status necessário no badge map | P1 | Nielsen H1, H2 | Beat 5 |

**Status:** ❌ **Quebrou.** Customer crucial scenario (voucher + past_due) cai no edge. Risco de cobrança duplicada via cliente que paga R$ 500 achando que voucher não foi usado.

---

### F2-4: Régua D+3 suspende org no meio do export CSV de audit trail

**Seed original:** Aderbal está exportando CSV do audit trail (47k eventos, async). Régua D+3 dispara e suspende org. Tela de export retorna 403 quando Aderbal volta. Lentes: F (download persistido cross-suspension), ⚖ LGPD Art. 18 II, U (mensagem de erro).

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Aderbal tá tentando montar prova pra contestar a suspensão. Pede export do audit trail dos últimos 90 dias = 47k eventos. Modal LGPD W8 aceito. Job assíncrono dispara. Esperado: e-mail com link em ~3 min.
   - 🔧 Funcional: async job em fila.
   - ⚖ Compliance: LGPD Art. 18 II — direito de acesso aos dados pessoais.
   - 🎯 UX: cliente aguarda e-mail/notificação.

2. **Beat 1 — Job inicia, status "Gerando export…":** Story 2 S4 (reusado) gera CSV + hash SHA-256 + meta-audit. Cenário Q5 bloqueia export >100k linhas mas 47k passa.
   - 🔧 Funcional: ok.
   - ⚖ Compliance: ok aqui — Modal LGPD W8 já registrou consentimento.
   - 🎯 UX: feedback de progresso necessário (spec não detalha — Nielsen H1).

3. **Beat 2 — Régua D+3 dispara enquanto job roda:** Evento `org.suspensa_inadimplencia` no audit trail. Backend muda flag `org.status = SUSPENDED`. Middleware bloqueia novas requests.
   - 🔧 **Funcional (P0):** **race condition entre job assíncrono e suspensão.** Job pode: (a) terminar com sucesso e gerar CSV mas cliente não consegue baixar (403 no link), (b) ser killed na metade gerando CSV truncado, (c) terminar mas e-mail com link não é enviado pois SMTP foi bloqueado pra org suspensa.
   - ⚖ **Compliance (P0):** **LGPD Art. 18 II** — direito de acesso ao dado é INCONDICIONAL. Não pode ser suspenso por inadimplência. **LGPD Art. 18 §3º** — titular pode requisitar a qualquer momento. Pior: o dado que cliente quer é justamente sobre as cobranças que justificam a suspensão (auto-prova).
   - 🎯 **UX (P0):** **Nielsen H9 (recuperação de erros)** — quando volta e clica no link, 403 sem mensagem útil. Cliente fica órfão de informação no momento crítico.

4. **Beat 3 — Aderbal volta na próxima manhã, faz login:** Login bem-sucedido (acesso a leitura é permitido mesmo suspenso? Spec não define). Tela exibe banner "Organização suspensa por inadimplência. Regularize pra acessar funcionalidades."
   - 🔧 **Funcional (P1):** spec da régua/suspensão não define escopo do que fica acessível. Logout? Read-only Financeiro? Acesso só ao módulo de pagamento?
   - ⚖ **Compliance (P0):** **LGPD Art. 18 II + Art. 19** — direito de acesso e portabilidade. Suspensão de serviço pago ≠ suspensão de direitos LGPD. Aderbal DEVE conseguir baixar dados próprios.
   - 🎯 **UX (P1):** **Nielsen H9 + H10** — mensagem de banner não orienta como acessar export já solicitado.

5. **Beat 4 — Aderbal vai ao Audit Trail:** Tela retorna 403 ou redireciona pra tela de pagamento. Não vê o job de export.
   - 🔧 **Funcional (P0):** sem queue de jobs persistente cross-status. Sem tela "Exports pendentes" onde cliente reentra mesmo suspenso.
   - ⚖ **Compliance (P0):** **LGPD Art. 18 II** + **Marco Civil Internet Art. 13** (logs preservados 6 meses, cliente tem direito de pedir).
   - 🎯 **UX (P0):** **Nielsen H1, H9** — invisibilidade total do estado do job. Cliente acha que "tudo se perdeu".

6. **Beat 5 — Sem fluxo de "Solicitar dados via DPO":** LGPD Art. 18 §1º permite que titular peça via DPO. Story 3 + Story 2 não incluem contato direto com DPO/encarregado AwSales. Só Gerente da Conta (comercial).
   - 🔧 Funcional (P1): falta link "Falar com nosso Encarregado de Dados".
   - ⚖ Compliance (P0): **LGPD Art. 41** — controlador deve indicar Encarregado de Dados publicamente.
   - 🎯 UX (P1): Aderbal não sabe nem que existe DPO.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência |
|----|-------|-----------|------------|----------------|-----------|
| F2-4.G1 | Funcional | Race condition entre job assíncrono e suspensão da org — sem persistência cross-status | **P0** | — | Beat 2 |
| F2-4.G2 | Compliance | Suspensão bloqueia acesso a export de dados pessoais → viola direito de acesso | **P0** | LGPD Art. 18 II, §3º; Art. 19; Marco Civil Art. 13 | Beat 3, 4 |
| F2-4.G3 | UX | 403 sem mensagem útil ou orientação de como recuperar export pendente | P1 | Nielsen H9, H10 | Beat 3, 4 |
| F2-4.G4 | Funcional | Sem tela/seção "Exports pendentes" acessível mesmo em org suspensa | P1 | LGPD Art. 18 II | Beat 4 |
| F2-4.G5 | Compliance | Story não indica como cliente acessa o Encarregado de Dados (DPO) | P1 | LGPD Art. 41 | Beat 5 |
| F2-4.G6 | Funcional | Spec da suspensão não define escopo de leitura permitida (read-only Financeiro? logout?) | P1 | — | Beat 3 |

**Status:** ❌ **Quebrou.** Violação LGPD Art. 18 II é o gap mais sério de compliance. Cliente em past_due tem direito incondicional aos próprios dados — não pode ser revogado por inadimplência. Risco de ANPD se DPO de cliente enterprise formalizar.

---

### F2-5: Aderbal solicita cancelamento estando em PAST_DUE

**Seed original:** Aderbal clica em "Solicitar cancelamento". Modal informativo com contato Bruno. Mas está há 30 dias past_due — cancelar agora é resolução, não escalation. Sistema deveria sugerir "Resolver pendência → Negociar com gerente → Cancelamento se necessário". Lentes: U (H10), ⚖ CDC Art. 6º III.

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Aderbal frustrado, 30 dias past_due, suspensão iminente. Pensa "vou cancelar agora pra não acumular dívida". Abre Modal Detalhes do Plano → clica "(Solicitar cancelamento)".
   - 🔧 Funcional: ação client-side abre modal informativo.
   - ⚖ Compliance: CDC Art. 6º III — cliente tem direito a informação adequada para tomar a decisão melhor pra ele.
   - 🎯 UX: estado emocional do cliente é negativo — UI deveria reduzir atrito mas também orientar.

2. **Beat 1 — Modal "Solicitar cancelamento" aparece:** W2 mostra placeholder com contato Bruno Costa. Sem diferenciação para estado past_due.
   - 🔧 **Funcional (P1):** modal não é contextual ao estado da subscription. Em ACTIVE deveria mostrar "Confirme se realmente quer cancelar"; em PAST_DUE deveria mostrar "Você está em pendência — cancelar agora pode gerar multa de fidelidade + saldo devedor".
   - ⚖ **Compliance (P0):** **CDC Art. 6º III** — informação adequada. Cliente em past_due que cancela sem entender consequências (multa de fidelidade 50% sobre 8 meses = R$ 18.000 + saldo devedor) tem direito de saber ANTES. **CDC Art. 39 V** (publicidade enganosa por omissão).
   - 🎯 **UX (P0):** **Nielsen H10 (help & docs contextual)** — sistema deveria orientar caminho de menor regret. **Nielsen H5 (prevenção de erros)** — cancelar em past_due é decisão de alto impacto.

3. **Beat 2 — Modal mostra apenas Bruno Costa (Gerente da Conta):** Spec MVP é readonly + contato. Sem alternativa.
   - 🔧 Funcional: ok do ponto de vista MVP (AC2: cancelamento self-service fora de escopo).
   - ⚖ **Compliance (P1):** **CDC Art. 6º III + Art. 6º IV** (proteção contra práticas abusivas) — Bruno é comercial, conflito de interesse com cancelamento. Cliente em dispute tem direito a canal independente (Ouvidoria, DPO).
   - 🎯 **UX (P1):** **Nielsen H10** — falta info "Se preferir, fale com Ouvidoria ou Encarregado de Dados". **Nielsen H7 (flexibilidade)** — power user precisa de mais opções.

4. **Beat 3 — Não há sugestão de "Negociar pendência":** Aderbal pode preferir renegociar (parcelar, descontar multa) em vez de cancelar. Spec não tem essa CTA.
   - 🔧 Funcional (P1): missing path. Sistema podia oferecer "Resolver pendência primeiro" como caminho default + "Cancelar mesmo assim" como opção secundária.
   - ⚖ Compliance (P1): **CDC Art. 6º III** — informação sobre opções.
   - 🎯 UX (P1): **Nielsen H10 (help contextual)** — fluxo guiado faltando.

5. **Beat 4 — Audit Trail registra apenas "(placeholder informativo aberto)":** Evento `plano.cancelamento_solicitado_via_ui` não está no Cenário 17.
   - 🔧 **Funcional (P2):** missing event. Sem rastreio de cliques nesses placeholders, AwSales perde sinal de demanda pra cancelamento self-service (Métrica Secundária da Story 3 fala em "Taxa de cliques em Solicitar alteração" mas sem evento canônico definido).
   - ⚖ Compliance (P2): ok.
   - 🎯 UX: ok do ponto de vista usuário, mas perde-se telemetria.

6. **Beat 5 — Aderbal sai frustrado:** Sem caminho concreto, sem CTA acionável. Vai pra reclamação no Reclame Aqui ou abre ticket no Procon.
   - 🔧 Funcional: comportamento esperado mas indesejável.
   - ⚖ **Compliance (P1):** **CDC Art. 6º III + IV** — cliente sem caminho concreto pra exercer direito de cancelamento (mesmo placeholder) é fricção desnecessária.
   - 🎯 **UX (P0):** **Nielsen H9** — recuperação de erros zero. **Nielsen H7** — flexibilidade zero.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência |
|----|-------|-----------|------------|----------------|-----------|
| F2-5.G1 | Compliance+UX | Modal de cancelamento não muda copy/UX em PAST_DUE — não alerta sobre multa de fidelidade ou saldo devedor | **P0** | CDC Art. 6º III, Art. 39 V; Nielsen H5, H10 | Beat 1, 2 |
| F2-5.G2 | Compliance | Único contato é Gerente da Conta (comercial) — falta canal independente (Ouvidoria/DPO) | P1 | CDC Art. 6º III, Art. 6º IV; LGPD Art. 41 | Beat 2 |
| F2-5.G3 | UX | Falta CTA "Renegociar pendência" como alternativa intermediária entre status quo e cancelamento | P1 | Nielsen H10, H7 | Beat 3 |
| F2-5.G4 | Funcional | Evento `plano.cancelamento_solicitado_via_ui` não está no catálogo do Cenário 17 — perde telemetria | P2 | — | Beat 4 |
| F2-5.G5 | UX | Sem caminho concreto após placeholder → frustração → ticket externo | P2 | Nielsen H9, H7 | Beat 5 |

**Status:** ⚠ **Passou com dor.** O MVP placeholder é aceitável (AC2 fora de escopo), mas precisa de contextualização ao estado da subscription para evitar dano ao cliente em past_due. CDC Art. 6º III está sob risco se cliente cancelar sem ser alertado das consequências financeiras.

---

## Recomendações de hardening (priorização)

**P0 imediatos (blockers de release):**
1. **F2-1.G1** — Card de Plano renderizar variant `● Past_due` (vermelho) quando subscription.status = PAST_DUE. Modal e card precisam ser consistentes.
2. **F2-2.G2** — Implementar idempotency_key + disable de retry manual durante retry automático Stripe ativo. Adicionar tooltip "Próxima tentativa: <data>".
3. **F2-3.G1, G2** — Definir status `PAGAMENTO_PARCIAL` (14º estado) + decidir bruto vs líquido na coluna "Valor cobrado" (recomendado: bruto + linha de desconto explícita).
4. **F2-4.G1, G2** — Job assíncrono de export deve persistir cross-suspensão. Tela "Exports pendentes" acessível em org suspensa (LGPD Art. 18 II não admite exceção por inadimplência).
5. **F2-5.G1** — Modal de cancelamento contextual: variant PAST_DUE com aviso de multa + saldo devedor + sugestão de renegociar primeiro.

**P1 próximo sprint:**
- F2-1.G3 (countdown de suspensão), F2-1.G4 (faturas múltiplas), F2-2.G4 (eventos de duplicação), F2-2.G5 (self-service refund), F2-4.G3-G6 (UX de suspensão + DPO), F2-5.G2-G3 (canais alternativos).

**P2 backlog:**
- F2-1.G6, F2-2.G6, F2-5.G4-G5.

## Anti-claims observados (fora do escopo confirmado)

- **AC1, AC2** — mudança/cancelamento self-service: confirmado fora do MVP, mas o placeholder precisa ser contextualizado pra evitar dano (F2-5).
- **AC6** — customização do limite variável pelo cliente: não testado neste perfil.
- Demais anti-claims não impactaram este perfil.
