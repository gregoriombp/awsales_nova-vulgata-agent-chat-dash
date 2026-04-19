"use client"

import * as React from "react"
import { AwToggle, AwToggleRow } from "@/components/ui/AwToggle"
import { AwSlider } from "@/components/ui/AwSlider"
import { AwTabs } from "@/components/ui/AwTabs"

export function ToggleDemo() {
  const [off, setOff] = React.useState(false)
  const [always, setAlways] = React.useState(true)
  const [escalate, setEscalate] = React.useState(true)
  return (
    <div className="flex flex-col gap-3 max-w-[420px]">
      <AwToggleRow
        title="Responder fora do horário"
        description="Mantém o agente ativo 24/7."
        checked={always}
        onChange={setAlways}
      />
      <AwToggleRow
        title="Escalar para humano"
        description="Quando confiança < 60%."
        checked={escalate}
        onChange={setEscalate}
      />
      <AwToggleRow
        title="Pause global (kill switch)"
        description="Desativa imediatamente todos os canais."
        checked={off}
        onChange={setOff}
      />
    </div>
  )
}

export function ToggleInline() {
  const [a, setA] = React.useState(false)
  const [b, setB] = React.useState(true)
  return (
    <div className="flex items-center gap-4">
      <AwToggle checked={a} onChange={setA} label="toggle off" />
      <AwToggle checked={b} onChange={setB} label="toggle on" />
    </div>
  )
}

export function SliderDemo() {
  const [temp, setTemp] = React.useState(70)
  const [topP, setTopP] = React.useState(90)
  return (
    <div className="flex flex-col gap-6 max-w-[420px]">
      <AwSlider
        label="Temperatura"
        valueDisplay={(temp / 100).toFixed(1)}
        help="0 determinístico · 1 criativo"
        min={0}
        max={100}
        value={temp}
        onChange={(e) => setTemp(parseInt(e.target.value, 10))}
      />
      <AwSlider
        label="Top-P"
        valueDisplay={(topP / 100).toFixed(2)}
        help="Filtra tokens cuja probabilidade acumulada excede o valor."
        min={1}
        max={100}
        value={topP}
        onChange={(e) => setTopP(parseInt(e.target.value, 10))}
      />
    </div>
  )
}

export function TabsDemo() {
  const [tab, setTab] = React.useState("geral")
  const [size, setSize] = React.useState("md")
  return (
    <div className="flex flex-col gap-6">
      <AwTabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "geral", label: "Geral" },
          { value: "fontes", label: "Fontes" },
          { value: "rastro", label: "Rastro" },
          { value: "webhooks", label: "Webhooks" },
        ]}
      />
      <div className="text-sm text-[var(--fg-secondary)]">
        Tab ativa: <code className="mono">{tab}</code>
      </div>
      <AwTabs
        value={size}
        onChange={setSize}
        items={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "X-Large", disabled: true },
        ]}
      />
    </div>
  )
}
