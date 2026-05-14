import { AwInput, AwField } from "@/components/ui/AwInput"
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

export default function InputsPage() {
  return (
    <>
      <PageHero title="Inputs">
        Altura 42 px no padrão, 34 px em densidade compacta (inline,
          toolbars). Foco com ring azul a 18%; erro vira vermelho com
          mensagem inline. O componente <strong>Field</strong> empacota
          label + input + helper/erro.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="basic"
          title="Básico"
          lead="Input solto, sem label. Use em busca inline, toolbars e combobox."
        >
          <Stage
            label="default · com ícone · dense"
            gridClassName="flex flex-col gap-3 max-w-[420px]"
          >
            <AwInput placeholder="Nome do agente" />
            <AwInput placeholder="Buscar..." iconLeft="search" />
            <AwInput placeholder="Densidade compacta" dense />
          </Stage>
        </Section>

        <Section
          id="search"
          title="Search com clear"
          lead='Quando iconLeft="search" e o campo tem valor, um botão de limpar aparece à direita — dentro da boundary arredondada. Sem prop extra: o input cuida disso sozinho. O clear nativo do browser é suprimido.'
        >
          <Stage
            label="vazio · com valor · vazio dense"
            gridClassName="flex flex-col gap-3 max-w-[420px]"
          >
            <AwInput placeholder="Buscar integração…" iconLeft="search" />
            <AwInput
              placeholder="Buscar integração…"
              iconLeft="search"
              defaultValue="hubspot"
            />
            <AwInput
              placeholder="Buscar produto…"
              iconLeft="search"
              dense
              defaultValue="loja expressa"
            />
          </Stage>
        </Section>

        <Section
          id="field"
          title="Field (input + label + helper/erro)"
          lead="AwField é o padrão para formulários — label sempre acima, erro ou helper abaixo."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[760px]">
            <AwField
              label="Nome do agente"
              htmlFor="agent-name"
              helper="Como aparece para o time interno."
            >
              <AwInput id="agent-name" placeholder="Suporte N1" />
            </AwField>

            <AwField
              label="Canal"
              htmlFor="agent-channel"
              helper="Selecione um canal já conectado."
            >
              <AwInput
                id="agent-channel"
                placeholder="WhatsApp Business"
                iconLeft="call"
              />
            </AwField>

            <AwField
              label="E-mail de notificação"
              htmlFor="agent-email"
              error="Formato inválido. Use um e-mail corporativo."
            >
              <AwInput
                id="agent-email"
                defaultValue="gregmatuzalem@@"
                invalid
              />
            </AwField>

            <AwField
              label="Webhook (legacy)"
              htmlFor="agent-webhook"
              helper="Travado em integrações já publicadas."
            >
              <AwInput
                id="agent-webhook"
                defaultValue="https://awsales.com/hook/01HX"
                disabled
              />
            </AwField>
          </div>
        </Section>

        <Section
          id="states"
          title="Estados"
          lead="Focus ring: 3px rgba(71,138,255,.18). Erro substitui borda por --aw-red-700 e muda o ring para vermelho."
        >
          <Stage
            label="default · focus · invalid · disabled"
            gridClassName="flex flex-col gap-3 max-w-[420px]"
          >
            <AwInput placeholder="Default" />
            <AwInput placeholder="Focus (click-me)" autoFocus />
            <AwInput defaultValue="valor inválido" invalid />
            <AwInput defaultValue="read-only" disabled />
          </Stage>
        </Section>

        <Section
          id="densities"
          title="Densidades"
          lead="Default 42 px; dense 34 px para toolbars e combobox inline. Não ter terceira altura — se precisar, reveja densidade da superfície."
        >
          <Stage
            label="default · dense"
            gridClassName="flex flex-col gap-3 max-w-[420px]"
          >
            <AwInput placeholder="default · 42 px" />
            <AwInput placeholder="dense · 34 px" dense />
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Todos os valores vêm de tokens em globals.css."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="altura"
              v="default 42 · dense 34"
              d="Não alterar ad hoc."
            />
            <Spec
              k="radius"
              v="--radius-md · 8px"
              d="Mesmo dos botões por alinhamento visual."
            />
            <Spec
              k="focus ring"
              v="3 px rgba(71,138,255,.18)"
              d="Vermelho 18% quando invalid."
            />
            <Spec
              k="padding"
              v="0 12px / 0 10px (dense)"
              d="Ícone adiciona 8px de gap."
            />
            <Spec
              k="placeholder"
              v="--fg-tertiary"
              d="Nunca usar cor de texto primária em placeholder."
            />
            <Spec
              k="autocomplete"
              v="aria-autocomplete=list"
              d="Combobox pattern em campos com sugestão."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwInput, AwField } from "@/components/ui/AwInput".`}
        >
          <h3 className="text-[var(--h5-size)] font-medium mt-4 mb-3">
            AwInput
          </h3>
          <ApiTable>
            <PropRow
              prop="iconLeft"
              type="string"
              doc="Material Symbols glyph exibido antes do input."
            />
            <PropRow
              prop="invalid"
              type="boolean"
              def="false"
              doc="Borda e ring vermelhos. Usar junto com Field.error."
            />
            <PropRow
              prop="dense"
              type="boolean"
              def="false"
              doc="Altura 34 px. Para toolbars e inline search."
            />
            <PropRow
              prop="disabled"
              type="boolean"
              def="false"
              doc="60% opacity, cursor not-allowed, fundo --bg-surface."
            />
            <PropRow
              prop="...rest"
              type="InputHTMLAttributes"
              doc="Todas as props nativas de <input>."
            />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwField
          </h3>
          <ApiTable>
            <PropRow prop="label" type="string" doc="Label acima do input." />
            <PropRow
              prop="htmlFor"
              type="string"
              doc="Conecta label ao input (acessibilidade)."
            />
            <PropRow
              prop="error"
              type="string"
              doc="Mensagem de erro inline; prevalece sobre helper."
            />
            <PropRow
              prop="helper"
              type="string"
              doc="Texto auxiliar em cinza terciário."
            />
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Normalmente um AwInput, mas aceita qualquer controle."
            />
          </ApiTable>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-4 py-3 text-sm text-[var(--aw-blue-900)] mt-4">
            Modificadores booleanos (<code className="mono">invalid</code>,{" "}
            <code className="mono">dense</code>) viram tokens na{" "}
            <code className="mono">className</code>; props com valor (
            <code className="mono">iconLeft=&quot;mail&quot;</code>) viram{" "}
            <code className="mono">data-icon-left</code>. Esquerda é o formato
            curto do styleguide; direita é AwField / AwInput no produto.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">styleguide · HTML + className</div>
              <CodeExample label="field com erro">{`<label
  className="field"
  htmlFor="email"
>
  <span className="field-label">E-mail</span>
  <input
    id="email"
    type="email"
    className="invalid"
    data-icon-left="mail"
  />
  <span className="field-error">
    Formato inválido.
  </span>
</label>`}</CodeExample>
              <CodeExample label="search dense">{`<input
  type="search"
  className="dense"
  placeholder="Buscar..."
  data-icon-left="search"
/>`}</CodeExample>
            </div>

            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">produto · AwField / AwInput</div>
              <CodeExample label="field com erro">{`import { AwField, AwInput } from "@/components/ui/AwInput"

<AwField
  label="E-mail"
  htmlFor="email"
  error="Formato inválido."
>
  <AwInput
    id="email"
    invalid
    iconLeft="mail"
  />
</AwField>`}</CodeExample>
              <CodeExample label="search dense">{`<AwInput
  placeholder="Buscar..."
  iconLeft="search"
  dense
/>`}</CodeExample>
            </div>
          </div>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Label acima, sempre. Placeholder não substitui label.</>,
              <>Erro inline logo abaixo do input, nunca em toast.</>,
              <>Dense somente em toolbars ou inline search — não em formulário principal.</>,
            ]}
            donts={[
              <>Alterar altura ad hoc para economizar espaço.</>,
              <>Placeholder em caixa alta — vira ruído.</>,
              <>Focus ring colorido que não seja azul brand.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
