# Wireframes ASCII — Tela Unificada de Integrações

> Acompanha [spec.md](spec.md). Vocabulário alinhado com `awsales-domains-contracts`.
>
> **Termos canônicos:** `Provider` (catálogo), `Conexão` (instância de provider numa org), `Objeto` (item importado), `Tool` (action que IA invoca).
>
> Legenda:
> - `[Botão]` = botão primário · `(Botão)` = secundário · `« »` = navegação · `▼` = dropdown
> - `●` healthy · `▲` degraded · `⚡` unreachable · `✕` expired/revoked/error · `○` pending_auth
> - `[…]` = input · `[search]` = busca · `↕` = ordenável · `▢` = checkbox

---

## W1 — Minhas conexões (tela principal)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Studio · Awsales                                                       [PG ~ MambaCult]│
├────────────┬───────────────────────────────────────────────────────────────────────────┤
│            │                                                                           │
│ ▸ Visão    │  Integrações · 9/15 conexões                       [+ Adicionar integração]
│ ▸ Campanha │                                                                           │
│ ▸ Conversas│  ┌──────────────────────────────────────────────────────────┐ ┌─────────┐ │
│ ▸ Conheci. │  │ [search] Buscar por nome ou tipo...                      │ │ ▦  ☰    │ │
│ ▸ Agentes  │  └──────────────────────────────────────────────────────────┘ └─────────┘ │
│ ▼ Integraç.│  (Org é contexto global do Studio — sidebar/header, não filtro de tela)  │
│ ▸ Tools    │                                                                           │
│ ▸ Otimizaç.│  ──────────────────────────────────────────────────────────────────────── │
│            │                                                                           │
│            │  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐ │
│            │  │ 🔥 Hotmart           │  │ 🔥 Hotmart Club      │  │ 🔶 HubSpot      │ │
│            │  │ checkout             │  │ members_area         │  │ crm             │ │
│            │  │ ●  3 conexões        │  │ ●  1 conexão         │  │ ●  1 conexão    │ │
│            │  │ JF Rocket ● ·        │  │ Marco Zero Members ● │  │ HubSpot Prod ●  │ │
│            │  │ Loja Expressa ● ·    │  │                      │  │                 │ │
│            │  │ Caixa Preta ▲        │  │ últ. 12m             │  │ último evento   │ │
│            │  │ Eventos hoje: 312    │  │ (mesma marca         │  │ 15m atrás       │ │
│            │  │                      │  │  Hotmart, ↑↑)        │  │                 │ │
│            │  └──────────────────────┘  └──────────────────────┘  └─────────────────┘ │
│            │  ↑ D-CARD5: Hotmart e Hotmart Club são providers SEPARADOS no backend     │
│            │   (categorias diferentes), aparecem como cards distintos com mesmo logo. │
│            │                                                                           │
│            │   WhatsApp NÃO aparece mais aqui — D-IA9: Canais é rota irmã, não filha.│
│            │                                                                           │
│            │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│            │  │ 📋 HighLevel    │  │ 🛒 DMG          │  │ 🛒 Hubla        │            │
│            │  │ form            │  │ checkout        │  │ checkout        │            │
│            │  │ ●  2 conexões   │  │ ✕  expirou      │  │ ●  1 conexão    │            │
│            │  │ Form lead · NPS │  │ Reconectar →    │  │ Loja Filial     │            │
│            │  │ últ. 1m         │  │                 │  │ webhook only    │            │
│            │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│            │                                                                           │
│            │  ┌─────────────────┐                                                      │
│            │  │ 🔧 Pipedrive    │                                                      │
│            │  │ crm             │                                                      │
│            │  │ ●  1 conexão    │                                                      │
│            │  │ Nord Academy    │                                                      │
│            │  └─────────────────┘                                                      │
│            │                                                                           │
└────────────┴───────────────────────────────────────────────────────────────────────────┘

OBS:
- Header: quota `9/15 conexões` (D4) — badge warning em 80%
- **Sem filtro de org local** — troca de org é contexto global do Studio (sidebar)
- Card: logo · nome · `category` (subtítulo) · indicador agregado de saúde · linha das conexões
- Multi-conexão (Hotmart, HighLevel) lista as N conexões dentro do card (D1)
- Card de provider multi-conexão tem 1 linha de stat agregada (D3) — mitigação Deds
- Sem descrição genérica do tipo "Capture transações..." (D2 — pedido Paulo)
- Status individual por conexão (●/▲/⚡/✕/○) reflete status × lastHealthStatus do backend
- DMG mostra estado expirado: "Reconectar →" inline no card
- **Hotmart e Hotmart Club** (D-CARD5): cards separados (providers distintos no backend
  com categories diferentes), mesmo logo "H" indica família de marca
- **WhatsApp NÃO aparece aqui** (D-IA9 pós-feedback PG): Canais é rota irmã na sidebar
```

---

## W2 — Empty state

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Integrações                                       [+ Adicionar integração]            │
│                                                                                        │
│                                                                                        │
│                              ┌─────────────────────┐                                   │
│                              │       💡           │                                    │
│                              │                     │                                   │
│                              │   Comece conectando │                                   │
│                              │     sua primeira    │                                   │
│                              │      integração     │                                   │
│                              │                     │                                   │
│                              │  [+ Adicionar]      │                                   │
│                              └─────────────────────┘                                   │
│                                                                                        │
│   Sugestões pra começar:                                                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                                 │
│   │ 💬 WhatsApp  │  │ 🔥 Hotmart   │  │ 🔶 HubSpot   │                                 │
│   │  Conectar →  │  │  Conectar →  │  │  Conectar →  │                                 │
│   └──────────────┘  └──────────────┘  └──────────────┘                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## W3 — Modal "Adicionar integração" (catálogo agrupado por `category`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Escolha uma integração                                              ✕   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────┐  ┌──────────────────────────────────┐│
│  │ + Webhook customizado         │  │ + Integração Customizada         ││
│  │ Receber eventos do seu sistema│  │ Tools HTTP avulsas (sem provider)││
│  └───────────────────────────────┘  └──────────────────────────────────┘│
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  [Todos] [Checkout] [CRM] [Forms] [Meetings] [Members] [Markets] [Action]│
│                                                                          │
│  [search] Buscar provider...                                             │
│                                                                          │
│  Checkout (11)                                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │🔥 Hotmart  │ │🟦 Kiwify   │ │🟫 Eduzz    │ │🟧 DMG      │             │
│  │ OAuth      │ │ OAuth      │ │ OAuth      │ │ API key    │             │
│  │ Conectar > │ │ Conectar > │ │ Conectar > │ │ Conectar > │             │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘             │
│                                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │🟪 Hubla    │ │🟨 Greenn   │ │🟩 Blitzpay │ │🟥 OnProfit │             │
│  │ Webhook    │ │ Webhook    │ │ Webhook    │ │ Webhook    │             │
│  │ Conectar > │ │ Conectar > │ │ Conectar > │ │ Conectar > │             │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘             │
│  ...                                                                      │
│                                                                          │
│  CRM (4)                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │🔶 HubSpot  │ │🟢 Pipedrive│ │🟠 RD CRM   │ │🟣 Kommo    │             │
│  │ OAuth      │ │ OAuth      │ │ OAuth      │ │ OAuth      │             │
│  │ Conectar > │ │ Conectar > │ │ Conectar > │ │ Conectar > │             │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘             │
│                                                                          │
│  Forms · Meetings · Members · Marketplaces · Actions ↓                   │
│                                                                          │
│  ⚠️  Você tem 9/15 conexões — adicionar mais 1 fica no limite.           │
│                                                                          │
│                                                              [Cancelar]  │
└──────────────────────────────────────────────────────────────────────────┘

OBS:
- **Header com 2 affordances primárias (D-ADD4 — pós Stress Test 2):**
  · `+ Webhook customizado` → drawer W3a (resolve caso "checkout próprio sem provider")
  · `+ Integração Customizada` → drawer W3b (resolve Barnabé/Gourmet, tool HTTP avulsa)
- Filtro por category abaixo (D5)
- Card mostra logo, nome e badge do `authType` simplificado (OAuth/API key/Webhook)
- Aviso de quota inline (D-UX2); botão Conectar greyed em 100% com tooltip
- 26 providers catalogados (Hotmart, Kiwify, ..., HubSpot, ..., Magalu, ..., Clint)
- "Yampi" não aparece aqui (não está catalogado) — cliente usa "+ Webhook customizado"
```

### W3a — Drawer "+ Webhook Customizado" (sem provider catalogado)

```
                    ┌─────────────────────────────────────────────────────┐
                    │  « Webhook Customizado                           ✕  │
                    │                                                      │
                    │  Cliente que tem checkout próprio (Shopify mod.,    │
                    │  PHP caseiro, etc.) cola URL no seu sistema pra     │
                    │  notificar AwSales quando rola compra/lead.         │
                    │                                                      │
                    │  Nome dessa conexão *                                │
                    │  [ Checkout Loja JF                              ]   │
                    │                                                      │
                    │  Apelido (opcional)                                  │
                    │  [ Operação SP - cliente Acme                    ]   │
                    │                                                      │
                    │  Tipo de evento esperado *                           │
                    │  ◉ Compra criada                                     │
                    │  ○ Lead capturado                                    │
                    │  ○ Outro / personalizado                             │
                    │                                                      │
                    │  ⓘ Após criar você recebe URL + secret pra colar    │
                    │     no seu sistema. Schema esperado documentado.    │
                    │                                                      │
                    │             [Cancelar]      [Criar webhook]          │
                    └─────────────────────────────────────────────────────┘

OBS:
- Resolve Q1 (cliente legacy migrando) sem depender de modelagem backend
- Banner pós-criação (W4 banner D-EST4) cobre o "como saber que chegou"
```

### W3b — Drawer "+ Integração Customizada" (tool HTTP avulsa)

```
                    ┌─────────────────────────────────────────────────────┐
                    │  « Integração Customizada                        ✕  │
                    │                                                      │
                    │  Crie conexão com API HTTP que não está no catálogo. │
                    │  Após criar, você cria tools dentro pra IA usar.     │
                    │  Caso típico: Gourmet API, planilha externa, etc.    │
                    │                                                      │
                    │  Nome dessa conexão *                                │
                    │  [ Gourmet API                                   ]   │
                    │                                                      │
                    │  Apelido (opcional)                                  │
                    │  [                                               ]   │
                    │                                                      │
                    │  Base URL (opcional)                                 │
                    │  [ https://api.gourmet.com.br                    ]   │
                    │                                                      │
                    │  Tipo de auth *                                      │
                    │  [ Bearer Token                          ▼ ]         │
                    │    Bearer · API Key · Basic · Nenhuma                │
                    │                                                      │
                    │  Token *                                             │
                    │  [ ••••••••••••••••••••••••                  ] [👁] │
                    │                                                      │
                    │  ⓘ Após criar, você cria tools HTTP dentro dessa    │
                    │     conexão. As tools herdam essa credencial auto.  │
                    │                                                      │
                    │       [Cancelar]   (Testar)   [Criar conexão]        │
                    └─────────────────────────────────────────────────────┘

OBS:
- Resolve Q2 (Barnabé/Gourmet) sem depender de modelagem backend
- Após criar, redireciona pro W4 da conexão custom → cliente cria tool em W16
- Auth da tool herda da credencial daqui (override possível por tool em W16)
```

---

## W13 — Drawer "Conectar" (variantes por `authType`)

Mesmo drawer com campos condicionais. Não 4 fluxos diferentes — 1 drawer com seções que aparecem/somem.

### Variante OAuth Authorization Code (HubSpot, Pipedrive, Calendly, RD, etc.)

```
                    ┌─────────────────────────────────────────────────────┐
                    │  « Conectar HubSpot                              ✕  │
                    │                                                      │
                    │  🔶 HubSpot · CRM                                    │
                    │  ──────────────────────────────────────────          │
                    │                                                      │
                    │  Nome dessa conexão *                                │
                    │  [ HubSpot Produção                              ]   │
                    │                                                      │
                    │  ⓘ Único por provider+nome (vc não pode ter 2       │
                    │     "HubSpot Produção" ao mesmo tempo)              │
                    │                                                      │
                    │  ─────────────────────────────                       │
                    │                                                      │
                    │  Você será redirecionado pra HubSpot pra autorizar.  │
                    │  Vamos pedir os escopos:                             │
                    │  • Contatos (read)                                   │
                    │  • Negócios (read · write)                           │
                    │  • Webhooks (recv)                                   │
                    │                                                      │
                    │              [Cancelar]   [Conectar com HubSpot →]   │
                    └─────────────────────────────────────────────────────┘
```

### Variante OAuth Client Credentials (Hotmart, Kiwify)

```
                    ┌─────────────────────────────────────────────────────┐
                    │  « Conectar Hotmart                              ✕  │
                    │                                                      │
                    │  🔥 Hotmart · Checkout                               │
                    │                                                      │
                    │  Nome dessa conexão *                                │
                    │  [ JF Rocket                                     ]   │
                    │                                                      │
                    │  Suas credenciais Hotmart *                          │
                    │  Client ID    [ ____________________________     ]   │
                    │  Client Secret[ •••••••••••••••••••••••••••     ]   │
                    │                                                      │
                    │  ⓘ Como achar essas credenciais? [Ver tutorial]     │
                    │                                                      │
                    │              [Cancelar]   (Testar)   [Conectar]      │
                    └─────────────────────────────────────────────────────┘
```

### Variante API key (DMG, MemberKit, Cademi)

```
                    ┌─────────────────────────────────────────────────────┐
                    │  « Conectar MemberKit                            ✕  │
                    │                                                      │
                    │  🟢 MemberKit · Members area                         │
                    │                                                      │
                    │  Nome dessa conexão *                                │
                    │  [ MemberKit Produção                            ]   │
                    │                                                      │
                    │  API Key *                                           │
                    │  [ mk_live_••••••••••••••••••••••••••••         ]   │
                    │                                                      │
                    │  ⓘ Como gerar a API key? [Ver tutorial]             │
                    │                                                      │
                    │              [Cancelar]   (Testar)   [Conectar]      │
                    └─────────────────────────────────────────────────────┘
```

### Variante Webhook only (Blitzpay, Greenn, Hubla, OnProfit, TMB, Payt)

```
                    ┌─────────────────────────────────────────────────────┐
                    │  « Conectar Hubla                                ✕  │
                    │                                                      │
                    │  🟪 Hubla · Checkout · só recebe webhook             │
                    │                                                      │
                    │  Nome dessa conexão *                                │
                    │  [ Loja Filial 02                                ]   │
                    │                                                      │
                    │  ─────────────────────────────                       │
                    │                                                      │
                    │  Após criar, você vai receber:                       │
                    │  • URL do webhook (cole no Hubla)                    │
                    │  • Secret pra validar a origem (não-recuperável)     │
                    │                                                      │
                    │  ⓘ Não temos API pra puxar dados da Hubla — só     │
                    │     recebemos eventos de compra que você enviar.    │
                    │                                                      │
                    │                  [Cancelar]   [Criar conexão]        │
                    └─────────────────────────────────────────────────────┘
```

### Após criar (pra `webhook_only`) — modal de copiar credenciais

```
                    ┌─────────────────────────────────────────────────────┐
                    │  ✓ Conexão criada                                   │
                    ├─────────────────────────────────────────────────────┤
                    │                                                      │
                    │  Cole essas informações no Hubla:                    │
                    │                                                      │
                    │  URL do webhook                                      │
                    │  ┌─────────────────────────────────────┐ [📋 Copiar] │
                    │  │https://webhooks.awsales.com/        │             │
                    │  │019525fd-ce50-7b7f-...               │             │
                    │  └─────────────────────────────────────┘             │
                    │                                                      │
                    │  Secret de validação (não recuperável depois)        │
                    │  ┌─────────────────────────────────────┐ [📋 Copiar] │
                    │  │whsec_a1b2c3d4e5f6...                │             │
                    │  └─────────────────────────────────────┘             │
                    │                                                      │
                    │  ⚠️  O secret só aparece agora. Salve num lugar      │
                    │     seguro antes de fechar.                          │
                    │                                                      │
                    │                                  [Salvei, fechar]    │
                    └─────────────────────────────────────────────────────┘
```

---

## W4 — Detalhe da conexão (1 conexão · modo Standard)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  Hotmart                                                             │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ 🔥 Hotmart · JF Rocket                                  ●  Ativo · saúde OK   │   │
│  │ checkout · oauth2_client_credentials                  [Reconectar] (Testar)[⋯]│   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  ┌─Visão─┬─Permissões─┬─Objetos─┬─Webhooks─┬─Tools─┐                                   │
│  └───────┴────────────┴─────────┴──────────┴───────┘                                   │
│                                                                                        │
│  ╭──── Visão ──────────────────────────────────────────────────────────────────╮       │
│  │                                                                             │       │
│  │  Status                  ● Ativo                                            │       │
│  │  Saúde                   ● healthy · última verificação 2 min atrás         │       │
│  │  Último webhook          2 min atrás (compra criada · #4321)                │       │
│  │  Eventos hoje            127                                                │       │
│  │  Conectada em            2026-03-01                                         │       │
│  │  Tools ativas            4 nativas · 2 custom (ver tab Tools)               │       │
│  │                                                                             │       │
│  ╰─────────────────────────────────────────────────────────────────────────────╯       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Header mostra status (chip) E saúde (texto) — são campos diferentes do backend
- `authType` aparece como subtítulo informativo (ajuda PG/CS entender o flow)
- Tabs renderizadas conforme authType + capabilities (D7) — Hotmart tem todas
- Sem refs técnicas (FQN, idempotência, refresh) — backend cuida disso
```

### W4-Simple — variante automática para caso Card (1 conexão · 0 tool custom · não-channel)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  Hotmart                                                             │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ 🔥 Hotmart · JF Rocket                                  ●  Ativo · saúde OK   │   │
│  │ 127 eventos hoje · último 2m atrás        [Reconectar] (Testar) (Desassociar) │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  ── (sem tabs — tudo no mesmo scroll) ──                                               │
│                                                                                        │
│  Produtos · 14 itens                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────────────┐     │
│  │ [search] Buscar produto...                                      [Filtrar ▼] │     │
│  │ ─────────────────────────────────────────────────────────────────────────────│     │
│  │ LOJA EXPRESSA EZDROP        ec341e4e-1448-..                                 │     │
│  │ MARCO ZERO VITALÍCIO        692a52726-6d8..                                  │     │
│  │ CAIXA PRETA + BOOTCAMP      b1f615b73-3645..                                 │     │
│  │ ...                                                                           │     │
│  └──────────────────────────────────────────────────────────────────────────────┘     │
│                                                ‹ 1 2 3 ... 14 ›                       │
│                                                                                        │
│  Webhook                                                                               │
│  ● recebendo · último: compra criada #4321 (2m atrás)         [Configurar webhook ▸] │
│                                                                                        │
│  Permissões                                                                            │
│  Produtos [read][write] · Compradores [read] · Webhooks [recv]    [Reconectar+escopos]│
│                                                                                        │
│  Tools (0 custom · 4 nativas habilitadas)                                              │
│  ▸ Expandir lista                                                                      │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Aciona automaticamente: 1 conexão · 0 tool custom · não-canal (D9)
- Reproduz a UX atual do app que Card validou ("zero me incomoda")
- Sem regressão de cliques pro caso Pareto
```

### W4-Onboarding — Banner de onboarding pós-criação (D-EST4 — ajustado pós-feedback PG)

Quando `lastWebhookReceivedAt = null` E conexão tem `<24h`, banner sticky no topo de qualquer variante (Simple/Standard/Power).

```
╔════════════════════════════════════════════════════════════════════════════════════╗
║  🚀  Aguardando primeiro evento — termine a configuração no provider              ║
║                                                                                    ║
║  Cole essa URL no Hotmart > Ferramentas > Webhooks:                                ║
║  ┌─────────────────────────────────────────────────────────────┐ [📋 Copiar]      ║
║  │ https://webhooks.awsales.com/019525fd-ce50-7b7f-...         │                  ║
║  └─────────────────────────────────────────────────────────────┘                  ║
║                                                                                    ║
║  Checklist Hotmart:                                                                ║
║  ▢ 1. Acesse Hotmart > Ferramentas > Webhooks                                     ║
║  ▢ 2. Cole a URL acima e salve no painel do Hotmart                               ║
║  ▢ 3. Marque eventos: purchase_completed, subscription_*                          ║
║  ▢ 4. Faça uma compra teste de R$1 no Hotmart pra disparar o primeiro webhook    ║
║                                                                                    ║
║  Status: ⏳ Aguardando primeiro evento real do Hotmart...                         ║
║  (não enviamos evento sintético — quem dispara é sempre o provider)               ║
║                                                                                    ║
║                                            [↻ Verificar agora]   [Ocultar]        ║
╚════════════════════════════════════════════════════════════════════════════════════╝

(banner some quando primeiro webhook real chega — substituído por toast "Recebido em X")

OBS — D-EST4 ajustada pós-feedback PG:
- Resolve gap recorrente em todo provider OAuth+webhook (D-EST4)
- Checklist específico por provider vem de seed-data `provider.onboardingChecklist`
- Pra `oauth_authorization_code` puro (HubSpot etc.) onde webhook chega via OAuth
  scope automático: skip parte "Cole URL", mostra só checklist
- ❌ **REMOVIDO botão "Enviar evento de teste"** — feedback PG: "não enviamos evento
  de teste, é o webhook do Hotmart enviado pra nós". Backend não simula webhook do
  provider. UX prometia feature inexistente.
- ✅ **Botão "Verificar agora"** — força refetch dos últimos webhooks recebidos
  (refresh) sem reload da página. Cliente vê se chegou novo evento ainda agora.
- Pra evento personalizado (W3a Webhook customizado): mesma regra — quem dispara
  é o sistema do cliente. Modal pós-criação deixa explícito.
```

---

## W5 — Detalhe da conexão (N conexões — sidebar lateral aparece)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  Hotmart                                  [+ Adicionar conexão]      │
│                                                                                        │
│  ┌── 3 conexões ────────┐  ┌─────────────────────────────────────────────────────────┐ │
│  │                      │  │ 🔥 Hotmart · Loja Expressa            ●  Ativo · 2m    │ │
│  │ ● JF Rocket          │  │ oauth2_client_credentials      [Reconectar] (Testar)[⋯]│ │
│  │   2m atrás           │  └─────────────────────────────────────────────────────────┘ │
│  │                      │                                                              │
│  │ ◉ Loja Expressa      │  ┌─Visão─┬─Permissões─┬─Objetos─┬─Webhooks─┬─Tools─┐       │
│  │   1m atrás           │  │       │            │         │          │       │       │
│  │                      │  └───────┴────────────┴─────────┴──────────┴───────┘       │
│  │ ▲ Caixa Preta        │                                                              │
│  │   1d atrás           │  ╭──── Objetos · 14 itens ────────────────────────╮         │
│  │   webhook degradado  │  │                                                  │         │
│  │                      │  │  [Tipo: Produtos ▼] [search]      [Filtrar ▼] │         │
│  │ + Adicionar conexão  │  │                                                  │         │
│  │                      │  │  ┌──────────────────────────────────────────┐  │         │
│  └──────────────────────┘  │  │ Nome ↕                  │ ID externo ↕  │  │         │
│                            │  │──────────────────────────────────────────│  │         │
│                            │  │ ▸ LOJA EXPRESSA EZDROP   ec341e4e-..    │  │         │
│                            │  │ ▸ MARCO ZERO VITALÍCIO   692a5272-..    │  │         │
│                            │  │   └ Plano Anual          (oferta)       │  │         │
│                            │  │   └ Plano Mensal         (oferta)       │  │         │
│                            │  │ ▸ CAIXA PRETA + BOOTCAMP b1f615b7-..    │  │         │
│                            │  │ ...                                       │  │         │
│                            │  └──────────────────────────────────────────┘  │         │
│                            │                              ‹ 1 2 3 ... 14 ›  │         │
│                            ╰─────────────────────────────────────────────────╯         │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Sidebar lateral só aparece quando >1 conexão (D10) — pattern WABA
- Status individual por conexão (●/▲/⚡/✕) — reflete status×lastHealthStatus do backend
- Tab Objetos: filtro por sourceType (PRODUCT/FORM/MEETING/MEMBER_AREA/CRM_DEAL)
- Hierarquia raiz → ofertas via expandir (parentId do IntegrationObject)
- Headers ordenáveis (D8)
```

---

## W6 — Tab "Permissões"

```
╭──── Permissões · Hotmart Loja Expressa ─────────────────────────────────────╮
│                                                                             │
│  Escopos concedidos                                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Produtos       [read] [write]    Transações      [read]              │   │
│  │ Compradores    [read]            Assinaturas     [read] [write]      │   │
│  │ Cupons         [read] [write]    Webhooks        [recv]              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Pra alterar escopos, reconecte a conta.        [Reconectar com escopos]    │
│                                                                             │
╰─────────────────────────────────────────────────────────────────────────────╯

OBS:
- Chips read/write/recv pra cada capability (Daniel pediu)
- Pra api_key: não tem chips — mostra "API key fornecida" + dot pra mascarar
- Pra webhook_only: tab nem aparece
- "Reconectar com escopos" leva ao mesmo flow OAuth com escopos adicionais marcados
- Detalhe importante: backend nunca expõe credentials cruas em API pública —
  então nem tentamos mostrar Client Secret aqui
```

---

## W7 — Tab "Webhooks" (para `supportsWebhook=true`)

```
╭──── Webhooks · Hotmart Loja Expressa ───────────────────────────────────────╮
│                                                                             │
│  URL do webhook (cole no Hotmart se ainda não fez)                          │
│  ┌─────────────────────────────────────────────┐ [📋]                       │
│  │ https://webhooks.awsales.com/<connectionId> │                            │
│  └─────────────────────────────────────────────┘                            │
│                                                                             │
│  Eventos suportados pelo Hotmart (cliques nos chips ativam/desativam)      │
│  [✓ purchase_completed] [✓ purchase_canceled] [✓ subscription_started]     │
│  [✓ subscription_canceled] [○ purchase_refunded] [○ chargeback]             │
│                                                                             │
│  Últimos eventos recebidos                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 30/04 10:02   ✓ 200   purchase_completed   #4321                     │   │
│  │ 30/04 09:51   ✓ 200   purchase_completed   #4320                     │   │
│  │ 30/04 09:30   ✕ 422   schema inválido      [Ver erro]                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
╰─────────────────────────────────────────────────────────────────────────────╯

OBS:
- Eventos suportados vêm de GET /:id/event-types (já existe no backend)
- Pra webhook_only: além disso mostra o secret mascarado (sem revelar — só copy)
- Logs recentes: depende se backend expõe (Q4 do spec) — placeholder por enquanto
```

---

## W8 — Tab "Tools" dentro da conexão (subset)

```
╭──── Tools · Hotmart Loja Expressa ──────────────────────────────────────────────╮
│                                                                                 │
│  Tools nativas do Hotmart                              ▢ Habilitadas: 3 de 6    │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ ☑ buscar-produto-hotmart    Busca produto pelo ID    [read]    324    │    │
│  │ ☑ listar-vendas             Lista vendas do produto  [read]    187    │    │
│  │ ☑ buscar-comprador          Busca comprador          [read]     12    │    │
│  │ ☐ criar-cupom               Cria cupom               [write]     0    │    │
│  │ ▲ ☐ refund                  Estorna compra           [destrut.]  0    │    │
│  │     ↑ scope `write` não concedido      [Reconectar+escopos]            │    │
│  │ ◐ ☐ assinatura-cancelar     Cancela assinatura       [destrut.]  0    │    │
│  │     ↑ em breve (Hotmart ainda não suporta)                              │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  Tools customizadas dessa conexão                  [+ Nova Tool HTTP]           │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ agendar-especialista     POST  Agenda reunião         [write]   89    │    │
│  │ consulta-preco           POST  Consulta preço         [read]  1.247   │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ℹ️  Pra ver todas as tools de todas as conexões, abra Tools no menu (W15).    │
│                                                                                 │
╰─────────────────────────────────────────────────────────────────────────────────╯

OBS:
- Subset focado nessa conexão — visão global vai pra W15
- Tri-estado: ● disponível · ▲ scope insuficiente · ◐ provider ainda não suporta (D14)
- Categoria simplificada pra 3 visíveis: read/write/destrutivo (D13)
- Tools custom criadas aqui herdam a credencial da conexão-pai
```

---

## W19 — Canais (rota irmã de Integrações — D-IA9 pós-feedback PG)

> Tela de entrada do domínio Messaging. Sidebar do Studio: `Integrações` · **`Canais`** · `Tools`.
> WhatsApp não aparece mais no W1 (Minhas conexões).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Canais   1 canal · domínio Messaging                          [+ Adicionar canal]    │
│                                                                                        │
│  Canais (WhatsApp, Instagram, Messenger, Email, SMS) vivem no domínio Messaging,       │
│  não no Integration Hub. Por isso ficam em rota irmã, não dentro de Integrações.       │
│                                                                                        │
│  ──────────────────────────────────────────────────────────────────────────────────    │
│                                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ 💬 WhatsApp          │  │ 📷 Instagram         │  │ 💬 Messenger         │         │
│  │ canal · meta_whatsapp│  │ canal · em breve     │  │ canal · em breve     │         │
│  │ ▲  2 de 3 ok         │  │ ○ não conectado      │  │ ○ não conectado      │         │
│  │ Loja Expressa ●      │  │                      │  │                      │         │
│  │ Caixa Preta ▲        │  │ v1.5 · roadmap       │  │ v1.5 · roadmap       │         │
│  │ JF Rocket ●          │  │                      │  │                      │         │
│  │ Mensagens hoje: 4.2k │  │                      │  │                      │         │
│  │ 5 telefones · 54 tpl │  │                      │  │                      │         │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘         │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Sidebar Studio: `Integrações` · `Canais` · `Tools` (3 itens irmãos)
- WhatsApp click → vai pra W11 (lista de WABAs do org)
- IG/Messenger marcados como "em breve" — placeholders pra v1.5
- Email/SMS quando virarem canais reais entram aqui também
- Fluxo de "+ Adicionar canal" é diferente dos providers normais (Meta Embedded Signup
  pra WABA, OAuth Google pra Email, etc.) — não usa W3 catálogo
```

---

## W11 — Canal WhatsApp (lista de WABAs do org)

Tela de entrada quando cliente clica no card "WhatsApp" do W1. Layout próprio porque WhatsApp tem **3 níveis aninhados** (WABA → telefones → templates) e features cross-WABA (vars fixas, templates em massa).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  WhatsApp                                                            │
│                                                                                        │
│  Status geral: ●  Ativo   (1 de 2 WABAs com problemas)                                 │
│                                                                                        │
│  ┌────────────────────────────────────┐  ┌────────────────────────────────────┐        │
│  │ {} Variáveis fixas de template  →  │  │ ⊞  Templates em massa            → │        │
│  │ Gerencie values reutilizadas em    │  │ Crie templates em múltiplas WABAs  │        │
│  │ todos os seus templates WhatsApp.  │  │ pra disparos de alto volume.       │        │
│  └────────────────────────────────────┘  └────────────────────────────────────┘        │
│                                                                                        │
│  ┌─────────────────────────────────────────────┐  ┌─┐ ┌─┐ ┌─┐  [+ Adicionar conta]    │
│  │ [search] Pesquisar por nome ou ID da WABA  │  │▦│ │☰│ │↻│                          │
│  └─────────────────────────────────────────────┘  └─┘ └─┘ └─┘                          │
│                                                                                        │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐    │
│  │ Jota Fiuza - Suporte Marco Zero      │  │ Jota Fiuza - Suporte Marco Zero 5.0  │    │
│  │ BM ID 1234567890         ✕ Rejeitado │  │ BM ID 9876543210         ✕ Rejeitado │    │
│  │                                      │  │                                      │    │
│  │ Números vinculados                   │  │ Números vinculados                   │    │
│  │ 1 telefone                           │  │ 2 telefones                          │    │
│  │                                      │  │                                      │    │
│  │ Total de conversas (mês) ⓘ          │  │ Total de conversas (mês) ⓘ          │    │
│  │ 0 conversas                          │  │ 0 conversas                          │    │
│  │                                      │  │                                      │    │
│  │ ┌────────┐ ┌──────────┐ ┌─────────┐ │  │ ┌────────┐ ┌──────────┐ ┌─────────┐ │    │
│  │ │ Conta  │ │ Telefones│ │Templates│ │  │ │ Conta  │ │ Telefones│ │Templates│ │    │
│  │ └────────┘ └──────────┘ └─────────┘ │  │ └────────┘ └──────────┘ └─────────┘ │    │
│  └──────────────────────────────────────┘  └──────────────────────────────────────┘    │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Mantém estrutura atual da tela (que funciona) mas com refinamentos
- 2 cards de atalho cross-WABA no topo: Vars fixas + Templates em massa (D20)
- Card da WABA: nome + BM ID visível + chip de status combinado interno×Meta (D19)
- Status combinado: ● Ativo / ▲ Saúde degradada / ✕ Rejeitado / ○ Aguardando
- Quick actions inline (Conta · Telefones · Templates) — vão direto pra tab certa em W11b
- Caso 1 WABA + 1 telefone: pula essa tela, vai direto pro W11b (D21)
- Em vez de "Status: Rejeitado" como label genérica, mostra qual subsistema rejeitou
  (WABA Meta · BM bloqueada · número específico) — Paulo: status mockado é confuso
```

---

## W11b — Detalhe da WABA (3 tabs internas)

Drilldown de uma WABA específica. 3 tabs: **Conta** (default) · **Telefones** · **Templates**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  WhatsApp  /  Jota Fiuza - Suporte Marco Zero                        │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ 💬 WABA · Jota Fiuza - Suporte Marco Zero          ●  Ativo · ✕ Meta Rejected │   │
│  │ BM ID: 1234567890                              [Reconectar] (Testar) [⋯]      │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  ┌─Conta─┬─Telefones (1)─┬─Templates (24)─┐                                            │
│  └───────┴───────────────┴────────────────┘                                            │
│                                                                                        │
│  ╭──── Conta ──────────────────────────────────────────────────────────────────╮       │
│  │                                                                             │       │
│  │  Status interno          ●  Ativo                                           │       │
│  │  Status na Meta          ✕  Rejected (motivo: Quality issues)              │       │
│  │  Saúde                   ●  healthy · última verificação 12 min atrás       │       │
│  │  Quality rating Meta     🔴 Low                                            │       │
│  │                                                                             │       │
│  │  Meta Business Account   1234567890                       [📋]              │       │
│  │  Business Portfolio ID   bp_xxxxxxxxx                     [📋]              │       │
│  │  (relevante pra fluxo BSUID — ver docs)                                     │       │
│  │                                                                             │       │
│  │  Números vinculados      1 telefone (1 ativo)              [Ver telefones →]│       │
│  │  Templates aprovados     22 de 24                          [Ver templates →]│       │
│  │  Conversas no mês        0                                                  │       │
│  │                                                                             │       │
│  │  Conectada em            2026-03-01                                         │       │
│  │                                                                             │       │
│  │  Ações:                                                                     │       │
│  │  [Reconectar conta]  (Testar conexão)  (Desassociar)                        │       │
│  │                                                                             │       │
│  ╰─────────────────────────────────────────────────────────────────────────────╯       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Status interno e status Meta separados (D19) — Paulo reclamou de status mockado
- BM ID + Business Portfolio ID copiáveis (Daniel: "ver sem clicar")
- Quality rating Meta como chip colorido independente do status
- Atalhos inline pra tabs Telefones/Templates (não força clique no tab)
```

### W11b-Simple — Modo Simple-WhatsApp (D-WA4 — pós Stress Test 2)

Aciona automaticamente quando: 1 WABA · 1 telefone · status saudável · 0 templates pendentes. **Reproduz UX do app legacy que Card validou** ("zero me incomoda").

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  WhatsApp                                                            │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ 💬 BM Loja Expressa · +55 31 93505-3984                       ●  Tudo OK     │   │
│  │ 1.247 mensagens/30d · qualidade ALTA · 24 templates aprovados                  │   │
│  │                                              [+ Telefone] [Reconectar] [⋯]    │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  ── (sem tabs — tudo no mesmo scroll, igual app legacy) ──                             │
│                                                                                        │
│  Templates · 24 itens                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ [search] [Cat ▼]                                          [+ Adicionar template] │
│  │ ┌────────────────────────────────────────────────────────────────────────┐  │   │
│  │ │Nome ↕            │Cat ↕   │Status            │Disp ↕│Resp ↕│Q. ↕    │  │   │
│  │ │──────────────────┼────────┼──────────────────┼──────┼──────┼─────────│  │   │
│  │ │boas_vindas      │Util    │● Aprovado        │ 1.247│ 62% 🟢│ALTA   │ ▸│   │
│  │ │follow_up_1d     │Util    │● Aprovado        │   842│ 41% 🟡│ALTA   │ ▸│   │
│  │ │promo_friday     │Mkt     │● Aprovado        │ 3.102│ 18% 🟡│MED    │ ▸│   │
│  │ │...                                                                       │  │   │
│  │ └────────────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                        │
│  Última atividade: compra criada · 2m atrás                                            │
│                                                                                        │
│  ▸ Detalhes técnicos (BM ID, Business Portfolio ID, status interno)                    │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Aciona auto: 1 WABA · 1 telefone · status saudável · 0 pending (D-WA4)
- Reproduz UX que Card validou ("zero me incomoda hoje, zero mesmo zero")
- Header compacto: nome BM + telefone + estado em 1 chip
- Sem 3 tabs (Conta · Telefones · Templates) — scroll único
- BM ID/BPID em "▸ Detalhes técnicos" colapsado (não some, sai da dobra)
- Quando cliente adiciona 2º telefone OU 2ª WABA OU template fica pending →
  transição automática pro modo Standard (W11b)
```

---

## W11c — Tab "Telefones" da WABA

Tabela de `ChannelEndpoint` (channelType=whatsapp) dessa WABA.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  WhatsApp  /  Jota Fiuza - Suporte Marco Zero                        │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ 💬 WABA · Jota Fiuza - Suporte Marco Zero          ●  Ativo · ✕ Meta Rejected │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  ┌─Conta─┬─Telefones (1)─┬─Templates (24)─┐                                            │
│  └───────┴───────────────┴────────────────┘                                            │
│                                                                                        │
│  ╭──── Telefones · 1 número ──────────────────────────────────────────────────╮       │
│  │  [search]                                              [↻]  [+ Adicionar telefone] │
│  │                                                                             │       │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │       │
│  │  │ 📞 │Número ↕         │Nome ↕              │Status Meta │Qualidade│Limite│✏│   │
│  │  │────┼─────────────────┼────────────────────┼────────────┼─────────┼──────┤   │   │
│  │  │ 📞 │+55 31 93505-3984│Suporte - Jota ⚠   │○ Pending   │ 🟢 Alta │10K/d │✏│   │
│  │  │    │                 │ ↑ nome com aviso   │  review    │         │      │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘   │       │
│  │                                                                             │       │
│  │  Legenda Status Meta: ● Connected · ▲ Throttling · ○ Pending · ✕ Disconn.  │       │
│  │  Legenda Qualidade: 🟢 High · 🟡 Medium · 🔴 Low · ⚠ Flagged                 │       │
│  │                                                                             │       │
│  ╰─────────────────────────────────────────────────────────────────────────────╯       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Headers ordenáveis ↕ (D8 stat com affordance)
- Status Meta separado de status interno (D19)
- Limite de mensagens (tier Meta) é coluna fixa — operadores já sabem ler "10K/d"
- Aviso ⚠ ao lado do nome quando vazio ou inválido na Meta
- Click na linha do telefone → drawer lateral com detalhes (logs recentes, qualidade
  histórica, throughput) — não navega de tela
```

---

## W11d — Tab "Templates" da WABA

Tabela de templates dessa WABA. **Não detalho criação/edição aqui** — é sub-projeto.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  WhatsApp  /  Jota Fiuza - Suporte Marco Zero                        │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ 💬 WABA · Jota Fiuza - Suporte Marco Zero          ●  Ativo · ✕ Meta Rejected │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  ┌─Conta─┬─Telefones (1)─┬─Templates (24)─┐                                            │
│  └───────┴───────────────┴────────────────┘                                            │
│                                                                                        │
│  ╭──── Templates · 24 itens ──────────────────────────────────────────────────╮       │
│  │  [search] [Cat ▼] [Idioma ▼] [Status ▼]                  [+ Adicionar template]    │
│  │                                                                             │       │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │       │
│  │  │Nome ↕            │Cat ↕   │Idioma │Status ↕         │Disp ↕│Resp ↕│   │       │
│  │  │──────────────────┼────────┼───────┼─────────────────┼──────┼──────┤   │       │
│  │  │csat_jota_fiuza...│Utilidade│pt_BR │● Ativo·Q.pendnt │1.247 │ 62% 🟢│ ▸│   │
│  │  │welcome_v2        │Utilidade│pt_BR │● Aprovado       │  842 │ 41% 🟡│ ▸│   │
│  │  │promo_friday     │Marketing│pt_BR │▲ Pending review │3.102 │ 18% 🟡│ ▸│   │
│  │  │recovery_24h     │Marketing│pt_BR │✕ Rejected       │   98 │  3% 🔴│ ▸│   │
│  │  │...                                                                  │   │       │
│  │  └────────────────────────────────────────────────────────────────────┘   │       │
│  │                                                                             │       │
│  │  Click ▸ abre drawer lateral com detalhe estatístico (D22)                  │       │
│  │                                                       Mostrando 1-10 de 24  │       │
│  ╰─────────────────────────────────────────────────────────────────────────────╯       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Estrutura mantida do print 3 — bom layout
- Headers ordenáveis (D8) + filtros por categoria/idioma/status
- Status combina nosso `status` × `providerReviewStatus` Meta
- Disparos + Taxa de resposta agora visíveis na lista (Daniel pediu)
- Click ▸ abre drawer lateral com gráfico de disparos + lista campanhas (D22)
- Default sort: Resposta ASC (mostra os piores primeiro — orientado a ação)
- Não detalho criação/edição aqui — é sub-projeto separado (D23)
```

---

## W11e — Atalhos cross-WABA (Variáveis fixas + Templates em massa)

Features que existem **fora** da hierarquia de uma WABA específica. São cross-WABA do org. Aparecem como atalhos no header da W11.

### W11e-1 — Variáveis fixas de template

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  WhatsApp  /  Variáveis fixas de template                            │
│                                                                                        │
│  Values reutilizadas em todos os templates WhatsApp do seu org. Útil pra evitar        │
│  colar a mesma string em cada template (nome da empresa, link de suporte, etc.).       │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ Chave                  │ Value                                          │  ✏  │   │
│  │────────────────────────┼─────────────────────────────────────────────────┼─────│   │
│  │ {{empresa_nome}}       │ Jota Fiuza Marketing                            │  ✏  │   │
│  │ {{suporte_link}}       │ https://wa.me/553193505398                     │  ✏  │   │
│  │ {{site_url}}           │ https://jotafiuza.com.br                        │  ✏  │   │
│  │ {{telefone_fixo}}      │ +55 31 3344-5566                                │  ✏  │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  [+ Adicionar variável fixa]                                                           │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### W11e-2 — Templates em massa

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  WhatsApp  /  Templates em massa                                     │
│                                                                                        │
│  Crie 1 template e replique automaticamente em múltiplas WABAs do seu org.             │
│  Cada WABA recebe submissão separada pra Meta — aprovação caso a caso.                 │
│                                                                                        │
│  ╭─Template a replicar─────────────────────────────────────────────────────────╮       │
│  │ Nome técnico *  [ welcome_v2_geral                                       ]  │       │
│  │ Categoria *     [ Utility                                            ▼  ]  │       │
│  │ Idioma *        [ pt_BR                                              ▼  ]  │       │
│  │ Conteúdo        [ ... textarea ... ]                                        │       │
│  ╰─────────────────────────────────────────────────────────────────────────────╯       │
│                                                                                        │
│  ╭─Aplicar nas WABAs───────────────────────────────────────────────────────────╮       │
│  │ ▢ Selecionar todas (3)                                                      │       │
│  │ ▢ Jota Fiuza - Suporte Marco Zero                ●  Ativo                  │       │
│  │ ▢ Jota Fiuza - Suporte Marco Zero 5.0            ●  Ativo                  │       │
│  │ ▢ Jota Fiuza - Outras Operações                  ▲  Quality issues         │       │
│  ╰─────────────────────────────────────────────────────────────────────────────╯       │
│                                                                                        │
│  ⚠️  Cada WABA submete pra Meta separadamente — aprovação caso a caso pode demorar     │
│      até 24h e algumas podem ser rejeitadas mesmo se outras forem aprovadas.           │
│                                                                                        │
│                                                  [Cancelar]  [Submeter em massa]       │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Replica 1 template em N WABAs (caso real cliente Jota Fiuza com 2-3 WABAs)
- Aviso claro: aprovação Meta é por WABA, não atomica
- Após submissão: lista de WABAs com status individual (Approved/Pending/Rejected)
  fica numa tela de acompanhamento (não desenhada aqui — pendência futura)
```

---

## W12 — Estado de erro (conexão `expired`/`revoked`/`error`)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  DMG                                                                 │
│                                                                                        │
│  ╔════════════════════════════════════════════════════════════════════════════════╗   │
│  ║  ✕  DMG Loja Filial — credenciais inválidas                                    ║   │
│  ║     A API key parou de funcionar em 2026-04-29 14:22.                          ║   │
│  ║                                                          [Reconectar agora]    ║   │
│  ╚════════════════════════════════════════════════════════════════════════════════╝   │
│                                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────────┐   │
│  │ 🟧 DMG · Loja Filial                                          ✕  Erro · 18h   │   │
│  │ api_key                                                  [Reconectar] [⋯]     │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│  ┌─Visão─┬─Permissões─┬─Objetos─┬─Tools─┐                                              │
│  └───────┴────────────┴─────────┴───────┘                                              │
│                                                                                        │
│  Última atividade antes da falha:                                                      │
│  • 2026-04-29 14:21  ✓  purchase_completed                                             │
│  • 2026-04-29 14:21  ✓  customer_created                                               │
│  • 2026-04-29 14:22  ✕  401 — credenciais rejeitadas                                   │
│                                                                                        │
│  E-mail enviado pro owner da org em 2026-04-29 14:23                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Banner forte (Card pediu: "aviso muito forte")
- Mensagem específica por status: expired / revoked / error com texto diferente
- E-mail out-of-band (v1 mínimo) — backend dispara no IntegrationConnectionStatusChanged
  (depende do dev confirmar — Q5 do spec)
- Slack/SMS v1.5
```

---

## W15 — Tools globais (sidebar `Tools`)

Visão cross-conexão — vetor de execução da IA com governança própria. **Independente da tela de Integrações.**

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Studio · Awsales                                                       [PG ~ MambaCult]│
├────────────┬───────────────────────────────────────────────────────────────────────────┤
│            │                                                                           │
│ ▸ Visão    │  Tools                                                  [+ Nova Tool HTTP]│
│ ▼ Integraç.│  Ações que a IA pode invocar · cross-conexão · cross-provider             │
│   • Minhas │                                                                           │
│ ▼ Tools  ←│                                                                            │
│   • Todas  │  [Conexão ▼] [Categoria ▼] [Status ▼] [Risco ▼] [search]                  │
│   • Custom │                                                                           │
│ ▸ Otimizaç.│  ┌─────────────────────────────────────────────────────────────────────┐ │
│            │  │ Nome ↕                       │Origem │Conexão     │Cat │Risco│Exec  │ │
│            │  │─────────────────────────────────────────────────────────────────────│ │
│            │  │ buscar-produto-hotmart       │nativa │Loja Expr.  │read│ low │1.247 │ │
│            │  │ buscar-produto-hotmart       │nativa │JF Rocket   │read│ low │  324 │ │
│            │  │ criar-cupom                  │nativa │Loja Expr.  │write│med │    3 │ │
│            │  │   ↑ scope `write` não concedido                                       │ │
│            │  │ buscar-contato               │nativa │HubSpot Pro │read│ low │  432 │ │
│            │  │ buscar-restaurante           │custom │Gourmet API │write│high│14.230│ │
│            │  │ agendar-especialista         │custom │Loja Expr.  │write│med │   89 │ │
│            │  │ ...                                                                    │ │
│            │  └─────────────────────────────────────────────────────────────────────┘ │
│            │                                                                           │
│            │  Plano Pro · 5/20 tools custom · 16k execuções 30d                        │
│            │                                                                           │
└────────────┴───────────────────────────────────────────────────────────────────────────┘

OBS:
- Tools tem rota dedicada (D11) — não fica soterrada dentro de Integrações
- **Sem filtro de org** — visão é da org ativa (contexto global Studio)
- Filtros locais [Conexão / Categoria / Status / Risco] = atributos da própria tool, não org
- Mostra mesma tool nativa N vezes se há N conexões pro mesmo provider (1 linha por conexão)
- Origem: nativa (Provider seed-data) ou custom (criada pela org)
- Conexão: chip clicável que leva pro detalhe da conexão (W4/W5)
- Click numa linha abre drawer com detalhe + tab Telemetria + tab Auditoria (D12)
- Risco vem do backend (low/medium/high/restricted) — informativo
```

### W15-Drawer — Detalhe da Tool (D-TOOL7 — replicar cross-org pós Stress Test 2)

```
                          ┌────────────────────────────────────────────────────────┐
                          │  Tool: agendar-especialista                        ✕  │
                          ├────────────────────────────────────────────────────────┤
                          │                                                        │
                          │  ┌─Detalhe─┬─Telemetria─┬─Auditoria─┐                   │
                          │  └─────────┴────────────┴───────────┘                   │
                          │                                                        │
                          │  Action key   hotmart.loja-expressa.agendar-esp        │
                          │  Conexão-pai  🔥 Hotmart · Loja Expressa  →           │
                          │  Categoria    [write]    Risco  medium                │
                          │  Origem       custom (criada por PG em 2026-04-12)    │
                          │                                                        │
                          │  Status nesta conexão                                  │
                          │  [● Ativa]  ◯ Inativa                                 │
                          │                                                        │
                          │  ─────────────────────────────                         │
                          │                                                        │
                          │  Aplicar em todas as conexões deste provider           │
                          │  ▢ JF Rocket  · ▢ Loja Expressa (atual)  · ▢ Caixa P. │
                          │                          [Aplicar nas selecionadas]    │
                          │                                                        │
                          │  ─────────────────────────────                         │
                          │                                                        │
                          │  Replicar em outras orgs (super-admin)                 │
                          │  [Replicar em outras orgs Mamba] →                    │
                          │  ↑ abre modal análogo ao W11e-2 (Templates em massa)  │
                          │                                                        │
                          │  ─────────────────────────────                         │
                          │                                                        │
                          │            [Editar tool]      [Desativar]              │
                          └────────────────────────────────────────────────────────┘

OBS:
- Tab Detalhe (default): config + toggle local + bulk providers + replicate cross-org
- Tab Telemetria: execuções 7d/30d, latência p50/p95, error rate, **custo estimado** (Barnabé)
- Tab Auditoria: log de mudanças com user/timestamp/diff
- "Replicar em outras orgs" só aparece pra super-admin com >1 org sob conta-mãe
- Resolve G32 (D4 stress test 2) + G30 (assimetria com templates) + G33 (custo)
```

---

## W16 — "+ Nova Tool HTTP" (split-pane com teste obrigatório — D-TOOL6)

> **REVERSÃO Stress Test 2:** wireframe anterior era "página única com seções colapsáveis" (D-TOOL5). Substituído por split-pane com teste obrigatório. Pattern Retool/Make/Zapier/Postman. Cliente cria tool sabendo que funciona, não às cegas.

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  « Tools  /  Nova Tool HTTP — agendar-especialista (v2 · v1 ativa, 1.247 exec/30d)      │
│  Auth: 🔐 Herda da conexão Hotmart · Loja Expressa                       [Salvar rascunho]│
│──────────────────────────────────────────────────────────────────────────────────────────│
│                                       │                                                  │
│  CONFIG                                │  TESTE / PREVIEW                                 │
│                                       │                                                  │
│  ╭─Identificação─────────────────╮    │  Input simulado                                  │
│  │ Nome (display) *               │    │  ┌──────────────────────────────────────────┐  │
│  │ [agendar-especialista       ]  │    │  │ {                                          │  │
│  │ Action key * (imutável)        │    │  │   "lead_id": "lead_abc123",               │  │
│  │ [agendar-especialista       ]  │    │  │   "topic": "agendamento"                  │  │
│  │ Descrição (pra IA) *           │    │  │ }                                          │  │
│  │ ┌──────────────────────────┐  │    │  └──────────────────────────────────────────┘  │
│  │ │ Use quando lead pedir    │  │    │                            [▶ Run test]         │
│  │ │ agendamento... [12 lin]  │  │    │                                                  │
│  │ └──────────────────────────┘  │    │  Response                                        │
│  │ Categoria * [◉read ○write ○dst]│    │  ✓ 200 OK · 142ms                              │
│  ╰────────────────────────────────╯    │  ┌──────────────────────────────────────────┐  │
│                                       │  │ {                                          │  │
│  ╭─Endpoint──────────────────────╮     │  │   "data": [                              │  │
│  │ Método * [POST ▼]              │    │  │     {                                     │  │
│  │ URL * [api.norda.com/agenda]   │    │  │  ┌─ "name": "Maria S."  → mapear?     │  │
│  │           [⤓ Importar cURL]    │    │  │  ├─ "email": "..."     → mapear?     │  │
│  ╰────────────────────────────────╯    │  │  └─ "slots": [...]     → mapear?     │  │
│                                       │  │     }                                     │  │
│  ╭─⌃ Headers / Query / Body ─────╮    │  │   ]                                       │  │
│  ╰────────────────────────────────╯    │  │ }                                          │  │
│                                       │  └──────────────────────────────────────────┘  │
│  ╭─Mapeamento de resposta────────╮    │                                                  │
│  │ • especialista_nome → $.data[0]│    │  ✓ Teste passou — pode ativar                  │
│  │   .name                        │    │                                                  │
│  │ • horario_disponivel → $.data  │    │                                                  │
│  │   [0].slots[0]                 │    │                                                  │
│  │ [+ Adicionar mapeamento]       │    │                                                  │
│  ╰────────────────────────────────╯    │                                                  │
│                                       │                                                  │
│                                       │                                                  │
│  [Cancelar]                                          [Salvar rascunho]   [Activate ✓]   │
└──────────────────────────────────────────────────────────────────────────────────────────┘

OBS — split-pane com teste obrigatório (D-TOOL6):
- **Esquerda (config):** scroll vertical de seções (Identificação · Endpoint · Headers/Body · Mapeamento)
- **Direita (teste):** input simulado · botão `[▶ Run test]` · raw response · drag-to-map nos campos
- **Salvar rascunho:** sem teste obrigatório (`status=draft`)
- **Activate:** **exige teste verde** (✓ 200) — pattern Zapier "no save without test pass"
- **Auto-mapping vira fluxo principal:** roda teste → response volta → clica em campos do response → mapping populado automaticamente
- **Versão visível no header:** "v2 · v1 ativa, 1.247 exec/30d" — protege contra quebrar IA em produção
- **Activate cria nova versão**, não overwrite — versão antiga continua em uso até cliente confirmar deprecação
- **Resolve G21 P0:** cliente cria tool sabendo que funciona, IA não falha em produção
- **cURL import** mantido (Barnabé já usava no neo)
- Auth herda da conexão-pai por default; toggle "auth override" colapsado pra casos custom (caso A5)
```

---

## W17 — Modal "Edição não salva"

```
              ┌──────────────────────────────────────────────────────────┐
              │  ⚠️  Você tem alterações não salvas                     │
              ├──────────────────────────────────────────────────────────┤
              │                                                          │
              │  Tela: Webhook config · Hotmart Loja Expressa            │
              │  Ação que você tentou: trocar org pra "JF Rocket"        │
              │                                                          │
              │  Se você trocar agora, suas alterações em                │
              │  "URL do webhook" e "schema" serão perdidas.             │
              │                                                          │
              │      [Salvar e trocar]  [Descartar e trocar]  [Cancelar] │
              │                                                          │
              └──────────────────────────────────────────────────────────┘

OBS:
- UX puro (D16) — backend não cuida disso
- Aplica-se a qualquer form com dirty state
- Org switcher tem dot vermelho (W1) quando há dirty state em qualquer aba
```

---

## W18 — Migração Legacy (D-IA8 — pós Stress Test 2)

> Cobre 100% dos clientes Mamba atuais que têm conexões no app legacy. Banner persistente em W1 + tela dedicada com listagem + ações por linha.

### W1 Banner — quando há conexões legacy não-migradas

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Integrações · 9/15 conexões                       [+ Adicionar integração]           │
│                                                                                        │
│  ╔══════════════════════════════════════════════════════════════════════════════════╗ │
│  ║  ℹ️  Você tem 12 conexões na versão anterior do AwSales.                         ║ │
│  ║                                                       [Ver e migrar →]  [Ignorar]║ │
│  ╚══════════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                        │
│  ... grid de conexões já-migradas ...                                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### W18 — Tela "Migração de conexões legacy"

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  « Integrações  /  Migração de conexões legacy                                         │
│                                                                                        │
│  Você tem 12 conexões na versão anterior do AwSales.                                   │
│  Migrar mantém URL de webhook, histórico de eventos e templates.                       │
│                                                                                        │
│  [Migrar todas (8 automáticas + 4 que precisam re-auth)]  [Pular tudo]                 │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────┐     │
│  │ Provider     │ Nome legacy            │ Tipo de migração       │ Ação        │     │
│  │──────────────┼────────────────────────┼────────────────────────┼─────────────│     │
│  │ 🔥 Hotmart   │ JF Rocket              │ Auto (client_creds)    │ [Migrar]    │     │
│  │ 🔶 HubSpot   │ Conexão importada      │ Re-autorizar (OAuth)   │ [Re-auth]   │     │
│  │ 🟪 Hubla     │ Loja Filial            │ URL preservada (alias) │ [Migrar]    │     │
│  │ 🛒 Stripe    │ Stripe Prod            │ Auto (api_key)         │ ⚠ Falhou    │     │
│  │              │                        │                        │ [Tentar]    │     │
│  │ 💬 WABA      │ Jota Fiuza Marco Zero  │ ✓ Migrada              │ [Ver →]     │     │
│  │ ...                                                                          │     │
│  └──────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                        │
│  ⓘ Tipos de migração:                                                                 │
│  • Auto — backend transfere tokens silenciosamente (Hotmart/Kiwify/api_key)           │
│  • Re-autorizar — OAuth muda escopos, cliente clica e re-autoriza no provider          │
│  • URL preservada — webhook URL legacy continua funcionando via aliasing backend       │
│                                                                                        │
│  Migração mantém connectionId interno estável — campanhas legacy continuam OK.         │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

OBS:
- Resolve G23 P0 (100% dos clientes Mamba atuais)
- Banner persistente em W1 até cliente migrar todas OU clicar "Ignorar" (recuperável em settings)
- Webhook URL preservada via aliasing backend (cliente Hubla NÃO recola URL no provider externo)
- OAuth providers podem precisar re-auth se escopos mudaram entre legacy e novo
- Status "Falhou" tem botão tentar novamente + link pra contato suporte se persistir
- Depende de Q7 (endpoint backend pra detectar legacy connections do org)
```

---

## W20 — Modal "Escolher integração" (Opção A+ — pós Stress Test 3)

> **Contexto.** Versão anterior tinha botão "+ Nova tool personalizada" na tela Tools (W15) que criava implicitamente uma "Integração Personalizada" + tool dentro. Naming esquisito: o nome do botão sugere "criar 1 tool", mas estava criando 2 entidades.
>
> **Opção A+ (escolhida pelo PG após Stress Test 3 cirúrgico):** ao clicar `+ Nova ação personalizada` na tela "Ações da IA", abre modal pra cliente escolher entre:
> 1. **Integrações nativas conectadas** (Hotmart, HubSpot, Pipedrive, etc.) — ação herda credencial OAuth/API key existente
> 2. **Integrações personalizadas existentes** (Gourmet API, etc.)
> 3. **+ Criar nova integração personalizada** — caso novo (sem provider)
>
> **Diferença A → A+:** A pura listava só personalizadas. A+ lista também nativas. **Resolve caso Pipedrive Nord Academy (insight José/Barnabé na call):** ação custom usando OAuth da nativa, sem duplicação de credencial. Pattern Retool/Salesforce/HubSpot.
>
> **Caminho alternativo (continua existindo):** dentro de uma integração específica (`Integrações > X > tab Ações`), o botão `+ Nova ação personalizada` funciona direto sem passar por esse modal — o contexto já é a integração-pai.

### W20 — Modal acionado pelo botão "+ Nova ação personalizada" do W15

```
                ┌───────────────────────────────────────────────────────────┐
                │  Em qual integração essa ação vai existir?          ✕    │
                ├───────────────────────────────────────────────────────────┤
                │                                                           │
                │  Toda ação da IA precisa pertencer a uma integração       │
                │  (ela herda a credencial). Escolha uma das suas integra-  │
                │  ções conectadas ou crie uma nova personalizada.          │
                │                                                           │
                │  ─────────────────────────────────────────────────        │
                │                                                           │
                │  Suas integrações nativas (reusam credencial existente)   │
                │  ┌─────────────────────────────────────────────────────┐  │
                │  │ 🔥 Hotmart · JF Rocket                              │  │
                │  │    OAuth (cc) · nativa · herda credencial       ▸   │  │
                │  ├─────────────────────────────────────────────────────┤  │
                │  │ 🔥 Hotmart · Loja Expressa                          │  │
                │  │    OAuth (cc) · nativa · herda credencial       ▸   │  │
                │  ├─────────────────────────────────────────────────────┤  │
                │  │ 🔶 HubSpot Prod                                     │  │
                │  │    OAuth · nativa · herda credencial            ▸   │  │
                │  ├─────────────────────────────────────────────────────┤  │
                │  │ 🔧 Pipedrive · Nord Academy  ← caso José/Barnabé    │  │
                │  │    OAuth · nativa · herda credencial            ▸   │  │
                │  └─────────────────────────────────────────────────────┘  │
                │                                                           │
                │  ─────────────────────────────────────────────────        │
                │                                                           │
                │  Suas integrações personalizadas                          │
                │  ┌─────────────────────────────────────────────────────┐  │
                │  │ 🌐 Gourmet API                                      │  │
                │  │    Bearer · personalizada · 2 ações · últ. 14m  ▸   │  │
                │  ├─────────────────────────────────────────────────────┤  │
                │  │ 🌐 Tools Customizadas                               │  │
                │  │    API Key · personalizada · 1 ação · últ. 1d   ▸   │  │
                │  └─────────────────────────────────────────────────────┘  │
                │                                                           │
                │  ─────────────────────────────────────────────────        │
                │                                                           │
                │  ┌─────────────────────────────────────────────────────┐  │
                │  │  +  Criar nova integração personalizada         →   │  │
                │  │     Pra integrar com uma API que não está no        │  │
                │  │     catálogo (Gourmet, Sheets externa, etc.)        │  │
                │  └─────────────────────────────────────────────────────┘  │
                │                                                           │
                │                                          [Cancelar]       │
                └───────────────────────────────────────────────────────────┘
```

**Comportamento:**

- **Cliente escolhe integração nativa** (ex: Pipedrive Nord) → modal fecha → vai direto pro W16 (split-pane Nova Ação) com a conexão-pai preenchida e auth OAuth herdada da nativa **(resolve caso Pipedrive Nord — sem duplicação)**.
- **Cliente escolhe integração personalizada** (ex: Gourmet API) → modal fecha → vai pro W16 com a personalizada preenchida.
- **Cliente escolhe "+ Criar nova integração personalizada"** → modal fecha → abre drawer W3b (Integração Customizada) → após criar, vai pro W16 pré-preenchido.
- **Cliente cancela** → volta pra tela Ações da IA (W15) sem mudar nada.

### Atualização no W15 — botão dispara o modal + renaming

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Studio · Awsales                                                                       │
├────────────┬───────────────────────────────────────────────────────────────────────────┤
│ ▸ Integraç │  Ações da IA       9 disponíveis · 3 personalizadas    [+ Nova ação personalizada]│
│ ▸ Canais   │  O que sua IA pode fazer · cross-conexão · cross-provider                 │
│ ▼ Ações IA │       ↑ ao clicar, abre W20 (modal "escolher integração")                 │
│            │                                                                           │
│            │  [Conexão ▼] [Categoria ▼] [Status ▼] [Risco ▼] [search]                  │
│            │                                                                           │
│            │  ┌─────────────────────────────────────────────────────────────────────┐ │
│            │  │ Nome ↕                       │Origem │Conexão     │Cat │Risco│Exec  │ │
│            │  │─────────────────────────────────────────────────────────────────────│ │
│            │  │ buscar-restaurante           │custom │Gourmet API │read│high│14.230│ │
│            │  │ ...                                                                  │ │
│            │  └─────────────────────────────────────────────────────────────────────┘ │
└────────────┴───────────────────────────────────────────────────────────────────────────┘
```

**OBS — Opção A+ (PG escolheu pós Stress Test 3):**

- Modal força explicitamente a hierarquia "ação pertence a integração". Fim da confusão semântica do botão.
- **Modal lista nativas + personalizadas + criar nova** (Pattern Retool/Salesforce/HubSpot — Stress Test 3 confirmou).
- **Resolve caso Pipedrive Nord Academy** (insight José/Barnabé na call): cliente cria ação custom usando OAuth da Pipedrive nativa, sem duplicação.
- 2 cliques a mais que fluxo anterior (modal + escolher) — mas honesto sobre o modelo.
- "Criar nova integração" é o último item do modal — não fica no header como CTA primário.
- Cliente sem nenhuma integração conectada vê empty state no modal com CTA principal "Conecte sua primeira integração".

**Renaming "E" aplicado:**
- Sidebar: `Tools` → **`Ações da IA`** (vocabulário cliente final, próximo de "function calling" do GPT)
- Tab dentro da conexão (W8): `Tools` → **`Ações`**
- Botão: `+ Nova Tool HTTP` → **`+ Nova ação personalizada`**
- Termo técnico **`Tool`** mantido em W16 (split-pane) e em backend/LangGraph (rastreabilidade)

**Caminho 2 (sem modal):** dentro de `Integrações > <provider> > tab Ações` (W8), botão `+ Nova ação personalizada` continua direto — contexto já é a integração-pai. Caminho mais curto pro builder que já está dentro de integração específica.

---

| # | Tela | Substitui / Origem |
|---|---|---|
| W1 | Minhas conexões (grid) | `app/integrations` + `neo/integrations` |
| W2 | Empty state | (novo — D-IA7 wizard pós Stress Test 2 deve substituir) |
| W3 | Modal catálogo + 2 affordances primárias no header (D-ADD4) | `neo` modal "Escolha uma integração" |
| **W3a** | **Drawer "+ Webhook Customizado"** | (novo — Stress Test 2 — resolve Q1) |
| **W3b** | **Drawer "+ Integração Customizada"** | (novo — Stress Test 2 — resolve Q2) |
| W4 | Detalhe conexão (1 conexão · Standard) | `app` "Gerenciar Hotmart" |
| W4-Simple | Variante automática pro caso Card | (novo — D-DET2 densidade adaptativa) |
| **W4-Onboarding** | **Banner pós-criação com URL+secret+checklist+`Verificar agora`** (sem test event sintético — webhooks vêm do provider) | (novo — Stress Test 2 — D-EST4 ajustada pós-feedback PG) |
| **W19** | **Tela Canais (rota irmã)** — WhatsApp + IG/Messenger placeholder | (novo — pós-feedback PG — D-IA9) |
| **W20** | **Modal "Escolher integração"** acionado pelo `+ Nova tool` da tela Tools (Opção A) | (novo — pós-feedback semântica PG) |
| W5 | Detalhe conexão (N conexões) | (novo · pattern WABA) |
| W6 | Tab Permissões | (novo — pedido Daniel) |
| W7 | Tab Webhooks | (novo unificado) |
| W8 | Tab Tools (subset por conexão) | `neo` "Gerenciar Tools" |
| W11 | WhatsApp — lista de WABAs (canal especial) | `app/integrations/whatsapp` |
| W11b | Detalhe da WABA — tab Conta | (novo — vocabulário Messaging domain) |
| **W11b-Simple** | **Modo Simple-WhatsApp (Card pareto)** | (novo — Stress Test 2 — D-WA4) |
| W11c | Detalhe da WABA — tab Telefones | mantém pattern atual + refinamentos |
| W11d | Detalhe da WABA — tab Templates | mantém pattern atual + sort/filter |
| W11e | Atalhos cross-WABA (Vars fixas + Templates em massa) | mantém features atuais |
| W12 | Estado de erro | (novo — pedido Card) |
| W13 | Drawer Conectar (4 variantes auto por authType) | `app` modal "Integrar Hotmart" |
| W15 | Tools globais (sidebar) | `neo/integrations` (Tools tab) |
| **W15-Drawer** | **Drawer detalhe Tool com toggle + bulk + replicate cross-org (D-TOOL7)** | (novo — Stress Test 2) |
| **W16** | **Nova Tool HTTP — split-pane com teste obrigatório (D-TOOL6)** | reverte D-TOOL5 anterior · pattern Retool/Make |
| W17 | Modal "Edição não salva" | (novo) |
| **W18** | **Migração Legacy (banner W1 + tela dedicada)** | (novo — Stress Test 2 — D-IA8) |

**Mudanças do Stress Test 2 (2026-04-30):**

✨ Adicionados:
- **W3a / W3b** — affordances "+ Webhook Customizado" e "+ Integração Customizada" no header W3 (resolve Q1, Q2)
- **W4-Onboarding** — banner pós-criação com URL+secret+checklist (D-EST4) — ajustado pós-feedback PG: removido "Enviar evento de teste" (não simulamos webhook do provider), substituído por "Verificar agora" (refresh)
- **W11b-Simple** — modo Simple-WhatsApp pra Card (D-WA4)
- **W15-Drawer** — drawer da tool com toggle local + bulk + replicate cross-org (D-TOOL7)
- **W18** — Migração Legacy (D-IA8)

🔁 Revertido / refeito:
- **W16** — de "página única colapsável" (D-TOOL5) pra split-pane com teste obrigatório (D-TOOL6). Pattern Retool/Make/Zapier — cliente cria tool sabendo que funciona.

**Wireframes que sumiram (rascunho anterior, não fazem sentido):**
- W6b modal scope reduction → backend já trata via reauth flow; UX só mostra estado
- W8b modal multi-org isolation → backend não tem multi-org connection (cada org tem a sua)
- W12b "Eventos pendentes" → política de replay/idempotência é backend, fora desta tela
