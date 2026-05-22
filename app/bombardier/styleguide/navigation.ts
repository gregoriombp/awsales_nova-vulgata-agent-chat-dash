export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
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
    title: "Brand",
    items: [
      { name: "Logo", href: "/bombardier/styleguide/foundation/logos" },
    ],
  },
  {
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
  {
    title: "Componentes",
    items: [
      { name: "Alertas", href: "/bombardier/styleguide/components/alerts" },
      { name: "Avatar", href: "/bombardier/styleguide/components/aw-avatar" },
      { name: "Botões", href: "/bombardier/styleguide/components/buttons" },
      { name: "Brand logo", href: "/bombardier/styleguide/components/brand-logo" },
      { name: "Breadcrumb", href: "/bombardier/styleguide/components/aw-breadcrumb" },
      { name: "Cards", href: "/bombardier/styleguide/components/cards" },
      { name: "Card brand", href: "/bombardier/styleguide/components/aw-card-brand" },
      { name: "Checkbox", href: "/bombardier/styleguide/components/aw-checkbox" },
      { name: "Chat bubbles", href: "/bombardier/styleguide/components/chat" },
      { name: "Chrome", href: "/bombardier/styleguide/components/chrome" },
      { name: "Connect modal", href: "/bombardier/styleguide/components/connect-modal" },
      { name: "Controles", href: "/bombardier/styleguide/components/controls" },
      { name: "Data table", href: "/bombardier/styleguide/components/data-table" },
      { name: "Dot tunnel", href: "/bombardier/styleguide/components/aw-dot-tunnel" },
      { name: "Dropdown menu", href: "/bombardier/styleguide/components/aw-dropdown-menu" },
      { name: "Empty", href: "/bombardier/styleguide/components/empty" },
      { name: "File icon", href: "/bombardier/styleguide/components/aw-file-icon" },
      { name: "Group card", href: "/bombardier/styleguide/components/aw-group-card" },
      { name: "Inputs", href: "/bombardier/styleguide/components/inputs" },
      { name: "Integration card", href: "/bombardier/styleguide/components/integration-card" },
      { name: "Integration catalog", href: "/bombardier/styleguide/components/integration-catalog" },
      { name: "List group", href: "/bombardier/styleguide/components/aw-list-group" },
      { name: "Members table", href: "/bombardier/styleguide/components/aw-members-table" },
      { name: "Modais", href: "/bombardier/styleguide/components/modals" },
      { name: "Nav list", href: "/bombardier/styleguide/components/nav-list" },
      { name: "Nav rail", href: "/bombardier/styleguide/components/nav-rail" },
      { name: "Onboarding shell", href: "/bombardier/styleguide/components/aw-onboarding-shell" },
      { name: "Onboarding timeline", href: "/bombardier/styleguide/components/aw-onboarding-timeline" },
      { name: "Option list", href: "/bombardier/styleguide/components/aw-option-list" },
      { name: "Page header", href: "/bombardier/styleguide/components/aw-page-header" },
      { name: "Payment method card", href: "/bombardier/styleguide/components/payment-method-card" },
      { name: "Pills", href: "/bombardier/styleguide/components/pills" },
      { name: "Progress", href: "/bombardier/styleguide/components/aw-progress" },
      { name: "Select", href: "/bombardier/styleguide/components/aw-select" },
      { name: "Sheet", href: "/bombardier/styleguide/components/sheet" },
      { name: "Shortcut tile", href: "/bombardier/styleguide/components/aw-shortcut-tile" },
      { name: "Skeleton", href: "/bombardier/styleguide/components/skeleton" },
      { name: "Specialists pair", href: "/bombardier/styleguide/components/aw-specialists-pair" },
      { name: "Stat card", href: "/bombardier/styleguide/components/aw-stat-card" },
      { name: "Stats display", href: "/bombardier/styleguide/components/stats-display" },
      { name: "Status dot", href: "/bombardier/styleguide/components/status-dot" },
      { name: "Tabela", href: "/bombardier/styleguide/components/table" },
      { name: "Tabs", href: "/bombardier/styleguide/components/aw-tabs" },
      { name: "Template builder sheet", href: "/bombardier/styleguide/components/template-builder-sheet" },
      { name: "Toast", href: "/bombardier/styleguide/components/toast" },
      { name: "Transition", href: "/bombardier/styleguide/components/aw-transition" },
      { name: "Visual dos agentes", href: "/bombardier/styleguide/components/agents" },
      { name: "Welcome modal", href: "/bombardier/styleguide/components/aw-welcome-modal" },
      { name: "WhatsApp panel", href: "/bombardier/styleguide/components/whatsapp-panel" },
    ],
  },
  {
    title: "UX Flows",
    items: [
      { name: "Primeiro acesso", href: "/bombardier/styleguide/ux-flows/primeiro-acesso" },
      { name: "Login e autenticação", href: "/bombardier/styleguide/ux-flows/login-auth" },
      { name: "Convite de membro", href: "/bombardier/styleguide/ux-flows/convite-membro" },
    ],
  },
]
