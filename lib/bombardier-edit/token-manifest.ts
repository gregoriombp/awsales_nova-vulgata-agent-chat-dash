import { FOUNDATION_TWEAK_CONTROLS } from "@/lib/bombardier/foundation-tweaks"

// The Live Edit style picker may ONLY offer design-system tokens — never a raw
// color/length. "Tokens são sagrados" becomes a guarantee by construction: the
// picker is built from this manifest, and the apply engine validates every
// value against ALLOWED_STYLE_VALUES before touching the DOM.
//
// We DERIVE the token lists from the foundation-tweaks controls (the same
// semantic tokens the foundation editor already exposes) so this never drifts
// from the real token set.

export interface StyleTokenChoice {
  /** Bare token name, e.g. "--bg-raised" — what the op payload records. */
  token: string
  label: string
  /** `var(--token)` — what gets written to the element and persisted. */
  cssValue: string
}

export interface StyleProperty {
  /** CSS property the inline override sets, e.g. "background-color". */
  prop: string
  label: string
  tokens: StyleTokenChoice[]
}

function controlsByCategory(category: string) {
  return FOUNDATION_TWEAK_CONTROLS.filter(
    (c) => c.category === category && !c.selector && !c.cssProperty,
  )
}

function startsWith(prefixes: string[]) {
  return (token: string) => prefixes.some((p) => token.startsWith(p))
}

function choices(filter: (token: string) => boolean): StyleTokenChoice[] {
  return controlsByCategory("color")
    .filter((c) => filter(c.token))
    .map((c) => ({ token: c.token, label: c.label, cssValue: `var(${c.token})` }))
}

function scaleChoices(category: string): StyleTokenChoice[] {
  return controlsByCategory(category).map((c) => ({
    token: c.token,
    label: c.label,
    cssValue: `var(${c.token})`,
  }))
}

const bgTokens = choices(startsWith(["--bg-", "--accent-"]))
const fgTokens = choices(startsWith(["--fg-", "--accent-"]))
const borderTokens = choices(startsWith(["--border-", "--ring-", "--accent-"]))

/** The properties the inspector lets you retoken, each with its legal tokens. */
export const STYLE_PROPERTIES: StyleProperty[] = [
  { prop: "color", label: "Cor do texto", tokens: fgTokens },
  { prop: "background-color", label: "Fundo", tokens: bgTokens },
  { prop: "border-color", label: "Borda", tokens: borderTokens },
  { prop: "border-radius", label: "Raio", tokens: scaleChoices("radius") },
  { prop: "box-shadow", label: "Sombra", tokens: scaleChoices("shadow") },
]

/** Every `var(--token)` the picker can emit — the apply engine's allow-list. */
export const ALLOWED_STYLE_VALUES: ReadonlySet<string> = new Set(
  STYLE_PROPERTIES.flatMap((p) => p.tokens.map((t) => t.cssValue)),
)

export const STYLE_PROPS: ReadonlySet<string> = new Set(
  STYLE_PROPERTIES.map((p) => p.prop),
)

/** Guard: a style op is only honored if BOTH the property and the token value
 *  are in the manifest. Defends the DOM against anything non-token. */
export function isAllowedStyle(prop: string, cssValue: string): boolean {
  return STYLE_PROPS.has(prop) && ALLOWED_STYLE_VALUES.has(cssValue)
}
