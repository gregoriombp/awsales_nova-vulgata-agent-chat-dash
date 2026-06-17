import { AwTrendDelta } from "@/components/ui/AwTrendDelta"
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

export default function TrendDeltaPage() {
  return (
    <>
      <PageHero title="Trend Delta">
        Chip inline pequeno de variação — seta + valor (ex.{" "}
        <code className="mono">↗ +4,8%</code>) — que aparece ao lado de um
        número grande sinalizando tendência. A <strong>seta</strong> segue a
        direção; a <strong>cor</strong> segue o <code className="mono">tone</code>,
        não a direção. Assim "custo subindo" = seta pra cima com tone{" "}
        <code className="mono">bad</code> (vermelho).
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Ao lado de uma métrica grande. Aqui o custo subiu: seta pra cima, mas tone bad porque subir custo é ruim."
          >
            <Stage label="value=4.8 · direction='up' · tone='bad'">
              <div className="inline-flex items-baseline gap-2">
                <span className="text-(--fg-primary) text-3xl font-semibold tabular-nums">
                  R$ 12.480
                </span>
                <AwTrendDelta value={4.8} direction="up" tone="bad" />
              </div>
            </Stage>
          </Section>

          <Section
            id="matrix"
            title="Matriz direção × tone"
            lead="A seta acompanha a direção; a cor acompanha o tone. Os dois eixos são independentes de propósito."
          >
            <Stage
              label="up/bad · up/good · down/good · down/bad · neutral"
              gridClassName="flex flex-wrap items-center gap-6"
            >
              <div className="flex flex-col items-center gap-2">
                <AwTrendDelta value={4.8} direction="up" tone="bad" />
                <span className="caption">up · bad</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AwTrendDelta value={4.8} direction="up" tone="good" />
                <span className="caption">up · good</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AwTrendDelta value={-2.1} direction="down" tone="good" />
                <span className="caption">down · good</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AwTrendDelta value={-2.1} direction="down" tone="bad" />
                <span className="caption">down · bad</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <AwTrendDelta value={0} direction="flat" tone="neutral" />
                <span className="caption">flat · neutral</span>
              </div>
            </Stage>
          </Section>

          <Section
            id="direction-default"
            title="Direção derivada do valor"
            lead="Sem direction explícito, a seta deriva do sinal de value: >0 up, <0 down, 0 flat."
          >
            <Stage
              label="só value — direction inferida"
              gridClassName="flex flex-wrap items-center gap-6"
            >
              <AwTrendDelta value={3.2} tone="good" />
              <AwTrendDelta value={-1.5} tone="bad" />
              <AwTrendDelta value={0} tone="neutral" />
            </Stage>
          </Section>

          <Section
            id="format"
            title="Format customizado"
            lead="format recebe o número e devolve a string exibida. Útil pra valores absolutos, moeda ou pontos."
          >
            <Stage
              label="format absoluto · sem seta"
              gridClassName="flex flex-wrap items-center gap-6"
            >
              <AwTrendDelta
                value={1280}
                direction="up"
                tone="good"
                format={(n) =>
                  "R$ " + Math.abs(n).toLocaleString("pt-BR")
                }
              />
              <AwTrendDelta
                value={-340}
                direction="down"
                tone="bad"
                format={(n) =>
                  "R$ " + Math.abs(n).toLocaleString("pt-BR")
                }
              />
              <AwTrendDelta
                value={12.5}
                direction="up"
                tone="good"
                showArrow={false}
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente puro, sem estado próprio. A direção pode ser inferida do valor; a cor sempre vem do tone."
          >
            <ApiTable>
              <PropRow
                prop="value"
                type="number"
                doc="Valor da variação. O sinal deriva a direction quando ela não é passada."
              />
              <PropRow
                prop="direction"
                type='"up" | "down" | "flat"'
                def="sinal de value"
                doc="Direção da seta. Default: >0 up, <0 down, 0 flat."
              />
              <PropRow
                prop="tone"
                type='"good" | "bad" | "neutral"'
                def='"neutral"'
                doc="Controla a cor: good → --accent-success, bad → --accent-danger, neutral → --fg-secondary."
              />
              <PropRow
                prop="format"
                type="(n: number) => string"
                def="percent pt-BR com sinal"
                doc='Formata o número exibido. Default: ex. "+4,8%".'
              />
              <PropRow
                prop="showArrow"
                type="boolean"
                def="true"
                doc="Mostra a seta antes do valor."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado nas classes da raiz <span> via cn."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwTrendDelta value={4.8} direction="up" tone="bad" />
// ↗ +4,8% em vermelho — custo subindo é ruim

<AwTrendDelta value={-2.1} tone="good" />
// direction inferida (down); -2,1% em verde — custo caindo é bom

<AwTrendDelta
  value={1280}
  tone="good"
  format={(n) => "R$ " + Math.abs(n).toLocaleString("pt-BR")}
/>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Layout inline-flex com seta + valor. Cor lida via CSS variables por tone — nada hardcoded."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec
                k="container"
                v="inline-flex items-center gap-1"
                d="Fica na baseline ao lado do valor grande; tabular-nums alinha dígitos."
              />
              <Spec
                k="seta"
                v="trending_up / _down / _flat"
                d="Material Symbol ~15px, escolhido pela direction."
              />
              <Spec
                k="cor (good)"
                v="--accent-success"
                d="Variação positiva — verde."
              />
              <Spec
                k="cor (bad)"
                v="--accent-danger"
                d="Variação negativa — vermelho."
              />
              <Spec
                k="cor (neutral)"
                v="--fg-secondary"
                d="Sem juízo de valor — cinza."
              />
              <Spec
                k="tipografia"
                v="body-xs font-medium tabular-nums"
                d="Pequeno e discreto; não compete com a métrica."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Escolha o tone pelo significado de negócio, não pela direção da seta.</>,
                <>Use ao lado de um valor grande como contexto, não isolado.</>,
                <>Deixe a direction ser inferida do value quando o sinal já basta.</>,
              ]}
              donts={[
                <>Não force verde só porque a seta sobe — custo subindo é bad.</>,
                <>Não use como botão ou link — é um indicador estático.</>,
                <>Não troque o format no meio de uma mesma tabela de métricas.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
