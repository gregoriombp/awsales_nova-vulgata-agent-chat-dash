# Gap Register Consolidado — Stress Test 2026-05-11

**Data:** 2026-05-11
**Cenários executados:** 30 (6 perfis × 5 cada)
**Status agregado:** 0 passaram limpos · 6 passaram com dor · 24 quebraram
**Total de gaps brutos:** 108 (P1: 17 · P2: 24 · P3: 14 · P4: 14 · P5: 14 · P6: 25)

> **Adversarialidade:** apenas 20% dos cenários "passaram com dor" e 0% passaram limpos — seeds foram bem desenhados pra estressar o SUT.

---

## Clusterização por root cause

> **Princípio:** gap que aparece em 1 cenário é edge case; em 3+ é problema **estrutural**. Cluster identifica problemas estruturais que merecem fix arquitetural, não pontual.

### RC1 — Wireframes silenciosos sobre estados assíncronos, mobile e empty states (≥7 cenários)

Wireframes desenham caminho feliz síncrono mas omitem comportamento durante operações de longo prazo ou estados não-default. Greg vai pro Figma sem referência de:
- 3DS challenge longo (P1-1)
- Geração de export CSV de audit trail (P1-4, P6-4)
- Setup de TOTP em multi-org (P5-1-F)
- Sessão de fluxo de onboarding (TTL não definido) (P2-2)
- Tela de bloqueio mobile (P4-1)
- Empty states quando org tem 1 só usuário (P4-3)
- Estado visual de "usuário inativo" no modal de visualizar (P6-4)
- Resposta a popup OAuth bloqueado (P6-2)
- Seletor de org durante onboarding (P5-3)
- Aba Segurança da Story 2 (listada mas não desenhada) (P1-5)

**Gaps:** G-P1-1.2, G-P1-4.1, G-P1-4.2, G-P1-5.3, P2-2.G3, G1.1 (P4-1), G3.2 (P4-3), G6 (P6-2), G19 (P6-4), G20 (P6-4), P5-1-F, P5-3-A, P3-4 (Segurança não materializada) — **13 gaps · 8 P0**

**Severidade agregada:** P0 (estrutural — sem isso o dev decide sem referência e quebra na implementação)

---

### RC2 — Strict-first validation em campos enterprise-sensitive (≥3 cenários)

Backend valida campos com regex/strict equality sem documentar pra que o cliente entenda; falha silenciosa sem mensagem específica do char/valor que falhou; sem trim/normalize automático.

- E-mail SSO com aliases `+suffix` e sub-domínios mapeados (Workspace/Entra) (P1-2)
- Regex de "símbolo" de senha não documentado, incompatível com cofre 1Password (P3-3)
- E-mails com whitespace pendente não fazem trim (P6-5)
- Validação de e-mail em chips sem indicação clara de qual chip falhou (P6-5)

**Gaps:** G-P1-2.1, G-P1-2.3, G10, G22, G23 — **5 gaps · 4 P0**

**Severidade agregada:** P0 (causa direta de abandono enterprise — UX silencioso é pior que UX errado)

---

### RC3 — Inflexibilidade temporal hardcoded (≥5 cenários, 4 perfis)

Tempos críticos (TTL de link 7d, expiração de PIX 5min, vencimento de boleto 7d, régua D+3, "1ª fatura no último dia do mês") são hardcoded em wireframes/stories sem configurabilidade por contrato/org. Quebra em casos enterprise reais:

- Link 7d colado em recesso brasileiro (Natal) (P2-3)
- Link 7d insuficiente pra procurement de 12d (P6-1)
- Boleto 7d incompatível com cliente que paga em D+30 (P6-3)
- Régua D+3 sem snooze quando comercial sabe da política do cliente (P6-3)
- Sem notificação proativa "convite vai expirar" (P2-3, P6-1)
- 1ª fatura no último dia do mês quando convite cai em 11/05 → 21 dias de pro-rata vira "quase mensalidade completa" pra SMB (P4-2)

**Gaps:** P2-3.G1, P2-3.G5, G3 (P6-1), G5 (P6-1), G11 (P6-3), G12 (P6-3), G13 (P6-3), G2.4 (P4-2) — **8 gaps · 4 P0**

**Severidade agregada:** P0 (cliente perdido por design rígido, não por falha técnica)

---

### RC4 — Multi-org como modelo técnico, não como UX/governança (≥6 cenários)

Stories cobrem "1 user em N orgs" tecnicamente (Persona B Cenário 24) mas falham em "1 user OPERA N orgs simultaneamente" (P5 inteiro). Persona A foi desenhada como "1º acesso isolado público" sem considerar que CFOs de holding/grupo são responsáveis em N orgs por padrão.

- Tela boas-vindas Persona A não detecta usuário existente (P5-1-A)
- SSO de usuário pré-existente em nova org — comportamento indefinido (P5-1-C)
- TOTP setup em multi-org — gera N secrets ou reusa? (P5-1-F)
- Stripe customer/payment method em multi-org — reuso indefinido (P5-1-B)
- Dados pessoais não pré-preenchidos pra multi-org Responsável (P5-1-D)
- Escopo do aceite de Termo (por user vs por user×org) inconsistente (P5-1-E)
- Sem importar/copiar função cross-org (P5-4-A)
- Drift silencioso entre funções homônimas em orgs diferentes (P5-4-B)
- Sem visão consolidada cross-org pra propagação de mudanças regulatórias (P5-4-C)
- Audit trail consolidado/cross-org não existe (P5-5-B, P5-5-C)
- LGPD data subject request cross-org indefinida (P5-5-E)
- Seletor de org durante onboarding Persona A (P5-3-A)
- Sessão WorkOS entre orgs pré-existente vs sessão de onboarding nova (P5-3-B)

**Gaps:** P5-1 (todos: A-F), P5-3 (todos), P5-4 (todos), P5-5-B, P5-5-C, P5-5-E — **18 gaps · 9 P0**

**Severidade agregada:** P0 (deal-breaker pra holdings/grupos — perfil enterprise comum, não exceção)

---

### RC5 — Compliance LGPD/BACEN/SOC2/InfoSec subdesenhado (≥6 cenários, 4 perfis)

Compliance regulatória aparece como pendência (Story 2 #3 "5+ anos a definir") em vez de AC obrigatório. Cliente regulado (fintech/saúde/financeiro/holding) precisa de compromisso contratual, não pendência:

- W8-A não respeita flag `2FA obrigatório` pro Responsável (P3-1) — viola SOC2/BACEN
- Invoice pré-pagamento sem trigger, timing, confirmação visual (P3-2)
- Regex de senha não documentado + sem policy de rotação + sem histórico (P3-3) — viola SOC2/ISO27001
- Sem webhook/streaming SIEM (Splunk/Datadog/Sentinel) (P3-4)
- Modelo de permissões sem segregação Admin/DPO/CISO (P3-5) — viola BACEN segregação de funções
- Audit trail sem meta-audit (export é evento crítico LGPD) (G-P1-4.3)
- Sem aviso LGPD/sensibilidade no download (G-P1-4.4)
- Sem hash/checksum CSV pra integridade probatória (G-P1-4.4)
- Retenção do audit trail como pendência, não AC (G16 P3-4)
- LGPD data subject request cross-org indefinida (P5-5-E)
- Catálogo de permissões sem "visualizar próprio vs da org" (P3-5 G18)
- Sem PII filtering por permissão (Admin com escrita NÃO pode ter visualização de PII suprimida) (P3-5 G21)
- Audit trail individual, não consolidado da org (P3-5 G19)

**Gaps:** G1, G2 (P3-1), G5, G6, G7 (P3-2), G10, G12 (P3-3), G14, G15, G16 (P3-4), G18, G19, G20, G21, G22 (P3-5), G-P1-4.3, G-P1-4.4, P5-5-E — **18 gaps · 11 P0**

**Severidade agregada:** P0 (perdemos vertical regulada inteira sem essas — confirma que P3 está fora do MVP)

---

### RC6 — Implementação vs Plano sem hierarquia visual + scanner SMB (≥4 cenários)

Tela de revisão (W2-A) trata "valor", "método", "fidelidade", "1ª fatura" como linhas iguais. Founder SMB scanner com pressa não lê — assume "preço único". Mental model choca com 2 blocos distintos:

- Sem big number consolidado "AGORA: R$ X · PRÓXIMA: R$ Y em DD/MM" (P4-2 G2.1)
- Card Plano enterra info "1ª fatura R$ 612,90" como linha normal (P4-2 G2.2)
- W4-A "Não vamos cobrar nada agora" como tooltip chega tarde (P4-2 G2.3)
- Resumo final W10-A não educa "sua próxima cobrança" (P4-2 G2.5)
- Linha digitável de boleto não copiável em IE11 sem fallback (P2-1.G2)
- Termo de 47 páginas em monitor pequeno vira tortura (P2-2.G1, G4)

**Gaps:** G2.1-2.5 (P4-2), P2-1.G1-G5, P2-2.G1, G4 — **12 gaps · 4 P0**

**Severidade agregada:** P0 (gera ticket recorrente no AM e dano de NPS)

---

### RC7 — Funções padrão SaaS-coded + permissões sem contexto/help (≥4 cenários)

6 funções padrão fixas com nomes SaaS-genéricos (Administrador / Gerente de Ops / Analista / Operador) não mapeiam vocabulário de vertical do cliente. Catálogo de 52 permissões em 14 domínios sem tooltips, sem preset, sem "duplicar e simplificar":

- Funções padrão SaaS-coded (P2-4.G1) — não mapeia varejo familiar
- Permissões sem tooltips/descrições contextuais (P2-4.G2)
- Criação parte de 52 checkboxes desmarcados sem preset (P2-4.G3, AC4)
- Sem sinalização de risco por permissão (Excluir Bases) (P2-4.G4)
- Founder SMB sem default/wizard pra escolha de função (P4-3 G3.4)
- Cenário 15 (mudar função em convite pendente exige cancelar+reenviar) — UX hostil (P4-3 G3.3)
- Modelo "1 função por usuário" impede composição em orgs reguladas (P3-5 G22)
- W9 sem busca/filtro/template entre 52 permissões (P3-5 G24)

**Gaps:** P2-4 (todos), G3.3, G3.4 (P4-3), G22, G24 (P3-5) — **9 gaps · 3 P0**

**Severidade agregada:** P1 (degrada autonomia do cliente, mas não bloqueia onboarding)

---

### RC8 — Descontinuidade cross-story/cross-wireframe (≥3 cenários)

Mesma capacidade tratada de forma diferente em wireframes distintos ou estado não-coberto na transição entre stories:

- W9-A da Story 1 não desenha `+ Criar nova função` (Story 2 W4 tem) (G-P1-3.1)
- Retorno de criação de função sem preservar chips (G-P1-3.2)
- W9 (criar função) assume sidebar; W9-A do onboarding não tem sidebar (G-P1-3.3)
- Aba Segurança listada mas não materializada (G-P1-5.3)
- Seletor de org durante onboarding Persona A — comportamento indefinido (P5-3-A)
- SSO de usuário pré-existente em nova org (P5-1-C)

**Gaps:** G-P1-3.1-3.5, G-P1-5.3, P5-3-A, P5-1-C — **7 gaps · 4 P0**

**Severidade agregada:** P0 (force dev/Greg a decidir caso-a-caso → inconsistência garantida)

---

### RC9 — Botões informativos sem fallback robusto (AC2) (≥4 cenários)

AC2 (placeholders informativos sem API backend) é decisão de MVP **válida**, MAS a UI/copy precisa ser robusta — não basta mostrar nome do comercial:

- Sem fallback de telefone, suporte genérico, formulário quando comercial OOO/desligado (P2-3.G2)
- Sem self-service "Solicitar novo link" pre-formatado via `mailto:` (P2-3.G4, G1 P6-1)
- Sem SLA visível pro reenvio do convite no lado AwSales (G2 P6-1)
- W3-A.2 (boleto gerado) não vincula contato comercial pra negociação de prazo (G14 P6-3)
- W4-A não mostra "outros métodos não estão liberados — pedir liberação" (P5-2-A, B, C)

**Gaps:** P2-3.G2, P2-3.G3, P2-3.G4, G1, G2 (P6-1), G14 (P6-3), P5-2-A-C — **9 gaps · 5 P0**

**Severidade agregada:** P0 (operacional — cliente trava esperando humano que pode estar OOO)

---

### RC10 — Audit trail individual, não cross-org/consolidado (≥3 cenários)

Design "1 audit trail = 1 user em 1 org" não atende:
- Holding/grupo (P5-5 — CFO multi-org pra compliance)
- CRO/CISO da própria org (P3-5 G19 — visão consolidada da org inteira)

- CSV sem coluna `organization_id` (P5-5-B)
- Sem busca cross-org (P5-5-C)
- LGPD data subject request cross-org (P5-5-E)
- Sem audit trail consolidado da org (P3-5 G19)
- Sem ações cross-user (CRO precisa ver "Quem aprovou disparos no Q1?") (P3-5 G19)

**Gaps:** P5-5-A, P5-5-B, P5-5-C, P5-5-E, G19 (P3-5) — **5 gaps · 4 P0**

**Severidade agregada:** P0 pra holdings/regulados, P1 pra SMB

---

### RC11 — Recovery operacional incompleto (≥5 cenários)

Paths de exception+recovery sem fluxo claro — produto força ticket humano:

- Lock-out de único Admin (P4-5 G5.4) — sem suporte AwSales reativar
- UI não previne ação "Inativar" no kebab quando é último Admin (P4-5 G5.1)
- Modal de confirmação inativar não tem cenário "você é o último admin" (P4-5 G5.2)
- Sem cenário de "promover outro admin → tentar de novo" coberto no fluxo (P4-5 G5.3)
- Link reenviado com pagamento já feito no link anterior (P5-2-D)
- Régua D+3 inflexível sem snooze (P6-3 G13)
- Recovery após refresh em meio do W5-A (G9 P6-2)

**Gaps:** P4-5 (G5.1-G5.4), P5-2-D, P5-2-E, G13 (P6-3), G9 (P6-2) — **8 gaps · 4 P0**

**Severidade agregada:** P0 (lock-out de admin é blocker pra SMB; dupla cobrança é catastrófico)

---

### RC12 — Falta de docs/help/tooltips/self-service (≥4 cenários)

Cliente não tem "como descobrir sozinho" — depende de canal humano (AM/comercial):

- Sem tooltips/descrições por permissão (P2-4.G2)
- Sem help contextual no card de invoice (P2-5.G4)
- Sem tela self-service de edição de e-mails de invoice pós-onboarding (P2-5.G3)
- Sem botão "Baixar PDF do termo" pra consultar com jurídico (P4-4 G4.1)
- Sem "Meu perfil → Termos aceitos" pós-aceite (P4-4 G4.2)
- Sem TOC/highlight de cláusulas críticas no termo (P4-4 G4.3)
- Sem cópia em PDF do termo entregue ao usuário (P4-4)
- E-mail "principal" de invoice é o do responsável e não é editável/removível (P3-2 G7)
- Sem comportamento documentado de envio de invoice (todas vs filtradas) (P2-5.G1)

**Gaps:** P2-4.G2, P2-5 (todos), P4-4 (todos), G7 (P3-2) — **10 gaps · 3 P0**

**Severidade agregada:** P1 (degrada autonomia, mas não bloqueia onboarding)

---

## Resumo agregado dos gaps únicos (após desduplicação por cluster)

| Root Cause | Cluster | # gaps | P0 | P1 | P2 |
|---|---|---:|---:|---:|---:|
| RC1 | Wireframes silenciosos (async/mobile/empty) | 13 | 8 | 5 | 0 |
| RC2 | Strict-first validation enterprise | 5 | 4 | 1 | 0 |
| RC3 | Inflexibilidade temporal hardcoded | 8 | 4 | 3 | 1 |
| RC4 | Multi-org como técnica vs UX/governança | 18 | 9 | 8 | 1 |
| RC5 | Compliance LGPD/BACEN/SOC2 | 18 | 11 | 6 | 1 |
| RC6 | Hierarquia visual Implementação vs Plano + scanner SMB | 12 | 4 | 6 | 2 |
| RC7 | Funções SaaS-coded sem help | 9 | 3 | 5 | 1 |
| RC8 | Descontinuidade cross-story | 7 | 4 | 3 | 0 |
| RC9 | Botões informativos sem fallback robusto | 9 | 5 | 4 | 0 |
| RC10 | Audit trail individual, não cross-org | 5 | 4 | 1 | 0 |
| RC11 | Recovery operacional incompleto | 8 | 4 | 4 | 0 |
| RC12 | Docs/help/tooltips/self-service | 10 | 3 | 6 | 1 |
| **Total único (clusters)** | | **122** | **63** | **52** | **7** |

> Diferença entre brutos (108) e únicos (122) vem de gaps que aparecem em múltiplos clusters (um mesmo gap pode estrurar 2 clusters — ex: P5-1-C cobre RC4 e RC8). O número que importa é o de gaps únicos: ~80-90 gaps reais após desduplicação total.

---

## Padrão sistêmico crítico (meta-pattern)

> **Os 12 root causes podem ser sintetizados em 3 macro-tensões estruturais do produto:**

### Macro 1 — "Caminho feliz síncrono single-tenant" vs realidade enterprise async/multi-org

Wireframes desenham 1 usuário, 1 org, 1 fluxo, 1 vez. Realidade enterprise é multi-aba + multi-org + multi-sessão + procurement lento + estados async + recovery operacional.

**Cluster:** RC1 + RC4 + RC8 + RC11 = ~46 gaps · 25 P0

### Macro 2 — "Strict + rigid + invisible" como princípio de validação enterprise

Validação strict (regex, equality, TTL), feedback invisível (popups bloqueados, refresh derrubando state, alias rejeitado silenciosamente), tempos rígidos (7d/D+3 hardcoded).

**Cluster:** RC2 + RC3 + RC9 = ~22 gaps · 13 P0

### Macro 3 — "Compliance + governança como pendência" vs realidade B2B regulada

Audit trail é por user×org isolado, compliance regulatória aparece como pendência (não AC), funções padrão são SaaS-coded sem contexto, permissões sem segregação BACEN.

**Cluster:** RC5 + RC7 + RC10 + RC12 = ~42 gaps · 21 P0

---

## Verdict por perfil

| Perfil | Status | P0s | Veredicto |
|---|---|---:|---|
| P1 SaaS médio (Fyntra) | ❌ Quebrou | 6 | Adoption viável com correções P0 (RC2, RC8, RC1) |
| P2 Varejo familiar | ❌ Quebrou | 9 | Adoption frágil — RC6, RC9, RC11 críticos |
| P3 Fintech regulada | ❌ Quebrou | 6 | **FORA DO MVP** sem RC5 endereçada (recomendado adiar) |
| P4 Edtech fundador | ⚠ Com dor | 4 | Adoption viável com correções RC1, RC6, RC11 |
| P5 Grupo multi-org | ❌ Quebrou | 6 | **FORA DO MVP** sem RC4+RC10 endereçada (ou aceitar perda de holdings) |
| P6 Logística terceirizada | ❌ Quebrou | 9 | RC3 (inflexibilidade temporal) é blocker — endereçar antes de prospectar enterprise |

**Conclusão:** SUT atende **P1 + P4** (SaaS médio + Edtech fundador) com correções factíveis. **P2 + P6** entram com correções mais profundas. **P3 + P5** exigem novas stories dedicadas e ficam fora do MVP atual.
