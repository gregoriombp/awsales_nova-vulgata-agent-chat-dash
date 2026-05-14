import { AwSelect } from "@/components/ui/AwSelect"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
  Tldr,
} from "../../_primitives"

export default function AwSelectPage() {
  return (
    <>
      <PageHero title="Select trigger">
        Botão de gatilho pra escolher uma opção de uma lista. Visual de
        input (altura, padding e borda casados com <code className="mono">AwInput</code>),
        com caret chevron à direita. Pareie sempre com{" "}
        <code className="mono">AwDropdownMenu</code> ou um popover — o componente
        em si é só o trigger, não a lista.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Como gatilho de menu — abra <code className="mono">AwDropdownMenu</code> no click.</>,
            <>Em forms onde o conjunto de opções é fechado e finito.</>,
            <>Label do select reflete o valor selecionado, não o nome do campo.</>,
          ]}
          dontUse={[
            <>Como botão de ação — use <code className="mono">AwButton</code>.</>,
            <>Sem label visual ou contexto — gatilho órfão confunde.</>,
            <>Para listas com filtragem ou busca — use combobox/autocomplete.</>,
          ]}
        />

        <Section
          id="default"
          title="Default"
          lead="Altura, padding e borda casados com AwInput. Caret chevron a 6px da borda direita."
        >
          <Stage label="3 estados visuais" gridClassName="flex flex-wrap items-center gap-3">
            <AwSelect>Selecione um canal</AwSelect>
            <AwSelect>WhatsApp · Suporte N1</AwSelect>
            <AwSelect disabled>Indisponível</AwSelect>
          </Stage>
        </Section>

        <Section
          id="in-form"
          title="Pareado com label"
          lead="O componente não traz label próprio — coloque um <label> ou <AwField> acima quando o contexto não for óbvio."
        >
          <Stage label="dentro de um form" gridClassName="flex flex-col gap-2 w-full max-w-md">
            <label className="body-sm text-[var(--fg-secondary)]" htmlFor="canal">
              Canal padrão de respostas
            </label>
            <AwSelect id="canal">WhatsApp Business</AwSelect>
            <p className="caption m-0">
              O agente usará esse canal quando o cliente não especificar um.
            </p>
          </Stage>
        </Section>

        <Section
          id="states"
          title="Estados"
          lead="Hover sobe a cor da borda para --fg-primary; focus-visible ganha ring azul; disabled abate opacity 0.5."
        >
          <Stage label="default · hover · focus · disabled" gridClassName="flex flex-wrap items-center gap-3">
            <AwSelect>Default</AwSelect>
            <AwSelect autoFocus>Focus (Tab)</AwSelect>
            <AwSelect disabled>Disabled</AwSelect>
          </Stage>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Container retangular com radius md, label do valor à esquerda, caret chevron à direita. Sem ícone à esquerda — se precisar, prefira AwButton com iconLeft + dropdown."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="altura" v="38 px" d="Mesma do AwInput md / AwButton md." />
            <Spec k="padding" v="0 12 0 14" d="Right reservado pro caret + 6px gap." />
            <Spec k="radius" v="--radius-md · 8 px" d="Casado com input." />
            <Spec k="borda" v="--border-default" d="Hairline 1 px." />
            <Spec k="caret" v="chevron 12 px" d="stroke 1.6, --fg-tertiary." />
            <Spec k="hover" v="--fg-primary" d="Borda escurece pro tom de texto." />
            <Spec k="focus" v="ring 3 px · blue 30%" d="Mesmo token de AwInput / AwButton." />
            <Spec k="disabled" v="opacity 0.5" d="pointer-events none." />
            <Spec k="label" v="14 / 400" d="Geist Regular. --fg-primary." />
          </div>
        </Section>

        <Section id="api" title="API" lead={`Import: import { AwSelect } from "@/components/ui/AwSelect".`}>
          <ApiTable>
            <PropRow prop="children" type="ReactNode" doc="Label do valor selecionado. Required." />
            <PropRow prop="disabled" type="boolean" def="false" doc="Bloqueia interação." />
            <PropRow prop="onClick" type="MouseEventHandler" doc="Abre o menu/popover. Você cabeia a lista." />
            <PropRow
              prop="...rest"
              type="ButtonHTMLAttributes<HTMLButtonElement>"
              doc="Atributos nativos de <button> repassados."
            />
          </ApiTable>

          <CodeExample label="trigger + dropdown menu">{`import { AwSelect } from "@/components/ui/AwSelect"
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu"

const [open, setOpen] = useState(false)
const [value, setValue] = useState("WhatsApp")

<AwDropdownMenu
  open={open}
  onOpenChange={setOpen}
  items={[
    { value: "WhatsApp", label: "WhatsApp" },
    { value: "Instagram", label: "Instagram" },
    { value: "Web", label: "Chat na web" },
  ]}
  onSelect={setValue}
  trigger={
    <AwSelect onClick={() => setOpen(true)}>
      {value}
    </AwSelect>
  }
/>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Pareie com <code className="mono">AwDropdownMenu</code> — você cabeia a lista.</>,
              <>Label sempre acima quando o contexto não for óbvio.</>,
              <>Largura do trigger igual ou menor que o campo equivalente em <code className="mono">AwInput</code>.</>,
            ]}
            donts={[
              <>Usar como botão de ação — não dispara fluxo, abre lista.</>,
              <>Misturar com <code className="mono">{`<select>`}</code> nativo na mesma tela.</>,
              <>Listas longas (&gt;10 opções) — vai pra combobox com busca.</>,
            ]}
          />
        </Section>
      </div>
    </>
  )
}
