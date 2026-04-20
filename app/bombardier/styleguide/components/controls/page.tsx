import {
  PageHero,
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"
import {
  ToggleDemo,
  ToggleInline,
  SliderDemo,
  TabsDemo,
} from "./ControlsDemo"

export default function ControlsPage() {
  return (
    <>
      <PageHero title="Controles">
        Controles compactos para configurações dentro de painéis:
          <strong> Toggle</strong> (boolean), <strong>Slider</strong>{" "}
          (numérico) e <strong>Tabs</strong> (agrupamento de conteúdo).
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="toggle"
          title="Toggle"
          lead="Switch on/off. Controle binário, imediato, reversível. Track preto quando ligado; cinza claro quando desligado."
        >
          <Stage label="toggle inline — off · on">
            <ToggleInline />
          </Stage>

          <div className="mt-4">
            <Stage
              label="toggle-row — switch + copy"
              gridClassName="flex flex-col gap-3 max-w-[420px]"
            >
              <ToggleDemo />
            </Stage>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="tamanho"
              v="38 × 22 px"
              d="Thumb 16 px circular."
            />
            <Spec
              k="off"
              v="track --aw-gray-300"
              d="Thumb em --bg-raised, centrado à esquerda."
            />
            <Spec
              k="on"
              v="track --fg-primary"
              d="Thumb migra para a direita em 180 ms ease-out."
            />
          </div>
        </Section>

        <Section
          id="slider"
          title="Slider"
          lead="Input de range. Valor à direita em mono; descritor textual abaixo sempre que o contexto ajudar (ex.: “0 determinístico · 1 criativo”)."
        >
          <Stage label="slider com label + valor + help">
            <SliderDemo />
          </Stage>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec k="track" v="4 px · --bg-muted" d="Pill-radius." />
            <Spec
              k="thumb"
              v="16 px · --fg-primary"
              d="Border 2px --bg-raised + ring --border-default."
            />
            <Spec
              k="label"
              v="mono · --fg-primary"
              d="Sempre alinhado à direita, top-right."
            />
          </div>
        </Section>

        <Section
          id="tabs"
          title="Tabs"
          lead="Segmented pill. Usar para alternar painéis de conteúdo relacionados — não para navegação entre páginas."
        >
          <Stage
            label="tabs — active state + disabled"
            gridClassName="flex flex-col gap-6"
          >
            <TabsDemo />
          </Stage>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="container"
              v="--bg-surface + 1px --border-subtle"
              d="Radius md · padding 3 px."
            />
            <Spec
              k="tab"
              v="7 · 14 · 12.5 px"
              d="font-weight 500; label sentence-case."
            />
            <Spec
              k="active"
              v="--bg-raised + shadow-xs"
              d="Cor do texto sobe para --fg-primary."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Todos os 3 controles vivem em arquivos separados dentro de components/ui/."
        >
          <h3 className="text-[var(--h5-size)] font-medium mt-4 mb-3">
            AwToggle
          </h3>
          <ApiTable>
            <PropRow
              prop="checked"
              type="boolean"
              doc="Estado controlado."
            />
            <PropRow
              prop="onChange"
              type="(next: boolean) => void"
              doc="Recebe o próximo estado, não o evento."
            />
            <PropRow
              prop="label"
              type="string"
              doc="aria-label — obrigatório em toggle isolado."
            />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwSlider
          </h3>
          <ApiTable>
            <PropRow
              prop="label"
              type="ReactNode"
              doc="Texto à esquerda no top."
            />
            <PropRow
              prop="valueDisplay"
              type="ReactNode"
              doc="Valor formatado à direita (ex.: '0.7', '45%')."
            />
            <PropRow
              prop="help"
              type="ReactNode"
              doc="Texto auxiliar abaixo da track."
            />
            <PropRow
              prop="...rest"
              type="InputHTMLAttributes"
              doc="Todas as props de <input type=range>: min, max, value, onChange…"
            />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwTabs
          </h3>
          <ApiTable>
            <PropRow
              prop="items"
              type="{ value, label, disabled? }[]"
              doc="Array de tabs."
            />
            <PropRow
              prop="value"
              type="string"
              doc="Tab ativa. Controlado pelo pai."
            />
            <PropRow
              prop="onChange"
              type="(value: string) => void"
              doc="Recebe o value do próximo tab."
            />
          </ApiTable>

          <CodeExample>{`"use client"
import { useState } from "react"
import { AwToggle, AwTabs, AwSlider } from "@/components/ui/*"

const [open, setOpen] = useState(false)
<AwToggle checked={open} onChange={setOpen} label="Pause global" />

const [tab, setTab] = useState("geral")
<AwTabs
  value={tab}
  onChange={setTab}
  items={[
    { value: "geral", label: "Geral" },
    { value: "fontes", label: "Fontes" },
  ]}
/>

const [temp, setTemp] = useState(70)
<AwSlider
  label="Temperatura"
  valueDisplay={(temp / 100).toFixed(1)}
  min={0} max={100}
  value={temp}
  onChange={(e) => setTemp(+e.target.value)}
/>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Toggle para estado binário, imediato e reversível.</>,
              <>Slider sempre com valor numérico visível.</>,
              <>Tabs para alternar painéis dentro da mesma tela.</>,
            ]}
            donts={[
              <>Checkbox quando o estado é binário, imediato e reversível — use toggle.</>,
              <>Slider sem max/min explícitos ou unidade.</>,
              <>Tabs para navegação entre páginas — use o router.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
