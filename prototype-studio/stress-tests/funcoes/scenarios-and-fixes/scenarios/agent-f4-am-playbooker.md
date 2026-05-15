# Agent F4 — Red Team Adversarial: AM com carteira + Playbooker

**SUT:** Cenários 24.3-24.6 (Funções internas AwSales · Gestor de Conta com carteira · Playbooker · ciclo de atribuição/desligamento)
**Lentes:** 🔧 técnica · ⚖️ governança/compliance · 🎯 produto/UX
**Data:** 2026-05-12

---

## PERSONA F9 — Bruno Costa · AM AwSales · 50 orgs na carteira

**Contexto:** Bruno Costa, AM AwSales, 50 orgs na carteira (mistura SMB + Enterprise). Segunda-feira 12/05/2026, 9h05. Chega no escritório, abre `adm.awsales › Minha Carteira`. Fila de fogos:
- 3 `cancellation_request.opened` novos: **Magalu** (Enterprise, R$ 48k MRR), **Quinto Andar** (Mid, R$ 12k MRR), **Itaú Soluções** (Enterprise, R$ 65k MRR)
- 2 `retention_deadline.approaching`: **Hospital Care** (D-1, vence amanhã 13/05) + **Wise Up** (D-3, vence 15/05)
- 1 PAST_DUE há 7 dias: **Mútua Saúde** (R$ 18k em aberto desde 05/05) — sem renegociação ainda
- 1 ticket L2 escalado: **Pereira Atacado** (problema crítico, agente travando em loop)

Bruno saiu de férias programadas dia 20/05 (2 semanas). Cobertura: **Ana Souza** (AM colega, 38 orgs próprias).

---

### BEAT 1 (09:05) — Login → `adm.awsales › Minha Carteira`

**O que vê:** Dashboard "Minha Carteira (50)". Cards de métrica no topo (MRR somado R$ 1.2M, churn risk 8%, NPS 62, tickets abertos 12). Lista de 50 orgs com badges de estado.

**🔧 Gap técnico G-F9-001:** Spec não define **ordenação default** da lista. O Bruno tem 50 orgs — se ordenar por nome alfabético, "Mútua Saúde" (PAST_DUE há 7d) fica no meio da lista, "Magalu" no topo só porque começa com M. **Não há lente de urgência composta** (cancellation > retention deadline D-1 > PAST_DUE > L2 escalado). Bruno vai resolver pelo que ele lembra, não pelo que sangra mais. Severidade P0 — perdas de retenção são silenciosas.

**⚖️ Gap governança G-F9-002:** Bruno fechou a sessão na sexta-feira 09/05 com toggle `Mostrar todas as orgs da plataforma` ATIVO (estava analisando uma org da carteira da Ana). **Toggle é sticky entre sessões?** Spec não diz. Se sim → Bruno abre segunda já vendo 312 orgs, não as 50 dele. Se ele clica na primeira que aparece (Café do João — carteira da Ana), gera audit `am.cross_carteira_access` retroativo, mas Bruno achou que estava na carteira dele. **Sticky cross-carteira state = vazamento de visibilidade por inércia de UI.** Severidade P0.

**🎯 Gap UX G-F9-003:** Cards de métrica agregada (MRR somado, churn risk) são bonitos mas inacionáveis — Bruno não pode clicar em "churn risk 8%" e ver QUAIS são as 4 orgs em risco. Spec não define **drill-down** dos KPIs do header.

---

### BEAT 2 (09:08) — Notificações? E-mail? Slack?

**O que vê:** Sino de notificações in-app no header com badge "6". Abre. Lista os 6 eventos da carteira (3 cancellations + 2 retention deadlines + 1 L2).

**🔧 Gap técnico G-F9-004:** Spec só fala que "notificações automáticas chegam **só pelas orgs da carteira**" — mas **não define CANAL**. E-mail? Slack interno AwSales? Push do `adm.awsales`? Se Bruno passou o domingo de domingo de Mães longe do laptop, ele descobriu o `cancellation_request.opened` da Itaú Soluções (R$ 65k MRR) só agora — 18h depois. **Falta SLA de notificação cross-canal** (e-mail imediato + Slack ASAP + in-app sempre). Severidade P1.

**⚖️ Gap governança G-F9-005:** Não há **escalation policy** se AM não acusa recebimento da notificação em N horas. Cancellation request abandonado por 24h deveria escalar pro Super Admin ou pro AM de cobertura. Spec é silente.

**🎯 Gap UX G-F9-006:** Sino tem badge "6" mas não diferencia urgência. Um L2 ticket técnico não-urgente compete visualmente com Itaú Soluções cancelando R$ 65k. Severidade P1.

---

### BEAT 3 (09:20) — Bruno clica em "Mútua Saúde" (PAST_DUE 7d) e por engano aceita o evento errado

**O que vê:** Bruno na verdade clicou em "Mútua Saúde" mas a tela carregou lenta, ele clicou de novo, abriu **"Café do João"** (lista cross-carteira do toggle sticky). Painel da org. Bruno aceita um botão "Marcar PAST_DUE como em renegociação" achando que é o da Mútua.

**🔧 Gap técnico G-F9-007:** Toggle `cross-carteira` ativo + lista misturada + sem **indicador visual claro "esta org não é da sua carteira"** quando Bruno está dentro do detalhe da org = ação executada em org alheia. Spec 24.4 diz que toggle "gera evento de audit" mas **não define guard rails de ação** (ex: warning modal "Você não é o AM desta org. Tem certeza?"). Severidade P0.

**⚖️ Gap governança G-F9-008:** Audit `am.cross_carteira_access` registrou que Bruno entrou na Café do João — mas **a Café do João vê esse audit dela?** Spec 24.6 diz "toda ação aparece no audit trail dessa org com `actor_type: AwSales · Gestor de Conta · Bruno Costa`" — mas a Café do João tem a Ana como AM oficial. O CEO da Café do João, ao olhar o audit trail dele, vê DOIS AMs AwSales (Ana legítima + Bruno cross-carteira) e fica confuso/desconfiado. **Falta distinção visual cross-carteira no audit do cliente** (ex: tag "acesso cross-carteira justificado: <motivo>"). Severidade P0 — quebra de confiança.

**🎯 Gap UX G-F9-009:** O campo "motivo obrigatório" do toggle cross-carteira é preenchido **uma vez por sessão** ou **uma vez por acesso a org alheia**? Spec é ambígua. Se uma vez por sessão, Bruno justificou na sexta ("ver KPIs cohort enterprise") e a justificativa serve pra TODA ação cross-carteira da segunda — incluindo o erro com Café do João. Severidade P0.

---

### BEAT 4 (10:15) — Bruno tenta priorizar: Itaú vs Magalu vs Hospital Care

**O que vê:** Volta pra "Minha Carteira", desativa toggle cross-carteira. Olha 3 cancellations + 2 deadlines. Não há **playbook de retenção** com next-best-action por contexto.

**🎯 Gap UX G-F9-010:** Spec 24.4 diz que AM "recebe notificação automática em cancellation request + retention deadline" mas **não fala em assistência de priorização** (sugerir qual abordar primeiro com base em MRR × probabilidade de retenção × tempo de relacionamento). Bruno é um humano com 50 orgs — ferramenta deveria sugerir, não só listar. Severidade P2 (qualidade de produto, não bloqueante).

**🔧 Gap técnico G-F9-011:** "Retention deadline D-1 Hospital Care" não tem **timer countdown visível** na linha. Bruno pode confundir D-1 com D-3. Severidade P2.

---

### BEAT 5 (11:40) — Bruno abre férias dia 20/05 e Ana cobre

**O que vê:** Bruno vai no perfil dele, procura "Marcar ausência / cobertura temporária". **Não existe.** Único caminho pra Ana ver a carteira do Bruno é: (a) Bruno pedir pro Super Admin reatribuir todas as 50 orgs pra Ana no dia 19/05 e devolver no dia 02/06, ou (b) Ana usa toggle cross-carteira (mas perde notificações automáticas das orgs do Bruno).

**🔧 Gap técnico G-F9-012:** **Não há mecanismo de "cobertura temporária de AM"** — substituto recebe notificações da carteira de Bruno sem precisar reatribuir as orgs (que dispara evento `organization.account_manager_changed` × 50 e confunde o cliente que vê AM novo no topo da aba Team). Spec 24.4 só fala em "atribuir/transferir AM" definitivo. Severidade P0 — vacation coverage é caso universal em B2B SaaS.

**⚖️ Gap governança G-F9-013:** Se Bruno reatribui via Super Admin → orgs do Bruno veem Ana como AM na aba Team durante férias (cenário 31 dispara). Cliente acha que mudou de AM. Quando Bruno volta, troca de novo, audit cheio de `organization.account_manager_changed` ping-pong. **Não há audit "cobertura temporária" distinto de "transferência definitiva".** Severidade P1.

**🎯 Gap UX G-F9-014:** "Aba Team do cliente" mostra só **1 AM** (Cenário 31). Durante cobertura, cliente deveria ver "AM titular: Bruno · AM de cobertura (até 02/06): Ana". Spec não suporta. Severidade P1.

---

### BEAT 6 (15:30) — "AM antigo perde acesso na próxima sessão"

**O que vê:** Spec 24.4 linha 558: *"AM antigo perde acesso na próxima sessão"*. Bruno está logado em `adm.awsales` desde 9h. Sessão dele tem 8h de duração (B2B SaaS típico). Super Admin Marcelo reatribuiu 3 orgs do Bruno (não-críticas) pra Ana às 14h. Bruno continua vendo essas 3 orgs até 17h.

**🔧 Gap técnico G-F9-015:** **"Próxima sessão" é indefinido.** Em B2B SaaS de produto crítico, sessão pode durar dias com refresh token. **Spec deveria forçar invalidação imediata via session revocation** (broadcast WebSocket / poll de permissões em cada navegação / hot-reload de RBAC). Severidade P0 — janela de 8h de acesso indevido a dados de orgs que não são mais da carteira do AM.

**⚖️ Gap governança G-F9-016:** Se Bruno, nesse intervalo de 8h, exporta CSV de audit (Cenário 36) das 3 orgs reatribuídas → exfiltração legítima pelo RBAC vigente no momento. **LGPD: ele não deveria ter acesso a esses dados depois da reatribuição.** Severidade P0.

---

## PERSONA F10 — Lucas Almeida · Playbooker AwSales · Saraiva Livros

**Contexto:** Lucas Almeida, Playbooker AwSales, implementou playbook na Saraiva Livros (e-commerce, R$ 22k MRR). Cronograma:
- 15/03/2026: convidado pelo AM Bruno via `adm.awsales › Carteira › Saraiva Livros › Solicitar Playbooker`, `due_date = 30/04/2026` (45 dias).
- 15/03-25/04: configurou 8 agentes, 3 integrações (HubSpot, RD, Mailchimp), 2 KBs (catálogo + FAQ), 4 dispatches piloto.
- 28/04: entregou. Cliente aprovou via Slack.
- 30/04: due_date — deveria revogar acessos automaticamente.

---

### BEAT 1 (02/05 09:00) — Lucas tenta acessar Saraiva pós due_date

**O que vê:** Lucas abre `adm.awsales`, clica em "Saraiva Livros" no seu histórico. Tela carrega... mostra "Org não encontrada" OU mostra a org e deixa ele clicar em agentes OU mostra mensagem clara.

**🔧 Gap técnico G-F10-001:** Spec 24.5 diz "desligamento automático na due_date" mas **não define mecanismo**: scheduler? cron diário? hook que dispara à meia-noite UTC? Em qual timezone? Se cron roda 00:00 UTC e due_date é 30/04 (UTC-3 BRT), Lucas perde acesso 30/04 21:00 BRT — antes do dia "30/04" acabar do ponto de vista dele. **Pior: se job falha e ninguém monitora, Lucas continua com acesso por dias.** Severidade P0.

**🎯 Gap UX G-F10-002:** **Mensagem de erro não definida.** "Org não encontrada" é confuso (Lucas sabe que existe). Mensagem correta: *"Sua atribuição como Playbooker na Saraiva Livros expirou em 30/04. Solicite re-atribuição ao AM Bruno Costa."* Spec não exige esse texto. Severidade P1 — falha silenciosa vs comunicativa.

**⚖️ Gap governança G-F10-003:** Audit `playbooker.unassigned` foi gerado em 30/04? Saraiva CEO recebe **notificação ativa** "Playbooker desatribuído, implantação concluída" ou só fica registrado e ninguém vê? Spec é silente sobre notificação ao cliente no fim da atribuição. Severidade P1 — cliente tem que SABER que o Lucas saiu, não só ter o audit estático.

---

### BEAT 2 (15/05 16:30) — Lucas demonstra Saraiva pra lead da Pereira Atacado

**O que vê:** Lucas precisa demonstrar o playbook da Saraiva pra um prospect (Pereira Atacado). Ele tenta entrar na Saraiva. **Provavelmente não consegue** (atribuição expirou). Mas se passou ⇒ ele cria "Saraiva-demo" como agente novo às 16:40.

**🔧 Gap técnico G-F10-004:** Spec não define **modo demonstração** / **read-only assignment pós-implantação**. Realidade: Playbooker é a pessoa mais qualificada pra fazer demos comerciais — e vai sempre tentar acessar orgs anteriores. **Falta perfil "ex-Playbooker · view-only demo mode"** com escopo limitado (não cria recursos, não envia mensagens, audit explícito "demo session"). Severidade P1.

**⚖️ Gap governança G-F10-005:** Se Lucas conseguiu (por bug ou re-atribuição emergencial não-justificada) → criou agente "Saraiva-demo" na Saraiva real. **Saraiva CEO acessa audit em 16/05 e vê:** `AwSales · Playbooker · Lucas Almeida · agent.created · 15/05 16:40`. Liga revoltado pro Bruno: "por que tem um cara nosso ainda?". **Cliente NÃO pode descobrir uso comercial interno via audit trail.** Severidade P0 — quebra catastrófica de confiança.

**🎯 Gap UX G-F10-006:** Spec 24.5 garante transparência regulatória ("o cliente sempre sabe quem mexeu") — bom — mas **não exige aprovação prévia do cliente** pra qualquer re-atribuição após due_date. **Falta gate "Saraiva Admin aprova re-atribuição do Lucas por 24h pra demo"** com motivo registrado. Severidade P0.

---

### BEAT 3 (20/05 11:00) — Re-atribuição emergencial: bug crítico

**O que vê:** Saraiva reporta bug crítico (agente FAQ travando). AM Bruno solicita re-atribuição emergencial do Lucas em `Solicitar Playbooker` com `due_date = 21/05` (24h). Lucas entra na Saraiva às 11:30 pra debugar.

**🔧 Gap técnico G-F10-007:** Spec 24.5 só define **atribuição** pelo AM — não distingue **atribuição inicial** vs **re-atribuição pós-due_date**. Re-atribuição deveria ter **gate adicional**: aprovação do Admin do cliente, ou no mínimo notificação imediata ao cliente antes do acesso ativar. Spec não exige. Severidade P0.

**⚖️ Gap governança G-F10-008:** Audit `playbooker.assigned` registra a re-atribuição mas Saraiva pode estar dormindo (madrugada) — descobre só no dia seguinte. **Falta SLA de notificação push pro cliente em re-atribuição emergencial** (≤ 1h). Severidade P1.

**🎯 Gap UX G-F10-009:** Não há **distinção visual** entre Playbooker "implantação ativa" (Cenário 24.6) vs "re-atribuição emergencial 24h". Saraiva olha aba Team em 20/05 e vê Lucas reaparecido sem contexto. Severidade P1.

---

### BEAT 4 (25/05 17:00) — Lucas é desligado da AwSales

**O que vê:** RH desliga Lucas. WorkOS deactivate. Quê acontece com (a) sessões ativas dele, (b) atribuições futuras, (c) **audit histórico**?

**🔧 Gap técnico G-F10-010:** Spec não define **fluxo de offboarding de interno AwSales** (≠ offboarding de tenant). Quem revoga? Super Admin? RH tem permissão? Spec 24.4 fala em "pré-condição de offboarding do AM: todas as orgs da carteira já reatribuídas" — mas **não tem o equivalente pro Playbooker** (atribuições futuras, drafts em rascunho, agentes meio configurados). Severidade P0.

**⚖️ Gap governança G-F10-011:** Audit trail histórico das orgs onde Lucas atuou retém `actor_type: AwSales · Playbooker · Lucas Almeida` indefinidamente? **LGPD Art. 16 § único + Art. 6º X (responsabilização e prestação de contas):** dados pessoais de ex-funcionário em audits de clientes — quanto tempo? Pseudonimização após N dias? Spec é silente. Severidade P0 — não-conformidade LGPD pra empregado.

**🎯 Gap UX G-F10-012:** Saraiva, ao ver audit em 26/05, ainda vê "Lucas Almeida" — não tem indicação "ex-funcionário AwSales". Se contatar o e-mail dele, bounce. **Falta tag "[ex-funcionário]" no audit retroativo** + canal alternativo de contato (AM responsável atual). Severidade P1.

---

### BEAT 5 (26/05 10:00) — Saraiva pede DSAR LGPD: "quem da AwSales acessou meus dados nos últimos 6 meses?"

**O que vê:** Saraiva Admin abre Audit Trail Geral (Cenário 35) filtrado por `actor_type: AwSales · *`. Vê Lucas, Bruno, eventualmente outros. **Mas — Suporte L2 read-only não aparece nessa busca?** Spec 24.6 diz "toda ação aparece no audit trail" — mas **leitura é ação?** Spec 24.3 diz Suporte L2 é "read-only" e Cenário 24.6 diz "rastreabilidade sem listagem". **READS DE SUPORTE L2 ENTRAM NO AUDIT?**

**⚖️ Gap governança G-F10-013:** **Spec ambígua sobre se "view" / "read" geram evento de audit.** LGPD Art. 6º VI exige transparência — *todo acesso* a dados pessoais é tratamento. Se Suporte L2 visualizou conversas da Saraiva pra resolver ticket e não gera audit, cliente nunca sabe. Severidade P0 — gap de compliance estrutural, não só do fluxo Playbooker.

**🎯 Gap UX G-F10-014:** Filtros do audit (Cenário 35) listam `Tipo de ação: Login, Criação, Edição, Exclusão, Exportação` — **não há "Visualização" / "Acesso"**. Cliente não consegue auditar quem só leu. Severidade P1.

---

## Gap Register Consolidado

| Gap ID | Persona | Lente | Descrição curta | Severidade | Root cause hipótese |
|---|---|---|---|---|---|
| G-F9-001 | Bruno | 🎯 | Sem ordenação por urgência composta na carteira de 50 orgs | P0 | Spec não pensou em ergonomia de AM com >20 orgs |
| G-F9-002 | Bruno | ⚖️ | Toggle cross-carteira é sticky entre sessões, contamina ações seguintes | P0 | Estado de UI persistido sem expiração |
| G-F9-003 | Bruno | 🎯 | KPIs do header não têm drill-down acionável | P2 | Dashboard pensado pra leitura, não pra ação |
| G-F9-004 | Bruno | 🔧 | Canal de notificações não definido (e-mail/Slack/in-app) | P1 | Spec genérica sobre "notificação" |
| G-F9-005 | Bruno | ⚖️ | Sem escalation policy se AM não acusa cancellation em N horas | P1 | Falha de processo, não só de produto |
| G-F9-006 | Bruno | 🎯 | Sino não diferencia urgência | P1 | Notificação flat-list |
| G-F9-007 | Bruno | 🔧 | Sem guard rail "esta org não é da sua carteira" ao agir cross | P0 | Toggle só audita, não previne |
| G-F9-008 | Bruno | ⚖️ | Audit cross-carteira no cliente sem tag visual confunde — vê 2 AMs | P0 | Spec 24.6 trata cross idêntico a titular |
| G-F9-009 | Bruno | 🎯 | "Motivo obrigatório" do toggle: sessão vs ação? Justificativa única reaproveitada | P0 | Ambíguo no Cenário 24.4 |
| G-F9-010 | Bruno | 🎯 | Sem next-best-action assistido pra carteira grande | P2 | Falta de IA-assist em produto pra ops interno |
| G-F9-011 | Bruno | 🔧 | Retention deadline sem countdown visível | P2 | Visualização estática |
| G-F9-012 | Bruno | 🔧 | Sem "cobertura temporária de AM" — só reatribuição definitiva | P0 | Caso universal (férias/licença) não modelado |
| G-F9-013 | Bruno | ⚖️ | Audit ping-pong de cobertura confunde org | P1 | Falta evento "coverage_*" distinto de "transfer_*" |
| G-F9-014 | Bruno | 🎯 | Aba Team mostra 1 AM, não suporta cobertura | P1 | Cenário 31 com cardinalidade fixa |
| G-F9-015 | Bruno | 🔧 | "Próxima sessão" indefinido — sessão B2B pode durar 8h+ | P0 | Falta invalidação imediata de RBAC |
| G-F9-016 | Bruno | ⚖️ | Janela de exfiltração legítima de dados pós-reatribuição | P0 | Consequência direta de G-F9-015 |
| G-F10-001 | Lucas | 🔧 | Mecanismo de desligamento automático na due_date não spec'ado | P0 | "Acontece automaticamente" sem detalhe técnico |
| G-F10-002 | Lucas | 🎯 | Falha silenciosa vs mensagem clara "atribuição expirou" | P1 | UX de erro não definido |
| G-F10-003 | Lucas | ⚖️ | Cliente não recebe notificação ativa de fim de atribuição | P1 | Só audit estático, sem push |
| G-F10-004 | Lucas | 🔧 | Sem modo "ex-Playbooker demo view-only" | P1 | Modelo binário ativo/expirado |
| G-F10-005 | Lucas | ⚖️ | Uso comercial interno descobertível via audit do cliente | P0 | Falta de governança em uso de orgs reais pra demo |
| G-F10-006 | Lucas | 🎯 | Re-atribuição pós due_date sem aprovação do cliente | P0 | Spec 24.5 só exige aprovação do AM |
| G-F10-007 | Lucas | 🔧 | Sem distinção atribuição inicial vs re-atribuição emergencial | P0 | Mesmo evento `playbooker.assigned` |
| G-F10-008 | Lucas | ⚖️ | Sem SLA de notificação push pro cliente em re-atribuição | P1 | Notificação cliente não cross-canal |
| G-F10-009 | Lucas | 🎯 | Sem distinção visual implantação ativa vs re-atribuição 24h | P1 | Aba Team trata Playbooker monoliticamente |
| G-F10-010 | Lucas | 🔧 | Fluxo offboarding de interno AwSales não spec'ado | P0 | Cenário 24 cobre tenant, não interno |
| G-F10-011 | Lucas | ⚖️ | Nome de ex-funcionário em audit indefinidamente — LGPD pra empregado | P0 | Sem política de retenção/pseudonimização |
| G-F10-012 | Lucas | 🎯 | Cliente vê "Lucas Almeida" sem tag ex-funcionário | P1 | Audit não muda retroativo após offboarding |
| G-F10-013 | Lucas | ⚖️ | Reads de Suporte L2 não geram audit? Ambíguo | P0 | LGPD: leitura é tratamento — gap estrutural |
| G-F10-014 | Lucas | 🎯 | Filtros do audit não incluem "Visualização" | P1 | Consequência de G-F10-013 |

**Total:** 30 gaps · 16 P0 · 11 P1 · 3 P2

---

## Recomendação pra Onda 1

### Fix prioritário 1 — Audit automático com tags semânticas (mitiga G-F9-002, G-F9-007, G-F9-008, G-F10-005, G-F10-013)

**Spec adicional pro Cenário 24.6:**
- Todo evento de audit no cliente carrega tag de **contexto de origem**:
  - `actor_context: titular_da_carteira | cross_carteira | cobertura_temporaria | re_atribuicao_emergencial | demo_mode | ex_funcionario`
- Tag rendiriza com cor/ícone na UI do cliente.
- **Leituras (views) de Suporte L2 / Eng On-call DEVEM gerar evento** `org_data.viewed` com escopo do que foi visto (lista de recursos, não conteúdo).
- Filtros do Cenário 35 incluem novo tipo `Visualização` (default OFF, ON quando filtrar por `actor_type: AwSales · *`).

### Fix prioritário 2 — Substituição temporária de AM (mitiga G-F9-012, G-F9-013, G-F9-014, G-F9-015, G-F9-016)

**Novo cenário 24.4-bis — Cobertura temporária:**
- AM titular ou Super Admin marca **período de ausência** com **AM substituto**.
- Sistema move **notificações** (não vínculo da Org) pro substituto na janela.
- Substituto vê carteira do titular com badge "Cobertura de Bruno até 02/06" — sem necessidade de toggle cross-carteira.
- Aba Team do cliente mostra **"AM titular + AM de cobertura"** durante a janela.
- Eventos `am.coverage_started` / `am.coverage_ended` separados de `account_manager_changed`.
- **Invalidação imediata de RBAC** quando coverage termina (não "próxima sessão"): WebSocket broadcast OU validação por request com TTL ≤ 60s no cache de permissões.
- "Próxima sessão" deve ser substituído por **TTL ≤ 60s em todo acesso cross-org**.

### Fix prioritário 3 — Desligamento robusto de Playbooker e de funcionário (mitiga G-F10-001, G-F10-002, G-F10-006, G-F10-007, G-F10-010, G-F10-011)

**Spec adicional pro Cenário 24.5:**
- **Mecanismo:** job idempotente roda a cada 5 min, processa `due_date <= now()` pendentes; idempotência via flag no audit. Job tem **alerta de SLO** (se falha em >2 ciclos, page Eng. On-call).
- **Timezone:** `due_date` sempre em BRT (UTC-3) com cláusula explícita "fim do dia".
- **Mensagem clara** padronizada quando expira: *"Sua atribuição como Playbooker na {org} expirou em {data}. Solicite re-atribuição ao AM responsável (link pro AM)."*
- **Notificação ativa pro cliente** ao expirar: e-mail + in-app pro Admin do tenant: *"Implantação técnica concluída. Lucas Almeida finalizou a configuração em 30/04. AM responsável: Bruno Costa."*
- **Re-atribuição pós-due_date** vira evento distinto `playbooker.reassigned_after_completion` com **gate de aprovação do Admin do tenant** (default ON, override Super Admin com justificativa registrada).
- **Offboarding de funcionário interno** (novo cenário 24.7):
  - Super Admin executa via admin-api.
  - Pré-condição: atribuições ativas (AM + Playbooker) reatribuídas/encerradas.
  - WorkOS deactivate + revoke todas as sessões imediatamente.
  - Após N dias (proposto: 30d), audits do cliente pseudonimizam o nome do ex-funcionário pra `AwSales · Playbooker · [ex-funcionário #ID]` mantendo rastreabilidade interna via `actor_user_id`.
  - LGPD: política de retenção documentada em `iam/multi-tenancy/internal-offboarding.mdx`.

### Outros fixes recomendados pra Onda 2

- **Toggle cross-carteira não-sticky** (G-F9-002): reset ao login. Motivo exigido **por org acessada**, não por sessão.
- **Notificações cross-canal** (G-F9-004) com SLAs e fallback (e-mail → in-app → Slack interno).
- **Dashboard priorizado por urgência composta** (G-F9-001) com escore `MRR × prob_churn × tempo_sem_acao`.
- **Modo demo view-only** (G-F10-004) pra ex-Playbookers com audit `demo_session.*` explícito.

---

## Pergunta-chave consolidada pra time

1. **Existe scheduler com SLO pra `playbooker.unassigned` automático?** Se não, todo o Cenário 24.5 é prosa.
2. **Cobertura temporária de AM é Onda 1 ou Onda 2?** Sem ela, qualquer AM com >10 orgs vai usar cross-carteira como hack e poluir audit do cliente.
3. **Leituras (views) geram evento de audit?** É decisão estrutural — afeta volume de eventos, custo de storage, e compliance LGPD. Tem que ser decidido AGORA antes de seedar funções.
4. **Retenção de PII de ex-funcionário em audit do cliente — pseudonimiza ou mantém indefinidamente?** Conversa com DPO obrigatória.
