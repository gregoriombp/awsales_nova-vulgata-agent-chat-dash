# Stress Test 2 — Tela Unificada de Integrações

> **Data:** 2026-04-30 (segundo round, lente diferente do primeiro)
> **Lente:** **NÃO validar o que já está**. Atacar o que falta ou poderia ser melhor — independente da decisão atual. Comparar com best-in-class real.
> **Modo:** completo · 4 agentes paralelos · 20+ cenários
> **Pipeline:** Cobertura · Personas concretas (call) · Best-in-class · Discoverability/onboarding → consolidação por padrão recorrente → fixes prontos pra aplicar

---

## TL;DR

**5 P0 que eram pendências disfarçadas — decidir antes de Figma:**

| # | Problema | Convergência (agentes) | Fix |
|---|---|---|---|
| **1** | Tool building sem teste/preview (W16 single-page) | C3 + B-Barnabé + D1 | **REVERTER D-TOOL5** → split-pane com teste obrigatório (Retool/Make pattern) |
| **2** | Q1+Q2 são bloqueadores de v1, não pendências | A1 + A2 + D2 + D3 | Affordance "+ Webhook customizado" e "+ Integração Customizada" sempre presentes no header W3, independente da decisão backend |
| **3** | Migração legacy ignorada (100% dos clientes atuais) | A3 | Adicionar **W18 Migração Legacy** (banner W1 + tela de import) |
| **4** | Onboarding pós-criação ausente — primeiro webhook é ato de fé | D1 + A4 | Banner de onboarding em W4 quando `lastWebhookReceivedAt=null` (instruções específicas + "Enviar evento de teste" + inspector) |
| **5** | Modo Simple não cobre WhatsApp (Card regride) | B-Card + B-Daniel | Densidade adaptativa **também no header** (não só no corpo); modo Simple-WhatsApp |

**3 reversões/ajustes em decisões existentes:**

- **D-TOOL5** (página única) → split-pane com teste obrigatório
- **D-CARD1** (sem descrição genérica) → ajustar pra "sem descrição genérica, **com apelido editável** pelo cliente" (D-CARD4 nova)
- **D-DET1** (tabs sempre condicionais ao authType) → ajustar pra "**Permissões+Webhooks juntos quando provider expõe scopes-de-recv**" (caso HubSpot — pedido Daniel)

**6 decisões novas:**

- **D-IA6** — cmd+K do Studio é dependência declarada (não delegada)
- **D-IA7** — Wizard de onboarding com importação legacy + templates por vertical (revisita W2)
- **D-CARD4** — Apelido editável por conexão (`userDescription`) substitui descrição genérica
- **D-TOOL6** — Tool building em split-pane com teste obrigatório (substitui D-TOOL5)
- **D-TOOL7** — Replicar tool em N orgs (paridade simétrica com Templates em massa)
- **D-WA4** — Header da WABA em densidade adaptativa (modo Simple-WhatsApp pra Card)

---

## Gap Register (priorizado)

### P0 — bloqueia v1 (5 gaps)

| ID | Cluster | Resumo | Origem (agentes) |
|---|---|---|---|
| **G21** | Tool building | W16 single-page sem split test/preview = ship to prod direto, IA falha em produção | C3, B3, D1 |
| **G22** | Cobertura | Q1 (webhook customizado) e Q2 (tool standalone) bloqueiam v1 — caminho UX hoje regride feature legacy | A1, A2, D2, D3 |
| **G23** | Migração | 100% dos clientes Mamba atuais têm conexões legacy — sem fluxo de import, regride todos | A3 |
| **G24** | Onboarding | Card conecta primeira Hotmart, faz compra teste, não vê chegando — abre ticket. Pattern recorrente (todo provider OAuth+webhook) | D1 |
| **G25** | UX persona | Modo Simple não cobre WhatsApp (D-DET2 só pra não-canal) — Card sempre cai em W11b denso, regride do app que ele aprovou | B-Card |

### P1 — decidir antes de Figma (10 gaps)

| ID | Cluster | Resumo | Origem |
|---|---|---|---|
| **G26** | Cmd+K | Sem cmd+K declarado, Paulo (47 orgs) sofre. Pattern Linear/Notion/Stripe ausente | C4, B-Paulo |
| **G27** | Onboarding | Empty state passivo vs wizard com import + templates por vertical | C5, A3 |
| **G28** | UX persona | Daniel pediu BM ID + telefones no header sem clicar — spec só BM ID | B-Daniel |
| **G29** | UX persona | Daniel pediu Permissões+Webhooks juntos (pattern HubSpot) — spec separou em tabs | B-Daniel |
| **G30** | Cobertura | Replicar tool em N orgs — assimetria injustificada com Templates em massa | A5, B-Paulo |
| **G31** | UX persona | Apelido editável pela conexão — Paulo queria descrição **editável**, spec só removeu | B-Paulo |
| **G32** | Tools globais | W15 sem affordance de ação — toggle só em W8 da conexão. Cliente clica em W15, frustra | D4, C-Daniel |
| **G33** | Tools billing | "Execuções 30d" visível, custo invisível — Barnabé ("custo é caro") sem dados | B-Barnabé |
| **G34** | Listagem | Grid default fraco pra Daniel (30+ clientes) e Paulo (super-admin) | C2 |
| **G35** | Quota | "Fazer upgrade" tooltip sem CTA real — dead-end visual | D5 |

### P2 — pode v1.5 (5 gaps)

| ID | Cluster | Resumo | Origem |
|---|---|---|---|
| **G36** | Catálogo | Search inline, sem ranking, sem detail view, sem sugestão por vertical | C1 |
| **G37** | UX | Activity timeline unificada na conexão (pattern Stripe Connect) | C2 |
| **G38** | Bulk actions | Selecionar N conexões → testar/reconectar/exportar (pattern Stripe) | C2 |
| **G39** | Tools | Versionamento visível de tool custom (v1 ativa, v2 editing) | C3 |
| **G40** | UX | Tutoriais em vídeo embedded (Card pediu) | B-Card |

---

## Padrões de root cause (≥3 agentes)

### RC1 — "Pendência disfarçada" (Q1, Q2)

**Sintoma:** Q1 (webhook customizado) e Q2 (tool standalone) marcadas como "depende de Tury/Jordan decidir backend". Aparecem em A1, A2, D2, D3.

**Causa raiz.** Spec confunde "decisão de modelagem do dev" com "decisão de UX". Mesmo se backend implementar de 3 maneiras diferentes (provider seed, flag custom, mecanismo separado), **a UX não muda significativamente**: cliente clica "+ Webhook customizado" e preenche campos. O fluxo é simétrico aos outros providers webhook_only. **Adiar a UX porque o backend não decidiu = adiar 100% do caso real.**

**Fix:** UX não pode esperar. Definir affordance ("+ Webhook customizado" e "+ Integração Customizada" no header W3) que funciona com qualquer das 3 alternativas backend. Se viram providers seed-data, OK. Se são flag, OK. Se são tipo separado, OK. Frontend chama endpoint, backend resolve.

### RC2 — "Otimizado pro greenfield single-org" (A3, A5, C2, B-Paulo)

**Sintoma:** Migração legacy ignorada (A3). Replicar tool cross-org ausente (A5). Lista default grid (C2). Cmd+K não declarado (C4).

**Causa raiz.** Spec foi escrito assumindo cenário ideal: cliente novo, single-org, conecta Hotmart pela primeira vez, escala devagar. Realidade: clientes Mamba existentes são multi-org (47 orgs PG), super-admins gerenciam dezenas, CS atende 30+ clientes. **D-IA5 (org como contexto global) sem D-IA6 (cmd+K) e sem D-TOOL7 (replicar cross-org) é incoerente** — torna pior pro super-admin sem dar alavanca pra escalar.

**Fix:** Tratar caso enterprise/super-admin como persona-Pareto, não outlier. cmd+K + bulk actions + replicação cross-org + lista default são pacote único.

### RC3 — "Densidade adaptativa só no corpo, não no header" (B-Card, B-Daniel, B-Paulo)

**Sintoma:** D-DET2 define modo Simple/Standard/Power **pro corpo** da tela. Mas o **header** é fixo. Card quer header limpo (1 BM, 1 telefone). Daniel quer header denso (BM ID + telefones inline). Paulo quer status discrepante visível antes de abrir.

**Causa raiz.** D-DET2 cobre profundidade vertical (quantas conexões/tools), não densidade horizontal informacional do header.

**Fix:** D-WA4 nova — densidade adaptativa também no header. Modo Simple-WhatsApp (1 BM + 1 telefone + saúde ok) tem header com lista compacta de telefones inline. Modo Standard mostra header normal. Modo Power expande detail no hover/tooltip.

### RC4 — "Tool building tratado como form, não como builder" (C3, B-Barnabé, D1)

**Sintoma:** W16 é página única com seções colapsáveis (D-TOOL5). Sem split test/preview. Cliente cria às cegas.

**Causa raiz.** Resposta ao Barnabé "três telinhas pequenas" foi "uma tela só" — perdeu o ponto. Pattern certo é "config compacta + teste live ao lado", não "config + nada".

**Fix:** **REVERTER D-TOOL5**. Substituir por D-TOOL6: split-pane (config esquerda, teste/preview direita). Teste obrigatório antes de Activate. Pattern Retool/Make/Zapier/Postman.

### RC5 — "Tools globais é leitura-only, ação fica em W8" (D4, C-Daniel)

**Sintoma:** W15 sidebar Tools mostra tabela bonita cross-conexão, mas cliente clica em linha e quer toggle on/off — não tem. Tem que ir em W8 (tab Tools dentro da conexão).

**Causa raiz.** D-IA3 separou semanticamente "subset (W8)" de "global (W15)" — mas o usuário não pensa assim. Quando vê tool listada, espera poder agir.

**Fix:** W15 drawer de detalhe da tool ganha (a) toggle "Esta conexão" e (b) bulk action "Aplicar em todas as N conexões deste provider". Tabela ganha checkbox de status visível. Mantém leitura-cross + adiciona ação.

---

## Conflito entre personas (real)

Stress test confirmou: 6 personas com necessidades **conflitantes** em pontos críticos:

| Conflito | Personas | Decisão atual | Verdict |
|---|---|---|---|
| **Card simples** vs **Daniel/Paulo denso** | Card "zero me incomoda hoje" vs Daniel "ver sem clicar" | D-DET2 cobre o corpo, não o header | ❌ Card regride no WhatsApp (W11b sempre denso) |
| **Card separado por conta (igual WABA)** vs **Deds unificado cross-conta** | — | D-MC1 escolheu agrupado (meio termo) | ✅ Pareto correto, Deds postergado |
| **Daniel "escopos+webhook juntos"** vs **D-DET1 separados em tabs** | — | Spec separou | ❌ Pedido literal de Daniel ignorado sem rationale |
| **Paulo "remover descrição"** vs **Paulo "apelido editável"** | Mesma persona, sutileza perdida | D-CARD1 só removeu | ❌ Sutileza ignorada |
| **Operador novato D2 (cria tool sem provider)** vs **Spec exige provider-pai** | — | Q2 pendente | ❌ Bloqueia caso comum |

---

## Verdict por claim

| Claim do spec | Sustenta? | Por quê |
|---|---|---|
| "UX puro alinhado com domain-contracts" | ⚠️ **parcial** | Vocabulário OK, mas Q1/Q2/Q4/Q5/Q6 ainda abertas — UX sofre delegação ao backend |
| "Substituí app/checkout/checkout-personalizado" | ❌ **NÃO** | Sem fluxo de webhook customizado avulso (Q1), regride feature ativa do legacy |
| "Pareto bem coberto, edge cases mapeados" | ⚠️ **parcial** | Card (Pareto) regride no WhatsApp; Barnabé (caso comum tool custom) bloqueado por Q2 |
| "Decisões com defesa concreta" | ✅ **sim** | Mas 3 decisões revistas após segundo round (D-TOOL5, D-CARD1, D-DET1) |
| "Wireframes cobrem fluxos principais" | ❌ **NÃO** | Falta: webhook customizado (G22), tool standalone (G22), migração legacy (G23), banner de onboarding (G24), split tool builder (G21), Tools com ação cross-conexão (G32) |

---

## Fixes prontos pra aplicar

### F1 — Reverter D-TOOL5, criar D-TOOL6 (W16 split-pane com teste) · P0

**Onde:** `decisions.md`, `spec.md` §7, `wireframes.md` W16

**Spec.** Substituir descrição de W16 em §7. Texto novo:

```markdown
### "+ Nova Tool HTTP" — split-pane com teste obrigatório (D-TOOL6)

Layout em 2 colunas:
- **Esquerda (config):** Identificação · Endpoint · Body · Headers/Query · Mapeamento
- **Direita (teste/preview):** input simulado · botão `[Run test]` · raw response · drag-to-map nos campos do response

**Regras:**
- Salvar como **rascunho** (`draft`) — sem teste obrigatório
- **Activate exige teste verde** — pattern Zapier "no save without test pass"
- Auto-mapping vira **fluxo principal**, não CTA escondido: cliente roda → response volta → clica em campos pra mapear
- Versão visível no header: "Editando v2 (v1 ativa, 1.247 execuções/30d)"
- Salvar = nova versão, não overwrite — proteção contra quebrar IA em produção

**Reverter D-TOOL5.** "Página única com seções colapsáveis" foi solução ao Barnabé ("três telinhas pequenas") mas erra o alvo — Barnabé queria *menos* fricção pra criar **tool funcional**, não *menos* fricção em config. Tools que vão pra produção sem teste falham com lead real — pior que 3 telinhas.
```

### F2 — UX desbloqueada pra Q1+Q2 (independente do backend) · P0

**Onde:** `wireframes.md` W3, `decisions.md` D-ADD4 nova

**Wireframe.** Header do W3 ganha **2 botões secundários sempre visíveis**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Escolha uma integração                                              ✕   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [+ Webhook customizado]   [+ Integração Customizada]                    │
│                                                                          │
│  [search] Buscar provider...                                             │
│  [Todos] [Checkout] [CRM] [Forms] [Meetings] [Members] [Markets] [Action]│
│                                                                          │
│  ... (catálogo) ...                                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

- **`+ Webhook customizado`** → drawer W13 variante webhook_only **sem provider catalogado** (cliente dá nome, gera URL+secret, fim). Cobre Q1 (G22).
- **`+ Integração Customizada`** → drawer W13 variante api_key **sem provider catalogado** (cliente dá nome, escolhe tipo de auth, cola credencial). Cobre Q2 (G22). Após criar, cliente vai pro W4 da conexão custom criada e cria tool dentro (W16).

Backend pode implementar como `providerId="__custom_webhook__"` / `__custom_integration__` (provider seed-data) ou flag `customProvider: true` na request — UX não muda.

**Decisão D-ADD4 nova.** "+ Webhook customizado e + Integração Customizada como affordances primárias do catálogo, não dependem de provider catalogado. Resolve Q1+Q2 do ponto de vista UX independente da modelagem backend."

### F3 — Wireframe W18 Migração Legacy · P0

**Onde:** `wireframes.md` novo W18, `spec.md` §3 mapa de telas

**Spec.** Adicionar em §3:

```
Studio
└── Integrações
    ├── Minhas conexões (default)
    ├── + Adicionar
    ├── /<providerId>
    └── /<providerId>/<connectionId>

[Banner persistente em W1 quando há conexões legacy]
"Você tem 12 conexões na versão anterior. [Ver e migrar →]"

└── /integrations/legacy → W18 (Migração)
```

**W18 wireframe:**

```
┌────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  Migração de conexões legacy                         │
│                                                                        │
│  Você tem 12 conexões na versão anterior do AwSales.                   │
│  Migrar mantém URL de webhook, histórico de eventos e templates.       │
│                                                                        │
│  [Migrar todas]    [Pular tudo (manter como está)]                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Provider │ Nome legacy           │ Status      │ Ação           │ │
│  │──────────┼───────────────────────┼─────────────┼────────────────│ │
│  │ Hotmart  │ JF Rocket             │ Não migrada │ [Migrar]       │ │
│  │ HubSpot  │ Conexão legada (auto) │ Não migrada │ [Re-autorizar] │ │
│  │ Hubla    │ Loja Filial           │ Migrada ✓   │ [Ver detalhe]  │ │
│  │ Stripe   │ Stripe Prod           │ Falhou ⚠   │ [Tentar novo]  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ⓘ Para HubSpot/RD/Pipedrive (OAuth): será pedida re-autorização.    │
│    Para Hotmart/Kiwify (client credentials): tokens migrados auto.    │
│    Para webhook_only (Hubla/Greenn/etc.): URL preservada, sem ação.   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Decisão D-IA8 nova.** "Migração legacy é feature de v1, não opcional. Banner persistente em W1 + tela dedicada W18 + preservação de webhook URL pelo backend (alias). Sem isso, regressão pra 100% dos clientes Mamba atuais."

### F4 — Banner de onboarding pós-criação (W4 quando lastWebhookReceivedAt=null) · P0

**Onde:** `wireframes.md` W4, `spec.md` §6

**Spec.** Adicionar em §6 (Detalhe da conexão):

```markdown
### 6.1.1 Banner de onboarding (D-EST4)

Quando `lastWebhookReceivedAt = null` E conexão tem `<24h`:

Banner sticky no topo de W4 com:
- URL do webhook + secret prominentes (copy-button grande)
- Checklist específico do provider:
  - "1. Cole essa URL em Hotmart > Ferramentas > Webhooks"
  - "2. Marque os eventos: purchase_completed, subscription_*"
  - "3. Salve e faça uma compra de teste"
- Botão `[Enviar evento de teste]` que dispara payload sintético no inbound (flag test=true)
- Status ao vivo: "Aguardando primeiro evento real..." → "Recebido em X" quando chega

Banner some quando primeiro webhook real chega.
```

### F5 — Modo Simple-WhatsApp (D-WA4) · P0

**Onde:** `wireframes.md` W11b, `spec.md` §8

**Spec.** Adicionar em §8.4 (Detalhe da WABA):

```markdown
### 8.4.1 Modo Simple-WhatsApp (D-WA4)

Aciona automaticamente quando: 1 WABA · 1 telefone · status saudável (interno=active, Meta!=Rejected) · 0 templates pendentes.

**Reproduz UX do app legacy** (que Card validou: "zero me incomoda hoje"):
- Header compacto: nome WABA · status combinado (1 chip) · número de telefone
- Sem 3 tabs (Conta · Telefones · Templates)
- Scroll único: lista de templates com sort/filter (D-STAT1) + último evento + ações (Adicionar telefone / Configurar templates)
- BM ID e Business Portfolio ID em "ver mais" colapsado

Quando cliente adiciona 2º telefone OU 2ª WABA OU template fica pendente, transição automática pro modo Standard (W11b atual).
```

### F6 — Apelido editável (D-CARD4 substitui parte de D-CARD1) · P1

**Onde:** `decisions.md`, `spec.md` §4

**Spec.** Adicionar em §4 (cards do W1):

```markdown
**Campo "Apelido" editável (D-CARD4):** cada conexão tem campo opcional `userDescription` (max 140 chars) editável inline pelo cliente. Substitui descrição genérica removida (D-CARD1). Default vazio (card limpo). Quando preenchido, aparece logo abaixo do nome no card e no header da conexão.

**Caso real (Paulo):** "Hotmart Loja Expressa - cliente Acme - operação SP". Sutileza que cliente perde sem campo livre.
```

### F7 — Permissões+Webhooks juntos quando provider expõe scopes-de-recv (ajusta D-DET1) · P1

**Onde:** `decisions.md`, `spec.md` §6

**Spec.** Atualizar §6 (Detalhe da conexão):

```markdown
**Tabs unificadas Permissões+Webhooks** quando provider tem scopes-de-recv (HubSpot, RD CRM, Pipedrive). Pattern HubSpot: cliente vê numa tela só os escopos OAuth concedidos + os eventos de webhook que ele está recebendo. Daniel pediu literal: "consegui colocar escopo de escrita e webhook no mesmo aplicativo da Hubspot — gostaria que fosse parecido lá".

Quando provider separa estritamente (Hotmart só client_credentials sem scopes OAuth de leitura), tabs ficam separadas como antes.
```

### F8 — Tools globais (W15) com ação · P1

**Onde:** `wireframes.md` W15, `spec.md` §7

**Mudança:**
- W15 ganha checkbox de status na coluna "Estado" (verde/cinza/cinza-escuro pra os 3 estados de tool nativa).
- Click numa linha → drawer de detalhe da tool (D12 já previa) ganha:
  - Toggle "Esta conexão" (mesmo do W8)
  - **Bulk:** "Aplicar em todas as N conexões deste provider" (checkbox+confirmação)
  - Tab "Telemetria" com: execuções 7d/30d, latência p50/p95, error rate, **custo estimado** (provider externo + tokens LLM)
  - Tab "Auditoria" com log de mudanças

**Resolve G32 (D4) + G33 (B-Barnabé custo).**

### F9 — Replicar tool em N orgs (D-TOOL7) · P1

**Onde:** `wireframes.md` W15-replicate (novo), `decisions.md`, `spec.md` §7

**Spec.** Adicionar em §7:

```markdown
### 7.1 Replicar tool em N orgs (D-TOOL7)

Visível só pra super-admin. Em qualquer linha de tool **custom** no W15, drawer de detalhe ganha botão `[Replicar em outras orgs]` com modal análogo ao W11e-2 (Templates em massa):

- Multi-select de orgs sob a mesma conta-mãe (Mamba)
- Modo: "Réplica independente" (v1) ou "Manter sincronizado" (v1.5)
- Após confirmar: backend cria N cópias com `organizationId` diferente, mesmo schema/endpoint

Resolve assimetria com Templates em massa (W11e-2). Sem isso, super-admin Mamba não escala (criar 46 tools manualmente).
```

### F10 — cmd+K do Studio declarado como dependência (D-IA6) · P1

**Onde:** `decisions.md`, `spec.md` §3 (mapa de telas) e §11 (pendências)

**Spec.** Adicionar nota explícita em §3:

```markdown
**Esta tela depende de cmd+K do Studio (D-IA6).** Conexões e Tools são tipos pesquisáveis no overlay global. Sem cmd+K:
- Super-admin Paulo (47 orgs) gasta 4-5 cliques pra navegar entre integrações cross-org
- Daniel (CS 30+ clientes) sofre o mesmo

Implementação fica no design system do Studio, não nesta tela. Mas **declarado como dependência v1** — não delegar como "nice to have v2".
```

---

## Decisões a aplicar (resumo)

### Reverter / ajustar (3)

| ID | Status anterior | Ação | Motivo |
|---|---|---|---|
| **D-TOOL5** | "Tool em página única" | **REVERTER** → D-TOOL6 split-pane | Cliente cria tool às cegas, IA falha em produção (G21) |
| **D-CARD1** | "Sem descrição genérica" | **AJUSTAR** → manter sem genérica + D-CARD4 nova (apelido editável) | Sutileza perdida no Paulo (G31) |
| **D-DET1** | "Tabs sempre condicionais ao authType" | **AJUSTAR** → tabs unificadas Permissões+Webhooks pra providers com scopes-de-recv | Pedido direto Daniel (G29) |

### Novas (8)

| ID | O que é |
|---|---|
| **D-IA6** | cmd+K do Studio declarado como dependência v1 (G26) |
| **D-IA7** | Wizard de onboarding com importação legacy + templates por vertical (G27) |
| **D-IA8** | Migração legacy é feature v1, com banner W1 + tela W18 (G23) |
| **D-CARD4** | Apelido editável por conexão substitui descrição genérica (G31) |
| **D-EST4** | Banner de onboarding pós-criação quando `lastWebhookReceivedAt=null` (G24) |
| **D-TOOL6** | Tool building em split-pane com teste obrigatório (G21) |
| **D-TOOL7** | Replicar tool em N orgs (paridade com Templates em massa) (G30) |
| **D-WA4** | Modo Simple-WhatsApp — densidade adaptativa também no header (G25) |

### Wireframes a adicionar (5)

| W# | O que é |
|---|---|
| **W3-extended** | Header com "+ Webhook customizado" e "+ Integração Customizada" (F2) |
| **W4 banner onboarding** | Banner com URL+secret+checklist+test event quando `lastWebhookReceivedAt=null` (F4) |
| **W11b-Simple** | Variante WhatsApp pro caso 1 BM + 1 telefone (F5) |
| **W15 redesign** | Drawer com toggle + bulk + tabs Telemetria+Auditoria + custo (F8) |
| **W16 split-pane** | Refazer com teste obrigatório, drag-to-map, versão visível (F1) |
| **W18 Migração Legacy** | Banner em W1 + tela dedicada com listagem + ações por linha (F3) |

---

## Pendências do dev (Q-list atualizada)

Q1, Q2, Q4, Q5 saem da lista de pendências (UX agora é independente). **Mantém:**

| Q# | Pergunta |
|---|---|
| **Q3** | Provider "System" interno: vira seed-data com `isSystem=true`? |
| **Q6** | Status de revisão Meta (campos `providerStatus` em ChannelAccount/Endpoint, messagingTier no Endpoint) |
| **Q7** (nova) | Backend tem endpoint pra "auto-detectar conexões legacy" pra W18? Ou cliente cola algum identificador manualmente? |
| **Q8** (nova) | Stat agregada cross-conexão (D-CARD2) — Tury valida viabilidade ou fallback pra só soma de eventos? |
| **Q9** (nova) | Tool com `category=destructive` exige ATC adicional (modal de confirmação ao chamar)? Ou approval em Agents Config separado? |

---

## Recomendação meta

Aplicar nesta ordem:

1. **F1+F2+F3+F4+F5 (5 P0)** — sem isso, spec não vai pra Figma sem regredir cliente atual
2. **F6+F7 (correções de feedback persona)** — Card e Daniel sentem que foram ouvidos
3. **F8+F9 (Tools com governança)** — destrava super-admin
4. **F10 (cmd+K)** — declara dependência

**Tempo estimado total de aplicação no spec/wireframes/decisions:** ~3-4h focadas. Vai aplicar tudo agora em sequência.
