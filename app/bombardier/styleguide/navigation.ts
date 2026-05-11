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
      { name: "Review Mode", href: "/bombardier/styleguide/foundation/review-mode" },
      { name: "Review · Inbox", href: "/bombardier/styleguide/review" },
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
      { name: "File icon", href: "/bombardier/styleguide/components/aw-file-icon" },
      { name: "Inputs", href: "/bombardier/styleguide/components/inputs" },
      { name: "Integration card", href: "/bombardier/styleguide/components/integration-card" },
      { name: "Integration catalog", href: "/bombardier/styleguide/components/integration-catalog" },
      { name: "List group", href: "/bombardier/styleguide/components/aw-list-group" },
      { name: "Members table", href: "/bombardier/styleguide/components/aw-members-table" },
      { name: "Modais", href: "/bombardier/styleguide/components/modals" },
      { name: "Nav list", href: "/bombardier/styleguide/components/nav-list" },
      { name: "Nav rail", href: "/bombardier/styleguide/components/nav-rail" },
      { name: "Option list", href: "/bombardier/styleguide/components/aw-option-list" },
      { name: "Page header", href: "/bombardier/styleguide/components/aw-page-header" },
      { name: "Pills", href: "/bombardier/styleguide/components/pills" },
      { name: "Sheet", href: "/bombardier/styleguide/components/sheet" },
      { name: "Skeleton", href: "/bombardier/styleguide/components/skeleton" },
      { name: "Specialists pair", href: "/bombardier/styleguide/components/aw-specialists-pair" },
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
      { name: "Onboarding shell", href: "/bombardier/styleguide/playground/components/aw-onboarding-shell" },
      { name: "Primeiro acesso · 02 boas-vindas", href: "/primeiro-acesso/boas-vindas" },
      { name: "Primeiro acesso · 03 revisão", href: "/primeiro-acesso/revisao" },
      { name: "Primeiro acesso · 04 pagamento", href: "/primeiro-acesso/pagamento" },
      { name: "Primeiro acesso · 05 checkout pix", href: "/primeiro-acesso/checkout/pix" },
      { name: "Primeiro acesso · 05 checkout cartão", href: "/primeiro-acesso/checkout/cartao" },
      { name: "Primeiro acesso · 05 checkout boleto", href: "/primeiro-acesso/checkout/boleto" },
      { name: "Primeiro acesso · 06 confirmado", href: "/primeiro-acesso/confirmado" },
      { name: "Primeiro acesso · 07 acesso", href: "/primeiro-acesso/acesso" },
      { name: "Início · welcome modal", href: "/inicio?welcome=1" },
    ],
  },
]
