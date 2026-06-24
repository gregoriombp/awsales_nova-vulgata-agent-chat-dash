# Plano — Review do Financeiro (Genê · 23/06/2026)

> **O que é:** a "enxugada" coerente dos 56 comentários que o Genê deixou no review-bridge
> sobre as telas do Financeiro. Os comentários crus estão em [`comments_backup.json`](./comments_backup.json)
> e em ordem cronológica legível em [`digest_cronologico.md`](./digest_cronologico.md).
>
> **Commit de referência:** `7c1e2fe1` (detached HEAD) — foi onde o Genê revisou e onde eu triei o estado atual.
> **Continuação de:** a review de 19/06 ([`../financeiro_plan_19_06_25/`](../financeiro_plan_19_06_25/)). Vários temas se repetem.
>
> **Origem dos textos:** quase tudo é **nota de voz transcrita** (daí o tom falado, "né", repetições, e o Greg
> às vezes interrompendo no meio — ex. item [40]: *"Cláudia, aqui é o Greg, não leva isso como task"*). Eu separei
> o que é **pedido de mudança** do que é **nota/contexto**.

---

## Como ler

Cada item carrega o número cronológico (`[NN]`, igual ao backup), um **veredito** e uma **onda**.

| Símbolo | Veredito |
|---|---|
| ✅ | Já feito no código atual — só confirmar visual |
| ⚡ | Quick win — rename / string / remover / tooltip |
| 🔧 | Ajuste médio — mexe em layout/estrutura de um componente |
| 🏗️ | Feature — escopo grande, vale task própria |
| ⏸️ | Futuro / depende de terceiro (PG, Tury) — **o próprio Genê/Greg marcou assim** |
| 📝 | Nota / contexto — **não é task** |
| ⚠️ | Faz sentido, mas eu discordaria ou está ambíguo → ver §4 |

---

## 1. Os insights estruturais do Genê (o "modelo mental" por trás dos 56)

Tirando o ruído, os comentários colapsam em **6 ideias-mãe**. É isto que vale internalizar — o resto é execução.

1. **Voucher virou "crédito". Cupom continua cupom.**
   Taxonomia financeira: *crédito* = saldo pré-pago que abate o variável; *cupom* = código de desconto.
   Aparece em [15], [21], [22], [47] e em ~30 usos de "voucher" no código. É um **rename de módulo**, não um ajuste pontual.

2. **WSales × Meta — deixar claro o tempo todo quem cobra o quê.** *(tema mais recorrente da review)*
   O cliente paga uma parte à Aswork e outra direto ao Meta. O Genê quer isso separado visualmente em **todo lugar**:
   filtro de escopo no topo ([24], [25]), barras tracejadas pro Meta ([28], [39]), nomenclatura "custo WSales / custo Meta"
   ([39]), e exportação segregada ([45], [46]). **Parte disso depende do PG** — hoje o banco não vem segregado ([45]).

3. **Falar a língua do cliente, não a do banco.** *(bate com a memória "UX writing do PG é técnico demais")*
   Matar jargão de engenharia: "taxonomia canônica", "W2C", "câmbio operacional", "macro-fee", "AI", "Tokens de IA".
   Itens [26], [27], [30], [37].

4. **Tokens = Knowledge / Brain / Skills — e explicar cada um.**
   Acabou input/output. Quebrar e descrever pro cliente entender. Itens [01], [27], [52].

5. **Dois eixos de tempo: data de consumo × data da fatura/provedor.**
   O gráfico principal é por **data de consumo** (quando bateu no banco) e bate com o Analytics ([51]).
   A fatura é por **ciclo/provedor** (com delay). Daí nasce a aba "por ciclos" ([41]), os dois exports ([46]),
   a tooltip de data ([31]) e o disclaimer de delay ([39]). O delay em si é **só contexto, não task** ([40]).

6. **Estado de pagamento visível e acionável.**
   Badge ativo/inativo no plano ([42]), alerta global de inadimplência ([44]), "pagar agora" na fatura vencida ([50]),
   e fatura em aberto navegável ([55]).

---

## 2. Triagem por tela (estado atual vs. pedido)

> Estado conferido no código do commit `7c1e2fe1`. `arquivo:linha` quando relevante.

### 2.1 Visão geral — `/settings/financeiro/visao-geral`

| # | Pedido (resumo) | Estado atual | Veredito |
|---|---|---|---|
| [02] | Aviso "pode receber cobranças adicionais ao atingir o limite" + tooltip; hierarquia do texto igual/menor que o de cima | Aviso + tooltip **já existem** (`visao-geral/page.tsx:92-118`), texto em `body-sm`/secundário | ✅ confirmar visual |
| [18] | "antes da cobrança automática do ciclo" → "antes da **próxima cobrança**" | String antiga em `:192` | ⚡ |
| [42] | Badge **Ativa (verde) / Inativa (vermelho)** no card do plano | `status` existe nos dados, **não é renderizado** | ⚡ |
| [15] | "voucher" → "crédito" | "Voucher" ainda nos tipos/dados (`data.ts`) | ⚡ (ver tema rename §3) |
| [07] | Mover «local_offer Cupom» pro lado direito do **título do modal** | Hoje o `local_offer` fica na linha "Descontos", não no título | ⚡ |
| [16] | Remover uma tooltip desnecessária | 2 ícones `info` na tela, ambos com propósito aparente | ⚠️ ambíguo — qual? |
| [17] | Remover um símbolo `info` | idem acima | ⚠️ ambíguo — qual? |
| [01] | Abas Tokens Knowledge/Skills/Brain *(comentário de 19/06)* | A lista antiga saiu na reestruturação; quebra vive hoje no Detalhamento de **Consumo e custos** | ✅ (já endereçado lá) |
| [55] | "Ver fatura detalhada" leva pra faturas **fechadas**; deveria abrir a composição da fatura **em aberto** | Hoje navega pra `/historico-faturas` (`:123`) | 🏗️ task (Greg+PG+Tury) — *o próprio Greg respondeu "converter em task"* |

### 2.2 Consumo e custos — `/settings/consumo-e-custos` *(32 comentários — o coração da review)*

**Renomeações / remoções / copy (quick):**

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [05] | Remover o "bate com card" de todos os lugares | `BreakdownTable.tsx:313,504` (check verde de reconciliação) | ⚡ |
| [21] | No chip, "voucher(s)" → "créditos" | `KpiCards.tsx:33` ("Vouchers e cupons…") | ⚡ |
| [26] | Categoria "AI" → "tokens" | `BreakdownTable.tsx:85` | ⚡ |
| [27] | "Tokens de IA" → só "Tokens" | `data.ts:138,628-630` | ⚡ |
| [37] | Remover «câmbio operacional R$ 4,92 · taxonomia canon (W2C)» | `BreakdownTable.tsx:305` (tfoot) | ⚡ |
| [20] | Tooltip: deixar claro que é a **soma de todos os custos variáveis consumidos** | Subtotal tem tooltip, mas dá pra afinar a frase | ⚡ |
| [23] | Tooltip do total = "subtotal − crédito cupom"; ajustes podem ser **+ ou −** | Tooltip já diz "Subtotal − créditos + ajustes" (`KpiCards`); falta o "+/−" dos ajustes | ⚡ |
| [31] | Tooltip: gráfico é por **data de uso/consumo**, não de pagamento | Não há essa tooltip | ⚡ |
| [49] | Coluna "Quantidade": só o número, sem repetir "mensagens" | **Já mostra só o número**; unidade fica no cabeçalho | ✅ confirmar |
| [19] | Tirar/again o texto descritivo do topo → criar um texto padrão | Subtítulo atual em `page.tsx:99-102` | ⚡ copy (Greg: "crie um texto padrão") |
| [30] | Subtítulo da tabela mais claro (a nomenclatura confunde) | «Por serviço / taxa — taxonomia canônica…» (`BreakdownTable.tsx:56-59`) | ⚡ copy (par com [37]) |
| [52] | Descrever o que é token Knowledge/Brain/Skills | Sub-níveis existem, **sem descrição** | ⚡ copy |
| [35] | Cada grupo com uma descrição breve abaixo (fonte menor) | Não há | 🔧 copy + layout |
| [22] | "Descontos e créditos" → "cupom" | `KpiCards.tsx:30` | ⚠️ ver §4 (conflita com taxonomia) |

**Nomenclatura / consistência (boa parte já caiu):**

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [34] | Nomenclatura da tabela == gráfico ("mensagens transacionadas", "leads ativos") | **Já unificado** (`data.ts:136-137,415-416`; comentário confirma "leads ativos era convertidos") | ✅ |
| [38] | Donut com a mesma nomenclatura/categorias do gráfico | **Já bate** (`data.ts:134-138`); só herda "Tokens de IA"→"Tokens" de [27] | ✅ |

**Estrutura / visual (médio):**

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [06] | Cores dos charts → **monocromático azul/slate** com gradiente de saturação (topo mais forte) | Hoje **categórico** (azul/teal/âmbar/esmeralda/roxo) | ⚠️🔧 ver §4 (trade-off) |
| [36] | Linha «Outros» com tipo mais claro indicando que "podem ser outros" | Mesma cor dos demais grupos | 🔧 |
| [32] | Centralizar colunas total BRL / total USD | Hoje alinhadas à **direita** (`BreakdownTable.tsx:190-191`) | ⚠️ ver §4 (number-align) |
| [33] | Coluna "Unitário" em **dólar** | Hoje em BRL (`:189,252`) | 🔧 (precisa do dado USD) |
| [29] | Detalhamento em **3 níveis**: Meta › [pago WSales / pago Meta] › [marketing / utilidade] | Hoje **2 níveis** (`BreakdownTable.tsx:80-87`) | 🔧 |

**Suite "WSales × Meta" (feature — tratar junto):**

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [24] | Ícone de **filtro** no título com escopo Meta / Aswork | Escopo existe **só no export** (`ExportCsvMenu`), não como filtro global | 🏗️ (⚠️ lógica do toggle confusa — §4) |
| [25] | Tooltip muda conforme o escopo (WSales+Meta = total; só WSales = só plataforma) | Atrelado a [24] | 🏗️ |
| [28] | Barra **tracejada** pro Meta no "Consumo por dia" | Não há (`ChartWidgets.tsx:219-238`) | 🏗️ |
| [39] | Reformular "Uso × valor na fatura": colunas "custo WSales"/"custo Meta", tirar linha laranja, Meta tracejado/roxo, **+ novo gráfico "valor atribuído ao provedor"** com disclaimer de delay | Gráfico existe com linha âmbar "Valor na fatura" e colunas "Taxas Aswork"/"Meta aproximado" (`ChartWidgets.tsx:493-674`) | 🏗️ (rework + 1 gráfico novo) |

**Reestruturação maior (feature):**

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [41] | Duas grandes abas: **Visão geral** + **Visão por ciclos** (ciclo filtra por mês, mostra faturas) | Página é aba única | 🏗️ grande |
| [46] | Dois exports: por data de consumo (visão geral) × por ciclo/provedor (por ciclos) | Um export só, com escopo Aswork/Meta (`ExportCsvMenu`) | 🏗️ (depende de [41]) |

**Futuro / depende de terceiro / nota:**

| # | Pedido | Veredito |
|---|---|---|
| [44] | Alerta **vermelho global** de inadimplência em todas as telas (campanhas desativadas) | ⏸️ *Greg: "plano futuro, depois de concluir as telas"* |
| [45] | Export segregado WSales/Meta — **banco não vem segregado** | ⏸️ *task Greg+PG* |
| [48] | Botão "saiba mais" no **Ajustes** → popup com motivo de cada ajuste + histórico de atividades | ⏸️ *task futura Greg+PG* |
| [51] | Notar que o valor do gráfico bate com o **Analytics** | ⚡ tooltip/nota — *Greg: vale só na visão por data de consumo, não na de ciclo* |
| [40] | Explicação da "dor" do delay banco×provedor | 📝 **não é task** — Greg interrompeu explicitamente |

### 2.3 Saldo de créditos / cupons — `/settings/financeiro/consumo`

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [12]/[47] | Renomear título "Consumo" → **"Saldo de Créditos e Cupons"** | Hoje é só o label da aba (`FinanceiroTabs.tsx:26`) | ⚡ |
| [03] | "Faturas que usaram este voucher" → h4/h5/h6 **sem all-caps** | Hoje `aw-eyebrow` (uppercase) em `:583` | ⚡ |
| [04] | Remover bloco «Ativo · Válido até Jun 30, 2026» | No modal de detalhe do voucher (`:548-555`) | ⚡ (confirmar qual instância) |
| [08] | Remover ícone `savings` | `AwStatCard icon="savings"` (`:117`) | ⚠️ ver §4 |
| [09] | Remover ícone `account_balance_wallet` | `:123` | ⚠️ ver §4 |
| [10] | Remover ícone `confirmation_number` | `:129` | ⚠️ ver §4 |
| [13] | Cada item da tabela com **badge bg verde, sem stroke** | Tabela **sem badges** hoje (`:450-496`) | 🔧 |
| — | "voucher" → "crédito" (≈30 usos nesta tela) | espalhado em `page.tsx` + `data.ts` | ⚡→🔧 (núcleo do rename §3) |

### 2.4 Histórico de faturas — `/settings/financeiro/historico-faturas`

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [54] | "Baixar recibo" → "baixar **nota fiscal**" | `InvoiceDetailsSheet.tsx:70-72` | ⚠️ ver §4 (depende de [53]) |
| [43] | Ao abrir a fatura, ver quebra de custos macro (disparo mkt/utilidade, lead ativo, msg transacionada, tokens) | Sheet mostra só bruto/desconto/líquido (`InvoiceDetailsSheet.tsx:35-171`) | 🏗️ |
| [50] | Fatura vencida → botão **"pagar agora"** com fluxo de método | Há alerta de atraso, **sem** botão de pagar (`:115-117`) | 🏗️ |
| [53] | Baixar **Nota Fiscal** (PDF) além da fatura | Só "Baixar fatura (PDF)" | ⏸️ *task futura Greg+Tury (depende do provedor de NF)* |

### 2.5 Métodos de pagamento — `/settings/financeiro/metodos-pagamento`

| # | Pedido | Estado atual | Veredito |
|---|---|---|---|
| [11] | Cartão com **proporção de cartão real** (tá horizontal demais) | Hoje `h-52 max-w-md` ≈ **2.15:1** (alvo ID-1 ≈ 1.586:1) (`page.tsx:217`) | 🔧 |
| [14]/[56] | Adicionar **boleto** (como padrão) e **pix automático** | Só cartões; estrutura mock pronta, UI não oferece tipo (`data.ts:928-961`, `AddPaymentMethodModal`) | 🏗️ *high effort — o próprio Genê pediu "como task separada"* |

---

## 3. Plano enxugado — por ondas

A regra: **rename e copy primeiro** (barato, alto valor, destrava o resto), depois **ajustes visuais**, depois **features**.
Vouchers→créditos e a morte do jargão tocam quase tudo, então vão na frente.

### 🌊 Onda 0 — confirmar que já está pronto *(0 código, só olhar)*
- [02] aviso + tooltip de cobrança adicional · [34] nomenclatura tabela=gráfico · [38] donut · [49] coluna quantidade · [01] tokens (migrou pro Detalhamento).

### 🌊 Onda 1 — Quick wins *(renames, strings, remoções, tooltips)*
**Tema A — Voucher → Crédito (rename de módulo):** [15] [21] + os ~30 usos em `consumo/page.tsx` e `data.ts`.
Manter "cupom" onde é cupom (código de desconto); "crédito" onde era voucher (saldo).
**Tema B — Matar o jargão do PG:** [26] AI→tokens · [27] tira "de IA" · [37] remove "câmbio operacional/W2C" · [30] reescreve o subtítulo da tabela · [19] texto-padrão do topo.
**Tema C — Strings & remoções soltas:** [18] "próxima cobrança" · [05] tira "bate com card" · [03] eyebrow→h5 sem caps · [04] remove "Ativo/Válido até" · [12]/[47] título "Saldo de Créditos e Cupons" · [07] move o chip Cupom pro título do modal.
**Tema D — Tooltips/copy:** [20] soma dos variáveis · [23] ajustes "+/−" · [31] data de consumo · [52] o que é Knowledge/Brain/Skills · [51] "bate com o Analytics" (só na visão por data).
**Tema E — Badge simples:** [42] ativo/inativo no plano.

### 🌊 Onda 2 — Ajustes de UI / estrutura média
- [11] proporção do cartão (~1.586:1).
- [13] badge verde (sem stroke) por linha de cupom.
- [29] Detalhamento em 3 níveis (Meta › pago WSales/Meta › marketing/utilidade).
- [33] coluna "Unitário" em USD (precisa do dado).
- [35] descrição breve por grupo · [36] linha "Outros" mais legível.

### 🌊 Onda 3 — Features *(cada uma vale uma task/branch)*
1. **Suite WSales × Meta** — tratar [24] [25] [28] [39] como UM épico (filtro de escopo global + barras tracejadas + rework do gráfico uso×fatura + gráfico novo do provedor). É o tema mais pedido.
2. **Reestruturação em abas** — [41] (Visão geral / Por ciclos) + [46] (dois exports). Grande; redesenha a página.
3. **Fatura como hub de detalhe** — [43] quebra de custos macro + [50] pagar agora + [55] fatura em aberto navegável. Conversam entre si.
4. **Boleto + Pix automático** — [14]/[56]. High effort, isolado.

### ⏸️ Backlog dependente de terceiros / decisão
- [44] alerta global de inadimplência *(depois de fechar as telas)* · [45] export segregado *(Greg+PG, banco não segrega)* · [48] detalhe de ajustes *(Greg+PG)* · [53] download de NF *(Greg+Tury)*.

### 📝 Notas (não viram task)
- [40] explicação da dor do delay banco×provedor — contexto pro agente, não implementar.

---

## 4. Onde eu discordaria / preciso de alinhamento

Sem isso a "enxugada" fica incompleta — alguns pedidos colidem entre si ou com boa prática:

- **[32] Centralizar BRL/USD** → eu **manteria à direita**. Número alinhado à direita compara muito melhor coluna a coluna; centralizar quebra a leitura de magnitude. Sugiro: alinhar à direita e só dar respiro de coluna.
- **[06] Cores monocromáticas** → faz sentido pra elegância, mas **monocromático azul/slate mata a distinção** entre 5+ categorias no donut/barras empilhadas. Proposta: monocromático **só onde a ordem importa** (ranking/participação) e manter cor categórica onde o usuário precisa *distinguir serviço*. Vale alinhar antes de aplicar global.
- **[22] "Descontos e créditos" → "cupom"** → conflita com a própria taxonomia do Genê (§insight 1): o card soma **cupom + crédito**, então chamar de só "cupom" esconde o crédito. Eu manteria "Descontos e créditos" ou usaria "Créditos e cupons" — alinhar com [21]/[47].
- **[24] lógica do filtro Meta** → o texto diz *"desativa Meta → valores do Meta aparecem; ativa → somem"*, que está **invertido** (provável lapso da transcrição de voz). Vou tratar como **seletor de escopo** (Aswork / Aswork+Meta), igual ao do export — confirmar a direção com o Genê.
- **[54] "recibo" → "nota fiscal"** → renomear **antes** de existir a NF ([53], que é futura e depende do Tury) promete algo que a tela não entrega. Sugiro: ou fazer [54] junto de [53], ou manter "recibo/comprovante" por enquanto.
- **[08]/[09]/[10] remover ícones dos stat cards** → bate de frente com o gosto do DS (ícone preenchido/grosso nos cards). Confirmar se é remover **mesmo** ou trocar por algo mais sóbrio.
- **[16]/[17] remover ícones `info`** → há 2 `info` na visão geral, ambos com função. Preciso que o Genê aponte **qual** (ou eu mando screenshot com as duas posições).

---

## 5. Apêndice — mapa nº → arquivo

| Tela | Arquivos-chave |
|---|---|
| Visão geral | `app/settings/(sections)/financeiro/visao-geral/page.tsx`, `_components/InvoiceBreakdownCard.tsx` |
| Consumo e custos | `app/settings/(sections)/consumo-e-custos/page.tsx`, `_components/{BreakdownTable,KpiCards,ChartWidgets,ExportCsvMenu}.tsx` |
| Saldo de créditos | `app/settings/(sections)/financeiro/consumo/page.tsx` |
| Histórico de faturas | `app/settings/(sections)/financeiro/historico-faturas/page.tsx`, `_components/InvoiceDetailsSheet.tsx` |
| Métodos de pagamento | `app/settings/(sections)/financeiro/metodos-pagamento/page.tsx`, `_components/AddPaymentMethodModal.tsx` |
| Dados/taxonomia | `app/settings/(sections)/financeiro/_components/data.ts` |

**Contagem:** 56 comentários · 5 telas · ~22 quick wins · ~6 ajustes médios · 4 épicos · 4 backlog · 1 nota.
