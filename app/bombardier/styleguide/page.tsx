import Button from "@/components/Button"
import { PageHero } from "./_primitives"

type Swatch = {
  name: string
  token: string
  hex: string
  dark?: boolean
}

type Scale = {
  title: string
  description: string
  swatches: Swatch[]
}

const graySteps: Swatch[] = [
  { name: "150", token: "--aw-gray-150", hex: "#F9F9F9" },
  { name: "200", token: "--aw-gray-200", hex: "#F2F2F2" },
  { name: "300", token: "--aw-gray-300", hex: "#E5E5E5" },
  { name: "400", token: "--aw-gray-400", hex: "#D1D1D1" },
  { name: "500", token: "--aw-gray-500", hex: "#B8B8B8" },
  { name: "600", token: "--aw-gray-600", hex: "#999999" },
  { name: "700", token: "--aw-gray-700", hex: "#7A7A7A", dark: true },
  { name: "800", token: "--aw-gray-800", hex: "#5E5E5E", dark: true },
  { name: "900", token: "--aw-gray-900", hex: "#454545", dark: true },
  { name: "1000", token: "--aw-gray-1000", hex: "#2F2F2F", dark: true },
  { name: "1100", token: "--aw-gray-1100", hex: "#1A1A1A", dark: true },
  { name: "1200", token: "--aw-gray-1200", hex: "#0D0D0D", dark: true },
]

const blueSteps: Swatch[] = [
  { name: "100", token: "--aw-blue-100", hex: "#F2F7FF" },
  { name: "150", token: "--aw-blue-150", hex: "#E8F0FF" },
  { name: "200", token: "--aw-blue-200", hex: "#DDEBFF" },
  { name: "300", token: "--aw-blue-300", hex: "#B8D4FF" },
  { name: "400", token: "--aw-blue-400", hex: "#8FB8FF" },
  { name: "500", token: "--aw-blue-500", hex: "#478AFF" },
  { name: "600", token: "--aw-blue-600", hex: "#2F76E6", dark: true },
  { name: "700", token: "--aw-blue-700", hex: "#1A5EC8", dark: true },
  { name: "800", token: "--aw-blue-800", hex: "#1346A2", dark: true },
  { name: "900", token: "--aw-blue-900", hex: "#0D317A", dark: true },
  { name: "1000", token: "--aw-blue-1000", hex: "#09225A", dark: true },
  { name: "1100", token: "--aw-blue-1100", hex: "#06163D", dark: true },
  { name: "1200", token: "--aw-blue-1200", hex: "#030D25", dark: true },
]

const emeraldSteps: Swatch[] = [
  { name: "100", token: "--aw-emerald-100", hex: "#F2FBF5" },
  { name: "150", token: "--aw-emerald-150", hex: "#E8F9ED" },
  { name: "200", token: "--aw-emerald-200", hex: "#DDF7E5" },
  { name: "300", token: "--aw-emerald-300", hex: "#BFF2D0" },
  { name: "400", token: "--aw-emerald-400", hex: "#99EBB8" },
  { name: "500", token: "--aw-emerald-500", hex: "#5BDF9E" },
  { name: "600", token: "--aw-emerald-600", hex: "#40C987" },
  { name: "700", token: "--aw-emerald-700", hex: "#22A871", dark: true },
  { name: "800", token: "--aw-emerald-800", hex: "#17825A", dark: true },
  { name: "900", token: "--aw-emerald-900", hex: "#105E45", dark: true },
  { name: "1000", token: "--aw-emerald-1000", hex: "#0A4230", dark: true },
  { name: "1100", token: "--aw-emerald-1100", hex: "#062B1F", dark: true },
  { name: "1200", token: "--aw-emerald-1200", hex: "#041912", dark: true },
]

const redSteps: Swatch[] = [
  { name: "100", token: "--aw-red-100", hex: "#FFF2F2" },
  { name: "150", token: "--aw-red-150", hex: "#FDE6E6" },
  { name: "200", token: "--aw-red-200", hex: "#FDDDDD" },
  { name: "300", token: "--aw-red-300", hex: "#FBBFBF" },
  { name: "400", token: "--aw-red-400", hex: "#F29999" },
  { name: "500", token: "--aw-red-500", hex: "#DF5B5B" },
  { name: "600", token: "--aw-red-600", hex: "#C94040" },
  { name: "700", token: "--aw-red-700", hex: "#A82222", dark: true },
  { name: "800", token: "--aw-red-800", hex: "#821718", dark: true },
  { name: "900", token: "--aw-red-900", hex: "#5E1010", dark: true },
  { name: "1000", token: "--aw-red-1000", hex: "#420A0A", dark: true },
  { name: "1100", token: "--aw-red-1100", hex: "#2B0606", dark: true },
  { name: "1200", token: "--aw-red-1200", hex: "#190404", dark: true },
]

const amberSteps: Swatch[] = [
  { name: "100", token: "--aw-amber-100", hex: "#FFF7ED" },
  { name: "150", token: "--aw-amber-150", hex: "#FDEFD9" },
  { name: "200", token: "--aw-amber-200", hex: "#FDE6CC" },
  { name: "300", token: "--aw-amber-300", hex: "#FCD4A3" },
  { name: "400", token: "--aw-amber-400", hex: "#F2A95B" },
  { name: "500", token: "--aw-amber-500", hex: "#E6762F" },
  { name: "600", token: "--aw-amber-600", hex: "#CC5F1E" },
  { name: "700", token: "--aw-amber-700", hex: "#B05315", dark: true },
  { name: "800", token: "--aw-amber-800", hex: "#8C4112", dark: true },
  { name: "900", token: "--aw-amber-900", hex: "#7A3A10", dark: true },
  { name: "1000", token: "--aw-amber-1000", hex: "#54270A", dark: true },
  { name: "1100", token: "--aw-amber-1100", hex: "#331806", dark: true },
  { name: "1200", token: "--aw-amber-1200", hex: "#1F0E03", dark: true },
]

const purpleSteps: Swatch[] = [
  { name: "100", token: "--aw-purple-100", hex: "#F7F2FC" },
  { name: "150", token: "--aw-purple-150", hex: "#F0E7FA" },
  { name: "200", token: "--aw-purple-200", hex: "#EADDF8" },
  { name: "300", token: "--aw-purple-300", hex: "#DBBFF2" },
  { name: "400", token: "--aw-purple-400", hex: "#C499EB" },
  { name: "500", token: "--aw-purple-500", hex: "#9E5BDF" },
  { name: "600", token: "--aw-purple-600", hex: "#8740C9" },
  { name: "700", token: "--aw-purple-700", hex: "#7122A8", dark: true },
  { name: "800", token: "--aw-purple-800", hex: "#5A1782", dark: true },
  { name: "900", token: "--aw-purple-900", hex: "#45105E", dark: true },
  { name: "1000", token: "--aw-purple-1000", hex: "#300A42", dark: true },
]

const tealSteps: Swatch[] = [
  { name: "100", token: "--aw-teal-100", hex: "#DFF7F6" },
  { name: "200", token: "--aw-teal-200", hex: "#A1E6E6" },
  { name: "400", token: "--aw-teal-400", hex: "#64D4D7" },
  { name: "500", token: "--aw-teal-500", hex: "#45CCCF" },
  { name: "600", token: "--aw-teal-600", hex: "#26C3C7" },
  { name: "700", token: "--aw-teal-700", hex: "#20B2B4", dark: true },
  { name: "900", token: "--aw-teal-900", hex: "#16908F", dark: true },
]

const pinkSteps: Swatch[] = [
  { name: "100", token: "--aw-pink-100", hex: "#FDF2F8" },
  { name: "200", token: "--aw-pink-200", hex: "#FCE3EE" },
  { name: "300", token: "--aw-pink-300", hex: "#F9C4DB" },
  { name: "400", token: "--aw-pink-400", hex: "#F490B5" },
  { name: "500", token: "--aw-pink-500", hex: "#E85C91" },
  { name: "600", token: "--aw-pink-600", hex: "#D13F76" },
  { name: "700", token: "--aw-pink-700", hex: "#A82A5C", dark: true },
  { name: "800", token: "--aw-pink-800", hex: "#801F46", dark: true },
  { name: "900", token: "--aw-pink-900", hex: "#5A1530", dark: true },
  { name: "1000", token: "--aw-pink-1000", hex: "#3B0D20", dark: true },
  { name: "1200", token: "--aw-pink-1200", hex: "#1A0610", dark: true },
]

const limeSteps: Swatch[] = [
  { name: "100", token: "--aw-lime-100", hex: "#F4FBE5" },
  { name: "200", token: "--aw-lime-200", hex: "#E4F5BE" },
  { name: "400", token: "--aw-lime-400", hex: "#BDE862" },
  { name: "500", token: "--aw-lime-500", hex: "#A1D136" },
  { name: "600", token: "--aw-lime-600", hex: "#7FAB25" },
  { name: "700", token: "--aw-lime-700", hex: "#5F8018", dark: true },
  { name: "900", token: "--aw-lime-900", hex: "#354811", dark: true },
  { name: "1200", token: "--aw-lime-1200", hex: "#111706", dark: true },
]

const slateSteps: Swatch[] = [
  { name: "100", token: "--aw-slate-100", hex: "#F4F6F8" },
  { name: "200", token: "--aw-slate-200", hex: "#E4E8EE" },
  { name: "300", token: "--aw-slate-300", hex: "#C9D0DA" },
  { name: "400", token: "--aw-slate-400", hex: "#9FA9BA" },
  { name: "500", token: "--aw-slate-500", hex: "#7886A0" },
  { name: "600", token: "--aw-slate-600", hex: "#5D6A82", dark: true },
  { name: "700", token: "--aw-slate-700", hex: "#465267", dark: true },
  { name: "800", token: "--aw-slate-800", hex: "#333D4D", dark: true },
  { name: "900", token: "--aw-slate-900", hex: "#222A36", dark: true },
  { name: "1000", token: "--aw-slate-1000", hex: "#141922", dark: true },
  { name: "1200", token: "--aw-slate-1200", hex: "#080A0E", dark: true },
]

const primitiveScales: Scale[] = [
  {
    title: "Gray",
    description: "Structure. Backgrounds, chrome, text, borders.",
    swatches: graySteps,
  },
  {
    title: "Blue",
    description: "Brand + AI gradient origin. Starts every “thinking” gradient.",
    swatches: blueSteps,
  },
  {
    title: "Emerald",
    description: "Success. Positive states, confirmations, completed runs.",
    swatches: emeraldSteps,
  },
  {
    title: "Red",
    description: "Destructive / error. Delete, revoke, breaking failures.",
    swatches: redSteps,
  },
  {
    title: "Amber",
    description: "Warning / pending review. Alerts, awaiting approval.",
    swatches: amberSteps,
  },
  {
    title: "Purple",
    description: "Decorative “thinking” accent. Gradient mid-tones.",
    swatches: purpleSteps,
  },
  {
    title: "Teal",
    description: "Informational + data-viz accent.",
    swatches: tealSteps,
  },
  {
    title: "Pink",
    description: "Marketing / highlight accent — used sparingly.",
    swatches: pinkSteps,
  },
  {
    title: "Lime",
    description: "Growth / positive delta accent.",
    swatches: limeSteps,
  },
  {
    title: "Slate",
    description: "Cool neutral. Alt to gray for subdued chrome and data-viz.",
    swatches: slateSteps,
  },
]

const semanticGroups: Array<{
  title: string
  items: Array<{ token: string; role: string }>
}> = [
  {
    title: "Surfaces",
    items: [
      { token: "--bg-canvas", role: "Page background" },
      { token: "--bg-surface", role: "Subtle inset panels" },
      { token: "--bg-raised", role: "Cards, modals" },
      { token: "--bg-muted", role: "Muted fills" },
      { token: "--bg-inverse", role: "Dark shell / sidebar" },
    ],
  },
  {
    title: "Foreground",
    items: [
      { token: "--fg-primary", role: "Primary text" },
      { token: "--fg-secondary", role: "Secondary text" },
      { token: "--fg-tertiary", role: "Tertiary / captions" },
      { token: "--fg-muted", role: "Disabled / placeholder" },
      { token: "--fg-on-inverse", role: "Text on dark shell" },
    ],
  },
  {
    title: "Borders",
    items: [
      { token: "--border-subtle", role: "1px hairlines, dividers" },
      { token: "--border-default", role: "Inputs, cards" },
      { token: "--border-strong", role: "Focus-emphasized boundaries" },
      { token: "--border-inverse", role: "Borders on dark shell" },
    ],
  },
  {
    title: "Accents",
    items: [
      { token: "--accent-brand", role: "Primary CTA / links" },
      { token: "--accent-brand-hover", role: "Hover on brand" },
      { token: "--accent-success", role: "Success" },
      { token: "--accent-danger", role: "Destructive" },
      { token: "--accent-warning", role: "Warning" },
      { token: "--accent-alert", role: "Pending review" },
    ],
  },
]

const radii = [
  { name: "xs", token: "--radius-xs", value: "4px", use: "chips, tags" },
  { name: "sm", token: "--radius-sm", value: "6px", use: "small controls" },
  { name: "md", token: "--radius-md", value: "8px", use: "buttons, inputs" },
  { name: "lg", token: "--radius-lg", value: "12px", use: "cards" },
  { name: "xl", token: "--radius-xl", value: "16px", use: "large cards, modals" },
  { name: "2xl", token: "--radius-2xl", value: "24px", use: "hero containers" },
  { name: "full", token: "--radius-full", value: "9999px", use: "avatars, pills" },
]

const spacing = [
  { name: "1", token: "--space-1", value: "4px" },
  { name: "2", token: "--space-2", value: "8px" },
  { name: "3", token: "--space-3", value: "12px" },
  { name: "4", token: "--space-4", value: "16px" },
  { name: "5", token: "--space-5", value: "20px" },
  { name: "6", token: "--space-6", value: "24px" },
  { name: "8", token: "--space-8", value: "32px" },
  { name: "10", token: "--space-10", value: "40px" },
  { name: "12", token: "--space-12", value: "48px" },
  { name: "16", token: "--space-16", value: "64px" },
  { name: "18", token: "--space-18", value: "72px" },
]

const shadows = [
  { name: "xs", token: "--shadow-xs", use: "subtle lift" },
  { name: "sm", token: "--shadow-sm", use: "raised cards" },
  { name: "md", token: "--shadow-md", use: "dropdowns, popovers" },
  { name: "lg", token: "--shadow-lg", use: "modals, toasts" },
  { name: "overlay", token: "--shadow-overlay", use: "full-screen dialogs" },
]

const displayScale = [
  { label: "display-xl", size: "96px", className: "display-xl" },
  { label: "display-lg", size: "80px", className: "display-lg" },
  { label: "display-md", size: "64px", className: "display-md" },
  { label: "display-sm", size: "48px", className: "display-sm" },
]

const headingScale = [
  { label: "h1", size: "40px", Tag: "h1" as const },
  { label: "h2", size: "32px", Tag: "h2" as const },
  { label: "h3", size: "28px", Tag: "h3" as const },
  { label: "h4", size: "24px", Tag: "h4" as const },
  { label: "h5", size: "20px", Tag: "h5" as const },
  { label: "h6", size: "18px", Tag: "h6" as const },
]

const bodyScale = [
  { label: "body-xl", size: "20px", varName: "--body-xl-size" },
  { label: "body-lg", size: "18px", varName: "--body-lg-size" },
  { label: "body-md", size: "16px", varName: "--body-md-size" },
  { label: "body-sm", size: "14px", varName: "--body-sm-size" },
  { label: "body-xs", size: "12px", varName: "--body-xs-size" },
]

const motion = [
  { name: "dur-fast", value: "120ms" },
  { name: "dur-base", value: "180ms" },
  { name: "dur-slow", value: "280ms" },
  { name: "ease-out", value: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
  { name: "ease-in-out", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
]

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16">
      <div className="mb-6">
        <h2 className="text-[var(--h2-size)] font-medium tracking-[-0.015em]">
          {title}
        </h2>
        {lead && (
          <p className="text-[var(--body-md-size)] text-[var(--fg-secondary)] mt-2 max-w-2xl">
            {lead}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function SwatchStrip({ scale }: { scale: Scale }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-raised)]">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-baseline justify-between">
        <div>
          <div className="font-medium text-[var(--fg-primary)]">
            {scale.title}
          </div>
          <div className="caption mt-0.5">{scale.description}</div>
        </div>
        <div className="mono text-xs text-[var(--fg-tertiary)]">
          {scale.swatches.length} steps
        </div>
      </div>
      <div className="flex flex-wrap lg:flex-nowrap">
        {scale.swatches.map((s) => (
          <div
            key={s.token}
            className="relative p-3 h-20 flex flex-col justify-between basis-1/4 md:basis-1/6 lg:basis-0 lg:flex-1 min-w-0"
            style={{
              backgroundColor: s.hex,
              color: s.dark ? "#FFFFFF" : "#0D0D0D",
            }}
          >
            <span className="text-[10px] font-medium leading-none">
              {s.name}
            </span>
            <span className="mono text-[10px] leading-none opacity-70">
              {s.hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SemanticCard({
  token,
  role,
}: {
  token: string
  role: string
}) {
  const isBg = token.startsWith("--bg-") || token.startsWith("--accent-")
  const isFg = token.startsWith("--fg-")
  const isBorder = token.startsWith("--border-")

  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <div
        className="w-10 h-10 rounded-[var(--radius-sm)] shrink-0 flex items-center justify-center"
        style={{
          backgroundColor: isBg ? `var(${token})` : "var(--bg-surface)",
          color: isFg ? `var(${token})` : "var(--fg-primary)",
          border: isBorder
            ? `2px solid var(${token})`
            : "1px solid var(--border-subtle)",
        }}
      >
        {isFg && <span className="text-sm font-semibold">Aa</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mono text-xs text-[var(--fg-primary)] truncate">
          {token}
        </div>
        <div className="text-xs text-[var(--fg-tertiary)] truncate">{role}</div>
      </div>
    </div>
  )
}

export default function StyleguidePage() {
  return (
    <>
      <PageHero title="Design tokens">
        Geometric minimalism grounded in grayscale, punctuated by a single
          blue-origin “thinking” accent. Gray is structure; the AI gradient is
          subjectivity. Every token below lives in{" "}
          <code className="mono">app/globals.css</code>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-20">
        <Section
          id="palette"
          title="Color palette"
          lead="Primitive scales. Every semantic token resolves down to one of these steps. 80%+ of any screen is grayscale."
        >
          <div className="flex flex-col gap-4">
            {primitiveScales.map((scale) => (
              <SwatchStrip key={scale.title} scale={scale} />
            ))}
          </div>
        </Section>

        <Section
          id="semantic"
          title="Semantic tokens"
          lead="The application layer. These are what components reference — dark mode swaps them, primitives stay put."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {semanticGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[var(--h6-size)] font-medium mb-3">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <SemanticCard
                      key={item.token}
                      token={item.token}
                      role={item.role}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="typography"
          title="Typography"
          lead="One voice: Geist. Type tightens with size — -2% tracking on display, neutral on body. Geist Mono is reserved strictly for code, tokens, and IDs."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-col gap-10">
            <div>
              <div className="aw-eyebrow mb-4">display · Geist Medium</div>
              <div className="flex flex-col gap-4">
                {displayScale.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-baseline gap-6 border-b border-[var(--border-subtle)] pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="w-24 shrink-0 mono text-xs text-[var(--fg-tertiary)] pt-2">
                      {d.label}
                      <br />
                      {d.size}
                    </div>
                    <div className={d.className}>agent studio</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="aw-eyebrow mb-4">headings · Geist Medium</div>
              <div className="flex flex-col gap-3">
                {headingScale.map(({ Tag, label, size }) => (
                  <div
                    key={label}
                    className="flex items-baseline gap-6 border-b border-[var(--border-subtle)] pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="w-24 shrink-0 mono text-xs text-[var(--fg-tertiary)]">
                      {label}
                      <br />
                      {size}
                    </div>
                    <Tag className="m-0">
                      Crie agentes em menos de 90 minutos
                    </Tag>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="aw-eyebrow mb-4">body · Geist Regular</div>
              <div className="flex flex-col gap-3">
                {bodyScale.map((b) => (
                  <div
                    key={b.label}
                    className="flex items-baseline gap-6 border-b border-[var(--border-subtle)] pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="w-24 shrink-0 mono text-xs text-[var(--fg-tertiary)]">
                      {b.label}
                      <br />
                      {b.size}
                    </div>
                    <p
                      className="m-0"
                      style={{ fontSize: `var(${b.varName})` }}
                    >
                      A Navigation Sidebar é a espinha dorsal da arquitetura de
                      informação da plataforma.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="aw-eyebrow mb-4">
                mono · Geist Mono — code, tokens, IDs
              </div>
              <div className="flex flex-col gap-2">
                <code className="mono text-[var(--mono-md-size)] bg-[var(--bg-surface)] px-3 py-2 rounded-[var(--radius-sm)] w-fit">
                  --accent-brand: var(--aw-blue-600);
                </code>
                <code className="mono text-[var(--mono-sm-size)] bg-[var(--bg-surface)] px-3 py-2 rounded-[var(--radius-sm)] w-fit text-[var(--fg-secondary)]">
                  run_id: 01HX7K9...
                </code>
              </div>
            </div>

            <div>
              <div className="aw-eyebrow mb-4">utility classes</div>
              <div className="flex flex-col gap-3">
                <div className="caption">caption — 12px · fg-tertiary</div>
                <div className="aw-eyebrow">overline — uppercase, tracked</div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="radius"
          title="Border radius"
          lead="Soft and consistent. Buttons at 8px, cards at 12px, modals at 16px. 9999px is reserved for avatars and round icon buttons."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {radii.map((r) => (
              <div
                key={r.name}
                className="flex flex-col items-center gap-3 p-4 border border-[var(--border-subtle)] rounded-[var(--radius-md)] bg-[var(--bg-raised)]"
              >
                <div
                  className="w-16 h-16 bg-[var(--aw-gray-1200)]"
                  style={{ borderRadius: `var(${r.token})` }}
                />
                <div className="text-center">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="mono text-xs text-[var(--fg-tertiary)]">
                    {r.value}
                  </div>
                  <div className="caption mt-1">{r.use}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="spacing"
          title="Spacing"
          lead="4px base rhythm. 8px is the default grid step — 4px reserved for tight component interiors."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-2">
            {spacing.map((s) => (
              <div
                key={s.token}
                className="flex items-center gap-4 py-1 border-b border-[var(--border-subtle)] last:border-b-0"
              >
                <div className="w-16 mono text-xs text-[var(--fg-tertiary)]">
                  {s.name}
                </div>
                <div className="w-20 mono text-xs text-[var(--fg-primary)]">
                  {s.value}
                </div>
                <div
                  className="h-3 bg-[var(--aw-blue-500)] rounded-[var(--radius-xs)]"
                  style={{ width: s.value }}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="shadows"
          title="Shadows"
          lead="Restrained. Most UI is flat-with-border. No inner shadows, no colored shadows."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {shadows.map((s) => (
              <div
                key={s.name}
                className="h-28 rounded-[var(--radius-lg)] bg-[var(--bg-raised)] border border-[var(--border-subtle)] flex flex-col items-center justify-center p-4"
                style={{ boxShadow: `var(${s.token})` }}
              >
                <div className="text-sm font-medium">{s.name}</div>
                <div className="mono text-xs text-[var(--fg-tertiary)] mt-1">
                  {s.token}
                </div>
                <div className="caption text-center mt-1">{s.use}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="motion"
          title="Motion"
          lead="Fast, utilitarian. 120–280ms durations. No bounces, no overshoot. The only expressive motion is the AI gradient-mesh drift."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
            <ul className="divide-y divide-[var(--border-subtle)]">
              {motion.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="mono text-sm">--{m.name}</span>
                  <span className="mono text-xs text-[var(--fg-tertiary)]">
                    {m.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          id="gradient"
          title="AI gradient"
          lead="The signature brand moment. Every gradient-mesh starts at blue (--aw-blue-500 → --aw-blue-700) and may transition through purple/teal. Never a warm color at the origin."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="h-40 rounded-[var(--radius-xl)] relative overflow-hidden flex items-end p-5"
              style={{
                background:
                  "radial-gradient(ellipse at 20% 30%, #478AFF 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, #9E5BDF 0%, transparent 55%), radial-gradient(ellipse at 60% 20%, #26C3C7 0%, transparent 45%), linear-gradient(135deg, #1A5EC8 0%, #0D317A 100%)",
              }}
            >
              <span className="text-white text-sm font-medium">
                thinking · blue → purple → teal
              </span>
            </div>
            <div
              className="h-40 rounded-[var(--radius-xl)] flex items-end p-5"
              style={{
                background:
                  "linear-gradient(135deg, var(--aw-blue-500) 0%, var(--aw-blue-700) 100%)",
              }}
            >
              <span className="text-white text-sm font-medium">
                brand · blue-500 → blue-700
              </span>
            </div>
          </div>
        </Section>

        <Section
          id="surfaces"
          title="Dark shell"
          lead="The product sidebar and shell live on a permanent dark surface. These tokens don’t flip with dark mode — they describe the chrome."
        >
          <div
            className="rounded-[var(--radius-xl)] p-8 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--dark-bg)",
              color: "var(--dark-fg-primary)",
              border: "1px solid var(--dark-border)",
            }}
          >
            <div className="aw-eyebrow" style={{ color: "var(--dark-fg-tertiary)" }}>
              dark shell · --dark-*
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span style={{ color: "var(--dark-fg-primary)" }}>
                primary · --dark-fg-primary (#FFFFFF)
              </span>
              <span style={{ color: "var(--dark-fg-secondary)" }}>
                secondary · --dark-fg-secondary (#B8B8B8)
              </span>
              <span style={{ color: "var(--dark-fg-tertiary)" }}>
                tertiary · --dark-fg-tertiary (#7A7A7A)
              </span>
            </div>
            <div className="flex gap-3">
              <div
                className="flex-1 h-12 rounded-[var(--radius-md)] flex items-center justify-center text-sm"
                style={{
                  backgroundColor: "var(--dark-bg-raised)",
                  color: "var(--dark-fg-primary)",
                }}
              >
                --dark-bg-raised
              </div>
              <div
                className="flex-1 h-12 rounded-[var(--radius-md)] flex items-center justify-center text-sm"
                style={{
                  backgroundColor: "var(--dark-bg-hover)",
                  color: "var(--dark-fg-primary)",
                }}
              >
                --dark-bg-hover
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="components"
          title="Components"
          lead="Demo surfaces composed only from tokens. See individual component pages (added by Prompt 2) for full API + states."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <div className="aw-eyebrow mb-4">button</div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button variant="primary" className="w-auto">
                    Criar agente
                  </Button>
                  <Button variant="secondary" className="w-auto">
                    Cancelar
                  </Button>
                  <Button variant="tertiary" className="w-auto">
                    Saiba mais
                  </Button>
                  <Button variant="danger" className="w-auto">
                    Excluir
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <Button variant="primary" size="sm" className="w-auto">
                    Small
                  </Button>
                  <Button variant="primary" size="md" className="w-auto">
                    Medium
                  </Button>
                  <Button variant="primary" size="lg" className="w-auto">
                    Large
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <div className="aw-eyebrow mb-4">card</div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-5">
                <h4 className="m-0 mb-2">Agentes ativos</h4>
                <p className="body-sm m-0">
                  12 agentes em produção. Última revisão há 3 dias.
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[var(--radius-xs)] bg-[var(--aw-emerald-150)] text-[var(--aw-emerald-800)]">
                    sucesso
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[var(--radius-xs)] bg-[var(--aw-amber-150)] text-[var(--aw-amber-800)]">
                    review
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[var(--radius-xs)] bg-[var(--aw-blue-150)] text-[var(--aw-blue-800)]">
                    info
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <div className="aw-eyebrow mb-4">pills · tags</div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-[var(--radius-full)] bg-[var(--bg-surface)] text-[var(--fg-secondary)] border border-[var(--border-subtle)]">
                  neutral
                </span>
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-[var(--radius-full)] bg-[var(--aw-blue-150)] text-[var(--aw-blue-800)]">
                  ai
                </span>
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-[var(--radius-full)] bg-[var(--aw-emerald-150)] text-[var(--aw-emerald-800)]">
                  ativo
                </span>
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-[var(--radius-full)] bg-[var(--aw-amber-150)] text-[var(--aw-amber-800)]">
                  pendente
                </span>
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-[var(--radius-full)] bg-[var(--aw-red-150)] text-[var(--aw-red-800)]">
                  erro
                </span>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <div className="aw-eyebrow mb-4">input</div>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nome do agente"
                  className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--fg-primary)] text-sm outline-none transition-colors duration-[var(--dur-base)] focus:border-[var(--accent-brand)] focus:ring-2 focus:ring-[var(--aw-blue-200)]"
                />
                <input
                  type="text"
                  disabled
                  placeholder="Desabilitado"
                  className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--fg-muted)] text-sm opacity-60"
                />
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <div className="aw-eyebrow mb-4">alert</div>
              <div className="flex flex-col gap-2">
                <div className="rounded-[var(--radius-md)] border border-[var(--aw-emerald-200)] bg-[var(--aw-emerald-100)] px-4 py-3 text-sm text-[var(--aw-emerald-900)]">
                  Agente aprovado. Pronto para deploy.
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--aw-amber-200)] bg-[var(--aw-amber-100)] px-4 py-3 text-sm text-[var(--aw-amber-900)]">
                  Aguardando revisão de compliance.
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--aw-red-200)] bg-[var(--aw-red-100)] px-4 py-3 text-sm text-[var(--aw-red-900)]">
                  Falha no último deploy. Revisar logs.
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-4 py-3 text-sm text-[var(--aw-blue-900)]">
                  Nova versão disponível.
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <div className="aw-eyebrow mb-4">radio group</div>
              <div className="flex flex-col gap-2">
                {[
                  { id: "r1", label: "Atendimento", checked: true },
                  { id: "r2", label: "Vendas", checked: false },
                  { id: "r3", label: "Qualificação", checked: false },
                ].map((o) => (
                  <label
                    key={o.id}
                    htmlFor={o.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] cursor-pointer hover:bg-[var(--bg-surface)]"
                  >
                    <input
                      id={o.id}
                      type="radio"
                      name="styleguide-radio"
                      defaultChecked={o.checked}
                      className="accent-[var(--accent-brand)]"
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
    </>
  )
}
