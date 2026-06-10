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

type SvgExport = {
  label: string
  src: string
  note: string
  /** Negativos já vêm com placa #0D0D0D embutida — renderizar como vêm. */
  selfContained?: boolean
  height: number
}

const SVG_EXPORTS: SvgExport[] = [
  {
    label: "symbol-positive.svg",
    src: AW_LOGO_ASSETS.symbol.positive,
    note: "Símbolo isolado, tinta #0D0D0D. Avatar, favicon, app icon, selo.",
    height: 64,
  },
  {
    label: "symbol-negative.svg",
    src: AW_LOGO_ASSETS.symbol.negative,
    note: "Símbolo branco sobre placa #0D0D0D. Asset autocontido, com fundo.",
    selfContained: true,
    height: 88,
  },
  {
    label: "wordmark-positive.svg",
    src: AW_LOGO_ASSETS.wordmark.positive,
    note: "Wordmark Aswork™ em tinta. Documentos, assinatura, cabeçalho de texto.",
    height: 28,
  },
  {
    label: "wordmark-negative.svg",
    src: AW_LOGO_ASSETS.wordmark.negative,
    note: "Wordmark branco sobre placa. Autocontido.",
    selfContained: true,
    height: 64,
  },
  {
    label: "horizontal-positive.svg",
    src: AW_LOGO_ASSETS.horizontal.positive,
    note: "Lockup principal: símbolo + wordmark lado a lado. Use por padrão.",
    height: 28,
  },
  {
    label: "horizontal-negative.svg",
    src: AW_LOGO_ASSETS.horizontal.negative,
    note: "Lockup principal branco sobre placa. Autocontido.",
    selfContained: true,
    height: 64,
  },
  {
    label: "vertical-positive.svg",
    src: AW_LOGO_ASSETS.vertical.positive,
    note: "Lockup empilhado: símbolo sobre wordmark. Espaços quadrados, social.",
    height: 96,
  },
  {
    label: "vertical-negative.svg",
    src: AW_LOGO_ASSETS.vertical.negative,
    note: "Lockup vertical branco sobre placa. Autocontido.",
    selfContained: true,
    height: 112,
  },
]

export default function LogosPage() {
  return (
    <>
      <PageHero title="Logos">
        O símbolo Aswork são <strong>três lâminas em leque</strong> — grudadas
        na base, abrindo para cima, inclinadas numa progressão harmônica de 6°
        (15° · 21° · 27°). O <strong>mark</strong> (símbolo) é a forma
        autônoma; o <strong>wordmark</strong> (Aswork™) e o lockup{" "}
        <strong>horizontal</strong> (símbolo + wordmark) acompanham em
        cabeçalhos, documentos e assinatura. Esta página é a fonte de verdade
        para qualquer aplicação da logo Aswork — em código, deck, e-mail,
        social, print.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* ── AwLogo vs AwBrandLogo ───────────────────────────────────── */}
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 text-sm text-(--aw-blue-900)">
          <strong>AwLogo vs AwBrandLogo.</strong> Esta página documenta o{" "}
          <code className="mono">AwLogo</code> — a logo do{" "}
          <strong>próprio Aswork</strong>. Para logos de{" "}
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
          lead="Dois caminhos. Dentro do app, sempre o componente — herda cor do contexto. Fora do app, os SVG exports oficiais com cor fixa (positive em fundo claro, negative onde precisa de placa)."
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
                    E-mail, deck, social, OG image, marketing site
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-(--aw-blue-700)">
                    SVG export oficial
                  </td>
                  <td className="px-5 py-4">
                    Cor fixa pré-aprovada (tinta #0D0D0D ou negativo com placa).
                    Vetor puro, renderiza em qualquer destino que aceite SVG.
                  </td>
                </tr>
                <tr className="border-b border-(--border-subtle) last:border-b-0 align-top">
                  <td className="px-5 py-4 text-(--fg-primary)">
                    Favicon do produto
                  </td>
                  <td className="px-5 py-4 mono text-xs text-(--aw-blue-700)">
                    app/icon.svg
                  </td>
                  <td className="px-5 py-4">
                    Símbolo isolado com media query embutida — tinta no tema
                    claro, branco no escuro. O Next serve automaticamente.
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
          lead="A altura do símbolo é a unidade-raiz (x). Todas as regras de espaço e tamanho derivam dela."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-10 flex items-center gap-12 flex-wrap">
            <span style={{ color: "var(--fg-primary)", display: "inline-flex" }}>
              <AwLogo variant="mark" height={96} />
            </span>
            <div className="flex flex-col gap-3">
              <Spec
                k="lâminas"
                v="15° · 21° · 27°"
                d="Progressão harmônica de 6°, espessura perpendicular uniforme."
              />
              <Spec
                k="unidade-raiz"
                v="x = altura do símbolo"
                d="Todas as medidas derivam."
              />
              <Spec
                k="clear-space"
                v="≥ 0.5x em todos os lados"
                d="Zona de exclusão — nada entra nessa margem. Vale para o símbolo isolado."
              />
              <Spec
                k="lockup horizontal"
                v="espaço símbolo↔texto = x ÷ 6"
                d="O símbolo compartilha cap-height e baseline com o wordmark."
              />
              <Spec
                k="marca registrada"
                v="™ no canto superior direito"
                d="Sempre acompanha o wordmark; nunca o símbolo isolado."
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
          <Stage label="Variant · horizontal" hint="Lockup principal (símbolo + Aswork™). Use por padrão em headers.">
            <span style={{ color: "var(--fg-primary)" }}>
              <AwLogo variant="horizontal" height={24} />
            </span>
            <span style={{ color: "var(--aw-blue-600)" }}>
              <AwLogo variant="horizontal" height={24} />
            </span>
          </Stage>

          <Stage label="Variant · wordmark" hint="Wordmark (Aswork™) sem símbolo. Cor vem do parent via text-* token.">
            <span style={{ color: "var(--fg-primary)" }}>
              <AwLogo variant="wordmark" height={24} />
            </span>
            <span style={{ color: "var(--aw-blue-600)" }}>
              <AwLogo variant="wordmark" height={24} />
            </span>
          </Stage>

          <Stage label="Variant · mark" hint="Símbolo isolado. Sidebar collapsed, avatar, selo.">
            <span style={{ color: "var(--fg-primary)" }}>
              <AwLogo variant="mark" height={32} />
            </span>
            <span style={{ color: "var(--aw-blue-600)" }}>
              <AwLogo variant="mark" height={32} />
            </span>
          </Stage>

          <Stage label="Sobre superfície escura · horizontal" hint="O mesmo componente; cor vem do parent." dark>
            <span style={{ color: "var(--dark-fg-primary)" }}>
              <AwLogo variant="horizontal" height={24} />
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
              type='"wordmark" | "mark" | "horizontal"'
              def='"wordmark"'
              doc="Símbolo isolado (mark), texto (wordmark = Aswork™) ou lockup principal (horizontal = símbolo + wordmark)."
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
              def='"Aswork"'
              doc="Sobrescrever quando a logo for puramente decorativa: aria-hidden + aria-label=undefined."
            />
          </ApiTable>

          <CodeExample>{`import { AwLogo } from "@/components/ui/AwLogo"

// Sidebar — herda --fg-primary do parent.
<AwLogo variant="mark" height={24} />

// Header — lockup principal.
<AwLogo variant="horizontal" height={20} />

// Hero — força brand color.
<AwLogo
  variant="wordmark"
  height={48}
  style={{ color: "var(--aw-blue-600)" }}
/>

// Sobre superfície escura — o parent já tem text-[var(--dark-fg-primary)].
<header className="text-(--dark-fg-primary)">
  <AwLogo variant="horizontal" height={20} />
</header>`}</CodeExample>
        </Section>

        {/* ── SVG exports ─────────────────────────────────────────────── */}
        <Section
          id="svg-exports"
          title="SVG exports oficiais"
          lead="Oito arquivos — 4 formas × 2 tons. Positive = tinta #0D0D0D sobre transparente. Negative = branco sobre placa #0D0D0D, autocontido. Servidos de /public/assets/brand/."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SVG_EXPORTS.map((s) => (
              <div
                key={s.src}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) overflow-hidden flex flex-col"
              >
                <div className="flex-1 flex items-center justify-center p-8 min-h-[160px]">
                  <img
                    src={s.src}
                    alt={s.label}
                    style={{ display: "block", height: s.height, width: "auto" }}
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
          lead="Abaixo destes, as lâminas se fundem. Símbolo: 24 px no digital, 8 mm no impresso. Nunca use menor."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-10 flex flex-wrap items-end gap-10">
            <div className="flex flex-col items-center gap-3">
              <AwLogo variant="mark" height={24} />
              <div className="caption text-center">
                Símbolo min. <b>24 px</b>
                <br />
                Sidebar, favicon, inline UI
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <AwLogo variant="mark" height={32} />
              <div className="caption text-center">
                Símbolo uso comum <b>32 px</b>
                <br />
                Cabeçalhos, avatar
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <AwLogo variant="horizontal" height={20} />
              <div className="caption text-center">
                Lockup min. <b>20 px alto</b>
                <br />
                Documentos, e-mail
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <AwLogo variant="horizontal" height={28} />
              <div className="caption text-center">
                Lockup uso comum <b>28 px alto</b>
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
                <span style={{ color: "var(--dark-fg-primary)" }}>
                  <AwLogo variant="mark" height={48} />
                </span>
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
                  Símbolo branco sobre #0D0D0D
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-(--bg-raised) border border-(--border-subtle) overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center p-10 min-h-[200px]">
                <img
                  src={AW_LOGO_ASSETS.horizontal.positive}
                  alt="lockup on light"
                  style={{ height: 36, width: "auto" }}
                />
              </div>
              <div className="px-4 py-3 border-t border-(--border-subtle)">
                <div className="text-sm font-medium">Hero light</div>
                <div className="caption">Lockup horizontal em tinta sobre branco</div>
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
                <span style={{ color: "#ffffff" }}>
                  <AwLogo variant="horizontal" height={36} />
                </span>
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
                  Lockup branco sobre mesh oficial
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
              <CodeExample lang="tsx">{`<AwLogo variant="mark" aria-label="Aswork" />

// Ou no <img> estático:
<img
  src="/assets/brand/aswork-symbol-positive.svg"
  alt="Aswork"
  width={24}
  height={24}
/>`}</CodeExample>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5 flex flex-col gap-3">
              <div className="aw-eyebrow">decorativa</div>
              <p className="text-sm text-(--fg-secondary)">
                Quando o cabeçalho já tem texto &quot;Aswork&quot; ao lado, a logo é
                redundante para screen readers — esconda do AT.
              </p>
              <CodeExample lang="tsx">{`<div className="flex items-center gap-2">
  <AwLogo variant="mark" height={24} aria-hidden />
  <span>Aswork</span>
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
<AwLogo variant="horizontal" height={20} />

// 2 · SVG via registry (e-mail, OG, hardcoded fora do React)
<img
  src={AW_LOGO_ASSETS.horizontal.positive}
  alt="Aswork"
  style={{ height: 28, width: "auto" }}
/>

// 3 · Next/Image para hero cacheado
import Image from "next/image"
<Image
  src={AW_LOGO_ASSETS.symbol.positive}
  alt="Aswork"
  width={96}
  height={96}
  priority
/>

// 4 · Onde precisa de placa escura embutida — variante negative
<img src={AW_LOGO_ASSETS.symbol.negative} alt="Aswork" />`}</CodeExample>
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
                Use <code className="mono">positive</code> em fundo claro e{" "}
                <code className="mono">negative</code> (com placa) onde o asset precisa carregar o
                próprio fundo — uma escolha por contexto.
              </>,
              <>
                Mantenha clear-space ≥ 0.5x em torno do símbolo — vale também para
                o símbolo isolado.
              </>,
              <>
                Importe paths do <code className="mono">AW_LOGO_ASSETS</code> — uma fonte de verdade.
              </>,
              <>
                Use <code className="mono">aria-label=&quot;Aswork&quot;</code> quando a logo for o
                único identificador; <code className="mono">aria-hidden</code> quando for decorativa.
              </>,
            ]}
            donts={[
              <>Esticar, achatar ou escalar eixos separadamente.</>,
              <>Rotacionar, inclinar ou espelhar as lâminas — a inclinação 15°·21°·27° é fixa.</>,
              <>Separar as lâminas da base ou alterar o espaçamento entre elas.</>,
              <>Usar o símbolo abaixo de 24 px (digital) ou 8 mm (impresso).</>,
              <>Adicionar sombra, bevel ou glow — as lâminas são sólidas, planas, geométricas.</>,
              <>
                Hardcode paths tipo <code className="mono">&quot;/assets/brand/aswork-symbol-positive.svg&quot;</code>{" "}
                — sempre via <code className="mono">AW_LOGO_ASSETS</code>.
              </>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
