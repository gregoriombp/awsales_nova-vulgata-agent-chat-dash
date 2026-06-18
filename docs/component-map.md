# Mapa de componentes — onde achar a referência no DS

> **Leia ANTES de criar qualquer componente ou tela.** Este é o índice
> "preciso de X → use Y" do design system AwSales. Diz **o que importar**, de
> **onde**, e **quando NÃO** usar cada peça. É irmão de
> [`component-layers.md`](./component-layers.md) (taxonomia/camadas) e da
> [`navigation.ts`](../app/bombardier/styleguide/navigation.ts) (inventário vivo
> + rotas do styleguide). Aqui o foco é o **import** e o **quando usar**.
>
> Fonte de verdade das regras: [`AGENTS.md`](../AGENTS.md). Se conflitar, o AGENTS vence.

## Regra de ouro (a receita atômica)

1. **Reusar > estender > criar.** Procure aqui e em `components/ui/Aw*` antes de
   escrever qualquer coisa. Só crie do zero se nada servir e a semântica for
   genuinamente nova — nunca duplique sob um nome novo.
2. **Componha de primitivos.** Uma peça maior (card, modal, tela) é uma *receita*
   de primitivos `Aw*`. Um `AwGroupCard` usa `AwButton` + `Icon` + `AwAvatar` — não
   reimplementa botão, ícone ou avatar na mão.
3. **Só tokens.** Nada de `#hex`, `w-[37px]`, `rounded-[10px]`. Use o
   [vocabulário de tokens](#vocabulário-de-tokens-cole-isto-em-vez-de-hardcode)
   abaixo. Token faltando → reporte, não crie (só a skill `foundation` cria token).
4. **Ícone = `Icon`.** Material Symbols via `Icon`. Nunca `<svg>` cru nem outra
   lib de ícone. `react-icons` só para **marcas** que o Material Symbols não tem
   (Visa, Mastercard, Amex, Slack, WhatsApp). **Logo de app/integração** (Google,
   Chrome, Pipedrive…) não é `Icon` — é `AwBrandLogo`, curado do Iconify `logos`
   (ver AGENTS.md §4).

---

## Atalho por intenção (o caminho rápido)

| Preciso de… | Use | Import | Cuidado |
|---|---|---|---|
| Ícone | `Icon` | `@/components/ui/Icon` | `<Icon name="..." size={20} />`. Nunca `<svg>` cru. |
| Logo de app / integração | `AwBrandLogo` | `@/components/ui/AwBrandLogo` | marca de 3rd-party (Google, Chrome, Pipedrive…). Curar do Iconify `logos` → `markSrc`. **Não** é `Icon`. Ver AGENTS.md §4. |
| Botão | `AwButton` | `@/components/ui/AwButton` | tem `intent`/`size`/slot de `Icon`. Não estilize `<button>` na mão. |
| Campo de formulário | `AwField` (ou `AwInput`) | `@/components/ui/AwInput` | `AwField` (label + erro + variante `framed`) e `AwInput` saem do mesmo arquivo. |
| Select | `AwSelect` | `@/components/ui/AwSelect` | |
| Checkbox / toggle / slider | `AwCheckbox` · `AwToggle` · `AwSlider` | `@/components/ui/Aw{Checkbox,Toggle,Slider}` | **não** use os `fluid/*` equivalentes direto (ver [Motion](#motion-duas-camadas)). |
| Tag / chip / badge | `AwPill` | `@/components/ui/AwPill` | há `badge.tsx` (shadcn) e `fluid/badge` — prefira `AwPill`. |
| Card genérico | `AwCard` | `@/components/ui/AwCard` | **não** use `components/ui/card.tsx` (primitivo shadcn cru). Ver [famílias](#cards). |
| Card de métrica | `AwStatCard` | `@/components/ui/AwStatCard` | número + delta + ícone. |
| Tabela simples | `AwTable` | `@/components/ui/AwTable` | dados c/ sort/paginação/seleção → `DataTable`. Ver [famílias](#tabelas). |
| Modal / dialog | `AwModal` | `@/components/ui/AwModal` | base. Variantes prontas: Connect/Welcome/Contact channel/Add integration. |
| Painel lateral / drawer | `AwSheet` | `@/components/ui/AwSheet` | |
| Menu dropdown | `AwDropdownMenu` | `@/components/ui/AwDropdownMenu` | |
| Abas | `AwTabs` | `@/components/ui/AwTabs` | |
| Avatar | `AwAvatar` | `@/components/ui/AwAvatar` | grupo: `AwAvatarGroup` (mesmo arquivo). |
| Empty state | `AwEmpty` | `@/components/ui/AwEmpty` | slots: `AwEmptyTitle`/`Media`/`Description`/`Content`. |
| Alerta inline | `AwAlert` | `@/components/ui/AwAlert` | |
| Toast | `AwToast` | `@/components/ui/AwToast` | `AwToastProvider` no topo da árvore. |
| Skeleton / loading | `AwSkeleton` | `@/components/ui/AwSkeleton` | |
| Progress | `AwProgress` | `@/components/ui/AwProgress` | |
| Status dot | `AwStatusDot` | `@/components/ui/AwStatusDot` | |
| Breadcrumb | `AwBreadcrumb` / `AwBreadcrumbsBar` | `@/components/ui/Aw{Breadcrumb,BreadcrumbsBar}` | átomo vs barra completa. |
| Cabeçalho de página | `AwPageHeader` | `@/components/ui/AwPageHeader` | |
| Navegação lateral | `AwNavRail` / `AwNavList` | `@/components/ui/Aw{NavRail,NavList}` | rail = trilho com grupos; list = lista simples. |
| Gráfico | `AwChart` | `@/components/ui/AwChart` | wrapper de recharts. Não importe recharts direto na página. |
| Composer de chat | `AwInputMessage` | `@/components/ui/AwInputMessage` | já é a porta de entrada do Fluid. |
| Passos de raciocínio | `AwThinkingSteps` | `@/components/ui/AwThinkingSteps` | idem. |
| Layout de dashboard | `AwDashboardLayout` | `@/components/ui/AwDashboardLayout` | já injeta sidebar/header. |

> Não achou aqui? Veja o [inventário completo por camada](#inventário-completo-por-camada)
> antes de concluir que falta — provavelmente já existe.

---

## Vocabulário de tokens (cole isto em vez de hardcode)

Classes Tailwind v4 geradas a partir do `@theme` em `app/globals.css`. Use **estas**,
nunca valores arbitrários para cor/spacing/radius/shadow/tipografia.

**Fundos:** `bg-canvas` · `bg-surface` · `bg-raised` · `bg-hover` · `bg-muted` ·
`bg-selected` · `bg-inverse`
**Texto:** `text-fg-primary` · `text-fg-secondary` · `text-fg-tertiary` ·
`text-fg-muted` · `text-fg-on-inverse`
**Bordas:** `border-subtle` · `border-default` · `border-strong` · `border-inverse`
**Acento/semântico:** `accent-brand` (+`-hover`) · `accent-success` ·
`accent-danger` · `accent-warning` · foco: `ring-focus`
**Raio:** `rounded-xs|sm|md|lg|xl|2xl|full`  ·  **Sombra:** `shadow-xs|sm|md|lg|overlay`
**Tipografia (tamanho):** `text-3xs`(10) · `text-2xs`(11) · `text-xs`(12) · `text-sm`(14) ·
`text-base`(16) · `text-lg`(18) · `text-xl`(20) · `text-2xl`(24) · `text-3xl`(30). Ou as
utilities semânticas, que já trazem line-height/tracking: `display-{sm…xxl}`, `body-{xs…xl}`,
`caption`, `aw-eyebrow`. **Nunca `text-[Npx]`.**
**Paleta crua** (só quando precisar de uma família específica): `aw-{gray,blue,emerald,
red,purple,teal,amber,pink,lime,slate}-{50…1200}` — ex.: `text-aw-blue-700`.

Exemplo certo (de `AwStatCard`): `bg-raised border-subtle text-fg-primary text-fg-tertiary`.

---

## Famílias (qual usar quando)

Os "duplicados" que você percebe quase sempre são uma família com papéis distintos.
Aqui está a régua.

### Cards
| Componente | Quando |
|---|---|
| `AwCard` | card genérico (header/title/description/content/footer/action via sub-exports). **Padrão.** |
| `AwStatCard` | uma métrica: número + delta + ícone. |
| `AwGroupCard` | item de lista/grade com avatar + ações. |
| `AwIntegrationCard` | catálogo/estado de integração (domínio). |
| `AwPaymentMethodCard` | cartão de pagamento salvo (billing). |
| `AwCardBrand` | só a bandeira do cartão (Visa/Amex…). |
| `card.tsx` (minúsculo) | **primitivo shadcn cru — não use direto.** Existe só como base; consuma `AwCard`. |

### Tabelas
| Componente | Quando |
|---|---|
| `AwTable` | tabela simples, estática, estilizada. **Padrão.** |
| `DataTable` (`@/components/tool-ui/data-table`) | dados com sort, paginação, seleção, colunas configuráveis. |
| `AwMembersTable` | tabela de membros/permissões (células de pessoa/seleção/texto prontas). |
| `table.tsx` (minúsculo) | **primitivo shadcn cru** — só dentro de um adapter de `tool-ui`, nunca numa página. |

### Modais e dialogs
| Componente | Quando |
|---|---|
| `AwModal` | **base** de todo modal. |
| `AwConnectModal` · `AwWelcomeModal` · `AwContactChannelModal` · `AwAddIntegrationModal` | fluxos prontos — reuse antes de montar um novo sobre o `AwModal`. |

### Inputs
`AwField` (label + mensagem de erro + variante `framed`) compõe `AwInput`. Para um
input solto, use `AwInput`. Select = `AwSelect`.

### Ícones
`Icon` (Material Symbols Rounded, peso 200 por padrão). `react-icons` **só** para
marcas sem equivalente (Visa/Mastercard/Amex/Slack/WhatsApp). `lucide-react` só
aparece dentro de primitivos shadcn gerados — não puxe em código de produto.

### Primitivos shadcn: usar direto vs. wrapper Aw

Os arquivos minúsculos em `components/ui/*.tsx` são primitivos shadcn (gerados via
CLI), ligados aos seus tokens por um *compat layer* em `globals.css` — então já
renderizam com as cores AwSales. **Não são duplicatas pra deletar.** Regra:

- **Tem wrapper Aw → use o wrapper, nunca o primitivo cru:** `card`→`AwCard`,
  `button`→`AwButton`, `badge`→`AwPill`, `dropdown-menu`→`AwDropdownMenu`. O
  `ds:check` avisa se um desses vazar pra produto.
- **Sancionados pra uso direto** (sem wrapper Aw, baixa customização): `tooltip`,
  `popover`, `collapsible`, `separator`, `calendar`, `accordion`. Importar direto
  está OK — não criamos wrapper cerimonial só pra renomear.
- **Casos especiais:** `chart` tem a camada-helper `AwChart` (paleta +
  `awChartConfig()`) — use os helpers, não recrie a paleta. Tabela: simples →
  `AwTable`; rica (sort/paginação) → `DataTable`; o `table` cru fica pros adapters.
- **`tool-ui/` é subsistema vendado** (data-table, stats-display) que consome os
  primitivos via `_adapter.tsx`. Não migre o interior dele pros `Aw*`.

---

## Motion: duas camadas

1. **Paint global (grátis, já ligado).** Hover/focus de elementos interativos
   recebem transição suave por uma regra `@layer base` em `globals.css`. **Não**
   adicione `transition-colors` na mão para um hover comum.
2. **Fluid (spring physics).** O **Fluid kit** (`components/ui/fluid/`) traz motion
   rico com framer-motion, mapeado aos tokens AwSales. Está em **preview ("leva 1")**.

**Regra do Fluid:** os primitivos `fluid/*` (`switch`, `slider`, `checkbox-group`,
`dialog`, `dropdown`, `accordion`, `badge`, `tooltip`) **duplicam** os `Aw*` e são
preview — **não importe direto**; use o `Aw*` equivalente. A porta de entrada
sancionada do Fluid são os 3 componentes já promovidos:
**`AwInputMessage`**, **`AwThinkingSteps`**, **`AwAskUserQuestions`** (superfícies de
chat/agente). A fusão dos motores nos `Aw*` (leva 2) é trabalho futuro.

---

## Inventário completo por camada

Terso de propósito (nome · import `@/components/ui/<Nome>` · papel). Espelha a
taxonomia de [`component-layers.md`](./component-layers.md).

### Primitivos
`AwButton` botão · `AwInput`/`AwField` input/campo · `AwSelect` select ·
`AwCheckbox` checkbox · `AwToggle` switch · `AwSlider` slider · `AwPill` tag/chip ·
`AwAvatar` avatar (+grupo) · `AwStatusDot` status · `AwProgress` progresso ·
`AwSkeleton` loading · `AwAlert` alerta · `AwBreadcrumb` breadcrumb (átomo) ·
`AwTabs` abas · `AwDropdownMenu` dropdown · `AwEmpty` empty state ·
`AwFileIcon` ícone de arquivo · `AwChannelIcon` ícone de canal ·
`AwDropzone` upload · `AwTransition` transição · `AwToast` toast · `Icon` ícone base ·
`AwBrowserIcon` ícone de navegador · `AwPlanIcon` ícone de plano · `AwRadialProgress`
progresso radial · `AwTrendDelta` delta de tendência · `AwAuditTypeBadge` badge de evento.

### Componentes
`AwCard` card · `AwStatCard` métrica · `AwGroupCard` item com ações ·
`AwPaymentMethodCard`/`AwCardBrand` pagamento · `AwTable`/`AwMembersTable` tabela ·
`AwModal` (+`AwConnectModal`/`AwWelcomeModal`/`AwContactChannelModal`/`AwAddIntegrationModal`)
modais · `AwSheet` drawer · `AwNavList`/`AwNavRail` navegação · `AwOptionList` opções ·
`AwListGroup` grupo colapsável · `AwPageHeader` cabeçalho · `AwNotificationsPanel`
notificações · `AwChatBubble` balão de chat · `AwInputMessage` composer ·
`AwThinkingSteps` raciocínio · `AwAskUserQuestions` entrevista · `AwChart` gráfico ·
`AwShortcutTile` atalho · `AwNavTree` árvore de navegação ·
`AwBeams`/`AwDotTunnel` fundos decorativos.

### Padrões
`AwOnboardingShell` casca de onboarding · `AwOnboardingTimeline` linha do tempo ·
`AwPasswordSetup` setup de senha · `AwBackupCodes` códigos de backup ·
`AwQrPlaceholder` QR.

### Domínio (amarrado à AwSales)
`AwIntegrationCard` integração · `AwSpecialistsPair`/`AwAgentCore`/`AwUserAgentOrb`/
`AwCortexSynthesis` visual dos agentes · `AwCapabilityTile` capacidade ·
`AwBrandLogo`/`AwLogo`/`AwBrandIllustration` marca · `AwAdditionalPlanBanner` plano ·
`AwCheckpointChip` checkpoint · `AwMentionMenu` menções · `AwAgentAvatar` avatar de agente ·
`AwToolCallCard` chamada de tool/integração · `AwAgentRunTrace` timeline da run do agente.

### Domínio — Faturamento
`AwConsumptionBar` barra de consumo · `AwCostBreakdown` quebra de custo ·
`AwInvoiceForecastCard` previsão da próxima fatura · `AwInvoiceRow` linha de fatura ·
`AwPlanSummaryCard` resumo do plano · `AwPaymentMethodRow` método de pagamento (item de
lista) · `AwPaymentMethodChip` método de pagamento (inline/link) · `AwInvoiceSummaryCard`
resumo da fatura — **órfão: hoje só aparece no próprio showcase, sem uso em produto**
(candidato a ligar numa página de faturamento ou remover).

### Infra / layout (consumido por outros, não use direto numa página)
`AwThemeProvider` · `AwDashboardLayout` · `AwSidebar` · `AwHeader` · `AwNavRail`
(chrome) · `AwNeuralPattern` · `AwMemoryBaseLogo` · `AwCopilotDrawer`.

---

## Faltou algo de verdade?

Se nada acima serve **e** a semântica é nova, aí sim crie — pela skill
[`bombardier-new-component`](../.claude/skills/bombardier-new-component/SKILL.md)
(prefixo `Aw`, em `components/ui/`, com showcase + entrada em `navigation.ts`).
Registre a peça nova **aqui** também. Rode `npm run ds:check` ao terminar.
