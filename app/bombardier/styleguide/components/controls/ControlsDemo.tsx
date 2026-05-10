"use client"

import * as React from "react"
import { AwToggle, AwToggleRow } from "@/components/ui/AwToggle"
import { AwSlider } from "@/components/ui/AwSlider"
import { AwTabs } from "@/components/ui/AwTabs"
import { AwSelect } from "@/components/ui/AwSelect"
import { AwProgress } from "@/components/ui/AwProgress"

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
  const [cat, setCat] = React.useState("all")
  const [page, setPage] = React.useState("phones")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-[var(--fg-tertiary)]">
          variant=&quot;segmented&quot; (default)
        </div>
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
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-[var(--fg-tertiary)]">
          tamanhos + estado disabled
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

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-[var(--fg-tertiary)]">
          variant=&quot;standalone&quot; com contadores — para nav de categorias
        </div>
        <AwTabs
          variant="standalone"
          value={cat}
          onChange={setCat}
          items={[
            { value: "all", label: "Todas", count: 23 },
            { value: "connected", label: "Conectadas", count: 5 },
            { value: "channels", label: "Canais", count: 3 },
            { value: "checkouts", label: "Checkouts", count: 7 },
            { value: "crms", label: "CRMs", count: 4 },
            { value: "marketplaces", label: "Marketplaces", count: 2 },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-[var(--fg-tertiary)]">
          variant=&quot;underline&quot; — nav de página, hairline + indicador
        </div>
        <AwTabs
          variant="underline"
          value={page}
          onChange={setPage}
          items={[
            { value: "overview", label: "Visão geral" },
            { value: "phones", label: "Números", count: 2 },
            { value: "templates", label: "Templates", count: 12 },
            { value: "variables", label: "Variáveis fixas", count: 3 },
            { value: "account", label: "Conta & permissões" },
          ]}
        />
      </div>

      <div className="text-sm text-[var(--fg-secondary)]">
        Tab ativa (segmented): <code className="mono">{tab}</code> · Categoria
        ativa (standalone): <code className="mono">{cat}</code> · Seção ativa
        (underline): <code className="mono">{page}</code>
      </div>
    </div>
  )
}

export function SelectDemo() {
  const [period, setPeriod] = React.useState("Últimos 30 dias")
  return (
    <div className="flex flex-col gap-3 max-w-[260px]">
      <AwSelect onClick={() => setPeriod((p) => (p === "Hoje" ? "Últimos 30 dias" : "Hoje"))}>
        {period}
      </AwSelect>
      <div className="text-xs text-[var(--fg-tertiary)]">
        Trigger puro — clique alterna o exemplo. Combine com um menu (AwDropdownMenu) para abrir as opções.
      </div>
    </div>
  )
}

export function ProgressDemo() {
  const [value, setValue] = React.useState(62)
  React.useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 4))
    }, 600)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex flex-col gap-5 max-w-[420px]">
      <AwProgress label="Sincronizando" value={value} />
      <AwProgress
        variant="success"
        label="Templates aprovados"
        value={84}
        valueLabel="84 / 100"
      />
      <AwProgress
        variant="warning"
        label="Quota de mensagens"
        value={72}
        valueLabel="72%"
      />
      <AwProgress
        variant="danger"
        label="Falhas de entrega"
        value={18}
        valueLabel="18 falhas"
      />
    </div>
  )
}
