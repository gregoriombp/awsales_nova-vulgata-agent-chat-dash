# Stress Test Financeiro — F5: Holding multi-org (Vitru, Ricardo CFO em 5 orgs)

**Agente:** adversarial Red Team
**Data:** 2026-05-11
**Cenários testados:** 5
**Perfil:** Ricardo Pacheco, CFO da Holding Vitru, responsável financeiro em 5 marcas educacionais (Anhanguera, UNIASSELVI, FAMA, Cruzeiro do Sul, Pitágoras). Cada org tem CNPJ próprio, plano próprio, cartões próprios. Mas governance é centralizada na holding: prestação de contas mensal no conselho exige visão consolidada de cobranças, créditos, descontos e planos cross-org. Story 3 (Financeiro) foi desenhada single-tenant view — N=1 contexto. Vitru rompe essa premissa.

## Sumário

- Passaram: 0 · Com dor: 0 · Quebraram: 5
- Total de gaps: **22** (P0: 10 · P1: 9 · P2: 3)
- Por lente: 🔧 Funcional: 9 · ⚖️ Compliance: 7 · 🎯 UX: 6

---

## F5-1: Card "Total economizado" — escopo cross-org indefinido

**Seed original:**
Ricardo entra no Financeiro da Anhanguera. Card "Total economizado" mostra R$ 482,30. Mas Ricardo tem cupons aplicados nas outras 4 orgs também (total R$ 1.500 economizado lifetime). Card é por org? Por user? Lentes: F (escopo do card cross-org claro), U (Nielsen H1 visibilidade), ⚖ LGPD Art. 6º (finalidade).

**Walkthrough (beat-by-beat):**

1. **Beat 1 (W5 · Saldo de Créditos · header):** Ricardo abre Saldo de Créditos da Anhanguera. Vê 3 cards: "Total economizado R$ 482,30 (lifetime)", "Total desconto disp. R$ 1.250", "Vouchers ativos 2". **Label "lifetime" é ambígua.** "Lifetime" do user (5 orgs) ou da org (Anhanguera)? Cenário 11 da Story 3 diz "lifetime — soma de cupons + vouchers consumidos" sem qualificar escopo. Ricardo viu R$ 482 em 3 outras orgs (UNIASSELVI mostrou R$ 1.020, FAMA R$ 0, etc.) — não bate com nenhum agregado. → **GAP F5-1-A (P0, 🎯 UX + 🔧 Func)** — label não explicita escopo, viola Nielsen H1 (visibilidade do estado do sistema) e induz erro de interpretação financeira em prestação de contas.

2. **Beat 2 (lente ⚖ LGPD Art. 6º — finalidade):** Se o card MOSTRASSE consolidado cross-org sem ser pedido explicitamente, violaria princípio da finalidade — dados de UNIASSELVI sendo exibidos no contexto Anhanguera sem base legítima clara. Se MOSTRA só Anhanguera, é correto LGPD mas ruim UX. Story 3 não toma posição. → **GAP F5-1-B (P0, ⚖ LGPD Art. 6º II)** — tratamento cross-org de dados financeiros sem base legal documentada (princípio da finalidade + adequação).

3. **Beat 3 (cenário tooltip):** Ricardo passa mouse no ⓘ ao lado de "Total economizado". O Cenário 11 (W5) sugere tooltip mas não especifica o conteúdo. Se tooltip diz "lifetime nesta org", Ricardo entende mas perde visão consolidada — vai abrir 5 tabs. Se diz "lifetime em todas suas orgs", AwSales tá fazendo trafego cross-tenant na UI da org A. → **GAP F5-1-C (P1, 🎯 UX H2 + ⚖)** — Match mental model: CFO espera visão consolidada na figura de "minhas economias", mas modelo técnico é single-tenant.

4. **Beat 4 (CDC Art. 6º III · informação clara):** "Total economizado" sem qualificação é claim financeiro impreciso. Em audit de Procon ou ação no JEC, ambiguidade conta contra a fornecedora. Cliente entendeu R$ X, sistema mostrou R$ Y, fronteira nebulosa. → **GAP F5-1-D (P1, ⚖ CDC Art. 6º III)** — cobrança/desconto sem clareza de escopo viola direito à informação adequada.

5. **Beat 5 (WCAG/Screen reader):** Aria-label do card é "Total economizado: R$ 482,30, lifetime" (sem escopo). Cego não tem chance de inferir. → **GAP F5-1-E (P2, 🎯 WCAG 2.1 AA + U1.13)** — info crítica não acessível pra leitor de tela.

**Gaps identificados:**

| ID | Sev | Lente | Beat | Descrição | Evidência |
|---|---|---|---|---|---|
| F5-1-A | P0 | 🎯 UX H1 + 🔧 | 1 | Label "lifetime" sem qualificar escopo cross-org/single-org | Cenário 11 Story 3 não especifica; W5 mostra label genérico |
| F5-1-B | P0 | ⚖ LGPD Art. 6º II | 2 | Tratamento cross-org de dados financeiros sem base legal/finalidade documentada | Cenário 11 + claim C1.1 não cobrem cross-org |
| F5-1-C | P1 | 🎯 UX H2 + ⚖ | 3 | Tooltip ⓘ sem conteúdo definido pra esclarecer escopo | W5 wireframe tem ⓘ sem texto |
| F5-1-D | P1 | ⚖ CDC Art. 6º III | 4 | Ambiguidade financeira do card viola direito à informação clara | Claim C1.10 cobre fatura mas não cards de resumo |
| F5-1-E | P2 | 🎯 WCAG AA | 5 | Aria-label do card não inclui escopo, screen reader fica sem contexto | Claim U1.13 não testou multi-org |

**Status:** **QUEBROU** — 5 gaps, 2 P0. O card "Total economizado" foi pensado pra single-org operador. CFO multi-org vê 5 números desencontrados e nenhuma forma de reconciliar sem sair da plataforma.

**Questions abertas:**
- Resolver com label explícita "nesta org" + link "ver consolidado em Meu Perfil" (paralelo ao W15 Story 2)?
- Card deveria ter botão pequeno "🔍 Comparar com minhas outras orgs" pra CFO multi-org?
- Tooltip ⓘ vai ter texto canônico definido pelo design ou cada PM escreve?

---

## F5-2: Voucher emitido pra "Holding Vitru" — em qual org aplica?

**Seed original:**
Bruno emitiu voucher de R$ 5.000 pra "Holding Vitru" (CNPJ da holding). Mas Vitru tem 5 orgs com CNPJs diferentes (subsidiárias). Voucher aplica em todas? Em qual? Stripe vincula a 1 customer = 1 org. Lentes: F (modelo cross-org do voucher indefinido), ⚖ LGPD + CDC info clara, U (visibilidade do escopo no card).

**Walkthrough (beat-by-beat):**

1. **Beat 1 (modelo de dados Stripe):** Voucher = billing credit grant no Stripe. Stripe credit grant vincula a 1 customer. AwSales tem 1 Stripe customer **por org**, não por holding (Cenário P5-1-B do stress test anterior já marcou). Então voucher de R$ 5k "pra Holding Vitru" é tecnicamente impossível — Bruno teve que escolher uma org no admin. Mas isso não é óbvio pro CFO Ricardo nem pro próprio comercial Bruno. → **GAP F5-2-A (P0, 🔧 Func)** — modelo de dados não permite "voucher cross-org". Admin AwSales pode criar voucher errado e Ricardo cobra explicação do conselho.

2. **Beat 2 (W5 · tabela Vouchers · Anhanguera):** Ricardo vê voucher "Vitru Q2 R$ 5.000" — mas Bruno emitiu pra UNIASSELVI. Ricardo só vê em UNIASSELVI. Na Anhanguera não aparece. **Conselho cobrou Ricardo: "cadê os R$ 5k de crédito do Q2?"** Ricardo entra na Anhanguera (padrão dele), não vê. Demora pra descobrir que tá na UNIASSELVI. → **GAP F5-2-B (P0, 🎯 UX H6 + ⚖ CDC)** — sem busca cross-org, voucher fica "perdido" na org errada. Viola CDC Art. 6º III (info clara/adequada sobre desconto disponível).

3. **Beat 3 (Cenário 13 Story 3 · taxas elegíveis):** Voucher tem lista de fees elegíveis ("Aplica em: Disparos WhatsApp + Aw Tokens Knowledge Input"). Mas **não tem lista de orgs elegíveis** — porque modelo é por org. Se Bruno quisesse dizer "aplica em qualquer org da Vitru", não consegue. → **GAP F5-2-C (P1, 🔧 Func)** — modelo de voucher não suporta multi-org scope nem documenta a impossibilidade.

4. **Beat 4 (LGPD Art. 6º · transparência):** O cliente (Ricardo via conselho) recebeu comunicação comercial dizendo "R$ 5k de crédito pra Holding Vitru". Stripe internamente só permite vincular a 1 org. O contrato firmado entre AwSales e Vitru diz holding-level, mas execução é org-level. → **GAP F5-2-D (P0, ⚖ LGPD Art. 6º VI + CDC Art. 30)** — desalinhamento entre oferta comercial (holding) e execução técnica (org única) gera obrigação pré-contratual descumprida (Art. 30 CDC = oferta vincula).

5. **Beat 5 (UX consolidação):** Mesmo que Bruno escolha 1 org no admin (digamos Anhanguera), o card "Voucher" na sub-aba Saldo de Créditos da Anhanguera não diz "Originalmente negociado pra Holding Vitru, alocado nesta org pelo Comercial". Origem do voucher é opaca. → **GAP F5-2-E (P1, 🎯 UX H10 + ⚖ CDC Art. 6º III)** — sem rastreio de origem comercial, cliente perde contexto pra contestação ou prestação de contas.

**Gaps identificados:**

| ID | Sev | Lente | Beat | Descrição | Evidência |
|---|---|---|---|---|---|
| F5-2-A | P0 | 🔧 Func | 1 | Modelo Stripe credit grant vincula a 1 org — "voucher pra holding" tecnicamente impossível | doc credits/vouchers.mdx + arquitetura 1 customer Stripe por org |
| F5-2-B | P0 | 🎯 UX H6 + ⚖ CDC | 2 | Sem visão cross-org, voucher fica oculto na org "errada" | W5 sem busca cross-org; Cenário 11 single-tenant |
| F5-2-C | P1 | 🔧 Func | 3 | Modelo de voucher não suporta multi-org scope nem documenta a impossibilidade | Cenário 13 só tem fees elegíveis, não orgs elegíveis |
| F5-2-D | P0 | ⚖ LGPD + CDC Art. 30 | 4 | Oferta comercial holding-level vs execução org-level = obrigação pré-contratual descumprida | Cenário 11/12 não cobrem origem comercial; CDC Art. 30 (oferta vincula) |
| F5-2-E | P1 | 🎯 UX H10 + ⚖ CDC Art. 6º III | 5 | Origem do voucher (negociação holding) não rastreada/exibida na org alocada | W5 voucher card não tem campo "origem comercial" |

**Status:** **QUEBROU** — 5 gaps, 3 P0. Cliente enterprise que negocia em holding-level espera execução holding-level. Modelo técnico atual cria mismatch contratual com risco jurídico real (Art. 30 CDC).

**Questions abertas:**
- Vai ter entidade "Holding/Grupo" no modelo de dados? Se sim, voucher pode vincular ao grupo?
- No MVP, admin AwSales tem que sempre escolher uma org pra alocar voucher? Existe UI no admin que avisa "esse cliente é holding — confirmar org de alocação"?
- "Cobertura comercial vs cobertura técnica" precisa de cláusula no contrato? Quem assegura essa coerência?

---

## F5-3: Visão consolidada cross-org de créditos — gap declarado

**Seed original:**
Ricardo é CFO multi-org. Quer visão consolidada de créditos. Hoje precisa entrar em 5 orgs separadas. Story 2 W15 (Audit Trail Pessoal Cross-Org) existe mas é só pra audit, não pra créditos/vouchers. Lentes: F (gap declarado em P5), U (escala de fricção), ⚖ CDC Art. 6º III + LGPD Art. 18 II.

**Walkthrough (beat-by-beat):**

1. **Beat 1 (rotina mensal de Ricardo):** Toda 1ª segunda do mês Ricardo prepara apresentação pro conselho com slide "Créditos e descontos do mês — Holding Vitru". Abre Anhanguera → Financeiro → Saldo de Créditos → tira print. Repete 4x. Cola tudo num PowerPoint manual. **30min por mês, 6h por ano** só pra essa tarefa. → **GAP F5-3-A (P1, 🎯 UX escala)** — fricção operacional cross-org não dimensionada na Story 3.

2. **Beat 2 (LGPD Art. 18 II · direito de acesso):** Ricardo é titular dos dados financeiros vinculados a ele (responsável legal pelas orgs). LGPD Art. 18 II garante acesso aos próprios dados. Implementação cross-org via "Meu Perfil → Audit Trail Pessoal Cross-Org" (Story 2 W15) cobre **audit**, não **dados financeiros agregados**. CFO de holding pode argumentar que créditos/vouchers são dados financeiros pessoais sob sua tutela. → **GAP F5-3-B (P0, ⚖ LGPD Art. 18 II)** — direito de acesso parcial — audit sim, créditos/vouchers/planos não.

3. **Beat 3 (CDC Art. 6º III · informação adequada):** "Quanto a Holding Vitru tem em créditos disponíveis no AwSales agora?" — pergunta legítima de gestão. Resposta atual: "abre 5 telas e soma". CDC Art. 6º III obriga informação adequada e clara — em B2B enterprise isso é precedente vigente (STJ tem decisões nesse sentido em SaaS B2B). → **GAP F5-3-C (P1, ⚖ CDC Art. 6º III)** — info financeira agregada não disponibilizada de forma adequada pro contratante.

4. **Beat 4 (UX Jakob's Law):** Outros SaaS B2B com multi-org (Stripe, AWS Organizations, Datadog, Notion) têm visão "Organization Group" ou "Master Account". Ricardo espera mesmo padrão. AwSales quebra expectativa. → **GAP F5-3-D (P1, 🎯 UX Jakob's Law)** — quebra de modelo mental estabelecido por padrão de mercado.

5. **Beat 5 (futuro perto · NF):** Cada org emite NF separada (CNPJ diferente). Pra fechamento contábil da holding, contabilidade precisa juntar 5 packs de NF + 5 contas de crédito. Sem consolidação no app, Ricardo precisa de planilha externa eterna. Adoção da feature de NF do AwSales fica subutilizada. → **GAP F5-3-E (P2, 🔧 Func + ⚖)** — fechamento contábil multi-CNPJ não suportado, afeta value prop pra holdings.

**Gaps identificados:**

| ID | Sev | Lente | Beat | Descrição | Evidência |
|---|---|---|---|---|---|
| F5-3-A | P1 | 🎯 UX escala | 1 | Sem visão consolidada cross-org de créditos — fricção 30min/mês × CFO | Cenário 11 Story 3 single-tenant; Story 2 W15 só audit |
| F5-3-B | P0 | ⚖ LGPD Art. 18 II | 2 | Direito de acesso parcial — audit cross-org sim, créditos/vouchers cross-org não | Story 2 cobre audit; Story 3 não estende cross-org pra créditos |
| F5-3-C | P1 | ⚖ CDC Art. 6º III | 3 | Info financeira consolidada não disponibilizada pro contratante | Cenário 11 single-org; nada agrega cross-org |
| F5-3-D | P1 | 🎯 UX Jakob's Law | 4 | Padrão de mercado (Stripe/AWS/Datadog) tem visão master account — AwSales quebra | Heurística U1.4 (consistência) aplicada a benchmark externo |
| F5-3-E | P2 | 🔧 + ⚖ | 5 | Fechamento contábil multi-CNPJ exige consolidação fora do app | Cenário 11 + futura feature NF não cobrem holding |

**Status:** **QUEBROU** — 5 gaps, 1 P0. Gap já reconhecido no stress test anterior (P5) mas não endereçado na Story 3. Persiste como dívida arquitetural.

**Questions abertas:**
- Story de "Painel Holding" deveria ser criada como dependência da Story 3 ou ficar pra v2?
- Pode-se adicionar atalho "🔍 Comparar com minhas outras orgs" como placeholder informativo (igual o "Solicitar alteração de plano")?
- LGPD Art. 18 II → response do titular precisa ser em formato consolidado quando titular é responsável legal por N orgs?

---

## F5-4: Audit Trail contextual — Export CSV cross-org ou single-org?

**Seed original:**
Já endereçado na Story 2 (Q19 + Cenário 41) — coluna `org_id` no CSV. MAS no contexto da Story 3 Financeiro, audit trail contextual da sub-aba "Saldo de Créditos" filtra por cupom/voucher — quando Ricardo exporta CSV daqui, ele tem TODAS as orgs ou só a atual? Lentes: F (escopo do export contextual), ⚖ LGPD Art. 18 II, U (visibilidade do escopo antes do clique).

**Walkthrough (beat-by-beat):**

1. **Beat 1 (W5 rodapé · Audit Trail · Saldo de Créditos):** Ricardo está na Anhanguera, sub-aba Saldo de Créditos. Rola até o rodapé. Vê seção "Audit Trail · filtrado para Cupons e Vouchers" com banner "Filtrado pra eventos de cupom/voucher (contexto desta sub-aba)". Clica "📥 Exportar CSV". → **Não há indicação prévia de quantas orgs estão no escopo do export.** Cenário 16 só diz "segue mesmo padrão LGPD Story 2 S4". Story 2 S4 tem `org_id` mas escopo do export ainda é da org atual. → **GAP F5-4-A (P0, 🎯 UX H1 + ⚖ LGPD Art. 18 II)** — escopo do export não é visível ANTES do clique. Cliente não sabe se vai receber dados da Anhanguera ou de todas suas orgs.

2. **Beat 2 (W8 · Modal LGPD pré-export):** Modal abre. Diz "Este export contém dados financeiros e pessoais protegidos pela LGPD". **Não diz escopo (org única vs cross-org).** Ricardo marca o checkbox sem saber o que vai baixar. → **GAP F5-4-B (P0, ⚖ LGPD Art. 9º + Art. 18 II)** — ciência sem informação adequada sobre escopo do dado tratado viola consentimento informado. Modal LGPD genérico não esclarece o tratamento específico.

3. **Beat 3 (CSV baixado):** CSV tem 247 linhas — eventos de cupom/voucher só da Anhanguera. Ricardo esperava 5 orgs. Confuso, abre 4 outras orgs e exporta 4 vezes mais. → **GAP F5-4-C (P1, 🎯 UX H4 consistência)** — fluxo single-org silencioso, mas Ricardo é multi-org. Esperativa do W15 da Story 2 (cross-org) não se transfere pro audit financeiro.

4. **Beat 4 (filtro de tipo contextual):** O filtro `Tipo` vem pré-aplicado como "Cupom, Voucher" na sub-aba Saldo de Créditos (Cenário 16). Ricardo abre dropdown — pode mudar pra ver outros tipos. Mas **não há opção "Cross-org"** no filtro de escopo. → **GAP F5-4-D (P1, 🔧 Func)** — escopo (single-org/cross-org) não é dimensão de filtro, é hardcoded single.

5. **Beat 5 (Q5 Story 3 · export grande):** Se hipoteticamente o export fosse cross-org, 5 orgs × 50k eventos = 250k linhas, bate no limite Q5 ("export muito grande, aplique mais filtros"). UI precisa avisar antes. → **GAP F5-4-E (P2, 🔧 Func + 🎯 UX H9)** — sem preview de tamanho, cross-org futura pode explodir limite silenciosamente.

6. **Beat 6 (Audit do export · ⚖ LGPD Art. 38):** Meta-audit do export é registrado. Schema do meta-audit registra `org_id` da org de origem do export? Ou registra como evento "global" do usuário? Se single-org, audit fica perdido na Anhanguera enquanto Ricardo opera de UNIASSELVI. → **GAP F5-4-F (P1, ⚖ LGPD Art. 38)** — meta-audit do export pode não ser localizável pelo DPO cross-org.

**Gaps identificados:**

| ID | Sev | Lente | Beat | Descrição | Evidência |
|---|---|---|---|---|---|
| F5-4-A | P0 | 🎯 UX H1 + ⚖ LGPD Art. 18 II | 1 | Escopo do export (single-org/cross-org) não visível antes do clique | W5 rodapé sem indicação de escopo; Cenário 16 só fala padrão LGPD |
| F5-4-B | P0 | ⚖ LGPD Art. 9º + Art. 18 II | 2 | Modal LGPD W8 sem info sobre escopo do dado tratado — consentimento informado deficiente | W8 texto genérico, não inclui escopo |
| F5-4-C | P1 | 🎯 UX H4 | 3 | Single-org silencioso quebra modelo mental do CFO multi-org | Cenário 16 não documenta cross-org expectation handling |
| F5-4-D | P1 | 🔧 Func | 4 | Filtro `Tipo` é pré-aplicado mas filtro de escopo (org/cross-org) não existe | Cenário 18 filtros: Período, Tipo, Executor, Usuário — sem Escopo |
| F5-4-E | P2 | 🔧 + 🎯 UX H9 | 5 | Sem preview de tamanho antes do export, limite Q5 explode silencioso em cross-org futuro | Q5 cobre bloqueio mas não preview |
| F5-4-F | P1 | ⚖ LGPD Art. 38 | 6 | Meta-audit do export pode não ser localizável pelo DPO cross-org | Schema do meta-audit (Story 2 S4) precisa explicitar org_id de origem |

**Status:** **QUEBROU** — 6 gaps, 2 P0. Gap aparentemente endereçado pela Story 2 (coluna `org_id`) é reaberto pela Story 3 quando o audit contextual da Saldo de Créditos não estende cross-org. Inconsistência cross-story.

**Questions abertas:**
- O badge banner do Cenário 16 deveria dizer "Escopo: esta org (Anhanguera)" antes do botão Exportar?
- Modal LGPD W8 vai ser personalizado pra cada origem de export (audit pessoal vs audit org vs export financeiro)?
- Existe alinhamento Story 2 ↔ Story 3 sobre quando audit é single-org vs cross-org?

---

## F5-5: Comparação de planos cross-org — fricção pesada

**Seed original:**
Cada org pode estar em plano diferente (Anhanguera Enterprise R$ 2.497, UNIASSELVI Pro R$ 1.497, etc.). Ricardo precisa comparar pra negociação com Bruno. Tem que entrar em 5 modais separados. Lentes: F (visão consolidada cross-org de planos), U (Jakob's Law), ⚖ CDC Art. 6º III.

**Walkthrough (beat-by-beat):**

1. **Beat 1 (negociação trimestral):** Bruno marca call com Ricardo pra renegociação. "Vamos consolidar suas 5 orgs num único plano Enterprise pago anualmente, desconto 15%". Ricardo precisa **antes da call** ter visão clara dos 5 planos atuais — valor mensal, fidelidade restante, multa de quebra, limite variável. → **GAP F5-5-A (P0, 🎯 UX escala + ⚖ CDC Art. 6º III)** — Ricardo abre 5 navegadores em paralelo, anota numa planilha. Negociação fica desbalanceada (Bruno tem CRM, Ricardo tem 5 telas).

2. **Beat 2 (W2 · Modal "Detalhes do plano" · Anhanguera):** Modal abre. Mostra: Plano, Status, Valor, Intervalo, Limite variável, Fidelidade (12 meses · multa 50% · 8 meses rest.), Próxima cobrança. Único ponto de contato pra solicitar mudança: "Bruno Costa · bruno.costa@awsales.io". **Multa de quebra:** 50% de quanto? Spec não diz fórmula. Se Ricardo aceitar consolidar, vai pagar multa de quebra em 4 orgs? Quanto? → **GAP F5-5-B (P0, ⚖ CDC Art. 51 IV + Art. 6º III)** — multa de quebra sem fórmula clara e disponibilizada antes da decisão = cláusula potencialmente abusiva (CDC).

3. **Beat 3 (cross-org sum):** Ricardo soma manualmente: 5 planos × valor mensal × meses restantes de fidelidade = R$ X "trancados". 5 multas potenciais = R$ Y. **Esses números NÃO existem em lugar nenhum no produto.** Modal W2 é por org. → **GAP F5-5-C (P1, 🔧 Func + ⚖ CDC)** — exposure financeira de fidelidade multi-org não calculada/exibida.

4. **Beat 4 (UX Jakob's Law):** Stripe Customer Portal tem multi-subscription view. AWS Organizations tem Billing Conductor. Ricardo espera "Meus planos" agregado. AwSales tem "1 plano por org" sem agregação. → **GAP F5-5-D (P1, 🎯 UX Jakob's Law)** — quebra de padrão de mercado pra B2B enterprise.

5. **Beat 5 (placeholders informativos):** Botões "Solicitar alteração" e "Solicitar cancelamento" são placeholders informativos (Cenário 3). Em multi-org, Ricardo abriria 5 desses placeholders. Quanto cada placeholder gera um e-mail/ticket pro Bruno? 5 tickets ou 1 consolidado? → **GAP F5-5-E (P1, 🔧 Func + 🎯 UX H8)** — sem consolidação, Ricardo gera spam pro Bruno (5 solicitações) e Bruno tem que reconciliar — fricção dos 2 lados.

6. **Beat 6 (LGPD Art. 18 II + CDC):** "Dados do meu plano em todas as orgs" é dado financeiro do titular Ricardo (responsável legal). Direito de portabilidade (LGPD Art. 18 V) implica que deveria ter formato exportável agregado. → **GAP F5-5-F (P2, ⚖ LGPD Art. 18 V)** — portabilidade de dados financeiros agregados não implementada.

**Gaps identificados:**

| ID | Sev | Lente | Beat | Descrição | Evidência |
|---|---|---|---|---|---|
| F5-5-A | P0 | 🎯 UX + ⚖ CDC Art. 6º III | 1 | Sem visão consolidada de planos cross-org, negociação fica desbalanceada | Cenário 3 + W2 single-org; nada agrega |
| F5-5-B | P0 | ⚖ CDC Art. 51 IV + Art. 6º III | 2 | Multa de quebra sem fórmula clara antes da decisão = cláusula potencialmente abusiva | W2 mostra "multa 50%" sem fórmula nem base de cálculo |
| F5-5-C | P1 | 🔧 + ⚖ | 3 | Exposure financeira de fidelidade multi-org não calculada/exibida | Nenhum agregado cross-org no produto |
| F5-5-D | P1 | 🎯 UX Jakob's Law | 4 | Quebra de padrão Stripe/AWS Org de "Meus planos" agregado | Benchmark externo + heurística U1.4 |
| F5-5-E | P1 | 🔧 + 🎯 UX H8 | 5 | Placeholders "Solicitar alteração" geram 5 tickets em multi-org — spam bilateral | Cenário 3 single-org sem consolidação |
| F5-5-F | P2 | ⚖ LGPD Art. 18 V | 6 | Portabilidade de dados financeiros agregados (planos) não implementada | Cenário 11 não cobre export de planos; LGPD Art. 18 V |

**Status:** **QUEBROU** — 6 gaps, 2 P0. Negociação enterprise multi-org com fricção de informação assimétrica + risco contratual de multa abusiva (CDC Art. 51 IV).

**Questions abertas:**
- "Meus planos" como tela cross-org pode entrar como placeholder informativo agora (link "Pra comparar planos das suas orgs, fale com seu Gerente da Conta")?
- Fórmula da multa de quebra precisa estar visível no W2 antes do MVP ir pra produção? Sem isso, expõe AwSales a contestação CDC.
- Bruno Costa tem CRM que já consolida orgs de mesma holding? Se sim, AwSales só precisa mostrar isso ao cliente também.

---

## Anti-claims aplicáveis (não geraram gap)

- **AC1 / AC2 (mudança/cancelamento self-service):** Placeholders informativos confirmados. GAP F5-5-E é orthogonal — não pede self-service, pede consolidação dos placeholders pra evitar spam.
- **AC4 (mobile):** Não criei gap por mobile, mesmo que CFO multi-org notoriamente usa mobile pra reuniões/conselho.
- **AC6 (customização limite variável):** Não criei gap, mesmo que pra holding faria sentido limite agregado.
- **AC7 (Match PO ↔ NF):** Mencionado em F5-3-E como contexto (fechamento contábil multi-CNPJ), não criei gap específico de PO/NF — fora de escopo MVP.

## Síntese

F5 mostra que a Story 3 (Financeiro) **trata multi-org como caso de borda** quando ele é **caso típico em enterprise**. As 5 dimensões testadas batem em camadas distintas:

- **Identidade do dado cross-org:** F5-1 (label/escopo) + F5-4 (audit) — 5 gaps, 4 P0
- **Modelo comercial vs técnico:** F5-2 (voucher holding-level vs Stripe org-level) — 5 gaps, 3 P0
- **Direito de acesso consolidado:** F5-3 (LGPD Art. 18 II ampliada) — 5 gaps, 1 P0
- **Comparação/negociação:** F5-5 (planos + multa) — 6 gaps, 2 P0
- **Compliance LGPD/CDC:** transversal — 7 gaps de compliance no total

**3 críticos (P0) prioritários:**

1. **F5-2-D (⚖ LGPD Art. 6º VI + CDC Art. 30)** — oferta comercial "holding" vs execução "org única" gera obrigação pré-contratual descumprida. Risco jurídico imediato. **Mitigação:** Bruno (admin AwSales) é forçado a escolher 1 org no fluxo de criar voucher + contrato comercial deve refletir essa restrição.
2. **F5-5-B (⚖ CDC Art. 51 IV)** — multa de quebra sem fórmula = cláusula abusiva. Risco de invalidação em contestação. **Mitigação:** W2 modal mostra fórmula + valor exato calculado + base legal antes de qualquer "Solicitar cancelamento".
3. **F5-4-A + F5-4-B (⚖ LGPD Art. 9º + Art. 18 II)** — modal LGPD W8 sem info de escopo viola consentimento informado. Esses 2 gaps são interligados — corrigem-se com banner explícito de escopo (org única vs cross-org) antes do clique + modal personalizado por origem do export.

**Pilar mais quebrado: ⚖ Compliance** — 7 gaps (LGPD 5, CDC 4, sobreposição). Vitru é cliente educacional (BACEN-adjacente) com exigência de governance forte. AwSales perde esse perfil pra concorrente que entrega visão holding-level.

**Recomendação estratégica:** adicionar "Holding/Grupo Econômico" no modelo de domínio (camada acima de org) é decisão arquitetural P0 antes da entrega final da Story 3. Caso contrário, todas as 5 seeds aqui viram dívida acumulada e a Story 3 entrega "Financeiro single-tenant" enquanto o ICP enterprise é multi-tenant por natureza.
