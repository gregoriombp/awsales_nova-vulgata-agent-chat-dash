# Stress Test — Wireframes Primeiro Login + Configurações da Organização

**Data:** 2026-05-11
**PO:** Guilherme Graham (PG)
**Skill:** pg-stress-test (Engine adversarial Red Team)
**Modo:** completo (1 eixo × 6 perfis × 5 cenários = 30 cenários, 6 agentes paralelos)

> **TL;DR:** SUT testado contra 6 perfis enterprise (SaaS médio, varejo familiar, fintech regulada, edtech fundador, grupo multi-org, logística terceirizada). **Adversarialidade alta** — 0 cenários passaram limpos. Identificamos **~80-90 gaps únicos** que se clusterizam em **3 macro-tensões estruturais** do produto. Fix backlog de **20 fixes priorizados** (~118 SP) com **12 P0 bloqueantes** (~75 SP MVP enxuto). **2 perfis (fintech regulada + grupo multi-org) ficam fora do MVP** sem stories adicionais dedicadas.

---

## Sumário executivo

| Indicador | Resultado |
|---|---|
| Cenários executados | 30 (6 perfis × 5 cenários) |
| Passaram limpos | **0** |
| Passaram com dor | **6** (20%) |
| Quebraram | **24** (80%) |
| Total de gaps brutos | 108 |
| Gaps únicos (após cluster) | ~80–90 |
| **Severidade P0 (estrutural)** | **63 gaps** |
| Severidade P1 (workaround pesado) | 52 gaps |
| Severidade P2 (polish/cosmético) | 7 gaps |
| Macro-tensões identificadas | 3 estruturais + 1 transversal |
| Fix backlog | 20 fixes (12 P0 · 8 P1) — ~118 SP total |

### Adversarialidade

Apenas 6 cenários "passaram com dor" e **nenhum passou limpo** — sinal de que os seeds foram bem desenhados pra estressar o SUT. Tradução: as decisões de produto cobertas pelos 2 wireframes têm gaps estruturais reais que merecem fix antes do dev, não bugs de implementação que aparecem em tempo de codar.

### Macro-tensões estruturais

> Os 12 clusters de root cause sintetizam em **3 macro-tensões + 1 transversal:**

#### M1 — "Caminho feliz síncrono single-tenant" vs realidade enterprise async/multi-org
Wireframes desenham 1 usuário, 1 org, 1 fluxo, 1 vez. Realidade enterprise é multi-aba + multi-org + procurement lento + estados async + recovery operacional.
→ **~46 gaps · 25 P0**

#### M2 — "Strict + rigid + invisible" como princípio de validação enterprise
Validação strict (regex, equality, TTL), feedback invisível (popups bloqueados, refresh derrubando state, alias rejeitado silenciosamente), tempos rígidos (7d/D+3 hardcoded).
→ **~22 gaps · 13 P0**

#### M3 — "Compliance + governança como pendência" vs realidade B2B regulada
Audit trail por user×org isolado, compliance como pendência (não AC), funções padrão SaaS-coded sem contexto, permissões sem segregação BACEN.
→ **~42 gaps · 21 P0**

#### M4 (transversal) — UX scanner SMB vs hierarquia visual neutra
Tela de revisão trata métricas críticas como linhas iguais. Founder SMB scanner não lê — assume "preço único". Mental model choca com 2 blocos distintos.
→ **~12 gaps · 4 P0**

---

## Verdict por perfil

| Perfil | Status | # gaps | P0 | Veredicto |
|---|---|---:|---:|---|
| **P1** SaaS médio (Fyntra) | ❌ Quebrou | 17 | 6 | Adoption viável com correções de M1 + M2 |
| **P2** Varejo familiar (Casa Bahia Filial) | ❌ Quebrou | 24 | 9 | Adoption frágil sem M4 + RC9 (botões informativos robustos) |
| **P3** Fintech regulada (NeoBank) | ❌ Quebrou | 14 | 6 | **FORA DO MVP** sem M3 endereçada (recomendação: adiar) |
| **P4** Edtech fundador (CodeRabbit) | ⚠ Com dor | 14 | 4 | Adoption viável com correções de M1 + M4 |
| **P5** Grupo multi-org (Holding Vitru) | ❌ Quebrou | 14 | 6 | **FORA DO MVP** sem F1.2 + F3.2 cross-org (recomendação: aceitar perda OU sub-story dedicada) |
| **P6** Logística terceirizada (TransExpress) | ❌ Quebrou | 25 | 9 | RC3 (inflexibilidade temporal) é blocker — endereçar antes de prospectar enterprise lento |

**Adoção viável no MVP atual (com fixes P0):** P1 + P4 (SaaS médio + Edtech fundador)
**Adoção com fricção alta:** P2 + P6 (varejo familiar + logística) — viável mas requer correções profundas
**Fora do MVP:** P3 + P5 (fintech regulada + grupo multi-org)

---

## Top 10 gaps mais críticos (P0 cross-cutting)

| # | Gap | Macro | Perfis afetados |
|---|---|---|---|
| 1 | Audit trail individual sem cross-org/consolidado nem coluna `organization_id` no CSV | M3 | P1, P3, P5 |
| 2 | W8-A não respeita flag `2FA obrigatório` da org pro Responsável no 1º acesso — viola SOC2/BACEN | M3 | P3 (+ futuros) |
| 3 | Persona A não detecta usuário pré-existente — duplica WorkOS/Stripe/dados em multi-org | M1 | P5 |
| 4 | TTL de convite/boleto/régua hardcoded sem configurabilidade por contrato | M2 | P2, P6 |
| 5 | Strict equality de e-mail SSO bloqueia aliases legítimos (Workspace/Entra) sem fallback | M2 | P1, P6 |
| 6 | OAuth com popup bloqueado falha silenciosamente (sem fallback full-page redirect) | M2 | P6 |
| 7 | Descontinuidade cross-story: `+ Criar nova função` no W9-A (Story 1) perde chips digitados | M1 | P1, P4 |
| 8 | Wireframe não materializa tela de bloqueio mobile (só OBS lateral em texto) | M1 | P4 |
| 9 | Implementação + Plano sem Big Number consolidado — founder SMB confunde com preço único | M4 | P2, P4 |
| 10 | Lock-out de Admin único sem recovery operacional documentado | M3 | P4 |

---

## Fix backlog priorizado (resumo)

Cada fix é **substituição/adição** validada cross-scenario — nenhum quebra outros perfis.

### Macro M1 — Async/multi-org (5 fixes)
- **F1.1 (P0, 5 SP):** Contrato de estados assíncronos (loader + "Meus processos" + notificação)
- **F1.2 (P0, 8 SP):** Wireframe Persona A multi-org (detecta usuário existente)
- **F1.3 (P0, 3 SP):** Wireframe Mobile educated block com mitigação
- **F1.4 (P1, 3 SP):** Seletor de org no header Persona A se autenticado
- **F1.5 (P0, 5 SP):** Continuidade cross-story (criar função inline preservando state)

### Macro M2 — Strict/rigid/invisible (5 fixes)
- **F2.1 (P0, 5 SP):** Normalização de e-mail antes de strict equality
- **F2.2 (P0, 5 SP):** Regex de senha documentado + policy de rotação (story dedicada)
- **F2.3 (P0, 8 SP):** TTL configurável por contrato (link + boleto + régua)
- **F2.4 (P0, 3 SP):** Fallback OAuth via full-page redirect
- **F2.5 (P1, 3 SP):** Trim + paste multi-linha + sumário de erros

### Macro M3 — Compliance/governança (6 fixes)
- **F3.1 (P0, 2 SP):** 2FA obrigatório respeita flag pro Responsável
- **F3.2 (P0, 13 SP):** Audit trail enterprise (meta-audit + LGPD + cross-org)
- **F3.3 (P0, 13 SP):** Permissões com escopo + PII filtering
- **F3.4 (P0, 21 SP):** Webhook/streaming SIEM — **pós-MVP**
- **F3.5 (P1, 5 SP):** Tooltips em permissões + função wizard
- **F3.6 (P1, 5 SP):** Invoice trigger explícito + tela self-service

### Macro M4 — Scanner SMB (4 fixes)
- **F4.1 (P0, 3 SP):** Big Number consolidado em W2-A + W10-A
- **F4.2 (P1, 3 SP):** Boleto universal (input + fallback) + matriz browsers
- **F4.3 (P1, 5 SP):** Termo: progresso + PDF + registro acessível
- **F4.4 (P0, 5 SP):** Recovery operacional (lock-out + dupla cobrança)

**Totais:**
- **P0:** 12 fixes · ~75 SP (~4-5 semanas)
- **P1:** 8 fixes · ~43 SP (~2-3 semanas)
- **Total:** ~118 SP (~6-8 semanas)
- **Pós-MVP isolado (F3.4):** 21 SP

---

## Decisões estratégicas que precisam ser tomadas

Antes do dev, **6 decisões do PG** desbloqueiam o caminho:

1. **P3 fintech regulada está no escopo do MVP?**
   - SIM → F3.1-F3.4 são bloqueantes (~50 SP adicionais)
   - NÃO → marcar "P3 fora do MVP" oficialmente; remover da pipeline comercial até "Enterprise Readiness" release
2. **P5 grupo multi-org está no escopo?**
   - SIM → F1.2 + F3.2 cross-org bloqueantes (~25 SP)
   - NÃO → aceitar perda de holdings
3. **Termo de uso: aceite por usuário (uma vez) ou por usuário×org (cada org)?** Decisão jurídica.
4. **TTL de convite default:** mudar de 7d pra 14d?
5. **Audit trail retention:** definir AGORA com jurídico — 5 anos (LGPD) / 10 anos (regulação financeira)?
6. **2FA obrigatório vale pro 1º acesso do Responsável quando flag está ON?** (sugerido: SIM)

---

## Padrões adversariais identificados (síntese cross-perfil)

1. **Wireframes silenciosos sobre estados assíncronos:** 3DS, export CSV, OAuth popup, criação de função, geração de boleto — tudo desenhado como passos síncronos. Greg vai pro Figma sem referência.

2. **Strict equality em campos enterprise-sensitive:** e-mail SSO com `+alias`, sub-domínios mapeados, regex de senha não documentado, sem trim automático.

3. **Tempos hardcoded sem configurabilidade:** TTL convite 7d, vencimento boleto 7d, régua D+3 — quebra em casos enterprise reais (procurement, financeiro centralizado, recesso brasileiro).

4. **Multi-org como modelo técnico, não UX/governança:** Cenário 24 cobre "1 user em N orgs" tecnicamente; falha em "1 user OPERA N orgs simultaneamente" (CFO Holding).

5. **Compliance subdesenhado:** retenção como pendência, sem streaming SIEM, sem segregação BACEN, sem PII filtering, sem meta-audit pra LGPD.

6. **Hierarquia visual neutra:** Implementação + Plano + Fidelidade como linhas de mesmo peso. SMB scanner pula.

7. **Descontinuidade cross-story:** mesma capacidade tratada diferente em wireframes distintos. Aba Segurança listada mas não materializada.

8. **Botões informativos sem fallback robusto:** AC2 (decisão MVP) é OK como conceito mas copy/UI precisa de mais robustez (sem mailto pré-preenchido, sem fallback OOO/desligado).

9. **Audit trail individual:** design "1 audit = 1 user em 1 org" — não atende holding nem CRO da própria org.

10. **Recovery operacional incompleto:** lock-out de Admin, dupla cobrança em link reenviado, régua D+3 sem snooze.

---

## Arquivos do stress test

```
prototype-studio/
├── stress-tests/primeiro-login/report.md              ← este arquivo (relatório principal)
├── stories/primeiro-login.md (SUT 1)
├── stories/team-funcoes-config.md (SUT 2)
├── archive/wireframes-ascii/primeiro-login.md           (SUT 3)
├── archive/wireframes-ascii/team-funcoes-config.md      (SUT 4)
└── stress-test/
    ├── README.md                          (índice do folder)
    ├── sut-definition.md                  (Step 1: claims + anti-claims + baselines)
    ├── matrix-and-seeds.md                (Step 2-3: 6 perfis × 5 seeds adversariais)
    ├── gaps-consolidated.md               (Step 5: 12 clusters por root cause + 3 macro-tensões)
    ├── fix-backlog.md                     (Step 6: 20 fixes priorizados + validação cross-scenario)
    └── scenarios/                         (Step 4: walkthroughs beat-by-beat por perfil)
        ├── agent-p1-saas-medio.md         (17 gaps, 6 P0)
        ├── agent-p2-varejo-familiar.md    (24 gaps, 9 P0)
        ├── agent-p3-fintech-regulada.md   (14 gaps, 6 P0)
        ├── agent-p4-edtech-fundador.md    (14 gaps, 4 P0)
        ├── agent-p5-grupo-multiorg.md     (14 gaps, 6 P0)
        └── agent-p6-logistica-terceirizada.md (25 gaps, 9 P0)
```

---

## Próximo passo recomendado

1. **PG revisa o fix backlog** ([fix-backlog.md](stress-test/fix-backlog.md)) e responde as **6 decisões estratégicas** acima.
2. **PG decide:** rodar `pg-causal-engine` (AWSTRAT-57) nas macro-tensões M1 e M3? Cada uma tem ≥10 gaps clusterizados — sinal de problema causal estrutural, não pontual. Causal engine ajudaria a separar **sintoma** ("audit trail por org") de **causa** ("modelo de dados foi desenhado pra single-tenant view sem considerar holdings").
3. **Atualizar as 2 stories** com AC adicionais derivados dos fixes P0 que ficam dentro do MVP.
4. **Greg** pode começar Figma dos wireframes existentes em paralelo, MAS marcar como "v1 pré-stress-test" — versão final precisa absorver F1.1 (async), F1.3 (mobile), F4.1 (Big Number).
5. **Comercial AwSales** alinha pipeline: P3 fintech + P5 holding ficam **pausados** até decisão estratégica do PG.
