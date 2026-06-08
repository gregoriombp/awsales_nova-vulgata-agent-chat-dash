import { AwBeams } from "@/components/ui/AwBeams"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Tldr,
} from "../../_primitives"

// Cada preview é 1 contexto WebGL — o navegador limita ~16 por página.
// Mantém esta página enxuta: 1 hero + 3 variações = 4 contextos.
const VARIANTS = [
  {
    label: "Padrão",
    hint: "beamNumber 12 · beamWidth 2 — os defaults do componente.",
    props: {},
  },
  {
    label: "Login (denso)",
    hint: "beamNumber 29 · beamWidth 5.5 — preset usado no fundo do /login.",
    props: { beamNumber: 29, beamWidth: 5.5, beamHeight: 30 },
  },
  {
    label: "Rotacionado",
    hint: "rotation 30 — inclina os feixes; ótimo pra hero diagonais.",
    props: { beamNumber: 18, beamWidth: 3, rotation: 30 },
  },
] as const

export default function AwBeamsPage() {
  return (
    <>
      <PageHero title="Beams">
        Fundo decorativo de <strong>feixes de luz volumétricos</strong> em WebGL
        — planos empilhados deformados por ruído de Perlin e iluminados por uma
        luz direcional. Portado do{" "}
        <a
          className="underline text-(--aw-blue-700)"
          href="https://reactbits.dev/backgrounds/beams"
          target="_blank"
          rel="noreferrer"
        >
          reactbits.dev
        </a>{" "}
        para os padrões do repo: prefixo <code className="mono">Aw*</code>,
        TypeScript e <strong>zero dependência nova</strong> (usa o{" "}
        <code className="mono">three</code> +{" "}
        <code className="mono">@react-three/fiber</code> que já existem). É o
        mesmo motor de canvas do <code className="mono">AwCortexSynthesis</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Fundo de <strong>tela cheia</strong> em hero, login e splash —
              algo vivo atrás do conteúdo.
            </>,
            <>
              Posicione dentro de um pai <code className="mono">relative</code>:
              o componente é <code className="mono">absolute inset-0</code> e
              preenche o container.
            </>,
            <>
              Ajuste <code className="mono">beamNumber</code>/
              <code className="mono">beamWidth</code> pra densidade e{" "}
              <code className="mono">rotation</code> pra direção.
            </>,
          ]}
          dontUse={[
            <>
              Em <strong>grids/listas</strong> com vários ao mesmo tempo — cada
              instância é um contexto WebGL (limite ~16/página).
            </>,
            <>
              Como conteúdo informativo — é decorativo (
              <code className="mono">aria-hidden</code>), não substitui texto.
            </>,
            <>
              Sobre fundo claro sem contraste — os feixes brilham sobre a cena
              escura (<code className="mono">backgroundColor</code>).
            </>,
          ]}
        />

        <Section
          id="preview"
          title="Preview"
          lead="O preset do login: 29 feixes largos, brancos, sobre cena preta. Uma única instância anima continuamente."
        >
          <div className="relative h-[440px] w-full overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-inverse)">
            <AwBeams
              backgroundColor="#000000"
              beamWidth={5.5}
              beamHeight={30}
              beamNumber={29}
              lightColor="#ffffff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={0}
            />
          </div>
        </Section>

        <Section
          id="variacoes"
          title="Variações"
          lead="Os mesmos feixes brancos, variando só a estrutura — densidade, largura e rotação."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VARIANTS.map((v) => (
              <div key={v.label} className="flex flex-col gap-2">
                <div className="relative h-[260px] w-full overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-inverse)">
                  <AwBeams backgroundColor="#000000" {...v.props} />
                </div>
                <div>
                  <div className="text-sm font-medium text-(--fg-primary)">
                    {v.label}
                  </div>
                  <p className="caption m-0">{v.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="controles"
          title="Controles"
          lead="Todos os eixos do reactbits, com os mesmos nomes. backgroundColor é a cor da cena (precisa ser concreta — hex/nome, não var CSS)."
        >
          <ApiTable>
            <PropRow
              prop="beamNumber"
              type="number"
              def="12"
              doc="Quantidade de feixes (planos empilhados lado a lado)."
            />
            <PropRow
              prop="beamWidth"
              type="number"
              def="2"
              doc="Largura de cada feixe. Maior = feixes mais gordos, menos vão dentro do quadro."
            />
            <PropRow
              prop="beamHeight"
              type="number"
              def="15"
              doc="Comprimento dos feixes ao longo do eixo de fluxo."
            />
            <PropRow
              prop="lightColor"
              type="string (hex)"
              def='"#ffffff"'
              doc="Cor da luz direcional que banha os feixes — tinge o brilho."
            />
            <PropRow
              prop="speed"
              type="number"
              def="2"
              doc="Velocidade do escoamento do ruído pelos feixes."
            />
            <PropRow
              prop="noiseIntensity"
              type="number"
              def="1.75"
              doc="Grão/dithering somado por cima — textura granulada do feixe."
            />
            <PropRow
              prop="scale"
              type="number"
              def="0.2"
              doc="Escala do ruído de Perlin. Maior = deformação mais miúda."
            />
            <PropRow
              prop="rotation"
              type="number (graus)"
              def="0"
              doc="Gira o conjunto de feixes no plano. 0 = vertical."
            />
            <PropRow
              prop="backgroundColor"
              type="string (hex)"
              def='"#000000"'
              doc="Cor da cena 3D e do wrapper (evita flash antes do canvas pintar). Cor concreta, não var CSS."
            />
            <PropRow
              prop="className"
              type="string"
              def="—"
              doc="Classes extras no wrapper absolute inset-0."
            />
          </ApiTable>
        </Section>

        <Section
          id="uso"
          title="Uso"
          lead="Sempre dentro de um container relative com altura definida. O componente preenche via absolute inset-0."
        >
          <CodeExample label="fundo de hero / login" lang="tsx">
            {`import { AwBeams } from "@/components/ui/AwBeams"

<div className="relative h-screen w-full overflow-hidden">
  <AwBeams
    beamWidth={5.5}
    beamHeight={30}
    beamNumber={29}
    speed={2}
    noiseIntensity={1.75}
    scale={0.2}
    rotation={0}
  />
  {/* conteúdo por cima */}
  <div className="relative z-10">…</div>
</div>`}
          </CodeExample>
        </Section>
      </div>
    </>
  )
}
