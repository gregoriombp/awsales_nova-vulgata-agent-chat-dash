# Spec — Tela Unificada de Integrações (Studio)

> **Owner:** PG · Greg
> **Data:** 2026-04-30 (revisado pós-stress-test e pós-leitura dos contratos do dev)
> **Escopo:** **Apenas UX da tela.** Nada de modelagem de dados, lifecycle de token, idempotência, circuit breaker, refresh policy — tudo isso é responsabilidade do **Integration Hub** já documentado em `awsales-domains-contracts`.
> **Insumos:** [transcription.md](transcription.md) (call PG + José + Greg + Deds + Daniel + Barnabé + Card + Paulo) · [prints/](prints/) · [stress-test-2026-04-30.md](stress-test-2026-04-30.md) · contratos do dev em `/apps/awsales-domains-contracts/`.

---

## 1. Vocabulário (alinhado com Integration Hub)

A tela usa **exatamente** os termos que o dev modelou. Nada de inventar nome.

| Termo | Onde mora no backend | O que significa na tela |
|---|---|---|
| **Provider** | [IntegrationProvider](../../apps/awsales-domains-contracts/data-modeling/integration-hub/integration-provider.mdx) (seed-data) | Plataforma externa catalogada (Hotmart, HubSpot, Magalu...). Aparece no catálogo "+ Adicionar". |
| **Conexão** (Connection) | [IntegrationConnection](../../apps/awsales-domains-contracts/data-modeling/integration-hub/integration-connection.mdx) | Instância autenticada do provider numa org. Tem nome dado pelo usuário. **Multi-conta = N conexões pro mesmo provider** (UNIQUE por `name`). |
| **Objeto** | [IntegrationObject](../../apps/awsales-domains-contracts/data-modeling/integration-hub/integration-object.mdx) | Item importado do provider — Produto, Formulário, Reunião, Área de Membros, Deal de CRM. Tem hierarquia raiz↔ofertas (`parentId`). |
| **Tool / Action** | [IntegrationToolAction](../../apps/awsales-domains-contracts/data-modeling/integration-hub/integration-tool-action.mdx) | Ação que a IA pode invocar. Pode ser **global do provider** (organizationId nulo) ou **customizada** (organizationId+connectionId preenchidos). |
| **Categoria** | `Provider.category` | 7 valores: `checkout`, `crm`, `form`, `meeting`, `members_area`, `marketplace`, `action`. **Define o agrupamento visual no catálogo.** |
| **Tipo de auth** | `Provider.authType` | 4 valores: `oauth2_authorization_code`, `oauth2_client_credentials`, `api_key`, `webhook_only`. **Define o fluxo de criação da conexão.** |
| **Status da conexão** | `Connection.status` | `pending_auth` · `active` · `expired` · `revoked` · `error`. Aparece como chip no header da conexão. |
| **Saúde** | `Connection.lastHealthStatus` | `healthy` · `degraded` · `unreachable`. Usado pra agregar indicador visual no card do grid. |

**Termo que NÃO uso mais:** "Conta" (substituído por "Conexão"), "Integração Personalizada" (depende da decisão Q3 abaixo), "Evento Customizado" (idem), "kind" (substituído por `authType`).

---

## 2. O que esta tela faz (em 1 frase)

> **Operador conecta plataformas externas, gerencia as conexões dela, vê o que cada uma trouxe (objetos, eventos, tools), e configura o que a IA pode fazer com elas.**

Substitui hoje:
- `app.awsales.io/integrations` (catálogo + gerenciar)
- `app.awsales.io/checkout/checkout-personalizado` (decisão pendente — ver Q1)
- `neo.awsales.io/integrations` (Tools + Habilidades Personalizadas)

---

## 3. Mapa de telas

```
Studio
└── Integrações                              ← rota principal
    ├── (default) Minhas conexões            ← W1 — grid agrupado por provider
    ├── + Adicionar integração               ← W3 — modal de catálogo
    │
    ├── /<providerId>                        ← W4/W5 — detalhe da conexão (1 ou N contas)
    │   └── Tabs: Visão · Permissões ·
    │            Objetos · Webhooks · Tools
    │
    └── /whatsapp                            ← canal complexo, layout próprio (§8)
        ├── (atalho) Variáveis fixas         ← W11e
        ├── (atalho) Templates em massa      ← W11e
        └── /<wabaId>                        ← W11b — tabs Conta / Telefones / Templates

Studio sidebar
└── Tools (rota própria)                     ← W15 — visão cross-conexão de tools
```

**Decisão de IA:** Tools tem rota dedicada na sidebar (não só dentro de conexão), porque é vetor de execução da IA com governança própria. Detalhes em §7. **WhatsApp tem layout próprio (§8)** porque a hierarquia 3-níveis não cabe no pattern de tabs simples do W4.

---

## 4. W1 — Tela principal "Minhas conexões"

### O que aparece

| Elemento | Conteúdo | Vem de |
|---|---|---|
| **Header** | Título "Integrações" + botão `+ Adicionar integração` + indicador `9/15 conexões` (quota do plano) | `GET /providers` (com `connections[]` embutidos) |
| **Filtros** | Busca por nome · toggle grid/lista (mantém padrão neo). **Sem filtro de org local** — troca de org é contexto global no Studio (sidebar/header), não filtro de tela. | — |
| **Grid de cards** | 1 card = 1 provider conectado. Múltiplas conexões do mesmo provider ficam **agrupadas dentro do card**. | `providers[].connections[]` |

### Conteúdo do card (1 provider conectado)

```
[logo]  Hotmart                                    ●  3 conexões
        checkout                                   última atividade 2m
        ─────────────────────────────────────────────
        JF Rocket  ●  · Loja Expressa  ●  · Caixa Preta  ▲
        Eventos hoje (todas): 312 · Top objeto: Marco Zero
```

- **Logo** = `provider.logoUrl`
- **Nome** = `provider.name`
- **Categoria como subtítulo** = `provider.category` (chip discreto)
- **Indicador de saúde agregado** = pior `lastHealthStatus` entre conexões + contagem
- **Linha das conexões** = nomes dados pelo usuário (`connection.name`) com chip de status individual
- **Stat agregada** = total de webhooks/dia somando as N conexões (mitigação Deds — ver §8)
- **Sem descrição genérica** — Paulo: "será que esses descritivos são necessários? acaba virando um bagulho repetitivo."

### Empty state

Copy curto + CTA `+ Adicionar integração` + 3 sugestões pinadas (WhatsApp, Hotmart, HubSpot).

### Decisões de UX

- **D1** Múltiplas conexões agrupadas dentro do card do provider (consenso Card+Paulo+José+PG na call; pattern WABA atual).
- **D2** Card sem descrição genérica (Paulo).
- **D3** Card de provider multi-conexão tem 1 linha de stat agregada — mitigação parcial pro Deds (visão unificada cross-conexão fica v2).
- **D4** Quota de plano visível no header (`9/15 conexões`). Badge warning em 80%, bloqueio em 100%.

---

## 5. W3 — Modal "+ Adicionar integração"

### Layout

Modal com **2 affordances primárias no header** + filtro por categoria + grid de catálogo.

**Header do modal (D-ADD4 — pós Stress Test 2):**

```
[+ Webhook customizado]   [+ Integração Customizada]
```

- **`+ Webhook customizado`** → drawer W13 variante webhook_only **sem provider catalogado**. Cliente dá nome + (opcional) descrição do que é, gera URL + secret. Cobre o caso "checkout próprio sem marca conhecida" (substitui `app/checkout/checkout-personalizado` do legacy). Ver §13.
- **`+ Integração Customizada`** → drawer W13 variante api_key/Bearer **sem provider catalogado**. Cliente dá nome + escolhe tipo de auth + cola credencial. Após criar, vai pro W4 e cria tool dentro (W16). Cobre o caso Barnabé/Gourmet (1 tool em API sem provider conhecido). Ver §14.

**Filtro de categoria** abaixo das affordances. Os 7 valores de `provider.category`:

```
[Todos] [Checkout] [CRM] [Forms] [Meetings] [Member areas] [Marketplaces] [Actions]
```

Grid de cards do catálogo, cada um mostrando:
- Logo, nome, badge da categoria
- Badge discreta do `authType` (`OAuth` / `API key` / `Webhook only`)
- CTA `Conectar →`
- Greyed se quota do plano atingida

### Pra onde vai cada `authType` ao clicar Conectar

Esses fluxos são **decididos pelo backend** ([create-connection.mdx](../../apps/awsales-domains-contracts/studio-api/integrations/create-connection.mdx)) — eu só desenho o que aparece pra usuário:

| `authType` | Fluxo de criação | Tela do drawer |
|---|---|---|
| `oauth2_authorization_code` | Usuário dá nome → POST cria conexão `pending_auth` + retorna `authorizationUrl` → redireciona pro provider → callback → volta `active` | W13 — drawer com nome + lista de escopos que vão ser pedidos |
| `oauth2_client_credentials` | Usuário dá nome + cola `clientId`/`clientSecret` → POST valida e ativa | W13 variante — mesmo drawer com 2 inputs extras |
| `api_key` | Usuário dá nome + cola `apiKey` → POST testa e ativa | W13 variante — drawer com 1 input extra |
| `webhook_only` | Usuário só dá nome → POST cria `active` e retorna `webhookUrl` + `webhookSecret` | W13 variante — drawer mostra URL gerada e secret pra copiar |

**Não há "tela diferente" por tipo** — é o mesmo drawer com campos condicionais. Reduz a 4 variações pequenas em vez de 4 fluxos separados.

### Decisões de UX

- **D5** Filtro por categoria no topo do catálogo (não 4 abas inventadas como tinha no rascunho anterior). As 7 categorias do backend resolvem agrupamento natural.
- **D6** Pra `webhook_only`: a URL e o secret aparecem **uma vez** após criar, com botão copiar e instruções claras ("cole essa URL no seu provider"). Se cliente perde, secret é não-recuperável — backend só retorna na criação.

---

## 6. W4/W5 — Detalhe da conexão

### Hierarquia visual

- **Header da conexão**: logo do provider · nome dado pelo usuário · chip de status (`active`/`pending_auth`/`expired`/`revoked`/`error`) · timestamp último evento · ações (`Reconectar` / `Testar` / `Desassociar`)
- **Tabs** (condicionais ao `authType` e `capabilities` do provider — ver tabela abaixo)
- **Sidebar de conexões** (só aparece quando >1 conexão do mesmo provider — pattern WABA)

### Quais tabs aparecem por `authType` × `capabilities`

| `authType` | `supportsApiPull` | Tabs renderizadas |
|---|---|---|
| `oauth2_authorization_code` | true | Visão · Permissões · Objetos · Webhooks · Tools |
| `oauth2_client_credentials` | true | Visão · Permissões · Objetos · Webhooks · Tools |
| `api_key` | true | Visão · Permissões (read-only) · Objetos · Tools (sem Webhooks visíveis se `supportsWebhook=false`) |
| `webhook_only` | false | Visão · Webhooks (com URL/secret + log de eventos recebidos) |
| qualquer | + canal (WABA/IG/Messenger) | Layout próprio (W11) |

**Regra:** tabs irrelevantes não aparecem em vazio. UX condicional, não tab fantasma.

### Tab "Visão"

| Campo | Vem de |
|---|---|
| Status (chip colorido) | `connection.status` |
| Saúde | `connection.lastHealthStatus` + `lastHealthCheckAt` |
| Último evento recebido | `connection.lastWebhookReceivedAt` |
| Último evento de exemplo | parte do banner de onboarding (D-EST4) — ver §6.1.1 |
| Ações | `[Reconectar]` (`reauthorize`) · `(Testar)` (`test`) · `(Desassociar)` (`DELETE`) |

### 6.1.1 Banner de onboarding pós-criação (D-EST4)

> Adicionado após Stress Test 2. Resolve gap recorrente em todo provider OAuth+webhook (Hotmart, HubSpot, RD, Pipedrive, Calendly...).

**Aciona quando:** `connection.lastWebhookReceivedAt = null` E conexão tem `<24h`.

**Conteúdo:**
- URL do webhook + secret prominentes (copy-button grande)
- Checklist específico do provider (texto vem do seed-data `provider.onboardingChecklist`):
  - Ex Hotmart: "1. Cole essa URL em **Hotmart > Ferramentas > API > Webhook**" + "2. Marque eventos: `purchase_completed`, `subscription_*`" + "3. Salve e faça uma compra teste"
  - Ex HubSpot: "1. Configure webhook em **Settings > Integrations > Webhooks**" + ...
- Botão `[Enviar evento de teste]` que dispara payload sintético no inbound (flag `test=true`)
- Status ao vivo: "Aguardando primeiro evento real..." → "Recebido em X" quando chega
- Banner some quando primeiro webhook real chega

**Pra `oauth2_*` providers que recebem webhook via OAuth scope automático** (HubSpot, etc.): banner skip a parte "cole URL" (não precisa) e mostra só checklist + test event.

### Tab "Permissões"

- Para `oauth2_*`: lista de escopos concedidos (chips read/write/recv) + CTA `Reconectar com mais escopos`
- Para `api_key`: chip "API key fornecida" + dot pra mascarar/copiar
- Para `webhook_only`: tab não aparece

### Tab "Objetos"

Lista paginada de [IntegrationObject](../../apps/awsales-domains-contracts/data-modeling/integration-hub/integration-object.mdx) dessa conexão.

- **Filtro por `sourceType`** no topo: Produtos · Formulários · Reuniões · Areas de membros · Deals
- Hierarquia raiz/ofertas via expandir (`parentId`)
- **Colunas ordenáveis e filtráveis** — Nome · ID externo · Tipo · Preço (se aplicável) · Importado em
- Campo de busca + ID copiável (mantém o que já tem hoje no app)

### Tab "Webhooks"

- Para providers com `supportsWebhook`: URL do webhook + secret (mascarado, copy-button) + lista dos últimos eventos recebidos com timestamp e status HTTP retornado.
- Eventos suportados pelo provider (`GET /:id/event-types`) listados como chips informativos.

### Tab "Tools"

Lista de [IntegrationToolAction](../../apps/awsales-domains-contracts/data-modeling/integration-hub/integration-tool-action.mdx) disponíveis pra essa conexão. Detalhe no §7 abaixo (Tools tem governança própria).

### Densidade adaptativa (3 modos automáticos)

A tela escolhe um dos 3 modos sem o usuário perceber, pra não regredir o caso simples nem limitar o power user:

| Modo | Aciona quando | Layout |
|---|---|---|
| **Simple** | 1 conexão · 0 tool custom · provider não-canal | Scroll vertical único, sem tabs. Visão + Objetos visíveis abaixo da dobra. Reproduz a UX atual do app que Card validou. |
| **Standard** (default) | >0 tool custom OU >1 conexão | Tabs horizontais (descritas acima). |
| **Power** | super-admin OU >5 conexões totais OU role `tools:write` | Standard + deep-link copyable + ordenação/filtro em todas as tabelas + dirty-state guard ativo. |

### Decisões de UX

- **D7** Tabs são condicionais ao `authType` e `capabilities`. Tab vazia = tab oculta.
- **D8** Stats têm affordance: toda coluna numérica é ordenável (`↕`) e filtrável.
- **D9** 3 modos de densidade automáticos. Card simples não regride; power user ganha filtros/deep-link.
- **D10** Sidebar lateral de conexões só aparece quando >1 conexão (pattern WABA).

---

## 7. W15 — Tools (sidebar dedicada)

Tools são vetor de execução da IA. Têm visão própria por **3 razões de UX**:

1. Cliente com 5+ conexões perde rastreio se Tools só vivem dentro de cada conexão.
2. Tools custom podem rodar em cima de qualquer provider — agrupar por provider esconde cross-cutting.
3. A IA descobre tools globalmente (todas as conexões da org), então o "lugar mental" delas é cross-conexão.

### Conteúdo

```
Studio · Tools                                       [+ Nova Tool HTTP]

Filtros: [Conexão ▼] [Categoria ▼] [Status ▼] [Risco ▼] [search]

Coluna 1: Tool name (display) e action key
Coluna 2: Conexão a que pertence (chip)
Coluna 3: Categoria (read/search/write/post_sale/support/sync/mutation)
Coluna 4: Risco (low/medium/high/restricted) — chip colorido
Coluna 5: Status (draft/active/deprecated/disabled/archived)
Coluna 6: Execuções 30d
```

Click numa linha → drawer lateral com detalhe + tab Telemetria + tab Auditoria.

### Tipos de tool que aparecem

| Origem | `Tool.organizationId` | `Tool.connectionId` |
|---|---|---|
| **Nativa do provider** (vem com Hotmart, HubSpot, etc.) | `null` | `null` ou específica |
| **Custom da org** (criada pelo cliente) | preenchido | preenchido |

A tela mostra ambas com chip diferente (`nativa` / `custom`).

### "+ Nova Tool HTTP"

Cria uma `IntegrationToolAction` `custom` (organizationId+connectionId preenchidos). UI pergunta **a qual conexão a tool pertence** — pode ser qualquer conexão existente da org (incluindo nativas, herda credencial), OU "Sem conexão específica" (caso Barnabé/Gourmet — ver Q2 abaixo, depende de decisão do dev).

Form:
- Nome (display)
- Action key (slug imutável — ajuda pra rastreio mesmo se renomear)
- Conexão-pai (dropdown)
- Categoria (radio: read/write/destructive simplificado pro user; backend tem 7 valores, telemos pra 3 visíveis)
- Risco (calculado a partir da categoria — ou explícito)
- Endpoint (método + URL)
- Headers / Query / Body
- Mapeamento de resposta

Tudo numa página única com seções colapsáveis (Barnabé reclamou de "três telinhas pequenas").

### Decisões de UX

- **D11** Tools têm rota dedicada na sidebar (não só dentro da conexão).
- **D12** Tabs internas em Tool: Detalhe · Telemetria · Auditoria.
- **D13** Categoria reduzida para 3 visíveis (read / write / destructive) — backend mapeia pros 7 valores reais. Reduz carga cognitiva.
- **D14** Tool nativa tem toggle on/off por conexão (cliente decide se IA pode usar). Mudança é **propagação responsabilidade do backend** (não desenho aqui).

### 7.1. Drawer de detalhe da Tool (D-TOOL7 — replicar cross-org)

Click numa linha do W15 abre drawer lateral com:

**Tab Detalhe:**
- Nome (display) + action key + descrição
- Conexão-pai com chip clicável (vai pra W4)
- Categoria (read/write/destructive — D-TOOL3) com chip colorido
- **Toggle "Esta conexão"** — ativa/desativa só nesta conexão (mesmo do W8)
- **Bulk action: `[Aplicar em todas as N conexões deste provider]`** com checkbox+confirmação modal — resolve "tools nativas duplicadas pra cada conexão" (G32)
- Pra tools custom: `[Replicar em outras orgs]` (D-TOOL7 — visível só pra super-admin) → modal análogo ao W11e-2 (Templates em massa) com multi-select de orgs sob a conta-mãe

**Tab Telemetria:**
- Execuções 7d/30d
- Latência p50/p95
- Error rate
- **Custo estimado** (provider externo + tokens LLM) — resolve dor do Barnabé ("custo é caro")

**Tab Auditoria:**
- Log de mudanças (toggle on/off, edição, replicação) com `user_id + timestamp + diff`

### 7.2. Tabela do W15 — checkbox de status visível

Coluna "Estado" mostra: ● disponível · ▲ scope insuficiente · ◐ provider pending. Click direto na linha (sem abrir drawer) deveria ser configurável — feedback de Greg em validação. Default: click abre drawer, ação acontece lá.

---

## 8. Canal WhatsApp (WABA) — caso especial

WhatsApp é um canal de complexidade própria que não cabe no pattern de tabs do W4. Ele tem **3 níveis aninhados** (WABA → telefones → templates), tem features que **transcendem uma WABA específica** (variáveis fixas globais, templates em massa cross-WABA), e tem **status que se sobrepõem** (status interno `ChannelAccount` × revisão Meta × qualidade do número × tier de mensagens).

### 8.1. Boundary com o backend (importante)

WhatsApp **não é** Integration Hub. **É domínio Messaging** ([channels.mdx](../../apps/awsales-domains-contracts/domain/messaging/channels.mdx)).

Vocabulário do dev pra essa tela:

| Tela mostra | Backend tem | O que é |
|---|---|---|
| **WABA** ("conta") | [`ChannelAccount`](../../apps/awsales-domains-contracts/data-modeling/messaging/channel-account.mdx) | Conta Meta Business autorizada — tem `externalAccountId`, `businessPortfolioId`, status, qualityRating |
| **Telefone** ("número") | [`ChannelEndpoint`](../../apps/awsales-domains-contracts/data-modeling/messaging/channel-endpoint.mdx) | Endpoint endereçável — `address`=número, `externalEndpointId`=Meta Phone Number ID, `displayName`, `capabilities` (tier/limite) |
| **Template** | [`MessageTemplateGroup`](../../apps/awsales-domains-contracts/data-modeling/messaging/message-template-group.mdx) (chave) + [`MessageTemplate`](../../apps/awsales-domains-contracts/data-modeling/messaging/message-template.mdx) (versão) | Template aprovado pra envio outbound |

Pro **operador** continua sendo "WABA / Conta WhatsApp", "telefone", "template" — não falo `ChannelAccount` na UI.

A tela de Integrações continua sendo o ponto de entrada único pro operador (não importa que metade more em Integration Hub e metade em Messaging — pra ele é tudo "Integrações").

### 8.2. Hierarquia de navegação WhatsApp

```
Studio
└── Integrações
    └── WhatsApp                                     ← W11 — lista de WABAs do org
        │
        ├── (atalho) Variáveis fixas de template     ← W11e — cross-WABA
        ├── (atalho) Templates em massa              ← W11e — cross-WABA
        │
        └── /<wabaId>                                ← W11b — detalhe da WABA
            ├── Tab "Conta" (default)                ← visão geral, BM ID, status Meta
            ├── Tab "Telefones"                      ← W11c — lista de ChannelEndpoints
            │   └── /<phoneId>                       ← detalhe (status, qualidade, tier)
            └── Tab "Templates"                      ← W11d — lista de templates da WABA
                └── /<templateId>                    ← criação/edição (fora do escopo deste spec)
```

### 8.3. Tela principal: lista de WABAs (W11)

**Layout:** grid de cards (1 card = 1 WABA), com header de atalhos cross-WABA acima.

**Header:**
- Breadcrumb `Integrações > WhatsApp`
- Status agregado da org (chip "● Ativo" se ao menos 1 WABA active+healthy)
- 2 cards de atalho horizontais (UI atual mantém — funciona):
  - **Variáveis fixas de template** (gerencia values reutilizadas em todos os templates)
  - **Templates em massa** (cria 1 template em N WABAs simultaneamente)
- Busca + toggle grid/lista + `+ Adicionar conta`

**Card de WABA:**
- Nome da WABA (`ChannelAccount.name`, dado pelo usuário)
- **Chip de status** (combinado): `● Ativo` / `▲ Saúde degradada` / `✕ Rejeitado pela Meta` / `○ Aguardando autorização`
  - Status interno (`ChannelAccount.status`) × `qualityRating` × revisão Meta
- "Números vinculados: N telefones"
- "Total de conversas (mês): X"
- 3 quick actions inline: `Conta` · `Telefones` · `Templates` (cliques levam direto à tab correspondente do W11b)

**Caso especial — 1 WABA + 1 telefone:** pula a lista de WABAs, vai direto pro W11b. Mesmo princípio da densidade adaptativa do §6 (não regride o caso Pareto pro cliente que tem só 1 BM).

### 8.4. Detalhe da WABA (W11b)

3 tabs internas: **Conta** · **Telefones** · **Templates**.

#### Tab "Conta" (default)

Visão geral da WABA. O que aparece:

| Campo | Vem de |
|---|---|
| Nome interno | `ChannelAccount.name` |
| Meta Business Account ID | `externalAccountId` (copy-button) |
| Business Portfolio ID | `businessPortfolioId` (relevante pra fluxo BSUID — ver call do dev) |
| Status interno | `status` chip |
| Status de revisão Meta | (vem do adapter — ver Q6 abaixo) |
| Quality rating Meta | `qualityRating` (chip High/Medium/Low) |
| Última verificação | `lastHealthCheckAt` |
| Ações | `[Reconectar]` · `(Testar)` · `(Desassociar)` |

#### Tab "Telefones" (W11c)

Tabela de [`ChannelEndpoint`](../../apps/awsales-domains-contracts/data-modeling/messaging/channel-endpoint.mdx) com `channelType=whatsapp` dessa WABA.

Colunas (todas ordenáveis):
- **Número** (`address`)
- **Nome** (`displayName`) — chip de aviso se vazio (Meta exige)
- **Status interno** (`ChannelEndpoint.status`: active/inactive/migrating/archived)
- **Status Meta** (Connected / Disconnected / Pending review / Throttling — vem do adapter)
- **Qualidade Meta** (High/Medium/Low/Flagged — chip 🟢/🟡/🔴/⚠️)
- **Limite de mensagens** (tier — 250/1K/10K/100K/Ilimitado por dia)
- **Editar** (lápis)

Ações no header: `[+ Adicionar telefone]` · refresh · busca.

**Status combinado tem que aparecer separado** — Paulo reclamou que hoje "fica ativo mesmo quando BM caiu". Não juntar status interno com status Meta — usuário precisa diferenciar "AWsales perdeu acesso" de "Meta suspendeu o número".

#### Tab "Templates" (W11d)

Tabela de [`MessageTemplate`](../../apps/awsales-domains-contracts/data-modeling/messaging/message-template.mdx) (versões aprovadas/em revisão dessa WABA), agrupadas por [`MessageTemplateGroup`](../../apps/awsales-domains-contracts/data-modeling/messaging/message-template-group.mdx).

Colunas (todas ordenáveis):
- **Nome** (`name`)
- **Categoria** (`templateType`: marketing / utility / authentication / request_contact_info)
- **Idioma** (`language`)
- **Status** (chip combinado: `draft` / `pending_review` / `approved` / `rejected` / `archived` × `providerReviewStatus`)
- **Disparos 30d** (vem da agregação de `Message`)
- **Taxa de resposta 30d** (vem de `DeliveryStatusEvent`)
- **Qualidade** (sinal dos providers que tem — chip 🟢/🟡/🔴)
- **Data de criação / atualização**
- **Ações** (editar · ver · arquivar)

Filtros no header: status, categoria, idioma, busca por nome.

**Click numa linha → drawer lateral** com detalhe estatístico (gráfico de disparos hora-a-hora, lista de campanhas que usam) — não navega de tela, mantém contexto da lista (Daniel pediu "menos cliques").

**Não detalho aqui:** tela de criar/editar template. Fora do escopo deste spec — entra como sub-projeto separado (criação envolve componentes do `contentSchema`, variáveis, anexos, submissão pra Meta — UX pesada).

### 8.4.1 Modo Simple-WhatsApp (D-WA4)

> Adicionado após Stress Test 2. Resolve regressão pro Card (Pareto operacional simples).

**Aciona automaticamente quando:**
- 1 WABA · 1 telefone
- Status saudável: interno=`active`, Meta `providerStatus` ≠ Rejected
- 0 templates pendentes/rejeitados

**Reproduz UX do app legacy** (que Card validou: "zero me incomoda hoje, zero mesmo zero"):
- **Header compacto:** nome WABA · status combinado (1 chip se tudo ok) · número de telefone visível inline
- **Sem 3 tabs** (Conta · Telefones · Templates)
- **Scroll único:**
  - Lista de templates com sort/filter (D-STAT1)
  - Último evento recebido + status webhook
  - Ações inline: `[+ Adicionar telefone]` · `[+ Configurar templates]`
- **BM ID e Business Portfolio ID** colapsados em "ver mais" (não somem, mas saem da dobra)

**Transição automática pro modo Standard (W11b atual)** quando:
- Cliente adiciona 2º telefone OU
- Cliente adiciona 2ª WABA OU
- Algum template fica em estado `pending_review`/`rejected` OU
- Provider status Meta vira problema

Persona alvo: **Card** (1 BM, 1 telefone, fluxo simples). **Não regride** Daniel/Paulo — eles caem em Standard automaticamente quando têm volume.

### 8.5. Atalhos cross-WABA (W11e)

Duas features que existem **fora** da hierarquia de uma WABA específica e merecem destaque visual no header da W11:

#### Variáveis fixas de template

- Values reutilizáveis em todos os templates (nome da empresa, link de suporte, telefone fixo, etc.).
- Tela: lista chave → valor com edição inline.
- Quando template usa `{{1}}` resolvido por var fixa, evita o operador colar a mesma string em N templates.
- **Está hoje no app** — manter feature, refazer UX consistente com o resto do Studio.

#### Templates em massa

- **Cria/replica 1 template em N WABAs ao mesmo tempo.**
- Caso real: cliente com 3 WABAs (UOL EdTech, JF Rocket, Nord) que quer o mesmo template `boas_vindas_v2` em todas — sem essa feature, copia 3x manualmente, cada uma sujeita a aprovação Meta separada.
- Tela: form do template + multi-select "Aplicar nas WABAs: ▢ Todas / ▢ específicas" + status de submissão por WABA (porque Meta aprova caso a caso e pode rejeitar em algumas).
- **Está hoje no app** — feature avançada, manter.

Ambas viram **cards de atalho** no header do W11 (não card no grid junto das WABAs — são features, não contas).

### 8.6. Caso "1 WABA, 0 templates" — empty states

- WABA recém-criada sem templates: tab Templates mostra empty state com CTA pra criar primeiro template + dica "Pra disparar fora da janela de 24h, você precisa de pelo menos 1 template aprovado pela Meta."
- WABA recém-criada sem números: tab Telefones mostra empty state com CTA pra adicionar número (link pra fluxo Meta Embedded Signup ou colagem manual).

### 8.7. Decisões de UX da seção WhatsApp

| # | Decisão | Origem |
|---|---|---|
| D17 | WhatsApp tem layout próprio (não cabe em tabs do W4) | Complexidade de hierarquia |
| D18 | 3 tabs internas dentro de uma WABA: Conta · Telefones · Templates | Pattern atual já validado em uso |
| D19 | Status interno e status Meta aparecem **separados** (não juntar num chip só) | Paulo (status mockado fica "ativo" mesmo com BM caída) |
| D20 | Vars fixas + templates em massa ficam como atalhos no header da W11 | Cross-WABA — não cabem na hierarquia drilldown |
| D21 | Caso 1 WABA + 1 telefone pula a lista, vai direto pro detalhe | Densidade adaptativa (caso Card simples) |
| D22 | Click em template abre drawer lateral, não nova tela (mantém contexto da lista) | Daniel pediu menos cliques |
| D23 | Tela de criar/editar template é sub-projeto separado | Escopo — não atravessa esta spec |

---

## 9. Estados e mensagens

### Estados de conexão e o que aparece

| `status` | Header da conexão mostra | Banner |
|---|---|---|
| `pending_auth` | chip amarelo "Aguardando autorização" | aviso suave: "Termine a autorização no provider" + CTA `Continuar` |
| `active` + `healthy` | chip verde "Ativo" | nenhum |
| `active` + `degraded` | chip amarelo "Saúde degradada" | aviso: "Última verificação X min atrás teve problema" |
| `active` + `unreachable` | chip laranja "Inacessível" | aviso forte: "Não conseguimos falar com o provider" |
| `expired` | chip laranja "Expirou" | aviso forte: "Reconecte pra retomar" + CTA `Reconectar` |
| `revoked` | chip vermelho "Revogada" | banner crítico: "Acesso revogado no provider" + CTA `Reconectar` |
| `error` | chip vermelho "Erro" | banner crítico com mensagem específica |

**Notificação out-of-band:** quando a conexão sai de `active` ou entra em `degraded`/`unreachable`/`expired`/`revoked`/`error`, dispara e-mail pro owner da org (v1 mínimo). Slack/SMS ficam v1.5. **Quem dispara é o backend** — a tela só reflete o estado.

### Dirty state global (UX puro, fora do backend)

**Troca de org é contexto global do Studio** (sidebar/header), não filtro de tela. Quando usuário troca de org, todo o Studio muda contexto — incluindo Integrações. **Por isso o dirty-state guard é crítico aqui:** qualquer formulário de edição (config de webhook, criar tool, editar conexão) bloqueia a troca de org / navegação se há alterações não salvas. Modal `[Salvar e trocar] [Descartar e trocar] [Cancelar]`. Indicador visual no switcher de org global do Studio quando há dirty state em qualquer tela.

### Erro no fluxo de conectar

- `409 connection.already_exists` (nome duplicado por provider+org) → form mostra inline "Já existe conexão com esse nome" + sugere variação
- `422 connection.invalid_credentials` → form mostra "Credenciais inválidas" no campo apropriado
- `403/404` → toast genérico

---

## 10. Decisões de UX (consolidadas)

| # | Decisão | Origem |
|---|---|---|
| D1 | Múltiplas conexões agrupadas no card do provider | Call (Card+Paulo+José+PG) |
| D2 | Card no grid sem descrição genérica | Call (Paulo) |
| D3 | Card multi-conexão mostra stat agregada (mitigação Deds) | Stress test (gap G16) |
| D4 | Quota de plano visível no header | Stress test (gap G18) |
| D5 | Catálogo agrupado por `category` (não 4 abas inventadas) | Alinhamento backend |
| D6 | Webhook secret aparece uma vez na criação, com instrução clara | Backend constraint |
| D7 | Tabs condicionais ao `authType` × `capabilities` | Alinhamento backend |
| D8 | Stats com affordance (sort/filter por coluna numérica) | Stress test (gap G10) — Daniel |
| D9 | Densidade adaptativa em 3 modos automáticos | Stress test (gap G15) — Card |
| D10 | Sidebar lateral só aparece quando >1 conexão | Pattern WABA |
| D11 | Tools têm rota dedicada na sidebar | Stress test (gap G07, G17) |
| D12 | Tool tem tabs Detalhe / Telemetria / Auditoria | Stress test |
| D13 | Categoria de tool reduzida pra 3 visíveis (read/write/destructive) | UX simplification |
| D14 | Tool nativa toggle on/off por conexão (propagação é backend) | Call (José sobre Pipe Drive) |
| D15 | Estados de conexão refletem `status` × `lastHealthStatus` real | Stress test (Paulo, Card) |
| D16 | Dirty state global guard | Stress test (gap G09) — Paulo |

---

## 11. Pendências pra alinhar com o dev (Q3, Q6, Q7, Q8, Q9)

> **Nota — Stress Test 2 (2026-04-30):** Q1, Q2, Q4 e Q5 foram **fechadas como decisões UX** independentes do backend. Veja D-ADD4 (Q1+Q2 viram affordances no header W3), D-EST4 (Q4+Q5 viram banner de onboarding com event de teste). Pendências restantes abaixo.

**Esses não são gaps de UX — são gaps onde o domain-contracts não tem resposta clara e a tela depende disso.** Preciso conversar com Tury/Jordan antes de o Greg ir pra Figma.

### ~~Q1~~ — RESOLVIDA pelo Stress Test 2 (D-ADD4)

> Q1 (webhook customizado avulso) virou **affordance UX independente de modelagem backend**. Botão `[+ Webhook customizado]` no header do W3 (catálogo). Backend pode resolver com provider seed, flag, ou tipo separado — UX é a mesma.

### ~~Q2~~ — RESOLVIDA pelo Stress Test 2 (D-ADD4)

> Q2 (tool standalone) virou **affordance UX independente**. Botão `[+ Integração Customizada]` no header do W3. Cliente cria conexão custom (any auth), depois cria tool dentro (W16).

### Q3 — Provider "System" (interno)

**O que é hoje.** Print do neo mostra um provider "System" com tools internas da plataforma (handoff humano, agendar callback, etc.). Sempre ligado, sem auth, sem credencial.

**O que o backend tem.** Não vejo "system" listado nos 26 providers atuais.

**Pergunta:**
- "System" vira um provider seed-data novo com `authType=webhook_only` (sem auth) e flag de `isSystem=true` (não removível)?
- Ou as tools de plataforma viram parte de outro mecanismo fora do Integration Hub?

**Quem decide:** Tury/Jordan. Se vira provider, tela esconde botões `Reconectar`/`Desassociar` quando `isSystem=true`. Se não vira, "System" não aparece nessa tela.

### ~~Q4~~ — RESOLVIDA pelo Stress Test 2 (D-EST4)

> Q4 (último evento de exemplo) virou parte do **banner de onboarding pós-criação** + tab Webhooks com inspector ao vivo. Banner mostra "Aguardando primeiro evento real" → "Recebido em X" quando chega. Inspector tem payload JSON expandível por linha + botão `[Enviar evento de teste]` (flag test=true). Independente de endpoint próprio — backend pode reusar logs de webhook existente.

### ~~Q5~~ — RESOLVIDA pelo Stress Test 2 (D-EST3 + D-EST4)

> Q5 (notificação out-of-band) já estava em D-EST3 (e-mail pro owner v1). Stress Test 2 confirmou prioridade P0. Backend dispara via `IntegrationConnectionStatusChanged` (evento já existe — ver [connections.mdx](../../apps/awsales-domains-contracts/domain/integration-hub/connections.mdx) "Eventos emitidos"). Slack/SMS v1.5.

### Q6 — Status de revisão Meta (WABA + telefones + templates)

**O que é o caso.** Print 1 mostra WABA com chip "Rejeitado". Print 2 mostra telefone com "Status desconhecido". Print 3 mostra template com "Ativo - Qualidade pendente". **Esses status são da Meta** — distinto do nosso `status` interno (`active`/`expired`/etc.) e do `lastHealthStatus` (`healthy`/`degraded`/`unreachable`).

**O que o backend tem.**
- `ChannelAccount.status` (interno) + `qualityRating` (vem da Meta, mas não está claro como é atualizado)
- `MessageTemplate.status` (`draft/pending_review/approved/rejected/archived`) + `providerReviewStatus` (string genérica do provider)
- `ChannelEndpoint` não tem campo explícito pra "status Meta do número" (Connected/Disconnected/Pending review/Throttling) — vejo só `status` interno (active/inactive/migrating/archived) + `capabilities`

**Pergunta:**
- O adapter `meta_whatsapp` enriquece o response com status Meta cru ao chamar GET ChannelAccount/Endpoint? Ou tem campo dedicado tipo `providerStatus` que ainda não vi?
- Quem atualiza o `qualityRating` quando muda na Meta — webhook `account_alerts`? polling?
- Pra template: `providerReviewStatus` cobre o caso "Qualidade pendente" do print 3?

**Quem decide:** dev do Messaging. **Pra UI funcionar** preciso:
- 1 campo `providerStatus` no ChannelAccount (Approved/Rejected/Under review/Disabled)
- 1 campo `providerStatus` no ChannelEndpoint (Connected/Disconnected/Pending review/Throttling)
- 1 campo `messagingTier` no ChannelEndpoint (250/1K/10K/100K/Unlimited mensagens/dia)
- `MessageTemplate.providerReviewStatus` já existe — confirmar formato esperado

Se algum não existir, a UI mostra placeholder "—" e cliente perde info crítica que tem hoje no app.

### Q7 — Auto-detecção de conexões legacy pra W18

**Setup.** D-IA8 (migração legacy) tem tela W18 que lista conexões legacy do cliente Mamba pra ele migrar pro Studio. Backend tem endpoint pra "detectar conexões legacy do org X" ou cliente cola algum identificador?

**Pergunta:** existe `GET /integrations/legacy-connections?orgId=X` ou cliente vai precisar mapear manualmente? Se manual, banner do W1 não tem como saber "tem 12 legacy" (badge sem dado).

### Q8 — Stat agregada cross-conexão (top objeto)

**Setup.** D-CARD2 (mitigação Deds) propõe "top objeto cross-conexão" no card multi-conexão (ex: "Top: Marco Zero"). Tury valida se backend consegue calcular performático no listing endpoint?

**Pergunta:** se inviável, fallback é só "soma de eventos" (mais simples). Confirmar antes de Greg ir pra Figma.

### Q9 — Tools `category=destructive` exigem ATC

**Setup.** D-TOOL1 e D-TOOL3 distinguem read/write/destructive. Tools `destructive` (refund, cancelar) — exigem confirmação adicional ao chamar (modal ATC), ou approval em Agents Config separado?

**Pergunta:** quem é o gatekeeper — esta tela ou Agents Config? Se for Agents Config, esta tela só **declara** categoria; o gating é feature externa.

---

## 12. Próximos passos

1. **PG** alinha Q3, Q6, Q7, Q8, Q9 com Tury/Jordan (1 reunião curta, 5 pontos restantes — Q1/Q2/Q4/Q5 viraram decisões UX).
2. **Greg** desenha Figma a partir dos wireframes atualizados (este spec + [wireframes.md](wireframes.md)). Power user testa fluxo cego.
3. **PG** valida com Card (caso simples) e Daniel (caso CS) antes de homologar.
4. **Greenfield team** confirma que a tela usa só endpoints já documentados em `awsales-domains-contracts`. Decisões UX que dependem de novo endpoint (D-IA8 migração via aliasing de webhook URL, D-EST4 banner com `[Enviar evento de teste]`, D-TOOL7 replicar tool cross-org) entram como pendência do Integration Hub no Linear.
5. **Studio framework** — declarar dependências de cmd+K (D-IA6) e dirty-state guard global (D-UX1) como issues cross-team em Linear, com owner do design system.

---

## 13. Webhook Customizado (sem provider conhecido)

> Adicionada após Stress Test 2 — D-ADD4. Resolve Q1 (caso de cliente com checkout próprio que migra do legacy).

**Caso de uso.** Cliente JF Rocket tem checkout próprio (Shopify storefront + middleware caseiro). Não usa Hubla, Greenn, OnProfit nem nenhum dos providers `webhook_only` catalogados. Quer notificar AwSales quando rola compra.

**Fluxo UX.**
1. Cliente abre W3 (catálogo) → clica `[+ Webhook customizado]` no header.
2. Drawer W13 variante webhook_only abre. Pede:
   - Nome (obrigatório, ex: "Checkout Loja JF")
   - Apelido (opcional, ex: "Operação SP")
   - Tipo de evento esperado (Compra criada / Lead capturado / Outro — afeta normalização)
3. Cliente cria → backend gera `webhookUrl` + `webhookSecret`. Modal final mostra ambos com copy-button + aviso "secret não-recuperável".
4. Cliente cola URL no middleware do Shopify → primeira compra de teste chega.
5. Banner de onboarding (D-EST4) cobre o "como saber que chegou" (ver §6.1.1).

**Resolução backend (independente da UX).** Pode ser:
- Provider seed-data novo `__custom_webhook__` com `category=checkout, authType=webhook_only`
- Flag `customProvider: true` na request POST /connections
- Tipo dedicado de Connection separado

UX é simétrica em qualquer das alternativas — pendência de modelagem que não bloqueia design.

---

## 14. Integração Customizada (tool standalone HTTP)

> Adicionada após Stress Test 2 — D-ADD4. Resolve Q2 (caso Barnabé/Gourmet).

**Caso de uso.** Barnabé tem cliente Nord Academy usando Gourmet (catálogo de restaurantes). Não há provider Gourmet catalogado. Quer 1 tool HTTP que IA possa chamar (`agendar-restaurante`).

**Fluxo UX.**
1. Cliente abre W3 → clica `[+ Integração Customizada]` no header.
2. Drawer W13 variante api_key/bearer abre. Pede:
   - Nome (obrigatório, ex: "Gourmet API")
   - Descrição (opcional, ex: "API de restaurantes parceiros pra agendamento")
   - Tipo de auth (`Bearer` / `API Key` / `Basic` / `Nenhuma`)
   - Credencial (depende do tipo escolhido)
   - Base URL (opcional, ex: `https://api.gourmet.com.br`)
3. Cliente cria → conexão `active` imediatamente.
4. Redirect pro W4 da conexão custom criada → tab Tools → `[+ Nova Tool HTTP]` → W16 (split-pane).

**Por que NÃO é a mesma coisa que Webhook Customizado:**
- Webhook Customizado **só recebe** (sem credencial nossa, só URL+secret deles).
- Integração Customizada **chama externamente** (nossa credencial, autenticada, IA usa via Tool).

**Resolução backend.** Mesma lógica — pode ser provider seed-data, flag, ou tipo. UX simétrica.

---

## 15. Migração Legacy

> Adicionada após Stress Test 2 — D-IA8. Cobre 100% dos clientes Mamba atuais que têm conexões no app legacy.

### 15.1. Banner persistente em W1

Quando há conexões legacy não-migradas pra a org ativa:

```
ℹ️ Você tem N conexões na versão anterior. [Ver e migrar →]
```

Banner some quando todas migram OU cliente clica "ignorar" (vai pra config global, recuperável).

### 15.2. Tela W18 — Migração Legacy

Lista as conexões legacy do cliente com:
- Coluna **Provider** (logo + nome)
- Coluna **Nome legacy** (nome dado pelo cliente no app antigo)
- Coluna **Status** (Não migrada / Migrada / Falhou)
- Coluna **Ação** por linha:
  - **Não migrada** + provider OAuth → `[Re-autorizar]`
  - **Não migrada** + provider client_credentials/api_key → `[Migrar]` (auto, sem ação cliente)
  - **Não migrada** + provider webhook_only → `[Migrar]` (preserva URL via aliasing backend)
  - **Migrada** → `[Ver detalhe]`
  - **Falhou** → `[Tentar novamente]`

Header: `[Migrar todas]` + `[Pular tudo (manter como está)]`.

**Aviso explicativo:** copy claro sobre o que cada tipo de migração faz (preserva URL, pede re-auth, transfere tokens auto).

### 15.3. Regras críticas

- **Migração mantém `connectionId` interno estável** — campanhas e configurações legacy que apontam pra ele continuam funcionando.
- **Webhook URL legacy é preservada via aliasing backend** — cliente Hubla não recola URL no provider externo.
- **OAuth tokens migrados automaticamente** quando compatíveis (Hotmart, Kiwify); **re-auth solicitada** quando providers exigem novos escopos (HubSpot/RD/Pipedrive — depende da Q7).

---

## Apêndice A — Referências cruzadas

Sempre que esta spec fala de algo que tem contrato no domain-contracts, link direto:

- [Integration Hub overview](../../apps/awsales-domains-contracts/domain/integration-hub/overview.mdx)
- [Connections — fluxos de criação](../../apps/awsales-domains-contracts/domain/integration-hub/connections.mdx)
- [Providers — catálogo de 26 providers](../../apps/awsales-domains-contracts/domain/integration-hub/providers.mdx)
- [Object Catalog](../../apps/awsales-domains-contracts/domain/integration-hub/object-catalog.mdx)
- [Integration Actions (Tools)](../../apps/awsales-domains-contracts/domain/integration-hub/integration-actions.mdx)
- [Inbound Protocols](../../apps/awsales-domains-contracts/domain/integration-hub/inbound-protocols.mdx)
- [Studio API endpoints](../../apps/awsales-domains-contracts/studio-api/integrations/)

**Esse spec não duplica nenhuma decisão de modelagem, lifecycle, idempotência ou contrato. Tudo isso é responsabilidade do Integration Hub.** Se você ler algo aqui que parece "decisão de backend", é bug — me avisa.
