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

const DISPLAY = [
  { name: "display-xl", size: 96, token: "--display-xl-size", use: "splash, landing externa" },
  { name: "display-lg", size: 80, token: "--display-lg-size", use: "hero de landing" },
  { name: "display-md", size: 64, token: "--display-md-size", use: "marketing internal hero" },
  { name: "display-sm", size: 48, token: "--display-sm-size", use: "hero compacto, empty state" },
]

const HEADINGS: Array<{ tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; size: number; token: string; use: string }> = [
  { tag: "h1", size: 40, token: "--h1-size", use: "PageHero, primeiro título da rota" },
  { tag: "h2", size: 32, token: "--h2-size", use: "Section.title (h2 dentro de uma página)" },
  { tag: "h3", size: 28, token: "--h3-size", use: "Cabeçalho dentro de bloco grande" },
  { tag: "h4", size: 24, token: "--h4-size", use: "Cabeçalho de card de hero" },
  { tag: "h5", size: 20, token: "--h5-size", use: "Sub-seção dentro de Section" },
  { tag: "h6", size: 18, token: "--h6-size", use: "Card title comum" },
]

const BODY = [
  { name: "body-xl", size: 20, token: "--body-xl-size", use: "intro grande (rara)" },
  { name: "body-lg", size: 18, token: "--body-lg-size", use: "lead de hero, intro de seção" },
  { name: "body-md", size: 16, token: "--body-md-size", use: "padrão de leitura (default)" },
  { name: "body-sm", size: 14, token: "--body-sm-size", use: "corpo denso de UI, lista" },
  { name: "body-xs", size: 12, token: "--body-xs-size", use: "caption, metadata" },
]

export default function TypographyPage() {
  return (
    <>
      <PageHero title="Tipografia">
        Uma voz: <strong>Geist</strong>. <strong>Geist Mono</strong> só pra
        código, tokens e IDs. Escala progressiva de 12 px (caption) a 96 px
        (display-xl). Tracking aperta com o tamanho — display em -2%, body em
        neutro.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Use <strong>Geist</strong> pra tudo que é texto humano.</>,
            <>Use <strong>Geist Mono</strong> só pra código, tokens, IDs e timestamps.</>,
            <>
              Default de body é <code className="mono">body-md (16px)</code>. Subir
              só em hero/landing.
            </>,
            <>
              Headings sempre <strong>medium (500)</strong>, nunca bold (700).
            </>,
          ]}
          dontUse={[
            <>Carregar outra fonte (Inter, Roboto, etc.).</>,
            <>Misturar Geist Mono em texto humano (vira código falso).</>,
            <>Pular degraus arbitrariamente — <code className="mono">font-size: 17px</code> não existe.</>,
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
              body="Geist + Geist Mono. Sem fontes decorativas, sem fallback humanista."
            />
            <Principle
              n="02"
              title="Tracking inverso ao tamanho"
              body="Display aperta (-2% / -1.5%), heading neutraliza, body relaxa."
            />
            <Principle
              n="03"
              title="Peso 400 / 500"
              body="Regular pra body, Medium pra heading. Bold (700) só em ênfase inline."
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
          lead="Duas. Carregadas via Next/Font no layout raiz — sem CDN externo, sem FOUT."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-4">
              <div className="aw-eyebrow">--font-sans</div>
              <div className="text-[48px] leading-none tracking-[-0.02em] font-medium text-[var(--fg-primary)]">
                Geist
              </div>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                Sans-serif geométrica com personalidade neutra. Carrega
                pesos 400 (Regular) e 500 (Medium). Para qualquer texto humano.
              </p>
              <code className="mono text-xs text-[var(--fg-tertiary)]">
                font-family: Geist, ui-sans-serif, system-ui, …
              </code>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-4">
              <div className="aw-eyebrow">--font-mono</div>
              <div
                className="text-[48px] leading-none font-medium text-[var(--fg-primary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Geist Mono
              </div>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                Monospace pareada. Largura constante facilita leitura de
                código, tokens e IDs. <strong>Nunca</strong> em texto humano.
              </p>
              <code className="mono text-xs text-[var(--fg-tertiary)]">
                font-family: &apos;Geist Mono&apos;, ui-monospace, SF Mono, Menlo, …
              </code>
            </div>
          </div>
        </Section>

        {/* ── Display ────────────────────────────────────────────── */}
        <Section
          id="display"
          title="Display"
          lead="Tamanhos cinemáticos. Quatro escalas, todas Geist Medium com tracking -2%, line-height 1. Use só em landing/splash/hero externo."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-col gap-6">
            {DISPLAY.map((d) => (
              <div
                key={d.name}
                className="flex items-baseline gap-6 border-b border-[var(--border-subtle)] pb-6 last:border-b-0 last:pb-0"
              >
                <div className="w-32 shrink-0 text-xs text-[var(--fg-tertiary)] pt-2 flex flex-col gap-0.5">
                  <code className="mono">{d.name}</code>
                  <span className="text-[var(--aw-blue-700)]">{d.size}px</span>
                  <span className="text-[var(--fg-tertiary)]">{d.use}</span>
                </div>
                <div className={d.name}>agent studio</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Headings ───────────────────────────────────────────── */}
        <Section
          id="headings"
          title="Headings"
          lead="Geist Medium. Tracking aperta de h1 (-2%) até h3 (neutro), depois line-height aumenta de 1.15 a 1.35. Em código, use a tag HTML (h1–h6) — os estilos já vêm de globals.css."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-col gap-4">
            {HEADINGS.map(({ tag: Tag, size, token, use }) => (
              <div
                key={Tag}
                className="flex items-baseline gap-6 border-b border-[var(--border-subtle)] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="w-32 shrink-0 text-xs text-[var(--fg-tertiary)] flex flex-col gap-0.5">
                  <code className="mono">{Tag}</code>
                  <span className="text-[var(--aw-blue-700)]">{size}px</span>
                  <code className="mono">{token}</code>
                </div>
                <Tag className="m-0">
                  Crie agentes em menos de 90 minutos
                </Tag>
              </div>
            ))}
            <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-4 py-3 text-sm text-[var(--aw-blue-900)] mt-2">
              <strong>
                Headings nunca usam color decorativa — sempre{" "}
                <code className="mono">--fg-primary</code> herdado do contexto.
              </strong>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">tag</th>
                  <th className="pb-2 aw-eyebrow">token</th>
                  <th className="pb-2 aw-eyebrow">px</th>
                  <th className="pb-2 aw-eyebrow">uso</th>
                </tr>
              </thead>
              <tbody>
                {HEADINGS.map((h) => (
                  <tr
                    key={h.tag}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
                      {h.tag}
                    </td>
                    <td className="py-3 pr-4 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
                      {h.token}
                    </td>
                    <td className="py-3 pr-4 text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
                      {h.size}px
                    </td>
                    <td className="py-3 text-sm text-[var(--fg-secondary)]">
                      {h.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Body ───────────────────────────────────────────────── */}
        <Section
          id="body"
          title="Body"
          lead="Geist Regular (400). Cinco degraus de 12 a 20 px. O padrão é body-md (16); leia o caso antes de subir/descer."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-col gap-3">
            {BODY.map((b) => (
              <div
                key={b.name}
                className="flex items-baseline gap-6 border-b border-[var(--border-subtle)] pb-3 last:border-b-0 last:pb-0"
              >
                <div className="w-32 shrink-0 text-xs text-[var(--fg-tertiary)] flex flex-col gap-0.5">
                  <code className="mono">{b.name}</code>
                  <span className="text-[var(--aw-blue-700)]">{b.size}px</span>
                  <span className="text-[var(--fg-tertiary)]">{b.use}</span>
                </div>
                <p
                  className="m-0"
                  style={{ fontSize: `var(${b.token})` }}
                >
                  A Navigation Sidebar é a espinha dorsal da arquitetura de
                  informação da plataforma.
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Mono ───────────────────────────────────────────────── */}
        <Section
          id="mono"
          title="Mono"
          lead="Reservado: código, tokens, IDs, timestamps, paths, valores monoespaçados. Nunca em texto humano."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-3">
            <code className="mono text-[var(--mono-md-size)] bg-[var(--bg-surface)] px-3 py-2 rounded-[var(--radius-sm)] w-fit">
              --accent-brand: var(--aw-blue-600);
            </code>
            <code className="mono text-[var(--mono-sm-size)] bg-[var(--bg-surface)] px-3 py-2 rounded-[var(--radius-sm)] w-fit text-[var(--fg-secondary)]">
              run_id: 01HX7K9DQNP7TC4PVAFQ3GZQY3
            </code>
            <code className="mono text-[var(--mono-sm-size)] bg-[var(--bg-surface)] px-3 py-2 rounded-[var(--radius-sm)] w-fit text-[var(--fg-secondary)]">
              2026-05-12T15:14:00.000Z
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <Spec
              k="mono-md"
              v="14 px · --mono-md-size"
              d="Default. Tokens em docs, código em <code>."
            />
            <Spec
              k="mono-sm"
              v="12 px · --mono-sm-size"
              d="IDs, timestamps, metadados em UI."
            />
          </div>
        </Section>

        {/* ── Utility ────────────────────────────────────────────── */}
        <Section
          id="utility"
          title="Utility classes"
          lead="Duas classes globais que poupam ctrl+c/ctrl+v. Existem porque aparecem em todo lugar."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-3">
              <div className="caption">caption</div>
              <code className="mono text-xs text-[var(--fg-tertiary)]">
                .caption
              </code>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                12 px · <code className="mono">--fg-tertiary</code> · line-height
                1.4. Metadata abaixo de cards, footnotes em forms.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-3">
              <div className="aw-eyebrow">overline / eyebrow</div>
              <code className="mono text-xs text-[var(--fg-tertiary)]">
                .aw-eyebrow
              </code>
              <p className="body-sm m-0 text-[var(--fg-secondary)]">
                Uppercase, letter-spacing 0.12em, peso medium. Headers de
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
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
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
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="py-2 pr-4 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
                      {t.token}
                    </td>
                    <td className="py-2 text-xs font-medium text-[var(--fg-primary)]">
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
          lead="As tags HTML já vêm estilizadas via globals.css. Para utilities use as classes; para custom, consuma o token."
        >
          <CodeExample label="tag semântica (preferido)">{`<h1>Crie agentes em minutos</h1>
<h2>Como funciona</h2>
<p>Texto humano em body-md por padrão (herdado).</p>`}</CodeExample>

          <CodeExample label="tamanho custom via token">{`<p style={{ fontSize: "var(--body-lg-size)" }}>
  Lead de hero — 18px.
</p>

<span className="caption">metadata · 12px tertiary</span>
<div className="aw-eyebrow">overline · uppercase tracked</div>`}</CodeExample>

          <CodeExample label="mono (código, tokens, ids)">{`<code className="mono text-sm">
  --accent-brand
</code>`}</CodeExample>
        </Section>

        {/* ── Do / Don't ─────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Use as tags semânticas (h1–h6, p, code) — estilo já vem.
              </>,
              <>
                Para tamanho custom, consuma <code className="mono">var(--*-size)</code>.
              </>,
              <>
                Body padrão é <code className="mono">body-md</code> (16). Suba só
                em hero.
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
              <>Bold 700 fora de inline emphasis.</>,
              <>ALL CAPS fora de <code className="mono">.aw-eyebrow</code>.</>,
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
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-2">
      <span className="text-xs text-[var(--fg-tertiary)]">{n}</span>
      <div className="text-sm font-medium text-[var(--fg-primary)]">
        {title}
      </div>
      <p className="body-sm m-0 text-[var(--fg-secondary)]">{body}</p>
    </div>
  )
}
