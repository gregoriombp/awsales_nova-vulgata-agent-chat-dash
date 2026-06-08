/* eslint-disable @next/next/no-img-element */
import { AW_LOGO_ASSETS } from "@/components/ui/AwLogo"
import { AwLogo } from "@/components/ui/AwLogo"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

type Tone = "brand" | "muted" | "black" | "white" | "brand-on-dark" | "muted-on-dark"

type LogoExport = {
  kind: "mark" | "wordmark"
  tone: Tone
  label: string
  src: string
  intent: string
  /** True quando o asset precisa renderizar sobre fundo escuro pra ler. */
  needsDarkBg?: boolean
  /** Mensagem do bug quando o PNG está incorreto e precisa ser regenerado. */
  bug?: string
}

const MARKS: LogoExport[] = [
  {
    kind: "mark",
    tone: "brand",
    label: "Mark · brand",
    src: AW_LOGO_ASSETS.mark.brand,
    intent: "Default em superfícies neutras claras. A cor canônica.",
  },
  {
    kind: "mark",
    tone: "muted",
    label: "Mark · muted",
    src: AW_LOGO_ASSETS.mark.muted,
    intent: "Estados secundários: footer, watermark, slide de transição.",
  },
  {
    kind: "mark",
    tone: "black",
    label: "Mark · black",
    src: AW_LOGO_ASSETS.mark.black,
    intent: "Impressão preto-e-branco, fax, mono offset, ícone monocromo.",
  },
  {
    kind: "mark",
    tone: "white",
    label: "Mark · white",
    src: AW_LOGO_ASSETS.mark.white,
    intent: "Product shell escuro, hero ai-gradient, fundo de mídia.",
    needsDarkBg: true,
  },
]

const WORDMARKS: LogoExport[] = [
  {
    kind: "wordmark",
    tone: "brand",
    label: "Wordmark · brand",
    src: AW_LOGO_ASSETS.wordmark.brand,
    intent: "Aw azul + sales branco com transparência. Use sobre fundo escuro ou colorido — em fundo branco o 'sales' fica invisível.",
    needsDarkBg: true,
  },
  {
    kind: "wordmark",
    tone: "muted",
    label: "Wordmark · muted",
    src: AW_LOGO_ASSETS.wordmark.muted,
    intent: "Assinatura inferior, e-mail, documentos longos.",
  },
  {
    kind: "wordmark",
    tone: "black",
    label: "Wordmark · black",
    src: AW_LOGO_ASSETS.wordmark.black,
    intent: "Impressão monocroma, deck preto-no-branco, fax.",
  },
  {
    kind: "wordmark",
    tone: "brand-on-dark",
    label: "Wordmark · brand on dark",
    src: AW_LOGO_ASSETS.wordmark.brandOnDark,
    intent: "Wordmark canônico em fundo escuro. Hero ai-gradient, product shell.",
    needsDarkBg: true,
  },
  {
    kind: "wordmark",
    tone: "muted-on-dark",
    label: "Wordmark · muted on dark",
    src: AW_LOGO_ASSETS.wordmark.mutedOnDark,
    intent: "Assinatura secundária em superfícies escuras (footer dark).",
    needsDarkBg: true,
  },
  {
    kind: "wordmark",
    tone: "white",
    label: "Wordmark · white",
    src: AW_LOGO_ASSETS.wordmark.white,
    intent: "Impressão sobre cor sólida saturada (deck, social, hero).",
    needsDarkBg: true,
    bug: "Asset exportado preto em vez de branco — regenerar antes de distribuir. Enquanto isso, use o SVG wordmark-white.svg.",
  },
]

type SvgExport = {
  label: string
  src: string
  note: string
  needsDarkBg?: boolean
}

const SVG_EXPORTS: SvgExport[] = [
  {
    label: "mark.svg",
    src: AW_LOGO_ASSETS.svg.mark,
    note: "Preto sólido. Use quando o destino precisa de vetorial puro.",
  },
  {
    label: "mark-brand.svg",
    src: AW_LOGO_ASSETS.svg.markBrand,
    note: "Brand color sólido. Hero, hardcoded.",
  },
  {
    label: "mark-white.svg",
    src: AW_LOGO_ASSETS.svg.markWhite,
    note: "Branco sólido. Sobre superfície escura.",
    needsDarkBg: true,
  },
  {
    label: "wordmark-black.svg",
    src: AW_LOGO_ASSETS.svg.wordmarkBlack,
    note: "Wordmark preto, sem brand color. Mono.",
  },
  {
    label: "wordmark-brand.svg",
    src: AW_LOGO_ASSETS.svg.wordmarkBrand,
    note: "Wordmark canônico em vetor (blue Aw + black sales).",
  },
  {
    label: "wordmark-white.svg",
    src: AW_LOGO_ASSETS.svg.wordmarkWhite,
    note: "Wordmark branco. Sobre superfície escura.",
    needsDarkBg: true,
  },
]

/* Cor de preview por tom. Para `brand`, o wordmark prefere a versão SVG com
 * gradiente (Aw azul + sales preto); o mark é renderizado em cor sólida. */
const TONE_COLOR: Record<Tone, string> = {
  brand: "var(--aw-blue-600)",
  muted: "var(--aw-gray-500)",
  black: "var(--aw-gray-1200)",
  white: "#ffffff",
  "brand-on-dark": "var(--aw-blue-400)",
  "muted-on-dark": "var(--aw-gray-500)",
}

function LogoCardPreview({ item }: { item: LogoExport }) {
  const height = item.kind === "mark" ? 96 : 36

  // Wordmark brand (light e on-dark) usa a SVG estática com gradiente — única
  // forma de manter o dois-tons (blue Aw + black sales) num único asset.
  if (item.kind === "wordmark" && item.tone === "brand") {
    return (
      <img
        src={AW_LOGO_ASSETS.svg.wordmarkBrand}
        alt={item.label}
        style={{ display: "block", height, width: "auto" }}
      />
    )
  }

  // Restante: renderiza inline com cor controlada via currentColor.
  return (
    <span
      aria-label={item.label}
      style={{ color: TONE_COLOR[item.tone], display: "inline-flex" }}
    >
      <AwLogo variant={item.kind} height={height} />
    </span>
  )
}

function LogoCard({ item }: { item: LogoExport }) {
  const hasBug = Boolean(item.bug)
  return (
    <div
      className="rounded-lg border overflow-hidden flex flex-col"
      style={{
        background: item.needsDarkBg ? "var(--dark-bg)" : "var(--bg-raised)",
        borderColor: hasBug ? "var(--aw-amber-400)" : "var(--border-subtle)",
      }}
    >
      {hasBug ? (
        <div
          className="aw-eyebrow px-4 py-1.5"
          style={{
            background: "var(--aw-amber-100)",
            color: "var(--aw-amber-900)",
            borderBottom: "1px solid var(--aw-amber-400)",
          }}
        >
          asset bugado · regenerar
        </div>
      ) : null}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ minHeight: item.kind === "mark" ? 180 : 140 }}
      >
        <LogoCardPreview item={item} />
      </div>
      <div className="px-4 py-3 border-t border-(--border-subtle) bg-(--bg-raised) flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-(--fg-primary)">
            {item.label}
          </span>
          <code className="mono text-[10px] text-(--fg-tertiary)">
            {item.src.split("/").pop()}
          </code>
        </div>
        <p className="caption">{item.intent}</p>
        {hasBug ? (
          <p
            className="caption mt-1"
            style={{ color: "var(--aw-amber-900)" }}
          >
            <strong>Bug:</strong> {item.bug}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default function LogosPage() {
  return (
    <>
      <PageHero title="Logos">
        Duas glifas que formam <strong>Aw</strong>: o A triangular e o w em três
        traços. O <strong>mark</strong> (Aw) é a forma autônoma; o{" "}
        <strong>wordmark</strong> (Awsales) acompanha em cabeçalhos, documentos
        e assinatura. Esta página é a fonte de verdade para qualquer aplicação
        da logo AwSales — em código, deck, e-mail, social, print.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* ── AwLogo vs AwBrandLogo ───────────────────────────────────── */}
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 text-sm text-(--aw-blue-900)">
          <strong>AwLogo vs AwBrandLogo.</strong> Esta página documenta o{" "}
          <code className="mono">AwLogo</code> — a logo do{" "}
          <strong>próprio AwSales</strong>. Para logos de{" "}
          <strong>marcas de terceiros</strong> (WhatsApp, Stripe, Hotmart…), use{" "}
          <code className="mono">AwBrandLogo</code>, documentado em{" "}
          <a
            href="/bombardier/styleguide/components/brand-logo"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            Components → Brand logo
          </a>
          .
        </div>

        {/* ── Decisão ─────────────────────────────────────────────────── */}
        <Section
          id="decision"
          title="Quando usar o quê"
          lead="Três caminhos. A regra primeira: dentro do app, prefira o componente. Fora do app, prefira PNG. SVG estático é o último recurso quando o componente não cabe e o PNG não escala."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="aw-eyebrow px-5 py-3">contexto</th>
                  <th className="aw-eyebrow px-5 py-3">use</th>
                  <th className="aw-eyebrow px-5 py-3">por quê</th>
                </tr>
              </thead>
              <tbody className="text-(--fg-secondary)">
                <tr className="border-b border-(--border-subtle) last:border-b-0 align-top">
                  <td className="px-5 py-4 text-(--fg-primary)">
                    UI do produto, sidebar, header, footer
                  </td>
                  <td className="px-5 py-4 mono text-xs text-(--aw-blue-700)">
                    {`<AwLogo />`}
                  </td>
                  <td className="px-5 py-4">
                    SVG inline com <code className="mono">fill=currentColor</code> —
                    herda cor do contexto, escala vetorial, sem request HTTP.
                  </td>
                </tr>
                <tr className="border-b border-(--border-subtle) last:border-b-0 align-top">
                  <td className="px-5 py-4 text-(--fg-primary)">
                    E-mail transacional, deck, social, favicon, OG image
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-(--aw-blue-700)">
                    PNG export oficial
                  </td>
                  <td className="px-5 py-4">
                    Renderiza em qualquer cliente sem fonte/CSS. Cores fixas pré-aprovadas.
                  </td>
                </tr>
                <tr className="border-b border-(--border-subtle) last:border-b-0 align-top">
                  <td className="px-5 py-4 text-(--fg-primary)">
                    Marketing site externo (Next/Image), hero hardcoded
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-(--aw-blue-700)">
                    SVG estático
                  </td>
                  <td className="px-5 py-4">
                    Vetor com cor fixa quando o componente React não é viável (HTML puro,
                    e-mail rico que aceita SVG, ilustração).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Anatomia ────────────────────────────────────────────────── */}
        <Section
          id="anatomy"
          title="Anatomia"
          lead="A altura do mark é a unidade-raiz (x). Todas as regras de espaço e tamanho derivam dela."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-10 flex items-center gap-12 flex-wrap">
            <span style={{ color: "var(--aw-blue-600)", display: "inline-flex" }}>
              <AwLogo variant="mark" height={96} />
            </span>
            <div className="flex flex-col gap-3">
              <Spec
                k="unidade-raiz"
                v="x = altura do mark"
                d="Todas as medidas derivam."
              />
              <Spec
                k="clear-space"
                v="≥ 0.5x ao redor"
                d="Nenhum elemento invade esse raio."
              />
              <Spec
                k="alinhamento"
                v="baseline óptica, não matemática"
                d="O centro visual do Aw é o eixo — não o canto do A."
              />
              <Spec
                k="proporção wordmark"
                v="largura wordmark = altura × 4.6"
                d="A largura do wordmark é fixa em relação à altura do mark."
              />
            </div>
          </div>
        </Section>

        {/* ── Componente AwLogo ───────────────────────────────────────── */}
        <Section
          id="component"
          title="Componente · AwLogo"
          lead="Caminho preferencial dentro do produto. SVG inline com fill=currentColor — herda a cor do parent via text-* token."
        >
          <Stage label="Variant · wordmark" hint="Wordmark (Awsales). Cor vem do parent via text-* token.">
            <span style={{ color: "var(--fg-primary)" }}>
              <AwLogo variant="wordmark" height={24} />
            </span>
            <span style={{ color: "var(--aw-blue-600)" }}>
              <AwLogo variant="wordmark" height={24} />
            </span>
          </Stage>

          <Stage label="Variant · mark" hint="Mark (Aw). Forma autônoma — use sozinho, nunca ao lado do wordmark.">
            <span style={{ color: "var(--fg-primary)" }}>
              <AwLogo variant="mark" height={32} />
            </span>
            <span style={{ color: "var(--aw-blue-600)" }}>
              <AwLogo variant="mark" height={32} />
            </span>
          </Stage>

          <Stage label="Sobre superfície escura · wordmark" hint="O mesmo componente; cor vem do parent." dark>
            <span style={{ color: "var(--dark-fg-primary)" }}>
              <AwLogo variant="wordmark" height={24} />
            </span>
          </Stage>

          <Stage label="Sobre superfície escura · mark" hint="Forma autônoma sobre dark." dark>
            <span style={{ color: "var(--dark-fg-primary)" }}>
              <AwLogo variant="mark" height={32} />
            </span>
          </Stage>

          <ApiTable>
            <PropRow
              prop="variant"
              type='"wordmark" | "mark"'
              def='"wordmark"'
              doc="Forma autônoma (mark = Aw) ou completa (wordmark = Awsales)."
            />
            <PropRow
              prop="height"
              type="number"
              def="20"
              doc="Altura em px. A largura é calculada automaticamente para preservar o aspect ratio."
            />
            <PropRow
              prop="className"
              type="string"
              doc="Classes utilitárias adicionais no <svg>."
            />
            <PropRow
              prop="style"
              type="CSSProperties"
              doc='Útil para forçar cor: style={{ color: "var(--aw-blue-600)" }}.'
            />
            <PropRow
              prop="aria-label"
              type="string"
              def='"AwSales"'
              doc="Sobrescrever quando a logo for puramente decorativa: aria-hidden + aria-label=undefined."
            />
          </ApiTable>

          <CodeExample>{`import { AwLogo } from "@/components/ui/AwLogo"

// Sidebar — herda --fg-primary do parent.
<AwLogo variant="mark" height={24} />

// Hero — força brand color.
<AwLogo
  variant="wordmark"
  height={48}
  style={{ color: "var(--aw-blue-600)" }}
/>

// Sobre superfície escura — o parent já tem text-[var(--dark-fg-primary)].
<header className="text-(--dark-fg-primary)">
  <AwLogo variant="wordmark" height={20} />
</header>`}</CodeExample>
        </Section>

        {/* ── PNG exports ─────────────────────────────────────────────── */}
        <Section
          id="png-exports"
          title="PNG exports oficiais"
          lead="Dez arquivos. Cada um com tom e fundo previsto. Use o nome exato — nenhum recolore. Servidos de /public/assets/brand/."
        >
          <div>
            <h3 className="text-(--h5-size) font-medium mb-3">Mark (4 tons)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MARKS.map((m) => (
                <LogoCard key={m.src} item={m} />
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-(--h5-size) font-medium mb-3">
              Wordmark · fundo claro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WORDMARKS.filter((w) => !w.needsDarkBg).map((w) => (
                <LogoCard key={w.src} item={w} />
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-(--h5-size) font-medium mb-3">
              Wordmark · fundo escuro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WORDMARKS.filter((w) => w.needsDarkBg).map((w) => (
                <LogoCard key={w.src} item={w} />
              ))}
            </div>
          </div>
        </Section>

        {/* ── SVG exports ─────────────────────────────────────────────── */}
        <Section
          id="svg-exports"
          title="SVG exports estáticos"
          lead="Para uso fora do React (e-mail HTML rico, illustrator, marketing site). Cor fixa, sem currentColor — não use no app product."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SVG_EXPORTS.map((s) => (
              <div
                key={s.src}
                className="rounded-lg border border-(--border-subtle) overflow-hidden flex flex-col"
                style={{
                  background: s.needsDarkBg
                    ? "var(--dark-bg)"
                    : "var(--bg-raised)",
                }}
              >
                <div className="flex-1 flex items-center justify-center p-8 min-h-[140px]">
                  <img
                    src={s.src}
                    alt={s.label}
                    style={{
                      display: "block",
                      height: s.label.startsWith("mark") ? 64 : 32,
                      width: "auto",
                    }}
                  />
                </div>
                <div className="px-4 py-3 border-t border-(--border-subtle) bg-(--bg-raised) flex flex-col gap-1">
                  <code className="mono text-xs text-(--fg-primary)">
                    {s.label}
                  </code>
                  <p className="caption">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Tamanhos mínimos ────────────────────────────────────────── */}
        <Section
          id="minimum"
          title="Tamanhos mínimos"
          lead="Abaixo destes, o contrapeso do A desaparece. Nunca use menor."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-10 flex flex-wrap items-end gap-10">
            <div className="flex flex-col items-center gap-3">
              <img
                src={AW_LOGO_ASSETS.svg.mark}
                alt="mark 16"
                width={16}
                height={16}
              />
              <div className="caption text-center">
                Mark min. <b>16 px</b>
                <br />
                Favicon, inline UI
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img
                src={AW_LOGO_ASSETS.svg.mark}
                alt="mark 24"
                width={24}
                height={24}
              />
              <div className="caption text-center">
                Mark uso comum <b>24 px</b>
                <br />
                Sidebar, cabeçalhos
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img
                src={AW_LOGO_ASSETS.svg.wordmarkBlack}
                alt="wordmark 20"
                style={{ height: 20, width: "auto" }}
              />
              <div className="caption text-center">
                Wordmark min. <b>20 px alto</b>
                <br />
                Documentos, e-mail
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <img
                src={AW_LOGO_ASSETS.svg.wordmarkBlack}
                alt="wordmark 28"
                style={{ height: 28, width: "auto" }}
              />
              <div className="caption text-center">
                Wordmark uso comum <b>28 px alto</b>
                <br />
                Cabeçalho de página
              </div>
            </div>
          </div>
        </Section>

        {/* ── Em contexto ─────────────────────────────────────────────── */}
        <Section
          id="context"
          title="Em contexto"
          lead="Três aplicações canônicas — product shell escuro, hero claro, hero ai-gradient."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="rounded-lg overflow-hidden flex flex-col"
              style={{ background: "var(--dark-bg)" }}
            >
              <div className="flex-1 flex items-center justify-center p-10 min-h-[200px]">
                <img
                  src={AW_LOGO_ASSETS.mark.white}
                  alt="mark on dark"
                  width={48}
                  height={48}
                />
              </div>
              <div className="px-4 py-3 border-t border-(--dark-border)">
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--dark-fg-primary)" }}
                >
                  Product shell
                </div>
                <div
                  className="caption"
                  style={{ color: "var(--dark-fg-tertiary)" }}
                >
                  Mark white sobre #0D0D0D
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-(--bg-raised) border border-(--border-subtle) overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center p-10 min-h-[200px]">
                <img
                  src={AW_LOGO_ASSETS.svg.wordmarkBrand}
                  alt="wordmark on light"
                  style={{ height: 40, width: "auto" }}
                />
              </div>
              <div className="px-4 py-3 border-t border-(--border-subtle)">
                <div className="text-sm font-medium">Hero light</div>
                <div className="caption">Wordmark brand sobre branco</div>
              </div>
            </div>
            <div
              className="rounded-lg overflow-hidden flex flex-col"
              style={{
                background:
                  "linear-gradient(135deg, var(--aw-blue-600) 0%, var(--aw-purple-600) 100%)",
              }}
            >
              <div className="flex-1 flex items-center justify-center p-10 min-h-[200px]">
                <img
                  src={AW_LOGO_ASSETS.svg.wordmarkWhite}
                  alt="wordmark on gradient"
                  style={{ height: 40, width: "auto" }}
                />
              </div>
              <div
                className="px-4 py-3"
                style={{ background: "rgba(0,0,0,.4)" }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: "#fff" }}
                >
                  Hero ai-gradient
                </div>
                <div
                  className="caption"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Wordmark white sobre mesh oficial
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Acessibilidade ──────────────────────────────────────────── */}
        <Section
          id="accessibility"
          title="Acessibilidade"
          lead="A logo é informativa quando identifica o produto; decorativa quando reforça um cabeçalho já rotulado. Cada caso pede tratamento distinto pra screen readers."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5 flex flex-col gap-3">
              <div className="aw-eyebrow">informativa</div>
              <p className="text-sm text-(--fg-secondary)">
                Quando a logo é a única identificação do produto na tela (sidebar
                collapsed, header inicial), ela deve ter rótulo lido em voz alta.
              </p>
              <CodeExample lang="tsx">{`<AwLogo variant="mark" aria-label="AwSales" />

// Ou no <img> estático:
<img
  src="/assets/brand/awsales-mark-brand.png"
  alt="AwSales"
  width={24}
  height={24}
/>`}</CodeExample>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5 flex flex-col gap-3">
              <div className="aw-eyebrow">decorativa</div>
              <p className="text-sm text-(--fg-secondary)">
                Quando o cabeçalho já tem texto &quot;AwSales&quot; ao lado, a logo é
                redundante para screen readers — esconda do AT.
              </p>
              <CodeExample lang="tsx">{`<div className="flex items-center gap-2">
  <AwLogo variant="mark" height={24} aria-hidden />
  <span>AwSales</span>
</div>

// Ou no <img>:
<img src="..." alt="" aria-hidden="true" />`}</CodeExample>
            </div>
          </div>
        </Section>

        {/* ── Em código ───────────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="Importe sempre do registry — nunca hardcode os paths espalhados. Isso permite renomear o asset num único lugar."
        >
          <CodeExample lang="tsx">{`import { AwLogo, AW_LOGO_ASSETS } from "@/components/ui/AwLogo"

// 1 · Componente (preferido dentro do app)
<AwLogo variant="mark" height={24} />

// 2 · PNG via registry (e-mail, OG, hardcoded fora do React)
<img
  src={AW_LOGO_ASSETS.wordmark.brand}
  alt="AwSales"
  style={{ height: 28, width: "auto" }}
/>

// 3 · Next/Image para hero cacheado
import Image from "next/image"
<Image
  src={AW_LOGO_ASSETS.mark.brand}
  alt="AwSales"
  width={96}
  height={96}
  priority
/>

// 4 · Fundo escuro — escolha a variante "white" / "*-on-dark"
<img src={AW_LOGO_ASSETS.mark.white} alt="AwSales" />`}</CodeExample>
        </Section>

        {/* ── Do / Don't ──────────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Use <code className="mono">{`<AwLogo />`}</code> dentro do produto — a cor herda
                automaticamente.
              </>,
              <>
                Use a variante <code className="mono">brand</code> em fundo claro e{" "}
                <code className="mono">brand-on-dark</code> ou <code className="mono">white</code> em
                fundo escuro — uma escolha por contexto.
              </>,
              <>
                Mantenha clear-space ≥ 0.5x em torno do mark.
              </>,
              <>
                Importe paths do <code className="mono">AW_LOGO_ASSETS</code> — uma fonte de verdade.
              </>,
              <>
                Use <code className="mono">aria-label=&quot;AwSales&quot;</code> quando a logo for o
                único identificador; <code className="mono">aria-hidden</code> quando for decorativa.
              </>,
            ]}
            donts={[
              <>Esticar, achatar ou escalar eixos separadamente.</>,
              <>Rotacionar, inclinar ou espelhar o A.</>,
              <>
                Colocar sobre fundo colorido arbitrário que não seja preto, branco, neutro
                ou o mesh oficial.
              </>,
              <>Adicionar sombra, bevel ou glow — o A é sólido, plano, geométrico.</>,
              <>Recolorir o PNG no Figma — use o arquivo da variante correta.</>,
              <>
                Hardcode paths tipo <code className="mono">&quot;/assets/brand/awsales-mark-brand.png&quot;</code>{" "}
                — sempre via <code className="mono">AW_LOGO_ASSETS</code>.
              </>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
