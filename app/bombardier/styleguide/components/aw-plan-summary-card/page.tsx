import { AwPlanSummaryCard } from "@/components/ui/AwPlanSummaryCard"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function PlanSummaryCardPage() {
  return (
    <>
      <PageHero title="Plan Summary Card">
        Card escuro com o resumo do plano atual: nome, status, preço/renovação e
        o consumo variável do ciclo com barra de progresso e um link opcional
        para comparar planos.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Passe os dados do plano, o consumo acumulado/limite e um href de comparação. O botão 'Comparar planos' só aparece quando comparePlansHref é informado."
          >
            <Stage
              label="Plano Pro — ciclo em andamento"
              gridClassName="grid grid-cols-1 max-w-[480px]"
            >
              <AwPlanSummaryCard
                plan="pro"
                planName="Pro"
                status="Ativo"
                monthly={499}
                renewsAt="19/06/2026"
                accumulated={842}
                limit={1500}
                comparePlansHref="#"
              />
            </Stage>
          </Section>

          <Section
            id="plans"
            title="Os três planos"
            lead="O mesmo card serve starter, pro e enterprise — o AwPlanIcon desenha a marca correspondente a partir da prop plan."
          >
            <Stage
              label="starter · pro · enterprise"
              gridClassName="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch"
            >
              <AwPlanSummaryCard
                plan="starter"
                planName="Starter"
                status="Ativo"
                monthly={149}
                renewsAt="03/07/2026"
                accumulated={210}
                limit={500}
                comparePlansHref="#"
              />
              <AwPlanSummaryCard
                plan="pro"
                planName="Pro"
                status="Ativo"
                monthly={499}
                renewsAt="19/06/2026"
                accumulated={842}
                limit={1500}
                comparePlansHref="#"
              />
              <AwPlanSummaryCard
                plan="enterprise"
                planName="Enterprise"
                status="Ativo"
                monthly={1990}
                renewsAt="28/06/2026"
                accumulated={4320}
                limit={8000}
                comparePlansHref="#"
              />
            </Stage>
          </Section>

          <Section
            id="no-compare"
            title="Sem comparar planos"
            lead="Omita comparePlansHref para renderizar apenas o resumo, sem o botão no rodapé."
          >
            <Stage
              label="Sem link de comparação"
              gridClassName="grid grid-cols-1 max-w-[480px]"
            >
              <AwPlanSummaryCard
                plan="pro"
                planName="Pro"
                status="Ativo"
                monthly={499}
                renewsAt="19/06/2026"
                accumulated={842}
                limit={1500}
              />
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Totalmente desacoplado: defina os próprios dados. Valores monetários passam por formatValue (default BRL pt-BR)."
          >
            <ApiTable>
              <PropRow
                prop="plan"
                type='"starter" | "pro" | "enterprise"'
                doc="Plano atual — controla qual marca o AwPlanIcon desenha."
              />
              <PropRow
                prop="planName"
                type="string"
                doc='Nome exibido do plano (ex.: "Pro").'
              />
              <PropRow
                prop="status"
                type="string"
                doc='Texto do selo de status (ex.: "Ativo").'
              />
              <PropRow
                prop="statusVariant"
                type="AwPillVariant"
                def='"live"'
                doc="Variante visual do AwPill de status."
              />
              <PropRow
                prop="monthly"
                type="number"
                doc="Valor mensal do plano — passa por formatValue."
              />
              <PropRow
                prop="renewsAt"
                type="string"
                doc='Data de renovação já formatada (ex.: "19/06/2026").'
              />
              <PropRow
                prop="accumulated"
                type="number"
                doc="Consumo variável acumulado no ciclo — passa por formatValue."
              />
              <PropRow
                prop="limit"
                type="number"
                doc="Limite de consumo variável do ciclo — passa por formatValue."
              />
              <PropRow
                prop="comparePlansHref"
                type="string"
                doc='Destino do botão "Comparar planos". Sem ele, o botão não renderiza.'
              />
              <PropRow
                prop="formatValue"
                type="(n: number) => string"
                def="Intl pt-BR / BRL"
                doc="Formata os valores monetários (monthly, accumulated, limit)."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado na classe do AwCard raiz via cn."
              />
            </ApiTable>

            <CodeExample label="exemplo" lang="tsx">
              {`<AwPlanSummaryCard
  plan="pro"
  planName="Pro"
  status="Ativo"
  monthly={499}
  renewsAt="19/06/2026"
  accumulated={842}
  limit={1500}
  comparePlansHref="/settings/financeiro/consumo"
/>`}
            </CodeExample>
          </Section>
        </div>
      </div>
    </>
  )
}
