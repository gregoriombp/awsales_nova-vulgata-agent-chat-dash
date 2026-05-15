> 📌 **NOTA DE REVISÃO (pós-feedback PG):**
> - F3 "fintech BACEN" foi cenário **hipotético** pra estressar compliance. Não é ICP do AwSales — fixes universais derivados (PII completo, dispute timeline, schema canônico de audit) foram incorporados na Story 3 v2.1 sem virar Story 4 dedicada.
> - F5 "holding multi-org" não é direcionamento de produto. **Toda tela filtra pela org atual** (modelo confirmado). O fix mantido é apenas **clareza visual** ("Total economizado nesta organização") — não consolidação cross-org.
> - "Limite de gastos variáveis" renomeado pra **"Cobrança parcial quando atingir"** — não limita uso, é threshold de billing.
> - Cenário de Notificações (F1.6/Cenário 26) confirmado: Story 3 PRODUZ eventos; canais (banner global, resumo header, página global) são feature paralela já em desenvolvimento.

---

# Stress Test Financeiro — Story 3 (lente tripla)

**Data:** 2026-05-11
**PO:** Guilherme Graham (PG)
**Objetivo declarado:** *"quero as melhores telas, com a melhor usabilidade e seguindo LGPD e tudo que tem mais direito de leis e segurança"*
**Skill:** pg-stress-test com **lente tripla** (🔧 Funcional · ⚖️ Compliance · 🎯 UX/Acessibilidade)
**Modo:** completo (6 perfis × 5 cenários × 3 lentes = 30 cenários, 90 walkthroughs)

> **TL;DR:** Story 3 (Financeiro) testada contra 6 perfis financeiros distintos (SaaS médio, past_due crônico, fintech BACEN, founder solo, holding multi-org, high-volume). **Adversarialidade altíssima** — 0/30 cenários passaram limpos, **90% break rate**. Identificados **154 gaps brutos** (56 P0, 74 P1, 24 P2-P3) clusterizados em **15 root causes** e **4 macro-tensões estruturais**. Fix backlog em **3 ondas**: Onda 1 hardening MVP (~31 SP, 2 semanas, P0 bloqueante), Onda 2 refino (~25 SP), Onda 3 anti-claim + Story 4 (~40 SP). **2 perfis (F3 fintech BACEN, F5 holding) precisam virar anti-claim explícito** ou aguardar Story 4. **F2 past_due e F4 founder solo têm bloqueio legal P0** (CDC Art. 42 §único — devolução em dobro por duplo charge).

---

## Sumário executivo

| Indicador | Resultado |
|---|---|
| Cenários executados | **30** (6 perfis × 5) |
| Passaram limpos | **0** |
| Passaram com dor | **3** (10%) |
| Quebraram | **27** (90%) |
| Total de gaps brutos | **154** |
| Severidade P0 (blocker / risco legal) | **56 (36%)** |
| Severidade P1 (fricção alta) | **74 (48%)** |
| Severidade P2-P3 (refinamento) | **24 (16%)** |
| Por lente 🔧 Funcional | **58** |
| Por lente ⚖️ Compliance | **51** |
| Por lente 🎯 UX/Acessibilidade | **54** |
| Macro-tensões estruturais | **4** |
| Clusters de root cause | **15** |
| Fixes priorizados | **17** (9 Onda 1 + 8 Onda 2) + **Story 4** |

### Adversarialidade

**Zero passes limpos em 30 cenários.** 90% break rate indica que a Story 3 no estado atual tem **fragilidades estruturais**, não edge cases isolados. Seeds Red Team foram bem desenhados.

---

## Macro-tensões estruturais

> Os 15 clusters de root cause sintetizam em **4 macro-tensões**:

### M1 — Transparência CDC vs UX scanner SMB
Cliente DEVE saber EXATAMENTE quanto/quando/como vai pagar (CDC Art. 6º III), mas a UI esconde detalhes críticos em modais de 2º clique pra parecer "limpa". Card primário = mentira; modal = verdade. **5/6 perfis afetados.** Risco direto: PROCON + class action via JEC.

### M2 — Compliance LGPD/BACEN subdesenhada
Story 3 declarou claims compliance (C1.1–C1.12) mas implementação tem **catálogos incompletos sistematicamente**:
- Cenário 20 (PII Filtering) esqueceu campo `executor.nome` do audit trail
- Cenário 17 (eventos) esqueceu 4+ eventos críticos (`dsr_anonimizacao_aplicada`, `chargeback_resolvido`, `cobranca_duplicada`, `cancelamento_solicitado`)
- Cenário 19 (export) não documenta schema canônico, formato CEF/LEEF, signing, API REST
**4/6 perfis afetados.** Mata deal fintech BACEN (F3). Risco: multa ANPD (R$ 50k–50M) + multa BACEN (R$ 50k–500k).

### M3 — Idempotência de pagamento Stripe ausente
Pagamento via Stripe tem múltiplos canais async (PIX webhook 30s, retry Smart Dunning, cliente clica "Tentar de novo"). Sem `idempotency_key` + sem lock client durante retry pendente = race condition garantida = duplo débito = **CDC Art. 42 §único obriga devolução EM DOBRO**. Pior caso: fatura R$ 500k cobrada 2x = R$ 1M de devolução obrigatória.

### M4 — Multi-tenant / Multi-org / Escala enterprise
Story 3 desenhada single-tenant view com volumes SMB. ICP enterprise rompe premissas:
- Card "Total economizado · lifetime" sem escopo cross-org
- Voucher "pra Holding" vincula 1 customer Stripe (org única)
- Audit trail trava em 50k+ eventos
- Gráfico empilhado esconde 95% da info quando uma categoria domina
- Sem forecast/projeção
- Sem notificação proativa

---

## Verdict por perfil

| Perfil | Status | # P0 | Veredito |
|---|---|---:|---|
| **F1 — SaaS médio (Fyntra)** | ❌ Quebrou 4/5 | 6 | **Fricção alta — adoção viável após fixes Onda 1** |
| **F2 — Past_due crônico** | ❌ Quebrou 4/5 | 9 | **Bloqueio legal P0** — Onda 1 obrigatória antes de release |
| **F3 — Fintech BACEN** | ❌ Quebrou 4/5 | 11 | **Fora do MVP** — anti-claim AC8 + Story 4 fintech-grade |
| **F4 — Founder solo** | ❌ Quebrou 5/5 | 9 | **Bloqueio legal P0** (CDC Art. 42 §único) — Onda 1 obrigatória |
| **F5 — Holding multi-org** | ❌ Quebrou 5/5 | 10 | **Fora do MVP** — anti-claim AC9 + Story 4 (modelo Holding) |
| **F6 — High-volume** | ❌ Quebrou 5/5 | 11 | **Fricção crítica — Onda 1 + 2 obrigatórias** (forecast, virtual scroll) |

**Síntese:** 0/6 perfis aprovam Story 3 sem fixes. **2 perfis viram anti-claim explícito**. **4 perfis viáveis após Onda 1**.

---

## Top 15 gaps mais críticos (cross-cutting)

| # | Gap | Lente | Lei | Perfis |
|---|---|---|---|---|
| 1 | Duplo charge Stripe (PIX + retry sem idempotency) → CDC devolução em dobro | 🔧⚖️🎯 | PCI-DSS 6.5.5 + CDC Art. 42 §único | F2, F4 |
| 2 | Card "● Ativo" enquanto PAST_DUE há 30 dias com 3 razões agregadas | ⚖️🎯🔧 | CDC Art. 6º III + Nielsen H1+H2 | F2 |
| 3 | PII Filtering não cobre `executor.nome` do audit trail (CISO vê nomes completos) | ⚖️🔧 | LGPD Art. 46 + BACEN Circular 4.893 §6º | F3, F4 |
| 4 | Placeholder "Solicitar cancelamento" parece funcional (sem aviso "NÃO enviado") | 🎯⚖️ | CDC Art. 39 V + 49 + 51 IV + Nielsen H1 | F1, F2, F4, F5 |
| 5 | Audit trail não anonimiza retroativamente após DSR — exporta PII de users apagados | ⚖️🔧 | LGPD Art. 18 VI + 13 + 38 | F1 |
| 6 | Régua D+3 suspende org no meio de export CSV → viola LGPD Art. 18 II incondicional | ⚖️🔧 | LGPD Art. 18 II + §3º | F2 |
| 7 | Card "Próxima cobrança" R$ 7k vs cliente paga R$ 500k+ em variável | ⚖️🎯🔧 | CDC Art. 6º III + 31 + Nielsen H1+H2 | F4, F6 |
| 8 | Mensagem genérica de erro de cupom (lista 4 motivos com "ou") | ⚖️🎯🔧 | CDC Art. 6º III + Nielsen H9 | F1 |
| 9 | Audit trail trava em 50k+ eventos (scroll infinito, export sync timeout) | 🔧⚖️🎯 | LGPD Art. 18 II + Marco Civil Art. 13 | F2, F6 |
| 10 | Modal de fatura sem timeline de dispute/chargeback + PDF sem histórico | 🔧⚖️ | CDC Art. 6º III + BACEN | F3 |
| 11 | Voucher holding-level vs execução org-level (Stripe customer = 1 org) | ⚖️🔧 | CDC Art. 30 + 51 IV | F5 |
| 12 | Sem status `PAGAMENTO_PARCIAL` (14º) + coluna "Valor cobrado" ambígua após voucher | 🔧⚖️ | CDC Art. 6º III | F2, F1 |
| 13 | Sem notificação proativa pra fatura alto valor / voucher DEPLETED / duplo charge | 🔧🎯⚖️ | CDC Art. 6º III + Nielsen H1 | F4, F6 |
| 14 | Voucher consumido não emite NF/recibo fiscal automático (procurement BACEN rejeita) | ⚖️ | BACEN + Decreto 7.962/13 + AC7 | F3 |
| 15 | SIEM streaming inexistente + CSV proprietário + schema não documentado | ⚖️🔧 | BACEN Circular 4.893 §10 + ISO 27001 | F3 |

---

## Fix Backlog em 3 Ondas

### 🌊 Onda 1 — Hardening MVP (P0 imediato · 31 SP · 2 semanas)

| Fix | SP | Macro | Endereça |
|---|---:|---|---|
| **F1.1** Idempotência Stripe + status PAGAMENTO_PARCIAL | 5 | M3 | Duplo charge |
| **F1.2** Card variant PAST_DUE + razões individuais | 4 | M1 | Card vs modal |
| **F1.3** PII Filtering completo + DSR retroativo | 4 | M2 | LGPD Art. 18 VI + 46 |
| **F1.4** Placeholder explícito "NÃO enviado" + mailto pré-preenchido | 3 | M1 | Cancelamento confuso |
| **F1.5** Forecast / breakdown fixo+variável no card | 3 | M1 | Mental model |
| **F1.6** Layer notificação proativa | 3 | M4 | Silent failures |
| **F1.7** Mensagem específica erro de cupom (alinha story+wireframe W5.2) | 3 | M1 | Nielsen H9 |
| **F1.8** Audit trail escalável (virtual scroll + paginação + export async resiliente) | 4 | M4 | LGPD Art. 18 II |
| **F1.9** Status PT-BR + magnitude visual de badges | 2 | M1 | Vocabulário técnico |

### 🌊 Onda 2 — Refino UX/Compliance (P1 · 25 SP · 2 semanas)

| Fix | SP | Macro | Endereça |
|---|---:|---|---|
| **F2.1** Preservação de estado cross-navegação (URL params) | 3 | M4 | Filtros perdidos |
| **F2.2** Timeline visual de dispute/chargeback | 4 | M2 | Fechamento BACEN |
| **F2.3** Voucher bruto vs líquido + alerta consumo rápido | 3 | M1 | Ambiguidade |
| **F2.4** Gráfico empilhado escalável (Log / 100% / Linear) | 4 | M1 | F6 high-volume |
| **F2.5** Multi-org cross-org scope claro | 3 | M4 | F5 holding |
| **F2.6** WCAG 2.1 AA base (aria, contraste, keyboard) | 2 | M1 | Acessibilidade |
| **F2.7** Audit trail vocabulário PT-BR + tooltips | 3 | M1 | F4 founder solo |
| **F2.8** Multa de fidelidade com fórmula transparente | 3 | M1 | CDC Art. 51 IV |

### 🌊 Onda 3 — Anti-claim + Story 4 (~40 SP · pós-MVP)

**Anti-claims explícitos na Story 3 v2:**
- AC8: Fintech regulada BACEN — não atende MVP
- AC9: Holding/Grupo Econômico como entidade — não modelado no MVP
- AC10: Past_due crônico em larga escala — fluxo de renegociação self-service é Story 5

**Story 4 — "Enterprise Compliance + Multi-Org Pack":**
- SIEM streaming (CEF/LEEF/JSON Lines + assinatura cert chain)
- NF eletrônica automática (voucher.emitido → NF de antecipação)
- Modelo "Holding/Grupo Econômico" (vouchers cross-org, plano consolidado)
- PII Filtering completo (executor + target em audit trail)
- API REST do audit trail
- Forecast / projeção (paridade GCP Billing / AWS Cost Explorer)

---

## Decisões estratégicas que o PG precisa tomar

1. **F3 fintech BACEN entra no MVP?** Recomendação: **Não** — anti-claim AC8 + Story 4.
2. **F5 holding multi-org entra no MVP?** Recomendação: **Parcial** — Onda 1 + 2 cobrem 50%, modelo completo em Story 4.
3. **F2 past_due crônico?** Recomendação: **Onda 1 cobre P0** legal, refinamento em Story 5 (renegociação self-service).
4. **F6 high-volume aceita degradação?** Recomendação: **Não** — F1.8 + F2.4 são obrigatórios.

---

## Arquivos do stress test

```
prototype-studio/
├── stress-tests/financeiro/report.md          ← este arquivo (relatório principal)
├── stories/financeiro.md
├── archive/wireframes-ascii/financeiro.md
├── prototypes/financeiro.html
└── stress-tests/financeiro/scenarios-and-fixes/
    ├── README.md                                 (índice)
    ├── sut-definition.md                         (Step 1: SUT + 25 claims sob 3 lentes)
    ├── matrix-and-seeds.md                       (Step 2-3: 30 seeds adversariais)
    ├── gaps-consolidated.md                      (Step 5: 15 clusters + 4 macro-tensões + top 15 gaps)
    ├── fix-backlog.md                            (Step 6: 17 fixes em 3 ondas + Story 4)
    └── scenarios/                                (Step 4: walkthroughs beat-by-beat por perfil)
        ├── agent-f1-saas-medio.md                (22 gaps, 6 P0)
        ├── agent-f2-past-due.md                  (22 gaps, 9 P0)
        ├── agent-f3-fintech-bacen.md             (27 gaps, 11 P0)
        ├── agent-f4-founder-solo.md              (30 gaps, 9 P0)
        ├── agent-f5-holding-multi-org.md         (22 gaps, 10 P0)
        └── agent-f6-high-volume.md               (31 gaps, 11 P0)
```

---

## Próximo passo: aplicar Onda 1 nas telas

Os 9 fixes da Onda 1 vão ser aplicados nos 3 artefatos da Story 3:
- **stories/financeiro.md** — atualizar Cenários 9 (status PT-BR), 15 (mensagem cupom), 17 (catálogo de eventos), 20 (PII completo) + novos Cenários (forecast, idempotência, anti-claims AC8/AC9/AC10)
- **archive/wireframes-ascii/financeiro.md** — variant de card PAST_DUE, modal placeholder explícito, breakdown fixo+variável, audit trail escalável, timeline dispute
- **prototypes/financeiro.html** — toggle de magnitude no gráfico, virtual scroll no audit trail (mock), status PT-BR, modal LGPD com aviso DSR

Após Onda 1 aplicada, wireframes ficam **prontos pro Greg fazer Figma final**.
