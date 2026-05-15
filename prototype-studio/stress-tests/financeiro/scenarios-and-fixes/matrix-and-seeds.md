# Matriz e Seeds — Stress Test Financeiro 2026-05-11

## Matriz

**Eixo:** Perfil financeiro do cliente (6 categorias cruzando complexidade de cobrança + compliance + UX scanner)
**Sub-eixo:** 5 cenários adversariais por perfil cobrindo as 5 dores canônicas do financeiro:
1. Visualização (gráfico, tabela, filtros)
2. Pagamento (status Stripe, retry, dispute)
3. Créditos (cupom, voucher, cross-org)
4. Audit Trail (export, contextual, LGPD)
5. Plano + governança (readonly, contato gerente)

**Total:** 6 × 5 = 30 cenários

| Perfil | Foco principal | Particularidade |
|---|---|---|
| **F1 — SaaS médio ativo** (Fyntra Tecnologia) | Confere cobrança mensal | 1 plano + 1 cartão, cupons leves, sem voucher |
| **F2 — Past_due crônico** (Casa Bahia Filial) | Sobrevive a régua D+N | Múltiplas razões past_due, boleto D+30 cliente, régua dispara, voucher tenta cobrir |
| **F3 — Fintech regulada BACEN** (NeoBank Co.) | Auditoria mensal + dispute | Export pra SIEM (manual via CSV no MVP), chargeback ganho, segregação de funções |
| **F4 — Founder solo confuso** (CodeRabbit Schools) | Não entende cobrança | Erra cupom, confunde PENDING vs OPEN, mental model "preço único" |
| **F5 — Holding multi-org** (Vitru CFO Ricardo) | Vê 5 orgs ao mesmo tempo | Vouchers cross-org, cupons distribuídos, audit cross-org pessoal |
| **F6 — High-volume** (TransExpress 1M+ disparos/mês) | Escala extrema | 100k+ eventos de gasto variável, gráfico não escala?, audit trail 50k+ eventos |

---

## Seeds — 30 cenários

> **Cada seed deve ser expandida em walkthrough com 3 lentes:** 🔧 Funcional · ⚖️ Compliance · 🎯 UX/Acessibilidade.

---

### F1 — SaaS médio ativo (Fyntra Tecnologia, Felipe Rezende CTO, R$ 2.500/mês + variável)

**F1-1 · Visualização: filtro "Mês passado" mas gráfico mostra "Este mês":**
Felipe muda filtro de data pra "Mês passado" pra ver consumo de abril, mas o gráfico re-renderiza com label "Período: 01/05/2026 a 31/05/2026" (não atualizou). **Lentes:** F (sincronização gráfico+filtro), U (Nielsen H1 visibilidade do estado).

**F1-2 · Pagamento: clica em "Trocar cartão" mas perde contexto:**
Felipe está na visão geral, clica em "✎ Trocar" no card de fatura. Vai pra sub-tela `metodos-pagamento`. Adiciona novo cartão via Stripe Elements, sucesso, mas ao voltar o filtro de data foi resetado pra "Este mês" e o toggle voltou pra "Por serviço". **Lentes:** F (preservação de estado cross-navegação), U (Nielsen H3 user control & freedom).

**F1-3 · Créditos: aplica cupom válido mas em moeda errada:**
Felipe recebe código `BF2025USD` por e-mail (criado em USD pra outro tier). Aplica no campo da Saldo de Créditos. Stripe retorna `coupon_currency_mismatch`. **Lentes:** F (validação de currency), ⚖ CDC Art. 6º III (informação clara), U (Nielsen H9 mensagem específica). Mensagem precisa dizer "Cupom em USD não compatível com sua moeda BRL" — não genérico.

**F1-4 · Audit Trail: tenta exportar audit trail dos últimos 30 dias mas a janela de retenção foi violada:**
Felipe quer exportar dia 30/05. Filtro "Últimos 30 dias" inclui dados pessoais de funcionário que foi demitido em 15/05 e exerceu direito de "ser esquecido" via DPO. Cliente exporta o CSV — **CSV contém dados que deveriam ter sido anonimizados**. **Lentes:** ⚖ LGPD Art. 18 VI (direito ao apagamento) — Audit trail tem politica de retenção 5 anos, MAS direito ao apagamento prevalece? F (anonimização automática post-DSR), U (aviso sobre o que foi anonimizado no export).

**F1-5 · Plano: clica "Solicitar alteração" mas modal não tem evidência de envio:**
Felipe clica em "Solicitar alteração de plano" no Modal Detalhes do Plano. Modal mostra contato do Bruno Costa (gerente da conta). Felipe pensa "ok, e agora?" — não fica claro se o sistema notificou o Bruno automaticamente ou se Felipe precisa contatar manualmente. **Lentes:** U (Nielsen H1 visibilidade do estado — placeholder informativo precisa ser MUITO explícito), ⚖ CDC Art. 6º III.

---

### F2 — Past_due crônico (Casa Bahia Filial, Aderbal 60 anos diretor financeiro, R$ 4.500/mês plano + boleto D+30)

**F2-1 · Visualização: plano em PAST_DUE com 3 razões aparece como "Ativo" no card:**
Aderbal entra no Financeiro. Card do plano mostra "Plano Pro · ● Ativo · R$ 4.500/mês". **Mas no Modal Detalhes** mostra "PAST_DUE desde 14/05" com 3 razões: PLAN + FEE + IMPLEMENTATION. **Lentes:** F (sincronização card vs modal), U (Nielsen H1 — status inconsistente), ⚖ CDC Art. 6º III (cliente DEVE saber que está em past_due imediatamente, não escondido em modal).

**F2-2 · Pagamento: fatura PAYMENT_FAILED com botão "Tentar de novo" mas Stripe ainda retentando automaticamente:**
Aderbal vê fatura em status `PAYMENT_FAILED`. Clica em "Tentar de novo" no menu kebab. **Stripe estava no meio do retry automático** (3ª tentativa). Resultado: race condition, 2 charges ao mesmo tempo. **Lentes:** F (idempotência cross-Stripe), ⚖ PCI-DSS 11.5 (proteção contra duplicação), U (Nielsen H5 prevenção de erros — botão deve estar disabled durante retry automático).

**F2-3 · Créditos: voucher consumido cobre apenas parte da fatura mas tela diz "Pago":**
Aderbal tem voucher ACTIVE com saldo R$ 200. Fatura de custos variáveis sai R$ 500. Voucher debita R$ 200 (status passa pra DEPLETED), restam R$ 300 a pagar. **Stripe webhook envia 2 eventos:** `voucher.consumed` (R$ 200) E `invoice.payment_failed` (R$ 300 restantes). UI mostra "fatura.parcialmente_paga" — mas status na lista aparece como `PAYMENT_FAILED`. Aderbal pensa que voucher não foi usado. **Lentes:** F (status inconsistente Stripe + UI), U (Nielsen H1 — visibilidade do parcial é crítica), ⚖ CDC Art. 6º III.

**F2-4 · Audit Trail: régua D+3 suspende org no meio do export CSV:**
Aderbal está exportando CSV do audit trail (47k eventos, async). Enquanto export está sendo gerado, a régua D+3 dispara e suspende a org (`org.suspensa_inadimplencia`). **Tela de export retorna 403 quando Aderbal volta** — não consegue baixar o CSV que solicitou. **Lentes:** F (download persistido cross-suspension), ⚖ LGPD Art. 18 II (direito de acesso preservado mesmo em inadimplência? Sim por princípio), U (mensagem de erro confusa).

**F2-5 · Plano: Aderbal tenta solicitar cancelamento mas está em past_due:**
Aderbal clica em "Solicitar cancelamento" no Modal Detalhes. Modal informativo abre com contato Bruno. **Mas Aderbal já está em PAST_DUE há 30 dias** — cancelar agora é resolução do problema, não escalation. Sistema deveria sugerir "Resolver pendência → Negociar com gerente da conta → Cancelamento se necessário". **Lentes:** U (Nielsen H10 help contextual), ⚖ CDC Art. 6º III (cliente em dificuldade tem direito a info clara sobre opções).

---

### F3 — Fintech regulada BACEN (NeoBank Co., CEO Lucas, 200 FTE, dispute aberto + chargeback ganho)

**F3-1 · Visualização: dashboard precisa segregar dados PII vs não-PII por permissão (segregação BACEN):**
Lucas (CEO, função "Administrador" sem `Visualizar PII`) entra no Financeiro. Vê tabela de campanhas — mas cada campanha vincula a um usuário criador. Coluna "Criado por" do audit trail mostra nomes completos. Tela cumpre PII Filtering? **Lentes:** ⚖ LGPD Art. 46 + BACEN segregação, F (PII filter aplicado server-side), U (mascaramento visualmente consistente — não muda layout, só conteúdo).

**F3-2 · Pagamento: fatura DISPUTED + chargeback ganho — exibição clara da resolução:**
Cliente NeoBank teve dispute aberto em fatura `INV-2026-03-1234` (R$ 50k). Após resolução, Stripe muda pra `CHARGEBACK_RESOLVED` (a favor da AwSales). UI mostra status — mas onde aparece a NARRATIVA do que aconteceu (data abertura → data resolução → motivo aceito)? **Lentes:** ⚖ CDC Art. 6º III (transparência total da disputa), F (timeline de eventos no modal de fatura), U (Nielsen H1 visibilidade do estado completo).

**F3-3 · Créditos: voucher pré-pago pra BACEN compliance (recibo emitido fiscalmente):**
NeoBank tem voucher de R$ 100k vigente até 31/12. Procurement exige **recibo fiscal** pra cada R$ R consumido (registro contábil). Sistema gera audit event `voucher.consumido` mas **não emite NF/recibo automático**. Procurement contesta. **Lentes:** F (integração com sistema NF), ⚖ BACEN registro contábil + CDC nota fiscal eletrônica, U (visibilidade do recibo no audit trail).

**F3-4 · Audit Trail: InfoSec exige eventos críticos exportados em formato CEF/LEEF pra SIEM:**
NeoBank tem Splunk. Compliance pede streaming SIEM em <60s (gap conhecido P0 P3 do stress test anterior). MVP só tem CSV manual. Lucas exporta CSV — **mas Splunk não parseia formato exportado** (sem schema canônico documentado, sem assinatura HMAC). **Lentes:** ⚖ BACEN Circular 4.893 cibersegurança, F (schema canônico + assinatura), U (cliente sem dev backend não consegue automatizar).

**F3-5 · Plano: NeoBank quer evidência de SEGREGAÇÃO DE FUNÇÕES (CISO ≠ Admin):**
Lucas atribui função "CISO Read-Only" (custom criada na Story 2) pra um auditor externo. Auditor entra no Financeiro — vê faturas mas não vê PII (cartão completo, e-mails de NF mascarados). MAS o auditor vê audit trail completo incluindo "Felipe.rezende@fyntra.com mudou cartão" — **nome completo do executor**. **Lentes:** ⚖ LGPD Art. 46 + BACEN segregação, F (PII Filtering aplica em executor do audit também), U (mascaramento consistente).

---

### F4 — Founder solo confuso (CodeRabbit Schools, Júnior fundador, R$ 900/mês plano + variável zero)

**F4-1 · Visualização: gráfico de gastos variáveis vazio mas card de "Próxima cobrança" mostra R$ 2.500:**
Júnior é founder solo. Não tem campanhas ativas (gastos variáveis = R$ 0). Mas o card "Próxima cobrança" mostra R$ 2.500 (valor do plano). Júnior pensa "vou ser cobrado R$ 2.500 mesmo sem usar?" **Lentes:** U (Nielsen H2 mental model — Júnior espera "pago só pelo que uso"), ⚖ CDC Art. 6º III (info clara), F (label do card precisa ser "Próxima cobrança do plano fixo" ou similar).

**F4-2 · Pagamento: fatura status PENDING (PIX aguardando confirmação) — Júnior pensa que falhou:**
Júnior pagou PIX da implementação. Stripe ainda não recebeu callback (PIX leva até 30 segundos). UI mostra status `PENDING` em amarelo. Júnior pensa "deu errado" — paga DE NOVO com cartão. **2 charges no Stripe**. **Lentes:** F (PIX retry prevention), ⚖ CDC Art. 42 §único (cobrança indevida), U (Nielsen H1 — PENDING precisa ter copy específico tipo "Aguardando confirmação do banco — leva até 30s, não pague de novo").

**F4-3 · Créditos: cupom ONBOARD aplicado mas Júnior não entende por que valor da próxima fatura sumiu:**
Bruno (comercial) aplicou cupom `ONBOARD` (R$ 482,30) na conta da CodeRabbit. Júnior vê na tabela "Cupons aplicados" mas a próxima fatura mostra "R$ 17,70" (R$ 500 - R$ 482,30). Júnior pensa "vou pagar R$ 17? Tem certeza?". **Lentes:** U (Nielsen H2 mental model + H10 help — modal de fatura deveria mostrar antes/depois do desconto), F (cálculo correto), ⚖ CDC Art. 6º III.

**F4-4 · Audit Trail: Júnior nunca usou audit trail e não entende por que existe:**
Júnior rola até o rodapé da Visão Geral, vê seção "Audit Trail Financeiro". Olha as linhas — não entende o que é "fatura.paga", "cartao.padrao_mudou" (jargão técnico). Acha que é "log de erros" e ignora. **Lentes:** U (Nielsen H2 + H10 — vocabulário do cliente, não técnico; tooltip explicativo), ⚖ LGPD Art. 6º VI (transparência — cliente deve entender o que está sendo registrado).

**F4-5 · Plano: Júnior quer cancelar mas botão é placeholder informativo — não entende que precisa contatar Bruno:**
Júnior decidiu cancelar (vai vender a escola). Clica em "Solicitar cancelamento" no Modal Detalhes do Plano. Modal abre com nome do Bruno + e-mail. **Júnior espera que clicar dispare o cancelamento.** Fica confuso quando nada muda na conta. **Lentes:** U (Nielsen H1 visibilidade do estado — placeholder informativo precisa ser muito claro tipo "Próximo passo: enviamos seu pedido pro Bruno e ele entra em contato em 24h" mesmo que NÃO envie de fato), ⚖ CDC Art. 6º III (info clara do processo de cancelamento).

---

### F5 — Holding multi-org (Vitru, Ricardo CFO em 5 orgs)

**F5-1 · Visualização: Ricardo está na org Anhanguera mas vê dados consolidados das 5 orgs no card "Total economizado":**
Ricardo entra no Financeiro da Anhanguera. Card "Total economizado" mostra R$ 482,30. **Mas Ricardo tem cupons aplicados nas outras 4 orgs também** (total R$ 1.500 economizado lifetime). Card é por org? Por user? **Lentes:** F (escopo do card cross-org claro), U (Nielsen H1 visibilidade — label deve dizer "Total economizado nesta org" ou "em todas as suas orgs"), ⚖ LGPD Art. 6º (princípio da finalidade — dados cross-org só com base legítima).

**F5-2 · Pagamento: voucher emitido pra "Holding Vitru" aplica em todas as 5 orgs ou só em uma?:**
Bruno emitiu voucher de R$ 5.000 pra "Holding Vitru" (CNPJ da holding). Mas Vitru tem 5 orgs com CNPJs diferentes (subsidiárias). Voucher aplica em todas? Em qual? Stripe vincula a 1 customer = 1 org. **Lentes:** F (modelo cross-org do voucher indefinido), ⚖ LGPD + CDC info clara sobre escopo, U (visibilidade do escopo "Aplica em: Anhanguera" no card de voucher).

**F5-3 · Créditos: Ricardo quer ver TOTAL ECONOMIZADO em todas as 5 orgs num único lugar:**
Ricardo é CFO multi-org. Quer visão consolidada de créditos. Hoje precisa entrar em 5 orgs separadas. Story 2 W15 (Audit Trail Pessoal Cross-Org) existe mas é só pra audit, não pra créditos/vouchers. **Lentes:** F (gap declarado no stress test anterior P5), U (escala de fricção operacional), ⚖ CDC Art. 6º III + LGPD Art. 18 II (acesso aos próprios dados cross-org).

**F5-4 · Audit Trail: Ricardo exportou audit trail de todas as orgs, mas CSV não tem coluna `org_id`:**
Já endereçado na Story 2 (Q19 da Story 2 + Cenário 41). MAS no contexto da Story 3 Financeiro, audit trail contextual da sub-aba "Saldo de Créditos" filtra por cupom/voucher — quando Ricardo exporta CSV daqui, ele tem TODAS as orgs ou só a atual? **Lentes:** F (escopo do export contextual), ⚖ LGPD Art. 18 II, U (visibilidade do escopo do export antes do clique).

**F5-5 · Plano: Ricardo quer comparar planos das 5 orgs num único lugar:**
Cada org pode estar em plano diferente (Anhanguera Enterprise, UNIASSELVI Pro, etc.). Ricardo precisa comparar pra negociação com Bruno. Tem que entrar em 5 modais separados. **Lentes:** F (visão consolidada cross-org de planos), U (Jakob's Law — usuários esperam consistência cross-org), ⚖ CDC Art. 6º III.

---

### F6 — High-volume (TransExpress, 1M+ disparos/mês, audit 50k+ eventos)

**F6-1 · Visualização: gráfico não escala — 31 barras × 1M disparos por barra:**
TransExpress dispara 1M+ mensagens/mês. Gráfico empilhado tenta renderizar 31 barras com valor médio R$ 30k/dia. Y-axis vai até R$ 60k. Mas as barras de Disparos viram quase todo o gráfico (95%), tornando Leads/Mensagens/Tokens invisíveis. **Lentes:** F (gráfico precisa de scale log? ou normalizado %?), U (Nielsen H8 design minimalista — informação relevante deve ser visível), ⚖ CDC Art. 6º III (cliente DEVE ver o detalhe dos custos pra contestar se necessário).

**F6-2 · Pagamento: fatura de R$ 500k+ vence — qual cor de status badge?:**
TransExpress tem fatura mensal de R$ 500k. Vence em 5 dias. Status `OPEN`. Cor amarela. **Mas o impacto é catastrófico** (fatura tão grande deveria ter destaque visual maior do que uma de R$ 100). **Lentes:** U (Nielsen H1 — relevância visual = magnitude do impacto), F (priorização de UI por valor), ⚖ CDC Art. 6º III (info clara da urgência).

**F6-3 · Créditos: TransExpress recebeu voucher de R$ 50k mas DEPLETED em 2 dias:**
Voucher emitido sexta. Segunda já está `DEPLETED` (consumido R$ 50k em 2 dias). Ricardo (CFO) só vê na quarta. Tabela vouchers mostra "DEPLETED" mas sem alerta proativo. **Lentes:** U (Nielsen H1 visibilidade — DEPLETED de voucher recente é evento crítico, deveria ter notificação), F (alerta proativo via e-mail/in-app), ⚖ CDC Art. 6º III.

**F6-4 · Audit Trail: 50k+ eventos no período filtrado — UI trava ou paga performance:**
Bárbara (admin novo) entra no audit trail completo. Filtro padrão "Este mês" retorna 50k eventos. UI tenta renderizar a primeira página (50 itens) mas o total ("50.234 eventos") já demora 3s pra carregar. Scroll infinito quebra a partir da 5ª página (rendering performance). **Lentes:** F (paginação eficiente, virtual scroll), U (Nielsen H1 — loader durante busca de total), ⚖ LGPD Art. 18 II (direito de acesso preservado mesmo em escala).

**F6-5 · Plano: TransExpress está em Enterprise mas o "Próxima cobrança" não mostra valor variável esperado:**
Card "Próxima cobrança" mostra "R$ 7.000 · 30/06". Mas TransExpress sabe que gasta R$ 500k+ em variável. Cliente pensa "só R$ 7k?" — não percebe que é APENAS o plano fixo, não inclui o variável. **Lentes:** U (Nielsen H1 + H10 — copy ambíguo, precisa tooltip explicando "Plano fixo · Variável estimado: R$ 500k em base no consumo médio"), ⚖ CDC Art. 6º III.

---

## Sanity check dos seeds

- [x] Todos os 30 seeds têm cliente nomeado + números específicos + ação adversarial + lentes mapeadas
- [x] Adversarialidade validada (cada seed tem "dor potencial" que estressa o SUT)
- [x] Lentes Funcional + Compliance + UX aplicadas em cada cenário
- [x] Leis aplicáveis citadas explicitamente nos cenários relevantes (LGPD Art. X, PCI-DSS Y.Y, CDC Art. Z, BACEN Circular W)
- [x] Anti-claims respeitados (mudança self-service de plano, mobile, SIEM streaming são out-of-scope)
