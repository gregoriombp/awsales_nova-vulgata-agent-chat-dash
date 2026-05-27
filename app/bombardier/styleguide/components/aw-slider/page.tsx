"use client"

import * as React from "react"
import { AwSlider } from "@/components/ui/AwSlider"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function AwSliderPage() {
  const [budget, setBudget] = React.useState(45)
  const [temperature, setTemperature] = React.useState(0.7)

  return (
    <>
      <PageHero title="Slider">
        Input range com label e valor visíveis. Pra ajustes contínuos onde o
        usuário quer ver o impacto em tempo real — temperatura de modelo,
        limites de orçamento, intensidade de efeito.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Section id="usage" title="Uso">
          <Stage label="Com label e valor">
            <div className="max-w-[360px] py-4">
              <AwSlider
                label="Orçamento mensal"
                valueDisplay={`R$ ${budget * 100}`}
                value={budget}
                min={0}
                max={100}
                onChange={(e) => setBudget(Number(e.target.value))}
                help="Limite máximo aplicado a partir do próximo ciclo."
              />
            </div>
          </Stage>

          <Stage label="Granularidade fina (step)">
            <div className="max-w-[360px] py-4">
              <AwSlider
                label="Temperatura do modelo"
                valueDisplay={temperature.toFixed(2)}
                value={temperature}
                min={0}
                max={1}
                step={0.05}
                onChange={(e) => setTemperature(Number(e.target.value))}
              />
            </div>
          </Stage>

          <Stage label="Sem label (compacto)">
            <div className="max-w-[360px] py-4">
              <AwSlider defaultValue={70} min={0} max={100} />
            </div>
          </Stage>
        </Section>

        <Section id="api" title="API">
          <ApiTable>
            <PropRow
              prop="label"
              type="React.ReactNode"
              doc="Texto à esquerda no topo do slider."
            />
            <PropRow
              prop="valueDisplay"
              type="React.ReactNode"
              doc="Valor formatado à direita do label (negrito). Você controla a formatação."
            />
            <PropRow
              prop="help"
              type="React.ReactNode"
              doc="Texto auxiliar abaixo do slider."
            />
            <PropRow
              prop="min / max / step / value / defaultValue / onChange"
              type='herda de input[type="range"]'
              doc="Props nativas do input range — comportamento padrão."
            />
          </ApiTable>
        </Section>
      </div>
    </>
  )
}
