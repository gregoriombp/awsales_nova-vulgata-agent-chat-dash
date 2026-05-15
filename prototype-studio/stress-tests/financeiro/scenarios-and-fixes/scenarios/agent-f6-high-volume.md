# Agent F6 — High-volume (TransExpress · 1M+ disparos/mês · fatura R$ 500k+)

**Data:** 2026-05-11
**Perfil:** F6 — operação logística TransExpress. Volume mensal 1M+ disparos. Fatura mensal R$ 500k+. Audit trail 50k+ eventos/mês. CFO (Ricardo) + Admin novo (Bárbara) usam a UI.
**SUT:** [stories/financeiro.md](../../stories/financeiro.md) · [archive/wireframes-ascii/financeiro.md](../../archive/wireframes-ascii/financeiro.md) · [prototypes/financeiro.html](../../prototypes/financeiro.html)
**Foco adversarial:** escalabilidade visual, performance de rendering, CDC Art. 6º III em valores altos, alertas proativos em eventos críticos quando ordem de magnitude muda.
**Lentes aplicadas em cada beat:** 🔧 Funcional · ⚖️ Compliance · 🎯 UX/Acessibilidade

---

## Seed F6-1 · Gráfico empilhado não escala — 31 barras × R$ 30k/dia, disparos dominam 95%

### Contexto
TransExpress dispara ~33k/dia (1M/mês). Custo médio diário de variáveis: R$ 30k. Pico em D+5 da black friday: R$ 80k. Gráfico empilhado de barras (W1 linhas 54–63) tenta renderizar 31 barras, cada uma com 4 segmentos (Disparos/Leads/Mensagens/Tokens). O segmento de Disparos é ~95% de cada barra (1.245 disparos × R$ 24/unit no contrato enterprise = R$ 29.880; demais segmentos somam R$ 1.500). Y-axis vai até R$ 80k. Leads/Mensagens/Tokens tornam-se faixas de 1-2 pixels.

### Walkthrough beat-by-beat

**Beat 1 — Ricardo (CFO) abre Visão Geral, vê o gráfico**
- 🔧 **Funcional · P1:** o protótipo (prototypes/financeiro.html:456 `generateBars`) usa proporções **fixas** (`[['disparos', 0.4], ['leads', 0.25], ['msgs', 0.2], ['tokens', 0.15]]`). Em produção real com TransExpress, a proporção real é ~95/2/2/1 — Leads/Msgs/Tokens viram faixas sub-pixel. A spec da Story (Cenário 5.1) não menciona scale strategy nem mínimo de altura por segmento — **gap funcional crítico**: rendering quebra UX em ordem de magnitude alta.
- 🎯 **UX/A11y · P1 (Nielsen H8 + H1):** quando 95% do gráfico é uma cor, o "design minimalista" vira "design mono-informacional". Ricardo não consegue visualmente comparar Leads vs Mensagens vs Tokens — a informação está lá mas invisível. **Falha H1 visibilidade do estado do sistema.**
- ⚖️ **Compliance · P1 (CDC Art. 6º III):** o cliente tem direito à informação clara e adequada sobre cobranças. Se o gráfico esconde 3 das 4 categorias por escala, viola o direito à transparência. Em fatura de R$ 500k, isso não é cosmético — é base pra contestar/auditar cobrança.

**Beat 2 — Ricardo tenta ler valores específicos**
- 🔧 **Funcional · P1:** tooltip do bar (prototype linha 474 `title="Dia X · R$ Y"`) mostra só **total do dia**, não breakdown por serviço. Em alto volume, o cliente PRECISA dos sub-valores pra cruzar com extrato interno. **Gap:** tooltip precisa de breakdown por segmento (Disparos: R$ X, Leads: R$ Y, …).
- 🎯 **UX · P1 (Nielsen H6 recognition):** Ricardo lembra-se que viu R$ 80k no D+5 mas não consegue confirmar quantos R$ foram disparos vs tokens sem clicar/recarregar a tela. Trade-off não declarado: tooltip rico vs simplicidade.
- ⚖️ **Compliance · P2 (LGPD Art. 6º finalidade):** dado existe mas não é apresentado de forma proporcional ao volume — proporcionalidade da apresentação não está coberta na spec.

**Beat 3 — Ricardo procura toggle de escala (log? %?)**
- 🔧 **Funcional · P0:** **não existe** opção de scale log nem normalização percentual. Spec (Cenário 5) só define "gráfico de barras empilhadas por dia". Em alto volume, escala linear vira inútil; escala log ou view "100% empilhado" (cada barra normaliza pra 100%) deveria ser opcional. **Gap arquitetural.**
- 🎯 **UX · P1 (Nielsen H7 flexibilidade):** power users (CFO de cliente enterprise) precisam de atalhos pra ver dados em diferentes representações. Story atende "presets de data" mas não "presets de visualização do gráfico".
- ⚖️ **Compliance · P2 (CDC Art. 6º III):** informação adequada inclui formato adequado à magnitude. Gráfico que esconde 3/4 das categorias em alto volume não é "adequado".

**Beat 4 — Ricardo escala manualmente: clica num dia pra ver detalhe**
- 🔧 **Funcional · P2:** spec não define **drill-down a partir do gráfico**. Cliente clica numa barra → nada acontece. Tem que rolar pra tabela detalhada abaixo e procurar manualmente. **Gap UX-funcional.**
- 🎯 **UX · P2 (Nielsen H7):** flexibilidade pra power user comprometida.

### Gaps F6-1 consolidados

| ID | Severidade | Lente | Descrição | Lei/Padrão |
|---|---|---|---|---|
| **F6-1.G1** | **P1** | 🔧 Func | Gráfico empilhado em escala linear esconde 3/4 das categorias quando uma domina ≥90% — sem fallback (log/100%-stacked) | — |
| **F6-1.G2** | **P1** | 🎯 UX | Tooltip do bar mostra só total, não breakdown por segmento — falha H6 recognition em alto volume | Nielsen H1, H6, H8 |
| **F6-1.G3** | **P0** | 🔧 Func | Falta opção de scale log e/ou 100%-stacked normalization na spec | — |
| **F6-1.G4** | **P1** | ⚖️ Comp | Apresentação não-proporcional à magnitude viola "informação adequada" do CDC | CDC Art. 6º III |
| **F6-1.G5** | **P2** | 🔧 Func | Sem drill-down ao clicar numa barra do gráfico — quebra fluxo de auditoria | — |

---

## Seed F6-2 · Fatura R$ 500k+ vence em 5 dias, status OPEN com cor amarela "comum"

### Contexto
TransExpress tem fatura mensal de R$ 500k+ (variáveis). Vence em 5 dias. Status `OPEN`. No design atual (prototypes/financeiro.html:115 `.status-badge.pending{background:var(--yellow-bg);color:var(--yellow);}`), badge amarelo. **Mesma cor e tamanho** do que o badge OPEN de uma fatura de R$ 100. A magnitude do impacto não muda a hierarquia visual.

### Walkthrough beat-by-beat

**Beat 1 — Ricardo entra na Visão Geral, vê card "Fatura atual"**
- 🔧 **Funcional · P1:** card "Fatura atual" (W1 linhas 35–38) usa exatamente o mesmo template independente do valor. Não há tratamento por magnitude. Em R$ 500k vencendo, deveria ter destaque visual proporcional ao impacto operacional (financeiro CRÍTICO de cliente enterprise). **Gap:** sem priorização por valor.
- 🎯 **UX · P1 (Nielsen H1 visibilidade):** "visibilidade do estado" inclui visibilidade da urgência. Estado igual + magnitude diferente = sistema não comunica diferenças que importam. Badge amarelo de R$ 100 e R$ 500k não podem ter o mesmo peso visual.
- ⚖️ **Compliance · P1 (CDC Art. 6º III):** informação **clara** da urgência. Cliente enterprise precisa saber, num glance, que essa fatura é não-comum.

**Beat 2 — Ricardo confere a data de vencimento**
- 🔧 **Funcional · P1:** wireframe mostra "Vencimento 28/05/2026" como texto plano. Sem indicador de "faltam X dias" nem urgência crescente conforme aproxima do vencimento. **Gap:** countdown não está na spec.
- 🎯 **UX · P1 (Nielsen H10 help):** falta tooltip ou inline "Vence em 5 dias úteis" — exige cálculo mental.
- ⚖️ **Compliance · P1 (CDC Art. 6º III):** prazo é elemento essencial da cobrança. CDC exige clareza do prazo.

**Beat 3 — Ricardo procura notificação proativa**
- 🔧 **Funcional · P0:** **não há na spec** mecanismo de alerta proativo (e-mail/push/in-app banner) pra fatura de alto valor próxima do vencimento. Cliente enterprise depende de aviso ativo, não só visualização passiva. **Gap arquitetural.** Story 3 lista eventos `fatura.gerada/paga/falhou` no audit trail mas não cobre **notificação**.
- 🎯 **UX · P0 (Nielsen H1):** "visibilidade do estado" requer notificação pra eventos críticos. Banner amarelo só visível DENTRO da aba Financeiro não basta — cliente raramente entra ali.
- ⚖️ **Compliance · P1 (CDC Art. 6º III + Art. 39 XII analogia):** fornecedor deve avisar com antecedência adequada cobrança vincenda. Sem aviso proativo, cliente pode ser surpreendido.

**Beat 4 — Ricardo abre detalhe da fatura, vê valor exato**
- 🔧 **Funcional · P2:** modal "Ver detalhes da fatura" (W4) lista line items, mas não tem "esta fatura é X% maior que sua média mensal" — falta de contexto comparativo. **Gap:** sinalizar anomalia financeira (variação acima de média histórica).
- 🎯 **UX · P2 (Nielsen H10):** ajuda contextual ausente.

### Gaps F6-2 consolidados

| ID | Severidade | Lente | Descrição | Lei/Padrão |
|---|---|---|---|---|
| **F6-2.G1** | **P1** | 🔧 Func | Badge de status não escala por magnitude do valor — R$ 100 e R$ 500k têm mesmo peso visual | — |
| **F6-2.G2** | **P1** | 🎯 UX | Card "Fatura atual" sem destaque proporcional a valor crítico | Nielsen H1 |
| **F6-2.G3** | **P1** | 🎯 UX | Vencimento sem countdown — "Vence em 5 dias" deveria ser explícito | Nielsen H10 |
| **F6-2.G4** | **P0** | 🔧 Func | Sem notificação proativa (e-mail/push/banner cross-page) pra fatura de alto valor vincenda | — |
| **F6-2.G5** | **P1** | ⚖️ Comp | Sem aviso de cobrança vincenda viola dever de informação adequada do prazo | CDC Art. 6º III |
| **F6-2.G6** | **P2** | 🔧 Func | Modal de fatura não sinaliza variação anômala vs histórico (R$ 500k em mês onde média foi R$ 200k) | — |

---

## Seed F6-3 · Voucher R$ 50k emitido sexta, DEPLETED segunda — Ricardo só vê quarta

### Contexto
Admin AwSales emite voucher de R$ 50k pra TransExpress na sexta 17h (incentivo comercial pós-negociação). TransExpress consome todo o voucher no fim de semana porque dispara 33k/dia × 3 dias × variáveis = ~R$ 90k. Status passa de PENDING → ACTIVE → DEPLETED em 60h. Ricardo (CFO) só entra na aba Financeiro na quarta-feira, vê tabela vouchers com linha "DEPLETED" sem alerta visual proativo.

### Walkthrough beat-by-beat

**Beat 1 — Voucher emitido (sexta 17h)**
- 🔧 **Funcional · P2:** evento `voucher.emitido` é registrado no audit trail (Cenário 17), mas **não há trigger de notificação** ao admin da org. Cliente descobre quando entra na UI. Spec não cobre notificação por e-mail/push de novo voucher.
- 🎯 **UX · P1 (Nielsen H1):** "visibilidade do sistema" inclui notificar eventos relevantes — emissão de R$ 50k em crédito é altamente relevante.
- ⚖️ **Compliance · P2 (CDC Art. 6º III):** transparência de descontos disponibilizados.

**Beat 2 — Voucher consumido R$ 30k no sábado, R$ 20k no domingo (DEPLETED)**
- 🔧 **Funcional · P0:** **não há alerta proativo** de "voucher esgotou em <72h". Evento `voucher.consumido` é registrado no audit trail (Cenário 17), mas é log, não notificação. **Gap arquitetural** — depleção rápida de voucher recém-emitido é sinal claro de anomalia (ou que o voucher foi subdimensionado), merece alerta.
- 🎯 **UX · P0 (Nielsen H1):** sistema falha em comunicar evento crítico. Card "Total desconto disponível" cai de R$ 1.250 + R$ 50.000 = R$ 51.250 pra R$ 1.250 sem alerta — silent failure.
- ⚖️ **Compliance · P1 (CDC Art. 6º III):** cliente tem direito de saber que o benefício foi consumido antes que precise tomar uma decisão (ex: reduzir disparos).

**Beat 3 — Ricardo entra na aba Financeiro (quarta-feira)**
- 🔧 **Funcional · P1:** tabela vouchers (W5 linhas 312–318) mostra "DEPLETED" como mais um status. Sem destaque temporal (ex: "Esgotou há 3 dias"). Sem CTA pra solicitar novo voucher ou entender consumo acelerado.
- 🎯 **UX · P1 (Nielsen H10):** falta contexto explicativo — POR QUE esgotou tão rápido? Link pra audit trail filtrado por esse voucher? Não há.
- ⚖️ **Compliance · P2 (CDC Art. 6º III + Art. 42 §único):** se a depleção foi inesperada e gerou cobrança não-prevista, cliente tem direito de contestar. UI não facilita.

**Beat 4 — Ricardo clica em "Ver →" no voucher DEPLETED**
- 🔧 **Funcional · P1:** spec não define **modal de detalhes do voucher** com histórico de consumo (lista de faturas/disparos que consumiram o crédito). W5 menciona "Clique numa linha pra ver detalhes (taxas elegíveis, histórico de consumo)" mas não há wireframe do modal. **Gap:** modal não especificado.
- 🎯 **UX · P1 (Nielsen H4 consistência):** modais de campanha e de fatura têm wireframe; modal de voucher consumido não. Inconsistência na profundidade da spec.

### Gaps F6-3 consolidados

| ID | Severidade | Lente | Descrição | Lei/Padrão |
|---|---|---|---|---|
| **F6-3.G1** | **P0** | 🔧 Func | Sem notificação proativa de evento crítico voucher.consumido quando saldo zera rapidamente | — |
| **F6-3.G2** | **P0** | 🎯 UX | Cards de resumo não alertam quando "Total desconto disponível" tem queda brusca | Nielsen H1 |
| **F6-3.G3** | **P2** | 🔧 Func | voucher.emitido sem notificação ao admin da org cliente | — |
| **F6-3.G4** | **P1** | 🎯 UX | Tabela vouchers sem destaque temporal ("Esgotou há 3 dias") nem CTA pra investigação | Nielsen H10 |
| **F6-3.G5** | **P1** | 🔧 Func | Modal de detalhes do voucher mencionado em W5 mas sem wireframe — histórico de consumo não especificado | — |
| **F6-3.G6** | **P1** | ⚖️ Comp | Cliente surpreso por depleção rápida fica sem contexto pra contestar/auditar | CDC Art. 6º III, Art. 42 §único |

---

## Seed F6-4 · Audit Trail com 50k+ eventos no mês — performance e paginação

### Contexto
Bárbara é Admin novo da TransExpress (semana 1). Quer auditar audit trail completo do mês. Filtro padrão "Este mês" retorna 50.234 eventos (1M+ disparos geram milhares de eventos `fatura.gerada`, `voucher.consumido`, `cupom.aplicado_pelo_admin`, etc.). W7 mostra "1.245 eventos exibidos" — número claramente subdimensionado pra cliente enterprise. Spec não cobre paginação eficiente nem virtual scroll. Q5 (stories/financeiro.md:481) bloqueia export acima de 100k mas não define UX pra display.

### Walkthrough beat-by-beat

**Beat 1 — Bárbara abre Audit Trail completo**
- 🔧 **Funcional · P0:** spec Cenário 16 e W7 não definem **estratégia de paginação/virtual scroll**. "Carregar mais (50 a 100 de 1.245)" implica scroll infinito com batch de 50, mas com 50k eventos isso vira 1000 cliques. **Gap:** falta paginação real (números de página) + virtual scroll pra renderizar lista grande sem travar DOM.
- 🎯 **UX · P0 (Nielsen H7 flexibilidade):** scroll infinito pra dataset de 50k = anti-pattern. Power user precisa paginação numérica + opção de "Ir pra evento X / data Y".
- ⚖️ **Compliance · P1 (LGPD Art. 18 II direito de acesso):** se a UI trava ou degrada com volume, o direito de acesso fica comprometido na prática.

**Beat 2 — Bárbara espera carregar contagem total**
- 🔧 **Funcional · P1:** "1.245 eventos exibidos" no header (W7 linha 453) implica que o **count total foi consultado**. Em 50k+ eventos, COUNT(*) com filtros pode demorar 2-5s em Postgres sem índice apropriado. Spec não menciona loader nem progressive count. **Gap:** assume count rápido.
- 🎯 **UX · P1 (Nielsen H1):** sem loader/skeleton durante busca de count, usuário acha que travou.
- ⚖️ **Compliance · P2 (LGPD Art. 6º — princípio de eficiência):** processo de tratamento deve ser eficiente.

**Beat 3 — Bárbara rola pra ver evento de 5ª página**
- 🔧 **Funcional · P0:** scroll infinito (W7 "Carregar mais") sem virtual scroll = todos os eventos anteriores ficam no DOM. Após 5 batches (250 itens) com markup denso (W7 lines 458–477 mostra cada item com 3-4 linhas + ícones + timestamps + meta), DOM já tem ~2000 nós de texto. Performance degrada. **Gap:** sem virtual scroll/window rendering.
- 🎯 **UX · P0 (Nielsen H1):** UI trava = falha grave de visibilidade do sistema.
- ⚖️ **Compliance · P1 (Marco Civil Art. 13 + LGPD Art. 18):** logs de acesso devem estar acessíveis. Acesso degradado = direito comprometido.

**Beat 4 — Bárbara aplica filtro "Tipo = Fatura" pra reduzir**
- 🔧 **Funcional · P1:** filtros (W7 linha 456) reagem em tempo real? Spec não define se reload do servidor ou client-side. Em 50k eventos, filtro client-side é inviável; server-side precisa debounce + loader. **Gap:** comportamento dos filtros não declarado.
- 🎯 **UX · P2 (Nielsen H1):** sem feedback durante filtragem, usuário não sabe se aplicou.

**Beat 5 — Bárbara tenta exportar CSV com filtro "Este mês"**
- 🔧 **Funcional · P1:** Q5 bloqueia export acima de 100k. Mas 50k passa. Modal LGPD (W8) é exibido. Após confirmar, geração de CSV de 50k linhas sync = timeout. **Gap:** spec não define geração assíncrona com notificação por e-mail quando pronto. Story 2 S4 também não cobre explicitamente.
- 🎯 **UX · P1 (Nielsen H1):** sem feedback de "preparando export", usuário pode abandonar.
- ⚖️ **Compliance · P0 (LGPD Art. 18 §3º):** órgão de controle pode exigir prazo razoável pra entrega de dados — sync UI travada não é razoável. Async com notificação é o padrão.

**Beat 6 — Eventos exibidos sem cabeçalhos sticky/grupos colapsáveis**
- 🔧 **Funcional · P2:** W7 agrupa por dia ("📅 Hoje", "📅 Ontem") mas sem sticky header de dia ao rolar. Em 50k eventos cobrindo 30 dias, o cliente perde contexto temporal ao rolar. **Gap UX-funcional.**
- 🎯 **UX · P1 (Nielsen H1 + H6):** sem âncoras temporais ao rolar, recognition prejudicado.

### Gaps F6-4 consolidados

| ID | Severidade | Lente | Descrição | Lei/Padrão |
|---|---|---|---|---|
| **F6-4.G1** | **P0** | 🔧 Func | Sem paginação numérica nem virtual scroll — scroll infinito + DOM acumulado trava em 50k+ eventos | — |
| **F6-4.G2** | **P0** | 🎯 UX | UI degrada com volume — falha de visibilidade do sistema | Nielsen H1, H7 |
| **F6-4.G3** | **P1** | 🔧 Func | Count total sem loader/skeleton — UI parece travada | — |
| **F6-4.G4** | **P1** | 🔧 Func | Comportamento de filtros (client vs server, debounce) não declarado na spec | — |
| **F6-4.G5** | **P0** | 🔧 Func | Geração de CSV de 50k linhas sync — sem async + notificação por e-mail | — |
| **F6-4.G6** | **P1** | ⚖️ Comp | Direito de acesso comprometido se UI/export degradam por volume | LGPD Art. 18, Marco Civil Art. 13 |
| **F6-4.G7** | **P1** | ⚖️ Comp | Export sync pode estourar prazo razoável da LGPD pra entrega de dados | LGPD Art. 18 §3º |
| **F6-4.G8** | **P2** | 🎯 UX | Sem sticky header de dia ao rolar — perde contexto temporal | Nielsen H6 |

---

## Seed F6-5 · "Próxima cobrança R$ 7.000" — onde estão os R$ 500k de variável?

### Contexto
TransExpress está no plano Enterprise. Card "Próxima cobrança" (deduzido do wireframe W1 onde existe `┌─ 📅 Próx. cobrança ─┐ 28/05/2026`) — embora wireframe não mostre valor diretamente, o modal "Detalhes do plano" (W2 linha 167) mostra "Próxima cobrança 28/05/2026" sem valor agregado. Vamos assumir como base que o card mostraria "R$ 7.000 · 30/06" (valor do plano fixo). Ricardo abre, lê "R$ 7.000". Mas TransExpress consome R$ 500k/mês em variáveis. Card é ambíguo.

### Walkthrough beat-by-beat

**Beat 1 — Ricardo lê "Próxima cobrança"**
- 🔧 **Funcional · P0:** card e modal não distinguem **plano fixo** vs **variável previsto**. Cenário 3 (stories/financeiro.md:97) lista "Próximas faturas previstas" no modal mas não estima o variável. Em cliente alto volume, isso é a **maior parte** da fatura. **Gap arquitetural.**
- 🎯 **UX · P0 (Nielsen H1 + H2):** "match between system and real world" — cliente real sabe que paga R$ 500k+, mas a UI mostra R$ 7k. Ambiguidade séria.
- ⚖️ **Compliance · P0 (CDC Art. 6º III + Art. 31):** oferta/cobrança deve ser apresentada com clareza sobre valores totais. Ocultar magnitude do variável quando cliente alto volume = viola dever de informação.

**Beat 2 — Ricardo procura tooltip ou breakdown**
- 🔧 **Funcional · P1:** Story 3 prevê tooltip em "Próxima cobrança" (Cenário 71 — wireframe W1 sub: `ⓘ Ao atingir o limite...`). Mas tooltip atual fala de **limite**, não de **variável previsto**. **Gap:** falta tooltip "Plano fixo R$ 7k · Variável estimado R$ 500k (média 90 dias)".
- 🎯 **UX · P1 (Nielsen H10 help):** falta ajuda contextual pra explicar o que significa o valor.
- ⚖️ **Compliance · P1 (CDC Art. 6º III):** informação clara exige decomposição.

**Beat 3 — Ricardo abre modal Detalhes do plano**
- 🔧 **Funcional · P1:** W2 linha 167 mostra "Próxima cobrança 28/05/2026" sem desdobramento. "Valor mensal R$ 2.497,98" só do plano fixo. Cliente Enterprise sabe que paga mais. **Gap:** modal não inclui projeção do variável.
- 🎯 **UX · P1 (Nielsen H1):** estado do sistema (consumo previsto) não visível no contexto do plano.

**Beat 4 — Ricardo procura projeção do variável no gráfico**
- 🔧 **Funcional · P1:** gráfico mostra histórico do mês corrente, não **projeção do mês**. Em D+15, cliente vê só 15 dias e não tem extrapolação ("se manter o ritmo, vai gastar R$ 470k até fim do mês"). **Gap:** sem forecast.
- 🎯 **UX · P1 (Nielsen H10):** falta ajuda preditiva — esperado em ferramenta financeira enterprise (GCP Billing tem isso, AWS Cost Explorer tem isso).

**Beat 5 — Ricardo decide reduzir disparos com base na info disponível, sem saber o real**
- 🔧 **Funcional · P1:** decisão operacional baseada em info incompleta = risco de over-correction (TransExpress reduz disparos demais e perde receita).
- 🎯 **UX · P0 (Nielsen H1 + H2):** UI causa decisão errada — falha cardinal de produto.
- ⚖️ **Compliance · P1 (CDC Art. 6º III):** info inadequada que leva a dano operacional ao cliente.

### Gaps F6-5 consolidados

| ID | Severidade | Lente | Descrição | Lei/Padrão |
|---|---|---|---|---|
| **F6-5.G1** | **P0** | 🔧 Func | Card "Próxima cobrança" não distingue plano fixo vs variável estimado — ambíguo pra cliente alto volume | — |
| **F6-5.G2** | **P0** | ⚖️ Comp | Ocultar magnitude do variável previsto viola dever de informação clara da cobrança | CDC Art. 6º III, Art. 31 |
| **F6-5.G3** | **P0** | 🎯 UX | Mismatch sistema↔mundo real — cliente sabe que paga R$ 500k mas UI mostra R$ 7k | Nielsen H1, H2 |
| **F6-5.G4** | **P1** | 🔧 Func | Falta tooltip explicativo "Plano fixo: R$ X · Variável estimado: R$ Y" | — |
| **F6-5.G5** | **P1** | 🔧 Func | Modal Detalhes do plano sem projeção do variável — só lista "próximas faturas previstas" sem valor | — |
| **F6-5.G6** | **P1** | 🔧 Func | Sem forecast/extrapolação no gráfico — esperado em ferramenta financeira enterprise (paridade GCP Billing/AWS Cost Explorer) | — |
| **F6-5.G7** | **P1** | 🎯 UX | Falta ajuda preditiva | Nielsen H10 |

---

## Síntese F6

### Contagem total: **31 gaps**
- **F6-1:** 5 gaps
- **F6-2:** 6 gaps
- **F6-3:** 6 gaps
- **F6-4:** 8 gaps
- **F6-5:** 7 gaps (sem novos beats além dos 7 acima)

### Distribuição por severidade

| Severidade | Count |
|---|---|
| **P0** | 11 |
| **P1** | 17 |
| **P2** | 3 |

### Distribuição por lente

| Lente | Count |
|---|---|
| 🔧 Funcional | 16 |
| 🎯 UX/A11y | 10 |
| ⚖️ Compliance | 8 |
| (alguns gaps cobrem múltiplas — total > 31) |

### Distribuição por anti-claim

Nenhum gap viola AC1–AC7 (todos endereçam itens dentro do escopo MVP: visualização, alertas, performance, copy).

### Top 3 críticos (P0)

1. **F6-5.G1/G2/G3 — "Próxima cobrança" ambíguo em cliente alto volume.** Card mostra R$ 7k de plano fixo enquanto cliente paga R$ 500k+ em variável. Mismatch sistema↔mundo real grave, viola CDC Art. 6º III e Art. 31 sobre clareza de cobrança. **Fix sugerido:** card mostra "Plano fixo R$ 7k + Variável estimado R$ 500k (média 90d) = R$ 507k previstos". Tooltip explica metodologia da estimativa. Modal de plano inclui forecast.

2. **F6-4.G1/G2/G5 — Audit trail não escala em volume enterprise (50k+ eventos).** Scroll infinito sem virtual scroll, export sync de CSV grande, sem paginação numérica. Compromete LGPD Art. 18 (direito de acesso). **Fix sugerido:** virtual scroll + paginação numérica + jump-to-date + export async com notificação por e-mail quando CSV estiver pronto. Reusar padrão Story 2 S4 + adicionar estratégia de escala.

3. **F6-3.G1/G2 — Voucher R$ 50k esgotado em 60h sem alerta proativo.** Cliente descobre 3 dias depois. Spec define evento `voucher.consumido` no audit (log passivo) mas não notificação ativa. Em valores altos, log não basta — precisa push/e-mail. Cards de resumo não detectam queda brusca de "Total desconto disponível". **Fix sugerido:** trigger de notificação em `voucher.consumido` quando saldo cai >50% em <24h ou DEPLETED em <72h da emissão. E-mail + banner in-app cross-page.

### Recomendações arquiteturais cross-cutting

1. **Layer de notificação proativa:** Story 3 trata audit trail como log, mas não cobre **trigger de notificação**. Story irmã (ou anexo desta) precisa definir matriz de eventos→canais→regras (e-mail, push, in-app banner) com thresholds (ex: fatura > R$ 100k vincenda em < 5 dias → e-mail D-5/D-3/D-1; voucher emitido > R$ 10k → e-mail; voucher DEPLETED em < 72h da emissão → e-mail urgente).

2. **Estratégia de escala visual:** componente de gráfico precisa modo log/100%-stacked/normalizado declarado na spec. Toggle no header próximo ao "Por serviço | Por campanha". Default linear, com auto-detect de "uma categoria > 80% do total" → sugere alternativa.

3. **Estratégia de escala de listas:** padrão de paginação + virtual scroll + jump-to-date deve ser declarado na Story 2 S4 como **componente reusável** (audit trail aparece em Story 2 e 3). Export async + notificação por e-mail também canônico.

4. **Forecast/projeção:** ferramenta financeira enterprise sem forecast fica defasada vs GCP Billing/AWS Cost Explorer/Datadog. Sugerir Story 4 (ou anexo MVP) com extrapolação linear simples (média móvel 30/90d) + sinalização de variação anômala (z-score vs histórico).

5. **Hierarquia visual por magnitude:** componente de status badge + cards de fatura devem aceitar prop `magnitude` (low/medium/high/critical) que ajusta peso visual (size, weight, border, ícone de alerta). Threshold default por org (ex: high > média mensal × 1,5; critical > média × 3).

### Arquivo

`/Users/guilhermegraham/awsales/prototype-studio/stress-tests/financeiro/scenarios-and-fixes/scenarios/agent-f6-high-volume.md` (este arquivo).
