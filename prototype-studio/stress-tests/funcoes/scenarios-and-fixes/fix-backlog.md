# Fix Backlog — Stress Test Funções Padrão 2026-05-12

> **Princípio:** cada fix **substitui ou completa** algo na Story 2 v3.2 — não é gold-plating. Cada item endereça **≥2 gaps em ≥2 personas** (validação cross-scenario).

---

## Estratégia em 3 ondas

| Onda | Objetivo | Total SP | Duração | Bloqueador de... |
|---|---|---|---|---|
| **🌊 Onda 1 — Hardening pré-GA Enterprise** | Endereçar P0 críticos antes de cliente enterprise entrar | ~40 SP | 3 semanas | GA Enterprise (Hospital Care, Mútua Saúde, Itaú) |
| **🌊 Onda 2 — Refino UX/Workflow** | Polir workflows, UX multi-org, granularidade audit | ~30 SP | 2 semanas | Escala (50+ orgs cliente) |
| **🌊 Onda 3 — Story Enterprise Compliance Pack** | Out-of-scope da Story 2 (holding/SIEM/HIPAA) | Story dedicada ~50 SP | Pós-MVP | Verticais reguladas (fintech BACEN, saúde HIPAA) |

---

## 🌊 ONDA 1 — Hardening pré-GA Enterprise (~40 SP · 3 semanas)

### F1.1 (P0 · 5 SP) — 3 funções padrão novas no seed

**Substitui:** `org-admin`, `org-manager`, `org-operator`, `org-analyst`, `org-viewer`, `org-dpo` (6 atuais) → **9 funções no seed**.

**Spec:**

**Nova função `org-financeiro`** — CFO/contador interno · contador externo (com TTL)
- ✓ Financeiro · Visualizar / Pagar / Cupom / Audit Trail + Export CSV
- ✓ Dashboard · Visualizar gasto consolidado por campanha
- ✓ Contrato · Visualizar
- — Agentes / Conversas / Leads / Privacy (nenhum)
- Pode receber TTL via F1.2 (contador externo 3 meses)

**Nova função `org-integrator`** — Dev/freelance técnico
- ✓ Integrações · Listar / Conectar / Testar (sem credentials read)
- ✓ Playground · Acessar / Simular SEM cobrar (modo sandbox)
- ✓ Notificações · Visualizar histórico
- — Conversas / Leads / Financeiro / PII (nenhum)
- ⚡ "Obter credenciais" continua restrito ao Admin

**Nova função `org-auditor-externo`** — Auditor LGPD / SOC / Compliance externo (com TTL obrigatório)
- ✓ Privacy · Visualizar audit / PII / consentimentos / DSARs (LEITURA)
- ✓ Financeiro · Audit Trail · Visualizar + Exportar CSV
- ✓ Conversas · Visualizar (com tag "auditor externo" no audit)
- — Privacy · DSAR write / Legal Hold / Revogar consentimento (DPO formal só)
- — Agentes / Integrações / IAM (nenhum)
- TTL obrigatório no convite (6 meses padrão, máx 24 meses)

**Endereça:** RC1.1 + RC1.2 + RC1.3 (3 gaps P0)
**Origem:** F1 Contador · F2 CFO · F3 Dev Itaú · F6 Auditora Lefosse

---

### F1.2 (P0 · 5 SP) — `access_expires_at` em todos os convites externos

**Substitui:** convite sem expiração → acesso perpétuo até alguém revogar.

**Spec:**
- Campo **`access_expires_at`** no schema de Invitation + Membership (DATETIME)
- UI de convite: dropdown "Acesso até" com presets (30 dias / 90 dias / 6 meses / 1 ano / Indefinido)
- **Padrão por função:** `org-auditor-externo` força preset ≤ 24 meses; `org-integrator` força ≤ 12 meses; demais defaultam "Indefinido" (interno).
- Scheduler diário roda revogação automática: membership.status = INACTIVE quando `access_expires_at < now()`, evento `membership.auto_expired` registrado.
- E-mail de aviso pro Admin do cliente em D-7 e D-1 antes da expiração com CTA "Renovar acesso" ou "Confirmar desligamento".
- Audit do cliente: `membership.expired` aparece como evento normal.

**Endereça:** RC2.1 (P0) + RC2.8 (P1)
**Origem:** F1 Carlos contador (3 meses) · F3 Rodrigo dev (60 dias) · F6 Patrícia auditora (6 meses)

---

### F1.3 (P0 · 6 SP) — Scheduler de desligamento de Playbooker + cobertura temporária de AM

**Substitui:** "Desligamento automático na due_date" (Cenário 24.5) era prosa sem mecanismo. Cobertura de AM não existia.

**Spec:**

**Desligamento Playbooker:**
- `playbooker_assignment` table: `(user_id, organization_id, assigned_at, due_date, status, revoked_at, revoked_reason)`
- EventBridge scheduler dispara a cada hora: `due_date <= now() AND status = 'ACTIVE'` → marca `revoked`, dispara evento `playbooker.unassigned`, revoga membership na org cliente.
- Timezone do scheduler: `America/Sao_Paulo` (UTC-3). Atrasos toleráveis: ≤ 60 min.
- Notificação proativa pro AM responsável: D-7 D-3 D-1 "Implantação X termina em N dias — confirma entrega ou solicita extensão".
- **Re-atribuição pós-due_date requer opt-in do cliente** — Admin cliente recebe notification "AM Bruno solicita re-atribuição do Playbooker Lucas pra X dias por motivo Y. Aceitar?". Sem aceite, bloqueia.

**Cobertura temporária AM:**
- Novo evento `am.coverage_assigned` (TTL ≤ retorno do titular) **distinto** de `account_manager_changed`.
- UI no `adm.awsales`: AM titular marca "férias 18/05-03/06" + escolhe substituto. Sistema cria coverage para todas as orgs da carteira.
- Substituto recebe notificações da carteira do titular durante o período.
- Cache RBAC com **TTL ≤ 60s** (em vez de "próxima sessão") garante revogação rápida quando retorna.
- Audit do cliente: `am.coverage_started` + `am.coverage_ended` (visível).

**Endereça:** RC2.3 + RC2.4 + RC2.5 + RC2.7 (4 gaps P0)
**Origem:** F4 Bruno férias · F4 Lucas pós-Saraiva

---

### F1.4 (P0 · 5 SP) — Workflow de aprovação `campaign:approve` + inbox + 4-eyes financeiro

**Substitui:** permissão `campaign:approve` listada sem feature subjacente.

**Spec:**
- Nova entidade `approval_request` com lifecycle: `PENDING → APPROVED / REJECTED / EXPIRED`
- Cada `campaign.created` em org com `campaign_requires_approval = true` (config da org) gera approval_request com `assignee = users com permissão campaign:approve`.
- **Inbox "Pendências de aprovação"** em Studio › Configurações › Pendências — lista approvals com SLA D-1, ordenado por urgência.
- **Threshold financeiro:** se `campaign.estimated_value > org.config.approval_threshold` (ex: R$ 50k), exige **2 aprovações** (Manager + Financeiro) — 4-eyes SOX-like.
- SLA: notificação D-2 D-1 D-0 ao aprovador. Após D+3, approval auto-rejected com notificação ao submitter.
- Audit: approval_request.submitted / approved / rejected / expired (visível na org).
- Mesmo padrão reusa pra `agent:publish` (workflow paralelo, vertical regulada).

**Endereça:** RC3.1 + RC3.2 + RC3.3 + RC3.5 (4 gaps P0/P1)
**Origem:** F5 Henrique Hospital · F2 Mariana CFO Quinto Andar

---

### F1.5 (P0 · 6 SP) — Tela cliente-facing "Acessos AwSales na minha organização"

**Substitui:** Cenário 24.6 prometia "toda ação interna aparece no audit trail" mas não havia tela cliente-facing.

**Spec:**
- Nova tela em Studio › Configurações › Segurança › **"Acessos AwSales na minha organização"**
- Lista cronológica de toda incursão interna na org (Super Admin / AM / Playbooker / Suporte L2 / Eng. On-call) com:
  - Timestamp
  - Função do interno + nome + e-mail
  - **Granularidade da ação:** "Acessou módulo Conversas" vs "Leu CPF de Maria Silva (lead_id #1234)" vs "Editou prompt do agente X"
  - Justificativa (campo obrigatório capturado em F1.7)
  - Canal de instrução do cliente (se aplicável)
- Filtros: período, função do interno, tipo de ação (leitura/escrita), criticidade
- Export CSV com mesma cadeia de custódia da Story 3 (modal LGPD + hash SHA-256)
- **Botão "Questionar este acesso"** — abre DSR formal (LGPD Art. 18) com ticket pro DPO AwSales
- Retenção: **20+ anos** (não os 5 anos padrão LGPD — matriz contratual + judicial)

**Endereça:** RC4.1 + RC4.2 + RC4.7 + RC4.10 (4 gaps P0/P1)
**Origem:** F11 Marcelo (4 incidentes)

---

### F1.6 (P0 · 4 SP) — Audit WORM + admin-api propaga pro audit do tenant

**Substitui:** logs editáveis pelo Super Admin (ISO 27001 A.12.4.2 falha) + admin-api podendo bypassar audit.

**Spec:**
- Audit trail (tanto interno AwSales quanto cliente-facing) virá storage **WORM** (write-once-read-many). Tecnologias candidatas: DynamoDB com condition expression `attribute_not_exists`, S3 Object Lock, Aurora com triggers `BEFORE UPDATE/DELETE` que rejeitam.
- **Toda operação via admin-api numa org cliente** propaga pro audit dessa org com `actor_type: AwSales · {função} · {nome} · via admin-api`. Sem exceção, sem flag de "silent".
- Middleware `tenantAuditPropagation` no admin-api: para cada rota que touch dados de org X, automaticamente publica evento no audit da org X via SQS.
- **Reads também geram audit** quando incursão é cross-org pelo interno (Suporte L2 lendo conversa do cliente Y). Granularidade: módulo acessado + objeto lido (ID).
- Hash chain entre eventos consecutivos (cada evento N tem `prev_event_hash` = SHA-256 do evento N-1) — auditor externo valida cadeia.

**Endereça:** RC4.3 + RC4.4 + RC4.6 + RC4.9 (4 gaps P0/P1)
**Origem:** F11 Marcelo logs editáveis · F4 reads L2/Eng

---

### F1.7 (P0 · 3 SP) — Justificativa obrigatória pro Super Admin (paridade com AM)

**Substitui:** AM tem motivo obrigatório no toggle cross-carteira (Cenário 24.4); Super Admin não tinha freio análogo.

**Spec:**
- Toda ação do Super Admin numa org cliente exige **motivo estruturado** (não texto livre):
  - **Categoria** (dropdown): Incidente técnico · Solicitação do controlador · Investigação · Treinamento · Migração · Outro
  - **Ticket/processo** (opcional, mas obrigatório se categoria = Solicitação do controlador): `whatsapp:CEO-magalu-2026-05-19` ou `linear:AWPROD-1234` ou `e-mail:msg-id-xxx`
  - **Descrição** (texto livre, 200+ chars obrigatórios)
- Sem motivo → bloqueio com modal `"Justificativa obrigatória para acesso cross-org."`
- Mesma estrutura aplica pro AM no toggle cross-carteira (refina RC7.3 — categorias estruturadas em vez de texto livre)
- **Captura do canal de instrução do controlador** (LGPD Art. 39) — quando categoria = "Solicitação do controlador", ticket vira referência legal anexada ao audit

**Endereça:** RC7.1 + RC7.2 + RC7.3 (3 gaps P0)
**Origem:** F11 incidentes B/C/D · F4 Bruno toggle

---

### F1.8 (P0 · 3 SP) — Modal ⚡ com nome da org + cor + dupla confirmação

**Substitui:** modal ⚡ documentado mas sem identificação visual de qual org está sendo afetada.

**Spec:**
- Toda ação ⚡ (Cenário 24.1) abre modal que exibe **no header**:
  - Nome da org em fonte ≥ 18pt com **cor primária da org** (org color tag persistente — F2.4)
  - Logo da org
  - Tipo de ação (ex: "Disparar campanha em massa pra 50 leads")
- **Dupla confirmação:** primeiro check "Confirmo que estou na organização **Phoenix Tech**" + segundo botão "Disparar agora"
- Mesma estrutura pra `agent:edit_prompt` (que ganhou marcação ⚡ na Story 2 v3.3)
- Ação registra no audit `confirmacao_dupla_aceita` com timestamp dos 2 cliques

**Endereça:** RC6.1 + RC6.2 + RC6.3 + RC6.4 (4 gaps P0)
**Origem:** F8 Larissa agência (R$ 1.840 + 312 opt-outs)

---

### F1.9 (P0 · 3 SP) — `agent_owner_id` + escopo de campanha

**Substitui:** "Editar prompts (próprios)" ambíguo sem definição de ownership.

**Spec:**
- Schema: `agent.owner_id` (UUID, FK user) + `agent.created_by` + `agent.org_id` — owner pode mudar via ação Admin
- "Editar prompts próprios" gate = `agent.owner_id == current_user.id`
- Idem `campaign.owner_id` — Operator com `dispatch:schedule` só dispara campanhas onde `campaign.owner_id == self OR campaign.team_id IN self.teams`
- Tela "Meus agentes" / "Minhas campanhas" filtra por ownership
- UI de admin: transferência de ownership documentada no audit

**Endereça:** RC5.1 + RC5.2 + RC5.3 (3 gaps P0)
**Origem:** F4 SDR Wise Up · F5 Manager Hospital · F8 Larissa cross-org

---

## 🌊 ONDA 2 — Refino UX/Workflow (~30 SP · 2 semanas)

### F2.1 (P1 · 4 SP) — Sessão privileged do Super Admin (re-auth + timeout)

**Substitui:** sessão do Super Admin fica ativa 8h+ sem re-auth.

**Spec:**
- Sessão privileged = sessão do Super Admin tocando org cliente
- Re-auth (2FA) obrigatório **a cada entrada em nova org** + **a cada ação ⚡**
- Idle timeout: 30 min (configurável por env, máx 60 min)
- Banner sticky vermelho durante toda a sessão privileged indicando: "Modo Operador Plataforma · Org: Magalu · Justificativa: Incidente técnico AWPROD-1234 · Encerra em 28min"
- Audit registra sessão completa (start, ações, end)

**Endereça:** RC2.6 + RC6.7
**Origem:** F11 Marcelo incidentes noturnos

---

### F2.2 (P1 · 4 SP) — Coordenador + DPO Read-Only no seed

**Substitui:** Manager curto pra Hospital Care (precisa coordenar times) · DPO atual exagerado pra leitura.

**Spec:**

**`org-coordenador`** — entre Manager e Operator
- Operator + permissões: Atendimento · Gerenciar equipes/operadores · Visualizar pendências de aprovação (sem aprovar)
- Hospital Care e similares

**`org-dpo-read-only`** — distinto do DPO formal e do `org-auditor-externo`
- Leitura completa de Privacy (audit, consentimentos, DSAR status, PII) sem escrita
- Sem TTL obrigatório (interno LGPD)

**Endereça:** RC1.4 + RC1.6
**Origem:** F5 Henrique · F1 Mariana CFO leitura

---

### F2.3 (P1 · 5 SP) — Workflow de aprovação financeira por threshold + SLA

**Substitui:** F1.4 cobre o workflow básico; F2.3 adiciona threshold financeiro e SLA refinados.

**Spec:**
- Org pode configurar `approval_threshold` (R$) — campanhas acima exigem 4-eyes (Manager + Financeiro)
- Pre-approval de orçamento mensal: Manager pré-aprova R$ X/mês pra campanha Y, dispara dentro do envelope sem nova aprovação
- Dashboard "Aprovações deste mês" no Studio (audit visual com filtros)
- SLA D-2 D-1 D-0 via Notificações (já existe canal)

**Endereça:** RC3.3 + RC3.6 + RC3.7 + RC3.8

---

### F2.4 (P1 · 4 SP) — Org color tag + histórico de orgs recentemente acessadas

**Substitui:** assimetria de identificação visual entre orgs (Larissa logada em 8).

**Spec:**
- Cada org tem `color_tag` (hex, 12 cores preset). Aplica em: header background tint, breadcrumb badge, theme-color do browser tab, modal ⚡ header
- Seletor de org no header mostra histórico das últimas 5 orgs acessadas com timestamp
- Atalho keyboard Cmd+K abre fuzzy search no seletor

**Endereça:** RC6.5 + RC6.6
**Origem:** F8 Larissa · F7 José Pereira

---

### F2.5 (P1 · 4 SP) — Granularidade leitura vs escrita no audit + rate-limit PII

**Substitui:** audit registra "acessou módulo X" mas não "leu CPF de Y".

**Spec:**
- Audit event `read_pii` granular: `{ field: 'cpf', target_lead_id: '...', actor: '...', justification_id: '...' }`
- Rate-limit: > 50 PII reads/hora pelo Super Admin dispara alerta interno + notificação proativa pros tenants afetados ("Marcelo leu 73 CPFs nas últimas 2h em sua org — investigue")
- Cliente vê isso em F1.5 (tela "Acessos AwSales")

**Endereça:** RC4.2 + RC4.13

---

### F2.6 (P1 · 4 SP) — Export com finalidade obrigatória + DPA versionado

**Substitui:** modal LGPD informativo sem gate.

**Spec:**
- Export CSV/PDF abre modal com campo **Finalidade** (dropdown: Auditoria interna / Receita Federal / DPO request / Investigação / Outro) + **Destinação** (e-mail/sistema/órgão público) + **DPA aceite** (hash do DPA vigente anexado)
- Sem finalidade → bloqueio
- PDF gerado tem marca d'água: "EXPORTADO POR {nome} EM {data} - SOB DPA v{X} - FINALIDADE: {finalidade}"
- Auditoria do export: `export.requested → export.completed` com finalidade + destinação + hash DPA

**Endereça:** RC8.1 + RC8.2 + RC8.5 + RC8.6
**Origem:** F1 Carlos Receita Federal · F11 Marcelo CSV PII

---

### F2.7 (P1 · 3 SP) — Notificação proativa pro cliente quando interno age

**Substitui:** cliente só vê interno no audit passivo (vai lá olhar) ou nunca (esquece).

**Spec:**
- Quando interno faz ação ⚡ (escrita) numa org cliente, **e-mail/in-app push** dispara pro Admin do cliente em ≤ 5 min:
  - "Marcelo Marra (Super Admin AwSales) editou o prompt do agente 'Vendas Magalu' às 23h42. Motivo: Incidente AWPROD-1234. Ver detalhes →"
- Leitura cross-org de PII também notifica (com debounce de 15 min pra agregar)
- Admin pode configurar canais (e-mail / Slack / WhatsApp) + criticidade mínima

**Endereça:** RC4.11
**Origem:** F11 Magalu descobre 16/05 sem notificação prévia

---

### F2.8 (P1 · 3 SP) — Pseudonimização de ex-funcionário interno no audit do cliente

**Substitui:** Lucas Almeida (Playbooker demitido 25/05) aparece com nome real no audit pra sempre.

**Spec:**
- Ao desligar funcionário interno (offboarding HR), trigger marca `user.offboarded_at` + após **30 dias**, audit do cliente substitui nome por `AwSales · Playbooker · ex-funcionário (pseudo: hash_8a3f)`
- Hash original preservado em cofre interno (acessível só via ordem judicial, LGPD Art. 16)
- Audit retém função + ações + timestamps (integridade probatória)

**Endereça:** RC2.9

---

### F2.9 (P1 · 3 SP) — Toggle cross-carteira AM com categorias estruturadas + reset por sessão

**Substitui:** toggle texto livre + sticky entre sessões.

**Spec:**
- Categoria do toggle: Cobertura férias / Substituição definitiva / Investigação / Treinamento / Suporte ao titular
- Toggle reseta a cada login (não sticky) — força AM re-justificar
- Dashboard analytics "Uso do toggle cross-carteira" pro head de Customer Success identificar abuso

**Endereça:** RC7.3 + RC2.2

---

## 🌊 ONDA 3 — Story Enterprise Compliance Pack (Story dedicada · ~50 SP · pós-MVP)

Out-of-scope da Story 2. Endereça AC1+AC2+AC3:

1. **Holding/Grupo Econômico** como entidade unificada (consolida MRR, dashboards cross-org)
2. **Agência multi-conta** com dashboard de performance das contas atendidas
3. **Verticais reguladas** (fintech BACEN com SIEM streaming, saúde HIPAA com NF eletrônica)
4. **DPA versionado por cliente** com auditoria contratual

Conversa com PG + Comercial pra definir prioridade pós-MVP.

---

## Resumo executivo do Fix Backlog

### Por onda

| Onda | # Fixes | Total SP | Escopo |
|---|---|---|---|
| 🌊 Onda 1 Hardening pré-GA Enterprise | 9 | 40 | Bloqueador de GA Enterprise |
| 🌊 Onda 2 Refino UX/Workflow | 9 | 34 | Refino · escala 50+ orgs |
| 🌊 Onda 3 Story Enterprise Pack | — | ~50 | Pós-MVP · Holding/Agência/Reguladas |

### Por root cause

| Root cause | Fixes Onda 1 | Fixes Onda 2 |
|---|---|---|
| RC1 Funções faltantes | F1.1 | F2.2 |
| RC2 TTL/temporalidade | F1.2 F1.3 | F2.1 F2.8 |
| RC3 Workflow aprovação | F1.4 | F2.3 |
| RC4 Audit cliente-facing | F1.5 F1.6 | F2.5 F2.7 |
| RC5 Ownership | F1.9 | — |
| RC6 UX multi-org | F1.8 | F2.4 |
| RC7 Justificativa Super Admin | F1.7 | F2.9 |
| RC8 Governance export | — | F2.6 |

### Decisões estratégicas pendentes (pro PG)

1. **GA Enterprise sem Onda 1 completa?** Recomendação: **Não** — bloqueia clientes regulados/enterprise.
2. **Onda 2 antes ou depois de domínio "Notificações"?** Recomendação: F2.7 depende do domínio Notificações já estar pronto (já está em desenvolvimento paralelo).
3. **Onda 3 prioridade Q3 ou Q4 2026?** Decisão Comercial — depende do pipeline de clientes enterprise.
4. **Audit retenção 20 anos vs 5 anos LGPD?** Decisão jurídica — recomendação Onda 1 mantém 20+ pra Super Admin actions (matriz contratual/judicial).
