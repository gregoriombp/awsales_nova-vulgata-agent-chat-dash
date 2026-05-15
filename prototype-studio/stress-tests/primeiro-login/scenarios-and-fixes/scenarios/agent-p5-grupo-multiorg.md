# Stress Test — P5: Grupo multi-org (Holding Vitru)

**Agente:** adversarial Red Team
**Data:** 2026-05-11
**Cenários testados:** 5
**Perfil:** Ricardo Pacheco, CFO da Holding Vitru, responsável financeiro em 5 marcas educacionais (Anhanguera, UNIASSELVI, FAMA, Cruzeiro do Sul, Pitágoras). Métodos mistos por org (cartão pra implementação, boleto pra recorrência centralizada). Audit trail consolidado é compliance hard requirement (prestação de contas no conselho da holding).

## Sumário

- Passaram: 0 · Com dor: 1 · Quebraram: 4
- Total de gaps: **14** (P0: 6 · P1: 6 · P2: 2)

## Cenários

---

### P5-1: CFO Ricardo cadastra a 5ª org com e-mail já usado em outras 4

**Seed original:**
Ricardo é responsável em 5 orgs distintas (Anhanguera, UNIASSELVI, FAMA, Cruzeiro do Sul, Pitágoras). Recebe convite pra 5ª org (Pitágoras) com mesmo e-mail `ricardo@vitru.com.br`. Já tem usuário ativo nas outras 4. Sistema deveria reconhecer e vincular sem refazer setup nem duplicar no WorkOS. Story 1 Cenário 24 garante isso pra **membro** (Persona B). Mas Ricardo é **Persona A** (Responsável da org) — fluxo de 5 passos com pagamento, termo, 2FA. **Cenário 24 é Persona B, não Persona A.** Cenário 12 da Story 2 também fala "convite aceito" mas no contexto de gestão de team (não 1º acesso de Responsável).

**Walkthrough (beat-by-beat):**

1. **Beat 1 (W1-A · Boas-vindas):** Ricardo clica no link pra Pitágoras. Tela mostra "👋 Olá, Ricardo!" + card da Pitágoras. **Não há nenhuma indicação visual de que ele já tem conta no AwSales.** Não pergunta "Logar com sua conta existente?" — trata como 1º acesso completamente novo. → **GAP P5-1-A (P0).**

2. **Beat 2 (W2-A · Revisão):** Ricardo confere dados. OK. Clica em Confirmar.

3. **Beat 3 (W3-A · Pagamento Implementação):** Cartão da Holding (mesmo que ele cadastrou nas outras 4 orgs). Sistema NÃO sugere reuso de payment method de Stripe customer existente. Stripe customer ID pode ser duplicado por org (cada org isolada) ou reutilizado por user. Spec não fala. → **GAP P5-1-B (P1)** — falta especificar como Stripe customer/payment method interagem em multi-org pra Responsável.

4. **Beat 4 (W4-A · Recorrência):** Mesma pendência do payment method. Idem.

5. **Beat 5 (W5-A · Criação de conta):** Tela diz "Você está sendo cadastrado como ricardo@vitru.com.br". Mas ele JÁ existe! Mostra botão "Continuar com Google" + "Continuar com Microsoft" + criar senha local. **Se ele clica SSO Google e já tem session ativa**, o que acontece? Story 1 Cenário 7 só fala "bloqueio se e-mail SSO ≠ e-mail do convite" — não cobre "e-mail bate E usuário já existe". Sistema vai criar 2º WorkOS user? Vincular ao existente? Não está claro. → **GAP P5-1-C (P0).**

6. **Beat 6 (W6-A · Dados pessoais):** Pede Nome, Cargo, Telefone, e-mails de invoice. **Ricardo já preencheu tudo isso 4 vezes.** Story 1 Cenário 24 (multi-org Persona B) diz "nome, foto, telefone, idioma compartilhados entre orgs no nível do usuário". Mas pra Persona A o fluxo NÃO pré-preenche esses campos com dados existentes nem oferece "Usar dados do seu perfil atual". → **GAP P5-1-D (P1)** — onboarding repetitivo pra multi-org Responsável, UX hostil.

7. **Beat 7 (W7-A · Termo de uso):** Ricardo já aceitou Termo v5.3 nas outras 4 orgs. Spec não fala se aceite de termo é **por usuário** (uma vez) ou **por usuário×org** (5 vezes). Story 1 Cenário 8 fala "registra data, hora, e-mail, IP, UA" sem dizer escopo. → **GAP P5-1-E (P1)**. Argumento jurídico: termo é entre AwSales e a **pessoa jurídica** (org), então provavelmente é por org. Mas Story 1 Cenário 20 (membro) diz "termo é aceito por usuário, não herda do responsável" — sinalizando que é **por usuário**. Contradição não resolvida.

8. **Beat 8 (W8-A · 2FA):** Ricardo já tem TOTP configurado nas outras 4 orgs (mesmo dispositivo). Sistema vai forçar setup de **novo** secret TOTP pra Pitágoras? Ou reusa o TOTP existente do usuário no WorkOS? Story 1 Cenário 9 e wireframe W8-A não falam. WorkOS suporta TOTP por user (compartilhado) ou por org (separado). → **GAP P5-1-F (P0)** — UX e implementação WorkOS indefinidos. Risco: usuário acaba com 5 entradas no Google Authenticator pra mesma identidade.

**Gaps identificados:**

| ID | Severidade | Beat | Descrição | Evidência |
|---|---|---|---|---|
| P5-1-A | P0 | Beat 1 (W1-A) | Tela boas-vindas Persona A não detecta usuário existente; não oferece "logar com conta existente" | W1-A: "👋 Olá, Felipe!" assume 1º acesso. Cenário 24 só cobre Persona B. |
| P5-1-B | P1 | Beat 3 (W3-A/W4-A) | Stripe customer/payment method em multi-org pra Responsável indefinido | Nenhum cenário fala "reuse de cartão entre orgs do mesmo CFO" |
| P5-1-C | P0 | Beat 5 (W5-A) | SSO de usuário pré-existente em nova org — comportamento indefinido | C3.1, Cenário 7 só cobrem e-mail divergente; não user-já-existe |
| P5-1-D | P1 | Beat 6 (W6-A) | Dados pessoais não pré-preenchidos pra multi-org Responsável | Cenário 24 fala compartilhamento mas só pra Persona B |
| P5-1-E | P1 | Beat 7 (W7-A) | Escopo do aceite de Termo (por usuário vs. por org) indefinido | Cenário 8 (por user/org?) vs Cenário 20 (por usuário) — inconsistente |
| P5-1-F | P0 | Beat 8 (W8-A) | TOTP setup em multi-org — gera 5 secrets ou reusa? | WorkOS supports both; spec não decide |

**Status:** **QUEBROU** — 6 gaps, 3 P0. Fluxo de 5 passos foi desenhado pra "1ª vez do Responsável" sem considerar que CFOs de grupo são responsáveis em N orgs por padrão (não exceção).

**Questions abertas:**
- Stripe customer é por (user, org) ou por user?
- WorkOS user é único globalmente ou por org? Como o link convite→usuário decide?
- Termo de uso: por user, por org, ou por (user, org, version)?

---

### P5-2: Métodos de pagamento diferentes em cada org — método desejado não foi liberado

**Seed original:**
Holding Vitru tem regra hard: implementação pode ser cartão (Ricardo aprova até R$ 50k via cartão corporativo), mas plano recorrente TEM que ser boleto (passa pelo financeiro centralizado da holding pra reconciliação). Em 4 orgs já está assim configurado. Na 5ª (Pitágoras), o comercial AwSales liberou só cartão pra recorrência. Ricardo só descobre quando chega no W4-A.

**Walkthrough (beat-by-beat):**

1. **Beat 1 (W2-A · Revisão):** Tela mostra "📦 Plano · Métodos aceitos: 💳 Cartão" (boleto não listado). Ricardo vê. **Não há ação possível aqui pra mudar — só "Algo está errado?" que abre modal informativo (W2-A.1)**. Ele precisa contatar comercial. → **GAP P5-2-A (P1)** — UX dolorosa: descobrir restrição no meio do fluxo obriga abandonar e retomar depois (link válido 7 dias, mas comercial pode demorar pra responder).

2. **Beat 2:** Ricardo decide seguir e pagar a implementação (cartão). Vai pro W4-A.

3. **Beat 3 (W4-A · Recorrência):** Tela mostra "[ ✓ ] 💳 Cartão", "[   ] 🔢 PIX (não liberado pra essa org)". **Boleto não aparece nem como "não liberado".** Diferente do PIX que aparece desabilitado com label explícito, métodos não liberados que não foram considerados pelo comercial simplesmente não existem na UI. → **GAP P5-2-B (P0)** — viola princípio de comunicação clara: ausência ≠ "não liberado". Ricardo não tem feedback de que boleto é uma possibilidade que poderia ser ativada.

4. **Beat 4:** Ricardo está bloqueado. Não pode aceitar cartão (regra interna da holding). Não pode mudar pra boleto (não está liberado). Sai do fluxo pra contatar comercial. → **GAP P5-2-C (P1)** — Não há "Solicitar liberação de método X" inline. AC2 cobre Reportar divergência, mas é geral; falta caminho específico pra liberação de método.

5. **Beat 5:** Comercial libera boleto, reenvia o link. Link anterior vira W11.1 (expirado/invalidado). Ricardo recebe novo link. **Aqui mora um bug financeiro grave:** ele já pagou a implementação no link anterior. Cenário 7.2 (C7.2) diz "retomada não cobra de novo" — mas isso só vale dentro do MESMO link, não de link novo. → **GAP P5-2-D (P0)** — comportamento de "link reenviado com pagamento já realizado no link anterior" não está coberto. Risco: dupla cobrança ou pagamento órfão.

6. **Beat 6 (W4-A reiniciado):** No novo link, Ricardo vai pra W4-A. Agora aparecem cartão + boleto. Marca só boleto. Confirma. ✓

7. **Beat 7:** Sistema avança pro W5-A (criação de conta). Mas Ricardo **já criou a conta no link anterior?** Idem dúvida do payment. Pra Persona A, fluxo é sequencial com "checkpoints implícitos" — não há documentação de que estado é persistido cross-link. → **GAP P5-2-E (P1)** — retomada cross-link mal especificada.

**Gaps identificados:**

| ID | Severidade | Beat | Descrição | Evidência |
|---|---|---|---|---|
| P5-2-A | P1 | Beat 1 (W2-A) | Sem ação inline pra "esse método não foi liberado pra mim" | Modal "Algo está errado?" é genérico — joga pro AM |
| P5-2-B | P0 | Beat 3 (W4-A) | Métodos não liberados não são exibidos como "indisponível" — só somem | W4-A só mostra PIX como exemplo, mas boleto/outros podem sumir |
| P5-2-C | P1 | Beat 4 | Ausência de fluxo "pedir liberação de método" | AC2 cobre divergência genérica; falta caminho específico |
| P5-2-D | P0 | Beat 5 | Link reenviado com pagamento já feito no link anterior — comportamento indefinido | C7.2 só cobre retomada no mesmo link; reenvio invalida (Cenário 11/Story 1) sem mencionar pagamento |
| P5-2-E | P1 | Beat 7 | Estado de criação de conta em link cancelado/reenviado não preservado | Spec implícita do checkpoint |

**Status:** **QUEBROU** — 5 gaps, 2 P0. O caso "comercial liberou método errado" é EXTREMAMENTE COMUM em B2B enterprise (financeiro centralizado é regra, não exceção em grupos). Fluxo atual força abandono+retorno + risco financeiro.

**Questions abertas:**
- Como o sistema diferencia "método não disponível pra essa org" (deveria mostrar desabilitado) vs "método não suportado pelo AwSales" (não exibe)?
- Pagamento já feito em link reenviado: refund automático, crédito, ou rastreio manual via Stripe?
- Existe webhook do Stripe que vincula o charge ao novo link?

---

### P5-3: Seletor de organização — Ricardo no meio do convite, troca de org, perde o passo

**Seed original:**
Ricardo está no W6-A (dados pessoais) da 5ª org. WhatsApp toca: UNIASSELVI tem incidente, gerente pede ele aprovar liberação de função. Ele troca de org pelo seletor (header). Aprova. Volta pra Pitágoras. Cross-story: Story 1 Cenário 25 diz "retoma de onde parou" mas é pra **falha técnica**, não pra navegação intencional. O seletor W11.1 está em contexto autenticado (org já ativa). Ricardo está em "zona cinzenta": parcialmente autenticado (W5-A já foi), mas org ainda em onboarding.

**Walkthrough (beat-by-beat):**

1. **Beat 1 (W6-A):** Ricardo está preenchendo dados pessoais da Pitágoras. **Pergunta crítica: o header do fluxo de 1º acesso tem o seletor de org?** Looking at W1-A através de W10-A — wireframes mostram `[Logo]` no header sem seletor. **Só wireframes do W1-W11 do Studio (Story 2) têm o seletor.** → **GAP P5-3-A (P0)** — durante o fluxo de 1º acesso da Persona A, seletor de org provavelmente NÃO está visível. Mas Ricardo PRECISA trocar pra outras orgs (não pode ficar 5min sem responder UNIASSELVI). Como ele faz?

2. **Beat 2:** Ricardo abre nova aba, navega pra `studio.awsales.io/uniasselvi`. Se ele já está logado nas outras orgs (cookie de sessão), funciona. **Mas e a sessão de onboarding da Pitágoras?** Está em outro tab/fluxo. Se compartilha cookie de sessão WorkOS, troca de org pode invalidar onboarding em curso. → **GAP P5-3-B (P1)** — interação entre sessão autenticada existente e sessão de onboarding novo é indefinida.

3. **Beat 3:** Ricardo aprovou na UNIASSELVI, volta pra aba do onboarding Pitágoras. Idealmente continua de W6-A. Mas se a sessão de onboarding foi reciclada (timeout, conflito de cookie), volta pro W1-A. → **GAP P5-3-C (P1)** — sessão de onboarding e session timeout não documentados. Story 1 Cenário 25 cobre falha técnica, não navegação intencional.

4. **Beat 4 (cenário pior):** Ricardo finaliza o W10-A (sucesso) e cai no Studio. Agora o seletor W11.1 da Story 2 aparece. **Quantas orgs ele vê?** 4 antigas + a Pitágoras nova = 5. Funções/permissões corretas? Story 2 Cenário 12 garante isolamento — mas o login estava na Pitágoras pela 1ª vez, sessão WorkOS foi recém-criada. As outras 4 orgs assumem qual sessão? → **GAP P5-3-D (P1)** — multi-org session reconciliation pós-onboarding indefinida.

5. **Beat 5 (cenário ataque):** Ricardo NÃO finalizou o onboarding (parou no W6-A). Convite ainda válido (6 dias). Outro responsável da Pitágoras (criado também pelo comercial por engano, ou outro CFO substituto) tenta acessar com mesmo link/e-mail. Sistema deveria detectar onboarding em curso e bloquear segundo acessante. Spec não fala. → **GAP P5-3-E (P2)** — race condition multi-acesso ao mesmo convite.

**Gaps identificados:**

| ID | Severidade | Beat | Descrição | Evidência |
|---|---|---|---|---|
| P5-3-A | P0 | Beat 1 | Header de 1º acesso Persona A não tem seletor de org → Ricardo isolado | Wireframes W1-A a W10-A só mostram `[Logo]` no header |
| P5-3-B | P1 | Beat 2 | Sessão WorkOS de Ricardo (já autenticado em 4 orgs) vs sessão de onboarding — interação indefinida | Story 1 não fala de "Ricardo já tem session ativa em outra org" |
| P5-3-C | P1 | Beat 3 | Retomada após navegação intencional ≠ falha técnica — não coberto | Cenário 25 só cobre "falha técnica" |
| P5-3-D | P1 | Beat 4 | Multi-org session reconciliation pós-onboarding indefinida | Story 2 Cenário 12 fala "isolamento" mas não consolidação |
| P5-3-E | P2 | Beat 5 | Race condition: 2 acessantes no mesmo link de convite ativo | Não coberto em nenhum cenário |

**Status:** **QUEBROU** — 5 gaps, 1 P0. Persona A foi desenhada como "fluxo isolado público" sem considerar que o Responsável pode já ser usuário ativo em outras orgs e ter contexto multi-org concorrente.

**Questions abertas:**
- Cookie de sessão WorkOS é compartilhado entre subdomínios? Entre orgs?
- Onboarding em curso tem TTL próprio? Independente do session timeout?
- Header do fluxo público vai ter seletor de org se usuário já está autenticado?

---

### P5-4: Funções customizadas iguais em 5 orgs — sem propagação

**Seed original:**
Holding Vitru criou função "Auditor Interno do Grupo" com 18 permissões na Anhanguera. Cada nova org precisa recriar do zero (Story 2 Cenário 26 — sem duplicar). Ricardo recria 4 vezes mais. Cenário 30 (isolamento) garante que org A não interfere em org B, mas isolamento ≠ desejável aqui. Mudança regulatória (BACEN obriga adicionar permissão "Ver Auditoria Forense") tem que ser propagada em 5 orgs manualmente.

**Walkthrough (beat-by-beat):**

1. **Beat 1 (W7 Story 2 · Anhanguera):** Ricardo entra na Anhanguera, cria "Auditor Interno do Grupo" com 18 permissões. Salva. ✓ Funciona.

2. **Beat 2 (troca de org pelo seletor W11.1):** Vai pra UNIASSELVI. Quer mesma função. Vai em W7 (Funções). Lista vazia de custom. Clica "+ Criar nova função". **Não há "Importar de outra org" nem "Copiar de outra org".** Cenário 26 diz "cliente monta do zero". → **GAP P5-4-A (P0)** — custo de manutenção O(N orgs × M funções). Pra holding com 5+ orgs e governance compartilhado, isso é deal-breaker.

3. **Beat 3:** Ricardo recria 18 checkboxes manualmente. Erra um (esquece "Aprovações de agentes · Comentar"). UNIASSELVI tem função "Auditor Interno do Grupo" com 17 permissões (drift silencioso). → **GAP P5-4-B (P1)** — drift entre funções com mesmo nome é invisível. Não há "compare functions across orgs" nem warning.

4. **Beat 4:** Ricardo repete 3 vezes mais (FAMA, Cruzeiro, Pitágoras). 5 versões diferentes da mesma função.

5. **Beat 5 (mudança regulatória):** BACEN publica norma exigindo permissão "Ver Auditoria Forense" pra auditores internos de instituições financeiras. Ricardo precisa atualizar 5 orgs. Vai em cada uma, edita função, marca a permissão. **Mas FAMA tem 17 permissões e as outras têm 18. Ele percebe a diferença?** Spec não tem visão consolidada cross-org de funções. → **GAP P5-4-C (P0)** — sem visão consolidada, compliance multi-org é manual e propenso a erro.

6. **Beat 6 (audit de compliance):** Auditor externo pede prova de que "Auditor Interno do Grupo" tem mesmas permissões em todas as 5 orgs. Ricardo tem que abrir 5 modais e fazer print de cada. → **GAP P5-4-D (P1)** — sem export consolidado de funções/permissões cross-org, audit externo vira trabalho manual.

**Gaps identificados:**

| ID | Severidade | Beat | Descrição | Evidência |
|---|---|---|---|---|
| P5-4-A | P0 | Beat 2 | Sem importar/copiar função cross-org no MVP | Cenário 26 explicitamente proíbe duplicação; isolamento bloqueia cross-org |
| P5-4-B | P1 | Beat 3 | Drift silencioso entre funções homônimas em orgs diferentes | Nenhum cenário cobre detecção de drift |
| P5-4-C | P0 | Beat 5 | Sem visão consolidada cross-org pra propagação de mudanças regulatórias | Cenário 30 (isolamento) bloqueia visão consolidada |
| P5-4-D | P1 | Beat 6 | Export de função/permissões só por org — audit externo vira manual | Nenhum cenário cobre export cross-org |

**Status:** **QUEBROU** — 4 gaps, 2 P0. Cenário 30 garante isolamento técnico (correto pra security multi-tenant), mas **isolamento ≠ inviabilidade de UX cross-org pra dono da holding**. Falta camada "grupo de orgs" ou pelo menos templates compartilhados.

**Questions abertas:**
- Existe entidade "holding/grupo" planejada pra futuro? Se sim, isso muda o desenho do MVP?
- Templates de função (não copy mas blueprint) são considerados in-scope ou out-of-scope?
- BACEN/LGPD obriga sincronização de permissões cross-entidade do mesmo grupo econômico?

---

### P5-5: Audit trail consolidado entre 5 orgs — Ricardo quer ver atividade dele agregada

**Seed original:**
Como CFO de 5 orgs, Ricardo precisa de relatório mensal de TODAS as suas ações em TODAS as orgs pra prestação de contas no conselho da holding (LGPD + governance interna). Wireframe W5 (Visualizar usuário) tem audit trail por org. Sem visão cross-org → 5 CSVs separados pra Excel manual.

**Walkthrough (beat-by-beat):**

1. **Beat 1 (W5 Story 2 · Anhanguera):** Ricardo abre próprio perfil ou outro admin abre "Visualizar usuário" pra ele. Tela mostra audit trail filtrado por período. Clica "Exportar CSV". Baixa 4500 linhas (movimento mensal). ✓

2. **Beat 2:** Troca pra UNIASSELVI via seletor. Idem. Outro CSV de 3200 linhas. Diferente.

3. **Beat 3:** Repete 3x mais. Total: 5 CSVs com formatos potencialmente divergentes (timestamp em GMT-3 BRT em todas? cabeçalhos iguais?). Spec não garante formato consistente cross-org. → **GAP P5-5-A (P1)** — schema do CSV de export não está documentado; risco de inconsistência cross-org.

4. **Beat 4:** Ricardo abre Excel, concatena os 5 CSVs. Mas precisa adicionar coluna "Organização" manualmente em cada — **os CSVs individuais não têm essa coluna porque o contexto é implícito** (você está no escopo de uma org). → **GAP P5-5-B (P0)** — CSV de audit trail provavelmente não inclui coluna `organization_id` ou `organization_name` (porque é implícito por contexto), tornando consolidação manual obrigatória.

5. **Beat 5:** Auditor pede: "mostre todas as ações do Ricardo Pacheco classificadas como 'mudança de função', em qualquer org, em Q1/2026". Ricardo precisa abrir 5 modais, aplicar filtro "tipo de ação = mudança de função" + período Q1, exportar 5x. → **GAP P5-5-C (P0)** — sem busca cross-org, response time pra auditoria explode.

6. **Beat 6 (alerta proativo):** Ricardo cometeu erro: aprovou disparo de R$ 80k na FAMA achando que era Cruzeiro do Sul. Audit trail registra em FAMA. **Mas Ricardo nem percebe o erro até a fatura do mês.** Não há "Resumo semanal das suas ações em todas as orgs" enviado por e-mail. → **GAP P5-5-D (P2)** — observabilidade proativa cross-org não está em escopo. Out-of-scope razoável pro MVP, mas vale registrar.

7. **Beat 7 (LGPD):** Ricardo faz request de "todos os meus dados pessoais no AwSales" (direito do titular LGPD). Sistema deveria retornar dados de TODAS as orgs onde ele está. **Story 1 Cenário 24 fala "nome, foto, telefone, idioma compartilhados no nível do usuário" — então tecnicamente são 1 registro. Mas audit trail é por (user, org) — então 5 registros.** Resposta LGPD precisa abranger todos. Spec não fala. → **GAP P5-5-E (P0)** — LGPD response cross-org indefinida.

**Gaps identificados:**

| ID | Severidade | Beat | Descrição | Evidência |
|---|---|---|---|---|
| P5-5-A | P1 | Beat 3 | Schema do CSV exportado não documentado — risco de inconsistência cross-org | Cenários Q7/Q8 falam de "exporta CSV assíncrono" sem detalhar colunas |
| P5-5-B | P0 | Beat 4 | CSV individual não inclui `organization_id` → consolidação manual obrigatória | Wireframe W5 não mostra coluna org no preview |
| P5-5-C | P0 | Beat 5 | Sem busca/filtro cross-org no audit trail | Filtros no W5 são intra-org |
| P5-5-D | P2 | Beat 6 | Sem digest proativo cross-org (out-of-scope razoável) | Não coberto, mas relevante registrar |
| P5-5-E | P0 | Beat 7 | LGPD data subject request cross-org indefinida | Cenário 24 só fala "compartilhamento de dados pessoais" — audit é por org |

**Status:** **QUEBROU** — 5 gaps, 3 P0. Audit trail foi desenhado pra "1 org = 1 contexto", o que é correto pra single-tenant view mas **viola requisitos LGPD pra holdings e governance pra CFOs multi-org**.

**Questions abertas:**
- LGPD: response cross-org é obrigatória pra MVP ou pode esperar?
- Audit trail tem `organization_id` no schema do banco? (provável que sim, mas export não expõe)
- Templates de relatório agregados cross-org são in-scope da Story de Audit Trail (separada) ou desta?

---

## Anti-claims aplicáveis (não geraram gap)

- **AC2:** Não criei gap específico pra "API de Reportar divergência" porque é placeholder MVP. Mas GAP P5-2-C (pedir liberação de método) é diferente — é UX inline, não API backend.
- **AC4:** Não criei gap pra "duplicar função padrão" porque é explicitamente AC4. Mas GAP P5-4-A (importar função cross-org da mesma holding) é orthogonal — não é duplicar padrão.
- **AC6:** SCIM não é escopo. Não criei gap por isso, mesmo que SCIM resolveria parte de P5-4 e P5-5.

## Síntese

P5 expõe que o desenho **ignora que CFOs de grupo (perfil enterprise normal, não exceção) operam em N orgs simultaneamente**. As 2 stories tratam multi-org como "1 usuário pode estar em várias orgs" (técnico correto) mas não como "1 usuário OPERA várias orgs concorrentemente" (UX/governance).

Os 6 P0 distribuem-se em 4 dimensões:
- **Identidade cross-org:** P5-1-A, P5-1-C, P5-1-F (3 gaps de WorkOS/SSO/2FA)
- **Pagamento cross-org:** P5-2-B, P5-2-D (Stripe customer + reenvio de link)
- **Sessão cross-org:** P5-3-A (seletor durante onboarding)
- **Compliance cross-org:** P5-4-A, P5-4-C, P5-5-B, P5-5-C, P5-5-E (audit + propagação)

Compliance é o pilar mais quebrado — 5 P0s. Risco direto: holding educacional (Vitru é cliente realista) tem requisitos BACEN + LGPD agressivos. AwSales sem visão cross-org perde esse perfil pra concorrente que tem.
