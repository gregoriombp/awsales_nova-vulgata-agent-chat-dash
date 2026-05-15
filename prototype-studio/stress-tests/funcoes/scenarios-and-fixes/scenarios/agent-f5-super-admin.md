# F11 — Super Admin agindo em org cliente sem audit visível

**Persona:** Marcelo Marra, CTPO da AwSales, Super Admin da plataforma (`awsales-super-admin`).
**SUT:** Cenário 24.3 (acesso total + "audit trail completa") + Cenário 24.6 (`actor_type: AwSales · {função} · {nome}` "sem exceção, sem ocultação").
**Volume real:** ~30 acessos/mês em orgs cliente nos últimos 18 meses ≈ **540 incursões cross-org** sem trilha visível pro cliente final.
**Lente dominante:** ⚖️ Compliance (LGPD Art. 6º VI, 9º, 18 + CDC Art. 6º III + SOC 2 CC6.1/CC7.2 + ISO 27001 A.9.2.3 acesso privilegiado).

---

## INCIDENTE A — Webhook Stripe noturno (15/05/2026, 23:42)

**Contexto:** webhook do Stripe falhou pra Magalu. Marcelo entra via `adm.awsales`, autentica com WorkOS, escolhe org Magalu no seletor cross-org, abre módulo Billing › Eventos, executa replay do `payment_intent` manualmente via admin-api, faz 3 edições em logs internos, marca evento como reprocessado. **Não fala com ninguém da Magalu.**

### BEAT 1 — Marcelo decide entrar na org

- **Ação técnica:** `POST /admin-api/v1/orgs/{magalu_id}/sessions` (impersonation token gerado), depois `POST /admin-api/v1/orgs/{magalu_id}/billing/events/{evt_id}/replay`. Três `PATCH` em `internal_logs`.
- **Magalu foi notificada?** Não. Não há canal de notificação proativa Super Admin → Cliente Admin no spec atual. Cenário 24.6 diz que aparece em audit trail "quando age" — mas o cliente só vê SE abrir o audit trail e SE filtrar por interno.
- **Audit interno AwSales:** registra `super_admin.cross_org_access` com timestamp + org_id + ator. Granularidade indefinida — spec não diz se cada `PATCH` em `internal_logs` é evento separado ou agrupado.
- **Audit da org Magalu:** **lacuna crítica** — Cenário 24.6 promete "toda ação aparece no audit trail dessa org" mas não especifica:
  - Operação via admin-api (não via Studio) também grava no audit trail do tenant? Ou só ações UI?
  - Replay de webhook Stripe é "ação na org" ou "ação na plataforma sobre evento da org"? Provável zona cinza onde Eng/Super Admin vão argumentar que é "operação técnica de plataforma" e desligar o logging.
  - As 3 edições em `internal_logs` ficam visíveis pro Cliente Admin com diff? Ou só "Super Admin acessou módulo Billing"?

### BEAT 2 — Magalu descobre (ou não)

- **Descoberta proativa:** zero. Não há e-mail / notificação no Studio / digest mensal "AwSales acessou sua org N vezes este mês".
- **Descoberta reativa:** só se o Compliance Officer da Magalu fizer auditoria interna e filtrar audit trail por `actor_type: AwSales · *`. Maioria dos Cliente Admin não sabe que esse filtro existe.
- **Contestação:** Magalu pode pedir "lista de todos os acessos AwSales na minha org nos últimos 12 meses"? Spec não menciona. **Não existe tela cliente-facing chamada "Acessos AwSales na minha org"** no Cenário 24.6.
- ⚖️ **LGPD Art. 18 IV** (direito do titular à informação sobre uso compartilhado) — cliente é controlador, AwSales é operador (Art. 39). Operador agindo sobre dados pessoais sem registro auditável e disponível ao controlador = quebra de Art. 37 (registro das operações de tratamento) + Art. 39 (instruções do controlador).
- 🎯 **UX:** mesmo que o evento esteja gravado no banco, sem tela acessível ao cliente, o registro é juridicamente inexistente do ponto de vista de exercício de direitos.

### BEAT 3 — Implicações regulatórias

- **Hora 23h42, sem ticket formal, sem justificativa.** SOC 2 CC6.1 (logical access) + CC7.2 (monitoring) exigem que acesso privilegiado fora do horário comercial tenha:
  - (a) justificativa formal capturada antes do acesso
  - (b) aprovação 4-olhos para leitura/escrita em prod
  - (c) alerta automático pro time de segurança
  Nada disso está no spec. Marcelo entrou sozinho às 23h42 e mexeu em pagamento.
- **Mudanças em `internal_logs`:** edição de logs por Super Admin é red flag SOC 2 / ISO 27001 A.12.4.2 (proteção de logs) — logs devem ser imutáveis ou WORM, não editáveis nem pelo Super Admin. Se o spec permite `PATCH` em logs internos, há gap de integridade probatória.
- **Pagamento envolvido:** PCI-DSS 10.2.5 (logging de acessos administrativos a dados de pagamento) + 10.2.7 (criação/exclusão de objetos do sistema). Replay de `payment_intent` por humano deve ter trilha forense completa que não cabe em "acessou módulo Billing".
- **Prova judicial:** Magalu pode usar essa opacidade contra AwSales numa contestação contratual ("vocês mexeram em pagamento sem nos avisar, à meia-noite, sem ticket — prove que foi legítimo"). Ônus probatório recai sobre AwSales (operador).

---

## INCIDENTE B — Leitura passiva de 12 conversas com PII na Quinto Andar (08/05/2026, 14:15)

**Contexto:** Suporte L2 recebe ticket "Agente não responde". Marcelo (em jornada normal) abre org Quinto Andar, navega 30 conversas pra diagnosticar, **lê conteúdo de 12 conversas com PII** (CPF, RG, endereços), edita prompt de 1 agente, marca como resolvido. Quinto Andar Admin nunca foi notificado.

### BEAT 1 — Marcelo decide entrar na org

- **Ação técnica:** `GET /admin-api/v1/orgs/{quintoandar}/conversations?limit=30` → 30 chamadas `GET /conversations/{id}` → `PATCH /agents/{agent_id}/prompt`.
- **Quinto Andar notificada?** Não. O Cliente Admin não recebe notificação quando Super Admin abre conversa.
- **Audit interno:** registra acesso ao módulo, mas **granularidade de leitura** é a zona cinza crítica aqui:
  - O spec atual fala em "audit trail completa" mas não distingue **leitura passiva** vs **escrita**.
  - O cliente vai ver "Marcelo acessou Conversas" ou "Marcelo leu conversa #1247 contendo dados de Maria Silva CPF 123.456.789-00"? Provavelmente o primeiro — granularidade insuficiente.
- **Audit da Quinto Andar:** mesma lacuna do Incidente A — operação via admin-api pode não rebatizar evento no audit trail do tenant.

### BEAT 2 — Quinto Andar descobre (ou não)

- Provavelmente **nunca descobre**. Não há tela "Acessos AwSales na minha org". Ticket de suporte foi aberto pela própria Quinto Andar, mas o ticket dizia "agente não responde" — não autorizava leitura de 12 conversas com PII de terceiros (titulares: clientes da Quinto Andar comprando/alugando imóveis).
- ⚖️ **LGPD Art. 6º II (adequação) + VI (transparência)**: leitura de PII de titulares (clientes finais da Quinto Andar) por operador (AwSales) deve estar (a) prevista no contrato de operação, (b) adequada à finalidade declarada ("debug de bug técnico" ≠ "leitura de CPF/RG"). Marcelo possivelmente fez tratamento sem base legal pra os 12 titulares.
- ⚖️ **LGPD Art. 18 IV + IX**: titulares (clientes finais) têm direito à informação sobre quem acessou seus dados. Quinto Andar (controlador) precisaria ser capaz de responder a um DSAR dizendo "AwSales acessou seu CPF em 08/05/2026 às 14h15 sob ticket #X com finalidade Y". Hoje não consegue.

### BEAT 3 — Implicações regulatórias

- **Aprovação 4-olhos pra leitura de PII em prod:** padrão Privileged Access Management (PAM). Spec não menciona. Marcelo leu 12 PIIs sozinho.
- **Granularidade de logging de leitura:** ISO 27001 A.12.4.1 exige registro de eventos (incluindo leitura) em sistemas que processam informação sensível. Spec do Cenário 24.3 fala em "auditoria completa" mas sem definir o que é "completa" — é o ponto de quebra.
- **Justificativa por acesso (campo "motivo"):** existe pro Gestor de Conta no toggle "Mostrar todas orgs da plataforma" (Cenário 24.4) — **não existe pro Super Admin entrar em qualquer org**. Inversão: a função com mais poder tem menos controle.
- **Risco probatório:** se um cliente final da Quinto Andar fizer DSAR perguntando "quem viu meu CPF?", Quinto Andar não consegue responder com a granularidade exigida — e responsabilidade civil cai sobre o controlador (Quinto Andar), que vai repassar pra AwSales via contrato.

---

## INCIDENTE C — Cupom 50% off via admin-api, AM em licença (22/04/2026)

**Contexto:** Marcelo aprova cupom de 50% off pra Pereira Atacado (cliente em risco de churn) via admin-api, sem passar pelo AM Bruno (em licença).

### BEAT 1 — Ação técnica

- `POST /admin-api/v1/orgs/{pereira_id}/billing/coupons` com discount 50%.
- A matriz do Cenário 24.3 diz: **"Operar Financeiro do cliente: Super Admin ✓ / AM ✓ (cobrança, cupom)"** — Super Admin tem o direito formal. Mas pular o AM é exceção operacional ao protocolo do Cenário 24.4 (notificação automática vai pro AM, não chega no Super Admin).
- **Quem aprova esse desvio?** Spec não tem fluxo de "AM ausente → escalation". Marcelo decidiu sozinho.
- **Audit interno:** registra ator + valor + motivação (se houver campo de motivo no admin-api). Spec não confirma.
- **Audit da Pereira:** Cliente Admin **deve** ver evento Financeiro (cupom aplicado) — esse caso provavelmente é o **menos problemático** em visibilidade, porque cupom muda fatura e o cliente percebe.

### BEAT 2 — Pereira Atacado descobre

- Descobre na próxima fatura. Não há notificação proativa "AwSales aplicou desconto unilateral em sua org". Pereira pode interpretar como cortesia ou pode ficar confusa: "quem decidiu isso? virou padrão? pode tirar depois?".
- 🎯 **UX:** desconto não solicitado pode gerar **expectativa contratual** (o cliente assume que vai continuar). Se AwSales retirar, é interpretado como aumento.

### BEAT 3 — Implicações regulatórias e contratuais

- **Governança financeira interna:** SOX-like / controle interno — quem autoriza desconto >X%? Spec não define teto nem aprovação dupla.
- **CDC Art. 39 IX** (prática abusiva: alterar preço unilateralmente após contratado) — aqui é desconto a favor do cliente, então não viola CDC, mas vira **passivo contábil** se virar padrão.
- **Equidade entre clientes:** outro cliente em risco que não recebeu 50% off pode pleitear equidade. Não há critério público.
- **Risco probatório:** se Pereira renovar com cupom e depois AwSales tentar tirar, Pereira pode alegar **boa-fé objetiva** (CC Art. 422) — ônus de provar que era "exceção pontual" recai sobre AwSales sem trilha clara.

---

## INCIDENTE D — Revogar acesso de Felipe Rezende via WhatsApp do CEO Magalu (planejado 19/05/2026)

**Contexto:** CEO da Magalu manda WhatsApp pro Marcelo: "Felipe Rezende foi demitido, tira o acesso dele". Marcelo inativa Felipe via admin-api.

### BEAT 1 — Ação técnica

- `PATCH /admin-api/v1/orgs/{magalu}/users/{felipe_id}/status` com `status: inactive`.
- **Quem é o solicitante autorizado pelo contrato AwSales × Magalu?** Provavelmente é o Cliente Admin da Magalu (não o CEO via WhatsApp). Marcelo está executando ação de IAM do cliente sob ordem informal.
- **Onde fica registrada essa "ordem do CEO via WhatsApp"?** Provavelmente nenhum lugar. Audit registra "Marcelo inativou Felipe" — sem o "atendendo solicitação X recebida no canal Y".

### BEAT 2 — Magalu descobre (ou não)

- Cliente Admin da Magalu descobre quando vê que Felipe sumiu — pode ser horas, dias ou semanas depois. **Não foi quem pediu**, então pode estranhar e abrir ticket: "quem inativou Felipe? por que?".
- ⚖️ **LGPD Art. 39** (operador segue instruções do controlador): instrução veio de CEO via WhatsApp, fora do canal contratual. **Marcelo executou instrução de pessoa potencialmente autorizada, mas via canal não autorizado.** Se Felipe processar (acesso indevidamente revogado, p.ex. enquanto disputa rescisão trabalhista), Magalu vai dizer "AwSales executou sem ticket formal".
- 🎯 **UX cliente:** Cliente Admin perde controle sobre IAM da própria org quando Super Admin pode agir por canais informais.

### BEAT 3 — Implicações regulatórias

- **CLT/processo trabalhista:** revogação de acesso pode ser usada como **prova de demissão** (data, hora). Se Felipe contestar demissão por justa causa, audit trail vira documento probatório. AwSales precisa conseguir provar: "fui instruído por X em Y às Z" — hoje não consegue.
- **SOC 2 CC6.2** (provisionamento/desprovisionamento autorizado): exige cadeia formal de aprovação. WhatsApp do CEO não é cadeia formal.
- **Princípio da segregação de funções (SoD):** Super Admin AwSales agindo como IAM Admin do cliente quebra SoD. O cliente deveria ser quem inativa seus funcionários — AwSales só executa se houver pedido formal via ticket assinado por Cliente Admin (não por terceiro via canal alternativo).
- **Risco de captura:** se Marcelo aceita ordem do CEO via WhatsApp uma vez, vira precedente. Próximo passo: CEO pede pra ver conversas de funcionário X. Não tem freio.

---

## Gap register consolidado

| Gap ID | Incidente | Lente | Descrição | Severidade | Compliance citation |
|---|---|---|---|---|---|
| **F11-G01** | A, B, D | ⚖️ | Não existe campo "motivo obrigatório" no admin-api pra Super Admin entrar em org cliente (existe pra AM no toggle cross-carteira — inversão). | **P0** | LGPD Art. 37, 39; SOC 2 CC6.1; ISO 27001 A.9.2.3 |
| **F11-G02** | A, B | ⚖️ | Spec não define se operações via admin-api gravam evento no audit trail do tenant cliente (ou só no audit interno AwSales). Ambiguidade no Cenário 24.6. | **P0** | LGPD Art. 37; CDC Art. 6º III |
| **F11-G03** | B | ⚖️ | Audit não distingue **leitura passiva** vs **escrita** de PII. "Acessou módulo" vs "leu CPF de Maria Silva". | **P0** | LGPD Art. 18 IV; ISO 27001 A.12.4.1 |
| **F11-G04** | A, B, C, D | 🎯/⚖️ | **Não existe tela cliente-facing "Acessos AwSales na minha org"** com filtro, período, exportação. Cenário 24.6 promete visibilidade mas não especifica entrega. | **P0** | LGPD Art. 18 IV+IX, Art. 39 |
| **F11-G05** | A | ⚖️ | Acesso fora do horário comercial sem alerta, sem aprovação 4-olhos, sem timeout de sessão privilegiada curta. | **P0** | SOC 2 CC7.2; PCI-DSS 10.2.5; ISO 27001 A.9.4.2 |
| **F11-G06** | A | ⚖️ | `PATCH` em `internal_logs` é permitido pro Super Admin (logs não-WORM). Quebra integridade probatória. | **P0** | SOC 2 CC7.1; ISO 27001 A.12.4.2 |
| **F11-G07** | B | ⚖️ | Leitura de PII em prod sem aprovação 4-olhos (PAM) nem justificativa por acesso. | **P0** | LGPD Art. 6º II+VI; ISO 27001 A.9.2.3 |
| **F11-G08** | C | ⚖️/🔧 | Operação financeira (cupom) sem teto de valor, sem aprovação dupla, sem fluxo de escalation quando AM ausente. | **P1** | SOX-like; CC Art. 422 |
| **F11-G09** | D | ⚖️ | Ações IAM do cliente executadas por Super Admin sem ticket formal do Cliente Admin (canal não autorizado). | **P0** | LGPD Art. 39; SOC 2 CC6.2; SoD |
| **F11-G10** | A, B, C, D | 🎯 | Não há notificação proativa pro Cliente Admin quando Super Admin age na org (e-mail, push, banner). Cliente descobre por acaso. | **P1** | LGPD Art. 6º VI (transparência ativa) |
| **F11-G11** | A, B, C, D | ⚖️ | Não existe **digest mensal AwSales** ao Cliente Admin: "internos acessaram sua org N vezes, X com PII, Y com escrita". | **P1** | LGPD Art. 37 (registro periódico); SOC 2 CC2.3 |
| **F11-G12** | D | ⚖️ | Audit não captura **canal de instrução do controlador** (campo "instrução recebida via: ticket #X / e-mail / outro"). Quebra Art. 39 LGPD. | **P0** | LGPD Art. 39 |
| **F11-G13** | A, B | ⚖️ | Não há limite de quantos registros PII Super Admin pode abrir em janela curta sem alerta (defesa contra exfiltração interna). | **P1** | SOC 2 CC7.2; ISO 27001 A.12.4.1 |
| **F11-G14** | A, C, D | ⚖️ | Operações via admin-api podem **bypassar logging UI** — não há garantia spec'ada de que canal API tem mesmo nível de audit que canal UI. | **P0** | SOC 2 CC7.1 |
| **F11-G15** | todos | 🎯 | Cliente Admin não tem como **contestar** ação interna AwSales pela UI (botão "questionar este acesso"). | **P2** | LGPD Art. 18 (exercício de direitos) |

---

## Recomendação executiva — controles que faltam

1. **Justificativa obrigatória (`access_justification`) pré-acesso** — todo entry de Super Admin em org cliente exige campo livre + categoria (incidente / suporte / compliance / cobrança / outro). Sem justificativa → admin-api retorna 403. Cliente Admin vê a justificativa no audit trail dele.

2. **Aprovação 4-olhos pra leitura de PII e operações financeiras em prod** — segundo Super Admin (ou Compliance Officer AwSales) precisa aprovar via canal separado em <5min. Sessão fica em "pending approval" até liberação. Aplica fora do horário comercial e sempre que envolver PII de cliente final ou mudança financeira >R$X.

3. **Tela "Acessos AwSales na minha org" no Studio (cliente-facing)** — feed completo: data/hora, função interna, nome, justificativa, ação (granular), módulo, recursos tocados (com diff quando escrita). Filtros por período/função/severidade. Exportação CSV/PDF assinada digitalmente. Esta tela é **a entrega prática do Cenário 24.6** — sem ela, o spec promete e não cumpre.

4. **Notificação proativa pro Cliente Admin** — e-mail + push no Studio em real-time quando Super Admin/Eng. On-call agem em produção; digest semanal pro AM agindo em rotina; digest mensal de "saúde de acessos AwSales" pra todos os clientes.

5. **Sessão privilegiada com timeout curto + step-up auth** — sessão admin-api dura no máximo 30min, exige re-autenticação MFA pra entrar em outra org, sem persistência cross-org. Sem "abre tudo e fica".

6. **Audit cross-canal garantido (UI === admin-api)** — todo evento de admin-api precisa propagar para o audit trail do tenant cliente com mesma granularidade da UI. Auditável por design: nenhum endpoint admin-api opera sem hook de log no tenant.

7. **Logs imutáveis (WORM) e separação privilege/audit** — Super Admin **não pode editar** logs (`internal_logs`). Edição/anexação de contexto só via novo registro (event sourcing). Mesmo time não pode modificar audit do que ele próprio fez (segregação).

8. **Captura de canal de instrução do controlador** — campo obrigatório `controller_instruction_ref` ao executar ação IAM/Financeira/Privacy em nome do cliente: ticket ID / e-mail message-id / outro. Sem referência → bloqueio (LGPD Art. 39).

9. **Rate-limit + alerta de leitura PII em janela** — se Super Admin abre >5 PIIs em 10min sem justificativa de incidente correlacionado, dispara alerta pro Compliance Officer + Cliente Admin afetado.

10. **Botão "questionar este acesso"** no item de audit trail do cliente → abre ticket formal com SLA pra resposta do Compliance AwSales. Materializa LGPD Art. 18.

**Sumário regulatório:** sem esses controles, a Story 2 entrega o conceito de auditoria total mas **não é defensável** sob LGPD Art. 37/39, SOC 2 CC6/CC7, ISO 27001 A.9/A.12 e PCI-DSS 10. O risco não é teórico — são ~540 incursões/ano sem trilha cliente-visível. Em uma única investigação ANPD ou auditoria SOC 2, AwSales não consegue produzir as evidências exigidas no padrão de granularidade necessário.
