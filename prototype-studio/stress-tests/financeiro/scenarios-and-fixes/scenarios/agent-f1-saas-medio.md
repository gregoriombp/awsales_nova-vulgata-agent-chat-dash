# Stress Test Financeiro — F1: SaaS médio (Fyntra Tecnologia)

**Agente:** adversarial Red Team com lente tripla (Funcional + Compliance + UX)
**Data:** 2026-05-11
**Perfil:** Fyntra Tecnologia · CTO Felipe Rezende · R$ 2.500/mês plano + variável
**Cenários testados:** 5

## Sumário

- **Passaram:** 0 · **Com dor:** 1 · **Quebraram:** 4
- **Total de gaps:** 22 (P0: 6 · P1: 11 · P2: 5)
- **Por lente:** Funcional 9 · Compliance 7 · UX 6

**Top 3 gaps críticos (P0):**
1. **G-F1-4.2** — Audit trail não anonimiza retroativamente dados de ex-funcionário sob direito ao apagamento (LGPD Art. 18 VI); CSV exporta dados que deveriam estar redacted.
2. **G-F1-3.2** — Mensagem de erro de cupom em currency mismatch é genérica (lista 4 motivos possíveis); cliente não sabe qual aplica (CDC Art. 6º III informação clara + Nielsen H9).
3. **G-F1-2.1** — Filtros (período + toggle Por serviço/campanha) são resetados ao navegar pra sub-tela "Métodos de pagamento" e voltar (Nielsen H3 + perda de produtividade).

---

## Cenários

### F1-1: Filtro "Mês passado" mas gráfico mostra "Este mês"

**Seed original:** Felipe muda filtro de data pra "Mês passado" pra ver consumo de abril, mas o gráfico re-renderiza com label "Período: 01/05/2026 a 31/05/2026" (não atualizou).

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Felipe está em `Configurações → Financeiro → Visão Geral`. Filtro default = "Este mês" (01/05–31/05/2026). Gráfico mostra R$ 891,63 em gastos variáveis (mai/26). Tabela detalhada Por serviço mostra 9 linhas. Audit trail no rodapé mostra eventos de mai/26.
2. **Ação:** Felipe abre o dropdown `[Período: Este mês ▼]` e clica em "Mês passado" pra ver consumo de abril (quando ele teve o pico de Black Friday Lead).
3. **SUT processa:** Frontend dispara request com `start=2026-04-01&end=2026-04-30`. Cards "Gastos variáveis utilizados" e "Próxima cobrança" recebem novos valores. **MAS o componente unificado de gráfico+tabela usa um cache local de estado anterior** e o label de período no header do gráfico **não é controlled prop** — fica preso em "01/05/2026 a 31/05/2026". Tabela detalhada atualiza valores mas mantém ordenação stale do mês de maio. 🔧 Bug clássico de **dois `useState` dessincronizados** (label do header vs dados do gráfico). ⚖ **CDC Art. 6º III** — informação ambígua sobre o período cobrado (cliente pode interpretar que está vendo maio quando vê abril, ou vice-versa). 🎯 **Nielsen H1** (Visibilidade do estado do sistema) **VIOLADA** — UI mostra dois estados conflitantes simultaneamente.
4. **Resposta esperada:** Header do gráfico deve mostrar "Período: 01/04/2026 a 30/04/2026", barras do gráfico devem refletir consumo de abril, tabela detalhada deve reordenar pra mostrar maiores gastos do mês de abril, audit trail no rodapé deve filtrar eventos de abril, cards "Gastos variáveis utilizados" deve mostrar valor de abril (R$ 5.230,11 segundo histórico de faturas).
5. **O que aconteceu:** Felipe vê gráfico com header "01/05/2026 a 31/05/2026" (errado) + tabela detalhada com valores de abril (certo) + card "Gastos variáveis utilizados" mostrando R$ 5.230,11 (certo, abril) + audit trail no rodapé NÃO atualizou (continua mostrando eventos de hoje 11/05). Felipe confuso liga pro Bruno Costa: "qual período eu tô vendo? abril ou maio?". Bruno também não consegue responder olhando o screenshot — pede repro.
6. **Side effect na soma:** O claim F1.8 ("Soma da tabela bate com card de gastos variáveis utilizados") **passa formalmente** (R$ 5.230,11 bate), mas a soma do gráfico (eyeballing as barras com label de maio) **não bate** com nada. 🔧 Claim F1.7 ("Filtro atualiza simultaneamente gráfico + tabela + cards") **quebrado** — não é simultâneo, é **parcial**.
7. **Side effect no audit trail:** Audit trail contextual no rodapé tem seu próprio dropdown de período. Não fica claro se ele **espelha** o filtro principal ou é independente. No wireframe W1, linha 129, existem `[Período ▾]` separados pro audit trail. 🎯 **Nielsen H4** (Consistência) — dois filtros de período na mesma tela com mesma label causam ambiguidade.
8. **Tentativa de recovery:** Felipe clica de novo em "Este mês" pra voltar e tentar de novo. Label volta pra "01/05/2026 a 31/05/2026", mas agora barras do gráfico ficam stale (mostram dados de abril por 800ms até refetch). 🔧 Falta de **loading state** durante refetch.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência (beat) |
|----|-------|-----------|------------|----------------|------------------|
| G-F1-1.1 | 🔧 Funcional | Label do período no header do gráfico não é controlled por prop sincronizada — usa estado local desincronizado | P0 | claim F1.7 violado | #3 |
| G-F1-1.2 | 🔧 Funcional | Audit trail no rodapé não sincroniza com filtro principal de data — tem dropdown próprio sem regra clara de espelhamento | P1 | claim F1.5 ambíguo | #7 |
| G-F1-1.3 | 🎯 UX | Dois estados conflitantes simultâneos (header maio + dados abril) violam visibilidade do estado | P0 | Nielsen H1 | #3, #5 |
| G-F1-1.4 | 🎯 UX | Falta loading state durante refetch — barras stale por ~800ms confundem o usuário | P2 | Nielsen H1 | #8 |
| G-F1-1.5 | ⚖ Compliance | Período exibido ambíguo viola direito à informação clara sobre cobrança | P1 | CDC Art. 6º III | #3 |
| G-F1-1.6 | 🎯 UX | Dois filtros "Período" na mesma tela (geral + audit trail) violam consistência | P2 | Nielsen H4 | #7 |

**Status:** ❌ Quebrou

**Questions abertas:**
- O audit trail no rodapé deve **herdar** o período do filtro principal por default, ou ter seu próprio estado independente? (recomendação: herdar com opção de override explícito)
- Spec define **DoD de simultaneidade** (`<500ms` no claim F1.2)? Não — adicionar tolerância de tempo nos critérios de aceite.

---

### F1-2: Pagamento — clica em "Trocar cartão" mas perde contexto

**Seed original:** Felipe está na visão geral, clica em "✎ Trocar" no card de fatura. Vai pra sub-tela `metodos-pagamento`. Adiciona novo cartão via Stripe Elements, sucesso, mas ao voltar o filtro de data foi resetado pra "Este mês" e o toggle voltou pra "Por serviço".

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Felipe está em Visão Geral com filtro "Últimos 90 dias" + toggle "Por campanha" + busca aplicada "Black Friday" + ordenação por valor desc + scroll position ~600px (vendo histórico de faturas). Card de fatura atual mostra `•••• 3012 [✎ Trocar]`.
2. **Ação:** Felipe clica em `[✎ Trocar]` no card de fatura porque o cartão vai expirar em 30 dias e ele quer atualizar.
3. **SUT processa:** Frontend navega pra rota `/configuracoes/financeiro/metodos-pagamento` (W6). **Não preserva** query params da rota anterior. 🔧 Padrão de navegação imperativo sem state preservation. ⚖ **(borderline)** CDC Art. 6º III — fricção operacional. 🎯 **Nielsen H3** (User control & freedom) VIOLADA.
4. **Sub-tela carrega:** Lista mostra Visa •••• 3012 (padrão) e Mastercard •••• 8888 (secundário). Felipe clica em "+ Adicionar novo cartão". Modal abre com iframe Stripe Elements.
5. **Felipe adiciona cartão:** Digita novo Visa •••• 7777, valida, submete. Stripe retorna sucesso. Modal fecha. Felipe vê linha nova na lista. Clica em "Tornar padrão" no novo cartão. Confirma com modal de double-check (claim U1.5).
6. **Webhook Stripe:** Webhook `customer.source.updated` chega ao backend. Backend atualiza `default_payment_method`. Audit trail registra `cartao.padrao_mudou`. ✓ Funcional OK até aqui.
7. **Felipe quer voltar pra Visão Geral:** Clica em "« Configurações / Financeiro" no breadcrumb (W6 linha 410). **Volta pra rota base** `/configuracoes/financeiro` que renderiza Visão Geral **com state default**: filtro "Este mês", toggle "Por serviço", sem busca, sem ordenação, scroll top. 🔧 Perdeu **5 estados** de UI simultaneamente. 🎯 **Nielsen H3** confirmada. 🎯 **Nielsen H7** (Flexibilidade & eficiência) VIOLADA — power user perde produtividade.
8. **Side effect — re-filtrar é trabalho real:** Felipe gastou 30s recompondo filtros porque tinha aberto a Trocar Cartão em meio de uma análise de Black Friday. Multiplique por N clientes × M sessions = horas/mês perdidas. 🎯 Friction cost mensurável.
9. **Side effect compliance:** Felipe não consegue **verificar imediatamente** se o card "Fatura atual" agora reflete o novo cartão como meio de pagamento. ⚖ **CDC Art. 6º III** — visibilidade de cobrança degradada por fluxo navegacional. **(borderline)**
10. **Side effect mais sério — onde está confirmação que cartão foi trocado pra fatura ATUAL?:** Spec não diz se troca de cartão padrão re-tenta automaticamente a fatura `PAYMENT_FAILED` mais recente, ou se só serve pras próximas. 🔧 Ambíguo. 🎯 **Nielsen H10** (Help & docs) — falta tooltip explicando "este novo cartão será usado pras próximas faturas. Faturas em PAYMENT_FAILED já abertas continuam com o cartão original — entre em contato com o suporte pra retry manual".

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência (beat) |
|----|-------|-----------|------------|----------------|------------------|
| G-F1-2.1 | 🎯 UX | Filtros (período, toggle, busca, ordenação) e scroll position resetam ao voltar de sub-tela — perda de contexto ofensiva pra power users | P0 | Nielsen H3 + H7 | #7 |
| G-F1-2.2 | 🔧 Funcional | Rota `/configuracoes/financeiro/metodos-pagamento` não preserva query params do referrer | P1 | claim U1.3 violado | #3 |
| G-F1-2.3 | 🎯 UX | Falta tooltip/info explicando se troca de cartão impacta faturas em aberto (PAYMENT_FAILED) ou só próximas | P1 | Nielsen H10 | #10 |
| G-F1-2.4 | 🔧 Funcional | Spec não define comportamento de retry automático de fatura PAYMENT_FAILED após troca de cartão padrão | P1 | gap em F1.3 | #10 |
| G-F1-2.5 | ⚖ Compliance | Ambiguidade sobre meio de pagamento ativo pra fatura em aberto após troca degrada direito à informação clara | P2 | CDC Art. 6º III | #9 |

**Status:** ❌ Quebrou

**Questions abertas:**
- A rota de Métodos de Pagamento deveria abrir em **drawer/side panel** em vez de sub-tela full page? Resolve preservação de estado naturalmente.
- Troca de cartão padrão dispara retry automático em faturas em `PAYMENT_FAILED`? Spec atual silente.

---

### F1-3: Créditos — aplica cupom válido mas em moeda errada

**Seed original:** Felipe recebe código `BF2025USD` por e-mail (criado em USD pra outro tier). Aplica no campo da Saldo de Créditos. Stripe retorna `coupon_currency_mismatch`.

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Felipe está em `Configurações → Financeiro → Saldo de Créditos` (W5). Org da Fyntra opera em BRL (cadastrada via Stripe BR). Felipe recebeu por e-mail (do time comercial AwSales) um código `BF2025USD` que foi criado pra outro tier (tier internacional em USD) e mandado por engano pra ele.
2. **Ação:** Felipe digita `BF2025USD` no campo "Aplicar código de cupom" (W5 linha 335) e clica `[Aplicar →]`.
3. **SUT processa:** Frontend valida formato (alfanumérico OK). Backend chama Stripe `coupon.retrieve(BF2025USD)`. Stripe retorna cupom **existe**, **está ACTIVE**, **não atingiu max_redemptions**, **MAS** `currency = USD` enquanto a org tem `currency = BRL`. Stripe API retorna erro `coupon_currency_mismatch`. 🔧 Validação técnica funciona, problema é a mensagem.
4. **UI exibe:** Modal `W5.2` (linhas 384–400) — **mensagem genérica em forma de bullet list dos 4 motivos possíveis**:
   - "Cupom expirado (validade venceu em 31/12/2025), ou"
   - "Cupom não encontrado, ou"
   - "Cupom já atingiu limite de uso, ou"
   - "Cupom não é compatível com sua moeda (BRL)"
5. **Felipe processa a mensagem:** Felipe NÃO SABE qual dos 4 motivos aplica. A UI mostrou os 4 motivos com **ou** entre cada um. Felipe pensa "será que o código tá errado? será que expirou? será que já alguém da empresa usou?". Tenta de novo, mesmo resultado. 🎯 **Nielsen H9 VIOLADA** — mensagem de erro NÃO é específica, é uma lista de possibilidades. ⚖ **CDC Art. 6º III VIOLADA** — informação clara e adequada não foi entregue. Felipe precisaria ler MUITO atento e fazer o match mental "BF2025**USD**" → moeda errada.
6. **Side effect — comercial AwSales:** Felipe escreve pro Bruno Costa "olha, o cupom que você me mandou não tá funcionando, manda outro". Bruno olha, percebe que mandou o cupom errado. Custo operacional: 15min de Bruno + Felipe perdidos. Felipe fica com má impressão. 🎯 Reputation cost.
7. **Side effect — Stripe retornou razão específica, mas UI escondeu:** Backend tem a razão exata (`coupon_currency_mismatch`). Story Cenário 15 (linha 296) declara "se inválido: mensagem específica do erro (`Cupom expirado`, `Cupom não encontrado`, `Cupom já atingiu limite de uso`, `Cupom não é compatível com sua moeda`)". Mas wireframe W5.2 contradiz a story e mostra mensagem genérica em lista. 🔧 **Inconsistência story ↔ wireframe** — wireframe é a evidência visual da implementação e está errado.
8. **Side effect compliance — moeda múltipla:** Spec não menciona se org pode receber NF em moeda diferente da operação. Em compliance brasileira, **cliente brasileiro paga em BRL** independente da moeda do produto. Aplicação de cupom USD pra customer BRL é incompatibilidade comercial, mas SUT não educa o cliente sobre isso. 🎯 **Nielsen H10** (Help & docs) — falta link "saiba mais sobre moedas e cupons".
9. **Side effect audit trail:** Felipe tenta 3x. Cada tentativa gera evento `cupom.aplicacao_falhou` (mencionado em Q3, linha 470). 3 eventos quase idênticos no audit trail. 🎯 **Nielsen H8** (Design minimalista) — poluição. **(P2)**
10. **Recovery:** Não há link "fale com seu Gerente da Conta" no modal de erro (W5.2 só tem `[Entendi]`). Cenário Q3 menciona "botão pra contato Gerente da Conta" mas só pro erro "inesperado". 🎯 Inconsistência de tratamento. Felipe precisa sair do fluxo e procurar contato em outro lugar.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência (beat) |
|----|-------|-----------|------------|----------------|------------------|
| G-F1-3.1 | 🔧 Funcional | Wireframe W5.2 contradiz Story Cenário 15 — wireframe mostra lista genérica de 4 motivos quando story prevê mensagem específica | P0 | claim F1.4 violado | #4, #7 |
| G-F1-3.2 | ⚖ Compliance | Mensagem ambígua de erro de cupom (4 motivos com "ou") viola direito à informação clara sobre desconto/cobrança | P0 | CDC Art. 6º III | #5 |
| G-F1-3.3 | 🎯 UX | Mensagem de erro não-específica viola heurística de recuperação de erros — usuário não sabe o que fazer | P0 | Nielsen H9 | #5 |
| G-F1-3.4 | 🎯 UX | Falta link "Fale com Gerente da Conta" no modal de erro de cupom inválido — recovery não acionável | P1 | Nielsen H9 + H10 | #10 |
| G-F1-3.5 | 🎯 UX | Cada tentativa falha gera evento no audit trail — pode poluir trilha com retries do mesmo erro | P2 | Nielsen H8 | #9 |
| G-F1-3.6 | 🔧 Funcional | Backend não faz preflight check de currency antes de chamar Stripe — poderia retornar erro específico mais rápido sem queimar request Stripe | P2 | otimização | #3 |

**Status:** ❌ Quebrou

**Questions abertas:**
- Story diz mensagem específica, wireframe diz genérica — qual é a verdade? PG precisa decidir. Recomendação: **específica** (alinha com claim F1.4 + CDC + Nielsen).
- Existe risco de **enumeration attack** ao retornar mensagem específica? (atacante pode descobrir códigos válidos enviando força bruta e diferenciando "expirado" de "não encontrado"). **Considerar throttling + retornar "Cupom não disponível pra esta org"** em vez de "Cupom não encontrado" pra todos os casos que envolvem código não-válido pra esta org.

---

### F1-4: Audit Trail — exporta últimos 30 dias mas janela de retenção foi violada por DSR

**Seed original:** Felipe quer exportar dia 30/05. Filtro "Últimos 30 dias" inclui dados pessoais de funcionário que foi demitido em 15/05 e exerceu direito de "ser esquecido" via DPO. Cliente exporta o CSV — CSV contém dados que deveriam ter sido anonimizados.

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Em 15/05, Maria Rocha (ex-membro da org Fyntra com permissão `Financeiro · Gerenciar`) foi demitida. Em 18/05, Maria exerceu direito ao apagamento via DPO da Fyntra → DPO da AwSales. AwSales **anonimizou** o registro de Maria (`user_id` → `[USUÁRIO ANONIMIZADO]`, `email` → `[REMOVIDO]`, IP → `[REMOVIDO]`) **no banco transacional** mas o audit trail financeiro **não foi alterado** porque "retenção 5 anos LGPD" (Story 3 claim C1.4) é declarada como obrigatória.
2. **Ação:** Em 30/05, Felipe vai em Audit Trail Financeiro, filtra "Últimos 30 dias" (cobre 30/04 a 30/05), clica `[📥 Exportar CSV]`.
3. **SUT processa:** Modal LGPD W8 abre. Felipe marca checkbox de ciência. Clica `[Exportar CSV agora →]`. Backend gera CSV com 245 linhas. **NÃO aplica filtro retroativo de DSR.** Linhas de Maria (de 01/05 até 14/05) ainda têm `executor = "Cliente · Maria R."`, IP da Maria, e-mail da Maria nos metadata. 🔧 **Bug crítico de compliance** — DSR não foi propagado ao audit trail.
4. **Conflito legal explícito:** LGPD Art. 16 (retenção pra cumprimento obrigação legal) **permite** manter audit trail. MAS Art. 18 VI (direito ao apagamento) prevalece sobre dados que **não são necessários** pra a obrigação legal. **Dados pessoais identificáveis** (nome, e-mail, IP) **não são necessários** pra cumprir o propósito de "prova de auditoria" — basta um identifier opaco. Lei exige **pseudonimização**, não retenção do PII em claro. ⚖ **LGPD Art. 18 VI + Art. 13** (anonimização como alternativa).
5. **Side effect compliance — Fyntra fica em risco também:** Fyntra é controlador. Ao exportar CSV com dados de Maria, Fyntra está **re-criando uma cópia** dos dados anonimizados. Se Felipe compartilha CSV com contador externo, **vazamento de PII**. ⚖ **LGPD Art. 48** (notificação de incidente) — pode disparar obrigação de comunicação à ANPD.
6. **Side effect UX — sem aviso pré-export:** Modal LGPD W8 fala "este export contém dados financeiros e pessoais protegidos pela LGPD", mas **não menciona** que pode conter dados de pessoas que exerceram direito ao apagamento. 🎯 **Nielsen H1 + H10** — usuário não sabe que o export contém "fantasmas". ⚖ **LGPD Art. 9º** (consentimento informado) — consentimento é dado sem informação completa.
7. **Side effect operacional:** Não há **dashboard de DSR** no AwSales pra DPO/admin verificar quais users foram apagados. DPO da AwSales recebe pedido via e-mail, executa SQL manual, **não há trilha de propagação**. 🔧 Falta de fluxo de DSR end-to-end. **(P0 backend, fora do escopo Story 3 — anotar como pré-requisito)**.
8. **Side effect audit trail recursivo:** Não existe evento canônico `audit_trail.dsr_anonimizacao_aplicada` no catálogo do Cenário 17 (Story 3 linhas 360–365). 🔧 Falta evento de meta-audit pra rastrear quando DSR foi aplicado num registro de audit trail. ⚖ **LGPD Art. 38** (relatório de impacto) precisa dessa rastreabilidade.
9. **Hash de integridade compromete remediação:** Story claim C1.4 declara "hash SHA-256 do CSV pra integridade probatória". Se aplicarmos anonimização retroativa, o hash do CSV exportado em 30/05 vai **diferir** de um hash gerado em 18/05 (antes da anonimização da Maria). Isso **invalida** integridade probatória de exports anteriores. 🔧 Conflito entre **immutability probatória** e **direito ao apagamento**. Solução: anonimização cria nova versão imutável + audit log de quando foi aplicada.
10. **Resposta esperada (correta):** No filtro "Últimos 30 dias", linhas de Maria (entre 01/05 e 14/05) deveriam aparecer como `executor = "Cliente · [USUÁRIO ANONIMIZADO]"`, IP `[REMOVIDO]`, e-mail `[REMOVIDO]`. CSV deveria ter mesma anonimização. Banner no header do audit trail: "3 registros nesta janela foram anonimizados em conformidade com solicitações LGPD (Art. 18 VI)". Modal LGPD pré-export deveria mencionar esse fato.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência (beat) |
|----|-------|-----------|------------|----------------|------------------|
| G-F1-4.1 | 🔧 Funcional | Backend de audit trail não aplica anonimização retroativa após DSR — exporta PII de users apagados | P0 | claim C1.5 violado | #3, #5 |
| G-F1-4.2 | ⚖ Compliance | Audit trail viola direito ao apagamento (LGPD Art. 18 VI) ao reter PII identificável quando pseudonimização atende propósito probatório | P0 | LGPD Art. 18 VI + Art. 13 | #4 |
| G-F1-4.3 | ⚖ Compliance | Export sem aviso sobre presença de dados anonimizados vicia consentimento informado | P1 | LGPD Art. 9º | #6 |
| G-F1-4.4 | 🔧 Funcional | Catálogo de eventos canônicos (Cenário 17) não inclui `audit_trail.dsr_anonimizacao_aplicada` — sem rastreabilidade de aplicação de DSR | P1 | LGPD Art. 38 | #8 |
| G-F1-4.5 | 🔧 Funcional | Conflito hash SHA-256 imutável vs anonimização retroativa não está resolvido na spec | P1 | claim C1.4 ambíguo | #9 |
| G-F1-4.6 | 🎯 UX | Modal LGPD W8 não menciona possibilidade de registros anonimizados no export | P2 | Nielsen H10 | #6 |
| G-F1-4.7 | ⚖ Compliance | Sem fluxo formal de DSR end-to-end (recebimento → anonimização → propagação → notificação) | P0 | LGPD Art. 18 §3º + Art. 48 | #7 |

**Status:** ❌ Quebrou

**Questions abertas:**
- **Política de pseudonimização**: AwSales mantém `user_id` como identifier opaco (mantendo unicidade pra agregações) e zera `name`, `email`, `ip`, ou apaga `user_id` também? Recomendação ANPD: pseudonimização atende, anonimização total tira utilidade analítica.
- **Hash de integridade**: ao aplicar DSR, gerar **dois hashes**: hash do registro original (preservado em cofre criptografado pra prova legal se solicitado por autoridade) + hash do registro pseudonimizado (visível no audit trail normal).
- **Notificação ao titular**: quando DSR é aplicado, o titular (Maria) recebe confirmação? AwSales tem fluxo? Spec atual silente.

---

### F1-5: Plano — clica "Solicitar alteração" mas modal não tem evidência de envio

**Seed original:** Felipe clica em "Solicitar alteração de plano" no Modal Detalhes do Plano. Modal mostra contato do Bruno Costa (gerente da conta). Felipe pensa "ok, e agora?" — não fica claro se o sistema notificou o Bruno automaticamente ou se Felipe precisa contatar manualmente.

**Walkthrough (beat-by-beat com 3 lentes):**

1. **Setup:** Felipe abre modal `Detalhes do plano` (W2). Vê Plano Enterprise, status ACTIVE, R$ 2.497,98/mês. Vê box com contato `Bruno Costa · bruno.costa@awsales.io`. Vê dois botões em segunda linha: `(Solicitar alteração de plano)` e `(Solicitar cancelamento)`, ambos com nota "↳ placeholders informativos — abrem modal com contato".
2. **Ação:** Felipe clica em `(Solicitar alteração de plano)` porque quer fazer downgrade pra Pro temporariamente (corte de custos).
3. **SUT processa:** Frontend abre um **novo modal/dialog informativo** (segundo a nota da W2 linha 181). Conteúdo do modal: "Pra alterar o plano, entre em contato com seu Gerente da Conta: Bruno Costa · bruno.costa@awsales.io".
4. **Felipe processa:** Felipe lê o modal e fica em dúvida:
   - "Esse modal só tá informando ou está enviando algo pro Bruno automaticamente?"
   - "Devo eu mandar e-mail pro Bruno agora ou já foi enviado?"
   - "Se eu fechar este modal, vai sumir o registro?"
   - 🎯 **Nielsen H1 VIOLADA** — visibilidade do estado do sistema é zero.
5. **Cenário A — placeholder puro (intenção atual da spec):** Modal é só informativo. NADA é enviado automaticamente. Felipe deve copiar manualmente o e-mail e mandar request pro Bruno. ⚖ **CDC Art. 6º III** — informação clara não foi entregue ("o que acontece após eu clicar?"). 🎯 **Nielsen H10** — falta de feedback explícito leva à interpretação ambígua.
6. **Cenário B — fluxo melhorado (recomendação):** Modal deveria deixar EXPLÍCITO: "**Este é apenas um aviso** — pra abrir uma solicitação, clique no botão abaixo e enviaremos um e-mail ao Bruno em seu nome com os detalhes da sua conta". Ou ainda melhor: formulário inline com `motivo`, `plano desejado`, `data sugerida` + botão `[Enviar solicitação]`.
7. **Side effect — engajamento de feature pós-MVP:** Story menciona métrica secundária "Taxa de cliques em 'Solicitar alteração de plano' (placeholder informativo) — sinaliza demanda pra futura feature de self-service" (linha 545). Se o placeholder gera frustração, a métrica fica **viciada** (clique não significa demanda, significa confusão). 🔧 Métrica não confiável.
8. **Side effect — onde fica registrado o clique?:** Spec não menciona evento auditável `plano.solicitacao_alteracao_clicada` no catálogo Cenário 17. 🔧 Sem audit trail do clique, AwSales depende de tracking de UI (Mixpanel/Heap) que **não tem retenção 5 anos**. ⚖ Para fins de **CDC Art. 42 §único** (cobrança indevida — cliente solicitou alteração e cobrança não foi ajustada), prova fica fraca.
9. **Side effect — múltiplos pontos de contato:** Wireframe W2 já mostra contato do Bruno em **dois lugares**: (a) box `👤 Bruno Costa · ✉ bruno.costa@awsales.io` (linhas 174–177), (b) modal de placeholder após clique. 🎯 **Nielsen H8** (Design minimalista) — redundância sem propósito claro.
10. **Side effect — accessibility do botão placeholder:** Botão `(Solicitar alteração de plano)` usa parênteses em vez de colchetes (`[ ]`), indicando "secundário" segundo legenda da wireframe. Mas WCAG 2.1 AA exige que **botão tenha aparência clara de botão clicável** independente de hierarquia. 🎯 **WCAG 2.1 AA — discernabilidade** se a diferença visual entre "primário" e "placeholder informativo" não for **explícita** (não basta só sutil mudança de cor — exige label semântica).
11. **Side effect compliance — fidelidade declarada na W2:** Linha 165 mostra "Fidelidade 12 meses · multa 50% (8 meses rest.)". Se Felipe clica "Solicitar cancelamento" e o placeholder só mostra contato do Bruno, **não há disclaimer claro** sobre a multa de 50%. ⚖ **CDC Art. 52** (taxa de antecipação/multa) exige **destaque ostensivo** do valor da multa em qualquer iniciação de cancelamento. 🔧 Wireframe W2 mostra fidelidade no detalhe geral, mas o placeholder de cancelamento não re-exibe a multa especificamente como aviso.

**Gaps identificados:**

| ID | Lente | Descrição | Severidade | Lei/Heurística | Evidência (beat) |
|----|-------|-----------|------------|----------------|------------------|
| G-F1-5.1 | 🎯 UX | Placeholder "Solicitar alteração" não comunica se algo foi enviado ou se é só informativo — viola visibilidade do estado | P1 | Nielsen H1 | #4, #5 |
| G-F1-5.2 | ⚖ Compliance | Sem feedback claro sobre o que acontece após clique viola direito à informação clara | P1 | CDC Art. 6º III | #5 |
| G-F1-5.3 | 🎯 UX | Modal informativo redundante (contato já está exibido no modal principal) viola design minimalista | P2 | Nielsen H8 | #9 |
| G-F1-5.4 | 🔧 Funcional | Clique em "Solicitar alteração" não gera evento auditável — só tracking UI sem retenção legal | P1 | gap em F1.5 + CDC Art. 42 §único | #8 |
| G-F1-5.5 | 🎯 UX | Métrica "taxa de cliques em placeholder" fica viciada por confusão UX, não demanda real | P2 | métrica inválida | #7 |
| G-F1-5.6 | ⚖ Compliance | Placeholder "Solicitar cancelamento" não re-exibe destaque ostensivo da multa de fidelidade | P1 | CDC Art. 52 + Art. 6º III | #11 |
| G-F1-5.7 | 🎯 UX | Diferenciação visual entre botão funcional `[...]` e placeholder `(...)` pode não ser discernível pra screen readers/WCAG AA | P2 | WCAG 2.1 AA + Nielsen H4 | #10 |
| G-F1-5.8 | 🔧 Funcional | Sem formulário inline (motivo, plano desejado, data) — fluxo depende de cliente lembrar de mandar e-mail manualmente fora do app | P1 | claim F1.6 frágil | #6 |

**Status:** ⚠️ Passou com dor

**Questions abertas:**
- Substituir placeholder por **formulário inline** que gera e-mail/Slack/Linear automático pro Bruno? Story aceita esse upgrade no MVP ou empurra pra próxima?
- Diferenciação visual entre botão funcional e placeholder informativo: **mockup específico no Figma** com tooltip/badge "informativo" — ou rebatizar como link `[Como solicitar alteração?]`?
- Registrar evento auditável `plano.solicitacao_alteracao_iniciada` no catálogo Cenário 17 — garante retenção 5 anos + prova legal pra disputas CDC.

---

## Conclusão

Os 5 cenários revelaram **22 gaps** com forte distribuição em Funcional (9) e Compliance (7), e UX (6). **4 quebraram** e **1 passou com dor**. Os gaps **P0** (6) concentram-se em três áreas críticas: (1) sincronização de estado UI (F1-1, F1-2), (2) mensageria de erro genérica violando CDC + Nielsen (F1-3), e (3) gestão de DSR / direito ao apagamento (F1-4). O perfil F1 (SaaS médio, cliente sofisticado) expôs falhas que clientes pequenos talvez não notassem mas que enterprise certamente notará — especialmente os relacionados à perda de produtividade (F1-2) e compliance LGPD (F1-4).

**Recomendação consolidada pra spec:**
- Adicionar DoD de simultaneidade temporal (`<500ms`) em todos os filtros sincronizados.
- Reescrever wireframe W5.2 com mensagem específica por motivo (alinha com Story Cenário 15).
- Adicionar fluxo formal de DSR no backend de audit trail (pseudonimização + meta-audit + dual hash).
- Substituir placeholders informativos (W2) por **formulários inline** ou re-classificá-los como **links semânticos** (`[Como solicitar alteração?]`) pra evitar confusão.
- Adicionar 4 novos eventos canônicos ao catálogo do Cenário 17: `audit_trail.dsr_anonimizacao_aplicada`, `plano.solicitacao_alteracao_iniciada`, `plano.solicitacao_cancelamento_iniciada`, `cupom.aplicacao_falhou` (já mencionado em Q3 mas não no catálogo).
