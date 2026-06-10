"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts"
import {
  AwChartContainer,
  AwChartTooltip,
  AwChartTooltipContent,
  AwChartLegend,
  AwChartLegendContent,
  awChartConfig,
  AW_CHART_AXIS,
  AW_CHART_GRID,
  AW_CHART_SERIES,
} from "@/components/ui/AwChart"
import {
  PageHero,
  Section,
  ApiTable,
  PropRow,
  CodeExample,
  DoDont,
} from "../../_primitives"

/**
 * Gráficos — identidade de data-viz da Aswork sobre Recharts (via wrapper
 * shadcn em components/ui/chart.tsx + camada AwChart). Dados demo do domínio.
 */

const receitaData = [
  { mes: "Nov", receita: 84 },
  { mes: "Dez", receita: 132 },
  { mes: "Jan", receita: 117 },
  { mes: "Fev", receita: 151 },
  { mes: "Mar", receita: 178 },
  { mes: "Abr", receita: 206 },
  { mes: "Mai", receita: 238 },
  { mes: "Jun", receita: 261 },
]
const receitaConfig = awChartConfig({ receita: "Receita influenciada (R$ mil)" })

const canaisData = [
  { canal: "WhatsApp", conversas: 4820 },
  { canal: "Instagram", conversas: 2310 },
  { canal: "Webchat", conversas: 1675 },
  { canal: "E-mail", conversas: 940 },
]
const canaisConfig = awChartConfig({ conversas: "Conversas no mês" })

const resolucaoData = [
  { semana: "S1", resolvidas: 78, handoff: 22 },
  { semana: "S2", resolvidas: 81, handoff: 19 },
  { semana: "S3", resolvidas: 79, handoff: 21 },
  { semana: "S4", resolvidas: 85, handoff: 15 },
  { semana: "S5", resolvidas: 88, handoff: 12 },
  { semana: "S6", resolvidas: 91, handoff: 9 },
]
const resolucaoConfig = awChartConfig({
  resolvidas: "Resolvidas pelo agente (%)",
  handoff: "Handoff humano (%)",
})

const origemData = [
  { origem: "arquivos", total: 412 },
  { origem: "urls", total: 186 },
  { origem: "integracoes", total: 254 },
  { origem: "snippets", total: 98 },
]
const origemConfig = awChartConfig({
  arquivos: "Arquivos",
  urls: "URLs",
  integracoes: "Integrações",
  snippets: "Snippets",
})

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
      <h3 className="m-0 text-[15px] font-semibold">{title}</h3>
      <p className="mb-5 mt-1 text-[13px] text-(--fg-tertiary)">{hint}</p>
      {children}
    </div>
  )
}

export default function AwChartPage() {
  return (
    <>
      <PageHero title="Gráficos">
        Data-viz com a identidade Aswork: <strong>o azul é a série
        protagonista</strong>, grayscale e accents frios dão o contexto. Sobre
        Recharts, via <code className="mono">AwChart</code> — paleta oficial,
        eixos discretos e grid horizontal, tudo em tokens que flipam com o
        tema.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section
          id="exemplos"
          title="Os quatro formatos"
          lead="Área para tendência, barra para comparação, linha para acompanhamento e donut para composição. Dados demo do domínio Aswork."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Receita influenciada por agentes"
              hint="Área com gradiente — tendência acumulada de uma série protagonista."
            >
              <AwChartContainer config={receitaConfig}>
                <AreaChart data={receitaData} margin={{ left: 4, right: 4 }}>
                  <defs>
                    <linearGradient id="awAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--aw-blue-500)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="var(--aw-blue-500)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...AW_CHART_GRID} />
                  <XAxis dataKey="mes" {...AW_CHART_AXIS} />
                  <AwChartTooltip content={<AwChartTooltipContent indicator="line" />} />
                  <Area
                    dataKey="receita"
                    type="monotone"
                    stroke="var(--aw-blue-600)"
                    strokeWidth={2}
                    fill="url(#awAreaFill)"
                  />
                </AreaChart>
              </AwChartContainer>
            </ChartCard>

            <ChartCard
              title="Conversas por canal"
              hint="Barras — comparação direta entre categorias."
            >
              <AwChartContainer config={canaisConfig}>
                <BarChart data={canaisData} margin={{ left: 4, right: 4 }}>
                  <CartesianGrid {...AW_CHART_GRID} />
                  <XAxis dataKey="canal" {...AW_CHART_AXIS} />
                  <AwChartTooltip content={<AwChartTooltipContent hideLabel />} />
                  <Bar
                    dataKey="conversas"
                    fill="var(--aw-blue-600)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </AwChartContainer>
            </ChartCard>

            <ChartCard
              title="Resolução do agente vs. handoff"
              hint="Linha dupla — duas séries em diálogo, protagonista no azul."
            >
              <AwChartContainer config={resolucaoConfig}>
                <LineChart data={resolucaoData} margin={{ left: 4, right: 4 }}>
                  <CartesianGrid {...AW_CHART_GRID} />
                  <XAxis dataKey="semana" {...AW_CHART_AXIS} />
                  <AwChartTooltip content={<AwChartTooltipContent indicator="dot" />} />
                  <AwChartLegend content={<AwChartLegendContent />} />
                  <Line
                    dataKey="resolvidas"
                    type="monotone"
                    stroke="var(--aw-blue-600)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="handoff"
                    type="monotone"
                    stroke="var(--fg-muted)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </AwChartContainer>
            </ChartCard>

            <ChartCard
              title="Origem dos Knowledge Layers"
              hint="Donut — composição de um todo em poucas fatias."
            >
              <AwChartContainer config={origemConfig}>
                <PieChart>
                  <AwChartTooltip content={<AwChartTooltipContent nameKey="origem" hideLabel />} />
                  <Pie
                    data={origemData}
                    dataKey="total"
                    nameKey="origem"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {origemData.map((entry, i) => (
                      <Cell
                        key={entry.origem}
                        fill={AW_CHART_SERIES[i % AW_CHART_SERIES.length]}
                      />
                    ))}
                  </Pie>
                  <AwChartLegend content={<AwChartLegendContent nameKey="origem" />} />
                </PieChart>
              </AwChartContainer>
            </ChartCard>
          </div>
        </Section>

        <Section id="principios" title="Princípios">
          <DoDont
            dos={[
              "Azul (--aw-blue-600) sempre na série mais importante",
              "Máximo 6 séries — a paleta oficial acaba aí de propósito",
              "Grid horizontal sutil; eixos sem linha dura",
              "Tooltip sempre presente; legenda quando há 2+ séries",
            ]}
            donts={[
              "Cores fora da paleta AW_CHART_SERIES",
              "3D, sombras ou gradientes decorativos em barras",
              "Donut com mais de 5 fatias",
              "Dois gráficos de tendência competindo lado a lado",
            ]}
          />
        </Section>

        <Section id="api" title="API">
          <ApiTable>
            <PropRow
              prop="awChartConfig(labels)"
              type="Record<string, ReactNode> → ChartConfig"
              doc="Monta o config do shadcn aplicando a paleta oficial na ordem das chaves."
            />
            <PropRow
              prop="AW_CHART_SERIES"
              type="readonly string[]"
              doc="As 6 cores oficiais, em var(). A primeira é a protagonista."
            />
            <PropRow
              prop="AW_CHART_AXIS / AW_CHART_GRID"
              type="object"
              doc="Spreads de props padrão para XAxis e CartesianGrid."
            />
            <PropRow
              prop="AwChartContainer"
              type="ChartContainerProps"
              def="h-[280px]"
              doc="ChartContainer com a altura padrão dos cards de gráfico."
            />
          </ApiTable>
          <CodeExample label="exemplo">{`import { AwChartContainer, AwChartTooltip, AwChartTooltipContent,
  awChartConfig, AW_CHART_AXIS, AW_CHART_GRID } from "@/components/ui/AwChart"
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts"

const config = awChartConfig({ receita: "Receita (R$ mil)" })

<AwChartContainer config={config}>
  <AreaChart data={data}>
    <CartesianGrid {...AW_CHART_GRID} />
    <XAxis dataKey="mes" {...AW_CHART_AXIS} />
    <AwChartTooltip content={<AwChartTooltipContent />} />
    <Area dataKey="receita" stroke="var(--aw-blue-600)" fill="url(#awAreaFill)" />
  </AreaChart>
</AwChartContainer>`}</CodeExample>
        </Section>
      </div>
    </>
  )
}
