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
    title: "Foundation",
    items: [
      { name: "Design Tokens", href: "/bombardier/styleguide" },
      { name: "Iconografia", href: "/bombardier/styleguide/foundation/iconography" },
      { name: "Logos", href: "/bombardier/styleguide/foundation/logos" },
      { name: "Animação", href: "/bombardier/styleguide/foundation/motion" },
      { name: "Acessibilidade", href: "/bombardier/styleguide/foundation/accessibility" },
      { name: "Escrita", href: "/bombardier/styleguide/foundation/content" },
      { name: "Padrões de UI", href: "/bombardier/styleguide/foundation/patterns" },
    ],
  },
  {
    title: "Components",
    items: [
      { name: "Alertas", href: "/bombardier/styleguide/components/alerts" },
      { name: "Botões", href: "/bombardier/styleguide/components/buttons" },
      { name: "Brand logo", href: "/bombardier/styleguide/components/brand-logo" },
      { name: "Breadcrumb", href: "/bombardier/styleguide/components/aw-breadcrumb" },
      { name: "Cards", href: "/bombardier/styleguide/components/cards" },
      { name: "Chat bubbles", href: "/bombardier/styleguide/components/chat" },
      { name: "Chrome", href: "/bombardier/styleguide/components/chrome" },
      { name: "Connect modal", href: "/bombardier/styleguide/components/connect-modal" },
      { name: "Controles", href: "/bombardier/styleguide/components/controls" },
      { name: "Dropdown menu", href: "/bombardier/styleguide/components/aw-dropdown-menu" },
      { name: "Empty", href: "/bombardier/styleguide/components/empty" },
      { name: "Inputs", href: "/bombardier/styleguide/components/inputs" },
      { name: "Integration card", href: "/bombardier/styleguide/components/integration-card" },
      { name: "Integration catalog", href: "/bombardier/styleguide/components/integration-catalog" },
      { name: "List group", href: "/bombardier/styleguide/components/aw-list-group" },
      { name: "Modais", href: "/bombardier/styleguide/components/modals" },
      { name: "Nav list", href: "/bombardier/styleguide/components/nav-list" },
      { name: "Nav rail", href: "/bombardier/styleguide/components/nav-rail" },
      { name: "Pills", href: "/bombardier/styleguide/components/pills" },
      { name: "Sheet", href: "/bombardier/styleguide/components/sheet" },
      { name: "Skeleton", href: "/bombardier/styleguide/components/skeleton" },
      { name: "Status dot", href: "/bombardier/styleguide/components/status-dot" },
      { name: "Tabela", href: "/bombardier/styleguide/components/table" },
      { name: "Template builder sheet", href: "/bombardier/styleguide/components/template-builder-sheet" },
      { name: "Toast", href: "/bombardier/styleguide/components/toast" },
      { name: "WhatsApp panel", href: "/bombardier/styleguide/components/whatsapp-panel" },
    ],
  },
  {
    title: "Playground",
    items: [
      { name: "Componentes propostos", href: "/bombardier/styleguide/components/playground" },
      { name: "AwStatCard", href: "/bombardier/styleguide/playground/components/aw-stat-card" },
    ],
  },
]
