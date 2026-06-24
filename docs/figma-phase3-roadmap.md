# Figma DS Library — sync com código (estado + roadmap)

Live doc da sincronização entre [`AwSales DS Library` (Figma)](https://www.figma.com/design/GZODRtDvx5frFEasFLeVp0/AwSales-DS-Library) e os componentes `Aw*` do código (`components/ui/`). Use pra retomar do ponto certo numa próxima sessão.

> Authority de token continua sendo `AGENTS.md §2` — só `bombardier-design-system-foundation` e `bombardier-foundation-update` mexem em `globals.css` (`@theme` / `:root`).

---

## Estado do Figma agora

**6 collections · 189 vars · 20 text styles · 5 effect styles · 35 component pages**

| Collection | Vars | Modos |
|---|---|---|
| Primitives | 117 | Value |
| Color | 26 | Light / Dark |
| Chrome (dark sidebar) | 7 | Value |
| Spacing | 12 | Value |
| Radius | 7 | Value |
| Typography (sizes) | 20 | Value |

---

## Ondas já aplicadas

### A — Sync limpo (✅)

- `radius/xs/sm/md` atualizados (4/6/8 → 6/8/10)
- `space/0` criado
- Deletadas 3 collections legadas (`theme`, `light`, `dark` — 27 vars de template)
- Deletados 5 text styles legados (Inter/Roboto)
- Deletado `boxShadow/default`

### B — Collection `Chrome` (✅)

7 vars aliasing primitives, espelham os `--dark-*` do `globals.css:600-607` (sidebar/header sempre dark mesmo em light mode): `chrome/bg`, `chrome/bg-raised`, `chrome/bg-hover`, `chrome/fg-primary`, `chrome/fg-secondary`, `chrome/fg-tertiary`, `chrome/border`.

### C2 — Semânticos pressed/danger (✅)

4 tokens novos em `globals.css` + Figma `Color` collection:

| Token | Light | Dark | Para que serve |
|---|---|---|---|
| `--bg-pressed` | `aw-gray-300` | `aw-gray-800` | `:active` de ghost/subtle button, menu/list items, switch tracks |
| `--accent-brand-pressed` | `aw-black` | `aw-white` | `:active` brand max-contrast (link, tab ativo, button primary futuro) |
| `--accent-danger-hover` | `aw-red-600` | `aw-red-400` | hover de destructive button / inline danger link |
| `--accent-danger-pressed` | `aw-red-800` | `aw-red-300` | `:active` destructive |

Bônus no `@theme`: `--color-danger`, `--color-danger-hover`, `--color-danger-pressed`, `--color-brand-pressed`, `--color-bg-pressed` (utilities Tailwind correspondentes).

**Refactor do button primary NÃO foi aplicado** — análise mostrou que ele consome `--fg-primary` (não `--accent-brand`), e o refactor inverteria o pressed no dark mode. Os tokens ficam disponíveis pra adoção em link/tab/destructive button quando esses forem refinados.

### E1 — Button: State + Loading (✅)

Aplicado SÓ no main `AwButton` set (Icon Left/Right/Only ficam pra E2).

- **Property `State`** (variant) — 5 valores: `Default`, `Hover`, `Pressed`, `Focus`, `Disabled`
- **Property `Loading`** (boolean) — declarada (spinner visual fica pra E3)
- 24 variants originais → **120 variants** (24 × 5 estados)
- Bindings por (variant, state) consomem os tokens C2 onde se aplica:

| Variant | Default | Hover | Pressed | Focus | Disabled |
|---|---|---|---|---|---|
| primary | `accent/brand` | `accent/brand-hover` | **`accent/brand-pressed`** | `ring/focus` | opacity 0.5 |
| secondary | `bg/canvas` + `border/default` | `bg/surface` + `fg/primary` | **`bg/pressed`** + `fg/primary` | `ring/focus` | opacity 0.5 |
| ghost | `bg/surface` | `bg/muted` | **`bg/pressed`** | `ring/focus` | opacity 0.5 |
| subtle | `bg/muted` | **`bg/pressed`** | **`bg/pressed`** | `ring/focus` | opacity 0.5 |
| danger | `accent/danger` | **`accent/danger-hover`** | **`accent/danger-pressed`** | `ring/focus` | opacity 0.5 |
| ai · ai-spectrum · ai-outline | (gradient AI) | opacity 0.9 | opacity 0.8 | `ring/focus` | opacity 0.5 |

---

## O que sobrou no Button (próximas ondas)

| Onda | O que faz | Risco |
|---|---|---|
| **E2** — Consolidar 4 sets | Unificar `AwButton` + `AwButton / Icon Left/Right/Only` em 1 set com booleans `HasIconLeft/HasIconRight/IconOnly` + INSTANCE_SWAP. Reduz 480 → 120 variants. | **Alto — breaking change**: instâncias atuais dos 4 sets quebram. |
| **E3** — Loading spinner real | Adicionar nó spinner em cada variant Default + amarrar `visibility = Loading` boolean. Block fullwidth (E3b). | Médio — repetitivo |
| **E4** — Pair dark mode | Frame paralelo com `.dark` class pra preview side-by-side | Baixo |

---

## Roadmap Phase 3 (componentes restantes)

Saída do workflow gap analysis (`wf_1d71d117-a2b`, 41 agents, ~16min, 35 pages auditadas). **Distribuição**: 4 full · 11 partial · 20 skeleton. 90 Aw* no código, 57 sem Figma page.

### Quick wins (S effort, parity-jump alto)

Cluster recomendado: ~6h, fecha 5 átomos.

1. **Pill** — adicionar variant `info` (`--aw-blue-500`). Fecha parity completa em ~1h.
2. **Status Dot** — expor `ring`/`pulse`/`absolute` como booleans + frame composto dot+avatar.
3. **Avatar** — alinhar size labels (`Small/Medium/Large` → `sm/md/lg`) + adicionar `AwAvatarGroup` composition frame.
4. **Slider** — promover a COMPONENT_SET com booleans `hasLabel/hasValueDisplay/hasHelp` + State axis.
5. **Alert** — adicionar boolean `Show Close` + `Icon override`.

### Átomos restantes (ordem de impacto)

| Componente | Paridade | Esforço | Gap principal |
|---|---|---|---|
| Icon | skeleton | **L** | Sem Size/Weight/Fill axes; 0 brand glyphs (agent/agent_studio/memory_base); só ~25% dos ícones (28/111); falta doc anti-`smart_toy` |
| Field & Input | partial | M | `AwField` sem variant set; `framed` (legend notched) ausente; sem estados error/helper/focus/invalid |
| Select | partial | M | Sem focus-visible state; sem open state; sem menu surface |
| Toggle | partial | M | `AwToggleRow` sem Figma page; sem hover/focus-visible |
| Slider | skeleton | S | (no quick wins) |
| Card Brand | skeleton | **L** | 0/8 brands modeladas; 0/4 sizes; refazer como 2 sets (AwCardBrand + AwCardBrandTile) |
| Checkbox | full | S | Polish: hover/focus-visible/label slot (todos minor) |
| Avatar | full | S | (no quick wins) |
| Progress | full | S | Boolean `hasLabel` + `valueLabel` TEXT prop |

### Moléculas

| Componente | Paridade | Esforço | Gap principal |
|---|---|---|---|
| Modal | skeleton | M | Sem COMPONENT_SET; falta Size (md/cockpit), hasTitle, hasFooter, dismissible. Decidir Modal ↔ modais filhos (Welcome/Connect/AddIntegration/ContactChannel) **antes** de tocar |
| Card | partial | M | `interactive` virou variant em vez de boolean; falta `shiny`; sem subcomponentes (Header/Title/Action/Content/Footer) |
| Dropdown Menu | partial | M | Sem surface composto; sem separator/label rows; sem disabled |
| Tabs | skeleton | M | Sem container variants segmented/standalone/underline; sem countTone danger; sem hover/focus |
| Toast | partial | M | Falta `info`; sem action button slot; sem close affordance; sem stack pattern |
| Alert | full | S | (quick wins) |
| Empty | skeleton | M | COMPONENT_SET com media=default/icon + booleans `showMedia/showDescription/showCTA` |
| Breadcrumb | skeleton | M | Sem COMPONENT_SET; sem `AwBreadcrumbsBar`; separator hardcoded `/` mas produção usa chevron. Já tem doc piloto (Onda D). |
| Stat Card | skeleton | M | Sem variant `ai`; conflito Delta/Period vs hint — remover Delta/Period e usar `AwTrendDelta` como instância |
| Shortcut Tile | skeleton | S+M | Anatomia 140×110 errada (código é horizontal); refazer |
| Page Header | skeleton | M | Rename `Doc Header` → `AwPageHeader`; Size (hero/default/compact) + booleans icon/eyebrow/toolbar/divider |
| Group Card | skeleton | M | 320×120 mis-sized (real ~320×330); refazer com photo header + avatar stack + +N chip |
| Integration Card | skeleton | M | Sem variant axis para os 4 states; CSS dead footer (`.aw-integration-card__foot` sem JSX consumidor) |
| List Group | skeleton | M | Promover a set com state×hasMedia×hasActions×indent; chevron expand_more |
| Specialists Pair | skeleton | M | Sem distinção human/AI; sem multi-human; sem hover/focus-within reveal CTA (essência do componente) |
| Nav List | partial | S | `AwNavList` container sem Figma page; `AwNavItem` sem Icon nem Count slots |
| Table | skeleton | **L** | Sem variant `airy`; sem row states; sem sortable headers; sem cell modifiers |
| Option List | skeleton | M | Sem distinção single/multi; sem list container; sem action footer Clear/Confirm |
| Chat Bubble | skeleton | M | Sem action rail (Copy/Retry/feedback); sem streaming dots; sem avatar slot; sem timestamp |

### Organismos

| Componente | Paridade | Esforço | Gap principal |
|---|---|---|---|
| Sheet | skeleton | M | Sem COMPONENT_SET; sem sizes wide/xwide; sub `AwSheetTab`/`AwSheetRow` ausentes |
| Nav Rail | skeleton | **L** | 5 sub-componentes ausentes (Group/Item/OrgSwitcher/UserSwitcher); sem theme light/dark; sem translucent; sem item states. **Bloqueia handoff de toda navegação** |
| Members Table | skeleton | **L** | Sub-cells (PersonCell/SelectCell/TextCell) ausentes; sem sort glyphs |

### Padrões agent

| Componente | Paridade | Esforço | Gap principal |
|---|---|---|---|
| Agent & Chat Patterns | skeleton | **XL** | ZERO component sets — só 3 tiles ilustrativos. Promover `AwInputMessage`+`AwThinkingSteps`+`AwAskUserQuestions` + trazer `AwChatBubble`+`AwAgentRunTrace`+`AwToolCallCard`+`AwCheckpointChip` |

---

## Aw* sem Figma page (decidir caso a caso)

**Deferir** (features / shells / decoração — NÃO devem virar Figma page):

- Modais de feature: `AwAddIntegrationModal`, `AwConnectModal`, `AwContactChannelModal`, `AwWelcomeModal` (composições da Modal base)
- Shells: `AwDashboardLayout`, `AwHeader`, `AwSidebar`, `AwNavTree`, `AwOnboardingShell`, `AwCopilotDrawer`, `AwNotificationsPanel`
- Features de página: `AwAdditionalPlanBanner`, `AwBackupCodes`, `AwInvoiceForecastCard`, `AwInvoiceRow`, `AwPaymentMethodCard`, `AwPaymentMethodRow`, `AwPlanSummaryCard`, `AwPasswordSetup`, `AwReportPromo`, `AwOnboardingTimeline`, `AwPlanIcon`, `AwBrandLogo`, `AwLogo`, `AwMemoryBaseLogo`, `AwThemeProvider`
- Decorativos/WebGL: `AwBeams`, `AwBrandIllustration`, `AwCortexSynthesis`, `AwDotTunnel`, `AwNeuralPattern`, `AwAgentAvatar`, `AwAgentCore`, `AwUserAgentOrb`
- Charts/visualizações de domínio: `AwChart`, `AwConsumptionBar`, `AwCostBreakdown`
- Patterns molecule de feature: `AwMentionMenu`, `AwDropzone`, `AwNotificationCard`

**Deveriam virar Figma page** (atom/molecule reutilizáveis que escaparam):

- `AwSkeleton` (loading primitive) — atom
- `AwTrendDelta` (variation chip) — atom
- `AwAgentStatusBadge`, `AwAuditTypeBadge` — atoms badge
- `AwPaymentMethodChip`, `AwSourceChip`, `AwCheckpointChip` — atoms chip
- `AwBrowserIcon`, `AwChannelIcon`, `AwFileIcon` — atoms icon-family
- `AwRadialProgress` — atom (variant de Progress?)
- `AwQrPlaceholder` — atom
- `AwTransition` — animation primitive (foundation)
- `AwStatGroup` — molecule
- `AwAgentRunTrace`, `AwToolCallCard` — patterns (pertencem a Agent & Chat Patterns)
- **`AwTooltip` e `AwCalendar`/`AwDateRange`** — não existem como Aw-wrappers; shadcn consumido cru em `AwGroupCard`, `AwMembersTable`, `AwHeader`. **Gap duplo (código + Figma).**

---

## Issues levantadas pelos verificadores adversariais

**Completude** (verdict: inaccurate)
- Lista de 55 Aw* unmatched sem decisão explícita item a item
- `AwTooltip` e `AwCalendar` fora do radar completamente
- Decisões arquiteturais em aberto: Modal vs modais filhos, `memory_base` icon vs `AwMemoryBaseLogo` standalone, Stat Card Delta/hint conflict

**Precisão** (verdict: mostly_accurate)
- Gap **falso** no Button: análise marcou `ai-spectrum` e `ai-outline` como under-specified, mas `globals.css:1724+` e `:1850+` têm styling completo
- Inconsistência de severity entre Alert (dismissable=minor) e Toast (close=major) — mesmo conceito
- Avatar marcada como full mas tem divergência de naming (Small/Medium/Large vs sm/md/lg) — deveria ser partial

**Priorização** (verdict: inaccurate)
- Nav Rail priority 2 sendo organism L (deveria 3, L)
- Avatar/Checkbox/Progress priority 2 com parity=full (rebaixar para cosmetic/maintenance, liberar slot)
- Pill é o quick win absoluto (priority 1) e não estava flagged
- Effort subdimensionado: Card Brand é L (não M), Nav Rail é L (não M), Agent & Chat Patterns é XL (não L)

---

## Parking lot (pra retomar depois)

- **Cover stats**: agora 189/20/5 — texto já foi atualizado, mas confirmar que ficou bom
- **SKILL.md restore** das duas skills setup-design-system-from-* (Greg pediu pra deixar pendente)
- **Documentação visual nas 35 pages** (Onda D): só o piloto Breadcrumb está feito. Aplicar nos 34 restantes — header preto + Stage + API table + Tokens — começando pelos átomos
- **Icon** — Greg quis pausar: 28 ícones no Figma vs 163 usados no código + 3 custom glyphs (agent/agent_studio/memory_base). Estratégia recomendada: importar UI Kit Material Symbols oficial + portar 3 custom + vitrine de 163

---

## Próxima sessão — sugestão de ordem

1. **Cluster Quick Wins** (~6h): Pill, Status Dot, Avatar, Slider, Alert. Momentum visível.
2. **Icon (L)** como projeto isolado — destrava 80% do resto
3. Decidir **Modal ↔ modais filhos** antes de tocar Modal page
4. **Field & Input** + **Select** + **Dropdown Menu** (cluster de formulário)
5. **Nav Rail** como big project isolado
6. **Agent & Chat Patterns** (XL) por último

Para retomar: leia este doc, confira `git log` pra ver o estado das ondas, abra `AwSales DS Library` no Figma e o componente alvo no `components/ui/`.
