export interface NavItem {
  name: string
  href: string
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
    title: "Brand",
    items: [
      { name: "Logo", href: "/bombardier/styleguide/foundation/logos" },
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
  },
  // ── Camadas do design system (pirâmide: do mais fundamental ao mais específico).
  //    Taxonomia governada em docs/component-layers.md. Só o agrupamento muda aqui;
  //    nenhum href muda, components/ui/ permanece plano de propósito.
  {
    group: "Biblioteca",
    title: "Primitivos",
    items: [
      { name: "Alertas", href: "/bombardier/styleguide/components/alerts" },
      { name: "Avatar", href: "/bombardier/styleguide/components/aw-avatar" },
      { name: "Botões", href: "/bombardier/styleguide/components/buttons" },
      { name: "Breadcrumb", href: "/bombardier/styleguide/components/aw-breadcrumb" },
      { name: "Checkbox", href: "/bombardier/styleguide/components/aw-checkbox" },
      { name: "Controles", href: "/bombardier/styleguide/components/controls" },
      { name: "Dropdown menu", href: "/bombardier/styleguide/components/aw-dropdown-menu" },
      { name: "Empty", href: "/bombardier/styleguide/components/empty" },
      { name: "File icon", href: "/bombardier/styleguide/components/aw-file-icon" },
      { name: "Inputs", href: "/bombardier/styleguide/components/inputs" },
      { name: "Pills", href: "/bombardier/styleguide/components/pills" },
      { name: "Progress", href: "/bombardier/styleguide/components/aw-progress" },
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
      { name: "Card brand", href: "/bombardier/styleguide/components/aw-card-brand" },
      { name: "Cards", href: "/bombardier/styleguide/components/cards" },
      { name: "Chat bubbles", href: "/bombardier/styleguide/components/chat" },
      { name: "Chrome", href: "/bombardier/styleguide/components/chrome" },
      { name: "Data table", href: "/bombardier/styleguide/components/data-table" },
      { name: "Dot tunnel", href: "/bombardier/styleguide/components/aw-dot-tunnel" },
      { name: "Group card", href: "/bombardier/styleguide/components/aw-group-card" },
      { name: "List group", href: "/bombardier/styleguide/components/aw-list-group" },
      { name: "Members table", href: "/bombardier/styleguide/components/aw-members-table" },
      { name: "Modais", href: "/bombardier/styleguide/components/modals" },
      { name: "Nav list", href: "/bombardier/styleguide/components/nav-list" },
      { name: "Nav rail", href: "/bombardier/styleguide/components/nav-rail" },
      { name: "Notificações", href: "/bombardier/styleguide/components/aw-notifications-panel" },
      { name: "Option list", href: "/bombardier/styleguide/components/aw-option-list" },
      { name: "Page header", href: "/bombardier/styleguide/components/aw-page-header" },
      { name: "Payment method card", href: "/bombardier/styleguide/components/payment-method-card" },
      { name: "Sheet", href: "/bombardier/styleguide/components/sheet" },
      { name: "Shortcut tile", href: "/bombardier/styleguide/components/aw-shortcut-tile" },
      { name: "Stat card", href: "/bombardier/styleguide/components/aw-stat-card" },
      { name: "Stats display", href: "/bombardier/styleguide/components/stats-display" },
      { name: "Tabela", href: "/bombardier/styleguide/components/table" },
    ],
  },
  {
    group: "Biblioteca",
    title: "Padrões",
    items: [
      { name: "Backup codes", href: "/bombardier/styleguide/components/aw-backup-codes" },
      { name: "Connect modal", href: "/bombardier/styleguide/components/connect-modal" },
      { name: "Integration catalog", href: "/bombardier/styleguide/components/integration-catalog" },
      { name: "Onboarding shell", href: "/bombardier/styleguide/components/aw-onboarding-shell" },
      { name: "Onboarding timeline", href: "/bombardier/styleguide/components/aw-onboarding-timeline" },
      { name: "Password setup", href: "/bombardier/styleguide/components/aw-password-setup" },
      { name: "QR placeholder", href: "/bombardier/styleguide/components/aw-qr-placeholder" },
      { name: "Template builder sheet", href: "/bombardier/styleguide/components/template-builder-sheet" },
      { name: "Welcome modal", href: "/bombardier/styleguide/components/aw-welcome-modal" },
    ],
  },
  {
    group: "Biblioteca",
    title: "Domínio",
    items: [
      { name: "Agent Core", href: "/bombardier/styleguide/components/agent-core" },
      { name: "Agente do Usuário", href: "/bombardier/styleguide/components/user-agent" },
      { name: "Banner de plano adicional", href: "/bombardier/styleguide/components/aw-additional-plan-banner" },
      { name: "Brand logo", href: "/bombardier/styleguide/components/brand-logo" },
      { name: "Capability tile", href: "/bombardier/styleguide/components/aw-capability-tile" },
      { name: "Integration card", href: "/bombardier/styleguide/components/integration-card" },
      { name: "Specialists pair", href: "/bombardier/styleguide/components/aw-specialists-pair" },
      { name: "Visual dos agentes", href: "/bombardier/styleguide/components/agents" },
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
    title: "Memory Base",
    items: [
      { name: "Criar base de conhecimento", href: "/bombardier/styleguide/ux-flows/criar-base-de-conhecimento" },
    ],
  },
]
