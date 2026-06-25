import Link from "next/link"
import { AwAlert } from "@/components/ui/AwAlert"
import { AwButton } from "@/components/ui/AwButton"
import {
  AwCard,
  AwCardContent,
  AwCardDescription,
  AwCardHeader,
  AwCardTitle,
} from "@/components/ui/AwCard"
import { AwField, AwInput } from "@/components/ui/AwInput"
import { AwLogo } from "@/components/ui/AwLogo"
import { AwBrandIllustration } from "@/components/ui/AwBrandIllustration"
import { Icon } from "@/components/ui/Icon"
import { AwPill } from "@/components/ui/AwPill"
import { PageHero, Spec } from "./_primitives"

/*
 * Home da styleguide = porta de entrada da apresentação do sistema.
 *
 * Abre com a marca (manifesto + entradas por área), segue para a vista
 * panorâmica de tokens. Conteúdo profundo de cor, typography, spacing e grid
 * mora nas páginas dedicadas em `foundation/*` (padrão canônico 2026-05);
 * a história completa da marca mora em `marca/*`.
 */

const ENTRY_CARDS = [
  {
    href: "/bombardier/styleguide/marca/sobre",
    icon: "auto_awesome",
    title: "Marca",
    desc: "História, tom de voz, logo, imageria e ilustrações.",
    tint: "var(--aw-blue-600)",
  },
  {
    href: "/bombardier/styleguide/foundation/color",
    icon: "palette",
    title: "Foundations",
    desc: "Cor, tipografia, grid, movimento — os tokens do sistema.",
    tint: "var(--aw-slate-600)",
  },
  {
    href: "/bombardier/styleguide/components/buttons",
    icon: "widgets",
    title: "Biblioteca",
    desc: "De primitivos a componentes de domínio, com API e estados.",
    tint: "var(--aw-purple-500)",
  },
  {
    href: "/bombardier/styleguide/ux-flows/primeiro-acesso",
    icon: "route",
    title: "UX Flows",
    desc: "As jornadas do produto mapeadas tela a tela.",
    tint: "var(--aw-teal-600)",
  },
]

const SYSTEM_STATS = [
  { v: "90+", k: "componentes Aw*" },
  { v: "10", k: "foundations" },
  { v: "26", k: "integrações com ícone" },
  { v: "2", k: "temas · light e dark" },
]

const radii = [
  { name: "xs", token: "--radius-xs", value: "4px", use: "Chips, tags" },
  { name: "sm", token: "--radius-sm", value: "6px", use: "Controles pequenos" },
  { name: "md", token: "--radius-md", value: "8px", use: "Inputs, selects" },
  { name: "lg", token: "--radius-lg", value: "12px", use: "Cards" },
  { name: "xl", token: "--radius-xl", value: "16px", use: "Modais, cards grandes" },
  { name: "2xl", token: "--radius-2xl", value: "24px", use: "Containers hero" },
  { name: "full", token: "--radius-full", value: "9999px", use: "Botões, avatars, pills" },
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
  { name: "xs", token: "--shadow-xs", use: "Subtle lift" },
  { name: "sm", token: "--shadow-sm", use: "Raised cards" },
  { name: "md", token: "--shadow-md", use: "Dropdowns, popovers" },
  { name: "lg", token: "--shadow-lg", use: "Modals, toasts" },
  { name: "overlay", token: "--shadow-overlay", use: "Full-screen dialogs" },
]

const motion = [
  { name: "dur-fast", value: "120ms" },
  { name: "dur-base", value: "180ms" },
  { name: "dur-slow", value: "280ms" },
  { name: "ease-out", value: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
  { name: "ease-in-out", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
]

const canonicalFamilies = [
  {
    title: "Modais e dialogs",
    href: "/bombardier/styleguide/components/modals",
    decision: "AwModal primeiro; wrappers de domínio só quando o fluxo já existe.",
    aliases: "Connect modal, Welcome modal, Contact channel modal",
  },
  {
    title: "Tabelas",
    href: "/bombardier/styleguide/components/table",
    decision: "AwTable para produto, DataTable para JSON de tool, AwMembersTable para pessoas.",
    aliases: "Data table, Members table",
  },
  {
    title: "Visual dos agentes",
    href: "/bombardier/styleguide/components/agents",
    decision: "Core é diamante, agente do usuário é círculo, Cortex é hex.",
    aliases: "Agent Core, User Agent, Cortex",
  },
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
        <h2 className="text-(--h2-size) font-medium tracking-[-0.015em]">
          {title}
        </h2>
        {lead && (
          <p className="text-(--body-md-size) text-(--fg-secondary) mt-2 max-w-2xl">
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
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-(--border-subtle) bg-(--bg-surface) flex items-center justify-center min-h-[200px]">
          {sample}
        </div>
        <div className="p-6 flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 m-0">
            {facts.map((f) => (
              <div key={f.k} className="flex flex-col gap-0.5">
                <dt className="aw-eyebrow">{f.k}</dt>
                <dd className="text-[13px] font-medium text-(--fg-primary) m-0">
                  {f.v}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href={href}
            className="text-sm text-(--aw-blue-700) hover:underline mt-auto"
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
      <PageHero
        title={
          <span className="inline-flex flex-col items-start gap-2.5">
            <AwLogo variant="mark" height={30} />
            Aswork Design System
          </span>
        }
      >
        Minimalismo geométrico ancorado em grayscale, pontuado por um único
        acento azul — a &ldquo;voz&rdquo; da IA. Cinza é estrutura; o gradiente
        é subjetividade. Este styleguide é a fonte de verdade da marca e do
        produto: da história ao token, tudo inspecionável e pronto para
        reuso.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-20">
          {/* ── Hero de apresentação ───────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl bg-aw-gray-1200 text-aw-gray-25">
            <div className="relative grid grid-cols-1 gap-10 px-12 py-14 lg:grid-cols-[1.5fr_1fr]">
              <div className="flex flex-col justify-between gap-10">
                <AwLogo variant="mark" height={36} className="text-aw-gray-25" />
                <div>
                  <p className="m-0 max-w-[640px] font-heading text-[clamp(26px,3vw,40px)] font-medium leading-[1.14] tracking-[-0.015em]">
                    Aswork is an artificial workforce layer for revenue
                    operations.
                  </p>
                  <p className="mb-0 mt-4 text-[16px] text-aw-gray-500">
                    Your company, working beyond itself.
                  </p>
                </div>
                {/* Botões manuais: o painel é escuro fixo (não flipa com o tema),
                    então as variants do AwButton (tokens semânticos) somem aqui. */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/bombardier/styleguide/marca/sobre"
                    className="inline-flex h-10 items-center rounded-full bg-aw-gray-25 px-5 text-sm font-medium text-aw-gray-1200 no-underline transition-colors hover:bg-white"
                  >
                    Conhecer a marca
                  </Link>
                  <Link
                    href="/bombardier/styleguide/marca/tom-de-voz"
                    className="inline-flex h-10 items-center rounded-full border border-white/20 px-5 text-sm font-medium text-aw-gray-200 no-underline transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Tom de voz
                  </Link>
                </div>
              </div>
              <div className="hidden items-center justify-center lg:flex">
                <AwBrandIllustration name="layers" size={280} className="opacity-90" />
              </div>
            </div>
            <div className="relative grid grid-cols-2 border-t border-white/10 md:grid-cols-4">
              {SYSTEM_STATS.map((s) => (
                <div
                  key={s.k}
                  className="border-r border-white/10 px-8 py-6 last:border-r-0"
                >
                  <div className="font-heading text-[26px] font-medium">{s.v}</div>
                  <div className="mt-0.5 text-[12px] text-aw-gray-500">{s.k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Comece por aqui ───────────────────────────────────────── */}
          <Section
            id="entradas"
            title="Comece por aqui"
            lead="Quatro áreas, uma sidebar. A busca cobre aliases — procure pelo nome que você conhece."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ENTRY_CARDS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 no-underline transition-all hover:-translate-y-0.5 hover:border-(--border-default) hover:shadow-(--shadow-sm)"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      background: `color-mix(in srgb, ${c.tint} 12%, transparent)`,
                      color: c.tint,
                    }}
                  >
                    <Icon name={c.icon} size={20} weight={300} />
                  </span>
                  <h3 className="mb-0 mt-4 text-[15px] font-semibold text-(--fg-primary)">
                    {c.title}
                  </h3>
                  <p className="mb-0 mt-1.5 text-sm leading-relaxed text-(--fg-secondary)">
                    {c.desc}
                  </p>
                </Link>
              ))}
            </div>
          </Section>

          <Section
            id="best-practices"
            title="Como usar este styleguide"
            lead="O primeiro objetivo é decisão rápida. Antes de abrir subpáginas técnicas, encontre a família canônica e siga a regra de escolha."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {canonicalFamilies.map((family) => (
                <Link
                  key={family.href}
                  href={family.href}
                  className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5 no-underline transition-colors hover:border-(--border-default) hover:bg-(--bg-hover)"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="m-0 text-(--fg-primary)">{family.title}</h4>
                    <AwPill variant="neutral">hub</AwPill>
                  </div>
                  <p className="body-sm m-0 mt-3 text-(--fg-secondary)">
                    {family.decision}
                  </p>
                  <p className="caption m-0 mt-3">
                    Busca cobre: {family.aliases}
                  </p>
                </Link>
              ))}
            </div>

            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Spec
                  k="1 · procure a família"
                  v="hub canônico"
                  d="A sidebar lista a decisão principal. Variações antigas ficam como aliases e links relacionados."
                />
                <Spec
                  k="2 · reuse o Aw*"
                  v="components/ui"
                  d="Produto importa wrapper Aw*. Shadcn primitive só fica por baixo do wrapper."
                />
                <Spec
                  k="3 · não crie token"
                  v="globals.css fechado"
                  d="Se faltar cor, spacing, radius ou shadow, reporte. Só a foundation cria tokens."
                />
              </div>
            </div>
          </Section>

          <Section
            id="color"
            title="Cor"
            lead="Dez escalas primitivas + ~30 tokens semânticos. Grayscale é estrutura, blue é a voz do produto. A página dedicada tem paleta completa, mapping primitivo → semântico, light/dark e contraste WCAG."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/color"
              sample={
                <div className="flex flex-col gap-3 w-full">
                  <div className="grid grid-cols-10 gap-1">
                    {[
                      "--aw-gray-1200",
                      "--aw-gray-1000",
                      "--aw-gray-800",
                      "--aw-gray-600",
                      "--aw-gray-400",
                      "--aw-gray-300",
                      "--aw-gray-200",
                      "--aw-gray-150",
                      "--aw-gray-100",
                      "--aw-gray-50",
                    ].map((t) => (
                      <div
                        key={t}
                        className="h-10 rounded-xs border border-(--border-subtle)"
                        style={{ backgroundColor: `var(${t})` }}
                        title={t}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {[
                      "--aw-blue-900",
                      "--aw-blue-700",
                      "--aw-blue-500",
                      "--aw-blue-300",
                      "--aw-blue-150",
                      "--aw-emerald-700",
                      "--aw-amber-500",
                      "--aw-red-600",
                      "--aw-purple-500",
                      "--aw-pink-300",
                    ].map((t) => (
                      <div
                        key={t}
                        className="h-10 rounded-xs border border-(--border-subtle)"
                        style={{ backgroundColor: `var(${t})` }}
                        title={t}
                      />
                    ))}
                  </div>
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
            title="Tipografia"
            lead="Uma voz: Geist + Geist Mono. Escala progressiva de 12 px (caption) a 96 px (display-xl). Tracking aperta com o tamanho. A página dedicada tem escala completa, regras de uso e exemplos."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/typography"
              sample={
                <div className="flex flex-col gap-2.5 w-full">
                  <div className="display-md leading-none">agent studio</div>
                  <h1 className="m-0">Crie agentes em 90 min</h1>
                  <h3 className="m-0">Cada token mora em globals.css</h3>
                  <p className="body-md m-0">
                    Body padrão · 16 px · Geist Regular · line-height 1.5.
                  </p>
                  <p className="body-sm m-0 text-(--fg-secondary)">
                    Body small · 14 px — usado em meta, captions de tabela e
                    suporte secundário.
                  </p>
                  <p className="caption m-0">
                    CAPTION · 12 PX · LABEL DE METADADOS
                  </p>
                  <code className="mono text-xs bg-(--bg-surface) px-2 py-1 rounded-sm w-fit">
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
            title="Espaçamento"
            lead="Base 4 px, passo padrão 8 px. Onze degraus de 4 a 72 px. A página dedicada tem escala completa, regras de uso por tier e padrões canônicos."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/spacing"
              sample={
                <div className="flex flex-col gap-2">
                  {spacing.map((s) => (
                    <div key={s.token} className="flex items-center gap-3">
                      <div className="w-10 text-[11px] font-medium text-(--fg-secondary)">
                        {s.name}
                      </div>
                      <div
                        className="h-2 rounded-xs bg-(--aw-blue-500)"
                        style={{ width: s.value }}
                      />
                      <div className="text-[11px] text-(--fg-tertiary)">
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
            title="Grid e layout"
            lead="Container 1200 px, 12 colunas, 5 breakpoints, 5 layouts canônicos. A página dedicada tem container, breakpoints, gutters e 5 layouts prontos pra copiar."
          >
            <FoundationSummary
              href="/bombardier/styleguide/foundation/grid"
              sample={
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded-xs bg-(--aw-blue-100) border border-(--aw-blue-200) flex items-center justify-center text-[10px] font-medium text-(--aw-blue-900)"
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
            title="Raio"
            lead="Suave e consistente. Botões usam full radius — mesma curva de avatars e pills. Cards em 12 px, modais e cards grandes em 16 px. Inputs em 8 px."
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {radii.map((r) => (
                <div
                  key={r.name}
                  className="flex flex-col items-center gap-3 p-4 border border-(--border-subtle) rounded-md bg-(--bg-raised)"
                >
                  <div
                    className="w-16 h-16 bg-(--aw-gray-1200)"
                    style={{ borderRadius: `var(${r.token})` }}
                  />
                  <div className="text-center">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-(--fg-tertiary) mt-0.5">
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
            title="Sombras"
            lead="Contidas. A maior parte da UI é flat-with-border. Sem sombras internas, sem sombras coloridas."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {shadows.map((s) => (
                <div
                  key={s.name}
                  className="h-28 rounded-lg bg-(--bg-raised) border border-(--border-subtle) flex flex-col items-center justify-center p-4"
                  style={{ boxShadow: `var(${s.token})` }}
                >
                  <div className="text-sm font-medium">{s.name}</div>
                  <code className="mono text-xs text-(--fg-tertiary) mt-1">
                    {s.token}
                  </code>
                  <div className="caption text-center mt-1">{s.use}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="motion"
            title="Movimento"
            lead="Rápido, utilitário. Durações de 120 a 280 ms. Sem bounces, sem overshoot. A única animação expressiva é o drift do mesh iridescente da IA."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
              <ul className="divide-y divide-(--border-subtle)">
                {motion.map((m) => (
                  <li
                    key={m.name}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <code className="mono text-sm">--{m.name}</code>
                    <span className="text-xs text-(--fg-tertiary)">
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
                  <div className="aw-gradient-iridescent h-14 rounded-full flex items-center justify-center text-sm font-medium text-(--aw-gray-1200)">
                    fill · iridescent
                  </div>
                  <div className="aw-gradient-iridescent-soft h-14 rounded-md border border-(--border-subtle) flex items-center justify-center text-sm font-medium text-(--fg-primary)">
                    soft mesh
                  </div>
                  <div
                    className="aw-gradient-iridescent-border h-14 rounded-full flex items-center justify-center text-sm font-medium text-(--fg-primary)"
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
            title="Casca escura"
            lead="A sidebar e o shell do produto vivem em uma superfície escura permanente. Esses tokens não viram com o modo escuro — eles descrevem o chrome."
          >
            <div
              className="rounded-xl p-8 flex flex-col gap-4"
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
                  className="flex-1 h-12 rounded-md flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: "var(--dark-bg-raised)",
                    color: "var(--dark-fg-primary)",
                  }}
                >
                  --dark-bg-raised
                </div>
                <div
                  className="flex-1 h-12 rounded-md flex items-center justify-center text-sm"
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
            title="Componentes"
            lead="Superfícies demo compostas só de tokens. Cada componente tem página própria com API e states no padrão canônico."
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
                <div className="aw-eyebrow mb-4">AwButton</div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <AwButton variant="primary">Criar agente</AwButton>
                    <AwButton variant="secondary">Cancelar</AwButton>
                    <AwButton variant="ghost">Saiba mais</AwButton>
                    <AwButton variant="danger">Excluir</AwButton>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AwButton variant="primary" size="sm">
                      Small
                    </AwButton>
                    <AwButton variant="primary" size="md">
                      Medium
                    </AwButton>
                    <AwButton variant="primary" size="lg">
                      Large
                    </AwButton>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AwButton variant="ai" iconLeft="agent">
                      Sugerir com IA
                    </AwButton>
                    <AwButton variant="secondary" iconLeft="upload">
                      Carregar arquivo
                    </AwButton>
                    <AwButton variant="primary" loading>
                      Salvando
                    </AwButton>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
                <div className="aw-eyebrow mb-4">AwCard</div>
                <AwCard>
                  <AwCardHeader>
                    <AwCardTitle>Agentes ativos</AwCardTitle>
                    <AwCardDescription>
                      12 agentes em produção. Última revisão há 3 dias.
                    </AwCardDescription>
                  </AwCardHeader>
                  <AwCardContent>
                    <div className="flex flex-wrap gap-1.5">
                      <AwPill variant="live" dot={false}>
                        Em produção
                      </AwPill>
                      <AwPill variant="beta" dot={false}>
                        Em review
                      </AwPill>
                      <AwPill variant="ai" dot={false}>
                        IA ativa
                      </AwPill>
                    </div>
                  </AwCardContent>
                </AwCard>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
                <div className="aw-eyebrow mb-4">AwPill</div>
                <div className="flex flex-wrap gap-2">
                  <AwPill variant="neutral">Neutral</AwPill>
                  <AwPill variant="ai">AI</AwPill>
                  <AwPill variant="live">Live</AwPill>
                  <AwPill variant="draft">Draft</AwPill>
                  <AwPill variant="beta">Beta</AwPill>
                  <AwPill variant="error">Error</AwPill>
                </div>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
                <div className="aw-eyebrow mb-4">AwInput · AwField</div>
                <div className="flex flex-col gap-4">
                  <AwField
                    label="Nome do agente"
                    htmlFor="sg-input-name"
                    helper="Visível para o time."
                  >
                    <AwInput
                      id="sg-input-name"
                      placeholder="ex: Vendas Outbound"
                    />
                  </AwField>
                  <AwField label="Workspace" htmlFor="sg-input-disabled">
                    <AwInput
                      id="sg-input-disabled"
                      value="artificial-concord"
                      disabled
                    />
                  </AwField>
                  <AwField label="Buscar" htmlFor="sg-input-search">
                    <AwInput
                      id="sg-input-search"
                      iconLeft="search"
                      placeholder="Filtrar por nome…"
                    />
                  </AwField>
                </div>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
                <div className="aw-eyebrow mb-4">AwAlert</div>
                <div className="flex flex-col gap-2">
                  <AwAlert variant="success" title="Agente aprovado.">
                    Pronto para deploy.
                  </AwAlert>
                  <AwAlert
                    variant="warning"
                    title="Aguardando revisão de compliance."
                  >
                    Bloqueante até liberação manual.
                  </AwAlert>
                  <AwAlert variant="danger" title="Falha no último deploy.">
                    Revise os logs para identificar a causa.
                  </AwAlert>
                  <AwAlert variant="info" title="Nova versão disponível.">
                    Atualize para receber os novos templates.
                  </AwAlert>
                </div>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
                <div className="aw-eyebrow mb-4">
                  AwCard · variant=&quot;ai&quot;
                </div>
                <AwCard variant="ai">
                  <AwCardHeader>
                    <AwCardTitle>Resumo da última conversa</AwCardTitle>
                    <AwCardDescription>
                      Insights gerados automaticamente pelo Cortex a partir das
                      últimas 24h de transcrições.
                    </AwCardDescription>
                  </AwCardHeader>
                  <AwCardContent>
                    <div className="flex flex-wrap gap-1.5">
                      <AwPill variant="ai" dot={false}>
                        Gerado por IA
                      </AwPill>
                      <AwPill variant="neutral" dot={false}>
                        18 mensagens
                      </AwPill>
                    </div>
                  </AwCardContent>
                </AwCard>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
