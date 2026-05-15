# Red Team · Eixo Operacional (F3 · F4 · F5)

**Agente:** F2 — Operacional
**SUT:** Cenários 24.1–24.6 do catálogo canônico de funções (stories/team-funcoes-config.md)
**Data:** 2026-05-12
**Tese adversarial:** o catálogo de 6 funções padrão tenant + 5 internas foi desenhado pra cobrir "padrões claros" de B2B SaaS, mas o eixo operacional (quem **executa** o dia-a-dia) tem 3 buracos previsíveis: dev/integrador, SDR sênior com edição de prompt, e gerente regulado com workflow de aprovação. Cada persona abaixo foi construída pra forçar o catálogo a falhar nesses pontos.

---

## PERSONA F3 — Rodrigo Andrade · Itaú Soluções (freelance, 60 dias)

**Contexto:** Itaú Soluções (BU corporativa do banco, NÃO o banco-mãe) contratou Rodrigo via Gupy, freelance PJ, pra integrar HubSpot (CRM atual) + N8N (orquestração interna do banco) + sistema legado SAS de score de crédito com o agente AwSales. Janela: 2026-05-13 a 2026-07-12. Rodrigo nunca foi funcionário do Itaú e o contrato é específico pra esse projeto.

**Acessos que ele PRECISA:**
- Testar webhook de Integration Hub (HubSpot deal stage → AwSales agent trigger)
- Completar OAuth do HubSpot (não consegue se não ver credenciais)
- Ler payload de erro nos logs do dispatcher
- Simular dispatch no Playground em modo dev (sem cobrar variável do plano)
- Ver schema das tools expostas pro agente

**Acessos que ele NÃO PODE ter (LGPD + Política de Privacidade Bancária Itaú · Resolução BCB 4.893):**
- Ver dados de cliente real (nome, CPF, conta)
- Abrir conversas de produção
- Ver leads reais (a base do Itaú tem >2M leads)
- Ver Financeiro (contrato com AwSales é confidencial entre Itaú e AwSales)

### BEAT 1 — Admin do Itaú (Camila, Head de TI) tenta atribuir função padrão

Camila abre **Funções**, lê descrições das 6 padrão:

| Função | Camila pensa... |
|---|---|
| Admin | "Não, ele NÃO pode ter Financeiro nem IAM" |
| Manager | "Vê Financeiro, convida membros, aprova campanha — demais" |
| **Operator** | "Vê conversas reais + lead real + atende ticket — VAZA PII bancário" |
| Analyst | "Não acessa Integrações com escrita, não pode conectar OAuth — DE MENOS" |
| Viewer | "Read-only puro, nem entra no Playground — DE MENOS" |
| DPO | "Função do encarregado, não tem nada a ver" |

**Resultado:** **NENHUMA das 6 funções padrão serve.** Camila tem que criar custom.

- 🔧 **Funcional:** O Cenário 26 ("Criar nova função") força Camila a montar **do zero** — sem partir de duplicação. Ela tem que mapear, do catálogo de ~80 permissões do Cenário 24.1, exatamente o subconjunto técnico-sem-PII. Estimativa: **45-60 min** com risco alto de erro (vai esquecer `dispatch:simulate`, vai marcar `conversation:read` por reflexo).
- ⚖️ **Compliance:** Se Camila marca **errado** uma única permissão (`conversation:read`, `lead:read`, `pii:read`), Rodrigo vê PII bancário. O Itaú tem obrigação BCB de log de acesso PII de terceiros — sem função padrão "Integrador Técnico" auditável, o vínculo "função custom criada pelo cliente" não dá garantia de revisão de segurança pela AwSales. Auditoria BCB pergunta: "essa função foi revisada pela DPO da AwSales?" Resposta: não, foi montada na unha pela cliente.
- 🎯 **UX:** Camila gasta 1h. Pior: ela vai pedir ajuda no Slack do Customer Success ("qual função pra integrador?"), gerando ticket, gerando atrito. **O catálogo está empurrando o cliente pra função custom logo no fluxo mais comum de B2B SaaS — terceiro técnico com escopo temporário.**

### BEAT 2 — Rodrigo loga 1ª vez, abre Integrações pra conectar HubSpot

Função custom criada pela Camila ("Integrador HubSpot") tem `integration:connection:write` + `integration:connection:test` + `integration:catalog:read`, **mas NÃO** `integration:credential:read` (Cenário 24.1: "**só Admin**, expõe secret").

- 🔧 **Funcional:** Rodrigo clica "Conectar HubSpot", completa OAuth via popup do HubSpot — funciona. Mas quando precisa ler o `client_secret` salvo pra usar no n8n (que tem outro fluxo paralelo lendo a mesma conta HubSpot), **bate no gate**: "Acesso restrito ao Admin." Rodrigo precisa ligar pra Camila, Camila precisa logar, copiar o secret, mandar por Slack (que já é uma anti-prática de segurança).
- ⚖️ **Compliance:** O modelo "só Admin vê credencial" é defensável em produção mas **inviável em integração técnica**. Camila vai acabar dando Admin pro Rodrigo "só 5 minutos" ou colando o secret no Slack — ambos viram incidente de segurança pior do que o que o catálogo tentou prevenir.
- 🎯 **UX:** Não há fluxo "Solicitar acesso temporário à credencial X" — é tudo-ou-nada.

### BEAT 3 — Rodrigo abre Playground pra simular dispatch sem cobrar

Função custom tem `agent_runtime:dev` + `dispatch:simulate`. Funciona.

- 🔧 **Funcional:** Playground abre. Mas Rodrigo precisa testar com **dados realistas** (formato de telefone BR, formato de CPF, payload do HubSpot real). O Playground tem mock data? Não está documentado em 24.1 — só "Acessar / Simular". Rodrigo termina copiando lead real do HubSpot pra testar, **trazendo PII** pro escopo que o catálogo tentou impedir.
- ⚖️ **Compliance:** O catálogo tira o acesso `lead:read` mas não controla **o que entra no Playground como input**. Buraco arquitetural: separação Playground/produção precisa de "modo sandbox com dados sintéticos garantidos" — hoje é só uma permissão.
- 🎯 **UX:** Rodrigo não tem como gerar lead falso dentro do Studio. Ele importa o lead real ou desiste.

### BEAT 4 — Webhook do HubSpot falha em produção, Rodrigo precisa do log

Função custom **não tem** `cortex:observability:read` (Camila não imaginou que precisaria).

- 🔧 **Funcional:** Rodrigo abre dashboard → "Sem acesso à observabilidade técnica." Não consegue ver porque o webhook não entregou. Liga pra Camila de novo. Camila descobre que precisa editar a função (Cenário 27) — mudança se aplica "imediatamente, próxima request" — OK, mas o ciclo é **1-2h** de bloqueio.
- 🎯 **UX:** Função custom vira jornada incremental de "Rodrigo bate em parede → pede pra Camila editar → tenta de novo". 4-5 iterações ao longo dos 60 dias.

### BEAT 5 — Final do contrato (D+60), Camila precisa offboardar Rodrigo

- 🔧 **Funcional:** Cenário 28 obriga reatribuir o usuário antes de deletar a função custom. Mas Rodrigo é o único da função "Integrador HubSpot" — Camila precisa inativar o membro **antes** de poder deletar a função, ou deixar a função custom órfã no sistema (ruído permanente). Não há "função temporária com data de fim automática" no MVP — diferente do Playbooker interno (Cenário 24.5) que tem `due_date`.
- ⚖️ **Compliance:** Se Camila esquece de inativar, Rodrigo continua com acesso. **Não há revisão periódica forçada de funções custom** no catálogo. O Playbooker interno tem `due_date` obrigatório, mas o equivalente externo (terceiro técnico) não.

---

## PERSONA F4 — Mariana Costa · Wise Up Idiomas (SDR Sênior)

**Contexto:** Wise Up Idiomas, ed-tech B2C, time outbound de 8 SDRs (Mariana é Sr, 4 são pleno, 3 são jr). Ciclo diário: 9h fila de 200 leads novos chega do Marketing → 10h-12h Mariana seleciona 50 mais quentes → dispara WhatsApp em massa via agente "Wise SDR" → 13h-19h atende inbound (~60 conversas/dia respondendo ao disparo). Quando vê uma resposta ruim do agente, edita o prompt pra ajustar tom.

**Função-alvo:** Operator (`org-operator`).

### BEAT 1 — Karen (Gerente, Admin do tenant) atribui Operator pra Mariana

Karen lê matriz 24.2:
- ✓ Edita prompts (próprios) → "perfeito, Mariana ajusta o agente"
- ✓ Cria/Edita campanha → "ela monta a campanha do dia"
- — Aprovar campanha ⚡ → "espera, então quem aprova? Eu? Pra cada disparo de 50 leads?"
- ✓ Disparar em massa ⚡ → "tá, depois de aprovada, ela dispara"

Karen pausa. **A matriz separa "Criar campanha" de "Aprovar campanha" — mas Karen não vê workflow de aprovação no catálogo.**

- 🔧 **Funcional:** O Cenário 24.1 lista `campaign:approve` como ⚡ ("gate de governança"). Mas **não há story de workflow**: Mariana cria → muda status pra "pendente aprovação"? Karen recebe notificação? Há fila de pendentes? Nenhuma resposta. **Buraco de produto.**
- 🎯 **UX:** Karen prevê: "Vou ter que ser interrompida 5x/dia pra aprovar campanha de 50 leads que a Mariana mandou. Inviável."

### BEAT 2 — Mariana edita o prompt do agente "Wise SDR"

Matriz: Operator pode "Editar prompts **(próprios)**". O que define "próprio"?

- 🔧 **Funcional:** O agente "Wise SDR" foi criado pela Karen no onboarding. Mariana não é dona. Ela consegue editar?
  - **Interpretação A:** "próprio" = criou o agente → Mariana NÃO edita o prompt do agente principal do time. Bloqueio fatal — ela depende da Karen pra cada ajuste de tom.
  - **Interpretação B:** "próprio" = está atribuída/assinada ao agente → falta conceito de "ownership de agente" no catálogo, não existe permissão `agent:assign_owner`.
  - **Interpretação C:** "próprio" = qualquer agente da própria org → então o adjetivo "próprios" não faz nada e Operator edita TUDO, incluindo o agente que Karen calibrou.
- ⚖️ **Compliance:** Numa org regulada (não é caso da Wise Up, mas seria caso de banco/saúde), Operator editando prompt sem aprovação publica conteúdo regulado em produção. Existe `agent:publish` (⚡) como gate separado — mas Operator edita prompt SEM publicar **muda o comportamento real**? Depende da arquitetura: se "publish" só ativa nova versão, edit não vaza. Se edit é live, edit vaza. **Não documentado.**
- 🎯 **UX:** "Próprios" é vago. Vira pergunta de Slack pro CS.

### BEAT 3 — Mariana dispara WhatsApp pra 50 leads selecionados

Matriz: Operator tem `dispatch:schedule` ⚡ ("consome variável"). OK, dispara.

- 🔧 **Funcional:** Dispara sem aprovação prévia? Aparentemente sim — matriz dá `dispatch:schedule` ao Operator mas NÃO dá `campaign:approve`. **Contradição:** se a campanha precisa ser aprovada antes de disparar (princípio dos ⚡), Operator não consegue executar sozinho. Se o Operator dispara sozinho, qual o sentido de `campaign:approve` existir como permissão separada?
- ⚖️ **Compliance:** Wise Up tem WhatsApp Business API com regras de opt-in. Se Mariana dispara pra lead sem opt-in (erro humano), quem pega? Não há `opt_in:check` obrigatório no catálogo. Operator tem `lead:write_memory` mas NÃO `lead:compliance:write` — então não pode marcar opt-out, mas pode disparar pra quem está em opt-out (não há gate inverso).
- 🎯 **UX:** Mariana não recebe alerta visual de "50 leads selecionados, 3 estão em opt-out". Catálogo silencioso sobre essa salvaguarda.

### BEAT 4 — Mariana responde inbound (60 conversas/dia)

Operator tem `conversation:read` + `message:send` + `escalation:assign`. OK, fluxo casa.

- 🔧 **Funcional:** Cobre. Mas Mariana atende junto com 7 SDRs — fila de tickets compartilhada. Existe roteamento por SDR? `escalation:team:write` é só do Admin/Manager — Mariana não monta o próprio time.
- 🎯 **UX:** OK pro caso individual. Não testa fricção até virar Manager.

### BEAT 5 — Mariana vira Coordenadora dos SDRs Jr

Promoção: agora ela deve aprovar campanhas dos juniores antes do disparo.

- 🔧 **Funcional:** Catálogo não tem função intermediária "Lead Operator" / "Coordenador" entre Operator e Manager. Manager dá demais (vê Financeiro, convida membros). Operator não dá `campaign:approve`. **Karen tem que criar custom de novo** — toda promoção interna gera função custom.
- 🎯 **UX:** Toda empresa com hierarquia de SDR (todas) cai nesse buraco. Padrão "Coordinator/Team Lead" falta.

---

## PERSONA F5 — Henrique Borges · Hospital Care (Gerente de Operações, vertical regulada)

**Contexto:** Hospital Care, rede de hospitais privados (35 unidades, vertical saúde — LGPD + RDC Anvisa + sigilo médico CFM 1.821). Henrique comanda 25 atendentes em 3 turnos (8h-16h, 16h-0h, 0h-8h). Política interna: **todo conteúdo que vai pra paciente passa por aprovação do gerente da unidade** antes de disparar (compliance jurídico-regulatório). Henrique aprova ~15 campanhas/dia, ~8 publicações de versão de agente/semana.

**Função-alvo:** Manager (`org-manager`).

### BEAT 1 — Sócio-administrador (Dr. Camargo, Admin) atribui Manager pra Henrique

Camargo lê matriz:
- ✓ Aprovar campanha
- ✓ Publicar versão
- ✓ Gerenciar bindings
- ✓ Convidar/Inativar membros
- ✓ Ver Financeiro (não troca cartão) — "tudo bem, ele é Gerente"
- — Privacy/Legal Hold — "OK, isso é da DPO Dra. Eliane"

Manager parece encaixar. Mas...

- 🔧 **Funcional:** Henrique vê Financeiro completo? Se em saúde corporativa o gerente operacional **não deve** ver MRR/custo total da org (decisão financeira do board), Manager dá demais. Camargo customiza.
- ⚖️ **Compliance:** Hospital tem DPO **e** Compliance Officer (papéis distintos no CFM/LGPD). Catálogo só tem DPO. O Compliance Officer fica órfão — vira função custom ou compartilha login com DPO (anti-padrão).

### BEAT 2 — Henrique faz login segunda-feira 9h, quer ver backlog de aprovações pendentes

- 🔧 **Funcional:** **NÃO EXISTE tela "Aprovações Pendentes" no catálogo.** Cenário 24.1 lista `campaign:approve` e `agent:publish` como ações ⚡, mas não desenha o INBOX. Manager não tem visibilidade do que está esperando ele. Vai descobrir pelo Slack/email do Operator.
- 🎯 **UX:** Reproduz o anti-padrão do Jira "task atribuída a você sem inbox unificado". **P0 de produto.**

### BEAT 3 — Operator (atendente sênior Letícia) submete campanha de retorno de consulta pra aprovação

- 🔧 **Funcional:** Como Letícia "submete"? Catálogo tem `campaign:write` (cria/edita) mas **não há permissão `campaign:submit_for_approval`**. Há um botão "Solicitar aprovação"? Status muda automaticamente? Indefinido. Workflow inexistente no catálogo.
- ⚖️ **Compliance:** Vertical saúde exige **registro do ato de submissão** (quem submeteu, quando, conteúdo exato submetido) — não basta registrar a aprovação. Se Letícia edita depois de submeter, Henrique aprova versão antiga? Não há "snapshot ao submeter" no catálogo.
- 🎯 **UX:** Letícia provavelmente vai pingar Henrique no WhatsApp ("aprova lá, dá uma olhada") — workflow vaza pra fora do produto.

### BEAT 4 — Henrique aprova, mas demora 30h (turnos noturnos sem ele)

SLA interno do Hospital: campanha aprovada em até 24h ou volta pro Operator com motivo. Catálogo:

- 🔧 **Funcional:** Não há SLA configurável no `campaign:approve`. Não há escalation automática ("se Henrique não aprovou em 24h, sobe pro Admin"). Não há D-3 / D-1 notification (que existe pro AM interno em 24.4, mas não pra aprovações tenant).
- 🎯 **UX:** Operator não sabe quando vai sair. Manager não sabe que está atrasado. Toda governança fica no Slack.

### BEAT 5 — Henrique aloca atendentes em 3 turnos (escalation:team:write)

Operação real: precisa montar fila por turno, atribuir atendentes nominalmente, garantir que ninguém atende fora do turno.

- 🔧 **Funcional:** Manager tem `escalation:team:write`. OK, monta time. Mas "time" é **agrupamento estático** ou tem **janela horária**? Catálogo só lista a permissão, sem detalhar feature. Provavelmente é estático — Henrique não consegue dizer "Team Noturno só atende 0h-8h" sem montar 3 times paralelos e mudar atribuição manualmente.
- 🎯 **UX:** Trabalho manual diário pra montar escala. Hospital com 25 atendentes em 3 turnos = 75 reatribuições/dia se for assim.

### BEAT 6 — Publicação de nova versão do agente "Recepção Virtual"

Manager tem `agent:publish` ⚡. Henrique publica.

- ⚖️ **Compliance:** Vertical regulada exige **dual approval** (4-eyes principle) pra mudança que afeta conteúdo entregue ao paciente. Catálogo dá `agent:publish` a Manager **sozinho**. Sem segunda aprovação, sem comitê. Risco: Henrique aprova e publica versão sua → falha de governança CFM.
- 🔧 **Funcional:** Não há feature flag "dual approval required for X actions" por org. Cliente regulado não consegue ligar essa salvaguarda no MVP.

---

## Gap Register Consolidado

| Gap ID | Persona | Lente | Descrição | Severidade | Root cause hipótese |
|---|---|---|---|---|---|
| **G-OP-01** | F3 (Rodrigo) | 🔧 + ⚖️ | Falta função padrão "Integrador Técnico / Dev" — todo cliente B2B com terceiro técnico recai em função custom montada na unha | **P0** | Catálogo desenhado pra papéis internos do cliente, ignora "terceiro técnico temporário" — vetor de 30%+ dos clientes enterprise |
| **G-OP-02** | F3 | 🔧 | Função custom não tem `due_date` automática (diferente do Playbooker interno em 24.5) | **P1** | Assimetria: AwSales protege internos com `due_date`, não dá mesma garantia ao cliente |
| **G-OP-03** | F3 | ⚖️ | `integration:credential:read` é tudo-ou-nada (só Admin), força anti-padrão em integrações reais | **P1** | Modelo binário sem "acesso temporário pra credencial X com audit" |
| **G-OP-04** | F3 | ⚖️ | Playground não garante sandbox de dados — não há gate `playground:no_real_data` | **P1** | Permissão de acesso desacoplada da garantia de dados sintéticos |
| **G-OP-05** | F3 | 🎯 | Cenário 26 obriga criar função custom do zero, sem duplicação — fricção de 45-60 min em fluxo comum | **P1** | Decisão de produto explícita ("não permite duplicação no MVP") trata caso raro como caso comum |
| **G-OP-06** | F4 (Mariana) | 🔧 | "Editar prompts (próprios)" é ambíguo — não há conceito de ownership de agente no catálogo | **P0** | Termo "próprios" sem definição operacional + falta permissão `agent:assign_owner` |
| **G-OP-07** | F4 | 🔧 | Workflow de aprovação de campanha inexiste — `campaign:approve` é permissão sem story de UX (submit, inbox, snapshot, escalation) | **P0** | Permissão criada sem feature subjacente — "deu permissão, dá-se por implementado" |
| **G-OP-08** | F4 | ⚖️ | Operator tem `dispatch:schedule` mas não há gate cruzado com `opt_in:check` / `lead:compliance:read` | **P1** | RBAC trata cada permissão isolada — falta regra cross-permission ("se vai disparar, valida opt-in") |
| **G-OP-09** | F4 | 🔧 | Falta função padrão "Coordinator / Team Lead" — buraco entre Operator e Manager | **P1** | Catálogo modelou 6 papéis "de manual", não captou hierarquia operacional real |
| **G-OP-10** | F5 (Henrique) | 🎯 + 🔧 | Não há tela "Aprovações Pendentes" (inbox) pro Manager — backlog invisível | **P0** | Permissão sem feature; produto assumiu que cliente externaliza workflow |
| **G-OP-11** | F5 | ⚖️ | Sem SLA configurável em `campaign:approve` nem escalation automática | **P1** | Governance features (notification D-3/D-1) só existem pro AM interno (Cenário 24.4) — assimetria interno/tenant |
| **G-OP-12** | F5 | ⚖️ | Sem dual-approval / 4-eyes feature flag pra orgs reguladas (saúde, banco) | **P1** | Modelo de permissão binária por papel não suporta "ação X requer 2 aprovações" |
| **G-OP-13** | F5 | 🔧 | Manager vê Financeiro completo — granularidade ruim pra clientes que separam ops financeiro de ops gerencial | **P2** | Matriz tratou "Financeiro" como bloco único em vez de splittar Operacional vs Estratégico |
| **G-OP-14** | F5 | 🔧 | `escalation:team:write` não tem feature de janela horária / turnos | **P2** | Permissão genérica, feature subjacente subdimensionada |
| **G-OP-15** | F3/F4/F5 | ⚖️ | Funções custom não têm revisão periódica obrigatória (drift de permissão ao longo do tempo) | **P1** | MVP sem governança de função custom — risco compliance crescente com a base |

---

## Recomendação Executiva

1. **Criar 2 funções padrão novas no seed:** **`org-integrator`** (técnico-sem-PII, com `due_date` configurável) pra fechar G-OP-01/02 e **`org-coordinator`** (Operator + aprovação) pra fechar G-OP-09. Sem isso, 60%+ dos clientes B2B caem em função custom no primeiro mês — fricção massiva + risco compliance.

2. **Permitir duplicação na criação de função custom** (reverter decisão "MVP não permite duplicação" do Cenário 26). Sem duplicação, custo de criar uma função saudável vira 1h de checkbox manual e propenso a erro — vetor de incidente real (G-OP-05).

3. **Story dedicada de "Workflow de Aprovação"** com submit/inbox/snapshot/SLA/dual-approval — permissão `campaign:approve` sem feature é meia-promessa (G-OP-07, G-OP-10, G-OP-11, G-OP-12). Reaproveitar padrão `D-3/D-1 notification` já desenhado pro AM interno (Cenário 24.4) — não inventar do zero, **portar pra tenant**.

4. **Resolver ambiguidade de "próprios"** em `agent:edit_prompt`: adicionar conceito explícito de `agent_owner_id` + permissão `agent:assign_owner` (provavelmente cabe a Manager). Sem isso, toda org com >1 agente terá interpretação inconsistente entre clientes (G-OP-06).

5. **Adicionar `due_date` opcional + revisão periódica obrigatória pra funções custom** (paridade com Playbooker interno) — fecha G-OP-02 e G-OP-15. Função custom sem dono explícito vira dark matter de compliance.

**Conclusão adversarial:** o catálogo é robusto pro **núcleo do tenant** (Admin/Manager/Operator cobrem startup com 5-15 pessoas operando 100% dentro), mas frágil em **3 padrões de mercado tão comuns que não são edge case**: terceiro técnico (todo enterprise tem), workflow de aprovação real (toda vertical regulada exige) e hierarquia operacional (todo time com >8 SDRs/atendentes precisa). Os 3 buracos compartilham a mesma root cause: **permissão foi tratada como contrato suficiente quando, na verdade, ela é só o gate — a feature subjacente (inbox, workflow, ownership, sandbox) precisa ser desenhada junto.**
