import { AwStatCard } from "@/components/ui/AwStatCard"
import { PageHero, Section, Stage } from "../../../_primitives"

/**
 * AwStatCard — experimental showcase.
 *
 * Component lives in /components/ui/AwStatCard.tsx and is currently used
 * by the /tools page KPI band. Replaces the legacy KPICard/MetricCard in
 * /components/, which are pre-token-system and use hardcoded colors.
 *
 * Promotion to the official styleguide should happen after a review pass
 * on the API (variants, intents, change indicators).
 */

export default function AwStatCardPlaygroundPage() {
  return (
    <>
      <PageHero title="AwStatCard">
        Tile compacto pra exibir um KPI: ícone eyebrow + label, valor
        grande, hint opcional. Substituto Bombardier do{" "}
        <code className="font-mono text-[13px]">KPICard</code> e{" "}
        <code className="font-mono text-[13px]">MetricCard</code>{" "}
        legados.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Variante padrão"
            lead="Tile neutro pra contagens, totais e estoques. Eyebrow upper-tracked, valor 28 px semibold, hint discreto abaixo."
          >
            <Stage
              label="3 stat cards lado a lado"
              gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
            >
              <AwStatCard
                icon="bolt"
                label="Tools disponíveis"
                value={42}
                hint="38 ativas · 4 pausadas"
              />
              <AwStatCard
                icon="extension"
                label="Integrações conectadas"
                value={6}
                hint="38 tools nativas disponíveis"
              />
              <AwStatCard
                icon="auto_awesome"
                label="Tools personalizadas"
                value={2}
                hint="2 endpoints conectados"
              />
            </Stage>
          </Section>

          <Section
            id="ai"
            title="Variante ai"
            lead="Mesmo layout, com a mesh radial AI gradient nos cantos. Reservada para KPIs sobre execução do agente, sentiment, criatividade — onde o tom AI faz sentido."
          >
            <Stage
              label="ai variant"
              gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
            >
              <AwStatCard
                variant="ai"
                icon="psychology"
                label="Decisões assistidas"
                value="1.2k"
                hint="últimas 24h · +18% vs ontem"
              />
              <AwStatCard
                variant="ai"
                icon="speed"
                label="Tempo médio até resposta"
                value="2.4 s"
                hint="p95 · execuções via Claude"
              />
            </Stage>
          </Section>

          <Section
            id="without-hint"
            title="Sem hint"
            lead="Quando o contexto da página já explica o número, omita o hint pra deixar o tile mais respirado."
          >
            <Stage
              label="só value + label"
              gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
            >
              <AwStatCard icon="forum" label="Conversas hoje" value={284} />
              <AwStatCard
                icon="trending_up"
                label="Conversão semanal"
                value="12.6%"
              />
              <AwStatCard icon="schedule" label="Tempo médio" value="3m 12s" />
            </Stage>
          </Section>
        </div>
      </div>
    </>
  )
}
