export const FOUNDATION_TWEAK_STORAGE_KEY = "aw-foundation-tweaks"
export const FOUNDATION_TWEAK_STYLE_ID = "aw-foundation-tweaks-style"

export const FOUNDATION_TWEAK_MODES = ["light", "dark"] as const
export type FoundationTweakMode = (typeof FOUNDATION_TWEAK_MODES)[number]

export const FOUNDATION_TWEAK_CATEGORIES = [
  { value: "color", label: "Cores" },
  { value: "radius", label: "Raios" },
  { value: "spacing", label: "Espaçamento" },
  { value: "type", label: "Tipo" },
  { value: "motion", label: "Motion" },
] as const

export type FoundationTweakCategory =
  (typeof FOUNDATION_TWEAK_CATEGORIES)[number]["value"]

export type FoundationTweakControlType = "color" | "number"

export type FoundationTweakControl = {
  category: FoundationTweakCategory
  token: string
  label: string
  description: string
  type: FoundationTweakControlType
  defaults: Record<FoundationTweakMode, string>
  min?: number
  max?: number
  step?: number
  unit?: "px" | "ms"
}

export type FoundationTweakValueMap = Record<
  FoundationTweakMode,
  Record<string, string>
>

export type FoundationTweakStore = {
  version: 1
  values: FoundationTweakValueMap
}

const same = (value: string): Record<FoundationTweakMode, string> => ({
  light: value,
  dark: value,
})

export const FOUNDATION_TWEAK_CONTROLS: FoundationTweakControl[] = [
  {
    category: "color",
    token: "--bg-canvas",
    label: "Canvas",
    description: "Fundo-base das páginas.",
    type: "color",
    defaults: { light: "#ffffff", dark: "#0d0d0d" },
  },
  {
    category: "color",
    token: "--bg-surface",
    label: "Surface",
    description: "Faixas, áreas neutras e fundos secundários.",
    type: "color",
    defaults: { light: "#f9f9f9", dark: "#1a1a1a" },
  },
  {
    category: "color",
    token: "--bg-raised",
    label: "Raised",
    description: "Cards, painéis e superfícies elevadas.",
    type: "color",
    defaults: { light: "#ffffff", dark: "#1a1a1a" },
  },
  {
    category: "color",
    token: "--bg-muted",
    label: "Muted",
    description: "Preenchimentos neutros de baixa ênfase.",
    type: "color",
    defaults: { light: "#f2f2f2", dark: "#2f2f2f" },
  },
  {
    category: "color",
    token: "--bg-hover",
    label: "Hover",
    description: "Estado hover de itens interativos.",
    type: "color",
    defaults: { light: "#f9f9f9", dark: "#2f2f2f" },
  },
  {
    category: "color",
    token: "--bg-selected",
    label: "Selected",
    description: "Estado selecionado persistente.",
    type: "color",
    defaults: { light: "#f2f2f2", dark: "#454545" },
  },
  {
    category: "color",
    token: "--fg-primary",
    label: "Texto primário",
    description: "Títulos, comandos e conteúdo principal.",
    type: "color",
    defaults: { light: "#0d0d0d", dark: "#ffffff" },
  },
  {
    category: "color",
    token: "--fg-secondary",
    label: "Texto secundário",
    description: "Descrições e metadados de leitura.",
    type: "color",
    defaults: { light: "#5e5e5e", dark: "#b8b8b8" },
  },
  {
    category: "color",
    token: "--fg-tertiary",
    label: "Texto terciário",
    description: "Eyebrows, captions e informação auxiliar.",
    type: "color",
    defaults: { light: "#999999", dark: "#7a7a7a" },
  },
  {
    category: "color",
    token: "--border-subtle",
    label: "Borda sutil",
    description: "Separadores discretos e divisões internas.",
    type: "color",
    defaults: { light: "#f2f2f2", dark: "#1a1a1a" },
  },
  {
    category: "color",
    token: "--border-default",
    label: "Borda padrão",
    description: "Contorno de cards, inputs e controles.",
    type: "color",
    defaults: { light: "#e5e5e5", dark: "#2f2f2f" },
  },
  {
    category: "color",
    token: "--border-strong",
    label: "Borda forte",
    description: "Estados ativos ou contraste estrutural.",
    type: "color",
    defaults: { light: "#b8b8b8", dark: "#454545" },
  },
  {
    category: "color",
    token: "--ring-focus",
    label: "Focus ring",
    description: "Anel de foco para navegação por teclado.",
    type: "color",
    defaults: { light: "#2f76e6", dark: "#e4e8ee" },
  },
  {
    category: "color",
    token: "--accent-brand",
    label: "Brand",
    description: "Ação primária e acento institucional.",
    type: "color",
    defaults: { light: "#222a36", dark: "#e4e8ee" },
  },
  {
    category: "color",
    token: "--accent-brand-hover",
    label: "Brand hover",
    description: "Estado hover do acento institucional.",
    type: "color",
    defaults: { light: "#141922", dark: "#f4f6f8" },
  },
  {
    category: "color",
    token: "--accent-success",
    label: "Sucesso",
    description: "Estados concluídos, positivos e confirmados.",
    type: "color",
    defaults: { light: "#22a871", dark: "#5bdf9e" },
  },
  {
    category: "color",
    token: "--accent-danger",
    label: "Perigo",
    description: "Estados destrutivos, críticos e erros.",
    type: "color",
    defaults: { light: "#a82222", dark: "#df5b5b" },
  },
  {
    category: "color",
    token: "--accent-warning",
    label: "Atenção",
    description: "Estados pendentes, alertas e revisão.",
    type: "color",
    defaults: { light: "#e6762f", dark: "#f2a95b" },
  },
  {
    category: "radius",
    token: "--radius-xs",
    label: "Radius XS",
    description: "Badges e elementos compactos.",
    type: "number",
    defaults: same("6px"),
    min: 0,
    max: 16,
    step: 1,
    unit: "px",
  },
  {
    category: "radius",
    token: "--radius-sm",
    label: "Radius SM",
    description: "Controles pequenos.",
    type: "number",
    defaults: same("8px"),
    min: 0,
    max: 20,
    step: 1,
    unit: "px",
  },
  {
    category: "radius",
    token: "--radius-md",
    label: "Radius MD",
    description: "Inputs e selects.",
    type: "number",
    defaults: same("10px"),
    min: 0,
    max: 24,
    step: 1,
    unit: "px",
  },
  {
    category: "radius",
    token: "--radius-lg",
    label: "Radius LG",
    description: "Cards e painéis.",
    type: "number",
    defaults: same("12px"),
    min: 0,
    max: 32,
    step: 1,
    unit: "px",
  },
  {
    category: "radius",
    token: "--radius-xl",
    label: "Radius XL",
    description: "Modais e cards grandes.",
    type: "number",
    defaults: same("16px"),
    min: 0,
    max: 40,
    step: 1,
    unit: "px",
  },
  {
    category: "radius",
    token: "--radius-2xl",
    label: "Radius 2XL",
    description: "Containers principais e áreas hero.",
    type: "number",
    defaults: same("24px"),
    min: 0,
    max: 56,
    step: 1,
    unit: "px",
  },
  {
    category: "spacing",
    token: "--space-2",
    label: "Space 2",
    description: "Espaçamento micro entre controles.",
    type: "number",
    defaults: same("8px"),
    min: 4,
    max: 20,
    step: 1,
    unit: "px",
  },
  {
    category: "spacing",
    token: "--space-3",
    label: "Space 3",
    description: "Respiro compacto entre label e conteúdo.",
    type: "number",
    defaults: same("12px"),
    min: 6,
    max: 28,
    step: 1,
    unit: "px",
  },
  {
    category: "spacing",
    token: "--space-4",
    label: "Space 4",
    description: "Espaçamento base de UI.",
    type: "number",
    defaults: same("16px"),
    min: 8,
    max: 36,
    step: 1,
    unit: "px",
  },
  {
    category: "spacing",
    token: "--space-6",
    label: "Space 6",
    description: "Gaps de cards e seções internas.",
    type: "number",
    defaults: same("24px"),
    min: 12,
    max: 56,
    step: 1,
    unit: "px",
  },
  {
    category: "spacing",
    token: "--space-8",
    label: "Space 8",
    description: "Separação entre blocos.",
    type: "number",
    defaults: same("32px"),
    min: 16,
    max: 72,
    step: 1,
    unit: "px",
  },
  {
    category: "spacing",
    token: "--space-12",
    label: "Space 12",
    description: "Margens largas e respiro de tela.",
    type: "number",
    defaults: same("48px"),
    min: 24,
    max: 96,
    step: 1,
    unit: "px",
  },
  {
    category: "type",
    token: "--h1-size",
    label: "H1",
    description: "Título principal de página.",
    type: "number",
    defaults: same("40px"),
    min: 28,
    max: 64,
    step: 1,
    unit: "px",
  },
  {
    category: "type",
    token: "--h2-size",
    label: "H2",
    description: "Título de seção.",
    type: "number",
    defaults: same("32px"),
    min: 22,
    max: 48,
    step: 1,
    unit: "px",
  },
  {
    category: "type",
    token: "--h3-size",
    label: "H3",
    description: "Subtítulo e hierarquia intermediária.",
    type: "number",
    defaults: same("28px"),
    min: 20,
    max: 40,
    step: 1,
    unit: "px",
  },
  {
    category: "type",
    token: "--body-lg-size",
    label: "Body LG",
    description: "Texto de destaque e leitura ampla.",
    type: "number",
    defaults: same("18px"),
    min: 15,
    max: 24,
    step: 1,
    unit: "px",
  },
  {
    category: "type",
    token: "--body-md-size",
    label: "Body MD",
    description: "Texto padrão de produto.",
    type: "number",
    defaults: same("16px"),
    min: 13,
    max: 20,
    step: 1,
    unit: "px",
  },
  {
    category: "type",
    token: "--body-sm-size",
    label: "Body SM",
    description: "Metadados, descrições e labels.",
    type: "number",
    defaults: same("14px"),
    min: 11,
    max: 18,
    step: 1,
    unit: "px",
  },
  {
    category: "motion",
    token: "--dur-fast",
    label: "Fast",
    description: "Microinterações e hover.",
    type: "number",
    defaults: same("120ms"),
    min: 80,
    max: 240,
    step: 10,
    unit: "ms",
  },
  {
    category: "motion",
    token: "--dur-base",
    label: "Base",
    description: "Transições padrão de componentes.",
    type: "number",
    defaults: same("180ms"),
    min: 120,
    max: 360,
    step: 10,
    unit: "ms",
  },
  {
    category: "motion",
    token: "--dur-slow",
    label: "Slow",
    description: "Entrada de painéis, overlays e fluxos.",
    type: "number",
    defaults: same("280ms"),
    min: 180,
    max: 560,
    step: 10,
    unit: "ms",
  },
]

export const FOUNDATION_TWEAK_ALLOWED_TOKENS = FOUNDATION_TWEAK_CONTROLS.map(
  (control) => control.token,
)

const SAFE_VALUE_PATTERN = /^[#(),.%\w\s-]+$/

export function isSafeFoundationTweakValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length < 80 &&
    SAFE_VALUE_PATTERN.test(value)
  )
}

export function createDefaultFoundationTweakValues(): FoundationTweakValueMap {
  return FOUNDATION_TWEAK_MODES.reduce((acc, mode) => {
    acc[mode] = {}
    for (const control of FOUNDATION_TWEAK_CONTROLS) {
      acc[mode][control.token] = control.defaults[mode]
    }
    return acc
  }, {} as FoundationTweakValueMap)
}

export function mergeFoundationTweakValues(
  input: unknown,
): FoundationTweakValueMap {
  const merged = createDefaultFoundationTweakValues()
  const source =
    input &&
    typeof input === "object" &&
    "values" in input &&
    input.values &&
    typeof input.values === "object"
      ? input.values
      : input

  if (!source || typeof source !== "object") return merged

  for (const mode of FOUNDATION_TWEAK_MODES) {
    const modeValues = (source as Partial<FoundationTweakValueMap>)[mode]
    if (!modeValues || typeof modeValues !== "object") continue

    for (const control of FOUNDATION_TWEAK_CONTROLS) {
      const next = modeValues[control.token]
      if (isSafeFoundationTweakValue(next)) {
        merged[mode][control.token] = next
      }
    }
  }

  return merged
}

export function buildFoundationTweaksCss(
  values: FoundationTweakValueMap,
  options: { changedOnly?: boolean } = {},
): string {
  const defaults = createDefaultFoundationTweakValues()

  return FOUNDATION_TWEAK_MODES.map((mode) => {
    const lines = FOUNDATION_TWEAK_CONTROLS.flatMap((control) => {
      const value = values[mode]?.[control.token]
      if (!isSafeFoundationTweakValue(value)) return []
      if (options.changedOnly && value === defaults[mode][control.token]) {
        return []
      }
      return [`  ${control.token}: ${value};`]
    })

    if (lines.length === 0) return ""
    return `${mode === "light" ? ":root" : ".dark"} {\n${lines.join("\n")}\n}`
  })
    .filter(Boolean)
    .join("\n\n")
}

export function countFoundationTweakChanges(
  values: FoundationTweakValueMap,
): number {
  const defaults = createDefaultFoundationTweakValues()
  return FOUNDATION_TWEAK_MODES.reduce((count, mode) => {
    return (
      count +
      FOUNDATION_TWEAK_CONTROLS.filter(
        (control) => values[mode]?.[control.token] !== defaults[mode][control.token],
      ).length
    )
  }, 0)
}
