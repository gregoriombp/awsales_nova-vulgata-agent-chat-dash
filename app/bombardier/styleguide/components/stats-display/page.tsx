import { StatsDisplay } from "@/components/tool-ui/stats-display"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
  Tldr,
} from "../../_primitives"

export default function StatsDisplayPage() {
  return (
    <>
      <PageHero title="Stats display">
        Bloco compacto pra exibir um conjunto de métricas/KPIs em cards lado
        a lado — com sparkline opcional, indicador de variação e formatação
        localizada (número, moeda, porcentagem). Surface do tipo{" "}
        <strong>information</strong> do registry tool-ui, pensada pra um
        agente devolver um snapshot de números dentro de um chat ou
        relatório.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Snapshot de 2–4 KPIs relacionados (ex.: receita, conversão, ticket médio) dentro de um chat ou tela de overview.</>,
            <>Quando precisar mostrar tendência (sparkline) + variação (diff) sem abrir um chart completo.</>,
            <>Quando o agente devolver números formatados (currency / percent / number compact) com locale.</>,
          ]}
          dontUse={[
            <>Pra um KPI &ldquo;solto&rdquo; numa página de produto — use <code className="mono">AwStatCard</code> com eyebrow + hint.</>,
            <>Pra séries temporais densas ou comparações multi-eixo — use um chart de verdade.</>,
            <>Mais de 4 stats lado a lado — quebra o grid, vira tabela.</>,
          ]}
        />

        <Section
          id="default"
          title="Default · 3 stats com sparkline e diff"
          lead="Layout padrão. Auto-grid (auto-fit, minmax 220px) cuida do reflow; valor em font-light, eyebrow upper-tracked, sparkline absoluta no fundo."
        >
          <Stage label="3 KPIs · sparkline + delta" gridClassName="flex justify-center w-full">
            <StatsDisplay
              id="stats-default"
              stats={[
                {
                  key: "revenue",
                  label: "Receita",
                  value: 184320,
                  format: { kind: "currency", currency: "BRL", decimals: 0 },
                  diff: { value: 12.4, label: "vs. semana passada" },
                  sparkline: { data: [120, 140, 132, 158, 162, 171, 184] },
                },
                {
                  key: "conversions",
                  label: "Conversões",
                  value: 1284,
                  format: { kind: "number", compact: true },
                  diff: { value: 8.1 },
                  sparkline: { data: [800, 920, 880, 1010, 1120, 1190, 1284] },
                },
                {
                  key: "rate",
                  label: "Taxa de conversão",
                  value: 0.0682,
                  format: { kind: "percent", decimals: 2, basis: "fraction" },
                  diff: { value: -1.3 },
                  sparkline: { data: [0.072, 0.069, 0.071, 0.07, 0.068, 0.069, 0.068] },
                },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="single"
          title="Single · stat hero"
          lead="Quando há um único stat, o componente entra em modo hero: valor mais largo (text-5xl), card mais estreito, layout vertical. Bom pra confirmar uma operação que reporta um número só."
        >
          <Stage label="1 stat · hero mode" gridClassName="flex justify-center w-full">
            <StatsDisplay
              id="stats-single"
              stats={[
                {
                  key: "mrr",
                  label: "MRR",
                  value: 48750,
                  format: { kind: "currency", currency: "BRL", decimals: 0 },
                  diff: { value: 6.2, label: "MoM" },
                  sparkline: { data: [38, 41, 43, 44, 46, 47, 48.75] },
                },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="with-header"
          title="Com título e descrição"
          lead="Título + descrição entram acima do grid, separados por border-b. Use quando o bloco precisa contextualizar a janela do snapshot (ex.: período, escopo)."
        >
          <Stage label="header + 2 stats" gridClassName="flex justify-center w-full">
            <StatsDisplay
              id="stats-header"
              title="Performance · últimos 7 dias"
              description="Comparativo com a semana anterior, considerando os agentes ativos."
              stats={[
                {
                  key: "conversations",
                  label: "Conversas",
                  value: 4218,
                  format: { kind: "number", compact: true },
                  diff: { value: 14.2 },
                  sparkline: { data: [310, 380, 410, 480, 520, 590, 640] },
                },
                {
                  key: "deflection",
                  label: "Taxa de deflexão",
                  value: 0.732,
                  format: { kind: "percent", decimals: 1, basis: "fraction" },
                  diff: { value: 2.8 },
                  sparkline: { data: [0.69, 0.70, 0.71, 0.72, 0.72, 0.73, 0.73] },
                },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="formats"
          title="Format kinds"
          lead="Quatro formatos. text passa o valor cru; number aceita compact e decimals; currency exige um código ISO; percent aceita basis (fraction = 0–1, unit = já em %)."
        >
          <Stage label="text · number · currency · percent" gridClassName="flex justify-center w-full">
            <StatsDisplay
              id="stats-formats"
              stats={[
                {
                  key: "status",
                  label: "Status",
                  value: "Operando",
                  format: { kind: "text" },
                },
                {
                  key: "ops",
                  label: "Execuções",
                  value: 1284390,
                  format: { kind: "number", compact: true },
                },
                {
                  key: "arr",
                  label: "ARR projetado",
                  value: 1240000,
                  format: { kind: "currency", currency: "BRL", decimals: 0 },
                },
                {
                  key: "uptime",
                  label: "Uptime",
                  value: 99.97,
                  format: { kind: "percent", decimals: 2, basis: "unit" },
                },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="diff"
          title="Diff · upIsPositive"
          lead="diff.value > 0 vira verde por padrão, < 0 vermelho. Quando subir é ruim (ex.: latência, churn), passe upIsPositive: false — o componente inverte a cor e adiciona seta."
        >
          <Stage label="upIsPositive default vs. inverted" gridClassName="flex justify-center w-full">
            <StatsDisplay
              id="stats-diff"
              stats={[
                {
                  key: "revenue",
                  label: "Receita",
                  value: 92400,
                  format: { kind: "currency", currency: "BRL", decimals: 0 },
                  diff: { value: 9.1 },
                },
                {
                  key: "latency",
                  label: "Latência p95",
                  value: 412,
                  format: { kind: "number" },
                  diff: { value: 6.4, upIsPositive: false, label: "ms" },
                },
                {
                  key: "churn",
                  label: "Churn",
                  value: 0.034,
                  format: { kind: "percent", decimals: 1, basis: "fraction" },
                  diff: { value: -0.4, upIsPositive: false },
                },
              ]}
            />
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Props principais do componente. O schema completo (StatItem, StatFormat, StatDiff, StatSparkline) está em components/tool-ui/stats-display/schema.ts."
        >
          <ApiTable>
            <PropRow
              prop="id"
              type="string"
              doc="Identificador único da surface — usado em data-tool-ui-id."
            />
            <PropRow
              prop="stats"
              type="StatItem[]"
              doc="Lista de stats. 1 stat ativa o modo hero; 2+ entram no grid."
            />
            <PropRow
              prop="title"
              type="string?"
              doc="Título opcional acima do grid. Renderiza CardHeader com border-b."
            />
            <PropRow
              prop="description"
              type="string?"
              doc="Descrição opcional logo abaixo do título."
            />
            <PropRow
              prop="locale"
              type="string?"
              def="navigator.language"
              doc="Locale BCP-47 (ex.: 'pt-BR') usado pelos formatters Intl."
            />
            <PropRow
              prop="className"
              type="string?"
              doc="Classes extras no &lt;article&gt; raiz."
            />
          </ApiTable>
        </Section>
      </div>
    </>
  )
}
