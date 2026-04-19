import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar"
import { AwBreadcrumb } from "@/components/ui/AwBreadcrumb"
import { AwSelect } from "@/components/ui/AwSelect"
import { AwProgress } from "@/components/ui/AwProgress"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
} from "../../_primitives"

export default function ChromePage() {
  return (
    <>
      <PageHero title="Chrome">
        Pequenos componentes que aparecem em quase toda tela —{" "}
          <strong>Avatar</strong>, <strong>Breadcrumb</strong>,{" "}
          <strong>Select</strong> e <strong>Progress</strong>. Individualmente
          modestos, coletivamente definem a textura do produto.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        {/* ───────── Avatar ───────── */}
        <Section
          id="avatar"
          title="Avatar"
          lead="36 px circular. Imagem quando disponível, iniciais como fallback em font-heading. A variante ai indica um participante automatizado."
        >
          <Stage
            label="com imagem — sm · md · lg"
            gridClassName="flex flex-wrap items-center gap-4"
          >
            <AwAvatar
              size="sm"
              src="/assets/users/greg.jpg"
              alt="Gregório"
            />
            <AwAvatar
              src="/assets/users/greg.jpg"
              alt="Gregório"
            />
            <AwAvatar
              size="lg"
              src="/assets/users/greg.jpg"
              alt="Gregório"
            />
            <AwAvatar
              src="/assets/users/gabriel_lima.jpg"
              alt="Gabriel Lima"
            />
            <AwAvatar src="/assets/users/jose.jpg" alt="José" />
            <AwAvatar
              src="/assets/ui-faces/female-3.jpg"
              alt="Marina S."
            />
            <AwAvatar
              size="lg"
              src="/assets/ui-faces/female-7.jpg"
              alt="Camila F."
            />
          </Stage>

          <div className="mt-4">
            <Stage
              label="fallback iniciais + ai"
              gridClassName="flex flex-wrap items-center gap-4"
            >
              <AwAvatar size="sm" initials="GR" />
              <AwAvatar initials="GR" />
              <AwAvatar size="lg" initials="GR" />
              <AwAvatar ai initials="AI" />
            </Stage>
          </div>

          <div className="mt-4">
            <Stage label="avatar group — time + agente">
              <AwAvatarGroup>
                <AwAvatar
                  src="/assets/users/greg.jpg"
                  alt="Gregório"
                />
                <AwAvatar
                  src="/assets/users/gabriel_lima.jpg"
                  alt="Gabriel Lima"
                />
                <AwAvatar
                  src="/assets/ui-faces/female-11.jpg"
                  alt="Marina"
                />
                <AwAvatar ai initials="AI" />
              </AwAvatarGroup>
            </Stage>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="tamanhos"
              v="sm 24 · md 36 · lg 48"
              d="md é o padrão."
            />
            <Spec
              k="imagem"
              v="object-fit: cover · 100%"
              d="Cobre o círculo sem distorcer."
            />
            <Spec
              k="fallback"
              v="iniciais 2 chars"
              d="Quando a imagem falhar ou não existir."
            />
            <Spec
              k="ai"
              v="border --aw-blue-400"
              d="Texto em azul; fundo --bg-raised. Nunca aplique em pessoa real."
            />
            <Spec
              k="group overlap"
              v="−10 px margin-left"
              d="Primeiro avatar sem margin; empilhados."
            />
            <Spec
              k="alt"
              v="obrigatório com src"
              d="Descreve a pessoa para leitores de tela."
            />
          </div>
        </Section>

        {/* ───────── Breadcrumb ───────── */}
        <Section
          id="breadcrumb"
          title="Breadcrumb"
          lead="Caminho de navegação. Último item marca a posição atual e não é link."
        >
          <Stage
            label="path navigation"
            gridClassName="flex flex-col gap-4"
          >
            <AwBreadcrumb
              items={[
                { label: "Agentes", href: "/agents" },
                { label: "Atendimento FAQ", href: "/agents/faq" },
                { label: "Fontes" },
              ]}
            />
            <AwBreadcrumb
              separator="›"
              items={[
                { label: "Configurações", href: "/settings" },
                { label: "Integrações", href: "/settings/integrations" },
                { label: "Salesforce" },
              ]}
            />
          </Stage>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="separador"
              v="/ default"
              d="Qualquer string/node via prop separator."
            />
            <Spec
              k="current"
              v="--fg-primary"
              d="Último item (ou item com current=true)."
            />
            <Spec
              k="fontsize"
              v="12.5 px"
              d="body font, --fg-tertiary nos links."
            />
          </div>
        </Section>

        {/* ───────── Select ───────── */}
        <Section
          id="select"
          title="Select"
          lead="Trigger de dropdown — apenas a aparência do gatilho. O menu em si é responsabilidade do container (popover, dialog etc)."
        >
          <Stage label="default · hover · focus · disabled">
            <AwSelect>Modelo: gpt-4.1-mini</AwSelect>
            <AwSelect>Canal: WhatsApp Business</AwSelect>
            <AwSelect disabled>Bloqueado</AwSelect>
          </Stage>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="altura"
              v="38 px"
              d="Alinhado com botões md."
            />
            <Spec
              k="caret"
              v="16 px · --fg-tertiary"
              d="SVG inline, sem depender de fonte."
            />
            <Spec
              k="focus"
              v="ring azul --aw-blue-500"
              d="Mesma sintaxe do input."
            />
          </div>
        </Section>

        {/* ───────── Progress ───────── */}
        <Section
          id="progress"
          title="Progress"
          lead="Barra horizontal. 4 variantes semânticas; default é azul brand."
        >
          <Stage
            label="default · success · warning · danger"
            gridClassName="flex flex-col gap-5 max-w-[440px]"
          >
            <AwProgress label="Geração" value={42} />
            <AwProgress
              label="Ingestão concluída"
              value={100}
              variant="success"
              valueLabel="284/284"
            />
            <AwProgress
              label="Armazenamento"
              value={78}
              variant="warning"
            />
            <AwProgress
              label="Falhas consecutivas"
              value={92}
              variant="danger"
            />
          </Stage>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="altura"
              v="6 px"
              d="Pill-radius; track --bg-muted."
            />
            <Spec
              k="fill"
              v="--aw-blue-500"
              d="Semanticamente: emerald / amber / red nas variantes."
            />
            <Spec
              k="label"
              v="valor em mono"
              d="Calculado a partir de value/max, override via valueLabel."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Quatro imports independentes — cada um em components/ui/."
        >
          <h3 className="text-[var(--h5-size)] font-medium mt-4 mb-3">
            AwAvatar
          </h3>
          <ApiTable>
            <PropRow prop="size" type='"sm" | "md" | "lg"' def='"md"' doc="24 / 36 / 48 px." />
            <PropRow prop="ai" type="boolean" def="false" doc="Variante com borda azul." />
            <PropRow prop="initials" type="string" doc="Texto curto quando não há imagem." />
            <PropRow prop="src" type="string" doc="URL da imagem; cobre 100% do círculo." />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwBreadcrumb
          </h3>
          <ApiTable>
            <PropRow
              prop="items"
              type="{ label, href?, current? }[]"
              doc="Último item é marcado como current automaticamente se não houver current=true explícito."
            />
            <PropRow
              prop="separator"
              type="ReactNode"
              def='"/"'
              doc="Caractere ou nó entre itens."
            />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwSelect
          </h3>
          <ApiTable>
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Label do select — normalmente 'Campo: valor'."
            />
            <PropRow
              prop="...rest"
              type="ButtonHTMLAttributes"
              doc="Herda tudo de <button> — onClick abre seu menu custom."
            />
          </ApiTable>

          <h3 className="text-[var(--h5-size)] font-medium mt-8 mb-3">
            AwProgress
          </h3>
          <ApiTable>
            <PropRow prop="value" type="number" doc="0 ≤ value ≤ max." />
            <PropRow prop="max" type="number" def="100" doc="Teto." />
            <PropRow prop="label" type="ReactNode" doc="Texto à esquerda do top." />
            <PropRow
              prop="valueLabel"
              type="ReactNode"
              doc="Override do % default (ex.: '284/284')."
            />
            <PropRow
              prop="variant"
              type='"default" | "success" | "warning" | "danger"'
              def='"default"'
              doc="Cor do fill."
            />
          </ApiTable>

          <CodeExample>{`import { AwAvatar, AwAvatarGroup } from "@/components/ui/AwAvatar"
import { AwBreadcrumb } from "@/components/ui/AwBreadcrumb"
import { AwSelect } from "@/components/ui/AwSelect"
import { AwProgress } from "@/components/ui/AwProgress"

<AwAvatarGroup>
  <AwAvatar initials="AS" />
  <AwAvatar initials="ML" />
  <AwAvatar ai initials="AI" />
</AwAvatarGroup>

<AwBreadcrumb items={[
  { label: "Agentes", href: "/agents" },
  { label: "Atendimento FAQ" },
]} />

<AwSelect onClick={openMenu}>Modelo: gpt-4.1-mini</AwSelect>

<AwProgress label="Ingestão" value={284} max={284} variant="success" />`}</CodeExample>
        </Section>
      </div>
    </div>
    </>
  )
}
