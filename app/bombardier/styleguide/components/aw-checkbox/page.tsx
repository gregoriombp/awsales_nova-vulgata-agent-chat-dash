"use client"

import * as React from "react"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  ApiTable,
  PropRow,
  KeyboardTable,
  Toc,
  CodeExample,
  RelatedLinks,
} from "../../_primitives"

const TOC = [
  { id: "states",    label: "Estados"           },
  { id: "default",   label: "Padrão"            },
  { id: "with-text", label: "Com descrição"      },
  { id: "disabled",  label: "Desabilitado"       },
  { id: "card",      label: "Card clicável"      },
  { id: "group",     label: "Grupo"              },
  { id: "api",       label: "API"                },
  { id: "keyboard",  label: "Acessibilidade"     },
  { id: "related",   label: "Veja também"        },
]

export default function CheckboxPage() {
  return (
    <>
      <PageHero title="Checkbox">
        Seleção binária baseada em Radix UI. Suporta <strong>indeterminate</strong> para grupos
        com seleção parcial. Sempre acompanhado de label visível — nunca bare.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">

        <Toc items={TOC} />

        {/* ── Estados ───────────────────────────────────────────── */}
        <Section
          id="states"
          title="Estados"
          lead="Quatro estados possíveis — unchecked, checked, indeterminate e disabled. Indeterminate é gerenciado pelo pai; o componente não alterna para ele sozinho."
        >
          <Stage label="unchecked · checked · indeterminate · disabled">
            <CheckboxRow id="st-unchecked" label="Não selecionado" checked={false} />
            <CheckboxRow id="st-checked"   label="Selecionado"     checked={true}  />
            <CheckboxRow id="st-indet"     label="Indeterminate"   checked="indeterminate" />
            <CheckboxRow id="st-dis"       label="Desabilitado"    checked={false} disabled />
          </Stage>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
            <Spec k="unchecked" v="borda default"    d="Estado neutro. Nenhum valor selecionado." />
            <Spec k="checked"   v="bg fg-primary"    d="Selecionado. Ícone check em bg-raised." />
            <Spec k="indeterminate" v="bg fg-primary" d="Seleção parcial em grupo. Ícone remove." />
            <Spec k="disabled"  v="opacity 0.5"      d="pointer-events none; cursor not-allowed." />
          </div>
        </Section>

        {/* ── Padrão ────────────────────────────────────────────── */}
        <Section
          id="default"
          title="Padrão"
          lead="A versão mais simples: checkbox + label na mesma linha. Use htmlFor + id para parear — nunca envolva o input sem label acessível."
        >
          <Stage label="padrão · label inline">
            <DefaultDemo />
          </Stage>

          <CodeExample label="padrão">{`<AwCheckbox id="terms" checked={checked} onChange={setChecked} />
<label htmlFor="terms" className="body-sm text-(--fg-primary)">
  Aceitar termos e condições
</label>`}</CodeExample>
        </Section>

        {/* ── Com descrição ─────────────────────────────────────── */}
        <Section
          id="with-text"
          title="Com descrição"
          lead="Label em destaque + texto auxiliar abaixo. Checkbox alinha com o topo da label — use items-start no wrapper."
        >
          <Stage label="com texto auxiliar">
            <WithTextDemo />
          </Stage>

          <CodeExample label="com descrição">{`<div className="flex items-start gap-3">
  <AwCheckbox id="notify" checked={checked} onChange={setChecked} />
  <div className="flex flex-col gap-1">
    <label htmlFor="notify" className="body-sm font-medium text-(--fg-primary)">
      Receber notificações
    </label>
    <p className="caption text-(--fg-secondary)">
      Você pode desativar a qualquer momento nas configurações.
    </p>
  </div>
</div>`}</CodeExample>
        </Section>

        {/* ── Desabilitado ──────────────────────────────────────── */}
        <Section
          id="disabled"
          title="Desabilitado"
          lead="Estado read-only. Opacidade 0.5, sem interação. Use quando a opção existe mas não está disponível no contexto atual — com tooltip de motivo se possível."
        >
          <Stage label="disabled unchecked · disabled checked">
            <CheckboxRow id="dis-off" label="Notificações desativadas (plano básico)" checked={false} disabled />
            <CheckboxRow id="dis-on"  label="Renovação automática (plano corporativo)" checked={true}  disabled />
          </Stage>

          <CodeExample label="disabled">{`<AwCheckbox id="feature" checked={false} disabled />
<label htmlFor="feature" className="body-sm text-(--fg-secondary) cursor-not-allowed">
  Funcionalidade indisponível
</label>`}</CodeExample>
        </Section>

        {/* ── Card clicável ─────────────────────────────────────── */}
        <Section
          id="card"
          title="Card clicável"
          lead="Área de clique ampliada — o card inteiro aciona o checkbox. Use CSS :has() para estilizar o card quando selecionado. Ideal para escolha de planos, features e permissões."
        >
          <Stage label="card clicável · has([aria-checked=true])">
            <CardCheckboxDemo />
          </Stage>

          <CodeExample label="card clicável">{`<label
  htmlFor="plan-pro"
  className="flex items-start gap-3 rounded-lg border border-(--border-default)
    bg-(--bg-raised) p-4 cursor-pointer transition-colors
    hover:bg-(--bg-surface)
    has-aria-checked:border-(--fg-primary)
    has-aria-checked:bg-(--bg-surface)"
>
  <AwCheckbox id="plan-pro" checked={checked} onChange={setChecked} />
  <div className="flex flex-col gap-0.5">
    <span className="body-sm font-medium text-(--fg-primary)">Pro</span>
    <span className="caption text-(--fg-secondary)">Até 10 agentes e 50 GB</span>
  </div>
</label>`}</CodeExample>
        </Section>

        {/* ── Grupo ─────────────────────────────────────────────── */}
        <Section
          id="group"
          title="Grupo"
          lead="Vários checkboxes independentes. O estado indeterminate do pai reflete seleção parcial — calculado pelo consumidor, não pelo componente."
        >
          <Stage label="grupo com pai indeterminate">
            <GroupDemo />
          </Stage>

          <CodeExample label="grupo com indeterminate">{`const [items, setItems] = useState([false, false, false])

const allChecked = items.every(Boolean)
const someChecked = items.some(Boolean)
const parentState = allChecked ? true : someChecked ? "indeterminate" : false

const toggleAll = () => setItems(items.map(() => !allChecked))
const toggle = (i: number) =>
  setItems(items.map((v, j) => (j === i ? !v : v)))

<AwCheckbox id="parent" checked={parentState} onChange={toggleAll} />
<label htmlFor="parent">Selecionar todos</label>

{items.map((v, i) => (
  <AwCheckbox key={i} id={\`item-\${i}\`} checked={v} onChange={() => toggle(i)} />
))}`}</CodeExample>
        </Section>

        {/* ── API ───────────────────────────────────────────────── */}
        <Section
          id="api"
          title="API"
          lead={`Import: import { AwCheckbox } from "@/components/ui/AwCheckbox". Estende todas as props nativas do Radix Checkbox.Root.`}
        >
          <ApiTable>
            <PropRow
              prop="checked"
              type="boolean | &quot;indeterminate&quot;"
              doc="Estado do checkbox. Sempre controlado — não há modo não-controlado."
            />
            <PropRow
              prop="onChange"
              type="(next: boolean) => void"
              doc="Callback disparado na troca de estado. Recebe true/false (nunca indeterminate)."
            />
            <PropRow
              prop="label"
              type="string"
              doc="aria-label interno. Use quando não há label visível — para screenreaders."
            />
            <PropRow
              prop="disabled"
              type="boolean"
              def="false"
              doc="Opacidade 0.5, sem interação, cursor not-allowed."
            />
            <PropRow
              prop="className"
              type="string"
              doc="Classes extras no root do Radix. Mergeadas via cn()."
            />
            <PropRow
              prop="...rest"
              type="CheckboxPrimitives.Root"
              doc="Qualquer prop do Radix Checkbox.Root (id, name, value, form…)."
            />
          </ApiTable>
        </Section>

        {/* ── Acessibilidade ────────────────────────────────────── */}
        <Section
          id="keyboard"
          title="Acessibilidade"
          lead="O Radix Checkbox.Root herda role=checkbox do padrão ARIA. Focus-visible com ring-3 fg-primary. Sempre associe um label visível via htmlFor — o aria-label é fallback, não substituto."
        >
          <KeyboardTable
            rows={[
              { keys: ["Tab"],         action: "Move foco para o checkbox." },
              { keys: ["Shift", "Tab"], action: "Move foco para o elemento anterior." },
              { keys: ["Space"],        action: "Alterna o estado (checked ↔ unchecked)." },
            ]}
          />
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5 mt-4 body-sm text-(--fg-secondary) flex flex-col gap-2">
            <p className="m-0">
              <strong className="text-(--fg-primary)">label obrigatório.</strong>{" "}
              Sempre use <code className="mono">htmlFor</code> + <code className="mono">id</code> ou
              a prop <code className="mono">label</code> (aria-label). Checkbox bare sem texto
              acessível é falha de a11y.
            </p>
            <p className="m-0">
              <strong className="text-(--fg-primary)">indeterminate.</strong>{" "}
              Screen readers anunciam como &quot;misto&quot; (<em>mixed</em>). Sempre acompanhe de
              label que indique o que está parcialmente selecionado.
            </p>
          </div>
        </Section>

        {/* ── Veja também ───────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Controles",
                href: "/bombardier/styleguide/components/controls",
                description: "Switch e Radio — alternativas ao Checkbox para seleção exclusiva ou toggle binário.",
              },
              {
                name: "Inputs",
                href: "/bombardier/styleguide/components/inputs",
                description: "Campos de texto — par natural do Checkbox em formulários.",
              },
              {
                name: "Acessibilidade",
                href: "/bombardier/styleguide/foundation/accessibility",
                description: "Diretrizes gerais de a11y — foco, contraste, ARIA.",
              },
            ]}
          />
        </Section>

      </div>
    </>
  )
}

/* ── Demos ──────────────────────────────────────────────────────────── */

function CheckboxRow({
  id,
  label,
  checked,
  disabled,
}: {
  id: string
  label: string
  checked: boolean | "indeterminate"
  disabled?: boolean
}) {
  const [state, setState] = React.useState<boolean | "indeterminate">(checked)
  return (
    <div className="flex items-center gap-3">
      <AwCheckbox
        id={id}
        checked={state}
        onChange={(v) => setState(v)}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className={[
          "body-sm",
          disabled
            ? "text-(--fg-tertiary) cursor-not-allowed"
            : "text-(--fg-primary) cursor-pointer",
        ].join(" ")}
      >
        {label}
      </label>
    </div>
  )
}

function DefaultDemo() {
  const [checked, setChecked] = React.useState(false)
  return (
    <div className="flex items-center gap-3">
      <AwCheckbox id="default-demo" checked={checked} onChange={setChecked} />
      <label htmlFor="default-demo" className="body-sm text-(--fg-primary) cursor-pointer">
        Aceitar termos e condições
      </label>
    </div>
  )
}

function WithTextDemo() {
  const [checked, setChecked] = React.useState(false)
  return (
    <div className="flex items-start gap-3">
      <AwCheckbox id="with-text-demo" checked={checked} onChange={setChecked} />
      <div className="flex flex-col gap-1">
        <label htmlFor="with-text-demo" className="body-sm font-medium text-(--fg-primary) cursor-pointer leading-none">
          Receber notificações por e-mail
        </label>
        <p className="caption text-(--fg-secondary) m-0">
          Você pode desativar a qualquer momento nas configurações da conta.
        </p>
      </div>
    </div>
  )
}

function CardCheckboxDemo() {
  const plans = [
    { id: "plan-basic", title: "Básico", desc: "1 agente · 5 GB" },
    { id: "plan-pro",   title: "Pro",    desc: "10 agentes · 50 GB" },
    { id: "plan-corp",  title: "Corp",   desc: "Ilimitado · SLA 99.9%" },
  ]
  const [selected, setSelected] = React.useState<string[]>(["plan-pro"])
  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {plans.map((p) => {
        const isChecked = selected.includes(p.id)
        return (
          <label
            key={p.id}
            htmlFor={p.id}
            className={[
              "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
              isChecked
                ? "border-(--fg-primary) bg-(--bg-surface)"
                : "border-(--border-default) bg-(--bg-raised) hover:bg-(--bg-surface)",
            ].join(" ")}
          >
            <AwCheckbox id={p.id} checked={isChecked} onChange={() => toggle(p.id)} />
            <div className="flex flex-col gap-0.5">
              <span className="body-sm font-medium text-(--fg-primary)">{p.title}</span>
              <span className="caption text-(--fg-secondary)">{p.desc}</span>
            </div>
          </label>
        )
      })}
    </div>
  )
}

function GroupDemo() {
  const options = ["Relatórios semanais", "Alertas de uso", "Novidades do produto"]
  const [items, setItems] = React.useState([true, false, true])

  const allChecked = items.every(Boolean)
  const someChecked = items.some(Boolean)
  const parentState: boolean | "indeterminate" = allChecked
    ? true
    : someChecked
    ? "indeterminate"
    : false

  const toggleAll = () => setItems(items.map(() => !allChecked))
  const toggle = (i: number) => setItems(items.map((v, j) => (j === i ? !v : v)))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 pb-3 border-b border-(--border-subtle)">
        <AwCheckbox id="group-parent" checked={parentState} onChange={toggleAll} />
        <label htmlFor="group-parent" className="body-sm font-medium text-(--fg-primary) cursor-pointer">
          Notificações
        </label>
      </div>
      <div className="flex flex-col gap-2 pl-1">
        {options.map((opt, i) => (
          <div key={opt} className="flex items-center gap-3">
            <AwCheckbox id={`group-item-${i}`} checked={items[i]} onChange={() => toggle(i)} />
            <label htmlFor={`group-item-${i}`} className="body-sm text-(--fg-primary) cursor-pointer">
              {opt}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
