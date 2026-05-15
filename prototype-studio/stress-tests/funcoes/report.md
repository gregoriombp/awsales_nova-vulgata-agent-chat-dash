# Stress Test — Catálogo de Funções Padrão (Story 2 v3.2)

**Data:** 2026-05-12
**Executor:** PG via /pg-stress-test
**SUT:** Cenários 24.1-24.6 da Story 2 (`stories/team-funcoes-config.md`) — 6 funções padrão tenant + 5 internas AwSales
**Modo:** completo (5 agentes paralelos · 11 personas · triple-lens 🔧⚖️🎯 · ~90 min)
**Output:** este relatório + `stress-tests/funcoes/scenarios-and-fixes/scenarios/agent-f1..f5*.md` + `stress-tests/funcoes/scenarios-and-fixes/fix-backlog.md`

---

## 1. Sumário executivo

**91 gaps identificados** (5 agentes × 11 personas adversárias) distribuídos em **8 clusters por root cause**:

| # | P0 | P1 | P2 | Total | Cluster (root cause) |
|---|---|---|---|---|---|
| **RC1** | 3 | 4 | 2 | 9 | **Funções padrão faltantes** — Financeiro dedicado · Integrador Técnico · DPO Read-Only / Auditor externo |
| **RC2** | 6 | 3 | 1 | 10 | **TTL/temporalidade de acesso ausente** — externos sem expiração · cobertura AM · Playbooker offboarding · sessão privileged |
| **RC3** | 4 | 3 | 1 | 8 | **Workflow de aprovação inexistente** — `campaign:approve` sem feature · sem inbox · sem threshold financeiro · sem 4-eyes |
| **RC4** | 7 | 4 | 2 | 13 | **Audit não cliente-facing / incompleto** — falta tela "Acessos AwSales na minha org" · granularidade leitura vs escrita · admin-api bypass |
| **RC5** | 3 | 2 | 1 | 6 | **Ownership de objetos ambíguo** — "editar próprios" sem `agent_owner_id` · escopo de campanha indefinido |
| **RC6** | 4 | 3 | 0 | 7 | **UX de contexto multi-org frágil** — modal ⚡ sem nome da org · troca não-sticky · disparo cross-org acidental |
| **RC7** | 3 | 1 | 0 | 4 | **Justificativa/motivo obrigatório assimétrico** — Super Admin sem freio análogo ao AM · canal de instrução não capturado |
| **RC8** | 3 | 2 | 1 | 6 | **Governance de export/exfiltração** — sem finalidade+DPA · LGPD Art. 42/44 falha |
| | **33** | **22** | **8** | **63** | (28 marcados "fora MVP/AC1/AC2") |

> 📌 **Veredito:** o catálogo **não está pronto pra GA Enterprise** — falham C1 (cobertura 95%+ dos perfis), C7 (audit cliente-visível) e C4 (segregação de funções internas) em pelo menos 2 cenários cada. Onda 1 obrigatória antes de qualquer cliente enterprise (Hospital Care, Mútua Saúde, Itaú) entrar.

> 📌 **Validação do palpite do PG:** "geralmente tem alguém do financeiro" está **confirmado em 3 agentes diferentes** (F1 contador, F1 CFO, F4 AM) e é o gap mais óbvio. Função `org-financeiro` deve entrar no seed.

---

## 2. Personas testadas

| # | Persona · Empresa | Agente | Veredito |
|---|---|---|---|
| F1 | Carlos Tavares · TPF Contábil (contador externo da Magalu) | F1-FinCompliance | ❌ Falha — sem função padrão coerente |
| F2 | Mariana Silva · CFO Quinto Andar (R$ 80MM ARR) | F1-FinCompliance | ❌ Falha — Admin overkill, Manager curto |
| F3 | Rodrigo Andrade · Dev freelance Itaú (60 dias) | F2-Operacional | ❌ Falha — vaza PII ou perde Integration Hub |
| F4 | Mariana Costa · SDR Sênior Wise Up | F2-Operacional | ⚠️ Parcial — `agent:edit_prompt` ambíguo |
| F5 | Henrique Borges · Gerente operação Hospital Care | F2-Operacional | ❌ Falha — `campaign:approve` sem inbox/workflow |
| F6 | Patrícia Reis · Auditora LGPD Lefosse Cyber (Mútua Saúde) | F1-FinCompliance | ❌ Falha — DPO é cargo formal Art. 41, não cabe |
| F7 | José Pereira · Holding 5 CNPJs (Grupo Pereira) | F3-MultiOrg | ⚠️ Out-of-scope mas UX frágil sem mitigação |
| F8 | Larissa · Agência Mistura (8 orgs simultâneas) | F3-MultiOrg | ❌ Falha — disparo cross-org acidental R$ 1.840 |
| F9 | Bruno Costa · AM 50 orgs (segunda de fogo) | F4-AM/Playbooker | ❌ Falha — toggle sticky, sem cobertura |
| F10 | Lucas Almeida · Playbooker pós-Saraiva | F4-AM/Playbooker | ❌ Falha — desligamento automático sem mecanismo |
| F11 | Marcelo Marra · Super Admin (4 incidentes 18 meses) | F5-SuperAdmin | ❌ **Falha crítica** — não defensável em auditoria ANPD/SOC 2 |

---

## 3. Gaps por cluster (root cause)

### 🌊 RC1 — Funções padrão faltantes (9 gaps · 3 P0)

**Root cause:** o seed de 6 funções tenant otimiza pro "núcleo do produto" (operação de IA) mas ignora **perfis de fronteira** (financeiro segregado, técnico sem acesso a dados, auditor regulado externo). Resultado: toda org enterprise cai em função custom obrigatória.

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC1.1** ⭐ | F1 (contador) · F2 (CFO) · F9 (AM) | **P0** | Falta função `org-financeiro` — Manager curto (não troca cartão), Admin overkill (vê tudo operacional). Cliente enterprise sempre tem CFO/contador separado. |
| **RC1.2** ⭐ | F3 (dev Itaú) | **P0** | Falta função `org-integrator` — Operator vaza PII de conversa/lead, Manager vaza Financeiro, Analyst não conecta integração. Cliente que terceiriza integração não tem onde colocar o dev. |
| **RC1.3** ⭐ | F6 (auditora LGPD) | **P0** | Falta função `org-auditor-externo` (ou `org-dpo-read-only`) — DPO da matriz revoga consentimento e aplica Legal Hold (cargo formal LGPD Art. 41). Auditor externo é leitura + export, sem mandato pra agir. Atribuir DPO padrão a auditor é **irregularidade regulatória**. |
| RC1.4 | F5 (Hospital Care) | P1 | Coordenador entre Manager e Operator — gere times de operadores mas não aprova campanhas (cabe ao Manager). Hoje Hospital Care vai escalar tudo pra Henrique. |
| RC1.5 | F4 (SDR Wise Up) | P1 | "SDR sênior com edição de prompts dos próprios agentes" — Operator atual genérico. Permissão "Editar próprios" não tem ownership definido (ver RC5). |
| RC1.6 | F1 (CFO Quinto Andar) | P1 | "Read-only com Dashboard de gasto consolidado por campanha" — Analyst cobre técnico (Cortex) mas falta perfil financeiro de leitura. |
| RC1.7 | F11 (Marcelo) | P1 | **Super Admin interno** é função única — não há "Super Admin · break-glass" com aprovação 4-olhos pra ações críticas. |
| RC1.8 | F4 (AM Bruno) | P2 | "AM Júnior" / "AM trainee" sem permissão de Legal Hold cross-org — não previsto. |
| RC1.9 | F11 (incidente C) | P2 | "AM substituto temporário" pra cobertura férias/licença — ver RC2.3. |

### 🌊 RC2 — TTL/temporalidade de acesso ausente (10 gaps · 6 P0)

**Root cause:** o conceito de `due_date` existe **só pra Playbooker interno** (Cenário 24.5). Para todos os outros casos (contador externo 3 meses, dev freelance 60 dias, AM substituto, sessão privileged do Super Admin), não há expiração automática. Acesso "perpétuo até alguém lembrar de revogar".

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC2.1** ⭐ | F1 (contador) · F3 (dev) · F6 (auditora) | **P0** | Externos sem `access_expires_at` — convite manual deve aceitar TTL (3 meses, 60 dias, 6 meses) com revogação automática + e-mail de aviso D-7 D-1 ao Admin. |
| **RC2.2** ⭐ | F4 (AM Bruno) | **P0** | Toggle "ver todas as orgs" sticky entre sessões — contamina ações posteriores e gera erro em org alheia. Deve resetar a cada sessão (login) ou ter timeout 30 min. |
| **RC2.3** ⭐ | F4 (AM Bruno) | **P0** | Sem cobertura temporária de AM — único caminho é reatribuição definitiva, que polui audit do cliente. Falta `am.coverage_assigned` (TTL ≤ retorno do titular) distinto de `account_manager_changed`. |
| **RC2.4** ⭐ | F4 (Lucas Playbooker) | **P0** | Desligamento automático na `due_date` não tem mecanismo spec'ado — scheduler? hook? evento? timezone? SLO? "Automático" é prosa sem implementação. |
| **RC2.5** ⭐ | F4 (Lucas Playbooker) | **P0** | Re-atribuição pós-due_date sem aprovação do cliente — Playbooker pode reaparecer "do nada" no audit do tenant. Cliente precisa **aprovar** re-entrada via Admin notification + opt-in. |
| **RC2.6** ⭐ | F11 (Marcelo) | **P0** | Sessão privileged do Super Admin sem timeout curto — login fica ativo 8h+. Deve exigir re-auth a cada ação cross-org + timeout 30 min de idle. |
| RC2.7 | F4 (Bruno transferido) | P1 | "Próxima sessão" indefinido pra revogar AM transferido — janela de 8h+ de acesso a orgs que não são mais da carteira = exfiltração legítima. Substituir por cache RBAC com TTL ≤ 60s. |
| RC2.8 | F1 (contador) | P1 | Aviso D-7 D-1 ao Admin antes da expiração — UX preventiva pra renovar ou desligar com tranquilidade. |
| RC2.9 | F4 (Lucas demitido) | P1 | Audit retém nome de ex-funcionário interno indefinidamente — pseudonimizar em audit do cliente após 30d da demissão (LGPD aplicável ao ex-empregado). |
| RC2.10 | F11 | P2 | Sessão privileged regional (BR vs US) com janelas diferentes. |

### 🌊 RC3 — Workflow de aprovação inexistente (8 gaps · 4 P0)

**Root cause:** o catálogo lista permissões `campaign:approve`, `agent:publish`, mas **não desenha o workflow** subjacente (quem submete, inbox de pendências, SLA, audit do aprovador). Aprovação é citada como permissão mas o resto fica implícito.

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC3.1** ⭐ | F5 (Henrique Hospital) · F2 (CFO Mariana) | **P0** | `campaign:approve` é permissão sem feature — quem submete? Onde aparece o pending? Audit do aprovador? SLA D-1? Workflow inteiro está implícito. |
| **RC3.2** ⭐ | F5 (Henrique) | **P0** | Manager sem inbox de aprovações pendentes — backlog vaza pro Slack/WhatsApp. Tela "Pendências de aprovação" obrigatória em Studio. |
| **RC3.3** ⭐ | F1 (CFO Mariana) | **P0** | Sem gate de aprovação financeira por threshold (4-eyes SOX-like) — disparo > R$ 50k deveria exigir aprovação extra do CFO. `campaign:approve` é binário, não condicional a valor. |
| **RC3.4** ⭐ | F11 (Marcelo lendo PII) | **P0** | Sem 4-olhos pra leitura de PII em produção pelo Super Admin — Marcelo leu 12 conversas com PII sem aprovação extra. SOC 2 CC6.1 falha. |
| RC3.5 | F5 (Hospital regulada) | P1 | Aprovação de versão de agente em vertical regulada — `agent:publish` precisa workflow paralelo ao `campaign:approve` (mesmo padrão). |
| RC3.6 | F2 (CFO Quinto Andar) | P1 | Aprovação financeira retroativa (auditoria) — CFO quer ver lista de disparos aprovados por ele com filtros. |
| RC3.7 | F5 | P1 | SLA de aprovação como notificação — D-2 D-1 pra evitar bloqueio de campanha urgente. |
| RC3.8 | F1 | P2 | Pre-approval de orçamento (Manager pré-autoriza R$ X/mês pra campanha, dispara dentro do envelope sem nova aprovação). |

### 🌊 RC4 — Audit não cliente-facing / incompleto (13 gaps · 7 P0)

**Root cause:** Cenário 24.6 **promete** "toda ação interna aparece no audit trail da org cliente" mas **não entrega** — não há tela cliente-facing, granularidade leitura vs escrita está indefinida, admin-api pode bypassar UI, logs internos podem ser editados pelo Super Admin.

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC4.1** ⭐ | F11 (Marcelo) · F4 (Lucas) | **P0** | **Tela cliente-facing "Acessos AwSales na minha organização"** não existe — cliente Admin não tem onde ver lista de incursões internas, granularidade, período, exportável. Cenário 24.6 promete sem entregar. |
| **RC4.2** ⭐ | F11 (incidente B) | **P0** | Granularidade leitura vs escrita ausente — spec não distingue "acessou módulo Conversas" de "leu CPF de Maria Silva". Quebra LGPD Art. 18 IV (titular querendo saber quem viu seu dado). |
| **RC4.3** ⭐ | F11 (incidente A) | **P0** | Admin-api pode bypassar audit do tenant — operações via API direta (sem UI) podem não propagar pro audit do cliente. Ambiguidade no spec. |
| **RC4.4** ⭐ | F4 (L2/Eng on-call) | **P0** | Reads de Suporte L2 / Eng. On-call geram audit? Spec ambígua. LGPD considera leitura como tratamento — decisão estrutural pendente. |
| **RC4.5** ⭐ | F11 (incidente D) | **P0** | Canal de instrução do controlador não capturado — Marcelo executa ação IAM do cliente por WhatsApp do CEO sem registrar referência formal. LGPD Art. 39 (operador segue instruções **documentadas** do controlador). |
| **RC4.6** ⭐ | F11 (logs editáveis) | **P0** | Logs editáveis pelo Super Admin (`PATCH /internal_logs`) — ISO 27001 A.12.4.2 + integridade probatória falham. Audit deve ser WORM (write-once-read-many). |
| **RC4.7** ⭐ | F11 | **P0** | Cliente não tem "botão questionar acesso" — Admin Magalu vê Marcelo no audit em 16/05, não tem como contestar formalmente, abrir DPO request, etc. |
| RC4.8 | F4 (Bruno cross-carteira) | P1 | Audit cross-carteira do AM mostra "tipo de acesso" (ação, leitura, write) — Cenário 24.4 só registra "toggle ativado". |
| RC4.9 | F1 (export CSV) | P1 | Hash SHA-256 do export CSV documentado mas integridade contínua (chain) não — exportes consecutivos devem encadear hash. |
| RC4.10 | F11 | P1 | Período de retenção do audit interno (Super Admin acessos) deveria ser **20+ anos** (matriz contratual + judicial), não os 5 anos padrão LGPD. |
| RC4.11 | F10 | P1 | Notificação proativa pro cliente Admin quando interno age — push/e-mail no momento da ação, não só audit passivo. |
| RC4.12 | F11 | P2 | Acesso fora horário comercial (incidente A 23h42) — flag visual no audit "outside hours". |
| RC4.13 | F11 | P2 | Rate-limit de leitura de PII pelo Super Admin — N PIIs/hora alerta automaticamente. |

### 🌊 RC5 — Ownership de objetos ambíguo (6 gaps · 3 P0)

**Root cause:** matriz Cenário 24.2 cita "Editar prompts (próprios)" pra Operator mas **não define ownership** — quem é "próprio"? Quem criou o agente? Quem foi atribuído? Mesma ambiguidade vale pra campanha e dispatch.

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC5.1** ⭐ | F2 (SDR Mariana) | **P0** | "Editar prompts (próprios)" ambíguo — sem conceito explícito de `agent_owner_id` no modelo. Operator pode editar agente que o Admin criou? Indefinido. |
| **RC5.2** ⭐ | F2 (Operator dispatch) | **P0** | Operator com `dispatch:schedule` pode disparar campanha criada por outro Operator? Escopo de campanha indefinido. |
| **RC5.3** ⭐ | F4 (Manager Hospital) | **P0** | Manager aprova campanha de outro Manager (cross-team)? Vertical regulada (Hospital) exige segregação por especialidade médica. |
| RC5.4 | F8 (agência Larissa) | P1 | Larissa edita prompt do agente da Phoenix mas estava logada na org do bar — `agent_owner_id` por org evita cross-contamination. |
| RC5.5 | F4 (SDR) | P1 | "Próprio" vs "do time" — SDR sênior gere 8 SDRs. Pode editar prompt do agente de outro SDR do mesmo time? |
| RC5.6 | F2 (Operator Wise Up) | P2 | Histórico de edição de prompt mostra quem editou o quê — `agent_edit_history` faltando. |

### 🌊 RC6 — UX de contexto multi-org frágil (7 gaps · 4 P0)

**Root cause:** anti-claims AC1 (holding) e AC2 (agência) declaram multi-org consolidada fora de escopo, **mas a UX atual de troca de org é frágil** — modal de confirmação não mostra qual org, troca não reseta state crítico, disparos cross-org acidentais possíveis.

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC6.1** ⭐ | F3 (Larissa agência) | **P0** | Modal de confirmação ⚡ não exibe nome da org — facilita disparo cross-org acidental. Modal deve mostrar org com cor primária + fonte ≥18pt. |
| **RC6.2** ⭐ | F3 (Larissa) | **P0** | `agent:edit_prompt` não está marcado como ⚡ no Cenário 24.1 — cross-contaminação de prompts entre orgs sem confirmação extra. |
| **RC6.3** ⭐ | F3 (Larissa) | **P0** | Sessão de troca de org não reseta state — abas/drafts/filtros podem migrar pra org errada. Hard reset obrigatório ao trocar. |
| **RC6.4** ⭐ | F7 (José Pereira) | **P0** | Disparo cross-org acidental documentado (R$ 1.840 + 312 opt-outs) — não há trava preventiva. Modal ⚡ + cor da org + dupla confirmação obrigatórias. |
| RC6.5 | F3 (José) | P1 | Org color tag persistente (header + breadcrumb + theme-color do navegador) — visual cue contínuo. |
| RC6.6 | F3 (Larissa) | P1 | Histórico de orgs recentemente acessadas no seletor — reduz erro de seleção. |
| RC6.7 | F11 | P1 | Quando Super Admin entra numa org cliente, banner sticky vermelho durante toda a sessão indicando contexto. |

### 🌊 RC7 — Justificativa/motivo obrigatório assimétrico (4 gaps · 3 P0)

**Root cause:** Cenário 24.4 exige **motivo obrigatório** pro AM ativar toggle cross-carteira, mas o **Super Admin (poder maior) não tem freio análogo**. Inversão clássica: quem pode mais é menos auditado.

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC7.1** ⭐ | F11 (Marcelo) | **P0** | Super Admin sem campo "motivo" obrigatório pra entrar em org cliente — AM tem isso pro toggle cross-carteira. Inversão de controle. |
| **RC7.2** ⭐ | F11 (incidente C) | **P0** | Canal de instrução do controlador não capturado — quando Super Admin age "em nome do cliente" (WhatsApp do CEO), deve registrar canal + ID da instrução. LGPD Art. 39. |
| **RC7.3** ⭐ | F4 (Bruno toggle) | **P0** | Motivo do toggle cross-carteira é texto livre — deve ser categorias estruturadas (Cobertura férias / Substituição definitiva / Investigação / Treinamento) pra analytics. |
| RC7.4 | F11 | P1 | Toggle "modo break-glass" do Super Admin — uso só com aprovação 4-olhos pré-registrada (2º Super Admin autoriza). |

### 🌊 RC8 — Governance de export/exfiltração (6 gaps · 3 P0)

**Root cause:** modal LGPD documentado (Story 3 Cenário 16) é **avisinho passivo**, não gate de governança. Export CSV/PDF sai sem registro de finalidade, destinação ou DPA versionado. LGPD Art. 42/44 cobre **operador** com responsabilidade compartilhada.

| Gap | Persona | Severidade | Descrição |
|---|---|---|---|
| **RC8.1** ⭐ | F1 (auditora) · F11 (Marcelo) | **P0** | Export CSV/PDF não exige finalidade obrigatória + destinação + DPA versionado — modal LGPD é informativo, não gate. Cliente exporta e dados saem sem cadeia de custódia. |
| **RC8.2** ⭐ | F1 (Carlos contador) | **P0** | Export pra Receita Federal precisa metadata diferente (CNPJ destino, número de processo) — não existe template por finalidade. |
| **RC8.3** ⭐ | F11 (incidente B) | **P0** | Super Admin "exportando" dados pra debug (CSV de 12 conversas com PII via admin-api) — sem gate de finalidade, sem audit cliente-visível. |
| RC8.4 | F8 (agência export 30 orgs) | P1 | Agência exportando dados de 30 clientes — cada export deveria ter consentimento explícito do Admin do cliente. |
| RC8.5 | F1 (DPA versionado) | P1 | DPA AwSales × Cliente versionado — export anexa hash do DPA vigente na data. |
| RC8.6 | F1 | P2 | Marca d'água "EXPORTADO POR {nome} EM {data} - SOB DPA v{X}" em todos os PDFs. |

---

## 4. Walkthroughs detalhados

Cada agente produziu um relatório com walkthroughs beat-by-beat:

- [agent-f1-financeiro-compliance.md](stress-tests/funcoes/scenarios-and-fixes/scenarios/agent-f1-financeiro-compliance.md) — F1 Contador · F2 CFO · F6 Auditora LGPD
- [agent-f2-operacional.md](stress-tests/funcoes/scenarios-and-fixes/scenarios/agent-f2-operacional.md) — F3 Dev · F4 SDR · F5 Gerente operação
- [agent-f3-multi-org.md](stress-tests/funcoes/scenarios-and-fixes/scenarios/agent-f3-multi-org.md) — F7 Holding · F8 Agência
- [agent-f4-am-playbooker.md](stress-tests/funcoes/scenarios-and-fixes/scenarios/agent-f4-am-playbooker.md) — F9 AM 50 orgs · F10 Playbooker pós-due_date
- [agent-f5-super-admin.md](stress-tests/funcoes/scenarios-and-fixes/scenarios/agent-f5-super-admin.md) — F11 Super Admin (4 incidentes 18 meses)

---

## 5. Anti-claims revisitados

| Anti-claim | Status pós stress test |
|---|---|
| **AC1** — Holding multi-org consolidada **NÃO é gap** | ✅ Mantido — mas RC6 (UX troca de org) precisa virar fix da Onda 1 |
| **AC2** — Agência multi-conta consolidada **NÃO é gap** | ✅ Mantido — mas RC6.1-RC6.4 obrigatórios (modal ⚡ com nome da org) |
| **AC3** — Fintech BACEN / saúde HIPAA fora desta story | ✅ Mantido — vertical regulada (Hospital Care F5) ainda valida workflow universal de aprovação (RC3) |
| **AC4** — Customização cross-org não permitida pelo cliente | ✅ Mantido |
| **AC5** — Gerenciamento de Super Admin/Eng via UI do cliente fora | ✅ Mantido — mas **tela cliente-facing "Acessos AwSales"** (RC4.1) é obrigatória pra cliente VER o que internos fizeram |

---

## 6. Veredito final

**O catálogo da Story 2 v3.2 não está pronto pra GA Enterprise.** Os clusters RC1 (funções faltantes), RC4 (audit não cliente-facing) e RC7 (controle assimétrico do Super Admin) constituem **risco regulatório alto** — auditoria ANPD/SOC 2/ISO 27001 levaria a achados.

Bloqueadores de GA Enterprise (Onda 1 obrigatória):
1. **3 funções padrão novas** (`org-financeiro`, `org-integrator`, `org-auditor-externo`)
2. **TTL/access_expires_at** pra externos + cobertura temporária de AM + scheduler de desligamento Playbooker
3. **Workflow de aprovação** (`campaign:approve` com inbox + SLA + 4-eyes financeiro)
4. **Audit cliente-facing** ("Acessos AwSales na minha org" + granularidade + WORM)
5. **Justificativa obrigatória pro Super Admin** (paridade com AM)
6. **Modal ⚡ com nome da org + cor + dupla confirmação** (mitigação multi-org)

Fix backlog detalhado em [`stress-tests/funcoes/scenarios-and-fixes/fix-backlog.md`](stress-tests/funcoes/scenarios-and-fixes/fix-backlog.md).

---

## Changelog

- **2026-05-12 (v1)** — Versão inicial. 5 agentes paralelos · 11 personas · 91 gaps · 8 clusters · veredito GA bloqueado.
