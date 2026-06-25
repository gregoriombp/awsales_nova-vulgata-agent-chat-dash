export interface NavItem {
  name: string
  href: string
  /** Hidden search terms that should route to this canonical page. */
  aliases?: string[]
  children?: NavItem[]
}

export interface NavSection {
  /** Optional super-category. Consecutive sections that share the same `group`
   *  render under one bigger heading — a tier above the section title. Sections
   *  without a `group` render standalone (no super-heading). */
  group?: string
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: "Introdução",
    items: [
      { name: "Visão geral", href: "/bombardier/styleguide" },
    ],
  },
  {
    group: "Base",
    title: "Marca",
    items: [
      {
        name: "A marca",
        href: "/bombardier/styleguide/marca/sobre",
        aliases: ["brand", "história", "manifesto", "sobre", "aswork", "posicionamento"],
      },
      {
        name: "Tom de voz",
        href: "/bombardier/styleguide/marca/tom-de-voz",
        aliases: ["voz", "voice", "confiança silenciosa", "posturas", "copy de marca"],
      },
      { name: "Logo", href: "/bombardier/styleguide/foundation/logos" },
      {
        name: "Imageria",
        href: "/bombardier/styleguide/marca/imageria",
        aliases: ["fotografia", "imagens", "texturas", "whitefield", "lunar"],
      },
      {
        name: "Ilustrações",
        href: "/bombardier/styleguide/marca/ilustracoes",
        aliases: ["AwBrandIllustration", "line-art", "layers", "ignition", "constellation"],
      },
    ],
  },
  {
    group: "Base",
    title: "Foundations",
    items: [
      { name: "Cor", href: "/bombardier/styleguide/foundation/color" },
      { name: "Tipografia", href: "/bombardier/styleguide/foundation/typography" },
      { name: "Spacing", href: "/bombardier/styleguide/foundation/spacing" },
      { name: "Grid", href: "/bombardier/styleguide/foundation/grid" },
      { name: "Gradient", href: "/bombardier/styleguide/foundation/gradient" },
      { name: "Iconografia", href: "/bombardier/styleguide/foundation/iconography" },
      { name: "Animação", href: "/bombardier/styleguide/foundation/motion" },
      { name: "Padrões de UI", href: "/bombardier/styleguide/foundation/patterns" },
      { name: "Acessibilidade", href: "/bombardier/styleguide/foundation/accessibility" },
      { name: "Escrita", href: "/bombardier/styleguide/foundation/content" },
    ],
    // foundation/review-mode existe, mas é intencionalmente NÃO listada aqui:
    // é a doc do Review Mode (produto Bombardier), fora do styleguide do produto.
  },
  // ── Camadas do design system (pirâmide: do mais fundamental ao mais específico).
  //    Taxonomia governada em docs/component-layers.md. Só o agrupamento muda aqui;
  //    nenhum href muda, components/ui/ permanece plano de propósito.
  {
    group: "Biblioteca",
    title: "Primitivos",
    items: [
      {
        name: "Accordion",
        href: "/bombardier/styleguide/components/aw-accordion",
        aliases: ["AwAccordion", "disclosure", "expandir", "colapsar", "faq", "sanfona", "collapsible"],
      },
      { name: "Alertas", href: "/bombardier/styleguide/components/alerts" },
      { name: "Avatar", href: "/bombardier/styleguide/components/aw-avatar" },
      { name: "Botões", href: "/bombardier/styleguide/components/buttons" },
      { name: "Breadcrumb", href: "/bombardier/styleguide/components/aw-breadcrumb" },
      {
        name: "Browser icon",
        href: "/bombardier/styleguide/components/aw-browser-icon",
        aliases: ["AwBrowserIcon", "navegador", "chrome", "firefox", "safari", "edge", "sessões", "acessos"],
      },
      {
        name: "Calendário",
        href: "/bombardier/styleguide/components/calendar",
        aliases: ["Calendar", "calendar", "date picker", "period picker", "seletor de período", "range picker"],
      },
      { name: "Checkbox", href: "/bombardier/styleguide/components/aw-checkbox" },
      {
        name: "Collapsible",
        href: "/bombardier/styleguide/components/aw-collapsible",
        aliases: ["AwCollapsible", "disclosure", "ver mais", "expandir linha", "histórico", "show more"],
      },
      { name: "Controles", href: "/bombardier/styleguide/components/controls" },
      { name: "Dropdown menu", href: "/bombardier/styleguide/components/aw-dropdown-menu" },
      { name: "Dropzone", href: "/bombardier/styleguide/components/aw-dropzone" },
      { name: "Empty", href: "/bombardier/styleguide/components/empty" },
      { name: "File icon", href: "/bombardier/styleguide/components/aw-file-icon" },
      {
        name: "Fluid kit (preview)",
        href: "/bombardier/styleguide/components/fluid-kit",
        aliases: ["fluid", "spring", "badge", "accordion", "dialog", "dropdown", "switch", "slider", "checkbox group", "radio group"],
      },
      { name: "Inputs", href: "/bombardier/styleguide/components/inputs" },
      { name: "Pills", href: "/bombardier/styleguide/components/pills" },
      { name: "Progress", href: "/bombardier/styleguide/components/aw-progress" },
      {
        name: "Radial progress",
        href: "/bombardier/styleguide/components/aw-radial-progress",
        aliases: ["AwRadialProgress", "anel", "circular", "ring", "donut", "consumo", "quota"],
      },
      { name: "Select", href: "/bombardier/styleguide/components/aw-select" },
      { name: "Skeleton", href: "/bombardier/styleguide/components/skeleton" },
      { name: "Slider", href: "/bombardier/styleguide/components/aw-slider" },
      { name: "Status dot", href: "/bombardier/styleguide/components/status-dot" },
      { name: "Tabs", href: "/bombardier/styleguide/components/aw-tabs" },
      { name: "Toast", href: "/bombardier/styleguide/components/toast" },
      { name: "Transition", href: "/bombardier/styleguide/components/aw-transition" },
    ],
  },
  {
    group: "Biblioteca",
    title: "Componentes",
    items: [
      {
        name: "Agent run trace",
        href: "/bombardier/styleguide/components/aw-agent-run-trace",
        aliases: ["AwAgentRunTrace", "run trace", "timeline", "trace", "execução", "passos da run"],
      },
      {
        name: "Agent status badge",
        href: "/bombardier/styleguide/components/aw-agent-status-badge",
        aliases: ["AwAgentStatusBadge", "status do agente", "ciclo de vida", "draft", "training", "ready", "lifecycle"],
      },
      { name: "Audit type badge", href: "/bombardier/styleguide/components/aw-audit-type-badge" },
      { name: "Beams", href: "/bombardier/styleguide/components/aw-beams" },
      {
        name: "Breadcrumbs bar",
        href: "/bombardier/styleguide/components/aw-breadcrumbs-bar",
        aliases: ["AwBreadcrumbsBar", "AwBreadcrumbs", "trilha", "chrome", "navegação"],
      },
      { name: "Card brand", href: "/bombardier/styleguide/components/aw-card-brand" },
      { name: "Cards", href: "/bombardier/styleguide/components/cards" },
      { name: "Channel icon", href: "/bombardier/styleguide/components/aw-channel-icon" },
      { name: "Chat bubbles", href: "/bombardier/styleguide/components/chat" },
      { name: "Chrome", href: "/bombardier/styleguide/components/chrome" },
      { name: "Consumption bar", href: "/bombardier/styleguide/components/aw-consumption-bar" },
      { name: "Cost breakdown", href: "/bombardier/styleguide/components/aw-cost-breakdown" },
      { name: "Dot tunnel", href: "/bombardier/styleguide/components/aw-dot-tunnel" },
      {
        name: "Gráficos",
        href: "/bombardier/styleguide/components/aw-chart",
        aliases: ["AwChart", "charts", "data-viz", "recharts", "gráfico", "dataviz"],
      },
      { name: "Group card", href: "/bombardier/styleguide/components/aw-group-card" },
      {
        name: "Input message",
        href: "/bombardier/styleguide/components/aw-input-message",
        aliases: ["AwInputMessage", "composer", "chat input", "mensagem"],
      },
      { name: "Invoice forecast card", href: "/bombardier/styleguide/components/aw-invoice-forecast-card" },
      { name: "Invoice row", href: "/bombardier/styleguide/components/aw-invoice-row" },
      { name: "List group", href: "/bombardier/styleguide/components/aw-list-group" },
      {
        name: "Modais e dialogs",
        href: "/bombardier/styleguide/components/modals",
        aliases: [
          "AwModal",
          "Connect modal",
          "AwConnectModal",
          "Welcome modal",
          "AwWelcomeModal",
          "Contact channel modal",
          "AwContactChannelModal",
        ],
        children: [
          { name: "AwModal", href: "/bombardier/styleguide/components/modals#aw-modal" },
          { name: "Connect modal", href: "/bombardier/styleguide/components/connect-modal" },
          { name: "Contact channel modal", href: "/bombardier/styleguide/components/aw-contact-channel-modal" },
          { name: "Welcome modal", href: "/bombardier/styleguide/components/aw-welcome-modal" },
        ],
      },
      { name: "Nav list", href: "/bombardier/styleguide/components/nav-list" },
      { name: "Nav rail", href: "/bombardier/styleguide/components/nav-rail" },
      { name: "Nav tree", href: "/bombardier/styleguide/components/aw-nav-tree" },
      { name: "Notification card", href: "/bombardier/styleguide/components/aw-notification-card" },
      { name: "Notificações", href: "/bombardier/styleguide/components/aw-notifications-panel" },
      { name: "Option list", href: "/bombardier/styleguide/components/aw-option-list" },
      { name: "Page header", href: "/bombardier/styleguide/components/aw-page-header" },
      { name: "Payment method card", href: "/bombardier/styleguide/components/payment-method-card" },
      { name: "Payment method chip", href: "/bombardier/styleguide/components/aw-payment-method-chip" },
      { name: "Payment method row", href: "/bombardier/styleguide/components/aw-payment-method-row" },
      { name: "Plan summary card", href: "/bombardier/styleguide/components/aw-plan-summary-card" },
      {
        name: "Sheets e drawers",
        href: "/bombardier/styleguide/components/sheet",
        aliases: [
          "AwSheet",
          "Template builder sheet",
          "AwTemplateBuilderSheet",
          "Drawer",
          "Painel lateral",
        ],
        children: [
          { name: "Template builder sheet", href: "/bombardier/styleguide/components/template-builder-sheet" },
        ],
      },
      { name: "Shortcut tile", href: "/bombardier/styleguide/components/aw-shortcut-tile" },
      {
        name: "Source chip",
        href: "/bombardier/styleguide/components/aw-source-chip",
        aliases: ["AwSourceChip", "citação", "citation", "fonte", "grounding", "referência", "memory base"],
      },
      { name: "Stat card", href: "/bombardier/styleguide/components/aw-stat-card" },
      {
        name: "Stat group",
        href: "/bombardier/styleguide/components/aw-stat-group",
        aliases: ["AwStatGroup", "acessos", "KPI", "faixa de stats", "stat row", "métricas"],
      },
      {
        name: "Tabelas",
        href: "/bombardier/styleguide/components/table",
        aliases: [
          "AwTable",
          "Data table",
          "DataTable",
          "Members table",
          "AwMembersTable",
          "tool-ui data-table",
        ],
        children: [
          { name: "AwTable", href: "/bombardier/styleguide/components/table#aw-table" },
          { name: "Members table", href: "/bombardier/styleguide/components/aw-members-table" },
        ],
      },
      {
        name: "Thinking steps",
        href: "/bombardier/styleguide/components/aw-thinking-steps",
        aliases: ["AwThinkingSteps", "raciocínio", "reasoning", "chain of thought"],
      },
      {
        name: "Tool call card",
        href: "/bombardier/styleguide/components/aw-tool-call-card",
        aliases: ["AwToolCallCard", "tool call", "function call", "chamada de tool", "integração"],
      },
      { name: "Trend delta", href: "/bombardier/styleguide/components/aw-trend-delta" },
    ],
  },
  {
    group: "Biblioteca",
    title: "Padrões",
    items: [
      { name: "Backup codes", href: "/bombardier/styleguide/components/aw-backup-codes" },
      {
        name: "Integration catalog",
        href: "/bombardier/styleguide/components/integration-catalog",
        aliases: ["AwIntegrationCatalog", "AwAddIntegrationModal", "Add integration modal", "catálogo de integrações"],
      },
      { name: "Onboarding shell", href: "/bombardier/styleguide/components/aw-onboarding-shell" },
      { name: "Onboarding timeline", href: "/bombardier/styleguide/components/aw-onboarding-timeline" },
      { name: "Password setup", href: "/bombardier/styleguide/components/aw-password-setup" },
      { name: "QR placeholder", href: "/bombardier/styleguide/components/aw-qr-placeholder" },
    ],
  },
  {
    group: "Biblioteca",
    title: "Domínio",
    // Infra/layout intencionalmente NÃO listada aqui (não rende inline com
    // sentido): AwThemeProvider, AwDashboardLayout, AwSidebar. AwHeader e
    // AwNeuralPattern são internos — consumidos por AwDashboardLayout e
    // AwOnboardingShell, sem showcase próprio de propósito.
    items: [
      { name: "Banner de plano adicional", href: "/bombardier/styleguide/components/aw-additional-plan-banner" },
      { name: "Report promo", href: "/bombardier/styleguide/components/aw-report-promo", aliases: ["AwReportPromo", "consumo e custos", "faixa de relatório", "cta relatório"] },
      { name: "Brand logo", href: "/bombardier/styleguide/components/brand-logo" },
      {
        name: "Memory Base logo",
        href: "/bombardier/styleguide/components/aw-memory-base-logo",
        aliases: ["AwMemoryBaseLogo", "memory base", "logo animado", "welcome icon"],
      },
      { name: "Capability tile", href: "/bombardier/styleguide/components/aw-capability-tile" },
      { name: "Checkpoint chip", href: "/bombardier/styleguide/components/aw-checkpoint-chip" },
      { name: "Integration card", href: "/bombardier/styleguide/components/integration-card" },
      { name: "Mention menu", href: "/bombardier/styleguide/components/aw-mention-menu" },
      { name: "Specialists pair", href: "/bombardier/styleguide/components/aw-specialists-pair" },
      {
        name: "Visual dos agentes",
        href: "/bombardier/styleguide/components/agents",
        aliases: [
          "Agent Core",
          "AwAgentCore",
          "Agente do Usuário",
          "User agent",
          "AwUserAgentOrb",
          "Cortex",
          "AwCopilotOrb",
        ],
        children: [
          { name: "Agent Core", href: "/bombardier/styleguide/components/agent-core" },
          { name: "Agente do Usuário", href: "/bombardier/styleguide/components/user-agent" },
          { name: "Cortex", href: "/bombardier/styleguide/components/agents#cortex" },
        ],
      },
      {
        name: "Agent avatar",
        href: "/bombardier/styleguide/components/aw-agent-avatar",
        aliases: ["AwAgentAvatar", "avatar do agente", "orb + core", "qual core", "status dot"],
      },
      {
        name: "Cortex synthesis",
        href: "/bombardier/styleguide/components/aw-cortex-synthesis",
        aliases: ["AwCortexSynthesis", "shader", "webgl", "neural", "textura", "fundo animado", "synthesis"],
      },
      {
        name: "Copilot drawer",
        href: "/bombardier/styleguide/components/aw-copilot-drawer",
        aliases: ["AwCopilotDrawer", "AwCopilotOrb", "Cortex", "assistente", "drawer", "painel lateral", "copilot"],
      },
      {
        name: "Instagram panel",
        href: "/bombardier/styleguide/components/instagram-panel",
        aliases: ["AwInstagramPanel", "canais", "DM", "stories", "comentários"],
      },
      {
        name: "Messenger panel",
        href: "/bombardier/styleguide/components/messenger-panel",
        aliases: ["AwMessengerPanel", "canais", "facebook", "página", "ice breakers"],
      },
      { name: "WhatsApp panel", href: "/bombardier/styleguide/components/whatsapp-panel" },
    ],
  },
  {
    group: "UX Flows",
    title: "Onboarding",
    items: [
      { name: "Primeiro acesso", href: "/bombardier/styleguide/ux-flows/primeiro-acesso" },
      { name: "Convite de membro", href: "/bombardier/styleguide/ux-flows/convite-membro" },
      { name: "Organização adicional", href: "/bombardier/styleguide/ux-flows/organizacao-adicional" },
    ],
  },
  {
    group: "UX Flows",
    title: "Acesso",
    items: [
      { name: "Login", href: "/bombardier/styleguide/ux-flows/login-auth" },
    ],
  },
  {
    group: "UX Flows",
    title: "Visões compiladas",
    items: [
      { name: "Criar agente — visão compilada", href: "/bombardier/styleguide/ux-flows/criar-agente-visao-global" },
    ],
  },
  {
    group: "UX Flows",
    title: "Experimentos",
    items: [
      { name: "POC · Visão global", href: "/bombardier/styleguide/ux-flows/poc-visao-global" },
    ],
  },
  {
    group: "UX Flows",
    title: "Memory Base",
    items: [
      { name: "Criar base de conhecimento", href: "/bombardier/styleguide/ux-flows/criar-base-de-conhecimento" },
    ],
  },
  {
    group: "UX Flows",
    title: "Canais",
    items: [
      { name: "Canais", href: "/bombardier/styleguide/ux-flows/canais" },
    ],
  },
]
