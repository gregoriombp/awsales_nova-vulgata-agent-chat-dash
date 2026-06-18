import {
  AwBrandIllustration,
  type AwBrandIllustrationName,
} from "@/components/ui/AwBrandIllustration"
import {
  PageHero,
  Section,
  Stage,
  ApiTable,
  PropRow,
  CodeExample,
  DoDont,
} from "../../_primitives"

/**
 * Ilustrações — a família line-art da marca, renderizada pelo
 * AwBrandIllustration (currentColor, theme-aware). As duas artes oficiais do
 * rebranding + quatro extensões na mesma linguagem geométrica.
 */

const FAMILY: {
  name: AwBrandIllustrationName
  label: string
  meaning: string
  official?: boolean
}[] = [
  {
    name: "layers",
    label: "Layers",
    meaning: "Losangos isométricos empilhados — os Knowledge Layers que alimentam os agentes.",
    official: true,
  },
  {
    name: "ignition",
    label: "Ignition",
    meaning: "A explosão radial da saída — o momento em que a operação deixa a Terra.",
    official: true,
  },
  {
    name: "constellation",
    label: "Constellation",
    meaning: "O Cortex (hexágono) ao centro e os agentes interligados ao redor.",
  },
  {
    name: "orbit",
    label: "Orbit",
    meaning: "Operação contínua — órbitas concêntricas com agentes em movimento.",
  },
  {
    name: "field",
    label: "Field",
    meaning: "O whitefield em perspectiva — o campo neutro onde tudo opera.",
  },
  {
    name: "ascent",
    label: "Ascent",
    meaning: "Ritmo de subida — receita ganhando altura até a ignição.",
  },
]

/* Geometric-Strokes — o conjunto bruto importado do rebranding. */
const STROKES: { name: AwBrandIllustrationName; label: string }[] = [
  { name: "shape-01", label: "Shape 01" },
  { name: "shape-02", label: "Shape 02" },
  { name: "shape-03", label: "Shape 03" },
  { name: "shape-04", label: "Shape 04" },
  { name: "shape-05", label: "Shape 05" },
]

export default function IlustracoesPage() {
  return (
    <>
      <PageHero title="Ilustrações">
        A família line-art da marca: <strong>geometria de traço fino</strong>,
        nada orgânico, nada decorativo por decorar. Cada arte carrega um
        pedaço da narrativa — camadas, ignição, constelação, órbita, campo e
        ascensão. Renderizadas por <code className="mono">AwBrandIllustration</code>{" "}
        em <code className="mono">currentColor</code>: a mesma arte vive em
        painel claro e escuro.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* ── Família ─────────────────────────────────────────────────── */}
        <Section
          id="familia"
          title="A família"
          lead="Seis artes. As duas oficiais do rebranding e quatro extensões na mesma linguagem — todas paramétricas, todas theme-aware."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FAMILY.map((item) => (
              <div
                key={item.name}
                className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)"
              >
                <div className="flex items-center justify-center bg-aw-gray-1200 p-8 text-aw-gray-25">
                  <AwBrandIllustration name={item.name} size={190} />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="m-0 text-[15px] font-semibold">{item.label}</h3>
                    {item.official && (
                      <span className="rounded-full bg-(--bg-muted) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--fg-tertiary)">
                        oficial
                      </span>
                    )}
                    <code className="mono ml-auto text-[11px] text-(--fg-tertiary)">
                      {item.name}
                    </code>
                  </div>
                  <p className="mb-0 mt-1.5 text-sm leading-relaxed text-(--fg-secondary)">
                    {item.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Geometric-Strokes ───────────────────────────────────────── */}
        <Section
          id="geometric-strokes"
          title="Geometric-Strokes"
          lead="O conjunto bruto de traços geométricos do rebranding (aswork-shape-01..05). Vetores reais em /public, pintados via CSS mask — themeáveis como as paramétricas. O traço já vem encorpado no arquivo, então strokeWidth não se aplica a estas."
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {STROKES.map((item) => (
              <div
                key={item.name}
                className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-raised)"
              >
                <div className="flex items-center justify-center bg-aw-gray-1200 p-8 text-aw-gray-25">
                  <AwBrandIllustration name={item.name} size={140} />
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-sm font-medium">{item.label}</span>
                  <code className="mono text-2xs text-(--fg-tertiary)">
                    {item.name}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Tema ────────────────────────────────────────────────────── */}
        <Section
          id="tema"
          title="Claro e escuro"
          lead="currentColor faz o trabalho: tinta no claro, branco no escuro. Nenhum asset duplicado."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Stage label="Sobre painel escuro" hint="text-aw-gray-25" dark>
              <AwBrandIllustration name="constellation" size={220} />
            </Stage>
            <Stage label="Sobre painel claro" hint="text-(--fg-primary)">
              <span className="text-(--fg-primary)">
                <AwBrandIllustration name="constellation" size={220} />
              </span>
            </Stage>
          </div>
        </Section>

        {/* ── Uso ─────────────────────────────────────────────────────── */}
        <Section id="uso" title="Como usar">
          <DoDont
            dos={[
              "Heros de marca, aberturas de slide e seções de história",
              "Empty states de marca (uma arte, bem grande, com respiro)",
              "Painéis escuros — o habitat natural do traço branco",
              "Tamanho mínimo 160px; o traço fino some abaixo disso",
            ]}
            donts={[
              "Mais de uma arte por composição",
              "Colorir o traço com accents — é monocromático por princípio",
              "Usar como ícone (para isso existe a iconografia)",
              "Esticar fora da proporção quadrada",
            ]}
          />
          <CodeExample label="exemplo">{`import { AwBrandIllustration } from "@/components/ui/AwBrandIllustration"

// Em painel escuro (herda a cor do contexto):
<div className="bg-aw-gray-1200 text-aw-gray-25 p-10 rounded-2xl">
  <AwBrandIllustration name="ignition" size={240} />
</div>`}</CodeExample>
        </Section>

        {/* ── API ─────────────────────────────────────────────────────── */}
        <Section id="api" title="API">
          <ApiTable>
            <PropRow
              prop="name"
              type={'"layers" | "ignition" | … | "ascent" | "shape-01" … "shape-05"'}
              doc="Qual arte renderizar (paramétricas + Geometric-Strokes)."
            />
            <PropRow prop="size" type="number" def="240" doc="Lado do quadrado, em px." />
            <PropRow prop="strokeWidth" type="number" def="1.4" doc="Espessura do traço (viewBox 400)." />
            <PropRow
              prop="title"
              type="string"
              def="—"
              doc="Descrição acessível; sem ela a arte é decorativa (aria-hidden)."
            />
          </ApiTable>
          <p className="mt-4 text-sm text-(--fg-tertiary)">
            Os vetores originais do rebranding permanecem em{" "}
            <code className="mono">public/assets/brand/illustrations/</code>{" "}
            (layers.svg, ignition.svg) para export em deck, social e print.
          </p>
        </Section>
      </div>
    </>
  )
}
