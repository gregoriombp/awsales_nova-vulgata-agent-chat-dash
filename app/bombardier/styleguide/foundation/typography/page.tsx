import {
  PageHero,
  Section,
  Spec,
  Tldr,
  Toc,
  CodeExample,
  DoDont,
  RelatedLinks,
} from "../../_primitives"

const TOC = [
  { id: "principles", label: "Princípios" },
  { id: "fonts", label: "Famílias" },
  { id: "weights", label: "Pesos" },
  { id: "display", label: "Display" },
  { id: "headings", label: "Headings" },
  { id: "body", label: "Body" },
  { id: "mono", label: "Mono" },
  { id: "utility", label: "Utilities" },
  { id: "tokens", label: "Tokens" },
  { id: "code", label: "Em código" },
  { id: "do-dont", label: "Do / Don't" },
  { id: "related", label: "Veja também" },
]

type TypeSpec = {
  name: string
  size: number
  leading: number
  tracking: string
  weight: number
  use: string
  token: string
}

type HeadingSpec = {
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  size: number
  leading: number
  tracking: string
  weight: number
  use: string
  token: string
}

const DISPLAY: TypeSpec[] = [
  { name: "display-xxl", size: 128, leading: 1.0, tracking: "-0.025em", weight: 300, token: "--display-xxl-size", use: "Splash externo, landing de marca" },
  { name: "display-xl",  size: 96,  leading: 1.0, tracking: "-0.025em", weight: 300, token: "--display-xl-size",  use: "Hero de landing" },
  { name: "display-lg",  size: 80,  leading: 1.0, tracking: "-0.025em", weight: 300, token: "--display-lg-size",  use: "Hero interno grande" },
  { name: "display-md",  size: 64,  leading: 1.0, tracking: "-0.025em", weight: 300, token: "--display-md-size",  use: "Marketing dentro do app" },
  { name: "display-sm",  size: 48,  leading: 1.0, tracking: "-0.025em", weight: 300, token: "--display-sm-size",  use: "Hero compacto, empty state" },
]

const HEADINGS: HeadingSpec[] = [
  { tag: "h1", size: 40, leading: 1.15, tracking: "-0.02em",  weight: 500, token: "--h1-size", use: "PageHero, primeiro título da rota" },
  { tag: "h2", size: 32, leading: 1.15, tracking: "-0.015em", weight: 500, token: "--h2-size", use: "Section.title dentro de uma página" },
  { tag: "h3", size: 28, leading: 1.15, tracking: "-0.01em",  weight: 500, token: "--h3-size", use: "Cabeçalho dentro de bloco grande" },
  { tag: "h4", size: 24, leading: 1.25, tracking: "-0.01em",  weight: 500, token: "--h4-size", use: "Cabeçalho de card de hero" },
  { tag: "h5", size: 20, leading: 1.3,  tracking: "-0.01em",  weight: 500, token: "--h5-size", use: "Sub-seção dentro de Section" },
  { tag: "h6", size: 18, leading: 1.35, tracking: "-0.01em",  weight: 500, token: "--h6-size", use: "Card title comum" },
]

const BODY: TypeSpec[] = [
  { name: "body-xl", size: 20, leading: 1.45, tracking: "-0.005em", weight: 400, token: "--body-xl-size", use: "Intro grande (rara)" },
  { name: "body-lg", size: 18, leading: 1.5,  tracking: "-0.005em", weight: 400, token: "--body-lg-size", use: "Lead de hero, intro de seção" },
  { name: "body-md", size: 16, leading: 1.55, tracking: "0",        weight: 400, token: "--body-md-size", use: "Padrão de leitura (default)" },
  { name: "body-sm", size: 14, leading: 1.5,  tracking: "0",        weight: 400, token: "--body-sm-size", use: "Corpo denso de UI, lista" },
  { name: "body-xs", size: 12, leading: 1.4,  tracking: "0.005em",  weight: 400, token: "--body-xs-size", use: "Caption, metadata" },
]

const GEIST_WEIGHTS: Array<{ value: number; name: string }> = [
  { value: 100, name: "Thin" },
  { value: 200, name: "ExtraLight" },
  { value: 300, name: "Light" },
  { value: 400, name: "Regular" },
  { value: 500, name: "Medium" },
  { value: 600, name: "SemiBold" },
  { value: 700, name: "Bold" },
  { value: 800, name: "ExtraBold" },
  { value: 900, name: "Black" },
]

export default function TypographyPage() {
  return (
    <>
      <PageHero title="Tipografia">
        <strong>Geist</strong> é a família principal da interface — usamos pra{" "}
        <em>tudo</em>: títulos, body, navegação, labels, números.{" "}
        <strong>Geist Mono</strong> entra <em>só</em> em conteúdo literalmente
        monoespaçado: código, tokens, IDs, paths e timestamps. Uma voz, uma
        escala, hierarquia via tamanho.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              <strong>Geist</strong> em <em>tudo</em> que é texto humano:
              títulos, body, botões, labels, números, navegação.
            </>,
            <>
              <strong>Geist Mono</strong> só em código, tokens, IDs, paths e
              timestamps.
            </>,
            <>
              Body padrão é <code className="mono">body-md (16px)</code>; só
              sobe em hero/landing.
            </>,
            <>
              Headings em <strong>medium (500)</strong>, display em{" "}
              <strong>light (300)</strong>.
            </>,
            <>
              Toda frase começa com maiúscula —{" "}
              <strong>&ldquo;Agent studio&rdquo;</strong>, nunca{" "}
              <em>agent studio</em>.
            </>,
          ]}
          dontUse={[
            <>Carregar outra fonte (Inter, Roboto, Manrope, etc.).</>,
            <>Misturar Geist Mono em texto humano (vira código falso).</>,
            <>
              Pular degraus —{" "}
              <code className="mono">font-size: 17px</code> não existe.
            </>,
            <>ALL CAPS fora de utility eyebrow.</>,
          ]}
        />

        <Toc items={TOC} />

        {/* ── Princípios ─────────────────────────────────────────── */}
        <Section
          id="principles"
          title="Princípios"
          lead="Quatro regras. Decoração mata leitura."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Principle
              n="01"
              title="Uma só voz"
              body="Geist em tudo. Geist Mono só em código. Sem fontes decorativas, sem fallback humanista."
            />
            <Principle
              n="02"
              title="Tracking inverso ao tamanho"
              body="Display aperta forte (-2.5%), heading neutraliza, body relaxa."
            />
            <Principle
              n="03"
              title="Pesos com função"
              body="Display em Light (300). Body em Regular (400). Heading em Medium (500). Bold (700) só em ênfase inline."
            />
            <Principle
              n="04"
              title="Hierarquia via tamanho"
              body="Não via cor, não via maiúsculas. Tamanho carrega o peso narrativo."
            />
          </div>
        </Section>

        {/* ── Famílias ───────────────────────────────────────────── */}
        <Section
          id="fonts"
          title="Famílias"
          lead="Duas. Carregadas via Google Fonts no layout raiz — sem CDN externo, sem FOUT. Geist é onipresente; Geist Mono é dosada."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-4">
              <div className="aw-eyebrow">--font-sans · principal</div>
              <div className="text-[64px] leading-none tracking-tight font-light text-(--fg-primary)">
                Geist
              </div>
              <p className="body-sm m-0 text-(--fg-secondary)">
                Sans-serif geométrica com personalidade neutra. É a família
                principal da interface — usada em <strong>tudo</strong>:
                títulos, body, botões, navegação, números. Carregamos todos os
                pesos (100 → 900).
              </p>
              <code className="mono text-xs text-(--fg-tertiary)">
                font-family: Geist, ui-sans-serif, system-ui, …
              </code>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-4">
              <div className="aw-eyebrow">--font-mono · auxiliar</div>
              <div
                className="text-[64px] leading-none font-medium text-(--fg-primary)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Geist Mono
              </div>
              <p className="body-sm m-0 text-(--fg-secondary)">
                Monospace pareada. Largura constante facilita leitura técnica.
                Use <strong>só</strong> em código, tokens (
                <code className="mono">--accent-brand</code>), IDs,
                timestamps e paths. <strong>Nunca</strong> em texto humano.
              </p>
              <code className="mono text-xs text-(--fg-tertiary)">
                font-family: &apos;Geist Mono&apos;, ui-monospace, SF Mono, Menlo, …
              </code>
            </div>
          </div>
        </Section>

        {/* ── Pesos ──────────────────────────────────────────────── */}
        <Section
          id="weights"
          title="Pesos"
          lead="Carregamos toda a faixa, do mais fino ao mais grosso. A aplicabilidade fina de cada peso ainda está em definição — por enquanto, display em Light (300), body em Regular (400) e heading em Medium (500) cobrem o essencial."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              {GEIST_WEIGHTS.map((w) => (
                <div
                  key={w.value}
                  className="flex items-baseline justify-between gap-4 border-b border-(--border-subtle) pb-3 last:border-b-0"
                >
                  <span
                    className="text-[40px] leading-none tracking-[-0.015em] text-(--fg-primary)"
                    style={{ fontWeight: w.value }}
                  >
                    Agent studio
                  </span>
                  <span className="shrink-0 text-right flex flex-col gap-0.5">
                    <code className="mono text-xs text-(--aw-blue-700)">
                      {w.value}
                    </code>
                    <span className="text-[11px] text-(--fg-tertiary)">
                      {w.name}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-4 py-3 mt-4 text-sm text-(--aw-blue-900)">
            Os 9 pesos estão disponíveis. Quais entram no produto, e onde, vai
            sendo decidido conforme as telas pedem.
          </div>
        </Section>

        {/* ── Display ────────────────────────────────────────────── */}
        <Section
          id="display"
          title="Display"
          lead="Tamanhos cinemáticos. Cinco escalas, todas em Geist Light (300) com tracking apertado e line-height 1. Use em landing, splash e hero externo."
        >
          <SpecCard>
            {DISPLAY.map((d) => (
              <SpecRow
                key={d.name}
                name={d.name}
                token={d.token}
                size={d.size}
                leading={d.leading}
                tracking={d.tracking}
                weight={d.weight}
                use={d.use}
                sample={<span className={d.name}>Agent studio</span>}
              />
            ))}
          </SpecCard>

          <UsagePattern
            fake={`<p className="display-xl">Agent studio</p>`}
            real={`<Typography variant="display-xl" component="p">
  Agent studio
</Typography>`}
          />
        </Section>

        {/* ── Headings ───────────────────────────────────────────── */}
        <Section
          id="headings"
          title="Headings"
          lead="Geist Medium (500). Tracking aperta de h1 (-2%) até h3 (-1%), depois line-height aumenta de 1.15 a 1.35 conforme o tamanho cai. Em código, use a tag HTML — os estilos já vêm de globals.css."
        >
          <SpecCard>
            {HEADINGS.map(({ tag: Tag, size, leading, tracking, weight, use, token }) => (
              <SpecRow
                key={Tag}
                name={Tag}
                token={token}
                size={size}
                leading={leading}
                tracking={tracking}
                weight={weight}
                use={use}
                sample={<Tag className="m-0">Agent studio</Tag>}
              />
            ))}
          </SpecCard>

          <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-4 py-3 text-sm text-(--aw-blue-900) mt-4">
            <strong>
              Headings nunca usam color decorativa — sempre{" "}
              <code className="mono">--fg-primary</code> herdado do contexto.
            </strong>
          </div>

          <UsagePattern
            fake={`<h2>Agent studio</h2>`}
            real={`<Typography variant="h2">Agent studio</Typography>`}
          />
        </Section>

        {/* ── Body ───────────────────────────────────────────────── */}
        <Section
          id="body"
          title="Body"
          lead="Geist Regular (400). Cinco degraus de 12 a 20 px. O padrão é body-md (16); leia o caso antes de subir/descer."
        >
          <SpecCard>
            {BODY.map((b) => (
              <SpecRow
                key={b.name}
                name={b.name}
                token={b.token}
                size={b.size}
                leading={b.leading}
                tracking={b.tracking}
                weight={b.weight}
                use={b.use}
                sample={
                  <p className={`${b.name} m-0 text-(--fg-primary)`}>
                    A navigation sidebar é a espinha dorsal da arquitetura de
                    informação da plataforma.
                  </p>
                }
              />
            ))}
          </SpecCard>

          <UsagePattern
            fake={`<p className="body-md">Texto humano em 16px.</p>`}
            real={`<Typography variant="body-md" component="p">
  Texto humano em 16px.
</Typography>`}
          />
        </Section>

        {/* ── Mono ───────────────────────────────────────────────── */}
        <Section
          id="mono"
          title="Mono"
          lead="Reservado: código, tokens, IDs, timestamps, paths, valores monoespaçados. Nunca em texto humano."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-3">
            <code className="mono text-(--mono-md-size) bg-(--bg-surface) px-3 py-2 rounded-sm w-fit">
              --accent-brand: var(--aw-blue-600);
            </code>
            <code className="mono text-(--mono-sm-size) bg-(--bg-surface) px-3 py-2 rounded-sm w-fit text-(--fg-secondary)">
              run_id: 01HX7K9DQNP7TC4PVAFQ3GZQY3
            </code>
            <code className="mono text-(--mono-sm-size) bg-(--bg-surface) px-3 py-2 rounded-sm w-fit text-(--fg-secondary)">
              2026-05-12T15:14:00.000Z
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
            <Spec
              k="mono-md"
              v="14px · lh 1.4 · ls 0 · 500"
              d="Default. Tokens em docs, código em <code>."
            />
            <Spec
              k="mono-sm"
              v="12px · lh 1.4 · ls 0.01em · 500"
              d="IDs, timestamps, metadados em UI."
            />
          </div>

          <UsagePattern
            fake={`<code className="mono">--accent-brand</code>`}
            real={`<Typography variant="mono-md" component="code">
  --accent-brand
</Typography>`}
          />
        </Section>

        {/* ── Utility ────────────────────────────────────────────── */}
        <Section
          id="utility"
          title="Utility classes"
          lead="Duas classes globais que poupam ctrl+c/ctrl+v. Existem porque aparecem em todo lugar."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-3">
              <div className="caption">Caption · 12px · lh 1.4</div>
              <code className="mono text-xs text-(--fg-tertiary)">
                .caption
              </code>
              <p className="body-sm m-0 text-(--fg-secondary)">
                12 px · <code className="mono">--fg-tertiary</code> ·
                line-height 1.4. Metadata abaixo de cards, footnotes em forms.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-3">
              <div className="aw-eyebrow">overline / eyebrow · 10px · 700</div>
              <code className="mono text-xs text-(--fg-tertiary)">
                .aw-eyebrow
              </code>
              <p className="body-sm m-0 text-(--fg-secondary)">
                Uppercase, letter-spacing 0.12em, peso bold (700). Headers de
                tabela, labels de Spec/PropRow.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Tokens ─────────────────────────────────────────────── */}
        <Section
          id="tokens"
          title="Tokens"
          lead="Todos os tamanhos saem destes vars. Mudar lá muda em cascata."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="pb-2 aw-eyebrow">token</th>
                  <th className="pb-2 aw-eyebrow">value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...DISPLAY.map((d) => ({ token: d.token, value: `${d.size}px` })),
                  ...HEADINGS.map((h) => ({ token: h.token, value: `${h.size}px` })),
                  ...BODY.map((b) => ({ token: b.token, value: `${b.size}px` })),
                  { token: "--mono-md-size", value: "14px" },
                  { token: "--mono-sm-size", value: "12px" },
                ].map((t) => (
                  <tr
                    key={t.token}
                    className="border-b border-(--border-subtle) last:border-b-0 align-top"
                  >
                    <td className="py-2 pr-4 mono text-xs text-(--aw-blue-700) whitespace-nowrap">
                      {t.token}
                    </td>
                    <td className="py-2 text-xs font-medium text-(--fg-primary)">
                      {t.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Em código ──────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="No styleguide o exemplo aparece com a tag HTML + className representando a variant. Na implementação real, o time usa o componente <Typography /> com variant + component. Mostramos os dois lados pra deixar o mapping explícito."
        >
          <UsagePattern
            label="Display"
            fake={`<p className="display-xl">Agent studio</p>`}
            real={`<Typography variant="display-xl" component="p">
  Agent studio
</Typography>`}
          />
          <UsagePattern
            label="Heading"
            fake={`<h2>Agent studio</h2>`}
            real={`<Typography variant="h2">Agent studio</Typography>`}
          />
          <UsagePattern
            label="Body"
            fake={`<p className="body-md">Texto humano em 16px.</p>`}
            real={`<Typography variant="body-md" component="p">
  Texto humano em 16px.
</Typography>`}
          />
          <UsagePattern
            label="Utility (caption, eyebrow, mono)"
            fake={`<span className="caption">metadata · 12px tertiary</span>
<div className="aw-eyebrow">overline · uppercase tracked</div>
<code className="mono">--accent-brand</code>`}
            real={`<Typography variant="caption">metadata · 12px tertiary</Typography>
<Typography variant="eyebrow">overline · uppercase tracked</Typography>
<Typography variant="mono-md" component="code">--accent-brand</Typography>`}
          />

          <CodeExample label="forma curta com tag semântica">{`// Heading nunca precisa de className — a tag carrega o estilo.
<h1>Agent studio</h1>
<h2>Como funciona</h2>
<p>Texto humano em body-md por padrão (herdado).</p>`}</CodeExample>
        </Section>

        {/* ── Do / Don't ─────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Use Geist em <em>tudo</em> que é texto humano — não tem motivo
                pra carregar outra fonte.
              </>,
              <>
                Use as tags semânticas (h1–h6, p, code) — estilo já vem.
              </>,
              <>
                Para tamanho custom, consuma <code className="mono">var(--*-size)</code>.
              </>,
              <>
                Body padrão é <code className="mono">body-md</code> (16). Suba
                só em hero.
              </>,
              <>
                Toda frase começa com maiúscula — <strong>&ldquo;Agent
                studio&rdquo;</strong>, não <em>agent studio</em>.
              </>,
              <>
                Mono apenas em código, tokens, IDs, timestamps.
              </>,
              <>
                Ênfase via <code className="mono">&lt;strong&gt;</code>{" "}
                inline, não cor.
              </>,
            ]}
            donts={[
              <>Carregar outra família (Inter, Roboto, Manrope).</>,
              <>
                <code className="mono">font-size: 17px</code> ou outros valores
                fora da escala.
              </>,
              <>Mono em texto humano (vira código falso).</>,
              <>Bold 700 fora de inline emphasis ou eyebrow.</>,
              <>
                ALL CAPS fora de <code className="mono">.aw-eyebrow</code>.
              </>,
              <>
                Frases em minúscula no produto (<em>agent studio</em>,{" "}
                <em>visão geral</em>).
              </>,
            ]}
          />
        </Section>

        {/* ── Related ────────────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Cor",
                href: "/bombardier/styleguide/foundation/color",
                description: "Hierarquia de --fg-* que tipografia consome.",
              },
              {
                name: "Spacing",
                href: "/bombardier/styleguide/foundation/spacing",
                description: "Line-height converge com a lógica da escala de spacing.",
              },
              {
                name: "Grid &amp; layout",
                href: "/bombardier/styleguide/foundation/grid",
                description: "Largura máxima de texto e reflow em mobile.",
              },
              {
                name: "Escrita",
                href: "/bombardier/styleguide/foundation/content",
                description: "Voz, tom e padrões de microcopy.",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}

/* ────────────────────────────────────────────────────────────
 * Componentes locais
 * ──────────────────────────────────────────────────────────── */

function Principle({
  n,
  title,
  body,
}: {
  n: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5 flex flex-col gap-2">
      <span className="text-xs text-(--fg-tertiary)">{n}</span>
      <div className="text-sm font-medium text-(--fg-primary)">
        {title}
      </div>
      <p className="body-sm m-0 text-(--fg-secondary)">{body}</p>
    </div>
  )
}

function SpecCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-col gap-6">
      {children}
    </div>
  )
}

function SpecRow({
  name,
  token,
  size,
  leading,
  tracking,
  weight,
  use,
  sample,
}: {
  name: string
  token: string
  size: number
  leading: number
  tracking: string
  weight: number
  use: string
  sample: React.ReactNode
}) {
  return (
    <div className="flex items-baseline gap-6 border-b border-(--border-subtle) pb-6 last:border-b-0 last:pb-0">
      <div className="w-44 shrink-0 flex flex-col gap-0.5 pt-1">
        <code className="mono text-xs text-(--fg-primary)">{name}</code>
        <code className="mono text-[10px] text-(--aw-blue-700)">
          {token}
        </code>
        <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] text-(--fg-tertiary) leading-tight">
          <span>
            <span className="text-(--fg-secondary)">size</span> · {size}px
          </span>
          <span>
            <span className="text-(--fg-secondary)">line-height</span> ·{" "}
            {leading}
          </span>
          <span>
            <span className="text-(--fg-secondary)">tracking</span> ·{" "}
            {tracking}
          </span>
          <span>
            <span className="text-(--fg-secondary)">weight</span> ·{" "}
            {weight}
          </span>
        </div>
        <span className="mt-1.5 text-[11px] text-(--fg-tertiary)">
          {use}
        </span>
      </div>
      <div className="flex-1 min-w-0">{sample}</div>
    </div>
  )
}

function UsagePattern({
  label,
  fake,
  real,
}: {
  label?: string
  fake: string
  real: string
}) {
  return (
    <div className="mt-4">
      {label && (
        <div className="text-xs text-(--fg-tertiary) mb-2 mono">
          {label}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeExample label="no styleguide (exemplo)">{fake}</CodeExample>
        <CodeExample label="na implementação real">{real}</CodeExample>
      </div>
    </div>
  )
}
