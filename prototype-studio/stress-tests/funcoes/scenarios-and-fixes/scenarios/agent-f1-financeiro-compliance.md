# Agent F1 — Red Team Financeiro / Compliance

> **Missão:** Quebrar o catálogo de funções padrão da Story 2 (Cenários 24.1–24.6) com 3 personas adversárias que estressam o eixo Financeiro + Compliance.
>
> **SUT:** 6 funções tenant (Admin / Manager / Operator / Analyst / Viewer / DPO) + 5 internas. Matriz de verdade = Cenário 24.2.
>
> **Data:** 2026-05-12 · **Reviewer:** Red Team adversarial · **Status:** análise inicial

---

## PERSONA F1 — Carlos Tavares · TPF Contábil (contador externo terceirizado)

**Contexto concreto.** Magalu Pré-Sales Ltda (org `magalu-presales` no Studio, plano Enterprise R$ 95k/mês) contratou a TPF Contábil pra fazer fechamento mensal + escrituração SPED-Contribuições + entrega EFD-Reinf. Carlos Tavares (CRC-SP 1SP-302.184), e-mail `carlos.tavares@tpfcontabil.com.br`, vai precisar acessar o painel da Magalu por **3 meses renováveis** (contrato 2026-05-12 → 2026-08-12). A diretora financeira da Magalu (Renata Souza, `org-admin`) abre o Studio pra convidar.

### BEAT 1 — Renata abre Configurações → Equipe → Convidar e tenta escolher função

- Renata digita `carlos.tavares@tpfcontabil.com.br` no campo de convite, dropdown de função abre. Vê: **Admin · Manager · Operator · Analyst · Viewer · DPO**. Pensa: "Carlos precisa ver fatura, baixar PDF, ver cupom, e exportar audit financeiro pra Receita."
- **Admin** → dá troca de cartão, IAM, ver agente, ver conversa, ver PII completo. **Overkill catastrófico** — Carlos é EXTERNO, vai ver lead, conversa de cliente final, prompt do agente. LGPD Art. 7º (finalidade) explodindo.
- **Manager** → vê Financeiro mas **NÃO troca cartão** (✓ ok), aplica cupom (✓ ok pra fechamento), MAS também: convida membros, opera agentes, edita prompts, dispara campanha, vê lead com PII parcial. **Continua overkill** — Carlos é contador, não opera agente nem convida ninguém.
- **Analyst** → vê Financeiro (✓), mas **NÃO aplica cupom** (×), **NÃO exporta audit financeiro CSV** (×, é só do Admin/DPO). Falha pro caso de uso de fechamento contábil.
- **Viewer** → vê Financeiro **mascarado**. Carlos não consegue nem ver o valor da fatura corretamente (CNPJ do tomador mascarado quebra a NF). Fail.
- **DPO** → vê audit financeiro export (✓!) MAS também aplica Legal Hold, revoga consentimento, vê PII operacional de leads. Atribuir DPO a um contador externo é absurdo regulatório (DPO é cargo formal LGPD Art. 41).
- **🔧 Funcional:** **nenhuma das 6 funções padrão modela "contador externo somente Financeiro read+export"**. Caminho real é Renata criar função custom (Cenário 26). Cenário 26 obriga partir do zero (sem duplicação) — Renata vai gastar 15–25 min montando o checkbox-grid e tem chance alta de errar (deixar `lead:read` ligado por engano, por exemplo).
- **⚖️ Compliance:** se Renata atribui Manager por preguiça (caso comum em SMB), Carlos vê PII de lead. Tomador externo com acesso a PII operacional = violação de finalidade (LGPD Art. 6º I) + risco de incidente reportável à ANPD se Carlos vazar. Sem função padrão "Financeiro-only", o caminho de menor resistência é inseguro por default — **violação do princípio "secure by default"**.
- **🎯 UX:** dropdown de 6 funções não comunica que "nenhuma serve, você precisa custom". Renata vai escolher a menos pior por inferência, sem feedback. Cenário 24 lista funções mas não tem affordance "criar custom" no mesmo fluxo de invite — exige sair do invite, ir em Funções, criar, voltar.

### BEAT 2 — Renata desiste e tenta criar função custom "Contador TPF" via Cenário 26

- Vai em **Configurações → Funções → + Criar nova função**. Tela abre vazia. Lista TODAS as permissões agrupadas em 17 grupos visuais (Cenário 24.1). Renata precisa marcar manualmente:
  - Financeiro: Visualizar (✓), Visualizar cupom/voucher (✓), Aplicar cupom (?), Audit Financeiro Visualizar (✓), Audit Financeiro Exportar CSV (✓ ⚡).
  - DEIXAR DESMARCADO: tudo de Agentes / Campanhas / Conversas / Leads / Privacy / IAM / Org / Offboarding.
- **🔧 Funcional:** Cenário 26 explicitamente diz **"não permite partir de duplicação"** — Renata monta do zero. Pra org Enterprise grande isso é fricção crítica. **Onde está o template "Contador" pré-pronto?** Não existe.
- **🔧 Funcional crítico:** ao marcar `audit:financeiro:export` ⚡ Carlos vai conseguir exportar CSV com **PII de quem aprovou o cupom (executor.nome, executor.email)** — Cenário 24.1 lista `pii:read` como permissão SEPARADA mas o catálogo **não diz se export financeiro respeita o mask de pii:read**. Se export traz nomes em claro, Carlos sai com base de funcionários da Magalu. Se não traz, contador não consegue conciliar quem autorizou desconto (necessário pra auditoria interna).
- **⚖️ Compliance:** sem campo de **data de expiração de função/membership** (story menciona offboarding mas não TTL de acesso). Carlos fica com acesso após o contrato terminar até alguém lembrar de inativar. LGPD Art. 16 (eliminação após fim do tratamento) furado.
- **🎯 UX:** sem busca/filtro de permissão no Cenário 26 (não confirmado, mas inferindo de "lista todas agrupadas por domínio"), Renata percorre 17 grupos × ~5 ações cada = ~85 checkboxes. Erro humano garantido.

### BEAT 3 — Carlos faz login pela 1ª vez e tenta baixar fatura PDF #INV-2026-04-1234

- Carlos loga, vai em Financeiro. Vê lista de faturas. Clica em **INV-2026-04-1234** (R$ 95.000,00 + R$ 12.847,30 variable + cupom `BF2025` de -R$ 5.000,00 = R$ 102.847,30 líquido).
- Permissão `invoice:read` ✓ → vê detalhe. Tenta baixar PDF. Catálogo cobre `invoice:read` mas **não tem permissão explícita "download PDF da fatura"** — assume-se que é parte do `:read`. Funciona, mas:
- **🔧 Funcional:** PDF da fatura inclui CNPJ tomador (Magalu), CNPJ prestador (AwSales), valor — ok. Mas a NF-e fiscal real é emitida pelo provider de pagamento (Stripe? Asaas?). **O catálogo não distingue "fatura proforma do Studio" de "NF-e fiscal" — Carlos precisa da NF-e pra escriturar.** Onde busca? Provavelmente integração externa. Gap descoberto: catálogo é incompleto sobre artefato fiscal.
- **⚖️ Compliance:** PDF inclui histórico do cupom `BF2025 — aplicado por Renata Souza em 2026-04-12 às 14:23`. Carlos vê o nome da CFO da Magalu. **Vazamento de PII de funcionário interno pra contador externo via PDF.** Se a função custom marcou `invoice:read` mas NÃO `pii:read`, o PDF deveria mascarar "executor.nome" — mas o catálogo **não especifica** se PDF/CSV honram mask.

### BEAT 4 — Carlos clica em "Exportar Audit Trail Financeiro CSV" pra entregar à Receita

- Permissão `audit:financeiro:export` ⚡ marcada → modal LGPD aparece (catálogo Cenário 24.1 nota 4). Carlos confirma. CSV gera.
- **🔧 Funcional:** CSV inclui linhas com `actor.nome=Renata Souza`, `actor.email=renata@magalu.com.br`, `target.cupom=BF2025`, `valor=-5000`, `ip=200.221.x.x`. **Sem mask = PII de funcionário da Magalu sai pra contador externo.** Carlos arquiva em servidor da TPF (mas e se a TPF tiver incidente?).
- **⚖️ Compliance CRÍTICO:** modal LGPD do export menciona "vai gerar evento de audit" mas **não pergunta a finalidade do export** nem registra "destino: TPF Contábil — terceiro" no audit. ANPD em fiscalização vai perguntar "por que esse export saiu pra um e-mail externo?" e a Magalu não tem resposta estruturada.
- **🎯 UX:** depois de exportar, Carlos não tem affordance pra **re-baixar** o CSV (sai por e-mail? download direto?). Catálogo não especifica entrega do export.

### BEAT 5 — Renata tenta revogar acesso de Carlos no dia 2026-08-12 (fim do contrato)

- Vai em Equipe, busca Carlos, clica **Inativar membro** (`membership:unlink`). Funciona.
- **🔧 Funcional:** **inativação é manual** — não tem TTL/data de expiração no convite. Se Renata sair de férias / esquecer / mudar de empresa, Carlos fica com acesso. Cenário 24.5 tem `due_date` automático pra **Playbooker** interno, mas **NÃO tem equivalente pra externo terceirizado convidado**.
- **⚖️ Compliance:** se Carlos exportou audit CSV no dia 2026-08-11 (dia anterior à inativação) e a TPF não destruiu o CSV, dados continuam fora do controle da Magalu. Catálogo não fala em "purga obrigatória de exports gerados por usuário inativado".

---

## PERSONA F2 — Mariana Silva · Quinto Andar (CFO interno do cliente)

**Contexto concreto.** Quinto Andar (org `quintoandar-corp`, plano Enterprise Custom R$ 180k fixo/mês + variable médio R$ 42k/mês, ARR AwSales R$ 2.66MM). Mariana Silva (CFO, e-mail `mariana.silva@quintoandar.com.br`) precisa controle financeiro **total**: trocar cartão corporativo Itaú, aplicar cupom enterprise, ver fatura, audit, contrato. **E NEGOCIOU contratualmente** com a AwSales: disparos > R$ 50k por campanha precisam aprovação prévia dela (gate financeiro de 4 olhos). Ela **NÃO quer** ver agente individual, conversa, lead, prompt — não é o trabalho dela e LGPD ela quer estar fora do mapa de quem acessa PII.

### BEAT 1 — Admin tenta atribuir função pra Mariana

- Pedro (`org-admin` da Quinto Andar) vai em Equipe → Convidar. Dropdown 6 funções.
- **Admin** → cobre tudo Financeiro (✓) MAS dá acesso a Agentes, Conversas, Leads, PII, IAM. Mariana **explicitamente** não quer estar no mapa de PII (postura conservadora pra DPO interno proteger ela). Atribuir Admin a CFO viola **least privilege** e o desejo expresso da pessoa.
- **Manager** → vê Financeiro (✓) mas **NÃO troca cartão** (×) — quebra o caso de uso primário da CFO. Também não exporta audit financeiro CSV (×) — CFO precisa pro board mensal. Falha dura.
- **Analyst / Viewer / DPO / Operator** → não cabem.
- **🔧 Funcional:** **nenhuma função padrão modela "Financeiro completo SEM ver operação"**. Admin é overkill, Manager é underkill no eixo Financeiro. Gap clássico de RBAC granular faltando "função vertical-Financeiro completa".
- **⚖️ Compliance:** atribuir Admin pra contornar = CFO entra no log de acesso a PII de leads sem ter motivo legítimo. Em auditoria LGPD ANPD, "por que CFO acessa lead?" não tem resposta. Risco institucional.
- **🎯 UX:** Pedro não tem como criar custom rapidamente em meio ao invite (mesmo problema F1 BEAT 1).

### BEAT 2 — Pedro cria função custom "CFO Plus" partindo do zero

- Marca: Financeiro inteiro (`subscription:read`, `invoice:read`, `invoice:pay` ⚡, `coupon:apply`, `payment_method:write` ⚡, `payment_method:set_default`, `audit:financeiro:read`, `audit:financeiro:export` ⚡). Dashboard (`dashboard:read`). Organização (`organization:read`, `organization_contract:write`). Notificações (`notification:read`).
- DEIXA DESMARCADO: Agentes, Bases, Campanhas, Conversas, Atendimento, Leads, Playground, Privacy, Equipe, Funções, Integrações, Offboarding.
- **🔧 Funcional:** Cenário 24.1 lista `organization_contract:write` mas Mariana precisa **assinar** contrato/aditivo. Assinatura digital é fluxo separado? Catálogo não cobre.
- **🔧 Funcional crítico:** **não há permissão "Aprovar disparo > R$ X"** em lugar nenhum do catálogo. Cenário 24.1 grupo Campanhas tem `campaign:approve` ⚡ (gate de governança da campanha em si) e `dispatch:schedule` ⚡ (dispara), mas **gate financeiro de valor (threshold-based approval)** não existe. Mariana não consegue executar o controle que negociou contratualmente. **Hard fail da promessa enterprise.**
- **⚖️ Compliance:** controle interno SOX/IFRS-equivalent (Quinto Andar tem auditoria externa Big4) exige segregation of duties em pagamentos > threshold. Sem o gate, descumprimento do controle financeiro interno da QA → achado de auditoria → impacto reputacional.
- **🎯 UX:** "CFO Plus" criada por Pedro mas Mariana vê dashboard operacional cheio de gráfico de agente/conversa que ela explicitamente não quer ver. **Sem dashboard "executive" filtrado por escopo Financeiro.**

### BEAT 3 — Mariana loga, vê fatura de abril (R$ 247.392,18) e quer entender drift

- Fatura veio R$ 67k acima da média (fixo R$ 180k + variable médio R$ 42k = R$ 222k esperado). Diff de R$ 25k. Mariana quer drill-down: "qual campanha estourou? quem aprovou? quando?"
- **🔧 Funcional:** ela tem `audit:financeiro:read` ✓. Vai em audit, vê eventos `dispatch.scheduled` de campanhas X, Y, Z com `cost_estimated`. Mas o audit financeiro mostra **valor estimado no momento do disparo**, não **valor realizado**. Diff entre estimado e realizado (token usage variável) **não tem permissão dedicada** — está no Dashboard operacional que ela não quer abrir.
- **🔧 Funcional:** sem **alerta proativo "drift de gasto > 15% vs forecast"** vinculado à função de CFO. Mariana descobre no fechamento mensal, atrasado.
- **⚖️ Compliance:** SLA contratual da AwSales fala em "transparência de cobrança". CFO sem visão de drift em tempo real = quebra de trust enterprise. (Não é violação regulatória, é violação de promessa de produto.)
- **🎯 UX:** audit trail é text-heavy, sem agregação por campanha. CFO esperaria gráfico tipo "gasto por campanha mês a mês" — não tem.

### BEAT 4 — Time de Marketing tenta disparar campanha "Black May" estimada em R$ 73k

- João (Operator) cria campanha, calcula estimativa R$ 73k. Aperta "Disparar em massa" ⚡ (`dispatch:schedule`).
- **🔧 Funcional CRÍTICO:** **dispara sem passar pelo gate da Mariana**. Catálogo Cenário 24.2 permite Operator disparar (✓) sem aprovação financeira condicional. Mariana fica sabendo só no audit pós-fato, R$ 73k já comprometidos.
- **⚖️ Compliance:** controle de 4 olhos contratado não foi implementado → cláusula SLA violada → desconto contratual ou litígio. AwSales não pode prometer enterprise gate sem ter no catálogo.
- **🎯 UX:** Operator João nem viu warning "disparo > threshold definido pela org". Sem feedback no UI.

### BEAT 5 — Mariana tenta trocar o cartão Itaú porque virou Visa Infinite Empresarial

- Vai em Financeiro → Métodos de Pagamento → Adicionar novo. Tem permissão `payment_method:write` ⚡. Modal abre (Stripe/Asaas).
- **🔧 Funcional:** funciona se a integração está ok. Catálogo cobre.
- **⚖️ Compliance:** evento de audit `payment_method.added` gera com `actor=Mariana` — ok. **Mas catálogo não exige 2FA step-up pra trocar cartão.** Cenário 33–34 cobre 2FA obrigatório de login geral, não step-up por ação. Adversário com sessão sequestrada da Mariana troca o cartão pra um próprio.
- **🎯 UX:** depois de adicionar, "Definir como padrão" é ação separada (`payment_method:set_default`). Mariana esquece, fatura seguinte vai no Itaú antigo, falha cobrança, suspensão de serviço. Cenário não cobre auto-set-default no add.

### BEAT 6 — Auditoria SOX-like externa pede "lista de quem tem permissão financeira"

- DPO interno da QA precisa gerar relatório "todos os usuários com Financeiro·Pagar". Vai em Funções → "CFO Plus" → ver usuários atribuídos.
- **🔧 Funcional:** Cenário 24 mostra coluna "# Usuários ativos" na listagem de funções. Drill-down de "quem tem permissão X" exige ir função-por-função. **Não há query reversa "lista todos os usuários que têm `invoice:pay`"** documentada no catálogo. Pra Enterprise com 40+ usuários e 8 funções custom, é caçada manual.
- **⚖️ Compliance:** relatório de "users with privileged access" é entregável padrão de auditoria SOX/ISO27001. Catálogo precisa expor isso.

---

## PERSONA F6 — Patrícia Reis · Lefosse Cyber (auditora LGPD externa)

**Contexto concreto.** Mútua Saúde (org `mutua-saude`, operadora de plano de saúde, 380k beneficiários) contratou Lefosse Cyber pra auditoria LGPD de 6 meses (2026-05-12 → 2026-11-12). Patrícia Reis (OAB-SP 412.337, encarregada Lefosse, e-mail `patricia.reis@lefosse.com`) é a auditora líder. Mútua é setor regulado (ANS Resolução Normativa 581 + LGPD Art. 11 dados sensíveis de saúde). Patrícia precisa: audit trail completo **com PII desmascarado** (pra confrontar com listagem ANPD), ver consentimentos registrados, ver DSARs em andamento, exportar audit CSV. **NÃO pode**: revogar consentimento (sem mandato legal), aplicar Legal Hold (decisão do DPO interno da Mútua), ler conversa operacional (escopo só compliance, não comercial).

### BEAT 1 — DPO interno (Júlia, `org-dpo`) tenta atribuir função pra Patrícia

- Vai em Equipe → Convidar. Dropdown 6 funções.
- **DPO** → tem TUDO de Privacy: `pii:read` ✓, `consent:revoke` ⚡ ✓, `legal_hold:write` ⚡ ✓, `dsar:write` ✓, `retention:write` ✓, audit financeiro export ✓, conversation export ✓. **Overkill jurídico catastrófico.** Patrícia é AUDITORA, não tem mandato pra revogar consentimento de beneficiário. Se ela errar um clique, revoga consentimento de 380k pessoas. Atribuir DPO a externa = transferir cargo formal LGPD Art. 41 (que é nominal, registrado na ANPD) pra terceiro — **irregular**.
- **Admin** → vê tudo, inclusive Financeiro e Agentes. Não é o escopo.
- **Viewer** → vê tudo mascarado. Patrícia **precisa** desmascarado pra cruzar com base ANPD. Fail dura.
- **Analyst / Manager / Operator** → nem chegam perto.
- **🔧 Funcional:** **falta função "DPO Read-Only" / "Auditor LGPD"** — read completo de Privacy (audit, consent, DSAR, retenção, PII desmascarado) **sem** poderes de write (revoke, legal hold, retention policy edit). Gap explícito e óbvio.
- **⚖️ Compliance CRÍTICO:** atribuir DPO a externo confunde papel formal (Art. 41 é cargo nominal da org) com permissão técnica. ANPD em fiscalização pode questionar "quem é o DPO de fato?" e a Mútua tem 2 pessoas com slug `org-dpo` no Studio — Júlia (DPO real) e Patrícia (auditora externa). Confusão regulatória.
- **🎯 UX:** Júlia, DPO experiente, vai sentir o gap imediatamente. Mas em Mútuas menores onde DPO é júnior, vai dar Admin "pra resolver" — pior cenário.

### BEAT 2 — Júlia cria função custom "Auditor LGPD — Lefosse"

- Cenário 26: zero do zero. Marca: Privacy `audit:read` ✓, `consent:read` ✓, `dsar:read` ✓, `pii:read` ⚡ ✓ (precisa desmascarado), `export:read` ✓. Conversas `conversation:read` (sem `:export`). Deixa desmarcado tudo de write Privacy + tudo operacional.
- **🔧 Funcional:** funciona em tese. Mas Cenário 24.1 marca `pii:read` ⚡ como sensível — assume-se que **TODA visualização de PII desmascarado gera audit event**. Pra auditora que vai navegar 6 meses, log vai inflacionar. Não tem "modo auditoria" com sessão marcada (`audit_session_id`) pra agregar todos os acessos sob um único motivo.
- **⚖️ Compliance:** ANPD vai querer ver "todos os acessos PII de Patrícia" no audit — exige query agregada. Catálogo não modela "session-scoped audit grouping".
- **🎯 UX:** Júlia gasta 20 min montando custom. Sem template "Auditor LGPD", reusa em cada nova auditoria.

### BEAT 3 — Patrícia loga, navega audit, encontra evento `lead.consent.given` de beneficiário Marcos Pereira

- Audit mostra `actor=Marcos Pereira`, `actor.email=marcos.pereira@gmail.com`, `action=consent.given`, `purpose=marketing_offers`, `ip=187.x.x.x`, `timestamp=2026-03-14T10:23Z`. Patrícia vê **PII desmascarado** ✓.
- Tenta clicar no consentimento pra ver formulário original (texto + checkbox que Marcos marcou).
- **🔧 Funcional:** `consent:read` ✓ mostra dados estruturados, mas **o catálogo não diz se o snapshot do formulário no momento do consentimento está acessível**. ANPD Resolução 4/2023 exige "provar que o titular consentiu DAQUELE texto NAQUELE momento". Se sistema só guarda `purpose_id`, prova é frágil.
- **⚖️ Compliance:** sem snapshot do form = consentimento inválido em juízo. Gap regulatório real.

### BEAT 4 — Patrícia tenta cruzar audit trail com lista de DSARs em andamento

- `dsar:read` ✓ → lista DSARs. Vê 14 abertos (LGPD Art. 18). Para cada, vê requisitante, data, status, prazo legal (15 dias úteis).
- **🔧 Funcional:** OK. Mas Patrícia quer **exportar lista de DSARs com motivo + status pra report ANPD**. Catálogo lista `export:read` (com redação) mas **não tem "exportar lista de DSARs"** explícito. Ela exporta audit CSV inteiro? Vai vir muita coisa fora de escopo.
- **🎯 UX:** sem export segmentado por sub-grupo (só DSAR, só consent, só legal hold), o relatório vira filtragem manual no Excel.

### BEAT 5 — Patrícia exporta audit CSV de privacy (escopo: últimos 90 dias, todos eventos consent + DSAR + pii_access)

- `export:read` ✓ — modal LGPD aparece. Confirma. CSV gera (~840k linhas, Mútua é grande).
- **🔧 Funcional:** CSV traz PII desmascarado (porque a função tem `pii:read`). 840k linhas com CPF, nome, e-mail de beneficiários sai pra servidor da Lefosse. **A AwSales tem responsabilidade solidária por esse vazamento** se a Lefosse tiver incidente (LGPD Art. 42 e 44).
- **⚖️ Compliance CRÍTICO:** modal LGPD do export **não exige**: (a) finalidade declarada, (b) destinação registrada (Lefosse), (c) prazo de retenção pelo terceiro, (d) confirmação de DPA (Data Processing Agreement) entre Mútua e Lefosse. Audit registra que "Patrícia exportou" mas não amarra a um contrato DPA versionado.
- **⚖️ Compliance:** **sem watermarking do CSV** (CSV não traz "exported by Patrícia Reis em 2026-06-04 às 14:23 — escopo Mútua/Lefosse DPA-v2"). Se vazar, é difícil provar origem.
- **🎯 UX:** download direto sem confirmação dupla pra export > N linhas (840k é grande). Risco de export acidental.

### BEAT 6 — Contrato Lefosse acaba em 2026-11-12. Júlia precisa revogar Patrícia

- Acesso de Patrícia precisa parar **automaticamente** em 2026-11-12. Júlia precisa lembrar e inativar manualmente (mesmo gap do F1 BEAT 5).
- **🔧 Funcional:** sem TTL/`access_expires_at` no convite/membership. Mesma falha sistêmica do F1.
- **⚖️ Compliance:** se Patrícia continua acessando audit + PII após fim do contrato sem mandato → tratamento de dados sem base legal → infração LGPD Art. 7º. ANPD multa.
- **🎯 UX:** sem alerta "acesso temporário expira em D-3 / D-1" pro DPO. Sem painel "membros com acesso temporário ativo".

### BEAT 7 — Patrícia clica acidentalmente em "Revogar consentimento" de Marcos Pereira

- Espera-se que Patrícia NÃO tenha `consent:revoke` ⚡ (Júlia desmarcou). Verificação no backend retorna 403. UI esconde o botão? Catálogo não fala.
- **🔧 Funcional:** assumindo gate ok, 403 funciona. Mas se UI **mostra** o botão (porque é DPO genérico) e backend bloqueia, gera frustration + suporte ticket. Cenário 24.1 nota 1 diz "Visualizar acessa a tela; ações de escrita são gates separados" — bom — mas **UI condicional ao set de permissões** não é explicitada como requisito de implementação. Risco de UI vazada de capability que não tem.

---

## Gap Register consolidado

| Gap ID | Persona | Lente | Descrição | Severidade | Root cause hipótese |
|---|---|---|---|---|---|
| **G-FIN-01** | F1, F2 | 🔧 Funcional | **Falta função padrão "Financeiro dedicado" / "Billing Manager"** (visualizar fatura + cupom + audit + export + trocar cartão, SEM operacional). Manager fica curto, Admin overkill. | **P0** | Catálogo modelado por persona organizacional (Admin/Manager/Operator) e não por vertical funcional. Financeiro virou "extra" do Admin/Manager. |
| **G-FIN-02** | F1, F2, F6 | 🔧 Funcional | **Sem TTL / `access_expires_at`** no membership ou convite. Acesso de externos (contador, auditor, consultor) só revoga manual. | **P0** | Cenário 24.5 tem `due_date` automático só pra Playbooker interno. Não generalizou pra externos. |
| **G-PRIV-01** | F6 | 🔧 + ⚖️ | **Falta "DPO Read-Only" / "Auditor LGPD"** — read completo Privacy (audit, consent, DSAR, PII) sem write (revoke, legal hold). Único DPO padrão é write-tudo. | **P0** | Catálogo confundiu cargo formal (DPO Art. 41) com perfil técnico (read-only audit). |
| **G-FIN-03** | F2 | 🔧 + ⚖️ | **Sem gate financeiro de aprovação por threshold** (ex: disparo > R$ X exige aprovação CFO). `campaign:approve` é gate de campanha, não de valor. | **P0** | Cenário 24.1 modelou approve binário, não condicional a valor. SOX/4-eyes não pensado. |
| **G-EXP-01** | F1, F6 | ⚖️ Compliance | **Export de CSV/PDF não exige declaração de finalidade + destinação + DPA versionado**. Modal LGPD só registra "exportou", não amarra contrato. | **P0** | Modal de export pensado como avisinho LGPD, não como gate de governança de tratamento. LGPD Art. 42/44 (responsabilidade solidária) não considerada. |
| **G-EXP-02** | F1, F6 | ⚖️ Compliance | **Catálogo não especifica se PDF/CSV honram mask de `pii:read`**. Função sem `pii:read` pode receber PII via export se feature não implementar dupla checagem. | **P1** | Permissões `:export` e `pii:read` modeladas como ortogonais — falta regra explícita "export herda mask se pii:read=off". |
| **G-EXP-03** | F6 | ⚖️ Compliance | **Sem watermarking de CSV/PDF exportado** (ator + data + escopo + DPA ID). Vazamento posterior intraqueável. | **P1** | Não foi requisito de produto até agora. |
| **G-UX-01** | F1, F2, F6 | 🎯 UX | **Cenário 26 não permite duplicar função padrão** como ponto de partida. Renata/Pedro/Júlia montam custom do zero, ~85 checkboxes. | **P1** | Decisão de produto explícita ("não permite partir de duplicação"). Reavaliar — duplicar+ajustar é UX padrão da indústria. |
| **G-UX-02** | F1, F2, F6 | 🎯 UX | **Templates de função custom não existem** (ex: "Contador externo", "Auditor LGPD", "CFO"). Cliente reinventa toda vez. | **P1** | Roadmap não previu library de templates. Easy win. |
| **G-FIN-04** | F2 | 🔧 + ⚖️ | **Sem step-up 2FA pra ação sensível Financeiro** (trocar cartão, exportar audit). Cenário 33 cobre 2FA login, não por ação. | **P1** | Modelo de auth não previu step-up granular. |
| **G-FIN-05** | F2 | 🔧 Funcional | **Sem dashboard "Executive view"** filtrado por escopo Financeiro (gasto/campanha, drift estimado×realizado, forecast). CFO precisa abrir Dashboard operacional cheio de ruído. | **P1** | Dashboard pensado pra Ops, não pra Finance. |
| **G-FIN-06** | F2 | 🔧 Funcional | **Sem alerta proativo "drift > X% vs forecast"** vinculado a função CFO. CFO descobre no fechamento. | **P2** | Sistema de notificações não tem trigger financeiro. |
| **G-PRIV-02** | F6 | ⚖️ Compliance | **Snapshot do formulário no momento do consentimento** não está garantido no catálogo. Sem ele, prova de consentimento é frágil. | **P1** | Modelo de consent pode estar guardando só `purpose_id`, não texto-versão. |
| **G-PRIV-03** | F6 | 🔧 Funcional | **Sem "audit session grouping"** — auditor que navega 6 meses gera milhares de eventos `pii.access` sem amarração a sessão de auditoria. | **P2** | Audit modelado por evento atômico, não por sessão. |
| **G-AUDIT-01** | F2 | 🔧 Funcional | **Sem query reversa "lista de usuários com permissão X"**. Drill-down só função-por-função. SOX/ISO27001 querem por permissão. | **P1** | Catálogo só mostra # usuários por função. |
| **G-IAM-01** | F6 | 🎯 + ⚖️ | **UI pode mostrar capability sem ter permissão** (botão "revogar consentimento" aparece pra "Auditor LGPD" gated só no backend). Frustration + risco de social engineering. | **P2** | Cenário 24.1 nota 1 fala em gate backend, não em UI condicional. |
| **G-INVOICE-01** | F1 | 🔧 Funcional | **Catálogo confunde "fatura proforma Studio" com "NF-e fiscal"**. Contador precisa NF-e pra escriturar; catálogo não trata onde busca. | **P2** | Integração fiscal não mapeada no escopo de Story 2. |
| **G-PAY-01** | F2 | 🎯 UX | **Adicionar método de pagamento não vira default automaticamente**. Risco de falha de cobrança na fatura seguinte. | **P2** | Permissões `payment_method:write` e `:set_default` separadas — ação dupla obrigatória sem warning. |
| **G-OFF-01** | F1, F6 | ⚖️ Compliance | **Quando membership é inativada, exports já gerados por aquele user não são purgados**. Dados continuam fora do controle. | **P1** | Catálogo trata acesso, não trata "dados que saíram pela mão dessa pessoa". |

---

## Recomendação executiva (Onda 1)

1. **Criar 2 novas funções padrão** no seed inicial: `org-billing` (Financeiro dedicado, cobre F1+F2 contador e CFO básico) e `org-auditor` (Privacy read-only desmascarado, cobre F6 auditor externo). Reduz drasticamente uso de custom + ataque por overkill. Ataca G-FIN-01 + G-PRIV-01 (2 P0).
2. **Introduzir `access_expires_at` no membership** (toggle "Acesso temporário até [data]" no invite) + job diário de revogação automática + notificação D-7/D-3/D-1 pro admin. Resolve G-FIN-02 (P0) e elimina classe inteira de "esqueci de revogar externo" que é o vetor #1 de vazamento em SMB.
3. **Refatorar modal de export (CSV/PDF) pra gate de governança real**: campo obrigatório "finalidade" + destinação (interno/terceiro + nome) + checkbox "tenho DPA ativo com este destinatário" + watermark no artefato exportado (ator/data/escopo/DPA-id). Ataca G-EXP-01 + G-EXP-03 (1 P0 + 1 P1). Reduz risco de responsabilidade solidária LGPD Art. 42/44.
4. **Adicionar `dispatch_approval_threshold`** como configuração de org (R$ X exige aprovação de função Y antes de `dispatch:schedule`). Resolve G-FIN-03 (P0) e destrava promessa enterprise de 4-eyes/SOX. Sem isso, AwSales não pode vender controle financeiro pra cliente regulado.
5. **Permitir duplicar função padrão como ponto de partida no Cenário 26** + criar library de templates ("Contador", "Auditor LGPD", "CFO", "Suporte Cliente Externo"). Ataca G-UX-01 + G-UX-02 (2 P1) com effort baixo e impacto alto na adoção/segurança (cliente erra menos quando parte de template seguro).

> **Conclusão Red Team:** o catálogo atual é **organizacionalmente correto pra ops interno** (Admin/Manager/Operator/Analyst/Viewer faz sentido pra equipe que opera). Mas **falha sistematicamente pra qualquer relação com terceiros** (contador, auditor, consultor) e pra **separação CFO ↔ Ops**. Onda 1 tem que fechar o eixo Financeiro/Compliance antes de GA Enterprise — senão a AwSales vai perder primeiro contrato regulado por achado de compliance, não por bug.
