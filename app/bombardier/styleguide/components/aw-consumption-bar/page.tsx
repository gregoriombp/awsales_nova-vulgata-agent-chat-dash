"use client"

import { AwConsumptionBar } from "@/components/ui/AwConsumptionBar"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function ConsumptionBarPage() {
  return (
    <>
      <PageHero title="Consumption Bar">
        Barra de consumo de um ciclo com limite fixo. O trecho claro é o
        consumo bruto; o trecho sólido é o valor líquido a cobrar depois dos
        créditos. Uma agulha marca o limite quando ele cai dentro da barra, e
        o tooltip abre o breakdown completo (bruto, abatido, a cobrar, limite).
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Consumo dentro do limite com créditos abatendo parte do valor. Passe o mouse na barra pra ver o breakdown."
          >
            <Stage
              label="gross=842 · credits=120 · limit=1500"
              gridClassName="flex flex-col gap-3"
            >
              <div className="w-full max-w-[420px]">
                <AwConsumptionBar gross={842} credits={120} limit={1500} />
              </div>
            </Stage>
          </Section>

          <Section
            id="states"
            title="Estados"
            lead="A cor e a agulha respondem à relação entre líquido e limite. Acima do limite, a barra vira vermelha e a agulha some (limite ≤ 0% ou ≥ 100% da escala)."
          >
            <Stage
              label="dentro do limite · acima do limite · sem créditos"
              gridClassName="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <div className="text-xs text-(--fg-tertiary)">
                  Dentro do limite — gross=842, credits=120, limit=1500
                </div>
                <div className="w-full max-w-[420px]">
                  <AwConsumptionBar gross={842} credits={120} limit={1500} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-xs text-(--fg-tertiary)">
                  Acima do limite — gross=1800, limit=1500
                </div>
                <div className="w-full max-w-[420px]">
                  <AwConsumptionBar gross={1800} limit={1500} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-xs text-(--fg-tertiary)">
                  Sem créditos — gross=600, limit=1500
                </div>
                <div className="w-full max-w-[420px]">
                  <AwConsumptionBar gross={600} limit={1500} />
                </div>
              </div>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Componente desacoplado de financeiro. net = max(gross − credits, 0). Aceita className e ...rest na raiz."
          >
            <ApiTable>
              <PropRow
                prop="gross"
                type="number"
                doc="Consumo bruto do ciclo, antes de qualquer abatimento."
              />
              <PropRow
                prop="credits"
                type="number"
                def="0"
                doc="Créditos (vouchers/cupons) que abatem o consumo. Não aumentam o limite."
              />
              <PropRow
                prop="limit"
                type="number"
                doc="Limite do ciclo — referência da agulha e da cobrança."
              />
              <PropRow
                prop="ariaLabel"
                type="string"
                def='"Consumo do ciclo"'
                doc="Rótulo acessível do trilho."
              />
              <PropRow
                prop="formatValue"
                type="(value: number) => string"
                def="Intl pt-BR BRL"
                doc="Formatação dos valores exibidos no tooltip e na agulha."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado (via cn) na raiz da barra. ...rest também é repassado."
              />
            </ApiTable>
          </Section>
        </div>
      </div>
    </>
  )
}
