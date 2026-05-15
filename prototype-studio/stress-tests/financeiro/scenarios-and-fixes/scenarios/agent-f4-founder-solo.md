# F4 — Founder solo confuso (CodeRabbit Schools)

**Perfil:** Júnior, fundador único, 32 anos, ex-professor, vendeu primeiro curso há 6 meses, contratou AwSales no plano R$ 900/mês implementação+plano. Sem time, sem jurídico, sem CFO. Operação 100% solo. Tech-literate moderado (sabe Stripe, mas trata "billing" como mistério). Cobertura emocional: ansioso com qualquer cobrança, hipersensível a "sumiu meu dinheiro".

**Pontos de fricção esperados:** mental model "pago só pelo que uso" (SaaS culture), baixa tolerância a jargão técnico, paranoia de cobrança duplicada, ignora o que não entende.

**Anti-claims respeitados:** AC1 (sem self-service de mudança de plano), AC2 (sem cancelamento self-service), AC4 (desktop only). Walkthrough em PT-BR (AC5).

---

## F4-1 · Visualização: gráfico vazio mas "Próxima cobrança" R$ 2.500

**Cenário concreto:** Júnior é founder solo. CodeRabbit Schools ainda não rodou nenhuma campanha de outbound — usa AwSales só pra suporte do curso. Gastos variáveis acumulados no mês: R$ 0,00. Júnior abre `Configurações → Financeiro` pela primeira vez em 3 semanas pra "ver se tá tudo certo antes da cobrança".

### Beat 1 — Júnior vê o card "Plano [Pro]"

- 🔧 **Funcional:** card renderiza corretamente "Plano Pro · ● Ativo · R$ 900 / mês". OK.
- ⚖️ **Compliance:** valor exibido bate com contrato. OK pra CDC Art. 6º III.
- 🎯 **UX:** copy "R$ 900 / mês" não diz se é mensal recorrente, pré-pago, pago via cartão. Júnior, founder solo, não sabe se a próxima cobrança é dia 28 ou dia 1º. **Gap UX-leve:** falta micro-tooltip ⓘ com "Próxima cobrança automática em [data]".

### Beat 2 — Júnior vê o card "Fatura atual"

Mostra `Vencimento 28/05 · R$ 900,00 · Cartão Visa •••• 3012`. Status `⚠ Em aberto`.

- 🔧 **Funcional:** funcional. Renderiza.
- ⚖️ **Compliance CDC Art. 6º III:** "Em aberto" pode confundir (não diz se pagou ou não). Para founder leigo, "Em aberto" = "tem alguma coisa errada?". Pra Stripe `OPEN` é apenas "aguardando vencimento". **Gap C1.10 (CDC) — copy precisa ser "Em aberto · vence em X dias"** (não apenas "Em aberto").
- 🎯 **UX Nielsen H2 (match mental model):** "Em aberto" é vocabulário contábil, não vocabulário de SMB founder. Júnior espera "Aguardando pagamento · vence dia 28". **Gap UX-P1.**

### Beat 3 — Júnior chega no card "📅 Próx. cobrança"

> Card mostra `28/05/2026` sem detalhamento do valor. Mas, conforme o wireframe W1, o card seguinte de "💰 Limite gastos" e o card "📊 Utilizados" tem R$ 0. O título do card é só **"Próxima cobrança"** sem qualificador.

**SEED CORE:** Júnior tenta entender → vai pro Modal "Detalhes do plano" → ali aparece "Próxima cobrança: 28/05/2026 · R$ 900". Mas a inferência que Júnior faz é: "vou ser cobrado R$ 900 mesmo se não usar nada? Não era SaaS pay-per-use?".

- 🔧 **Funcional:** o card é tecnicamente correto — mostra a data, e a magnitude correta. **MAS** não distingue entre `plano fixo` (recorrente, certo) e `consumo variável` (zero neste mês). Júnior, sem entender, projeta: "o card é a soma total que vou pagar". **Gap F-P1:** o card precisa de breakdown — "Plano fixo: R$ 900 · Variável (estimado): R$ 0" OU label explícito "Próxima cobrança do plano fixo".
- ⚖️ **Compliance CDC Art. 6º III (informação clara e adequada):** o card de "Próxima cobrança" sem qualificar a natureza (fixo vs variável) viola o princípio da informação clara. CDC exige que o consumidor saiba EXATAMENTE o que vai pagar e por quê. **Gap C-P1.**
- ⚖️ **Compliance CDC Art. 31** (oferta vinculante): cliente entendeu na proposta comercial que pagaria "R$ 900 plano + variável proporcional ao uso". Se o card sugerir cobrança fixa sem variável zero discriminado, há quebra do princípio da transparência da oferta.
- 🎯 **UX Nielsen H2 (mental model):** founder SaaS espera modelo Stripe/AWS — "paga só o que usa". Card sem breakdown reforça mental model errado. **Gap UX-P1.**
- 🎯 **UX Nielsen H10 (help):** ausência de tooltip ⓘ explicando "Esta cobrança é apenas a parte fixa do plano. O consumo variável é cobrado separadamente conforme uso." **Gap UX-P2.**

### Beat 4 — Júnior abre o Modal Detalhes do plano e procura o cancelamento

- 🔧 OK (modal renderiza com info correta).
- 🎯 **UX H8 (minimalismo) — não-gap, é design correto** mas o modal não tem alerta tipo "Seu plano cobra fixo independente do uso". **Gap UX-P2: contextual help missing.**

### Beat 5 — Júnior volta pra Visão Geral, vê o gráfico vazio com Y-axis até R$ 1.200

Gráfico "Gastos variáveis · Este mês" renderiza eixo Y até R$ 1.200 (escala default do wireframe W1) mas barras todas em R$ 0. Estado vazio do gráfico não é tratado especificamente.

- 🔧 **Funcional Q1 (Story 3):** o cenário Q1 diz "Estado vazio · Nenhum gasto no período". MAS o wireframe W1 não mostra explicitamente como o gráfico vazio fica renderizado. **Gap F-P2:** ambiguidade — gráfico de 31 barras vazias ou empty state ilustrado?
- 🎯 **UX H1 (visibilidade do estado):** gráfico com Y-axis R$ 1.200 e barras zeradas é visualmente confuso (sugere "tem dado mas não consigo ver"). **Gap UX-P2:** empty state explícito com mensagem "Você ainda não gerou cobranças variáveis este mês — você paga apenas o plano fixo de R$ 900".
- 🎯 **UX H2 (mental model):** ausência de mensagem reforça paranoia "vou pagar caro mesmo sem usar". **Gap UX-P1.**

### Gaps F4-1

| ID | Severidade | Lente | Lei/Heurística | Descrição |
|---|---|---|---|---|
| F4-1-G1 | P1 | UX | Nielsen H2 | "Em aberto" usa jargão contábil — founder espera "Aguardando pagamento · vence dia 28" |
| F4-1-G2 | P1 | UX+Compliance | CDC Art. 6º III + Nielsen H2 | Card "Próxima cobrança" sem breakdown fixo+variável reforça mental model errado e viola transparência |
| F4-1-G3 | P1 | Funcional | F1.8 + CDC Art. 31 | Card "Próxima cobrança" deveria mostrar "Plano fixo: R$ 900 · Variável: R$ 0,00 (consumo atual)" |
| F4-1-G4 | P2 | UX | Nielsen H10 | Falta tooltip ⓘ explicando "fixo vs variável" no card de próxima cobrança |
| F4-1-G5 | P2 | UX | Nielsen H1 | Empty state do gráfico vazio precisa de mensagem explícita (não barras zeradas com Y-axis fantasma) |

---

## F4-2 · Pagamento: PENDING (PIX aguardando confirmação) — Júnior pensa que falhou

**Cenário concreto:** Primeira fatura da implementação (R$ 1.800 da Story 1). Júnior escolheu PIX. Copiou o QR code, pagou pelo banco às 14:32:18. A UI ainda mostra `Status: ⚠ PENDING` em amarelo (Stripe não recebeu webhook ainda — PIX leva 10-30s). Júnior, ansioso, espera 5 segundos, vê PENDING, conclui "deu erro". Volta pra tela de pagamento, escolhe Cartão. Paga R$ 1.800 NO CARTÃO. 5 segundos depois, Stripe webhook chega — fatura passa pra `PAID` via PIX. Cartão **também** foi capturado. **2 cobranças no Stripe pra mesma fatura.**

### Beat 1 — Júnior paga PIX e vê status PENDING

- 🔧 **Funcional F1.3:** PENDING é status válido do invoice-lifecycle.mdx para "Pagamento em processamento (PIX/Boleto aguardando confirmação)". OK pra ter o status.
- 🎯 **UX Nielsen H1 (visibilidade do estado):** PENDING em amarelo, com badge `⚠` (alerta), sem nenhum copy específico tipo "Aguardando confirmação do seu banco — pode levar até 30 segundos. NÃO PAGUE DE NOVO." **Gap UX-P0:** copy precisa explicar que PIX é assíncrono. **Esse é o disparador do dano.**
- 🎯 **UX H5 (prevenção de erros):** botões de pagamento alternativo (Cartão, Boleto) deveriam ficar **desabilitados durante PENDING** com tooltip "Aguarde confirmação do PIX antes de pagar de novo".
- ⚖️ **Compliance CDC Art. 42 §único (cobrança indevida — devolução em dobro):** se o duplo pagamento ocorrer e Stripe efetivamente cobrar 2x, AwSales pode ser obrigada a devolver em dobro o valor pago indevidamente. **Gap C-P0** — não é só UX, vira responsabilidade civil.
- ⚖️ **Compliance CDC Art. 6º III:** info clara não foi entregue — Júnior achou que falhou.

### Beat 2 — Júnior, vendo PENDING, paga DE NOVO com cartão

- 🔧 **Funcional CRÍTICO:** o sistema permite **segunda tentativa de pagamento sem checar idempotência da fatura**. Mesmo Stripe tendo um pagamento `pending` (intent), a UI deixa criar uma nova `PaymentIntent` apontando pra mesma `invoice`. **Gap F-P0** — race condition fatal.
- 🔧 **F1.3:** invoice-lifecycle não documenta o que acontece quando 2 intents convergem pra mesma invoice. **Gap F-P0 ambíguo.**
- 🔧 **Idempotência:** sem chave de idempotência no botão de pagamento, 2 cliques em 2 métodos resultam em 2 charges. **Gap F-P0.**
- ⚖️ **Compliance PCI-DSS:** não direto. **Mas Stripe Elements:** se ambos os fluxos passam por Stripe Elements, o iframe não bloqueia. **Gap nas próprias regras de uso do Stripe.**
- ⚖️ **Compliance CDC Art. 42 §único:** cobrança duplicada efetivada = obrigação de devolução em dobro (R$ 3.600 devolvidos por uma fatura de R$ 1.800). **Risco financeiro P0.**
- 🎯 **UX H5 (prevenção):** **Gap P0** — não há confirmação dupla ("Você já tem um pagamento em processamento. Pagar de novo pode resultar em cobrança duplicada. Confirma?").

### Beat 3 — Webhook chega, fatura passa pra PAID, mas há 2 charges no Stripe

- 🔧 **Funcional:** UI mostra status `PAID` em verde. **Mas o badge não revela que houve sobre-pagamento.** Júnior vê PAID, fecha a tela, dorme em paz. Acorda na semana seguinte com mensagem "estranha cobrança" do banco. **Gap F-P0.**
- 🔧 **Audit trail:** o evento `fatura.paga` é registrado UMA vez (a primeira que webhookou). A segunda charge gera evento? Provavelmente sim (`fatura.tentativa_retry` ou `payment.succeeded`). Mas a tela mostra "PAID R$ 1.800" — NÃO mostra "Pago R$ 3.600 · R$ 1.800 a estornar". **Gap F-P0** (status duplica-pago não mapeado nos 13 status declarados em F1.3).
- ⚖️ **Compliance CDC Art. 42 §único:** o estado "fatura paga 2x" não existe na taxonomia. Cliente não consegue VER que pagou 2x. **Não pode contestar o que não vê.** **Gap C-P0** profundo.
- ⚖️ **Compliance Marco Civil Art. 13 / LGPD Art. 18:** o evento de cobrança duplicada precisa estar no audit trail acessível ao titular. **Gap F+C-P1.**
- 🎯 **UX H9 (recuperação de erros):** sem alerta proativo "Detectamos pagamento duplicado — abrimos solicitação de estorno automático". **Gap UX-P0.**

### Beat 4 — Júnior abre Modal "Ver detalhes da fatura"

- 🔧 **Funcional Cenário 9 Story 3:** o modal mostra "Line items + Subtotal + Total + Hash". **Mas não tem linha "Pagamentos recebidos: R$ 3.600 · A estornar: R$ 1.800".** Modal foi desenhado pro caso happy path. **Gap F-P1.**
- 🎯 **UX H1:** Júnior sai do modal sem entender que pagou 2x.

### Beat 5 — Júnior abre o Audit Trail no rodapé

- 🔧 Eventos `fatura.paga` aparecem mas pra um founder solo, dois eventos `fatura.paga` no mesmo timestamp NÃO disparam alarme — ele lê de cima pra baixo, vê "fatura paga · R$ 1.800", relaxa.
- 🎯 **UX H1:** evento de pagamento duplicado deveria ter cor/ícone distintivo (vermelho + alerta) — não cinza padrão de `fatura.paga`.

### Gaps F4-2

| ID | Severidade | Lente | Lei/Heurística | Descrição |
|---|---|---|---|---|
| F4-2-G1 | **P0** | Funcional+UX | Nielsen H5 + F1.3 | PENDING permite segunda tentativa de pagamento sem bloqueio nem confirmação — race condition gera 2 charges |
| F4-2-G2 | **P0** | Compliance | CDC Art. 42 §único | Cobrança duplicada efetivada → obrigação de devolução em dobro |
| F4-2-G3 | **P0** | UX | Nielsen H1 + H5 | Copy do PENDING não explica "PIX leva 30s, não pague de novo" |
| F4-2-G4 | **P0** | Funcional | F1.3 + idempotência | Sistema não tem idempotência por fatura no botão de pagamento |
| F4-2-G5 | P0 | UX | Nielsen H9 | Sem alerta proativo após detecção de pagamento duplicado |
| F4-2-G6 | P1 | Funcional | F1.3 | Taxonomia de 13 status não cobre "duplicado · a estornar" |
| F4-2-G7 | P1 | UX | Nielsen H1 | Modal "Ver detalhes da fatura" não mostra pagamentos recebidos (só line items) |
| F4-2-G8 | P1 | UX+Compliance | Nielsen H1 + LGPD Art. 18 II | Evento de pagamento duplicado no audit trail sem destaque visual |
| F4-2-G9 | P2 | UX | Nielsen H2 | "PENDING" e "OPEN" usam vocabulário Stripe — founder espera "Aguardando confirmação" / "Aguardando pagamento" |

---

## F4-3 · Créditos: cupom ONBOARD aplicado, próxima fatura R$ 17,70 — Júnior duvida

**Cenário concreto:** Bruno (gerente de conta AwSales) aplicou via admin o cupom `ONBOARD` (R$ 482,30 de desconto, ONCE) na conta da CodeRabbit como brinde de boas-vindas. Júnior abre a aba Saldo de Créditos. Vê na tabela "Cupons aplicados": `ONBOARD · Bônus onboarding · R$ 482,30 · Uma única vez · #1001`. Bom. Volta pra Visão Geral. Vê na fatura atual: **R$ 17,70**. Plano é R$ 500. Júnior pensa "vou pagar 17 reais? Isso parece errado, vai vir uma fatura escondida depois?".

### Beat 1 — Júnior abre a aba Saldo de Créditos

- 🔧 **Funcional F1.4:** tabela renderiza com 6 colunas corretas (Código, Descrição, Valor descontado, Aplicação, Fatura, Data). OK.
- 🎯 **UX H10 (help):** falta tooltip ⓘ em "Aplicação: Uma única vez" explicando "Este cupom é abatido em uma única fatura — após isso, deixa de aplicar."

### Beat 2 — Júnior vai pra Visão Geral, vê fatura atual R$ 17,70

- 🔧 **Funcional F1.4 + Cenário 9 (Story 3):** o card "Fatura atual" diz apenas `R$ 17,70`. Cliente vê o número final, não vê **antes/depois do desconto**. **Gap F-P1:** o card de fatura deveria mostrar "R$ 500,00 - R$ 482,30 (cupom ONBOARD) = R$ 17,70" inline.
- ⚖️ **Compliance CDC Art. 6º III (informação clara e adequada):** o valor final sem o detalhamento da composição (base + cupom + desconto) viola a transparência. Cliente tem direito a saber EXATAMENTE como o valor foi calculado. **Gap C-P1.**
- ⚖️ **Compliance CDC Art. 31 (oferta vinculante):** se o cupom foi prometido como benefício comercial, a aplicação dele tem que estar transparente na fatura. **Gap C-P1.**
- 🎯 **UX Nielsen H2 (mental model):** founder espera ver o "valor cheio riscado + desconto + valor final" (padrão e-commerce/SaaS). **Gap UX-P1.**

### Beat 3 — Júnior clica em "Ver detalhes" no card da fatura

- 🔧 **Funcional Cenário 9 Story 3:** o modal W4 mostra:
  - Line items (Plano · Pro · Mensal · R$ 500,00)
  - Subtotal: R$ 500,00
  - Cupom: ONBOARD (Bônus onboarding) -R$ 482,30
  - TOTAL: R$ 17,70
  - Hash + PDF
- 🎯 **UX H1:** **boa visibilidade.** Modal cumpre o que F4-3 demanda. **OK no modal.**
- 🎯 **UX H4 (consistência):** **MAS** o problema é que o CARD inicial não tem essa info — só o modal tem. **Gap UX-P1:** inconsistência entre card e modal — usuário tem que clicar pra ter clareza.

### Beat 4 — Júnior vê o card "🐷 Total economizado" mostrando R$ 482,30

- 🔧 OK. Card lifetime.
- 🎯 **UX H10 (help):** falta tooltip ⓘ explicando "Total lifetime — soma de todos os cupons e vouchers já consumidos pela sua organização."

### Beat 5 — Júnior procura entender quando o ONBOARD termina

- 🔧 **Funcional F1.4:** o cupom é `ONCE` — aplica em UMA fatura só. Mas a tabela "Cupons aplicados" mostra "Aplicação: Uma única vez · Fatura: #1001 · Data: 11/05/2026". **Gap F-P2:** após a fatura #1001 ser paga, o cupom deveria desaparecer da tabela "aplicáveis" ou mover pra "Cupons consumidos / histórico". Hoje a tabela é uma lista única sem separação.
- 🎯 **UX H2:** founder não sabe se o cupom continua aplicando nas próximas faturas ou não. **Gap UX-P1.**

### Beat 6 — Júnior, ainda em dúvida, vai pro Audit Trail

- 🔧 O evento `cupom.aplicado_pelo_admin · ONBOARD · R$ 482,30` aparece. Executor: `AwSales · Bruno C.`. Bom.
- 🎯 **UX H10:** sem tooltip explicando o que significa "aplicado_pelo_admin" — founder leigo não decodifica jargão.

### Beat 7 — Júnior tenta confirmar via WhatsApp do Bruno

- 🔧 Modal Detalhes do plano traz o contato `bruno.costa@awsales.io` (cenário 3 Story 3). Mas sem telefone, sem horário comercial, sem SLA esperado de resposta. **Gap UX-P2.**

### Gaps F4-3

| ID | Severidade | Lente | Lei/Heurística | Descrição |
|---|---|---|---|---|
| F4-3-G1 | P1 | Funcional+UX | F1.4 + Nielsen H2 | Card "Fatura atual" mostra só valor final — falta breakdown "R$ 500 - R$ 482,30 (ONBOARD) = R$ 17,70" |
| F4-3-G2 | P1 | Compliance | CDC Art. 6º III + Art. 31 | Cliente não vê composição do desconto no card de fatura — viola transparência |
| F4-3-G3 | P1 | UX | Nielsen H4 (consistência) | Modal mostra breakdown mas card não — inconsistência entre níveis |
| F4-3-G4 | P1 | UX | Nielsen H2 | "Aplicação: Uma única vez" sem tooltip — founder não sabe se cupom continua aplicando |
| F4-3-G5 | P2 | Funcional | F1.4 | Tabela "Cupons aplicados" não separa "aplicáveis" de "consumidos" — vira lista única confusa |
| F4-3-G6 | P2 | UX | Nielsen H10 | Cards de "Total economizado / Total disponível / Vouchers ativos" sem tooltips explicativos |
| F4-3-G7 | P2 | UX | Nielsen H10 | Contato do Bruno no Modal Detalhes do plano sem telefone, sem SLA, sem horário comercial |

---

## F4-4 · Audit Trail: Júnior não entende por que existe

**Cenário concreto:** Júnior rola até o rodapé da Visão Geral, encontra a seção "📋 Audit Trail Financeiro". Vê linhas tipo:

```
14:32  AwSales · Bruno C.  · plano.mudou           · Pro → Enterprise
13:55  Cliente · Felipe R. · cartao.padrao_mudou   · → •••• 3012
11:22  Sistema · webhook   · fatura.paga           · R$ 1.253,04 (CV)
```

Júnior lê: "plano.mudou? cartao.padrao_mudou? webhook? CV?" — pensa "isso é log técnico, não é pra mim". Fecha a aba e ignora. Pior: nem usa o que está disponível por direito (LGPD Art. 18 II — direito de acesso).

### Beat 1 — Júnior chega no rodapé da Visão Geral

- 🔧 **Funcional F1.5:** seção renderiza com 3 eventos. OK.
- 🎯 **UX H4 (consistência):** título "Audit Trail Financeiro" usa palavra `Audit Trail` (estrangeirismo técnico). Por que não "Histórico de atividades" ou "Registro de eventos"? **Gap UX-P1.**
- ⚖️ **Compliance LGPD Art. 6º VI (transparência):** princípio exige que tratamento de dados seja transparente "em vocabulário claro e adequado ao público". Audit Trail em jargão viola o princípio. **Gap C-P1.**

### Beat 2 — Júnior lê "plano.mudou" e não decodifica

- 🔧 **Funcional Cenário 17 Story 3:** o catálogo canônico tem 20+ eventos em snake_case técnico (`plano.mudou`, `cartao.padrao_mudou`, `fatura.expirou`, `cupom.aplicado_pelo_cliente`). **OK pra backend / DPO**, **terrível pra founder solo SMB**. **Gap F-P1:** o catálogo é exposto no UI sem layer de tradução.
- 🎯 **UX Nielsen H2 (match mental model):** vocabulário técnico não corresponde ao vocabulário do usuário. Júnior espera "Plano alterado", "Cartão padrão alterado", "Fatura paga". **Gap UX-P1.**
- 🎯 **UX H10 (help & docs):** sem tooltip ⓘ explicando cada tipo de evento. **Gap UX-P2.**

### Beat 3 — Júnior vê "CV" no evento `fatura.paga`

- 🔧 "CV" é abreviação de "Custos Variáveis" (jargão interno AwSales). Júnior nunca viu isso. **Gap F-P1.**
- 🎯 **UX H2:** **Gap UX-P1** — abreviações internas vazadas pra UI.

### Beat 4 — Júnior vê "Origem: 200.4.1.5 · Chrome/Mac"

- 🔧 **Funcional Cenário 17 Story 3:** evento `cartao.padrao_mudou` registra IP + user agent. OK pra audit forense.
- ⚖️ **Compliance LGPD Art. 5º I (dado pessoal):** IP é dado pessoal. Exibir IP do executor pra outros usuários da org pode ser legítimo (mesma org, mesmo controlador), mas pra Júnior que é o ÚNICO usuário, ver "Origem: 200.4.1.5" do PRÓPRIO acesso é só ruído. **Gap UX-P2.**
- ⚖️ **Compliance LGPD Art. 46 (segurança):** PII Filtering (Story 2 Cenário 38) declarado mas IP visível por default. **Gap C-P2** — checar se filter aplica no audit trail financeiro.

### Beat 5 — Júnior tenta filtrar por "Tipo: Fatura" pra entender só cobranças

- 🔧 **Funcional Cenário 18 Story 3:** filtro `Tipo de evento` agrupado por domínio (Plano, Cartão, Fatura, Cupom, Voucher, Compliance). OK pra estrutura.
- 🎯 **UX H6 (recognition over recall):** dropdown "Tipo" não tem ícone, só texto. Founder solo se beneficiaria de ícones por categoria. **Gap UX-P3 (nice-to-have).**

### Beat 6 — Júnior clica em "Exportar CSV"

- 🔧 Modal LGPD W8 abre. Checkbox de ciência. Botão "Exportar agora".
- ⚖️ **Compliance LGPD Art. 9º + Art. 18 II:** modal está OK (consentimento + acesso).
- 🎯 **UX H2:** Júnior vê "Você é responsável pelo manuseio seguro do arquivo · compartilhamento controlado · descarte adequado" e fica assustado. **Não vai exportar nada.** Avisos legais (necessários por LGPD) acabam tendo efeito chilling pra SMB. **Gap UX-P2:** modal precisa balancear aviso legal com mensagem reassurance ("Você pode exportar — só guarde com cuidado").
- 🎯 **UX H10:** sem explicação prévia de PRA QUE exportar audit trail (contestação? auditoria?). Founder solo não vê valor — não usa. **Gap UX-P2.**

### Beat 7 — Júnior fecha a aba ignorando audit trail

- ⚖️ **Compliance LGPD Art. 18 II (direito de acesso):** lei garante o direito MAS não exige que cliente use. Por outro lado, se UI for hostil ao ponto de inviabilizar o uso, há **dúvida regulatória** se "acesso teórico" satisfaz o art. 18. **Gap C-P2** (zona cinza).
- 🎯 **UX H2 + H10:** founder solo ignora audit trail por falta de tradução, contexto e valor percebido. **Gap UX-P1.**

### Gaps F4-4

| ID | Severidade | Lente | Lei/Heurística | Descrição |
|---|---|---|---|---|
| F4-4-G1 | P1 | UX+Compliance | Nielsen H2 + LGPD Art. 6º VI | Eventos em snake_case técnico (`plano.mudou`, `cartao.padrao_mudou`) viola transparência LGPD pra leigo |
| F4-4-G2 | P1 | Funcional | F1.5 | Catálogo canônico de 20+ eventos exposto sem layer de tradução para PT-BR coloquial |
| F4-4-G3 | P1 | UX | Nielsen H4 | Título "Audit Trail" usa estrangeirismo — deveria ser "Histórico de atividades" |
| F4-4-G4 | P1 | UX+Funcional | Nielsen H2 + F1.5 | Abreviações internas ("CV" = Custos Variáveis) vazam pra UI do cliente |
| F4-4-G5 | P2 | Compliance | LGPD Art. 46 | IP do próprio executor exibido sem mascaramento — checar se PII Filtering aplica |
| F4-4-G6 | P2 | UX | Nielsen H10 | Sem tooltip ⓘ explicando cada tipo de evento |
| F4-4-G7 | P2 | UX | Nielsen H10 | Modal LGPD pré-export tem efeito chilling — falta reassurance ("você pode usar livremente, só guarde com cuidado") |
| F4-4-G8 | P2 | UX | Nielsen H10 | Sem explicação prévia do VALOR de exportar audit trail — founder solo não vê utilidade |
| F4-4-G9 | P3 | UX | Nielsen H6 | Filtros sem ícones por categoria — recognition over recall comprometido |

---

## F4-5 · Plano: Júnior quer cancelar mas botão é placeholder informativo

**Cenário concreto:** CodeRabbit Schools não decolou. Júnior decidiu fechar a operação e vender o domínio. Precisa cancelar AwSales antes da próxima cobrança (28/05). Hoje é 11/05 — 17 dias até a cobrança. Abre `Configurações → Financeiro → Detalhes do plano`. Vê o card de contato do Bruno + os botões `(Solicitar alteração de plano)` `(Solicitar cancelamento)` em estilo secundário. Clica em **"Solicitar cancelamento"**.

### Beat 1 — Júnior abre o Modal Detalhes do plano

- 🔧 **Funcional Cenário 3 Story 3:** modal renderiza com 9 campos + card do Gerente da Conta. OK.
- 🎯 **UX H8 (minimalismo):** modal está limpo. OK.

### Beat 2 — Júnior vê os dois botões `(Solicitar alteração)` `(Solicitar cancelamento)`

- 🔧 **Funcional F1.6 + AC1/AC2:** botões são **placeholders informativos** no MVP. Não disparam nenhum workflow. Wireframe W2 declara: "↳ placeholders informativos — abrem modal com contato". **Mas o estilo visual `(...)` (parênteses) é o estilo de botão secundário comum** — não comunica "isso aqui não vai fazer nada técnico".
- 🎯 **UX Nielsen H1 (visibilidade do estado):** botão "Solicitar cancelamento" SUGERE ação. Cliente clica esperando que algo aconteça. **Gap UX-P0.**
- 🎯 **UX H2 (mental model):** founder espera comportamento Stripe/AWS — "clico em cancelar, sistema cancela". MVP entrega "clico em cancelar, vejo um popup com e-mail". **Quebra grave de expectativa. Gap UX-P0.**

### Beat 3 — Júnior clica em "Solicitar cancelamento" — modal abre com contato do Bruno

- 🔧 **Funcional:** modal abre conforme wireframe. OK tecnicamente.
- 🎯 **UX H1:** o que aparece no modal? Wireframe não detalha o estado pós-clique. **Gap F-P1:** o conteúdo do "modal de placeholder" não está especificado no wireframe W2 — só na nota.
- 🎯 **UX H1 (visibilidade do estado pós-clique):** modal precisa dizer EXPLICITAMENTE:
  1. **O que NÃO foi feito:** "Seu pedido NÃO foi enviado automaticamente."
  2. **O que o cliente PRECISA fazer:** "Envie um e-mail ao Bruno (link mailto: + cópia do template)."
  3. **O que ESPERAR:** "Bruno responde em até 1 dia útil."
  4. **Próxima cobrança:** "Se você não cancelar até 23/05, a próxima fatura R$ 900 será gerada normalmente em 28/05."
- ⚖️ **Compliance CDC Art. 6º III + Art. 49 (direito de arrependimento):** founder pode estar dentro de 7 dias contados da contratação (direito de arrependimento). Se o sistema "engolir" a solicitação sem ele saber, vira problema legal. **Gap C-P0.**
- ⚖️ **Compliance CDC Art. 51 IV (cláusula abusiva):** se o processo de cancelamento for desproporcionalmente mais difícil que o de contratação, há violação. AwSales: contratação self-service via Stripe vs cancelamento via e-mail manual = **desproporção P1.** **Gap C-P1.**

### Beat 4 — Modal de placeholder fecha, Júnior volta pra Visão Geral, nada mudou

- 🔧 **Funcional:** plano continua `● Ativo`. Faturas continuam sendo geradas. OK porque é o comportamento esperado do MVP.
- 🎯 **UX H1:** **CRÍTICO** — visualmente NADA indica que Júnior solicitou algo. Não há badge "Cancelamento solicitado · aguardando contato do Bruno", não há linha no audit trail, não há e-mail de confirmação automático. **Gap UX-P0 + F-P1.**
- ⚖️ **Compliance CDC Art. 6º III:** ausência de evidência da solicitação prejudica eventual contestação. **Gap C-P1.**

### Beat 5 — Júnior fica em dúvida: "será que cliquei certo?"

- 🎯 **UX H9 (recuperação de erros):** se Júnior cancelou no UI mas pensa que sistema cancelou de verdade, ele NÃO vai mandar e-mail pro Bruno. Em 28/05 vem cobrança de R$ 900 + (caso CodeRabbit tenha multa de fidelidade) multa por quebra. **Dano real P0** ao cliente.
- ⚖️ **Compliance CDC Art. 39 V (cobrança abusiva):** cobrar cliente que SOLICITOU cancelamento (mesmo via placeholder UI) sem aviso explícito do que aconteceu = potencial cobrança abusiva. **Gap C-P0.**

### Beat 6 — Júnior procura audit trail por "cancelamento"

- 🔧 **Funcional Cenário 17 Story 3:** catálogo canônico **NÃO INCLUI** evento `plano.cancelamento_solicitado_pelo_cliente`. Lista atual cobre `plano.mudou`, `plano.status_mudou`, `plano.past_due_reason_adicionado`, `limite_variavel.mudou`. **Gap F-P1:** falta o evento de placeholder.
- ⚖️ **Compliance LGPD Art. 18 II + CDC Art. 6º III:** ato significativo do cliente sem registro = perda de trilha. **Gap C-P1.**

### Beat 7 — Júnior dá up, escreve email manual pro Bruno

- 🔧 **Funcional AC2 (Story de Cancelamento separada):** o fluxo manual via e-mail é o esperado no MVP. Mas a UI deveria pelo menos abrir um e-mail pré-preenchido com `mailto:bruno.costa@awsales.io?subject=Solicitação de cancelamento — CodeRabbit Schools&body=...`. **Gap F-P2:** sem mailto pré-preenchido, founder solo escreve do zero.

### Gaps F4-5

| ID | Severidade | Lente | Lei/Heurística | Descrição |
|---|---|---|---|---|
| F4-5-G1 | **P0** | UX | Nielsen H1 + H2 | Botão "Solicitar cancelamento" parece botão de ação mas é placeholder — quebra de expectativa grave |
| F4-5-G2 | **P0** | UX+Compliance | Nielsen H1 + CDC Art. 6º III | Modal pós-clique não declara EXPLICITAMENTE que pedido não foi enviado + próximos passos + próxima cobrança |
| F4-5-G3 | **P0** | Compliance | CDC Art. 39 V + Art. 49 | Cliente que clicou "cancelar" e sofre cobrança seguinte = potencial cobrança abusiva + violação direito de arrependimento |
| F4-5-G4 | P1 | Compliance | CDC Art. 51 IV | Desproporção contratação self-service vs cancelamento manual = cláusula potencialmente abusiva |
| F4-5-G5 | P1 | Funcional | Cenário 17 + F1.5 | Catálogo canônico de eventos não inclui `plano.cancelamento_solicitado_pelo_cliente` |
| F4-5-G6 | P1 | UX | Nielsen H1 | Sem badge / banner "Cancelamento solicitado · aguardando contato" após o clique |
| F4-5-G7 | P1 | Funcional | F1.6 | Wireframe W2 não especifica o conteúdo concreto do modal pós-clique do placeholder |
| F4-5-G8 | P2 | UX+Funcional | Nielsen H7 | Sem mailto pré-preenchido com template — fricção pra founder solo |

---

## Resumo geral F4

**30 gaps mapeados em 5 cenários × 5 lentes.**

### Por severidade

- **P0 (críticos):** 9 gaps
  - F4-2-G1, F4-2-G2, F4-2-G3, F4-2-G4, F4-2-G5 (pagamento duplicado)
  - F4-5-G1, F4-5-G2, F4-5-G3 (cancelamento placeholder)
- **P1:** 16 gaps
- **P2:** 9 gaps
- **P3:** 1 gap (F4-4-G9)

### Por lente

| Lente | P0 | P1 | P2 | Total |
|---|---|---|---|---|
| 🔧 Funcional | 3 | 8 | 1 | 12 |
| ⚖️ Compliance | 3 | 5 | 2 | 10 |
| 🎯 UX/Acessibilidade | 5 | 9 | 6 | 20 |

(Soma > total porque vários gaps cruzam 2-3 lentes.)

### Top 3 críticos para founder solo SMB (CodeRabbit)

1. **F4-2-G2 + G1 + G4 (P0 · Funcional + Compliance CDC Art. 42 §único):** PENDING (PIX aguardando) permite segunda tentativa sem idempotência → 2 charges → cobrança duplicada efetivada → obrigação CDC de devolução EM DOBRO. Soma de risco financeiro direto + risco de class action via PROCON. **Bloqueador legal P0.**

2. **F4-5-G1 + G2 + G3 (P0 · UX + Compliance CDC Art. 39 V + Art. 49):** Botão "Solicitar cancelamento" parece botão funcional mas é placeholder. Cliente clica, modal não declara que pedido não foi enviado, cliente fica passivo, vem cobrança seguinte. Configura cobrança abusiva + viola direito de arrependimento + desproporção CDC Art. 51 IV. **Bloqueador legal+UX P0.**

3. **F4-1-G2 + G3 (P1 escalando pra P0 · UX + Compliance CDC Art. 6º III + Art. 31):** Card "Próxima cobrança" sem breakdown fixo+variável reforça mental model errado, viola transparência da oferta, e em escala (centenas de founders SMB) vira ticket recorrente + risco de reclamação ProCon. **Sistêmico em todo o segmento SMB.**

### Padrões transversais

- **Vocabulário técnico vazando pra UI** (F4-1-G1 "Em aberto", F4-4-G1 a G4 audit trail snake_case, F4-2-G9 "PENDING/OPEN").
- **Ausência de breakdown de cobrança** (F4-1-G2/G3, F4-3-G1/G2/G3).
- **Placeholders informativos sem comunicação explícita do "o que NÃO aconteceu"** (F4-5-G1/G2 + F4-1 sobre próxima cobrança fixa vs variável).
- **Compliance CDC sistemático:** Art. 6º III aparece em 8 dos 30 gaps. Founder solo SMB é o segmento mais exposto a violações de CDC porque não tem jurídico próprio pra contestar — mas é o segmento mais propenso a abrir reclamação no PROCON.

### Confirmação de anti-claims

- **AC1 (sem self-service de mudança de plano):** respeitado, mas placeholder UX é P0.
- **AC2 (sem cancelamento self-service):** respeitado em escopo, mas placeholder UX é P0.
- **AC3 (sem SIEM streaming):** não impacta founder solo.
- **AC4 (desktop only):** respeitado.
- **AC5 (PT-BR only):** respeitado.
- **AC6 (sem customização de limite variável pelo cliente):** respeitado — F4-1-G3 não pede mudança, pede transparência.
- **AC7 (sem match PO ↔ NF):** não impacta founder solo.
