import Link from "next/link"
import Button from "@/components/Button"
import { PageHero } from "./_primitives"

/*
 * Home da styleguide = "Design tokens hub".
 *
 * Conteúdo profundo de cor, typography, spacing e grid migrou pras páginas
 * dedicadas em `foundation/*` (padrão canônico 2026-05). Esta home mantém
 * uma vista panorâmica + as sections que ainda não viraram página própria
 * (radius, shadows, motion, gradient, dark shell, components overview).
 */

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

function FoundationSummary({
  href,
  sample,
  facts,
}: {
  href: string
  sample: React.ReactNode
  facts: Array<{ k: string; v: string }>
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center min-h-[200px]">
          {sample}
        </div>
        <div className="p-6 flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 m-0">
            {facts.map((f) => (
              <div key={f.k} className="flex flex-col gap-0.5">
                <dt className="aw-eyebrow">{f.k}</dt>
                <dd className="mono text-xs text-[var(--fg-primary)] m-0">
                  {f.v}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href={href}
            className="text-sm text-[var(--aw-blue-700)] hover:underline mt-auto"
          >
            Ver completo →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function StyleguidePage() {
  return (
    <>
      <PageHero title="Design tokens">
        Geometric minimalism grounded in grayscale, punctuated by a single
        blue-origin &ldquo;thinking&rdquo; accent. Gray is structure; the AI
        gradient is subjectivity. Every token below lives in{" "}
        <code className="mono">app/globals.css</code>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-20">
          <Section
            id="color"
            title="Color"
            lead="Dez escalas primitivas + ~30 tokens semânticos. Grayscale é estrutura, blue é a voz do produto. A página dedicada tem paleta completa, mapping primitivo→semântico, light/dark e contraste WCAG."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/color"
              sample={
                <div className="grid grid-cols-12 gap-1">
                  {[
                    "--aw-gray-1200",
                    "--aw-gray-900",
                    "--aw-gray-600",
                    "--aw-gray-300",
                    "--aw-gray-150",
                    "--aw-blue-700",
                    "--aw-blue-500",
                    "--aw-blue-200",
                    "--aw-emerald-600",
                    "--aw-red-600",
                    "--aw-amber-500",
                    "--aw-purple-500",
                  ].map((t) => (
                    <div
                      key={t}
                      className="h-10 rounded-[var(--radius-xs)]"
                      style={{ backgroundColor: `var(${t})` }}
                      title={t}
                    />
                  ))}
                </div>
              }
              facts={[
                { k: "primitivas", v: "10 escalas" },
                { k: "semânticas", v: "~30 tokens" },
                { k: "modos", v: "light · dark" },
                { k: "wcag", v: "AA mínimo" },
              ]}
            />
          </Section>

          <Section
            id="typography"
            title="Typography"
            lead="Uma voz: Geist + Geist Mono. Escala progressiva de 12 px (caption) a 96 px (display-xl). Tracking aperta com o tamanho. A página dedicada tem escala completa, regras de uso e exemplos."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/typography"
              sample={
                <div className="flex flex-col gap-3">
                  <div className="display-sm">agent studio</div>
                  <h2 className="m-0">Crie agentes em menos de 90 minutos</h2>
                  <p
                    className="m-0"
                    style={{ fontSize: "var(--body-md-size)" }}
                  >
                    Body padrão · 16px · Geist Regular.
                  </p>
                  <code className="mono text-xs bg-[var(--bg-surface)] px-2 py-1 rounded-[var(--radius-sm)] w-fit">
                    --accent-brand: var(--aw-blue-600);
                  </code>
                </div>
              }
              facts={[
                { k: "famílias", v: "Geist · Geist Mono" },
                { k: "display", v: "48–96 px" },
                { k: "headings", v: "h1–h6 · 18–40 px" },
                { k: "body", v: "12–20 px · default 16" },
              ]}
            />
          </Section>

          <Section
            id="spacing"
            title="Spacing"
            lead="Base 4 px, passo padrão 8 px. Onze degraus de 4 a 72 px. A página dedicada tem escala completa, regras de uso por tier e padrões canônicos."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/spacing"
              sample={
                <div className="flex flex-col gap-2">
                  {spacing.map((s) => (
                    <div key={s.token} className="flex items-center gap-3">
                      <div className="w-10 mono text-[10px] text-[var(--fg-tertiary)]">
                        {s.name}
                      </div>
                      <div
                        className="h-2 rounded-[var(--radius-xs)] bg-[var(--aw-blue-500)]"
                        style={{ width: s.value }}
                      />
                      <div className="mono text-[10px] text-[var(--fg-tertiary)]">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              }
              facts={[
                { k: "base", v: "4 px" },
                { k: "step", v: "8 px" },
                { k: "degraus", v: "11 (1–18)" },
                { k: "gap entre seções", v: "16 · 64 px" },
              ]}
            />
          </Section>

          <Section
            id="grid"
            title="Grid &amp; layout"
            lead="Container 1200 px, 12 colunas, 5 breakpoints, 5 layouts canônicos. A página dedicada tem container, breakpoints, gutters e 5 layouts prontos pra copiar."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/grid"
              sample={
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-[var(--radius-xs)] bg-[var(--aw-blue-100)] border border-[var(--aw-blue-200)] flex items-center justify-center mono text-[10px] text-[var(--aw-blue-900)]"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              }
              facts={[
                { k: "container", v: "1200 px" },
                { k: "padding lateral", v: "40 px (px-10)" },
                { k: "breakpoints", v: "sm md lg xl 2xl" },
                { k: "layouts canônicos", v: "5" },
              ]}
            />
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
            title="Gradient iridescente"
            lead="O signature da marca. Azul-céu → lavender → peach/cream — sempre nessa direção. Três variantes: filled, soft mesh e border. A página dedicada tem paleta, três padrões em contexto, acessibilidade e Do/Don't."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/gradient"
              sample={
                <div className="flex flex-col gap-3 w-full">
                  <div className="aw-gradient-iridescent h-14 rounded-[var(--radius-full)] flex items-center justify-center text-sm font-medium text-[var(--aw-gray-1200)]">
                    fill · iridescent
                  </div>
                  <div className="aw-gradient-iridescent-soft h-14 rounded-[var(--radius-md)] border border-[var(--border-subtle)] flex items-center justify-center text-sm font-medium text-[var(--fg-primary)]">
                    soft mesh
                  </div>
                  <div
                    className="aw-gradient-iridescent-border h-14 rounded-[var(--radius-full)] flex items-center justify-center text-sm font-medium text-[var(--fg-primary)]"
                    style={
                      {
                        "--aw-iridescent-fill": "var(--bg-canvas)",
                      } as React.CSSProperties
                    }
                  >
                    border · 1px
                  </div>
                </div>
              }
              facts={[
                { k: "início", v: "--aw-blue-400" },
                { k: "destino", v: "--aw-amber-200" },
                { k: "padrões", v: "fill · mesh · border" },
                { k: "uso", v: "só superfícies da IA" },
              ]}
            />
          </Section>

          <Section
            id="surfaces"
            title="Dark shell"
            lead="The product sidebar and shell live on a permanent dark surface. These tokens don't flip with dark mode — they describe the chrome."
          >
            <div
              className="rounded-[var(--radius-xl)] p-8 flex flex-col gap-4"
              style={{
                backgroundColor: "var(--dark-bg)",
                color: "var(--dark-fg-primary)",
                border: "1px solid var(--dark-border)",
              }}
            >
              <div
                className="aw-eyebrow"
                style={{ color: "var(--dark-fg-tertiary)" }}
              >
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
            lead="Superfícies demo compostas só de tokens. Cada componente tem página própria com API + states no padrão canônico."
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
