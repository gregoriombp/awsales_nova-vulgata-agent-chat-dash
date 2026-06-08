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
  SelectDemo,
  ProgressDemo,
} from "./ControlsDemo"

export default function ControlsPage() {
  return (
    <>
      <PageHero title="Controles">
        Controles compactos para configurações dentro de painéis:
          <strong> Toggle</strong> (boolean), <strong>Slider</strong>{" "}
          (numérico), <strong>Tabs</strong> (agrupamento de conteúdo),{" "}
          <strong>Select</strong> (trigger de menu) e <strong>Progress</strong>{" "}
          (barra de progresso determinística).
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

          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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

          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec k="track" v="4 px · --bg-muted" d="Pill-radius." />
            <Spec
              k="thumb"
              v="16 px · --fg-primary"
              d="Border 2px --bg-raised + ring-3 --border-default."
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

          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
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
          id="select"
          title="Select"
          lead="Trigger de menu — botão estilizado com label e caret. Não é um menu por si só; pareie com AwDropdownMenu (ou Radix) pra abrir as opções."
        >
          <Stage label="select trigger — clique alterna o exemplo">
            <SelectDemo />
          </Stage>

          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="altura"
              v="36 px"
              d="Mesmo ritmo do AwButton size=md."
            />
            <Spec
              k="superfície"
              v="--bg-raised + 1px --border-default"
              d="Hover sobe pra --border-strong."
            />
            <Spec
              k="caret"
              v="14 px · --fg-tertiary"
              d="Sempre à direita; gira 180° quando o menu abre (controle externo)."
            />
          </div>
        </Section>

        <Section
          id="progress"
          title="Progress"
          lead="Barra de progresso determinística (valor conhecido). Quatro variantes para semântica de status."
        >
          <Stage
            label="default · success · warning · danger"
            gridClassName="flex flex-col gap-6"
          >
            <ProgressDemo />
          </Stage>

          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="track"
              v="6 px · --bg-muted"
              d="Pill-radius. Indicator anima de 0 → value em ease-out."
            />
            <Spec
              k="indicator"
              v="--accent-brand"
              d="Variantes trocam pra emerald-700 / amber-500 / red-700."
            />
            <Spec
              k="label + valor"
              v="row top — 13 px"
              d="Label à esquerda em --fg-secondary, valor à direita em --fg-primary (bold)."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Todos os controles vivem em arquivos separados dentro de components/ui/."
        >
          <h3 className="text-(--h5-size) font-medium mt-4 mb-3">
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

          <h3 className="text-(--h5-size) font-medium mt-8 mb-3">
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

          <h3 className="text-(--h5-size) font-medium mt-8 mb-3">
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

          <h3 className="text-(--h5-size) font-medium mt-8 mb-3">
            AwSelect
          </h3>
          <ApiTable>
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Texto/label visível dentro do trigger. Pode ser string ou JSX (ex.: ícone + label)."
            />
            <PropRow
              prop="onClick"
              type="MouseEventHandler"
              doc="Handler para abrir o menu. AwSelect é puramente o trigger — o menu fica a cargo do consumidor."
            />
            <PropRow
              prop="...rest"
              type="ButtonHTMLAttributes"
              doc="Demais props HTML do <button> — disabled, aria-*, ref via forwardRef."
            />
          </ApiTable>

          <h3 className="text-(--h5-size) font-medium mt-8 mb-3">
            AwProgress
          </h3>
          <ApiTable>
            <PropRow
              prop="value"
              type="number"
              doc="Valor atual; clamp em [0, max]."
            />
            <PropRow
              prop="max"
              type="number"
              def="100"
              doc="Valor máximo da escala."
            />
            <PropRow
              prop="label"
              type="ReactNode"
              doc="Texto à esquerda no top da row. Omita para esconder a row de header."
            />
            <PropRow
              prop="valueLabel"
              type="ReactNode"
              doc='Valor formatado à direita. Default: "{round(pct)}%".'
            />
            <PropRow
              prop="variant"
              type='"default" | "success" | "warning" | "danger"'
              def='"default"'
              doc="Cor do indicator — semântica de status."
            />
          </ApiTable>

          <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-4 py-3 text-sm text-(--aw-blue-900) mt-4">
            <code className="mono">checked</code>,{" "}
            <code className="mono">active</code>,{" "}
            <code className="mono">variant</code> viram tokens na{" "}
            <code className="mono">className</code>; props com valor (label,
            value, max) ficam como atributos nativos. Esquerda é o formato
            curto do styleguide; direita é a API real.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">styleguide · HTML + className</div>
              <CodeExample label="toggle">{`<label className="toggle">
  <input
    type="checkbox"
    className="toggle-input"
    checked
  />
  <span className="toggle-track" />
  <span className="toggle-label">
    Pause global
  </span>
</label>`}</CodeExample>
              <CodeExample label="tabs">{`<nav className="tabs">
  <button className="tab active">
    Geral
  </button>
  <button className="tab">
    Fontes
  </button>
</nav>`}</CodeExample>
              <CodeExample label="slider">{`<label className="slider">
  <span className="slider-label">
    Temperatura
  </span>
  <input
    type="range"
    min={0}
    max={100}
    value={70}
  />
  <span className="slider-value">
    0.7
  </span>
</label>`}</CodeExample>
            </div>

            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">produto · AwToggle / AwTabs / AwSlider</div>
              <CodeExample label="toggle">{`"use client"
import { useState } from "react"
import { AwToggle } from "@/components/ui/AwToggle"

const [open, setOpen] = useState(false)

<AwToggle
  checked={open}
  onChange={setOpen}
  label="Pause global"
/>`}</CodeExample>
              <CodeExample label="tabs">{`import { AwTabs } from "@/components/ui/AwTabs"

const [tab, setTab] = useState("geral")

<AwTabs
  value={tab}
  onChange={setTab}
  items={[
    { value: "geral", label: "Geral" },
    { value: "fontes", label: "Fontes" },
  ]}
/>`}</CodeExample>
              <CodeExample label="slider">{`import { AwSlider } from "@/components/ui/AwSlider"

const [temp, setTemp] = useState(70)

<AwSlider
  label="Temperatura"
  valueDisplay={(temp / 100).toFixed(1)}
  min={0}
  max={100}
  value={temp}
  onChange={(e) => setTemp(+e.target.value)}
/>`}</CodeExample>
            </div>
          </div>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Toggle para estado binário, imediato e reversível.</>,
              <>Slider sempre com valor numérico visível.</>,
              <>Tabs para alternar painéis dentro da mesma tela.</>,
              <>Select pareado com AwDropdownMenu pra abrir as opções.</>,
              <>Progress quando o valor é determinístico (% conhecido).</>,
            ]}
            donts={[
              <>Checkbox quando o estado é binário, imediato e reversível — use toggle.</>,
              <>Slider sem max/min explícitos ou unidade.</>,
              <>Tabs para navegação entre páginas — use o router.</>,
              <>Select sem menu acoplado — vira só um botão.</>,
              <>Progress para tarefas indeterminadas — use AwSkeleton ou um spinner.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
