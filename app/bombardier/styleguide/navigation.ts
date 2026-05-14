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
    title: "Foundations",
    items: [
      { name: "Cor", href: "/bombardier/styleguide/foundation/color" },
      { name: "Tipografia", href: "/bombardier/styleguide/foundation/typography" },
      { name: "Spacing", href: "/bombardier/styleguide/foundation/spacing" },
      { name: "Grid", href: "/bombardier/styleguide/foundation/grid" },
      { name: "Gradient", href: "/bombardier/styleguide/foundation/gradient" },
      { name: "Iconografia", href: "/bombardier/styleguide/foundation/iconography" },
      { name: "Logos", href: "/bombardier/styleguide/foundation/logos" },
      { name: "Animação", href: "/bombardier/styleguide/foundation/motion" },
      { name: "Padrões de UI", href: "/bombardier/styleguide/foundation/patterns" },
      { name: "Acessibilidade", href: "/bombardier/styleguide/foundation/accessibility" },
      { name: "Escrita", href: "/bombardier/styleguide/foundation/content" },
    ],
  },
  {
    title: "Identidade visual",
    items: [
      { name: "Brand logo", href: "/bombardier/styleguide/components/brand-logo" },
      { name: "Avatar", href: "/bombardier/styleguide/components/aw-avatar" },
      { name: "File icon", href: "/bombardier/styleguide/components/aw-file-icon" },
      { name: "Status dot", href: "/bombardier/styleguide/components/status-dot" },
    ],
  },
  {
    title: "Inputs & formulários",
    items: [
      { name: "Inputs", href: "/bombardier/styleguide/components/inputs" },
      { name: "Select", href: "/bombardier/styleguide/components/aw-select" },
      { name: "Tabs", href: "/bombardier/styleguide/components/aw-tabs" },
      { name: "Controles", href: "/bombardier/styleguide/components/controls" },
      { name: "Progress", href: "/bombardier/styleguide/components/aw-progress" },
    ],
  },
  {
    title: "Ações",
    items: [
      { name: "Botões", href: "/bombardier/styleguide/components/buttons" },
      { name: "Pills", href: "/bombardier/styleguide/components/pills" },
    ],
  },
  {
    title: "Navegação",
    items: [
      { name: "Page header", href: "/bombardier/styleguide/components/aw-page-header" },
      { name: "Breadcrumb", href: "/bombardier/styleguide/components/aw-breadcrumb" },
      { name: "Chrome", href: "/bombardier/styleguide/components/chrome" },
      { name: "Nav rail", href: "/bombardier/styleguide/components/nav-rail" },
      { name: "Nav list", href: "/bombardier/styleguide/components/nav-list" },
      { name: "Dropdown menu", href: "/bombardier/styleguide/components/aw-dropdown-menu" },
      { name: "Option list", href: "/bombardier/styleguide/components/aw-option-list" },
    ],
  },
  {
    title: "Containers & layout",
    items: [
      { name: "Cards", href: "/bombardier/styleguide/components/cards" },
      { name: "Card brand", href: "/bombardier/styleguide/components/aw-card-brand" },
      { name: "Group card", href: "/bombardier/styleguide/components/aw-group-card" },
      { name: "Stat card", href: "/bombardier/styleguide/components/aw-stat-card" },
      { name: "Sheet", href: "/bombardier/styleguide/components/sheet" },
      { name: "Onboarding shell", href: "/bombardier/styleguide/components/aw-onboarding-shell" },
      { name: "Empty", href: "/bombardier/styleguide/components/empty" },
      { name: "Skeleton", href: "/bombardier/styleguide/components/skeleton" },
    ],
  },
  {
    title: "Listas & tabelas",
    items: [
      { name: "Tabela", href: "/bombardier/styleguide/components/table" },
      { name: "Members table", href: "/bombardier/styleguide/components/aw-members-table" },
      { name: "List group", href: "/bombardier/styleguide/components/aw-list-group" },
    ],
  },
  {
    title: "Movimento",
    items: [
      { name: "Transition", href: "/bombardier/styleguide/components/aw-transition" },
    ],
  },
  {
    title: "Feedback",
    items: [
      { name: "Alertas", href: "/bombardier/styleguide/components/alerts" },
      { name: "Modais", href: "/bombardier/styleguide/components/modals" },
      { name: "Toast", href: "/bombardier/styleguide/components/toast" },
    ],
  },
  {
    title: "Comunicação & domínio",
    items: [
      { name: "Chat bubbles", href: "/bombardier/styleguide/components/chat" },
      { name: "WhatsApp panel", href: "/bombardier/styleguide/components/whatsapp-panel" },
      { name: "Specialists pair", href: "/bombardier/styleguide/components/aw-specialists-pair" },
    ],
  },
  {
    title: "Agentes",
    items: [
      { name: "Visual dos agentes", href: "/bombardier/styleguide/components/agents" },
    ],
  },
  {
    title: "Integrações",
    items: [
      { name: "Integration catalog", href: "/bombardier/styleguide/components/integration-catalog" },
      { name: "Integration card", href: "/bombardier/styleguide/components/integration-card" },
      { name: "Connect modal", href: "/bombardier/styleguide/components/connect-modal" },
      { name: "Template builder sheet", href: "/bombardier/styleguide/components/template-builder-sheet" },
    ],
  },
  {
    title: "UX Flows",
    items: [
      { name: "Primeiro acesso", href: "/bombardier/styleguide/ux-flows/primeiro-acesso" },
    ],
  },
]
