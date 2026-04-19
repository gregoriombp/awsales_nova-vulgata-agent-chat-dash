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
      { name: "Design Tokens", href: "/styleguide" },
      { name: "Iconografia", href: "/styleguide/foundation/iconography" },
      { name: "Logos", href: "/styleguide/foundation/logos" },
      { name: "Animação", href: "/styleguide/foundation/motion" },
      { name: "Acessibilidade", href: "/styleguide/foundation/accessibility" },
    ],
  },
  {
    title: "Components",
    items: [
      { name: "Alertas", href: "/styleguide/components/alerts" },
      { name: "Botões", href: "/styleguide/components/buttons" },
      { name: "Cards", href: "/styleguide/components/cards" },
      { name: "Chat bubbles", href: "/styleguide/components/chat" },
      { name: "Chrome", href: "/styleguide/components/chrome" },
      { name: "Controles", href: "/styleguide/components/controls" },
      { name: "Inputs", href: "/styleguide/components/inputs" },
      { name: "Modais", href: "/styleguide/components/modals" },
      { name: "Nav list", href: "/styleguide/components/nav-list" },
      { name: "Pills", href: "/styleguide/components/pills" },
      { name: "Tabela", href: "/styleguide/components/table" },
    ],
  },
]
