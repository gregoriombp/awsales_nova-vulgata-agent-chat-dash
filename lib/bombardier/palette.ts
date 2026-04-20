export type PropField =
  | { kind: "text"; label: string; placeholder?: string }
  | { kind: "textarea"; label: string; placeholder?: string }
  | { kind: "select"; label: string; options: readonly string[] }
  | { kind: "boolean"; label: string }
  | { kind: "color"; label: string }
  | {
      kind: "number"
      label: string
      min?: number
      max?: number
      step?: number
      suffix?: string
    }

export type PaletteGroup = "layout" | "content" | "component"

export type PaletteItem = {
  type: string
  label: string
  icon: string
  group: PaletteGroup
  isContainer?: boolean
  defaultProps: Record<string, unknown>
  propSchema: Record<string, PropField>
}

const SIZE_OPTIONS = ["none", "xs", "sm", "md", "lg", "xl", "2xl"] as const
const PAD_OPTIONS = ["none", "xs", "sm", "md", "lg", "xl", "2xl"] as const
const ALIGN_OPTIONS = ["start", "center", "end", "stretch"] as const
const JUSTIFY_OPTIONS = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
] as const
const RADIUS_OPTIONS = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"] as const
const SHADOW_OPTIONS = ["none", "xs", "sm", "md", "lg", "overlay"] as const
const WIDTH_OPTIONS = ["auto", "100%", "75%", "50%", "33%", "25%"] as const
const TEXT_ALIGN_OPTIONS = ["left", "center", "right", "justify"] as const

export const palette: PaletteItem[] = [
  // ============= LAYOUT =============
  {
    type: "stack",
    label: "Coluna",
    icon: "view_day",
    group: "layout",
    isContainer: true,
    defaultProps: {
      gap: "md",
      padding: "md",
      align: "stretch",
      justify: "start",
      className: "",
    },
    propSchema: {
      gap: { kind: "select", label: "Gap", options: SIZE_OPTIONS },
      padding: { kind: "select", label: "Padding", options: PAD_OPTIONS },
      align: { kind: "select", label: "Alinhar", options: ALIGN_OPTIONS },
      justify: {
        kind: "select",
        label: "Distribuir",
        options: JUSTIFY_OPTIONS,
      },
      className: { kind: "text", label: "className (livre)" },
    },
  },
  {
    type: "row",
    label: "Linha",
    icon: "view_week",
    group: "layout",
    isContainer: true,
    defaultProps: {
      gap: "md",
      padding: "md",
      align: "center",
      justify: "start",
      wrap: false,
      className: "",
    },
    propSchema: {
      gap: { kind: "select", label: "Gap", options: SIZE_OPTIONS },
      padding: { kind: "select", label: "Padding", options: PAD_OPTIONS },
      align: { kind: "select", label: "Alinhar vertical", options: ALIGN_OPTIONS },
      justify: {
        kind: "select",
        label: "Distribuir horizontal",
        options: JUSTIFY_OPTIONS,
      },
      wrap: { kind: "boolean", label: "Quebra de linha" },
      className: { kind: "text", label: "className (livre)" },
    },
  },
  {
    type: "grid",
    label: "Grid",
    icon: "grid_view",
    group: "layout",
    isContainer: true,
    defaultProps: {
      columns: "3",
      gap: "md",
      padding: "md",
      rowGap: "",
      className: "",
    },
    propSchema: {
      columns: {
        kind: "select",
        label: "Colunas",
        options: ["1", "2", "3", "4", "5", "6", "8", "12"],
      },
      gap: { kind: "select", label: "Gap", options: SIZE_OPTIONS },
      rowGap: {
        kind: "select",
        label: "Row gap (opcional)",
        options: ["", ...SIZE_OPTIONS],
      },
      padding: { kind: "select", label: "Padding", options: PAD_OPTIONS },
      className: { kind: "text", label: "className (livre)" },
    },
  },
  {
    type: "box",
    label: "Box",
    icon: "crop_square",
    group: "layout",
    isContainer: true,
    defaultProps: {
      background: "",
      foreground: "",
      padding: "md",
      borderRadius: "md",
      border: false,
      borderColor: "",
      shadow: "none",
      width: "auto",
      minHeight: 0,
      textAlign: "left",
      className: "",
    },
    propSchema: {
      background: { kind: "color", label: "Fundo" },
      foreground: { kind: "color", label: "Cor do texto" },
      padding: { kind: "select", label: "Padding", options: PAD_OPTIONS },
      borderRadius: {
        kind: "select",
        label: "Arredondamento",
        options: RADIUS_OPTIONS,
      },
      border: { kind: "boolean", label: "Borda" },
      borderColor: { kind: "color", label: "Cor da borda" },
      shadow: { kind: "select", label: "Sombra", options: SHADOW_OPTIONS },
      width: { kind: "select", label: "Largura", options: WIDTH_OPTIONS },
      minHeight: { kind: "number", label: "Altura mínima", min: 0, suffix: "px" },
      textAlign: {
        kind: "select",
        label: "Alinhamento do texto",
        options: TEXT_ALIGN_OPTIONS,
      },
      className: { kind: "text", label: "className (livre)" },
    },
  },

  // ============= CONTENT =============
  {
    type: "heading",
    label: "Título",
    icon: "title",
    group: "content",
    defaultProps: {
      content: "Título da seção",
      level: "1",
      align: "left",
      color: "",
      className: "",
    },
    propSchema: {
      content: { kind: "text", label: "Texto" },
      level: { kind: "select", label: "Nível", options: ["1", "2", "3", "4"] },
      align: { kind: "select", label: "Alinhar", options: TEXT_ALIGN_OPTIONS },
      color: { kind: "color", label: "Cor" },
      className: { kind: "text", label: "className (livre)" },
    },
  },
  {
    type: "text",
    label: "Parágrafo",
    icon: "text_fields",
    group: "content",
    defaultProps: {
      content: "Texto de exemplo.",
      size: "md",
      tone: "primary",
      align: "left",
      weight: "normal",
      className: "",
    },
    propSchema: {
      content: { kind: "textarea", label: "Conteúdo" },
      size: { kind: "select", label: "Tamanho", options: ["xs", "sm", "md", "lg", "xl"] },
      weight: {
        kind: "select",
        label: "Peso",
        options: ["light", "normal", "medium", "semibold", "bold"],
      },
      tone: {
        kind: "select",
        label: "Tom",
        options: ["primary", "secondary", "tertiary"],
      },
      align: { kind: "select", label: "Alinhar", options: TEXT_ALIGN_OPTIONS },
      className: { kind: "text", label: "className (livre)" },
    },
  },
  {
    type: "link",
    label: "Link",
    icon: "link",
    group: "content",
    defaultProps: {
      text: "Saiba mais",
      href: "#",
      target: "_self",
      underline: true,
      className: "",
    },
    propSchema: {
      text: { kind: "text", label: "Texto" },
      href: { kind: "text", label: "URL" },
      target: {
        kind: "select",
        label: "Abrir em",
        options: ["_self", "_blank"],
      },
      underline: { kind: "boolean", label: "Sublinhado" },
      className: { kind: "text", label: "className (livre)" },
    },
  },
  {
    type: "image",
    label: "Imagem",
    icon: "image",
    group: "content",
    defaultProps: {
      src: "",
      alt: "",
      width: 320,
      height: 200,
      fit: "cover",
      rounded: "md",
      className: "",
    },
    propSchema: {
      src: { kind: "text", label: "URL", placeholder: "https://..." },
      alt: { kind: "text", label: "Alt" },
      width: { kind: "number", label: "Largura", min: 16, suffix: "px" },
      height: { kind: "number", label: "Altura", min: 16, suffix: "px" },
      fit: {
        kind: "select",
        label: "Ajuste",
        options: ["cover", "contain", "fill", "scale-down", "none"],
      },
      rounded: {
        kind: "select",
        label: "Arredondamento",
        options: RADIUS_OPTIONS,
      },
      className: { kind: "text", label: "className (livre)" },
    },
  },
  {
    type: "icon",
    label: "Ícone",
    icon: "emoji_symbols",
    group: "content",
    defaultProps: { name: "star", size: 24, color: "", fill: false },
    propSchema: {
      name: {
        kind: "text",
        label: "Nome (Material Symbols)",
        placeholder: "ex: check_circle, bolt, favorite…",
      },
      size: {
        kind: "number",
        label: "Tamanho",
        min: 8,
        max: 128,
        suffix: "px",
      },
      color: { kind: "color", label: "Cor" },
      fill: { kind: "boolean", label: "Preenchido" },
    },
  },
  {
    type: "divider",
    label: "Divisor",
    icon: "horizontal_rule",
    group: "content",
    defaultProps: { tone: "default", thickness: "1", color: "" },
    propSchema: {
      tone: {
        kind: "select",
        label: "Tom",
        options: ["subtle", "default", "strong"],
      },
      thickness: {
        kind: "select",
        label: "Espessura",
        options: ["1", "2", "4"],
      },
      color: { kind: "color", label: "Cor (override)" },
    },
  },
  {
    type: "spacer",
    label: "Espaço",
    icon: "space_bar",
    group: "content",
    defaultProps: { size: 24, direction: "vertical" },
    propSchema: {
      size: { kind: "number", label: "Tamanho", min: 4, max: 400, suffix: "px" },
      direction: {
        kind: "select",
        label: "Orientação",
        options: ["vertical", "horizontal"],
      },
    },
  },

  // ============= AW COMPONENTS =============
  {
    type: "AwButton",
    label: "Botão",
    icon: "smart_button",
    group: "component",
    defaultProps: { children: "Botão", variant: "primary", size: "md" },
    propSchema: {
      children: { kind: "text", label: "Label" },
      variant: {
        kind: "select",
        label: "Variante",
        options: ["primary", "secondary", "ghost", "danger", "ai"],
      },
      size: {
        kind: "select",
        label: "Tamanho",
        options: ["sm", "md", "lg"],
      },
    },
  },
  {
    type: "AwCard",
    label: "Card",
    icon: "dashboard",
    group: "component",
    isContainer: true,
    defaultProps: { variant: "default", interactive: false },
    propSchema: {
      variant: {
        kind: "select",
        label: "Variante",
        options: ["default", "ai"],
      },
      interactive: { kind: "boolean", label: "Hover interativo" },
    },
  },
  {
    type: "AwPill",
    label: "Pill",
    icon: "label",
    group: "component",
    defaultProps: { children: "Status", variant: "neutral" },
    propSchema: {
      children: { kind: "text", label: "Texto" },
      variant: {
        kind: "select",
        label: "Variante",
        options: ["live", "draft", "beta", "error", "neutral", "ai"],
      },
    },
  },
  {
    type: "AwInput",
    label: "Input",
    icon: "input",
    group: "component",
    defaultProps: { placeholder: "Digite aqui…", type: "text", iconLeft: "" },
    propSchema: {
      placeholder: { kind: "text", label: "Placeholder" },
      type: {
        kind: "select",
        label: "Tipo",
        options: ["text", "email", "password", "number", "search"],
      },
      iconLeft: {
        kind: "text",
        label: "Ícone à esquerda",
        placeholder: "ex: search",
      },
    },
  },
  {
    type: "AwAlert",
    label: "Alert",
    icon: "notifications",
    group: "component",
    defaultProps: {
      variant: "info",
      title: "Título do alerta",
      content: "Descrição opcional do alerta.",
      icon: "",
    },
    propSchema: {
      variant: {
        kind: "select",
        label: "Variante",
        options: ["info", "success", "warning", "danger"],
      },
      title: { kind: "text", label: "Título" },
      content: { kind: "textarea", label: "Descrição" },
      icon: {
        kind: "text",
        label: "Ícone custom",
        placeholder: "deixe vazio para padrão",
      },
    },
  },
  {
    type: "AwProgress",
    label: "Progresso",
    icon: "progress_activity",
    group: "component",
    defaultProps: {
      value: 60,
      max: 100,
      label: "Progresso",
      variant: "default",
    },
    propSchema: {
      value: { kind: "number", label: "Valor", min: 0, max: 10000 },
      max: { kind: "number", label: "Máximo", min: 1 },
      label: { kind: "text", label: "Rótulo" },
      variant: {
        kind: "select",
        label: "Variante",
        options: ["default", "success", "warning", "danger"],
      },
    },
  },
  {
    type: "AwSkeleton",
    label: "Skeleton",
    icon: "blur_on",
    group: "component",
    defaultProps: { shape: "block", width: 240, height: 20 },
    propSchema: {
      shape: {
        kind: "select",
        label: "Forma",
        options: ["block", "line", "title", "avatar", "card"],
      },
      width: { kind: "number", label: "Largura", suffix: "px" },
      height: { kind: "number", label: "Altura", suffix: "px" },
    },
  },
  {
    type: "AwChatBubble",
    label: "Chat bubble",
    icon: "chat_bubble",
    group: "component",
    defaultProps: {
      variant: "agent",
      children: "Mensagem do agente",
      timestamp: "",
    },
    propSchema: {
      variant: {
        kind: "select",
        label: "Variante",
        options: ["user", "agent"],
      },
      children: { kind: "textarea", label: "Mensagem" },
      timestamp: { kind: "text", label: "Horário (opcional)" },
    },
  },
  {
    type: "AwLogo",
    label: "Logo AwSales",
    icon: "auto_awesome_motion",
    group: "component",
    defaultProps: { variant: "wordmark", height: 24 },
    propSchema: {
      variant: {
        kind: "select",
        label: "Variante",
        options: ["wordmark", "mark"],
      },
      height: {
        kind: "number",
        label: "Altura",
        min: 10,
        max: 200,
        suffix: "px",
      },
    },
  },
  {
    type: "AwToggle",
    label: "Toggle",
    icon: "toggle_on",
    group: "component",
    defaultProps: { checked: true, label: "Ativado" },
    propSchema: {
      checked: { kind: "boolean", label: "Ligado" },
      label: { kind: "text", label: "Rótulo (a11y)" },
    },
  },
]

export const paletteByType: Record<string, PaletteItem> = Object.fromEntries(
  palette.map((p) => [p.type, p])
)

export const paletteGroups: Array<{
  key: PaletteGroup
  label: string
  items: PaletteItem[]
}> = [
  {
    key: "layout",
    label: "Layout",
    items: palette.filter((p) => p.group === "layout"),
  },
  {
    key: "content",
    label: "Conteúdo",
    items: palette.filter((p) => p.group === "content"),
  },
  {
    key: "component",
    label: "Componentes",
    items: palette.filter((p) => p.group === "component"),
  },
]
