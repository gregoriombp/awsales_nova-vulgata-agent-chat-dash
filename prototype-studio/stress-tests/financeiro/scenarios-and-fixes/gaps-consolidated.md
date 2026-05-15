# Stress Test Financeiro — Gaps Consolidados (lente tripla)

**Data:** 2026-05-11
**SUT:** Story 3 Financeiro (stories/financeiro.md + archive/wireframes-ascii/financeiro.md + prototypes/financeiro.html)
**Cobertura:** 6 perfis × 5 cenários × 3 lentes adversariais (🔧 Funcional · ⚖️ Compliance · 🎯 UX) = 30 cenários, 90 walkthroughs adversariais
**Objetivo:** consolidar 154 gaps brutos em clusters de root cause + macro-tensões estruturais + verdict por perfil + top 15 críticos.

---

## 1. Sumário agregado

### Total de gaps brutos

| Perfil | Cenário | Gaps |
|---|---|---|
| F1 — SaaS médio (Fyntra) | 5 | **22** (P0: 6 · P1: 11 · P2: 5) |
| F2 — Past_due crônico (Casa Bahia filial) | 5 | **22** (P0: 9 · P1: 9 · P2: 4) |
| F3 — Fintech BACEN (NeoBank) | 5 | **27** (P0: 11 · P1: 12 · P2: 4) |
| F4 — Founder solo (CodeRabbit Schools) | 5 | **30** (P0: 9 · P1: 16 · P2-3: 10) |
| F5 — Holding multi-org (Vitru) | 5 | **22** (P0: 10 · P1: 9 · P2: 3) |
| F6 — High-volume (TransExpress) | 5 | **31** (P0: 11 · P1: 17 · P2: 3) |
| **Total** | **30** | **154 gaps** |

### Por severidade

| Severidade | Count | % |
|---|---|---|
| **P0 (blocker / risco legal direto / dano financeiro)** | **56** | 36% |
| **P1 (fricção alta / regressão de produtividade)** | **74** | 48% |
| **P2-P3 (refinamento / nice-to-have)** | **24** | 16% |

### Por lente (overlap permitido — vários gaps cruzam 2-3 lentes)

| Lente | Count |
|---|---|
| 🔧 Funcional | **58** |
| ⚖️ Compliance | **51** |
| 🎯 UX/Acessibilidade | **54** |

### Adversarialidade (% por perfil)

| Status | F1 | F2 | F3 | F4 | F5 | F6 | Total |
|---|---|---|---|---|---|---|---|
| ✅ Passou limpo | 0 | 0 | 0 | 0 | 0 | 0 | **0/30 (0%)** |
| ⚠️ Passou com dor | 1 | 1 | 1 | 0 | 0 | 0 | **3/30 (10%)** |
| ❌ Quebrou | 4 | 4 | 4 | 5 | 5 | 5 | **27/30 (90%)** |

> **Sinal forte:** zero passes limpos em 30 cenários adversariais. 90% break rate indica que a Story 3 no estado atual tem fragilidades estruturais, não edge cases isolados.

---

## 2. Clusterização por root cause

> **Princípio:** gap em 1 cenário é edge case. Em 3+ cenários é problema estrutural que merece fix arquitetural. Cada cluster lista quantos gaps + quantos perfis afetados.

### RC1 — Transparência CDC Art. 6º III sistematicamente subdesenhada
**Lente predominante:** ⚖️ Compliance + 🎯 UX (múltipla)
**Lei/Heurística:** CDC Art. 6º III (informação clara, adequada, ostensiva), Art. 31 (oferta vinculante), Nielsen H1, H2
**Gaps no cluster:** G-F1-1.5, G-F1-2.5, G-F1-3.2, F2-1.G1, F2-1.G4, F2-3.G1, F2-5.G1, F3-2.G1, F3-2.G2, F4-1-G2, F4-2-G2, F4-3-G2, F4-5-G3, F5-1-D, F5-3-C, F5-5-A, F6-1.G4, F6-2.G5, F6-5.G2
**Severidade agregada:** **P0 estrutural** (10+ gaps P0 no cluster)
**Cobertura:** 19 gaps · 6/6 perfis afetados
**Padrão:** card primário esconde detalhe crítico (status, breakdown fixo+variável, magnitude, escopo, prazo) — informação correta existe em modal 2º clique mas não no primeiro nível. CDC exige clareza no primeiro nível, não em drill-down.

### RC2 — PII Filtering com catálogo incompleto (executor.nome esquecido)
**Lente predominante:** ⚖️ Compliance
**Lei/Heurística:** LGPD Art. 6º II (finalidade), Art. 13 (pseudonimização), Art. 46 (segurança), BACEN Circular 4.893 §6º (segregação de funções)
**Gaps no cluster:** F3-1.G1, F3-1.G2, F3-5.G1, F3-5.G2, F3-5.G3, F3-5.G4, F3-5.G5, F3-5.G6, F3-5.G8, F4-4-G5
**Severidade agregada:** **P0 estrutural** (5+ gaps P0 — gera achado em auditoria BACEN)
**Cobertura:** 10 gaps · 2 perfis (F3 + F4) mas mata o deal F3
**Padrão:** Cenário 20 (Story 3) lista PII filter apenas pra `email_invoice_adicional` + `IP audit` + EXCEÇÃO PCI cartão. Esquece campo `executor.nome` do audit trail. Auditor BACEN (CISO Read-Only) vê nomes completos de operadores. Pior cenário: cliente USA o produto e PIORA sua posição regulatória.

### RC3 — Idempotência de pagamento Stripe ausente (double charge sistemático)
**Lente predominante:** 🔧 Funcional + ⚖️ Compliance (múltipla)
**Lei/Heurística:** PCI-DSS 6.5.5 (improper error handling), CDC Art. 42 §único (devolução em dobro), CDC Art. 39 V (cobrança abusiva), Nielsen H5 (prevenção de erros)
**Gaps no cluster:** F2-2.G2, F2-2.G3, F2-2.G5, F2-2.G6, F4-2-G1, F4-2-G2, F4-2-G3, F4-2-G4, F4-2-G5, F4-2-G6, F4-2-G7, F4-2-G8
**Severidade agregada:** **P0 estrutural** (6 gaps P0)
**Cobertura:** 12 gaps · 2 perfis (F2 past_due + F4 founder solo)
**Padrão:** botão "Tentar de novo" / "Pagar com cartão" não disabled durante PIX PENDING ou retry automático Stripe. Sem idempotency_key, sem optimistic lock. Resultado: 2 charges simultâneos → CDC obriga devolução em dobro. Taxonomia de 13 status não cobre "duplicado · a estornar".

### RC4 — Placeholders informativos confundidos com botões funcionais
**Lente predominante:** 🎯 UX + ⚖️ Compliance
**Lei/Heurística:** Nielsen H1 (visibilidade do estado), H2 (mental model), CDC Art. 39 V, Art. 49 (direito de arrependimento), Art. 51 IV (cláusula abusiva — desproporção entre contratação self-service e cancelamento manual)
**Gaps no cluster:** G-F1-5.1, G-F1-5.2, G-F1-5.3, G-F1-5.4, G-F1-5.7, F2-5.G1, F2-5.G3, F4-5-G1, F4-5-G2, F4-5-G3, F4-5-G4, F4-5-G6, F5-5-E
**Severidade agregada:** **P0 estrutural** (5 gaps P0)
**Cobertura:** 13 gaps · 4 perfis (F1, F2, F4, F5)
**Padrão:** botões `(Solicitar alteração)` e `(Solicitar cancelamento)` parecem botões mas são placeholders. Modal pós-clique não diz "pedido NÃO foi enviado, faça X". Em past_due + founder solo, cliente acha que cancelou e vem cobrança seguinte = cobrança abusiva CDC.

### RC5 — Estado de UI perdido em navegação (filtros, toggle, scroll)
**Lente predominante:** 🎯 UX
**Lei/Heurística:** Nielsen H3 (user control & freedom), H7 (flexibilidade & eficiência), CDC Art. 6º III (borderline)
**Gaps no cluster:** G-F1-1.1, G-F1-1.2, G-F1-1.3, G-F1-1.4, G-F1-2.1, G-F1-2.2
**Severidade agregada:** P0/P1 (2 P0)
**Cobertura:** 6 gaps · 1 perfil principal (F1) mas comportamento sistêmico
**Padrão:** sair de Visão Geral pra Métodos de Pagamento e voltar perde 5 estados (filtro de período, toggle Por serviço/campanha, busca, ordenação, scroll). Power user paga preço de produtividade. F1.7 declara simultaneidade <500ms mas falha em refetch.

### RC6 — Mental model "preço único" vs "fixo + variável"
**Lente predominante:** 🎯 UX + ⚖️ Compliance
**Lei/Heurística:** Nielsen H2 (match mental model), CDC Art. 6º III, Art. 31 (oferta vinculante)
**Gaps no cluster:** F4-1-G1, F4-1-G2, F4-1-G3, F4-1-G4, F4-1-G5, F4-3-G1, F4-3-G3, F6-5.G1, F6-5.G3, F6-5.G4, F6-5.G5, F6-5.G6
**Severidade agregada:** **P0 estrutural** (3 gaps P0)
**Cobertura:** 12 gaps · 2 perfis (F4 founder solo low volume + F6 enterprise high volume — extremos opostos)
**Padrão:** card "Próxima cobrança" mostra só plano fixo. SMB sem uso pensa que paga caro sem usar; enterprise alto volume vê R$ 7k mas paga R$ 507k. Falta breakdown "Plano fixo + Variável (estimado)". Ambos perfis confundem-se com ausência de forecast/transparência.

### RC7 — Status badge não escala com magnitude / vocabulário ENUM Stripe vazando
**Lente predominante:** 🎯 UX
**Lei/Heurística:** Nielsen H1 (visibilidade), H2 (mental model), H4 (consistência), CDC Art. 6º III
**Gaps no cluster:** F2-1.G1, F2-1.G2, F2-1.G3, F2-3.G1, F2-3.G3, F2-3.G5, F3-2.G5, F4-1-G1, F4-2-G9, F4-4-G1, F4-4-G2, F4-4-G3, F4-4-G4, F6-2.G1, F6-2.G2, F6-2.G3
**Severidade agregada:** **P0 estrutural** (4 gaps P0)
**Cobertura:** 16 gaps · 5 perfis
**Padrão:** (a) status técnico do Stripe vaza pra UI ("PAYMENT_FAILED", "CHARGEBACK_RESOLVED", "PENDING", "OPEN" em vez de PT-BR coloquial), (b) badge amarelo de R$ 100 e R$ 500k têm o mesmo peso visual, (c) PAST_DUE de 30 dias mostra "● Ativo" no card primário (mismatch card vs modal), (d) catálogo de 13 status não tem "PAGAMENTO_PARCIAL" nem "DUPLICADO_A_ESTORNAR".

### RC8 — Audit trail não escala em volume enterprise (50k+ eventos)
**Lente predominante:** 🔧 Funcional + ⚖️ Compliance
**Lei/Heurística:** LGPD Art. 18 II (direito de acesso), Art. 18 §3º (prazo razoável), Marco Civil Art. 13, Nielsen H1, H7
**Gaps no cluster:** F2-4.G1, F2-4.G4, F6-4.G1, F6-4.G2, F6-4.G3, F6-4.G4, F6-4.G5, F6-4.G6, F6-4.G7, F6-4.G8
**Severidade agregada:** **P0 estrutural** (4 gaps P0)
**Cobertura:** 10 gaps · 2 perfis (F2 race condition + F6 volume)
**Padrão:** scroll infinito sem virtual scroll, sem paginação numérica, sem jump-to-date, export CSV de 50k linhas sync → timeout. Pior: race condition com régua D+3 mata job assíncrono de export em org suspensa, violando LGPD Art. 18 II (direito incondicional ao próprio dado).

### RC9 — Multi-org / Holding sem visão consolidada cross-org
**Lente predominante:** 🔧 Funcional + ⚖️ Compliance + 🎯 UX (múltipla)
**Lei/Heurística:** LGPD Art. 18 II + V (direito de acesso + portabilidade), CDC Art. 30 (oferta vincula), CDC Art. 51 IV (cláusula abusiva — multa sem fórmula), Nielsen Jakob's Law
**Gaps no cluster:** F5-1-A, F5-1-B, F5-1-C, F5-1-D, F5-2-A, F5-2-B, F5-2-D, F5-2-E, F5-3-A, F5-3-B, F5-3-C, F5-3-D, F5-3-E, F5-4-A, F5-4-B, F5-4-C, F5-4-D, F5-4-F, F5-5-A, F5-5-B, F5-5-C, F5-5-D, F5-5-F
**Severidade agregada:** **P0 estrutural** (10 gaps P0)
**Cobertura:** 23 gaps · 1 perfil mas representa ICP enterprise
**Padrão:** Story 3 trata multi-org como caso de borda quando é caso típico em enterprise. Voucher emitido pra "Holding" vincula 1 customer Stripe (org única) → oferta comercial holding-level vs execução org-level = CDC Art. 30. Card "Total economizado · lifetime" sem qualificar escopo. Modal LGPD W8 sem info de escopo. Multa de fidelidade 50% sem fórmula visível (cláusula abusiva CDC Art. 51 IV).

### RC10 — Voucher / Cupom — fluxo lossy e cross-org indefinido
**Lente predominante:** 🔧 Funcional + 🎯 UX
**Lei/Heurística:** CDC Art. 6º III, Nielsen H9 (recuperação de erros), H10 (help)
**Gaps no cluster:** G-F1-3.1, G-F1-3.2, G-F1-3.3, G-F1-3.4, G-F1-3.5, G-F1-3.6, F2-3.G2, F2-3.G4, F2-3.G5, F4-3-G4, F4-3-G5, F5-2-C, F6-3.G3, F6-3.G4, F6-3.G5, F6-3.G6
**Severidade agregada:** P0/P1 (4 P0)
**Cobertura:** 16 gaps · 5 perfis
**Padrão:** (a) mensagem genérica "lista de 4 motivos com ou entre eles" viola Nielsen H9 + CDC, (b) tabela de cupons não separa "aplicáveis" de "consumidos", (c) coluna "Valor cobrado" bruto vs líquido após voucher é ambígua, (d) ordem de webhooks Stripe não-idempotente, (e) voucher emitido sem NF de antecipação (mata deal F3 fintech), (f) voucher DEPLETED em <72h sem alerta proativo.

### RC11 — Dispute/Chargeback sem timeline visível
**Lente predominante:** ⚖️ Compliance + 🔧 Funcional
**Lei/Heurística:** CDC Art. 6º III, Art. 42 §único (cobrança indevida), BACEN Circular 4.893 (rastreabilidade contábil), LGPD Art. 18 II
**Gaps no cluster:** F3-2.G1, F3-2.G2, F3-2.G3, F3-2.G4, F3-2.G6
**Severidade agregada:** **P0** (4 P0)
**Cobertura:** 5 gaps · 1 perfil mas crítico (fintech regulada)
**Padrão:** Modal W4 "Ver detalhes da fatura" mostra line items + total + hash. NÃO tem timeline de eventos do dispute (abertura → evidência → resolução). Catálogo Cenário 17 só tem `fatura.contestada` + `fatura.chargeback` — faltam `chargeback_resolvido`, `evidencia_submetida`, `disputa_aceita`. Fechamento contábil BACEN não roda.

### RC12 — DSR (Direito ao apagamento) sem fluxo end-to-end
**Lente predominante:** ⚖️ Compliance
**Lei/Heurística:** LGPD Art. 13 (pseudonimização), Art. 16 (retenção legal), Art. 18 VI (apagamento), Art. 38 (relatório de impacto), Art. 41 (DPO), Art. 48 (incidente)
**Gaps no cluster:** G-F1-4.1, G-F1-4.2, G-F1-4.3, G-F1-4.4, G-F1-4.5, G-F1-4.6, G-F1-4.7, F2-4.G5
**Severidade agregada:** **P0** (3 P0)
**Cobertura:** 8 gaps · 2 perfis
**Padrão:** Audit trail NÃO aplica anonimização retroativa após DSR — exporta PII de users apagados (Maria demitida 15/05). Conflito hash SHA-256 imutável vs anonimização retroativa não resolvido. Catálogo de eventos não tem `audit_trail.dsr_anonimizacao_aplicada`. Story não indica contato com DPO/Encarregado.

### RC13 — Notificações proativas inexistentes (silent failures em alto valor)
**Lente predominante:** 🔧 Funcional + 🎯 UX
**Lei/Heurística:** CDC Art. 6º III, Nielsen H1
**Gaps no cluster:** F6-2.G4, F6-3.G1, F6-3.G2, F6-3.G3, F4-2-G5
**Severidade agregada:** **P0** (4 P0)
**Cobertura:** 5 gaps · 2 perfis (F4 + F6 — extremos opostos de volume)
**Padrão:** Story 3 trata audit trail como log passivo, não como trigger de notificação. Fatura R$ 500k vincenda em 5 dias = sem aviso. Voucher R$ 50k DEPLETED em 60h = cliente descobre 3 dias depois. Sem matriz de eventos→canais→thresholds (e-mail, push, in-app banner).

### RC14 — Integração fiscal (NF-e) ausente — mata procurement BACEN
**Lente predominante:** ⚖️ Compliance
**Lei/Heurística:** BACEN Circular 4.893, Lei 8.846/94 (NF eletrônica), Decreto 7.962/13 (e-commerce/serviços online), AC7
**Gaps no cluster:** F3-3.G1, F3-3.G2, F3-3.G3, F3-3.G4, F3-3.G5
**Severidade agregada:** **P0** (2 P0 "fora do MVP mas mata deal F3")
**Cobertura:** 5 gaps · 1 perfil mas mata vertical fintech/regulado
**Padrão:** Voucher emitido R$ 100k não gera NF de antecipação. Cada consumo `voucher.consumido` não emite NF/recibo automático. Export CSV sem campo "NF associada". Sem config "Emissão de NF automática". AC7 ("Match PO ↔ NF fora do MVP") é P0 real pra perfil regulado.

### RC15 — SIEM/API/Schema canônico inexistentes — bloqueia fintech BACEN
**Lente predominante:** 🔧 Funcional + ⚖️ Compliance
**Lei/Heurística:** BACEN Circular 4.893 §10 (resposta a incidentes em tempo hábil), ISO 27001, LGPD Art. 38 (integridade probatória), AC3
**Gaps no cluster:** F3-4.G1, F3-4.G2, F3-4.G3, F3-4.G4, F3-4.G5, F3-4.G6
**Severidade agregada:** **P0** (4 P0 "fora do MVP mas mata deal F3")
**Cobertura:** 6 gaps · 1 perfil
**Padrão:** SIEM streaming inexistente (AC3). CSV proprietário (sem CEF/LEEF/JSON Lines). Schema canônico não documentado. Sem API REST pública. Hash SHA-256 sem assinatura digital AwSales (sem cert chain). InfoSec NeoBank veta produto.

---

## 3. Macro-tensões estruturais

> Síntese dos 15 clusters em 4 tensões fundamentais que travam a Story 3.

### M1 — Transparência CDC vs UX scanner SMB
**Clusters englobados:** RC1 + RC4 + RC6 + RC7
**Tensão:** cliente DEVE saber EXATAMENTE quanto, quando, como vai pagar (CDC Art. 6º III) — mas a UI esconde detalhes críticos em modais de 2º clique pra parecer "limpa/scaneável". Card primário = mentira; modal = verdade. Esse trade-off favorece o operador AwSales (UI bonita) e desfavorece o cliente (info incompleta).
**Impacto:** 5/6 perfis afetados. Risco de Procon + class action via JEC. Em past_due (F2) é catastrófico — cliente vê "● Ativo" enquanto deve R$ 13.500.
**Decisão estratégica necessária:** elevar info crítica (status real PAST_DUE, breakdown fixo+variável, prazo + countdown, magnitude) ao primeiro nível visual. Modal vira drill-down, não revelação.

### M2 — Compliance LGPD/BACEN subdesenhada
**Clusters englobados:** RC2 + RC8 + RC11 + RC12 + RC14 + RC15
**Tensão:** Story 3 declarou claims compliance (C1.1 a C1.12) mas implementação tem catálogos INCOMPLETOS — Cenário 20 (PII Filtering) esqueceu `executor.nome`; Cenário 17 (eventos) esqueceu chargeback_resolvido + dsr_anonimizacao_aplicada; Cenário 19 (export) não documenta schema canônico, formato CEF/LEEF, signing, API REST.
**Impacto:** 4/6 perfis afetados. Mata deal fintech BACEN (F3). Risco de multa ANPD (R$ 50k–50M) + multa BACEN (R$ 50k–500k). Cliente USA o produto e PIORA sua posição regulatória.
**Decisão estratégica necessária:** dois caminhos — (a) Story 3 endereça apenas SMB e SaaS médio, anti-claim explícito sobre fintech/BACEN; (b) Story 4 fintech-grade com SIEM streaming, NF automática, schema canônico, API REST, PII filter completo, timeline de dispute.

### M3 — Idempotência de pagamento Stripe + ciclo de retry
**Clusters englobados:** RC3 + RC11
**Tensão:** pagamento via Stripe tem múltiplos canais async (PIX webhook 30s, retry automático Smart Dunning, cliente clica "Tentar de novo"). Sem idempotency_key + sem optimistic lock no client + sem disable durante retry pendente = race condition garantida = duplo débito = CDC Art. 42 §único obriga devolução EM DOBRO.
**Impacto:** 2 perfis diretamente (F2 + F4) mas comportamento sistêmico — qualquer cliente em PIX ou past_due está exposto. Pior cenário: pagamento em dobro de fatura R$ 500k (F6 high-volume) = R$ 1M de devolução obrigatória.
**Decisão estratégica necessária:** idempotency_key por fatura + lock client-side durante retry Stripe pendente + tooltip "Próxima tentativa: <data>" + adicionar status "DUPLICADO_A_ESTORNAR" (14º status) + fluxo self-service de reembolso.

### M4 — Multi-tenant / Multi-org / Escala enterprise
**Clusters englobados:** RC5 + RC8 + RC9 + RC13
**Tensão:** Story 3 foi desenhada single-tenant view com volumes SMB. ICP enterprise (Vitru 5 orgs + TransExpress 1M+ disparos/mês) rompe premissas: card "Total economizado · lifetime" sem escopo; voucher "pra Holding" vincula 1 org Stripe; audit trail trava em 50k+ eventos; gráfico empilhado esconde 3/4 das categorias quando uma domina; estado de UI perde-se em navegação; sem forecast/projeção; sem notificação proativa.
**Impacto:** 3/6 perfis afetados diretamente (F1, F5, F6) mas todos os clientes maiores que SMB encontram alguma destas falhas. Quebra modelo mental Stripe/AWS Org/Datadog/GCP Billing (Jakob's Law).
**Decisão estratégica necessária:** adicionar entidade "Holding/Grupo Econômico" no modelo de domínio (camada acima de org); virtual scroll + paginação numérica + export async + forecast como componentes reusáveis; layer de notificação proativa com matriz eventos→canais→thresholds.

---

## 4. Verdict por perfil

| Perfil | Status | # P0 | Veredito |
|---|---|---|---|
| **F1 — SaaS médio (Fyntra)** | ❌ Quebrou em 4/5 | 6 | **Fricção alta** — adoção viável após fixes em sincronização de filtros + mensagem específica de erro de cupom + fluxo DSR. Cliente sofisticado expõe falhas que SMB não notaria. |
| **F2 — Past_due crônico (Casa Bahia filial)** | ❌ Quebrou em 4/5 | 9 | **Fora do MVP** — cliente em past_due é cliente em crise. Card "● Ativo" enquanto PAST_DUE há 30 dias + duplo charge sem idempotência + suspensão bloqueando export LGPD Art. 18 II = risco Procon imediato. Bloqueador legal P0. |
| **F3 — Fintech BACEN (NeoBank)** | ❌ Quebrou em 4/5 | 11 | **Deal-breaker / Fora do MVP** — não passa em due diligence compliance. 4 gaps "fora do MVP mas matam o deal F3" (SIEM streaming, NF automática, PII em executor, segregação de funções). Anti-claim explícito necessário ou Story 4 fintech-grade. |
| **F4 — Founder solo (CodeRabbit Schools)** | ❌ Quebrou em 5/5 | 9 | **Fricção alta + risco legal** — duplo charge PIX (CDC Art. 42 §único devolução em dobro) + placeholder de cancelamento (CDC Art. 39 V + Art. 49 + Art. 51 IV). Em escala (centenas de SMBs) vira class action ProCon. Bloqueador legal P0. |
| **F5 — Holding multi-org (Vitru)** | ❌ Quebrou em 5/5 | 10 | **Fora do MVP** — Story 3 trata multi-org como caso de borda. Voucher holding-level vs execução org-level = CDC Art. 30. Multa sem fórmula = CDC Art. 51 IV. Decisão arquitetural P0 antes do release: adicionar entidade "Holding/Grupo Econômico". |
| **F6 — High-volume (TransExpress)** | ❌ Quebrou em 5/5 | 11 | **Fricção crítica** — "Próxima cobrança R$ 7k" enquanto cliente paga R$ 500k+ = mismatch sistema↔mundo real (Nielsen H1+H2 + CDC Art. 6º III/31). Audit trail trava em 50k+ eventos. Gráfico empilhado esconde 95% da info. Notificação proativa inexistente. |

**Síntese verdict:** 0/6 perfis aprovam Story 3 sem fixes. **2 perfis precisam ser anti-claim explícito** (F3 fintech BACEN, F5 holding) ou virar Story própria. **4 perfis viáveis após hardening** (F1, F2, F4, F6) — F2 e F4 com **bloqueio legal P0** que precisa ser fixado antes de release.

---

## 5. Top 15 gaps mais críticos (cross-cutting)

| # | Gap ID | Descrição (1 linha) | Lente | Lei/Heurística | Perfis | Fix resumido |
|---|---|---|---|---|---|---|
| 1 | F2-2.G2 + F4-2-G1/G2/G4 | Sem idempotency_key + sem disable durante retry Stripe = duplo charge → CDC devolução em dobro | 🔧⚖️🎯 | PCI-DSS 6.5.5, CDC Art. 42 §único, Nielsen H5 | F2, F4 | idempotency_key por fatura + lock client + tooltip "Próx. tentativa: <data>" |
| 2 | F2-1.G1 + F2-1.G4 | Card "● Ativo" enquanto subscription PAST_DUE há 30 dias com 3 razões agregadas em "1 fatura" | ⚖️🎯🔧 | CDC Art. 6º III + Art. 31, Nielsen H1+H2 | F2 | Card variant `● Past_due` (vermelho) + listar 3 razões individualmente |
| 3 | F3-1.G1 + F3-5.G1 (raiz comum) | PII Filtering não cobre `executor.nome` do audit trail — CISO Read-Only vê nomes completos = achado BACEN | ⚖️🔧 | LGPD Art. 46 + BACEN Circular 4.893 §6º | F3, F4 | Adicionar `executor.nome` ao catálogo Cenário 20 + pseudonimização opcional |
| 4 | F4-5-G1/G2/G3 + F2-5.G1 | Placeholder "Solicitar cancelamento" parece botão funcional — modal não diz "pedido NÃO enviado" | 🎯⚖️ | Nielsen H1+H2, CDC Art. 39 V, Art. 49, Art. 51 IV | F1, F2, F4, F5 | Modal pós-clique declara explicitamente "NÃO enviado" + próximos passos + próxima cobrança + mailto pré-preenchido; em PAST_DUE re-exibe multa de fidelidade com fórmula |
| 5 | G-F1-4.1/4.2/4.7 | Audit trail não aplica anonimização retroativa após DSR — exporta PII de users apagados | ⚖️🔧 | LGPD Art. 18 VI + Art. 13 + Art. 38 | F1 | Pseudonimização retroativa + dual hash (original cofre + pseudonimizado público) + evento `dsr_anonimizacao_aplicada` |
| 6 | F2-4.G2 | Régua D+3 suspende org no meio de export CSV de audit trail = viola LGPD Art. 18 II (incondicional) | ⚖️🔧 | LGPD Art. 18 II, §3º, Art. 19 + Marco Civil Art. 13 | F2 | Job assíncrono persiste cross-status + tela "Exports pendentes" acessível em org suspensa |
| 7 | F6-5.G1/G2/G3 + F4-1-G2/G3 | Card "Próxima cobrança" mostra só plano fixo (R$ 7k) enquanto cliente paga R$ 500k+ em variável | ⚖️🎯🔧 | CDC Art. 6º III + Art. 31, Nielsen H1+H2 | F4, F6 | Breakdown "Plano fixo + Variável estimado (média 90d) = Total previsto" + forecast no gráfico |
| 8 | G-F1-3.1/3.2/3.3 | Mensagem genérica de erro de cupom (4 motivos com "ou") = cliente não sabe o que fazer | ⚖️🎯🔧 | CDC Art. 6º III, Nielsen H9, claim F1.4 | F1 | Mensagem específica (alinha story com wireframe W5.2) — considerar throttling pra evitar enumeration attack |
| 9 | F6-4.G1/G2/G5 | Audit trail trava em 50k+ eventos (scroll infinito, sem virtual scroll, export sync timeout) | 🔧⚖️🎯 | LGPD Art. 18 II + §3º, Marco Civil Art. 13, Nielsen H1+H7 | F2, F6 | Virtual scroll + paginação numérica + jump-to-date + export async com notificação por e-mail |
| 10 | F3-2.G1/G2/G3 | Modal W4 sem timeline de dispute/chargeback + PDF sem histórico + catálogo de eventos incompleto | 🔧⚖️ | CDC Art. 6º III, LGPD Art. 18 II, BACEN | F3 | Timeline embutida em W4 + PDF consolidado + ampliar Cenário 17 (chargeback_resolvido, evidencia_submetida, disputa_aceita, cash flow timeline) |
| 11 | F5-2-D + F5-5-B | Voucher holding-level vs execução org-level (CDC Art. 30) + multa 50% sem fórmula visível (Art. 51 IV) | ⚖️🔧 | CDC Art. 30 + Art. 51 IV, LGPD Art. 6º VI | F5 | Modelo "Holding/Grupo Econômico" + multa com fórmula + valor exato calculado + base legal antes do clique |
| 12 | F2-3.G1/G2 | Sem status "PAGAMENTO_PARCIAL" (14º) + coluna "Valor cobrado" bruto vs líquido ambígua após voucher | 🔧⚖️ | CDC Art. 6º III + Art. 31, NF-e fiscal | F2, F1 | Adicionar status PAGAMENTO_PARCIAL + decidir bruto+desconto explícito (recomendado) |
| 13 | F6-2.G4 + F6-3.G1/G2 + F4-2-G5 | Sem notificação proativa pra fatura alto valor vincenda + voucher DEPLETED rápido + duplo charge detectado | 🔧🎯⚖️ | CDC Art. 6º III + Art. 39 XII analogia, Nielsen H1 | F4, F6 | Layer de notificação proativa: matriz eventos→canais→thresholds (e-mail, push, in-app banner cross-page) |
| 14 | F3-3.G2 | Voucher consumido não emite NF/recibo fiscal automático = procurement BACEN rejeita produto | ⚖️ | BACEN Circular 4.893 + Decreto 7.962/13 + AC7 | F3 | Anti-claim explícito OU domínio fiscal/ + integração emissor NF eletrônica (Story 4 fintech-grade) |
| 15 | F3-4.G1/G2/G3 | SIEM streaming inexistente (AC3) + CSV proprietário + schema não documentado = InfoSec BACEN veta | ⚖️🔧 | BACEN Circular 4.893 §10, ISO 27001, LGPD Art. 38 | F3 | Anti-claim explícito sobre fintech BACEN OU Story 4: CEF/LEEF/JSON Lines + schema público + API REST + signing com cert chain |

---

## 6. Conclusão e direção

**Padrão central:** Story 3 tem **catálogos incompletos sistematicamente**. Cenário 20 (PII) esqueceu `executor.nome`. Cenário 17 (eventos) esqueceu 4+ eventos críticos (DSR, chargeback_resolvido, cobrança_duplicada, cancelamento_solicitado). Cenário 8.1 (status) não tem PAGAMENTO_PARCIAL nem DUPLICADO_A_ESTORNAR. Cenário 19 (export) não documenta schema canônico, signing, API.

**Padrão UX:** card primário esconde a verdade pra parecer limpo. Verdade está em modal de 2º clique. CDC Art. 6º III exige verdade no primeiro nível.

**Padrão de escala:** Story 3 foi desenhada single-tenant SMB. ICP enterprise (multi-org, high-volume, fintech regulada) rompe premissas em 3 dimensões: dado (catálogos incompletos), volume (50k+ eventos travam UI), modelo comercial (holding vs org única).

**Próximos passos recomendados (fora deste documento):**
1. Decidir quais perfis ficam no MVP (recomendação: F1 + F4 + F6 com fixes; anti-claim explícito pra F2 past_due crônico, F3 fintech BACEN, F5 holding multi-org até Story 4).
2. Roadmap de hardening por macro-tensão (M3 idempotência é P0 imediato; M1 transparência CDC é P0 sistêmico; M2 compliance LGPD/BACEN e M4 enterprise viram Story 4 dedicada).
3. Atualizar Story 3 com novos eventos canônicos, novos status, PII filter completo, layer de notificação proativa, virtual scroll + export async.
