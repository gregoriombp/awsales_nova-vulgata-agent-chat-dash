import { AwRadialProgress } from "@/components/ui/AwRadialProgress"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
} from "../../_primitives"

export default function RadialProgressPage() {
  return (
    <>
      <PageHero title="Radial Progress">
        Medidor circular (donut) de progresso. Um anel preenchido proporcional a{" "}
        <code className="mono">value / max</code>, com o percentual grande no
        centro e uma legenda opcional abaixo. Usado pra mostrar consumo de um
        teto — cota, orçamento, limite.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="value + max definem o preenchimento. A caption fica embaixo do percentual, no centro do anel."
          >
            <Stage label="615 de 1500 — consumo do teto">
              <AwRadialProgress
                value={615}
                max={1500}
                caption="do teto · R$ 1.500"
              />
            </Stage>
          </Section>

          <Section
            id="values"
            title="Valores diferentes"
            lead="O arco e o percentual acompanham a razão value/max. 100% fecha o anel inteiro."
          >
            <Stage
              label="41% · 80% · 100%"
              gridClassName="flex flex-wrap items-center gap-10"
            >
              <AwRadialProgress value={615} max={1500} caption="do teto" />
              <AwRadialProgress value={1200} max={1500} caption="do teto" />
              <AwRadialProgress value={1500} max={1500} caption="do teto" />
            </Stage>
          </Section>

          <Section
            id="sizes"
            title="Tamanhos"
            lead="size controla o diâmetro e thickness a espessura do anel. Default é 120 / 10."
          >
            <Stage
              label="size 80 · 120 (default) · 160"
              gridClassName="flex flex-wrap items-end gap-10"
            >
              <AwRadialProgress
                value={615}
                max={1500}
                size={80}
                thickness={8}
              />
              <AwRadialProgress value={615} max={1500} caption="do teto" />
              <AwRadialProgress
                value={615}
                max={1500}
                size={160}
                thickness={14}
                caption="do teto · R$ 1.500"
              />
            </Stage>
          </Section>

          <Section
            id="no-percent"
            title="Sem percentual"
            lead="showPercent={false} esconde o número central — útil quando a caption já carrega o valor."
          >
            <Stage label="Só caption no centro">
              <AwRadialProgress
                value={615}
                max={1500}
                showPercent={false}
                caption={
                  <span className="text-(--fg-primary) text-base font-semibold tabular-nums">
                    R$ 615
                  </span>
                }
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente puro, sem estado próprio. Cores aceitam qualquer var(--token) do design system."
          >
            <ApiTable>
              <PropRow
                prop="value"
                type="number"
                doc="Valor atual. Clampado entre 0 e max."
              />
              <PropRow prop="max" type="number" doc="Valor máximo (teto)." />
              <PropRow
                prop="size"
                type="number"
                def="120"
                doc="Diâmetro do anel em px."
              />
              <PropRow
                prop="thickness"
                type="number"
                def="10"
                doc="Espessura do stroke em px."
              />
              <PropRow
                prop="caption"
                type="React.ReactNode"
                doc="Renderizada abaixo do percentual, no centro."
              />
              <PropRow
                prop="showPercent"
                type="boolean"
                def="true"
                doc="Mostra o percentual grande (tabular-nums) no centro."
              />
              <PropRow
                prop="arcColor"
                type="string"
                def='"var(--accent-brand)"'
                doc="Cor do arco preenchido. Use sempre um token var(--...)."
              />
              <PropRow
                prop="trackColor"
                type="string"
                def='"var(--bg-muted)"'
                doc="Cor do trilho de fundo."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado via cn() na raiz <div>."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwRadialProgress
  value={615}
  max={1500}
  caption="do teto · R$ 1.500"
/>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="SVG donut com dois círculos. Tokens lidos via CSS variables nas strokes — nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="trilho"
                v="<circle stroke=trackColor>"
                d="Anel de fundo completo, espessura = thickness."
              />
              <Spec
                k="arco"
                v="strokeDasharray = circunferência"
                d="strokeDashoffset proporcional a (1 - value/max)."
              />
              <Spec
                k="rotação"
                v="-90° no grupo SVG"
                d="Faz o arco começar no topo (12h) em vez de 3h."
              />
              <Spec
                k="centro"
                v="--fg-primary + --fg-tertiary"
                d="Percentual tabular-nums + caption body-xs."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use pra consumo de um teto claro — cota, orçamento, limite.</>,
                <>Mantenha a caption curta; ela cabe no centro do anel.</>,
                <>Passe cores sempre como var(--token), nunca hex cru.</>,
              ]}
              donts={[
                <>Não use pra séries temporais — isso é gráfico de linha/barra.</>,
                <>Não empilhe vários valores no mesmo anel.</>,
                <>Não diminua size a ponto do percentual ficar ilegível.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
